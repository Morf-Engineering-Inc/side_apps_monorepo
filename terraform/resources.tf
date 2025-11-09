# S3 Bucket for Frontend Hosting
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.app_name}-frontend-${var.environment}"

  tags = {
    Name = "${var.app_name}-frontend"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "OAI for ${var.app_name} frontend"
}

# S3 Bucket Policy for CloudFront
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.frontend.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  aliases = [
    var.domain_name,
    "www.${var.domain_name}"
  ]

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.domain.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  tags = {
    Name = "${var.app_name}-frontend-distribution"
  }
}

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.app_name}-users"

  # Use email as username to enforce email uniqueness
  username_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  auto_verified_attributes = ["email"]

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = false
  }

  tags = {
    Name = "${var.app_name}-user-pool"
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.app_name}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  prevent_user_existence_errors = "ENABLED"

  # Token validity settings
  # Access token: 15 minutes (short-lived for security)
  # ID token: 15 minutes (matches access token)
  # Refresh token: 7 days (weekly refresh cycle)
  access_token_validity  = 15
  id_token_validity      = 15
  refresh_token_validity = 7
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  # OAuth 2.0 Configuration for Hosted UI
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]

  # Callback URLs - will be updated after CloudFront is created
  callback_urls = [
    "https://${aws_cloudfront_distribution.frontend.domain_name}/",
    "https://${aws_cloudfront_distribution.frontend.domain_name}/callback",
    "https://${var.domain_name}/",
    "https://${var.domain_name}/callback",
    "https://www.${var.domain_name}/",
    "https://www.${var.domain_name}/callback",
    "http://localhost:3003/",
    "http://localhost:3003/callback"
  ]

  logout_urls = [
    "https://${aws_cloudfront_distribution.frontend.domain_name}/",
    "https://${var.domain_name}/",
    "https://www.${var.domain_name}/",
    "http://localhost:3003/"
  ]

  supported_identity_providers = ["COGNITO"]
}

# Cognito User Pool Domain
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.app_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Lambda Layer
resource "aws_lambda_layer_version" "dependencies" {
  filename            = "${path.module}/../lambda/layers/dependencies.zip"
  layer_name          = "${var.app_name}-dependencies"
  compatible_runtimes = ["nodejs20.x"]

  source_code_hash = fileexists("${path.module}/../lambda/layers/dependencies.zip") ? filebase64sha256("${path.module}/../lambda/layers/dependencies.zip") : ""
}

# Lambda Execution Role
resource "aws_iam_role" "lambda_execution" {
  name = "${var.app_name}-lambda-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.app_name}-lambda-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB Table for User Entries
resource "aws_dynamodb_table" "entries" {
  name         = "${var.app_name}-entries-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "entryId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "entryId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "UserDateIndex"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = false
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${var.app_name}-entries"
  }
}

# IAM Policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.app_name}-lambda-dynamodb"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.entries.arn,
          "${aws_dynamodb_table.entries.arn}/index/*"
        ]
      }
    ]
  })
}

# API Handler Lambda Function
resource "aws_lambda_function" "api_handler" {
  filename         = "${path.module}/../lambda/functions/api-handler.zip"
  function_name    = "${var.app_name}-api-handler"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256
  source_code_hash = fileexists("${path.module}/../lambda/functions/api-handler.zip") ? filebase64sha256("${path.module}/../lambda/functions/api-handler.zip") : ""

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      ENVIRONMENT        = var.environment
      ENTRIES_TABLE_NAME = aws_dynamodb_table.entries.name
      USER_POOL_ID       = aws_cognito_user_pool.main.id
      CLIENT_ID          = aws_cognito_user_pool_client.main.id
    }
  }

  tags = {
    Name = "${var.app_name}-api-handler"
  }
}

# Auth Handler Lambda Function
resource "aws_lambda_function" "auth_handler" {
  filename         = "${path.module}/../lambda/functions/auth-handler.zip"
  function_name    = "${var.app_name}-auth-handler"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 128
  source_code_hash = fileexists("${path.module}/../lambda/functions/auth-handler.zip") ? filebase64sha256("${path.module}/../lambda/functions/auth-handler.zip") : ""

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }

  tags = {
    Name = "${var.app_name}-auth-handler"
  }
}

# Stripe Handler Lambda Function
resource "aws_lambda_function" "stripe_handler" {
  filename         = "${path.module}/../lambda/functions/stripe-handler.zip"
  function_name    = "${var.app_name}-stripe-handler"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256
  source_code_hash = fileexists("${path.module}/../lambda/functions/stripe-handler.zip") ? filebase64sha256("${path.module}/../lambda/functions/stripe-handler.zip") : ""

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      ENVIRONMENT           = var.environment
      USERS_TABLE_NAME      = aws_dynamodb_table.entries.name
      ENTRIES_TABLE_NAME    = aws_dynamodb_table.entries.name
      USER_POOL_ID          = aws_cognito_user_pool.main.id
      CLIENT_ID             = aws_cognito_user_pool_client.main.id
      STRIPE_SECRET_KEY     = var.stripe_live_secret_key
      STRIPE_WEBHOOK_SECRET = var.stripe_webhook_secret
      STRIPE_ACCOUNT_ID     = var.stripe_account_id
    }
  }

  tags = {
    Name = "${var.app_name}-stripe-handler"
  }
}

# API Gateway HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.app_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    # Allow CloudFront domain, custom domain, and localhost for development
    allow_origins = [
      "https://${aws_cloudfront_distribution.frontend.domain_name}",
      "https://${var.domain_name}",
      "https://www.${var.domain_name}",
      "http://localhost:3003"
    ]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }

  tags = {
    Name = "${var.app_name}-api-gateway"
  }
}

# API Gateway Integration
resource "aws_apigatewayv2_integration" "api_handler" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.api_handler.invoke_arn
}

# Stripe Handler API Gateway Integration
resource "aws_apigatewayv2_integration" "stripe_handler" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.stripe_handler.invoke_arn
}

# API Gateway Route
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.api_handler.id}"
}

# Stripe routes - checkout session creation
resource "aws_apigatewayv2_route" "stripe_create_checkout" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/stripe/create-checkout"
  target    = "integrations/${aws_apigatewayv2_integration.stripe_handler.id}"
}

# Stripe routes - webhook handler
resource "aws_apigatewayv2_route" "stripe_webhook" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/stripe/webhook"
  target    = "integrations/${aws_apigatewayv2_integration.stripe_handler.id}"
}

# Stripe routes - user subscription status
resource "aws_apigatewayv2_route" "user_subscription" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/user/subscription"
  target    = "integrations/${aws_apigatewayv2_integration.stripe_handler.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  tags = {
    Name = "${var.app_name}-api-stage"
  }
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Lambda Permission for API Gateway - Stripe Handler
resource "aws_lambda_permission" "stripe_api_gateway" {
  statement_id  = "AllowAPIGatewayInvokeStripe"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stripe_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
