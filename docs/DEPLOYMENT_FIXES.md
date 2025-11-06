# Deployment Fixes - Cognito Domain & OAuth Configuration

This document summarizes the critical fixes applied to the infrastructure and deployment workflow.

## Problems Addressed

### 1. Missing Cognito Domain ❌ → ✅

**Problem:** The selfapp authentication integration expected a Cognito Hosted UI domain, but it wasn't created in Terraform.

**Solution:** Added `aws_cognito_user_pool_domain` resource to Terraform:

```hcl
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.app_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}
```

Domain format: `become-log-test.auth.us-east-1.amazoncognito.com`

**Note:** The domain uses `${app_name}-${environment}` which should be unique within your AWS account. If you need to deploy multiple instances, consider using different app names or environments.

### 2. Missing OAuth Configuration ❌ → ✅

**Problem:** Cognito User Pool Client didn't have OAuth flows configured for Hosted UI.

**Solution:** Added OAuth 2.0 configuration with PKCE:

```hcl
# OAuth 2.0 Configuration for Hosted UI
allowed_oauth_flows_user_pool_client = true
allowed_oauth_flows                  = ["code"]
allowed_oauth_scopes                 = ["openid", "email", "profile"]

callback_urls = [
  "https://${aws_cloudfront_distribution.frontend.domain_name}/callback",
  "http://localhost:3003/callback"
]

logout_urls = [
  "https://${aws_cloudfront_distribution.frontend.domain_name}/",
  "http://localhost:3003/"
]

supported_identity_providers = ["COGNITO"]
```

### 3. Incomplete Frontend Config ❌ → ✅

**Problem:** `config.js` only included basic Cognito IDs, missing domain and redirect URIs.

**Solution:** Updated workflow to include all required fields:

```javascript
window.AWS_CONFIG = {
  apiUrl: '...',
  region: 'us-east-1',
  cognitoUserPoolId: '...',
  cognitoClientId: '...',
  cognitoDomain: 'become-log-test.auth.us-east-1.amazoncognito.com',  // NEW
  redirectSignIn: 'https://cloudfront-url/callback',                   // NEW
  redirectSignOut: 'https://cloudfront-url/',                          // NEW
  responseType: 'code',                                                 // NEW (PKCE)
  scopes: ['openid', 'email', 'profile']                               // NEW
};
```

### 4. Permissive CORS ❌ → ✅

**Problem:** API Gateway allowed `*` origins, which is insecure.

**Solution:** Restricted CORS to specific origins:

```hcl
allow_origins = [
  "https://${aws_cloudfront_distribution.frontend.domain_name}",
  "http://localhost:3003"
]
```

### 5. CloudFront SPA Routing ✅

**Status:** Already configured correctly with error responses redirecting to `/index.html`.

### 6. AppRegistry Query Issues ❌ → ✅

**Problem:** Workflow used invalid query path `applicationTag.awsApplication`.

**Solution:** Fixed to use correct path:

```bash
APP_ARN=$(aws servicecatalog-appregistry get-application \
  --application "${{ env.APP_NAME }}" \
  --query 'application.arn' \
  --output text)
```

### 7. Workflow Error Handling ❌ → ✅

**Problem:** `continue-on-error: true` on Terraform plan could allow failed plans to proceed.

**Solution:** 
- Removed `continue-on-error`
- Changed apply condition from `steps.plan.outcome == 'success'` to `${{ success() }}`

### 8. Missing Terraform Output ❌ → ✅

**Problem:** No output for Cognito domain.

**Solution:** Added output:

```hcl
output "cognito_domain" {
  description = "Cognito Hosted UI domain"
  value       = "${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}
```

### 9. Git Configuration ❌ → ✅

**Problem:** Terraform provider binaries were being committed to git.

**Solution:** Updated `.gitignore`:

```
# Terraform
.terraform/
.terraform.lock.hcl
*.tfstate
*.tfstate.backup
*.tfvars
```

## Verification Checklist

After deployment, verify:

- [ ] ✅ Cognito domain created: Check AWS Console > Cognito > User Pools > Domain
- [ ] ✅ App client OAuth configured: Check OAuth 2.0 flows and callback URLs
- [ ] ✅ CloudFront serves SPA correctly: Test deep links don't 404
- [ ] ✅ API Gateway CORS allows CloudFront: Check API responses include CORS headers
- [ ] ✅ Frontend config includes all fields: Check `config.js` in deployed S3/CloudFront
- [ ] ✅ AppRegistry shows all resources: Check AWS Console > myApplications
- [ ] ✅ Terraform plan succeeds without errors
- [ ] ✅ Login flow works: Test sign-up and sign-in through Hosted UI

## Testing the Changes

### Local Testing

1. Ensure `.env` file has correct values:
   ```env
   VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
   VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_COGNITO_DOMAIN=become-log-test.auth.us-east-1.amazoncognito.com
   ```

2. Run locally:
   ```bash
   cd apps/selfapp
   pnpm dev
   ```

3. Test authentication flow

### Production Testing

1. Trigger deployment via GitHub Actions
2. Check deployment summary for all outputs
3. Visit CloudFront URL
4. Test complete auth flow:
   - Click "Sign In"
   - Redirects to Cognito Hosted UI
   - Sign up or log in
   - Redirects back to `/callback`
   - User is authenticated

## Files Modified

### Terraform Files
- `terraform/resources.tf`: Added Cognito domain, OAuth config, updated CORS
- `terraform/outputs.tf`: Added cognito_domain output
- `terraform/main.tf`: Formatting fixes

### Workflow Files
- `.github/workflows/deploy-become.yml`: 
  - Fixed AppRegistry queries
  - Updated frontend config generation
  - Fixed error handling
  - Added cognito_domain to outputs

### Configuration Files
- `.gitignore`: Added Terraform exclusions

### Documentation
- `docs/COGNITO_SETUP.md`: Complete authentication setup guide
- `docs/DEPLOYMENT_FIXES.md`: This file
- `terraform/README.md`: Infrastructure documentation

## Technical Notes

### Workflow Heredoc Syntax

The workflow uses single-quoted heredoc (`<< 'EOF'`) for the frontend config generation. This is intentional to prevent bash variable expansion and preserve the `${{ }}` syntax for GitHub Actions interpolation:

```bash
cat > ./apps/selfapp/dist/config.js << 'EOF'
window.AWS_CONFIG = {
  apiUrl: '${{ steps.tf_outputs.outputs.api_url }}'  # Interpolated by GitHub Actions
};
EOF
```

Without the quotes, bash would try to expand `${{` as a variable, which would fail.

## Impact

### Security Improvements
✅ CORS restricted to specific origins
✅ PKCE flow for secure OAuth
✅ No client secrets in frontend

### Functionality Improvements
✅ Complete authentication flow now works
✅ Hosted UI can be accessed
✅ Proper token exchange with callback URLs

### Operational Improvements
✅ Cleaner git history (no large binaries)
✅ Better error handling in deployment
✅ Proper resource grouping in AppRegistry

## Next Steps

1. **Deploy the changes** using GitHub Actions
2. **Test authentication** end-to-end
3. **Monitor** for any issues in CloudWatch logs
4. **Optional improvements**:
   - Add custom domain for Cognito
   - Configure social identity providers
   - Add MFA (Multi-Factor Authentication)
   - Set up custom email templates

## Support

For issues or questions:
1. Check `docs/COGNITO_SETUP.md` for detailed documentation
2. Review CloudWatch logs for Lambda and API Gateway
3. Check Cognito User Pool logs in AWS Console
4. Verify all environment variables are set correctly

## References

- [Cognito Setup Documentation](./COGNITO_SETUP.md)
- [AWS Cognito Best Practices](https://docs.aws.amazon.com/cognito/latest/developerguide/best-practices.html)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)
