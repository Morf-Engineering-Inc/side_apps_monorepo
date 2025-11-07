# Local Development with Cognito Authentication

This guide explains how to test AWS Cognito authentication locally with the callback to `http://localhost:3003/callback`.

## Prerequisites

- AWS Cognito User Pool configured
- Cognito App Client created

## Setup Steps

### 1. Configure Cognito App Client

In your AWS Cognito User Pool console:

1. Go to **App integration** → **App clients**
2. Select your app client
3. Click **Edit** on **Hosted UI** settings
4. Under **Allowed callback URLs**, add:
   ```
   http://localhost:3003/callback
   ```
5. Under **Allowed sign-out URLs** (optional), add:
   ```
   http://localhost:3003
   ```
6. Save changes

### 2. Create Local Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your actual Cognito configuration:
   ```env
   VITE_COGNITO_USER_POOL_ID=us-east-1_YourPoolId
   VITE_COGNITO_CLIENT_ID=your-client-id-here
   VITE_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
   ```

   **Note:** The redirect URI will automatically be set to `http://localhost:3003/callback` for local development. You can override this if needed:
   ```env
   VITE_COGNITO_REDIRECT_URI=http://localhost:3003/callback
   ```

### 3. Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3003`

### 4. Test Authentication Flow

1. Open `http://localhost:3003` in your browser
2. Click the login button
3. You'll be redirected to the Cognito hosted UI
4. Sign in with your credentials
5. You'll be redirected back to `http://localhost:3003/callback`
6. The app will parse the JWT token and log you in

## Troubleshooting

### "Failed to parse JWT payload" Error

This error was fixed by using the proper `decodeJWT()` utility that handles:
- Base64url encoding (JWT standard uses URL-safe base64)
- Missing padding characters
- Character replacement (`-` → `+`, `_` → `/`)

If you still see this error, ensure you're using the latest version of the code.

### Callback URL Not Working

1. Verify the callback URL is exactly `http://localhost:3003/callback` in Cognito settings
2. Check that your `.env.local` has the correct Cognito configuration
3. Look at browser console for error messages
4. Check the Network tab to see the actual redirect URL being used

### Token Exchange Issues

The current implementation uses the Authorization Code flow but stores the code directly instead of exchanging it for tokens. This is acceptable for development/testing but should be replaced with proper token exchange in production using a backend service.

## Security Notes

- The `.env.local` file is git-ignored and should never be committed
- For production deployment, use proper environment variables through your deployment platform
- The authorization code should be exchanged for tokens via a secure backend endpoint in production
- Never commit real AWS credentials or tokens to the repository

## Additional Resources

- [AWS Cognito Hosted UI Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
- [JWT Specification](https://tools.ietf.org/html/rfc7519)
