terraform {
  required_version = ">= 1.9.0"
  
  backend "s3" {
    bucket         = "become-log-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "become-log-terraform-state-lock"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "BecomeLog"
      ManagedBy   = "Terraform"
      Environment = var.environment
      Application = var.app_name
      awsApplication = var.aws_application_tag
    }
  }
}
