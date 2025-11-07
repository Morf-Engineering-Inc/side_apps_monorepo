variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "test"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "become-log"
}

variable "aws_application_tag" {
  description = "AWS Application tag for resource grouping"
  type        = string
  default     = ""
}

variable "aws_application_tag_key" {
  description = "AWS Application tag key for resource grouping"
  type        = string
  default     = "awsApplication"
}

variable "domain_name" {
  description = "Custom domain name"
  type        = string
  default     = "trueorient.life"
}

variable "create_route53_zone" {
  description = "Whether to create a new Route53 hosted zone"
  type        = bool
  default     = false # Set to false since DNS is managed on Namecheap
}
