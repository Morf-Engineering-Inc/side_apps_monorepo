# Stripe Setup Guide

This guide explains how to set up Stripe for payment processing in BecomeLog.

## Prerequisites

- Stripe account (create one at [stripe.com](https://stripe.com))
- Stripe CLI installed (for local testing and price configuration)
- GitHub repository secrets configured

## GitHub Secrets Configuration

The following secrets need to be added to your GitHub repository:

| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `STRIPE_ACCT_ID` | Your Stripe Account ID | Stripe Dashboard → Settings → Account Details |
| `STRIPE_LIVE_SECRET_KEY` | Live Secret Key for API calls | Stripe Dashboard → Developers → API Keys (starts with `sk_live_`) |
| `STRIPE_LIVE_PUBLIC_KEY` | Live Publishable Key for frontend | Stripe Dashboard → Developers → API Keys (starts with `pk_live_`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Developers → Webhooks (starts with `whsec_`) |

### Adding Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name listed above

## Secret Name Mapping

The Terraform configuration maps GitHub secrets to Lambda environment variables:

```
GitHub Secret              → Lambda Environment Variable
─────────────────────────────────────────────────────────
STRIPE_LIVE_SECRET_KEY    → STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET     → STRIPE_WEBHOOK_SECRET
STRIPE_LIVE_PUBLIC_KEY    → Frontend config (stripePublicKey)
STRIPE_ACCT_ID           → STRIPE_ACCOUNT_ID
```

## Setting Up Stripe Prices

The application uses three pricing tiers that need to be configured in Stripe:

### Price Configuration

You need to create the following products and prices in Stripe:

| Product | Price ID | Amount | Billing |
|---------|----------|--------|---------|
| Premium Monthly | `price_monthly` | $4.99 | Recurring (monthly) |
| Premium Yearly | `price_yearly` | $44.00 | Recurring (yearly) |
| Lifetime Access | `price_lifetime` | $175.00 | One-time payment |

### Creating Prices Using Stripe CLI

1. **Install Stripe CLI** (if not already installed):
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux/WSL
   wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
   tar -xvf stripe_linux_amd64.tar.gz
   sudo mv stripe /usr/local/bin/
   
   # Windows
   # Download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Create Products and Prices**:

   ```bash
   # Create Monthly Subscription Price
   stripe prices create \
     --unit-amount 499 \
     --currency usd \
     --recurring-interval month \
     --product-data name="Premium Monthly" \
     --lookup-key price_monthly
   
   # Create Yearly Subscription Price
   stripe prices create \
     --unit-amount 4400 \
     --currency usd \
     --recurring-interval year \
     --product-data name="Premium Yearly" \
     --lookup-key price_yearly
   
   # Create Lifetime Payment Price
   stripe prices create \
     --unit-amount 17500 \
     --currency usd \
     --product-data name="Lifetime Access" \
     --lookup-key price_lifetime
   ```

4. **Copy the Price IDs**:
   After creating each price, Stripe will return a price ID (e.g., `price_1234567890abcdef`). 

5. **Update Frontend Code**:
   Replace the placeholder price IDs in `apps/selfapp/src/routes/pricing.tsx`:
   ```typescript
   {
     id: "monthly",
     stripePriceId: "price_1234567890abcdef", // Replace with actual ID
     // ...
   }
   ```

### Alternative: Creating Prices via Stripe Dashboard

1. Go to Stripe Dashboard → **Products**
2. Click **Add product**
3. Enter product details:
   - Name: Premium Monthly / Premium Yearly / Lifetime Access
   - Description: (optional)
   - Pricing: Set amount and recurring/one-time
4. Save and copy the Price ID
5. Update the frontend code as shown above

## Setting Up Webhooks

Webhooks are required for Stripe to notify your application about payment events.

### Create a Webhook Endpoint

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/test/api/stripe/webhook
   ```
   (Replace with your actual API Gateway URL from Terraform outputs)

4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to GitHub Secrets as `STRIPE_WEBHOOK_SECRET`

## Testing Webhooks Locally

To test webhooks during development:

```bash
# Forward Stripe webhooks to your local development server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Use the webhook signing secret provided by the CLI
# Add it to your .env file for local testing
```

## Verifying the Setup

After deployment, verify your Stripe integration:

1. **Check Lambda Environment Variables**:
   - Go to AWS Lambda Console
   - Open the `become-log-stripe-handler` function
   - Verify environment variables are set correctly

2. **Test the Checkout Flow**:
   - Visit your deployed application
   - Navigate to the pricing page
   - Click on a paid plan (don't complete payment in production!)
   - Verify you're redirected to Stripe Checkout

3. **Check API Gateway Routes**:
   ```bash
   curl -X POST https://your-api-gateway-url/api/stripe/create-checkout \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "priceId": "price_monthly",
       "planType": "monthly",
       "successUrl": "https://yourdomain.com/?payment=success",
       "cancelUrl": "https://yourdomain.com/pricing?payment=cancelled"
     }'
   ```

## Security Best Practices

- ✅ Never commit Stripe keys to source control
- ✅ Use Stripe's test keys during development
- ✅ Only switch to live keys in production
- ✅ Verify webhook signatures on every webhook request
- ✅ Use HTTPS for all Stripe communications
- ✅ Regularly rotate your API keys
- ✅ Set up Stripe webhook signing secret verification

## Troubleshooting

### "Invalid API Key provided"
- Verify the secret key is correctly set in GitHub Secrets
- Ensure you're using the live key (starts with `sk_live_`) not test key
- Check that the key hasn't been revoked in Stripe Dashboard

### "No such price"
- Verify the price IDs in the frontend code match the actual Stripe price IDs
- Ensure prices are created in the same Stripe account as your API keys

### "Invalid webhook signature"
- Verify `STRIPE_WEBHOOK_SECRET` matches the signing secret from Stripe
- Check that webhook endpoint URL is correct
- Ensure the webhook is configured for the correct events

### "Subscription not updating"
- Check CloudWatch logs for the stripe-handler Lambda function
- Verify DynamoDB table permissions are correct
- Ensure webhook events are being received

## Reference

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Security](https://stripe.com/docs/webhooks/signatures)
- [Testing Stripe](https://stripe.com/docs/testing)
