# =============================================================================
# RDS PostgreSQL Instance
# =============================================================================

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}"
  description = "DB subnet group for ${var.project_name} ${var.environment}"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# Generate a random master password for RDS
resource "random_password" "db_master" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Store the master password in SSM Parameter Store
resource "aws_ssm_parameter" "db_master_password" {
  name        = "/${var.project_name}/${var.environment}/db/master-password"
  description = "Master password for RDS PostgreSQL instance"
  type        = "SecureString"
  value       = random_password.db_master.result

  tags = {
    Name = "${var.project_name}-${var.environment}-db-master-password"
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}"

  # Engine configuration
  engine         = "postgres"
  engine_version = "15.7"
  instance_class = "db.t4g.micro"

  # Storage
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_master.result
  port     = var.db_port

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # IAM database authentication
  iam_database_authentication_enabled = true

  # Maintenance and backups
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Deletion protection disabled for demo environment
  deletion_protection      = false
  skip_final_snapshot      = true
  final_snapshot_identifier = "${var.project_name}-${var.environment}-final"

  # Performance Insights (free tier available)
  performance_insights_enabled = true
  performance_insights_retention_period = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}
