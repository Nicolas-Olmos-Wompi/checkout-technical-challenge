# =============================================================================
# Security Group - ALB (Application Load Balancer)
# Receives traffic from API Gateway VPC Link, forwards to ECS tasks
# =============================================================================

resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-sg-alb"
  description = "Security group for the internal ALB"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-sg-alb"
  }
}

resource "aws_security_group_rule" "alb_ingress_vpc" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = [aws_vpc.main.cidr_block]
  security_group_id = aws_security_group.alb.id
  description       = "Allow HTTP from VPC (API Gateway VPC Link)"
}

resource "aws_security_group_rule" "alb_egress_ecs" {
  type                     = "egress"
  from_port                = var.app_port
  to_port                  = var.app_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs.id
  security_group_id        = aws_security_group.alb.id
  description              = "Allow outbound to ECS tasks on app port"
}

# =============================================================================
# Security Group - ECS Tasks
# Receives traffic only from ALB, has outbound access for Wompi API and AWS APIs
# =============================================================================

resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-${var.environment}-sg-ecs"
  description = "Security group for ECS Fargate tasks"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-sg-ecs"
  }
}

resource "aws_security_group_rule" "ecs_ingress_alb" {
  type                     = "ingress"
  from_port                = var.app_port
  to_port                  = var.app_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
  description              = "Allow traffic from ALB only"
}

resource "aws_security_group_rule" "ecs_egress_all" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.ecs.id
  description       = "Allow all outbound (Wompi API, AWS APIs, etc.)"
}

# =============================================================================
# Security Group - RDS (PostgreSQL)
# Receives traffic only from ECS tasks, no outbound access
# =============================================================================

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-sg-rds"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-sg-rds"
  }
}

resource "aws_security_group_rule" "rds_ingress_ecs" {
  type                     = "ingress"
  from_port                = var.db_port
  to_port                  = var.db_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs.id
  security_group_id        = aws_security_group.rds.id
  description              = "Allow PostgreSQL from ECS tasks only"
}

# RDS does not need egress rules (database doesn't initiate connections)
