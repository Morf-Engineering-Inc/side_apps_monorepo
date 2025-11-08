# Documentation Index

This directory contains comprehensive documentation for the Side Apps Monorepo project.

## Certificate & Domain Setup

### ✅ [Certificate Verification Checklist](./CERTIFICATE_VERIFICATION_CHECKLIST.md)
**Step-by-step checklist to follow while verifying**

Interactive checklist with:
- Complete verification workflow
- Checkboxes for each step
- Troubleshooting section
- Space for notes and timestamps

**Use Case**: You want to follow along step-by-step with checkboxes

---

### 🚀 [Certificate Quick Reference](./CERTIFICATE_QUICK_REFERENCE.md)
**One-page guide for immediate action**

Essential info on a single page:
- Certificate details (ARN, ID)
- 5-step verification process
- Common mistakes and fixes
- Quick command reference

**Use Case**: You need to verify a certificate RIGHT NOW

---

### 🔐 [Certificate Verification Guide](./CERTIFICATE_VERIFICATION.md)
**Start here if you have a certificate pending validation**

Complete guide for verifying AWS ACM certificates, including:
- How to get validation records from AWS
- Step-by-step DNS setup instructions
- Troubleshooting common validation issues
- Monitoring certificate health

**Use Case**: Your ACM certificate is stuck in "Pending validation" status

---

### 📋 [Namecheap DNS Setup](./NAMECHEAP_DNS_SETUP.md)
**Quick reference for Namecheap DNS configuration**

Concise guide focused on:
- Adding CNAME records to Namecheap
- Common mistakes to avoid
- DNS propagation verification
- Quick command reference

**Use Case**: You need a quick, step-by-step guide for adding DNS records

---

### 🌐 [Custom Domain Setup Guide](./CUSTOM_DOMAIN_SETUP.md)
**Complete domain configuration for trueorient.life**

Comprehensive guide covering:
- Full domain setup workflow
- CloudFront configuration
- CORS and Cognito URL updates
- End-to-end testing

**Use Case**: Setting up a custom domain from scratch

---

## Authentication & Deployment

### 🔑 [Cognito Setup Guide](./COGNITO_SETUP.md)
AWS Cognito authentication configuration, including:
- User pool configuration
- OAuth 2.0 setup with PKCE
- Hosted UI customization
- Testing authentication flow

---

### 💳 [Stripe Setup Guide](./STRIPE_SETUP.md)
**Complete Stripe payment integration guide**

Comprehensive guide for setting up Stripe payments:
- GitHub secrets configuration
- Stripe price creation with CLI
- Webhook setup and verification
- Testing payment flows
- Security best practices

**Use Case**: Setting up payment processing for subscription tiers

---

### 🚀 [Deployment Fixes](./DEPLOYMENT_FIXES.md)
Recent infrastructure fixes and deployment notes:
- Terraform state management
- Common deployment issues
- CI/CD pipeline fixes

---

## Data Architecture

### 📊 [Single Table Design](./SINGLE_TABLE_DESIGN.md)
DynamoDB single-table design documentation:
- Table structure
- Access patterns
- Query examples

---

### ✅ [Checklist](./CHECKLIST.md)
Project task tracking and completion checklist

---

## Quick Links by Task

### I need to verify an ACM certificate RIGHT NOW
→ **[Certificate Quick Reference](./CERTIFICATE_QUICK_REFERENCE.md)** ⚡

### I need to verify an ACM certificate (detailed guide)
→ **[Certificate Verification Guide](./CERTIFICATE_VERIFICATION.md)**

### I need to add DNS records to Namecheap
→ **[Namecheap DNS Setup](./NAMECHEAP_DNS_SETUP.md)**

### I'm setting up a custom domain
→ **[Custom Domain Setup Guide](./CUSTOM_DOMAIN_SETUP.md)**

### I'm configuring authentication
→ **[Cognito Setup Guide](./COGNITO_SETUP.md)**

### I'm setting up payment processing
→ **[Stripe Setup Guide](./STRIPE_SETUP.md)** 💳

### I'm troubleshooting deployment
→ **[Deployment Fixes](./DEPLOYMENT_FIXES.md)**

---

## External Resources

- [Main Project README](../README.md)
- [Terraform README](../terraform/README.md)
- [AWS ACM Documentation](https://docs.aws.amazon.com/acm/)
- [Namecheap DNS Management](https://www.namecheap.com/support/knowledgebase/category/10196/dns-management/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Cognito Documentation](https://docs.aws.amazon.com/cognito/)

---

## Contributing

When adding new documentation:
1. Place files in this `docs/` directory
2. Use clear, descriptive filenames
3. Add entry to this README index
4. Link to related documentation
5. Include troubleshooting section
6. Provide command examples

---

**Last Updated**: Check git history for latest changes to documentation
