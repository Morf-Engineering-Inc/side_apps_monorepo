# BecomeLog

Personal transformation tracking and journaling application.

## Overview

BecomeLog is a cloud-native application built on AWS that helps you track your personal growth journey, maintain daily journals, and achieve your transformation goals.

## Architecture

- **Frontend**: Static HTML/CSS/JS hosted on S3 + CloudFront
- **Backend**: AWS Lambda functions with API Gateway
- **Authentication**: AWS Cognito
- **Infrastructure**: Terraform-managed AWS resources

## Development

```bash
# Build the application
pnpm run build

# Clean build artifacts
pnpm run clean
```

## Deployment

Deployment is automated via GitHub Actions workflow (`.github/workflows/deploy-become.yml`).

The workflow:
1. Builds Lambda functions and layers
2. Builds the frontend application
3. Provisions AWS infrastructure with Terraform
4. Deploys the frontend to S3/CloudFront
5. Configures API Gateway and Lambda functions

## Infrastructure

All infrastructure is defined in the `terraform/` directory at the repository root:

- S3 bucket for static hosting
- CloudFront distribution for CDN
- Lambda functions for API and authentication
- Cognito User Pool for user management
- API Gateway for REST API endpoints

## Features

- 🔐 Secure authentication with AWS Cognito
- 📝 Daily journaling and reflection
- 🎯 Goal setting and progress tracking
- ☁️ Cloud-hosted and scalable
- 📊 Personal growth analytics (coming soon)

## Local Development

For local development, you can run the frontend by opening `src/index.html` in a browser, or set up a local server:

```bash
# Using Python
cd src && python -m http.server 8000

# Using Node.js http-server
npx http-server src -p 8000
```

## Environment Configuration

The application configuration is injected at deployment time in `config.js`:

```javascript
window.AWS_CONFIG = {
  apiUrl: '<API_GATEWAY_URL>',
  cognitoUserPoolId: '<USER_POOL_ID>',
  cognitoClientId: '<CLIENT_ID>',
  region: '<AWS_REGION>'
};
```
