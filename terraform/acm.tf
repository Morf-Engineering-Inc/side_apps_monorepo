# ACM Certificate must be in us-east-1 for CloudFront
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project        = "BecomeLog"
      ManagedBy      = "Terraform"
      Environment    = var.environment
      Application    = var.app_name
      awsApplication = var.aws_application_tag
    }
  }
}

resource "aws_acm_certificate" "domain" {
  provider          = aws.us_east_1 # CloudFront requires certs in us-east-1
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name                             = "${var.app_name}-certificate"
    "${var.aws_application_tag_key}" = var.aws_application_tag
  }
}
