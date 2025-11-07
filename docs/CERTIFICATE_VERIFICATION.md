# ACM Certificate Verification Guide

> **Note**: This guide contains specific certificate details for the trueorient.life domain. The AWS account ID and certificate ARN shown are specific to this deployment. When using this guide as a reference for other certificates, replace these values with your own.

This guide helps you verify AWS ACM certificates that are stuck in "Pending validation" status.

## Current Certificate Status

**Certificate ID**: `0f423483-d844-43c1-88eb-9c5a14ef9146`  
**ARN**: `arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146`  
**Type**: Amazon Issued  
**Status**: Pending validation  
**Domains**: 2 domains (primary + wildcard)

## Why Verification is Required

AWS ACM certificates use DNS validation to prove you own the domain. Until the DNS validation records are added to your DNS provider (Namecheap), the certificate will remain in "Pending validation" status and cannot be used with CloudFront or other AWS services.

## Quick Start: Get Validation Records

### Option 1: Using AWS Console

1. Go to [AWS Certificate Manager Console](https://console.aws.amazon.com/acm/home?region=us-east-1)
2. Click on certificate ID: `0f423483-d844-43c1-88eb-9c5a14ef9146`
3. Scroll to "Domains" section
4. Copy the **CNAME name** and **CNAME value** for each domain

### Option 2: Using AWS CLI

```bash
# Get certificate details and validation records
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions' \
  --output table
```

### Option 3: Using Terraform

If you deployed with Terraform:

```bash
cd terraform
terraform output acm_validation_records
terraform output nameserver_instructions
```

## Adding DNS Records to Namecheap

### Step 1: Login to Namecheap

1. Go to [Namecheap.com](https://www.namecheap.com)
2. Login to your account
3. Go to **Domain List**
4. Click **Manage** next to `trueorient.life`

### Step 2: Navigate to DNS Settings

1. Click on **Advanced DNS** tab
2. You'll see a list of existing DNS records

### Step 3: Add CNAME Validation Record

For each domain that needs validation, add a CNAME record:

**Important**: The validation record will look like:
```
Name: _abc123def456.trueorient.life
Value: _xyz789abc123.acm-validations.aws.
```

**In Namecheap**, you need to:
1. Click **ADD NEW RECORD**
2. Select **Type**: `CNAME Record`
3. **Host**: Enter only the subdomain part (e.g., `_abc123def456`)
   - ⚠️ **DO NOT** include `.trueorient.life` - Namecheap adds this automatically
4. **Value**: Paste the full validation value (e.g., `_xyz789abc123.acm-validations.aws.`)
   - ✅ **DO** include the trailing dot (`.`) at the end
5. **TTL**: Select `Automatic` or `1 min` for faster propagation
6. Click **Save All Changes**

### Step 4: Repeat for All Domains

If you have 2 domains (e.g., `trueorient.life` and `*.trueorient.life`), you may see:
- 1 CNAME record that validates both (common case)
- OR 2 separate CNAME records (one for each)

Add all the CNAME records provided by AWS.

## Verification Timeline

| Stage | Duration | Status Check |
|-------|----------|--------------|
| DNS Propagation | 5-15 minutes | Check with `dig` |
| AWS Validation | 5-30 minutes | Check ACM console |
| Certificate Issued | Total: 10-45 minutes | Status: "Issued" |

## Check DNS Propagation

After adding the CNAME records to Namecheap:

```bash
# Check if DNS record is visible (replace with your actual CNAME name)
dig _abc123def456.trueorient.life CNAME

# Check from Google DNS
dig @8.8.8.8 _abc123def456.trueorient.life CNAME

# Check from Cloudflare DNS
dig @1.1.1.1 _abc123def456.trueorient.life CNAME
```

You should see the CNAME record pointing to the ACM validation endpoint.

## Check Certificate Status

### Using AWS Console

1. Go to [ACM Console](https://console.aws.amazon.com/acm/home?region=us-east-1)
2. Find certificate `0f423483-d844-43c1-88eb-9c5a14ef9146`
3. Status should change from "Pending validation" to "Issued"
4. Refresh every few minutes

### Using AWS CLI

```bash
# Check certificate status
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1 \
  --query 'Certificate.Status' \
  --output text
```

Expected output:
- `PENDING_VALIDATION` - Still waiting (give it more time)
- `ISSUED` - Success! Certificate is validated
- `FAILED` - See troubleshooting section below

### Using Terraform

```bash
cd terraform
terraform refresh
terraform output certificate_arn
```

## Troubleshooting

### Problem: Certificate Still Pending After 30+ Minutes

**Possible Causes:**
1. DNS records not added correctly
2. DNS not propagated yet
3. Wrong region (certificate must be in us-east-1 for CloudFront)

**Solutions:**
```bash
# 1. Verify DNS record exists
dig _your-validation-record.trueorient.life CNAME

# 2. Check if you entered only the subdomain in Namecheap
# WRONG: _abc123.trueorient.life (Namecheap will make it _abc123.trueorient.life.trueorient.life)
# RIGHT: _abc123 (Namecheap will add .trueorient.life)

# 3. Wait longer - DNS can take up to 48 hours globally
# But validation usually happens within 30 minutes if DNS is correct
```

### Problem: CNAME Record Not Showing in DNS Queries

**Possible Causes:**
1. Host field includes the full domain name
2. TTL too high
3. Changes not saved in Namecheap

**Solutions:**
1. In Namecheap, edit the CNAME record
2. Ensure **Host** field only has the subdomain (e.g., `_abc123`)
3. Click **Save All Changes** at the bottom of the page
4. Set TTL to `1 min` for faster propagation
5. Wait 5-10 minutes and check again

### Problem: Wrong CNAME Value

**Possible Causes:**
1. Missing trailing dot in value
2. Copy-paste error

**Solutions:**
1. Go back to AWS Console and copy the exact CNAME value
2. Ensure the value ends with `.acm-validations.aws.` (with trailing dot)
3. Delete the old CNAME record in Namecheap
4. Create a new one with the correct value

### Problem: Certificate Validation Failed

**If certificate moves to FAILED status:**

1. Delete the failed certificate in ACM
2. Create a new certificate request
3. Add the new validation CNAME records
4. If using Terraform, run `terraform apply` again

### Problem: Multiple Validation Records

**If you see 2+ validation records:**

This is normal for certificates covering multiple domains:
- Main domain: `trueorient.life`
- Wildcard: `*.trueorient.life`

AWS may provide:
- 1 record that validates both (consolidated)
- OR 2 separate records

**Action**: Add ALL CNAME records shown in AWS console.

## After Certificate is Issued

Once the certificate status is "Issued":

### 1. Update CloudFront Distribution (if not already done)

Terraform should automatically use the certificate. If manual:

```bash
# Check CloudFront distribution
aws cloudfront get-distribution --id <your-dist-id>

# Verify certificate ARN is attached
```

### 2. Add CloudFront CNAME Records to Namecheap

If not already added, create these records:

```
Type: CNAME
Host: @
Value: <your-cloudfront-domain>.cloudfront.net
TTL: Automatic

Type: CNAME
Host: www
Value: <your-cloudfront-domain>.cloudfront.net
TTL: Automatic
```

### 3. Test HTTPS Access

```bash
# Test primary domain
curl -I https://trueorient.life

# Test WWW subdomain
curl -I https://www.trueorient.life

# Test SSL certificate
openssl s_client -connect trueorient.life:443 -servername trueorient.life
```

### 4. Wait for Full Propagation

- DNS changes: 5-15 minutes (usually)
- Full global propagation: Up to 48 hours
- CloudFront distribution update: 15-20 minutes

## Common DNS Record Formats

### Correct Format in Namecheap

| Field | Example Value | Notes |
|-------|--------------|-------|
| Type | CNAME Record | Must be CNAME for validation |
| Host | `_abc123def456` | Only the subdomain, NO domain name |
| Value | `_xyz789.acm-validations.aws.` | Full value WITH trailing dot |
| TTL | Automatic or 1 min | Lower TTL = faster propagation |

### How AWS Shows It

```
Name:  _abc123def456.trueorient.life.
Value: _xyz789.acm-validations.aws.
```

### How You Enter in Namecheap

```
Host:  _abc123def456
Value: _xyz789.acm-validations.aws.
```

## Security Notes

- ✅ Validation CNAME records are safe to add (they don't affect your website)
- ✅ They only prove you control the domain
- ✅ They can be removed after certificate is issued (but keep them for auto-renewal)
- ✅ ACM automatically renews certificates 60 days before expiry
- ⚠️ Do NOT remove validation records - ACM needs them for renewal

## Monitoring Certificate Health

### Set Up CloudWatch Alarm (Optional)

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name certificate-expiry-warning \
  --alarm-description "Alert when certificate expires soon" \
  --metric-name DaysToExpiry \
  --namespace AWS/CertificateManager \
  --statistic Minimum \
  --period 86400 \
  --threshold 30 \
  --comparison-operator LessThanThreshold
```

### Check Certificate Expiry

```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1 \
  --query 'Certificate.NotAfter' \
  --output text
```

## Quick Reference Commands

```bash
# Get certificate status
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1

# Check DNS propagation
dig _your-record.trueorient.life CNAME

# Test HTTPS
curl -I https://trueorient.life

# View certificate details in browser
# Navigate to: https://trueorient.life
# Click padlock icon → Certificate → Details
```

## Support Resources

- [AWS ACM Documentation](https://docs.aws.amazon.com/acm/)
- [ACM DNS Validation](https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html)
- [Namecheap DNS Management](https://www.namecheap.com/support/knowledgebase/category/10196/dns-management/)
- [DNS Propagation Checker](https://www.whatsmydns.net/)

## Next Steps

After certificate is verified and issued:

1. ✅ Ensure CloudFront uses the certificate
2. ✅ Add CloudFront CNAME records to Namecheap
3. ✅ Test HTTPS access to your domain
4. ✅ Update application to use custom domain URLs
5. ✅ Monitor certificate auto-renewal (happens automatically)

---

**Need Help?** Check the troubleshooting section or review the [Custom Domain Setup Guide](./CUSTOM_DOMAIN_SETUP.md) for more details.
