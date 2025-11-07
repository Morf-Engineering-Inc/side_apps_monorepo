# Custom Domain Setup Guide for trueorient.life

This guide explains how to set up the custom domain `trueorient.life` with SSL for the BecomeLog application.

> **Quick Start**: If you have a certificate pending validation, see the [Certificate Verification Guide](./CERTIFICATE_VERIFICATION.md) or [Namecheap DNS Setup Guide](./NAMECHEAP_DNS_SETUP.md) for step-by-step instructions.

## Overview

The infrastructure now includes:
- ACM Certificate in us-east-1 (required for CloudFront)
- CloudFront distribution configured with custom domain aliases
- Updated CORS and Cognito callback URLs to support the custom domain

## Prerequisites

1. Domain `trueorient.life` registered on Namecheap
2. Access to Namecheap DNS management
3. AWS infrastructure deployed via Terraform

## Related Guides

- **[Certificate Verification Guide](./CERTIFICATE_VERIFICATION.md)** - Detailed guide for verifying ACM certificates
- **[Namecheap DNS Setup](./NAMECHEAP_DNS_SETUP.md)** - Quick reference for adding DNS records to Namecheap

## Deployment Steps

### 1. Deploy Terraform Infrastructure

The GitHub Actions workflow will automatically deploy the infrastructure when you push to the `main` branch.

```bash
# Or manually deploy
cd terraform
terraform init
terraform plan
terraform apply
```

### 2. Get DNS Records from Terraform Outputs

After deployment, retrieve the DNS records needed:

```bash
cd terraform

# Get ACM validation records
terraform output acm_validation_records

# Get full DNS setup instructions
terraform output nameserver_instructions

# Get certificate ARN (for checking status)
terraform output certificate_arn
```

### 3. Add DNS Records to Namecheap

1. Log into your Namecheap account
2. Go to **Domain List** → Select `trueorient.life` → **Manage**
3. Click on **Advanced DNS** tab

#### Add ACM Validation Record

The ACM validation record will look like:
```
Type: CNAME
Host: _abc123def456789
Value: _xyz789abc123.acm-validation.aws.
TTL: Automatic
```

**Note**: Remove the domain name from the Host if Namecheap adds it automatically. For example:
- If Terraform outputs: `_abc123.trueorient.life`
- Enter only: `_abc123` in the Host field

#### Add CloudFront CNAME Records

Add two CNAME records pointing to your CloudFront distribution:

```
Type: CNAME
Host: @
Value: d123abc456def.cloudfront.net
TTL: Automatic

Type: CNAME
Host: www
Value: d123abc456def.cloudfront.net
TTL: Automatic
```

Replace `d123abc456def.cloudfront.net` with your actual CloudFront domain from the Terraform output.

### 4. Wait for Certificate Validation

Certificate validation typically takes 5-30 minutes after adding the DNS records.

Check certificate status:

```bash
# Using AWS CLI
aws acm describe-certificate \
  --certificate-arn $(cd terraform && terraform output -raw certificate_arn) \
  --region us-east-1 \
  --query 'Certificate.Status'

# Or check in AWS Console
# Go to: ACM → us-east-1 region → Find your certificate
```

Wait until the status shows `ISSUED`.

### 5. Wait for DNS Propagation

After adding the CNAME records for CloudFront:
- DNS propagation typically takes 5-10 minutes
- Full global propagation can take up to 48 hours

Test DNS resolution:

```bash
# Test if DNS is resolving correctly
dig trueorient.life
dig www.trueorient.life

# Or use nslookup
nslookup trueorient.life
nslookup www.trueorient.life
```

### 6. Access Your Application

Once certificate validation and DNS propagation are complete:

- **Primary domain**: https://trueorient.life
- **WWW subdomain**: https://www.trueorient.life
- **CloudFront URL**: Still works as fallback

## Architecture Details

### ACM Certificate

- **Location**: us-east-1 (required for CloudFront)
- **Validation**: DNS validation via CNAME record
- **Coverage**: `trueorient.life` and `*.trueorient.life`
- **SSL Protocol**: TLS 1.2 or higher

### CloudFront Configuration

- **Custom SSL**: SNI (Server Name Indication)
- **Minimum Protocol**: TLS 1.2
- **Aliases**: `trueorient.life` and `www.trueorient.life`

### Updated URLs

The following AWS resources now support the custom domain:

#### API Gateway CORS
- Added `https://trueorient.life`
- Added `https://www.trueorient.life`

#### Cognito Callback URLs
- Added `https://trueorient.life/`
- Added `https://trueorient.life/callback`
- Added `https://www.trueorient.life/`
- Added `https://www.trueorient.life/callback`

#### Cognito Logout URLs
- Added `https://trueorient.life/`
- Added `https://www.trueorient.life/`

## Troubleshooting

### Certificate Not Validating

**Issue**: Certificate stays in "Pending validation" status

**Solutions**:
1. Verify the CNAME record is added correctly in Namecheap
2. Ensure you only added the subdomain part (without the domain name)
3. Wait at least 30 minutes
4. Check DNS propagation: `dig _abc123.trueorient.life CNAME`

### SSL Certificate Error in Browser

**Issue**: Browser shows SSL certificate error

**Solutions**:
1. Verify certificate status is "ISSUED"
2. Wait for CloudFront distribution update (can take 15-20 minutes)
3. Check that CNAME records point to correct CloudFront domain
4. Clear browser cache and cookies

### Domain Not Resolving

**Issue**: Domain doesn't resolve to CloudFront

**Solutions**:
1. Verify CNAME records are added correctly
2. Wait for DNS propagation (up to 48 hours globally)
3. Test with different DNS servers: `dig @8.8.8.8 trueorient.life`
4. Verify TTL settings in Namecheap (lower values propagate faster)

### CloudFront Returns 403 Forbidden

**Issue**: CloudFront returns 403 when accessing custom domain

**Solutions**:
1. Verify certificate is in "ISSUED" status
2. Wait for CloudFront distribution update to complete
3. Check CloudFront distribution has correct aliases configured
4. Verify S3 bucket policy allows CloudFront OAI access

### Authentication Redirect Issues

**Issue**: Cognito authentication doesn't redirect properly

**Solutions**:
1. Verify callback URLs include custom domain
2. Check that frontend config.js uses custom domain URLs
3. Clear browser cookies and cache
4. Ensure you're accessing via HTTPS (not HTTP)

## Monitoring

### Check Certificate Status

```bash
aws acm describe-certificate \
  --certificate-arn <your-cert-arn> \
  --region us-east-1
```

### Check CloudFront Distribution Status

```bash
aws cloudfront get-distribution \
  --id <your-distribution-id> \
  --query 'Distribution.Status'
```

### Test SSL Certificate

```bash
openssl s_client -connect trueorient.life:443 -servername trueorient.life
```

### Monitor DNS Propagation

Use online tools:
- https://www.whatsmydns.net/
- https://dnschecker.org/

## Cost Implications

Adding a custom domain with SSL includes these costs:

- **ACM Certificate**: Free
- **CloudFront with custom SSL**: No additional cost (SNI)
- **Route53 (if used)**: Not used, DNS managed by Namecheap
- **Data Transfer**: Same as before

## Security Considerations

- SSL/TLS 1.2+ enforced
- Certificate auto-renewal handled by AWS ACM
- SNI-only (no dedicated IP, lower cost)
- HTTPS redirect enforced for all HTTP requests

## Updating the Domain

To change the domain name:

1. Update `terraform/variables.tf`:
   ```hcl
   variable "domain_name" {
     default     = "yournewdomain.com"
   }
   ```

2. Update GitHub Actions workflow environment variable:
   ```yaml
   TF_VAR_domain_name: yournewdomain.com
   ```

3. Deploy infrastructure
4. Add new DNS records
5. Wait for certificate validation

## Support

For issues:
1. Check AWS CloudWatch logs
2. Review Terraform output messages
3. Verify DNS records in Namecheap
4. Check ACM certificate status in AWS Console

## References

- [AWS ACM Documentation](https://docs.aws.amazon.com/acm/)
- [CloudFront Custom SSL](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https.html)
- [Namecheap DNS Management](https://www.namecheap.com/support/knowledgebase/category/10196/dns-management/)
