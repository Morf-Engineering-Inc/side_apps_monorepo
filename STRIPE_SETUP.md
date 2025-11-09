# Stripe Checkout Setup Guide

This document explains how to complete the Stripe integration for the BecomeLog (selfapp) pricing and subscription system.

## Overview

The codebase now has complete Stripe checkout integration. The following components have been implemented:

1. **Frontend Integration**: Pricing page with Stripe checkout session creation
2. **Backend API**: Lambda functions for handling checkout sessions and webhooks
3. **Infrastructure**: Terraform configuration for Stripe environment variables
4. **Subscription Management**: Profile page displaying current subscription status

## Required Actions

### 1. Create Stripe Products and Prices

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add product**
3. Create three products with the following configurations:

#### Product 1: Premium Monthly
- **Name**: Premium Monthly
- **Price**: $4.99 USD
- **Billing period**: Monthly
- **Type**: Recurring subscription
- Copy the Price ID (starts with `price_1...`)

#### Product 2: Premium Yearly
- **Name**: Premium Yearly
- **Price**: $44.00 USD
- **Billing period**: Yearly
- **Type**: Recurring subscription
- Copy the Price ID (starts with `price_1...`)

#### Product 3: Lifetime Access
- **Name**: Lifetime Access
- **Price**: $175.00 USD
- **Type**: One-time payment
- Copy the Price ID (starts with `price_1...`)

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description | Example Format |
|------------|-------------|----------------|
| `STRIPE_LIVE_SECRET_KEY` | Stripe Secret Key | `sk_live_xxxxxxxxxxxxxxxxxxxxx` |
| `STRIPE_LIVE_PUBLIC_KEY` | Stripe Publishable Key | `pk_live_xxxxxxxxxxxxxxxxxxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | `whsec_xxxxxxxxxxxxxxxxxxxxxxx` |
| `STRIPE_PRICE_MONTHLY` | Price ID for monthly subscription | `price_1xxxxxxxxxxxxxxxxxxxxxxxxx` |
| `STRIPE_PRICE_YEARLY` | Price ID for yearly subscription | `price_1xxxxxxxxxxxxxxxxxxxxxxxxx` |
| `STRIPE_PRICE_LIFETIME` | Price ID for lifetime payment | `price_1xxxxxxxxxxxxxxxxxxxxxxxxx` |
| `STRIPE_ACCT_ID` | Stripe Account ID (optional) | `acct_xxxxxxxxxxxxxxxxx` |

### 3. Configure Stripe Webhooks

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-api-gateway-url/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the Signing Secret and add it to GitHub Secrets as `STRIPE_WEBHOOK_SECRET`

### 4. Deploy the Application

Once all secrets are configured:

1. Push code to the `main` branch
2. GitHub Actions will automatically deploy the infrastructure
3. Verify the deployment succeeded
4. Test the pricing page at your application URL

### 5. Test the Integration

1. Navigate to `/pricing` in your deployed application
2. Click on a paid plan (Monthly, Yearly, or Lifetime)
3. You should be redirected to Stripe Checkout
4. Complete a test purchase (use Stripe test card: `4242 4242 4242 4242`)
5. Verify you're redirected back to the app with success message
6. Check profile page to see subscription status

## Local Development

For local development, create a `.env.local` file:

```env
# API Configuration
VITE_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_MONTHLY=price_1xxxxxxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_YEARLY=price_1xxxxxxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_LIFETIME=price_1xxxxxxxxxxxxxxxxxxxxxxxxx
```

## Admin User Setup

As mentioned in issue #51, to set up an admin user (paulmorf@morfengineering.tech):

1. After user signs up, connect to DynamoDB
2. Find the user's entry in the `become-log-entries-test` table
3. Create or update an entry with:
   - `userId`: The user's Cognito sub ID
   - `entryId`: `SUBSCRIPTION_STATUS`
   - `subscriptionType`: `admin`
   - `status`: `active`
   - `currentPeriodEnd`: `lifetime`

## Architecture

### Flow Diagram

```
User clicks plan → Frontend creates checkout session
                ↓
        API Gateway (Lambda)
                ↓
        Stripe Checkout Session
                ↓
        User completes payment
                ↓
        Stripe sends webhook
                ↓
        Lambda updates DynamoDB
                ↓
        User redirected back to app
                ↓
        Profile shows subscription status
```

### Files Modified

- `apps/selfapp/.env.example` - Added Stripe environment variables
- `apps/selfapp/src/routes/pricing.tsx` - Stripe checkout integration
- `apps/selfapp/src/routes/profile.tsx` - Subscription status display
- `apps/selfapp/src/contexts/SubscriptionContext.tsx` - API integration
- `apps/selfapp/src/lib/api-client.ts` - Stripe API functions
- `apps/selfapp/src/components/SideNav.tsx` - Fixed duplicate Insights tab
- `terraform/variables.tf` - Added Stripe price ID variables
- `terraform/outputs.tf` - Added Stripe outputs
- `.github/workflows/deploy-become.yml` - Added Stripe configuration

## Troubleshooting

### Issue: Price IDs not working
- Verify you copied the correct Price IDs from Stripe Dashboard
- Ensure they start with `price_1...`
- Check GitHub Secrets are named exactly as documented

### Issue: Webhook not receiving events
- Verify webhook endpoint URL is correct
- Check webhook signing secret matches
- Ensure endpoint is publicly accessible
- Check Lambda logs in CloudWatch

### Issue: Subscription not showing in profile
- Verify webhook processed successfully
- Check DynamoDB for SUBSCRIPTION_STATUS entry
- Ensure user is logged in with correct account
- Check API Gateway logs

## Support

For issues related to:
- **Stripe setup**: Check Stripe Dashboard and documentation
- **Infrastructure**: Review Terraform logs and AWS Console
- **Application bugs**: Check GitHub issues

## Next Steps

After setup is complete:

1. Test all three subscription tiers
2. Verify webhook handling works correctly
3. Test subscription cancellation flow
4. Monitor Stripe Dashboard for successful payments
5. Set up proper error handling and notifications
6. Consider adding subscription management portal
