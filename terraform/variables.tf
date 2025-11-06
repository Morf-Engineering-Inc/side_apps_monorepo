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
