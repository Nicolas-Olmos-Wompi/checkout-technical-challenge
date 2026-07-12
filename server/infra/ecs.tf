# =============================================================================
# ECS Cluster
# =============================================================================

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

# =============================================================================
# CloudWatch Log Group
# =============================================================================

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-logs"
  }
}

# =============================================================================
# ECS Task Definition
# =============================================================================

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-${var.environment}-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "${aws_ecr_repository.app.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = var.app_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "APP_ENV"
          value = "prod"
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "PORT"
          value = tostring(var.app_port)
        },
        {
          name  = "DB_HOST"
          value = aws_db_instance.main.address
        },
        {
          name  = "DB_PORT"
          value = tostring(var.db_port)
        },
        {
          name  = "DB_NAME"
          value = var.db_name
        },
        {
          name  = "DB_USERNAME"
          value = var.app_db_username
        },
        {
          name  = "DB_AUTH_MECHANISM"
          value = "IAM_AUTH"
        },
        {
          name  = "DB_PASSWORD"
          value = "unused-iam-auth"
        },
        {
          name  = "WOMPI_BASE_URL"
          value = var.wompi_base_url
        }
      ]
      secrets = [
        {
          name      = "JWT_SECRET"
          valueFrom = aws_ssm_parameter.jwt_secret.arn
        },
        {
          name      = "WOMPI_PUBLIC_KEY"
          valueFrom = aws_ssm_parameter.wompi_public_key.arn
        },
        {
          name      = "WOMPI_PRIVATE_KEY"
          valueFrom = aws_ssm_parameter.wompi_private_key.arn
        },
        {
          name      = "WOMPI_INTEGRITY_SECRET"
          valueFrom = aws_ssm_parameter.wompi_integrity_secret.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "app"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:${var.app_port}/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-${var.environment}-app-task"
  }
}

# =============================================================================
# ECS Task Definition for Migrations
# =============================================================================

resource "aws_ecs_task_definition" "migration" {
  family                   = "${var.project_name}-${var.environment}-migration"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "migration"
      image     = "${aws_ecr_repository.app.repository_url}:migration"
      essential = true
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "APP_ENV"
          value = "prod"
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "DB_HOST"
          value = aws_db_instance.main.address
        },
        {
          name  = "DB_PORT"
          value = tostring(var.db_port)
        },
        {
          name  = "DB_NAME"
          value = var.db_name
        },
        {
          name  = "DB_USERNAME"
          value = var.db_username
        },
        {
          name  = "DB_AUTH_MECHANISM"
          value = "PASSWORD"
        }
      ]
      secrets = [
        {
          name      = "DB_PASSWORD"
          valueFrom = aws_ssm_parameter.db_master_password.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "migration"
        }
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-${var.environment}-migration-task"
  }
}

# =============================================================================
# ECS Service
# =============================================================================

resource "aws_ecs_service" "main" {
  name                    = "${var.project_name}-${var.environment}"
  cluster                 = aws_ecs_cluster.main.id
  task_definition         = aws_ecs_task_definition.app.arn
  desired_count           = 1
  launch_type             = "FARGATE"
  enable_execute_command  = true

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "app"
    container_port   = var.app_port
  }

  depends_on = [
    aws_lb_listener.main
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-service"
  }
}
