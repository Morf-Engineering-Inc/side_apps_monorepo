# Certificate Verification Checklist

> **Note**: This checklist contains deployment-specific information including the AWS account ID and certificate ARN. These are specific to the trueorient.life certificate and should be replaced with your own values when using this as a template.

Use this checklist while verifying your ACM certificate.

## Certificate Information
- **Certificate ID**: `0f423483-d844-43c1-88eb-9c5a14ef9146`
- **Certificate ARN**: `arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146`
- **Domain**: `trueorient.life`
- **Wildcard**: `*.trueorient.life`
- **DNS Provider**: Namecheap

---

## Prerequisites
- [ ] AWS account access with permissions to view ACM certificates
- [ ] Namecheap account access for domain `trueorient.life`
- [ ] AWS CLI installed (optional, but recommended)
- [ ] Access to terminal for DNS verification commands

---

## Step 1: Get Validation Records from AWS
- [ ] Logged into AWS Console
- [ ] Navigated to ACM in us-east-1 region: https://console.aws.amazon.com/acm/home?region=us-east-1
- [ ] Found certificate ID: `0f423483-d844-43c1-88eb-9c5a14ef9146`
- [ ] Certificate status shows "Pending validation"
- [ ] Copied CNAME record name (starts with `_`)
- [ ] Copied CNAME record value (ends with `.acm-validations.aws.`)
- [ ] Noted how many validation records exist (usually 1 for both domains)

**Alternative (AWS CLI)**:
```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1
```

---

## Step 2: Access Namecheap DNS Settings
- [ ] Logged into Namecheap: https://www.namecheap.com
- [ ] Navigated to Domain List
- [ ] Clicked "MANAGE" for `trueorient.life`
- [ ] Clicked "Advanced DNS" tab
- [ ] Reviewed existing DNS records

---

## Step 3: Add Validation CNAME Record(s)
For each validation record from AWS:

- [ ] Clicked "ADD NEW RECORD" button
- [ ] Selected Type: "CNAME Record"
- [ ] Entered Host: `_________` (only subdomain, NO `.trueorient.life`)
- [ ] Entered Value: `_________` (full value WITH trailing dot `.`)
- [ ] Set TTL: "1 min" (for faster propagation)
- [ ] Clicked "✓" or "Save"
- [ ] Repeated for additional validation records (if any)
- [ ] Clicked "SAVE ALL CHANGES" button at bottom of page
- [ ] Saw green confirmation message

**Record Format Check**:
```
✅ Host:  _abc123def (NO domain name)
✅ Value: _xyz789.acm-validations.aws. (WITH trailing dot)
❌ Host:  _abc123def.trueorient.life (WRONG - includes domain)
❌ Value: _xyz789.acm-validations.aws (WRONG - missing dot)
```

---

## Step 4: Verify DNS Propagation
Wait 5-10 minutes, then:

- [ ] Opened terminal
- [ ] Ran DNS query: `dig _your-record.trueorient.life CNAME`
- [ ] Verified CNAME record appears in results
- [ ] Verified CNAME points to ACM validation endpoint
- [ ] Checked from Google DNS: `dig @8.8.8.8 _your-record.trueorient.life CNAME`
- [ ] Checked from Cloudflare DNS: `dig @1.1.1.1 _your-record.trueorient.life CNAME`

**Alternative (online checker)**:
- [ ] Visited https://www.whatsmydns.net/
- [ ] Entered: `_your-record.trueorient.life`
- [ ] Selected type: CNAME
- [ ] Verified propagation globally

---

## Step 5: Monitor Certificate Validation
Wait 5-30 minutes for AWS to validate:

- [ ] Returned to AWS ACM Console
- [ ] Refreshed certificate page every 5 minutes
- [ ] Certificate status changed to "Issued" ✅

**Alternative (AWS CLI)**:
```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1 \
  --query 'Certificate.Status'
```

**Expected Result**: `"ISSUED"`

---

## Step 6: Add CloudFront CNAME Records (Post-Validation)
After certificate is issued:

- [ ] Got CloudFront domain from Terraform: `terraform output cloudfront_url`
- [ ] Returned to Namecheap Advanced DNS
- [ ] Added CNAME for root domain:
  - Type: CNAME Record
  - Host: `@`
  - Value: `d123abc.cloudfront.net` (your CloudFront domain)
  - TTL: Automatic
- [ ] Added CNAME for www subdomain:
  - Type: CNAME Record
  - Host: `www`
  - Value: `d123abc.cloudfront.net` (your CloudFront domain)
  - TTL: Automatic
- [ ] Clicked "SAVE ALL CHANGES"

---

## Step 7: Verify HTTPS Access
Wait 15-30 minutes for CloudFront to update:

- [ ] Tested primary domain: `curl -I https://trueorient.life`
- [ ] Verified SSL certificate: `openssl s_client -connect trueorient.life:443`
- [ ] Opened in browser: https://trueorient.life
- [ ] Verified secure padlock icon in browser
- [ ] Clicked padlock → Certificate → Verified issuer is Amazon
- [ ] Tested www subdomain: https://www.trueorient.life

---

## Troubleshooting (If Needed)

### Certificate Not Validating After 30+ Minutes
- [ ] Verified DNS record exists: `dig _your-record.trueorient.life CNAME`
- [ ] Checked Host field only has subdomain (no `.trueorient.life`)
- [ ] Checked Value field has trailing dot
- [ ] Waited additional 30 minutes
- [ ] Cleared local DNS cache
- [ ] Checked Namecheap for typos in CNAME record

### DNS Not Propagating
- [ ] Verified "SAVE ALL CHANGES" was clicked in Namecheap
- [ ] Set TTL to "1 min" instead of "Automatic"
- [ ] Deleted and re-added the CNAME record
- [ ] Waited for global DNS propagation (up to 48 hours)

### HTTPS Access Issues
- [ ] Verified certificate status is "Issued" in AWS
- [ ] Verified CloudFront CNAME records are correct
- [ ] Waited for CloudFront distribution update (15-20 minutes)
- [ ] Cleared browser cache and cookies
- [ ] Tried in incognito/private browser window

---

## Final Verification
- [ ] Certificate status: "Issued" in AWS ACM Console
- [ ] Domain accessible via HTTPS: https://trueorient.life
- [ ] WWW subdomain works: https://www.trueorient.life
- [ ] SSL certificate valid (no browser warnings)
- [ ] Website loads correctly
- [ ] All API calls working (if applicable)
- [ ] Authentication redirects working (if applicable)

---

## Documentation References
- Quick Reference: [CERTIFICATE_QUICK_REFERENCE.md](./CERTIFICATE_QUICK_REFERENCE.md)
- Full Guide: [CERTIFICATE_VERIFICATION.md](./CERTIFICATE_VERIFICATION.md)
- Namecheap Setup: [NAMECHEAP_DNS_SETUP.md](./NAMECHEAP_DNS_SETUP.md)
- Custom Domain: [CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md)

---

## Notes & Timestamps

**Started**: _________________

**DNS Records Added**: _________________

**Certificate Issued**: _________________

**CloudFront CNAMEs Added**: _________________

**HTTPS Verified**: _________________

**Completed**: _________________

---

**Total Expected Time**: 30-60 minutes (most time is waiting for DNS propagation and AWS validation)

---

✅ **Certificate verification complete!** The certificate is now issued and the domain is accessible via HTTPS.
