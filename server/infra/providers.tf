provider "aws" {
  region  = var.aws_region
  profile = "personal"

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
