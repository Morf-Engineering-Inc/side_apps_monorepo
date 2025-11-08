# BecomeLog Pricing & Subscription Feature

This document describes the pricing and subscription feature implementation for BecomeLog.

## Overview

BecomeLog now supports multiple subscription tiers with integrated Stripe payment processing:

- **Free**: Access to Daily Log page with basic insights
- **Monthly Premium**: $4.99/month - Full dashboard access with advanced features
- **Yearly Premium**: $44/year - All Monthly features with 26% savings
- **Lifetime**: $175 one-time - Lifetime access to all features

## User Flow

1. **New User Sign-up**
   - User creates account via `/auth.html`
   - After sign-up, user is redirected to `/pricing.html` to select a plan
   - Free users can skip and go directly to dashboard

2. **Dashboard Access**
   - Free users see the dashboard with locked premium features (🔒 icon)
   - Premium users have full access to all features
   - Clicking locked features shows paywall modal with upgrade prompt

3. **Pricing Page**
   - Displays 4 pricing tiers with feature comparisons
   - "Get Started Free" button redirects to dashboard
   - Premium plan buttons redirect to Stripe Checkout
   - After successful payment, redirects back to dashboard

4. **Paywall Enforcement**
   - Daily Log page (`/log.html`) is always accessible (free tier)
   - All other features require premium subscription
   - Small lock icon (🔒) indicates premium-only features

## Frontend Files

### HTML Pages

1. **`/pricing.html`** - Pricing page with Stripe Checkout integration
   - 4 pricing cards (Free, Monthly, Yearly, Lifetime)
   - Stripe.js integration for checkout
   - Responsive design with hover effects
   - Best value badge on Yearly plan

2. **`/dashboard.html`** - Main dashboard with paywall logic
   - Navigation bar with subscription status badge
   - Grid of feature cards
   - Lock icons on premium features
   - Paywall modal for upgrade prompts
   - JavaScript to check subscription status

3. **`/log.html`** - Free daily log page
   - Always accessible for all users
   - Form for daily entries
   - Checkpoint tracking
   - Upgrade banner for premium features

4. **`/auth.html`** - Authentication page
   - Sign In/Sign Up tabs
   - Email/password authentication
   - Social login placeholders (Google, GitHub)
   - Integration with AWS Cognito

5. **`/index.html`** - Updated landing page
   - Added navigation to pricing, auth, and log pages
   - Call-to-action buttons

### Configuration

**`/config.js`** - Updated with Stripe configuration:
```javascript
window.AWS_CONFIG = {
  apiUrl: '',
  cognitoUserPoolId: '',
  cognitoClientId: '',
  region: 'us-east-1',
  stripePublishableKey: 'pk_test_...',
  stripePrices: {
    monthly: 'price_...',
    yearly: 'price_...',
    lifetime: 'price_...'
  }
};
```

## Backend Lambda Functions

### 1. Stripe Handler (`stripe-handler/index.js`)

Handles Stripe payment processing and webhooks.

**Endpoints:**
- `POST /api/stripe/create-checkout` - Creates Stripe Checkout session
- `POST /api/stripe/webhook` - Handles Stripe webhook events
- `GET /api/user/subscription` - Gets user's subscription status

**Key Functions:**
- `createCheckoutSession()` - Creates Stripe checkout session
- `handleWebhook()` - Processes Stripe webhook events
- `getUserSubscription()` - Retrieves user subscription from DynamoDB
- `updateUserSubscription()` - Updates subscription in DynamoDB

**Environment Variables:**
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `USERS_TABLE_NAME` or `ENTRIES_TABLE_NAME` - DynamoDB table name
- `USER_POOL_ID` - Cognito User Pool ID
- `CLIENT_ID` - Cognito Client ID

### 2. Auth API Handler (`auth-api-handler/index.js`)

Handles user authentication with AWS Cognito.

**Endpoints:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

**Key Functions:**
- `handleSignUp()` - Creates new user in Cognito
- `handleSignIn()` - Authenticates user and returns JWT tokens

**Environment Variables:**
- `USER_POOL_ID` - Cognito User Pool ID
- `CLIENT_ID` - Cognito Client ID
- `ENVIRONMENT` - Environment name (dev/test/prod)

## Database Schema

### DynamoDB Subscription Entry

Stored in the same table as user entries with special entry ID:

```javascript
{
  userId: "user-id-from-cognito",
  entryId: "SUBSCRIPTION_STATUS",
  subscriptionType: "free" | "monthly" | "yearly" | "lifetime",
  status: "active" | "cancelled" | "expired",
  stripeCustomerId: "cus_...",
  stripeSubscriptionId: "sub_...",
  currentPeriodEnd: "ISO date string or 'lifetime'",
  updatedAt: "ISO date string"
}
```

## Stripe Integration

### Setup Required

1. **Create Stripe Account** (or use existing)
   - Sign up at https://stripe.com

2. **Create Products & Prices**
   ```bash
   # Monthly subscription
   stripe prices create --product "BecomeLog Premium" \
     --unit-amount 499 --currency usd --recurring interval=month

   # Yearly subscription
   stripe prices create --product "BecomeLog Premium Yearly" \
     --unit-amount 4400 --currency usd --recurring interval=year

   # Lifetime (one-time payment)
   stripe prices create --product "BecomeLog Lifetime" \
     --unit-amount 17500 --currency usd
   ```

3. **Configure Webhook**
   - Set webhook URL: `https://your-api-gateway.amazonaws.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, 
     `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

4. **Update Environment Variables**
   - Add Stripe keys to Lambda environment variables
   - Update `config.js` with publishable key and price IDs

### Webhook Events

The system handles the following Stripe webhook events:

- **`checkout.session.completed`** - Updates user subscription when payment succeeds
- **`customer.subscription.updated`** - Updates subscription status when changed
- **`customer.subscription.deleted`** - Marks subscription as cancelled
- **`invoice.payment_succeeded`** - Logs successful recurring payment
- **`invoice.payment_failed`** - Logs failed payment (could trigger notifications)

## Security Considerations

1. **Authentication**
   - All premium API endpoints require valid JWT token
   - Tokens verified using AWS Cognito

2. **Payment Processing**
   - All payment data handled by Stripe (PCI compliant)
   - No credit card data stored in our systems
   - Webhook signature verification ensures requests are from Stripe

3. **Subscription Validation**
   - Subscription status checked on every dashboard load
   - Premium features only accessible with valid subscription

## Testing

### Test Mode (Development)

1. Use Stripe test keys (pk_test_... and sk_test_...)
2. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Requires 3DS: `4000 0025 0000 3155`

3. Webhook testing with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   stripe trigger checkout.session.completed
   ```

### Integration Testing

1. **Sign Up Flow**
   - Create new account
   - Verify redirect to pricing page
   - Check free tier access

2. **Payment Flow**
   - Select premium plan
   - Complete Stripe checkout
   - Verify redirect to dashboard
   - Confirm premium features unlocked

3. **Paywall**
   - Login as free user
   - Click premium feature
   - Verify paywall modal appears
   - Verify redirect to pricing page

## Deployment

1. **Lambda Functions**
   - Deploy `stripe-handler` and `auth-api-handler`
   - Configure environment variables
   - Set up API Gateway routes

2. **Frontend**
   - Update `config.js` with production values
   - Deploy to S3/CloudFront

3. **Stripe Configuration**
   - Switch to live keys
   - Configure production webhook URL
   - Test with real payment (refund after)

## Future Enhancements

- [ ] Email notifications for payment events
- [ ] Admin dashboard for subscription management
- [ ] Usage analytics and metrics
- [ ] Cancellation flow in UI
- [ ] Proration for plan upgrades/downgrades
- [ ] Free trial period
- [ ] Discount codes/coupons
- [ ] Team/enterprise plans
- [ ] Annual billing reminder emails
- [ ] Subscription renewal notifications

## Support

For issues or questions:
- Stripe documentation: https://stripe.com/docs
- AWS Cognito: https://docs.aws.amazon.com/cognito/
- DynamoDB: https://docs.aws.amazon.com/dynamodb/
