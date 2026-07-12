# =============================================================================
# Project Configuration
# =============================================================================

variable "project_name" {
  description = "Name of the project, used as a prefix for resource naming"
  type        = string
  default     = "checkout-ms"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "demo"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

# =============================================================================
# Networking Configuration
# =============================================================================

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# =============================================================================
# Application Configuration
# =============================================================================

variable "app_port" {
  description = "Port the NestJS application listens on"
  type        = number
  default     = 3000
}

variable "db_port" {
  description = "Port for RDS PostgreSQL"
  type        = number
  default     = 5432
}

variable "wompi_base_url" {
  description = "Base URL for the WOMPI payment gateway API"
  type        = string
  default     = "https://api-sandbox.co.uat.wompi.dev/v1"
}

# =============================================================================
# Database Configuration
# =============================================================================

variable "db_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "checkout"
}

variable "db_username" {
  description = "Master username for RDS PostgreSQL"
  type        = string
  default     = "dbadmin"
}

variable "app_db_username" {
  description = "Application runtime database username (uses IAM authentication)"
  type        = string
  default     = "app_user"
}

# =============================================================================
# Application Secrets (sensitive - set in terraform.tfvars)
# =============================================================================

variable "wompi_public_key" {
  description = "WOMPI public key for API authentication"
  type        = string
  sensitive   = true
  default     = "placeholder-change-me"
}

variable "wompi_private_key" {
  description = "WOMPI private key for API authentication"
  type        = string
  sensitive   = true
  default     = "placeholder-change-me"
}

variable "wompi_integrity_secret" {
  description = "WOMPI integrity secret for signature validation"
  type        = string
  sensitive   = true
  default     = "placeholder-change-me"
}
