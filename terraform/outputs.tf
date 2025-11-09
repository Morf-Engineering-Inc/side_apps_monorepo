output "s3_bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_url" {
  description = "CloudFront distribution domain name"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_stage.api.invoke_url
}

output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.main.id
}

output "cognito_domain" {
  description = "Cognito Hosted UI domain"
  value       = "${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "dynamodb_entries_table_name" {
  description = "Name of the DynamoDB table for entries"
  value       = aws_dynamodb_table.entries.name
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.domain.arn
}

output "acm_validation_records" {
  description = "DNS records to add to Namecheap for certificate validation"
  value = [
    for dvo in aws_acm_certificate.domain.domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ]
}

output "nameserver_instructions" {
  description = "Instructions for Namecheap DNS setup"
  value = <<-EOT
    
    🌐 DNS SETUP REQUIRED:
    
    1. Add ACM Validation Record(s) to Namecheap:
       ${join("\n       ", [for record in aws_acm_certificate.domain.domain_validation_options :
"Type: ${record.resource_record_type} | Host: ${record.resource_record_name} | Value: ${record.resource_record_value}"])}
    
    2. Add CloudFront CNAME Records to Namecheap:
       Type: CNAME | Host: @ | Value: ${aws_cloudfront_distribution.frontend.domain_name}
       Type: CNAME | Host: www | Value: ${aws_cloudfront_distribution.frontend.domain_name}
    
    3. Wait 5-10 minutes for DNS propagation and certificate validation
    
  EOT
}

output "custom_domain_url" {
  description = "Custom domain URL"
  value       = "https://${var.domain_name}"
}

output "stripe_public_key" {
  description = "Stripe Live Publishable Key for frontend use"
  value       = var.stripe_live_public_key
  sensitive   = false
}

output "stripe_price_monthly" {
  description = "Stripe Price ID for monthly subscription"
  value       = var.stripe_price_monthly
  sensitive   = false
}

output "stripe_price_yearly" {
  description = "Stripe Price ID for yearly subscription"
  value       = var.stripe_price_yearly
  sensitive   = false
}

output "stripe_price_lifetime" {
  description = "Stripe Price ID for lifetime subscription"
  value       = var.stripe_price_lifetime
  sensitive   = false
}
