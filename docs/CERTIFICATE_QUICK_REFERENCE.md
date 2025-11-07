# ACM Certificate Verification - Quick Reference Card

> **Security Note**: This reference contains specific certificate details for this deployment. When sharing or using as a template, replace the ARN and account ID with placeholders.

## Certificate Details
- **ID**: `0f423483-d844-43c1-88eb-9c5a14ef9146`
- **ARN**: `arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146`
- **Domain**: `trueorient.life` (+ wildcard `*.trueorient.life`)
- **DNS Provider**: Namecheap

---

## 🚀 Quick Start (5 Steps)

### 1. Get Validation Records from AWS
```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[*].ResourceRecord' \
  --output table
```

**Or use AWS Console**: https://console.aws.amazon.com/acm/home?region=us-east-1

---

### 2. Login to Namecheap
- URL: https://www.namecheap.com
- Go to: **Domain List** → **trueorient.life** → **MANAGE** → **Advanced DNS**

---

### 3. Add CNAME Record

| Field | Value |
|-------|-------|
| **Type** | CNAME Record |
| **Host** | `_abc123` (only subdomain, NO `.trueorient.life`) |
| **Value** | `_xyz789.acm-validations.aws.` (WITH trailing dot) |
| **TTL** | 1 min (for faster propagation) |

⚠️ **Critical**: 
- Do NOT include `.trueorient.life` in Host
- DO include trailing dot `.` in Value

---

### 4. Verify DNS Propagation (wait 5-10 min)
```bash
dig _abc123.trueorient.life CNAME
```

---

### 5. Check Certificate Status
```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:588110339617:certificate/0f423483-d844-43c1-88eb-9c5a14ef9146 \
  --region us-east-1 \
  --query 'Certificate.Status' \
  --output text
```

Expected: `ISSUED` ✅

---

## ⚠️ Common Mistakes

| ❌ Wrong | ✅ Right |
|---------|---------|
| Host: `_abc123.trueorient.life` | Host: `_abc123` |
| Value: `_xyz.acm-validations.aws` | Value: `_xyz.acm-validations.aws.` |
| Record Type: TXT | Record Type: CNAME |
| Forgot to click "SAVE ALL CHANGES" | Clicked "SAVE ALL CHANGES" ✓ |

---

## 🔍 Troubleshooting

### Certificate Still Pending?
1. ✓ Verify CNAME record exists: `dig _abc123.trueorient.life CNAME`
2. ✓ Check Host field has only subdomain (no domain name)
3. ✓ Check Value has trailing dot
4. ✓ Wait 30 minutes
5. ✓ Clear DNS cache: `sudo systemd-resolve --flush-caches`

### DNS Not Propagating?
1. ✓ Check multiple DNS servers: `dig @8.8.8.8 _abc123.trueorient.life CNAME`
2. ✓ Verify you clicked "SAVE ALL CHANGES" in Namecheap
3. ✓ Set TTL to "1 min" for faster propagation
4. ✓ Use online checker: https://www.whatsmydns.net/

---

## 📋 After Certificate is Issued

### Add CloudFront CNAME Records

Get CloudFront domain:
```bash
terraform output cloudfront_url
# or
aws cloudfront list-distributions
```

Add to Namecheap:
```
Type: CNAME | Host: @   | Value: d123.cloudfront.net
Type: CNAME | Host: www | Value: d123.cloudfront.net
```

### Test HTTPS
```bash
curl -I https://trueorient.life
openssl s_client -connect trueorient.life:443
```

---

## 📚 Full Documentation

- [Complete Certificate Verification Guide](./CERTIFICATE_VERIFICATION.md)
- [Detailed Namecheap DNS Setup](./NAMECHEAP_DNS_SETUP.md)
- [Custom Domain Setup](./CUSTOM_DOMAIN_SETUP.md)
- [Terraform Infrastructure](../terraform/README.md)

---

## 🆘 Support

- **AWS ACM**: https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html
- **Namecheap DNS**: https://www.namecheap.com/support/knowledgebase/category/10196/
- **DNS Checker**: https://www.whatsmydns.net/

---

**Pro Tips**:
- Set TTL to "1 min" for validation records (faster DNS propagation)
- Don't remove validation records after certificate is issued (needed for auto-renewal)
- Certificate validation usually completes in 5-30 minutes if DNS is correct
- Keep this certificate ARN handy for future reference

---

**Print this page and keep it near your desk for quick reference!**
