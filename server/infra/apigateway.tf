# =============================================================================
# Security Group - VPC Link (API Gateway -> ALB)
# =============================================================================

resource "aws_security_group" "vpc_link" {
  name        = "${var.project_name}-${var.environment}-sg-vpclink"
  description = "Security group for API Gateway VPC Link ENIs"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-sg-vpclink"
  }
}

resource "aws_security_group_rule" "vpc_link_egress_alb" {
  type                     = "egress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.vpc_link.id
  description               = "Allow outbound to ALB on port 80"
}

# =============================================================================
# API Gateway HTTP API
# =============================================================================

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-${var.environment}"
  protocol_type = "HTTP"

  tags = {
    Name = "${var.project_name}-${var.environment}-api"
  }
}

# =============================================================================
# VPC Link v2 (public subnets, so API Gateway can reach the internal ALB)
# =============================================================================

resource "aws_apigatewayv2_vpc_link" "main" {
  name               = "${var.project_name}-${var.environment}"
  security_group_ids = [aws_security_group.vpc_link.id]
  subnet_ids         = aws_subnet.public[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-vpclink"
  }
}

# =============================================================================
# Integration: HTTP_PROXY to the ALB listener via VPC Link
# =============================================================================

resource "aws_apigatewayv2_integration" "alb" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.main.id
  integration_uri    = aws_lb_listener.main.arn
}

# =============================================================================
# Route: forward everything to the ALB
# =============================================================================

resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.alb.id}"
}

resource "aws_apigatewayv2_route" "root" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /"
  target    = "integrations/${aws_apigatewayv2_integration.alb.id}"
}

# =============================================================================
# Stage: $default with auto-deploy
# =============================================================================

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  tags = {
    Name = "${var.project_name}-${var.environment}-stage"
  }
}
