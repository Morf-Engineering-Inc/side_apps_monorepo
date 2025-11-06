# Cognito Authentication Setup

This document describes the Cognito authentication setup for the selfapp (BecomeLog) application.

## Overview

The selfapp uses AWS Cognito for user authentication with the following architecture:

- **Cognito User Pool**: Manages user registration, authentication, and profile data
- **Cognito Hosted UI**: Provides OAuth 2.0/OIDC flows with PKCE (Proof Key for Code Exchange)
- **Cognito Domain**: Custom domain for the Hosted UI authentication pages
- **CloudFront**: Serves the frontend application
- **API Gateway**: Provides backend API access with CORS configured for CloudFront

## Infrastructure Components

### 1. Cognito User Pool

Located in: `terraform/resources.tf`

```hcl
resource "aws_cognito_user_pool" "main"
```

**Features:**
- Email-based authentication (verified)
- Strong password policy (min 8 chars, requires lowercase, uppercase, numbers, symbols)
- User attributes: email (required, immutable)

### 2. Cognito User Pool Client

Located in: `terraform/resources.tf`

```hcl
resource "aws_cognito_user_pool_client" "main"
```

**OAuth 2.0 Configuration:**
- **Flow**: Authorization Code with PKCE (`allowed_oauth_flows = ["code"]`)
- **Scopes**: `openid`, `email`, `profile`
- **Callback URLs**:
  - Production: `https://<cloudfront-domain>/callback`
  - Development: `http://localhost:3003/callback`
- **Logout URLs**:
  - Production: `https://<cloudfront-domain>/`
  - Development: `http://localhost:3003/`
- **Identity Providers**: COGNITO (can be extended to social providers)

**Auth Flows:**
- `ALLOW_USER_PASSWORD_AUTH`: Direct username/password authentication
- `ALLOW_REFRESH_TOKEN_AUTH`: Token refresh
- `ALLOW_USER_SRP_AUTH`: Secure Remote Password protocol

### 3. Cognito Domain

Located in: `terraform/resources.tf`

```hcl
resource "aws_cognito_user_pool_domain" "main"
```

**Domain Format:** `{app_name}-{environment}.auth.{region}.amazoncognito.com`

Example: `become-log-test.auth.us-east-1.amazoncognito.com`

## Frontend Configuration

The deployment workflow creates a `config.js` file with all necessary Cognito settings:

```javascript
window.AWS_CONFIG = {
  apiUrl: 'https://api-gateway-url',
  region: 'us-east-1',
  cognitoUserPoolId: 'us-east-1_xxxxxxxxx',
  cognitoClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
  cognitoDomain: 'become-log-test.auth.us-east-1.amazoncognito.com',
  redirectSignIn: 'https://cloudfront-url/callback',
  redirectSignOut: 'https://cloudfront-url/',
  responseType: 'code',  // PKCE flow
  scopes: ['openid', 'email', 'profile']
};
```

### Environment Variables (Development)

For local development, create a `.env` file in `apps/selfapp/`:

```env
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=become-log-test.auth.us-east-1.amazoncognito.com
VITE_API_GATEWAY_URL=https://your-api-gateway-url
```

## Authentication Flow

### 1. User Login

```javascript
import { loginWithCognito } from './lib/auth-integration';

// Redirect to Cognito Hosted UI
loginWithCognito();
```

This redirects to:
```
https://become-log-test.auth.us-east-1.amazoncognito.com/login?
  client_id=xxx&
  response_type=code&
  scope=openid+email+profile&
  redirect_uri=https://cloudfront-url/callback&
  state=random-state
```

### 2. Callback Handling

After successful authentication, Cognito redirects back with an authorization code:

```javascript
import { handleCognitoCallback } from './lib/auth-integration';

// In your app initialization or callback route
handleCognitoCallback().then(success => {
  if (success) {
    console.log('User authenticated!');
    // User is now logged in with tokens stored
  }
});
```

### 3. Authenticated API Calls

```javascript
import { createAuthenticatedFetch } from './lib/auth-integration';

const authFetch = createAuthenticatedFetch();

// This automatically includes Authorization header
const response = await authFetch('/api/endpoint');
```

## Security Features

### PKCE (Proof Key for Code Exchange)

The configuration uses the OAuth 2.0 Authorization Code flow with PKCE, which provides:
- Protection against authorization code interception attacks
- No client secret required in the frontend
- Secure for single-page applications (SPAs)

### CORS Configuration

API Gateway CORS is configured to only allow:
- CloudFront domain (production)
- localhost:3003 (development)

Located in: `terraform/resources.tf`

```hcl
cors_configuration {
  allow_origins = [
    "https://${aws_cloudfront_distribution.frontend.domain_name}",
    "http://localhost:3003"
  ]
  allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  allow_headers = ["Content-Type", "Authorization"]
  max_age       = 300
}
```

### CloudFront SPA Routing

CloudFront is configured to handle SPA routing by redirecting 403/404 errors to `/index.html`:

```hcl
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
```

## Deployment

### Terraform Outputs

The infrastructure exports the following outputs:

```hcl
output "cognito_user_pool_id"
output "cognito_client_id"
output "cognito_domain"
output "cloudfront_url"
output "api_gateway_url"
```

### GitHub Actions Workflow

The deployment workflow (`.github/workflows/deploy-become.yml`):

1. Creates/updates Cognito User Pool, Client, and Domain
2. Deploys frontend to S3
3. Generates `config.js` with all Cognito settings
4. Invalidates CloudFront cache
5. Outputs Cognito Hosted UI URL in deployment summary

## Testing

### Local Development

1. Run the app locally:
   ```bash
   cd apps/selfapp
   pnpm dev
   ```

2. Configure environment variables in `.env`

3. Test authentication:
   - Click "Sign In" button
   - Should redirect to Cognito Hosted UI
   - Use test user credentials or sign up
   - Should redirect back to `http://localhost:3003/callback`

### Production Testing

1. Deploy using GitHub Actions workflow
2. Check deployment summary for Cognito Hosted UI URL
3. Visit the CloudFront URL
4. Test sign-up and sign-in flows
5. Verify API calls include authentication token

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Ensure callback URLs in Cognito match your CloudFront/localhost URLs
   - Check for trailing slashes consistency

2. **CORS errors**
   - Verify API Gateway CORS includes your frontend origin
   - Check that requests include proper headers

3. **Token not found**
   - Check browser console for callback handling errors
   - Verify localStorage permissions
   - Ensure callback route is handling tokens

4. **"User pool domain already exists"**
   - Cognito domain must be globally unique
   - Change `var.app_name` or `var.environment` in Terraform

### Debug Mode

Enable debug logging in the browser console:

```javascript
// Check if Cognito is configured
import { isCognitoConfigured } from './lib/auth-integration';
console.log('Cognito configured:', isCognitoConfigured());

// Check current auth state
import { getAuthState } from './lib/auth-integration';
console.log('Auth state:', getAuthState());
```

## Future Enhancements

- [ ] Add social identity providers (Google, Facebook)
- [ ] Implement MFA (Multi-Factor Authentication)
- [ ] Add custom email templates
- [ ] Configure custom domain for Hosted UI
- [ ] Add user groups and role-based access control
- [ ] Implement advanced password recovery flow
- [ ] Add user profile attribute customization

## References

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [OAuth 2.0 PKCE Flow](https://oauth.net/2/pkce/)
- [Cognito Hosted UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html)
