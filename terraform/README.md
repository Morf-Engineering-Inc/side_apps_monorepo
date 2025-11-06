# Terraform Infrastructure

This directory contains the Terraform configuration for deploying the BecomeLog (selfapp) infrastructure on AWS.

## Architecture Overview

The infrastructure includes:

- **Frontend Hosting**: S3 + CloudFront
- **API Backend**: API Gateway + Lambda
- **Authentication**: AWS Cognito with Hosted UI
- **State Management**: S3 backend with DynamoDB locking

## Resources Created

### Frontend
- S3 bucket for static assets (private)
- CloudFront distribution with OAI
- Custom error responses for SPA routing

### Authentication
- Cognito User Pool with email verification
- Cognito User Pool Client with OAuth 2.0 (PKCE)
- Cognito Hosted UI Domain

### Backend
- API Gateway HTTP API with CORS
- Lambda functions (API handler, Auth handler)
- Lambda Layer for shared dependencies
- IAM roles and policies

### State Management
- S3 bucket for Terraform state
- DynamoDB table for state locking

## Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform >= 1.9.0
- Node.js >= 18 (for building frontend and Lambda functions)
- pnpm >= 8

## Configuration

### Variables

Edit `variables.tf` or provide values via environment variables:

```hcl
variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "test"
}

variable "app_name" {
  default = "become-log"
}

variable "aws_application_tag" {
  description = "AWS Application tag for resource grouping"
}
```

### Environment Variables

Set via GitHub Actions workflow or locally:

```bash
export TF_VAR_app_name="become-log"
export TF_VAR_environment="test"
export TF_VAR_aws_application_tag="arn:aws:resource-groups:..."
```

## Deployment

### Automated (GitHub Actions)

Deployment is automated via `.github/workflows/deploy-become.yml`:

1. Push to `main` branch
2. Workflow builds frontend and Lambda functions
3. Terraform applies infrastructure changes
4. Frontend is deployed to S3
5. CloudFront cache is invalidated

### Manual Deployment

```bash
# Initialize Terraform
terraform init

# Review changes
terraform plan

# Apply changes
terraform apply

# Get outputs
terraform output
```

## Outputs

The infrastructure exports:

```hcl
output "s3_bucket_name"           # S3 bucket for frontend
output "cloudfront_distribution_id" # CloudFront ID
output "cloudfront_url"            # CloudFront domain
output "api_gateway_url"          # API Gateway endpoint
output "cognito_user_pool_id"     # Cognito User Pool ID
output "cognito_client_id"        # Cognito Client ID
output "cognito_domain"           # Cognito Hosted UI domain
```

## Authentication Setup

The Cognito configuration includes:

- **Domain**: `{app_name}-{environment}.auth.{region}.amazoncognito.com`
- **OAuth Flow**: Authorization Code with PKCE
- **Scopes**: openid, email, profile
- **Callback URLs**: CloudFront URL + localhost
- **Logout URLs**: CloudFront URL + localhost

See [COGNITO_SETUP.md](../docs/COGNITO_SETUP.md) for detailed authentication documentation.

## State Management

### S3 Backend

```hcl
backend "s3" {
  bucket         = "become-log-terraform-state"
  key            = "terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "become-log-terraform-state-lock"
  encrypt        = true
}
```

The backend S3 bucket and DynamoDB table are created automatically by the GitHub Actions workflow.

## Security

### IAM Permissions Required

The AWS credentials need permissions for:

- S3 (bucket creation and management)
- CloudFront (distribution management)
- Cognito (user pool, client, domain)
- API Gateway (API creation and management)
- Lambda (function and layer management)
- IAM (role and policy management)
- DynamoDB (table management for state locking)
- Service Catalog AppRegistry (application registration)
- Resource Groups (resource grouping)

### CORS Configuration

API Gateway CORS is restricted to:
- CloudFront distribution domain (production)
- localhost:3003 (development)

### CloudFront Security

- S3 bucket is private
- Access only via CloudFront OAI (Origin Access Identity)
- HTTPS enforced (redirect-to-https)

### Cognito Security

- Email verification required
- Strong password policy enforced
- PKCE flow (no client secrets in frontend)
- OAuth 2.0 Authorization Code flow

## Troubleshooting

### State Lock Issues

If Terraform state is locked:

```bash
# View lock
aws dynamodb get-item \
  --table-name become-log-terraform-state-lock \
  --key '{"LockID":{"S":"become-log-terraform-state/terraform.tfstate"}}'

# Force unlock (use with caution)
terraform force-unlock <lock-id>
```

### Domain Already Exists

If Cognito domain already exists:

```bash
# Check existing domains
aws cognito-idp describe-user-pool \
  --user-pool-id <pool-id>

# Change variables
TF_VAR_app_name="become-log-v2"
TF_VAR_environment="prod"
```

### Plan Failures

```bash
# Validate configuration
terraform validate

# Format code
terraform fmt

# Check for drift
terraform plan -detailed-exitcode
```

## Maintenance

### Updating Resources

1. Modify Terraform files
2. Run `terraform plan` to review changes
3. Run `terraform apply` to apply changes
4. Commit changes to git

### Destroying Resources

⚠️ **Warning**: This will delete all infrastructure!

```bash
# Preview what will be destroyed
terraform plan -destroy

# Destroy all resources
terraform destroy
```

### State Management

```bash
# List resources in state
terraform state list

# Show specific resource
terraform state show <resource>

# Remove resource from state (doesn't delete)
terraform state rm <resource>
```

## Cost Estimation

Estimated monthly costs (us-east-1, test environment):

- S3: ~$0.50 (storage + requests)
- CloudFront: ~$1-5 (data transfer)
- Cognito: Free tier (50,000 MAUs)
- API Gateway: ~$0-1 (HTTP API, low traffic)
- Lambda: Free tier (1M requests)
- DynamoDB: Free tier (on-demand)

**Total**: ~$2-7/month for test environment

## CI/CD Integration

The infrastructure is deployed via GitHub Actions:

- **Trigger**: Push to `main` or manual workflow dispatch
- **Build**: Frontend (selfapp) and Lambda functions
- **Deploy**: Terraform apply
- **Post-deploy**: Upload frontend, invalidate cache
- **Monitoring**: Deployment summary in GitHub Actions

See `.github/workflows/deploy-become.yml` for details.

## Documentation

- [Cognito Setup Guide](../docs/COGNITO_SETUP.md) - Authentication configuration
- [Deployment Fixes](../docs/DEPLOYMENT_FIXES.md) - Recent infrastructure fixes
- [Main README](../README.md) - Project overview

## Support

For issues or questions:
1. Check documentation links above
2. Review CloudWatch logs
3. Check Terraform plan output
4. Verify AWS permissions

## Version History

- **v1.1** (Current): Added Cognito domain and OAuth configuration
- **v1.0**: Initial infrastructure setup
