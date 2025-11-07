# Namecheap DNS Setup for AWS ACM Certificate Validation

> **Note**: This guide includes specific certificate details for trueorient.life. The ARN and account ID are specific to this deployment and should be replaced with your own values when using this as a reference.

Quick guide for adding DNS records to Namecheap to verify your ACM certificate.

## Prerequisites

- Access to Namecheap account with domain `trueorient.life`
- AWS ACM certificate ARN: `arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146`
- Certificate validation records from AWS (see below how to get them)

## Step-by-Step Guide

### Step 1: Get Validation Records from AWS

#### Option A: AWS Console
1. Go to https://console.aws.amazon.com/acm/home?region=us-east-1
2. Click on certificate `0f423483-d844-43c1-88eb-9c5a14ef9146`
3. Under "Domains" section, you'll see validation records like:

```
CNAME name:  _abc123def456.trueorient.life
CNAME value: _xyz789abc.acm-validations.aws.
```

#### Option B: AWS CLI
```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[*].[ResourceRecord.Name,ResourceRecord.Value]' \
  --output table
```

### Step 2: Login to Namecheap

1. Go to https://www.namecheap.com
2. Click **Sign In**
3. Enter your credentials
4. Navigate to **Domain List**

### Step 3: Access DNS Settings

1. Find `trueorient.life` in your domain list
2. Click **MANAGE** button
3. Click **Advanced DNS** tab

### Step 4: Add CNAME Records

#### For ACM Validation Record:

Click **ADD NEW RECORD** button and fill in:

| Field | What to Enter | Example |
|-------|--------------|---------|
| **Type** | Select "CNAME Record" | CNAME Record |
| **Host** | Only the subdomain part (before .trueorient.life) | `_abc123def456` |
| **Value** | Full validation value from AWS | `_xyz789abc.acm-validations.aws.` |
| **TTL** | Select "1 min" or "Automatic" | 1 min |

⚠️ **CRITICAL**: 
- Do NOT include `.trueorient.life` in the Host field
- Namecheap will automatically append it
- DO include the trailing dot (`.`) at the end of the Value

#### Example:

**AWS Shows:**
```
Name:  _1234567890abcdef.trueorient.life
Value: _abcdef1234567890.acm-validations.aws.
```

**You Enter in Namecheap:**
```
Host:  _1234567890abcdef
Value: _abcdef1234567890.acm-validations.aws.
```

### Step 5: Save Changes

1. Click **SAVE ALL CHANGES** button at the bottom
2. Wait for confirmation message
3. Note: Changes may take 5-30 minutes to propagate

### Step 6: Verify DNS Record

Wait 5-10 minutes, then check if the record is live:

```bash
# Replace with your actual record name
dig _1234567890abcdef.trueorient.life CNAME

# Or use nslookup
nslookup -type=CNAME _1234567890abcdef.trueorient.life
```

Expected output should show the CNAME pointing to the ACM validation endpoint.

### Step 7: Wait for AWS Validation

1. Go back to AWS ACM Console
2. Refresh the certificate page
3. Status should change from "Pending validation" to "Issued"
4. This usually takes 5-30 minutes after DNS propagates

## Common Mistakes to Avoid

### ❌ Mistake 1: Including Domain in Host Field
```
WRONG Host: _abc123.trueorient.life
RIGHT Host: _abc123
```

### ❌ Mistake 2: Missing Trailing Dot
```
WRONG Value: _xyz789.acm-validations.aws
RIGHT Value: _xyz789.acm-validations.aws.
```

### ❌ Mistake 3: Using Wrong Record Type
```
WRONG: A Record, TXT Record
RIGHT: CNAME Record
```

### ❌ Mistake 4: Not Saving Changes
- Always click "SAVE ALL CHANGES" at the bottom
- Look for green confirmation message

## After Certificate is Validated

Once your certificate shows "Issued" status in AWS, you need to add CloudFront CNAME records.

### Add CloudFront Records to Namecheap

Get your CloudFront domain name from:
```bash
cd terraform
terraform output cloudfront_url
# or
aws cloudfront list-distributions --query 'DistributionList.Items[0].DomainName' --output text
```

Add these two CNAME records:

#### Record 1: Root Domain
```
Type:  CNAME Record
Host:  @
Value: d1234567890abc.cloudfront.net
TTL:   Automatic
```

#### Record 2: WWW Subdomain
```
Type:  CNAME Record
Host:  www
Value: d1234567890abc.cloudfront.net
TTL:   Automatic
```

Replace `d1234567890abc.cloudfront.net` with your actual CloudFront domain.

## Verification Checklist

- [ ] Got validation records from AWS ACM Console
- [ ] Logged into Namecheap
- [ ] Navigated to Advanced DNS for trueorient.life
- [ ] Added CNAME record with correct Host (without domain)
- [ ] Added CNAME record with correct Value (with trailing dot)
- [ ] Clicked "SAVE ALL CHANGES"
- [ ] Waited 5-10 minutes for DNS propagation
- [ ] Verified DNS record with `dig` command
- [ ] Checked AWS ACM Console - certificate status is "Issued"
- [ ] Added CloudFront CNAME records (@ and www)
- [ ] Tested HTTPS access to https://trueorient.life

## Troubleshooting

### DNS Record Not Appearing

**Problem**: `dig` command doesn't show the CNAME record

**Solutions**:
1. Check if you clicked "SAVE ALL CHANGES" in Namecheap
2. Verify you entered only the subdomain in Host field
3. Wait another 5-10 minutes (DNS can be slow)
4. Try clearing DNS cache on your computer:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### Certificate Still Pending After 30 Minutes

**Problem**: Certificate remains in "Pending validation" status

**Solutions**:
1. Double-check the CNAME record value matches exactly what AWS shows
2. Ensure the trailing dot is included in the Value
3. Try checking DNS from different servers:
   ```bash
   dig @8.8.8.8 _yourrecord.trueorient.life CNAME
   dig @1.1.1.1 _yourrecord.trueorient.life CNAME
   ```
4. If DNS is correct, wait up to 72 hours (usually much faster)
5. Contact AWS support if still not working after 72 hours

### Record Already Exists Error

**Problem**: Namecheap says "Record already exists"

**Solutions**:
1. Look for existing CNAME records with the same Host
2. Delete the old one
3. Add the new validation record
4. Make sure you're not duplicating records

## DNS Propagation Checkers

Use these tools to check DNS propagation globally:
- https://www.whatsmydns.net/
- https://dnschecker.org/
- https://www.digwebinterface.com/

Enter your CNAME record (e.g., `_abc123.trueorient.life`) and select "CNAME" type.

## Quick Commands Reference

```bash
# Get certificate validation records
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions'

# Check DNS record
dig _yourrecord.trueorient.life CNAME

# Check certificate status
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1 \
  --query 'Certificate.Status'

# Test HTTPS after validation
curl -I https://trueorient.life
```

## Support

- Namecheap DNS Help: https://www.namecheap.com/support/knowledgebase/category/10196/dns-management/
- AWS ACM Help: https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html
- Additional Details: See [CERTIFICATE_VERIFICATION.md](./CERTIFICATE_VERIFICATION.md)

## Summary

The most important points:
1. ✅ Get CNAME records from AWS ACM Console
2. ✅ In Namecheap, enter only the subdomain part in Host (e.g., `_abc123`)
3. ✅ Include the trailing dot in Value (e.g., `_xyz.acm-validations.aws.`)
4. ✅ Click "SAVE ALL CHANGES"
5. ✅ Wait 5-30 minutes for validation
6. ✅ Add CloudFront CNAMEs after certificate is issued

---

**Pro Tip**: Set TTL to "1 min" for validation records - this makes DNS propagate faster. You can change it back to "Automatic" later if desired.
