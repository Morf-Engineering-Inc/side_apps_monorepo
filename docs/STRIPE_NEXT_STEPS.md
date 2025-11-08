# Stripe Integration - Next Steps

## ✅ Completed

The following changes have been successfully implemented:

1. **Terraform Infrastructure**
   - Stripe Lambda handler configured and ready to deploy
   - API Gateway routes created for Stripe endpoints
   - Environment variables properly mapped

2. **GitHub Actions Workflow**
   - All Stripe secrets passed to Terraform
   - Frontend config includes Stripe public key

3. **Build Scripts**
   - Lambda build script updated to include stripe-handler

4. **Documentation**
   - Comprehensive Stripe setup guide created
   - Documentation index updated

## 🔑 Required GitHub Secrets

You need to add the following secret to your GitHub repository:

| Secret Name | Status | Description |
|------------|--------|-------------|
| `STRIPE_ACCT_ID` | ✅ Already added | Your Stripe Account ID |
| `STRIPE_LIVE_PUBLIC_KEY` | ✅ Already added | Publishable key for frontend |
| `STRIPE_LIVE_SECRET_KEY` | ✅ Already added | Secret key for API calls |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ **NEEDS TO BE ADDED** | Webhook signing secret |

### How to Add STRIPE_WEBHOOK_SECRET

The webhook secret can only be obtained after deploying the infrastructure:

1. **First deployment** - Deploy without the webhook secret (it will be empty)
2. **Create webhook** - In Stripe Dashboard, create webhook pointing to your deployed API Gateway URL
3. **Add secret** - Copy the webhook signing secret and add it to GitHub Secrets
4. **Redeploy** - Deploy again to update the Lambda with the webhook secret

## 📋 Step-by-Step Action Plan

### Step 1: Deploy the Infrastructure (First Time)

```bash
# The deployment will happen automatically via GitHub Actions on push to main
# Or trigger manually via GitHub Actions workflow dispatch
```

After deployment completes, you'll get the API Gateway URL in the deployment summary.

### Step 2: Create Stripe Products and Prices

Follow the guide in `docs/STRIPE_SETUP.md` - two options:

**Option A: Using Stripe CLI (Recommended)**
```bash
stripe login

# Monthly subscription
stripe prices create \
  --unit-amount 499 \
  --currency usd \
  --recurring-interval month \
  --product-data name="Premium Monthly" \
  --lookup-key price_monthly

# Yearly subscription
stripe prices create \
  --unit-amount 4400 \
  --currency usd \
  --recurring-interval year \
  --product-data name="Premium Yearly" \
  --lookup-key price_yearly

# Lifetime access
stripe prices create \
  --unit-amount 17500 \
  --currency usd \
  --product-data name="Lifetime Access" \
  --lookup-key price_lifetime
```

**Option B: Using Stripe Dashboard**
1. Go to Stripe Dashboard → Products
2. Click "Add product"
3. Create the three products/prices as described in the setup guide

### Step 3: Update Frontend Price IDs

After creating prices, update the price IDs in:
`apps/selfapp/src/routes/pricing.tsx`

Replace placeholder IDs with actual Stripe price IDs:
```typescript
{
  id: "monthly",
  stripePriceId: "price_ACTUAL_ID_HERE", // Replace this
  // ...
}
```

### Step 4: Set Up Webhook

1. Get your API Gateway URL from deployment outputs
2. Go to Stripe Dashboard → Developers → Webhooks
3. Click "Add endpoint"
4. Enter URL: `https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/test/api/stripe/webhook`
5. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Copy the **Signing secret** (starts with `whsec_`)

### Step 5: Add Webhook Secret to GitHub

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `STRIPE_WEBHOOK_SECRET`
4. Value: Paste the webhook signing secret from Stripe
5. Click "Add secret"

### Step 6: Redeploy

Trigger another deployment (or push changes) to update the Lambda function with the webhook secret.

## 🧪 Testing

After all steps are complete:

1. **Test Checkout Flow**:
   - Visit your deployed application
   - Navigate to /pricing
   - Click on a paid plan
   - Verify redirect to Stripe Checkout

2. **Test Webhook**:
   - Complete a test payment in Stripe
   - Check Lambda CloudWatch logs for webhook events
   - Verify subscription is updated in DynamoDB

3. **Test Subscription Status**:
   - Check that the subscription displays correctly in the app
   - Verify premium features are unlocked

## 📚 Reference Documentation

- **[Stripe Setup Guide](./STRIPE_SETUP.md)** - Comprehensive setup instructions
- **[Stripe Lambda Handler](../lambda/functions/stripe-handler/index.js)** - Lambda implementation
- **[Terraform Resources](../terraform/resources.tf)** - Infrastructure configuration

## ⚠️ Important Notes

1. **Use Test Mode First**: Start with Stripe test keys for development
2. **Webhook Security**: Always verify webhook signatures (already implemented)
3. **Secret Rotation**: Regularly rotate Stripe API keys
4. **Monitoring**: Set up CloudWatch alarms for Lambda errors

## 🆘 Troubleshooting

If you encounter issues, see the troubleshooting section in `docs/STRIPE_SETUP.md`.

Common issues:
- Invalid API key → Check GitHub secrets are correct
- Webhook signature verification failed → Verify STRIPE_WEBHOOK_SECRET matches
- Price not found → Update price IDs in frontend code

---

**Ready to proceed?** Start with Step 1 and work through each step in order.
