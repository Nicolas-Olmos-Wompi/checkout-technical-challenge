# =============================================================================
# SSM Parameters for Application Secrets
# =============================================================================

# JWT Secret for authentication
resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "aws_ssm_parameter" "jwt_secret" {
  name        = "/${var.project_name}/${var.environment}/secrets/JWT_SECRET"
  description = "JWT secret for authentication"
  type        = "SecureString"
  value       = random_password.jwt_secret.result

  tags = {
    Name = "${var.project_name}-${var.environment}-jwt-secret"
  }
}

# WOMPI Public Key
resource "aws_ssm_parameter" "wompi_public_key" {
  name        = "/${var.project_name}/${var.environment}/secrets/WOMPI_PUBLIC_KEY"
  description = "WOMPI public key"
  type        = "SecureString"
  value       = var.wompi_public_key

  tags = {
    Name = "${var.project_name}-${var.environment}-wompi-public-key"
  }
}

# WOMPI Private Key
resource "aws_ssm_parameter" "wompi_private_key" {
  name        = "/${var.project_name}/${var.environment}/secrets/WOMPI_PRIVATE_KEY"
  description = "WOMPI private key"
  type        = "SecureString"
  value       = var.wompi_private_key

  tags = {
    Name = "${var.project_name}-${var.environment}-wompi-private-key"
  }
}

# WOMPI Integrity Secret
resource "aws_ssm_parameter" "wompi_integrity_secret" {
  name        = "/${var.project_name}/${var.environment}/secrets/WOMPI_INTEGRITY_SECRET"
  description = "WOMPI integrity secret"
  type        = "SecureString"
  value       = var.wompi_integrity_secret

  tags = {
    Name = "${var.project_name}-${var.environment}-wompi-integrity-secret"
  }
}
