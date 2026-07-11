# Epic 3: Compute

**Goal:** Define ECS compute, resolve and run database migrations, and stand up the
ECS service behind a private ALB.

**Depends on:** Epic 2 (Data & Secrets).

## Task 1 (handoff check): Verify Epic 2 completion via AWS CLI

Run before starting any new work. All must pass:

```bash
aws rds describe-db-instances --db-instance-identifier <id> \
  --query 'DBInstances[0].{Status:DBInstanceStatus,IAMAuth:IAMDatabaseAuthenticationEnabled}'

aws ecr describe-repositories --repository-names <name> \
  --query 'repositories[0].repositoryUri'

aws ssm get-parameters-by-path --path /<project>/ --recursive \
  --query 'Parameters[].Name'

aws iam get-role --role-name <execution-role-name> --query 'Role.RoleName'
aws iam list-attached-role-policies --role-name <execution-role-name>
```

Confirm: RDS `available` with IAM auth enabled; ECR repo exists; all expected SSM
parameter names present; execution role exists with expected policies. If any check
fails, stop and fix Epic 2 before proceeding.

## Task 2: ECS cluster, task definition, and task role

- Objective: Define the ECS cluster and Fargate task definition, injecting SSM secrets,
  granting `rds-db:connect` for IAM auth.
- Guidance: `aws_ecs_cluster`, `aws_ecs_task_definition` (Fargate, 256 CPU/512MB,
  container port 3000, `secrets` block per SSM parameter, log group with 7-day
  retention). Separate task role with `rds-db:connect` scoped to the RDS resource ARN.
- Test requirement: `aws ecs describe-task-definition` confirms secrets/env correctly
  mapped.
- Demo: Registered, inspectable task definition — nothing running yet.

## Task 3: Resolve migration execution mechanism and bootstrap the database

- Objective: Decide how migrations run given the production Dockerfile's
  `npm ci --omit=dev` (typeorm CLI/ts-node unavailable in the deployed image) — e.g., a
  dedicated migration build stage/image, or a bundled compiled migration runner. Run
  migrations via a one-off Fargate task, and create `app_user` with `GRANT rds_iam`
  using master credentials from SSM.
- Guidance: Reuse the Task 2 task definition with a command override, or add a
  migration-specific image variant. Trigger via `aws ecs run-task`.
- Test requirement: `npm run migration:show` (run through the same mechanism) shows all
  migrations executed; verify `app_user` has `rds_iam` role via SQL query; confirm via
  `aws ecs describe-tasks` that the run-task exited with code 0.
- Demo: Database schema fully migrated and seeded; `app_user` ready for IAM auth.

## Task 4: ECS service wired to a private ALB

- Objective: Create the private ALB, target group, listener, and ECS service.
- Guidance: `aws_lb` (`internal = true`, public subnets, `sg_alb`), `aws_lb_target_group`
  (port 3000, health check `/health`), `aws_lb_listener` (port 80), `aws_ecs_service`
  (`desired_count = 1`, public subnets, `assign_public_ip = true`, `sg_ecs`, linked to
  target group).
- Test requirement: `aws ecs describe-services` shows `runningCount = 1`;
  `aws elbv2 describe-target-health` shows `healthy`.
- Demo: The NestJS app running in ECS, healthy behind the ALB — first real proof of
  life, not yet public.

## Handoff check for Epic 4

Run before starting Epic 4. All must pass:

```bash
# ECS service running and matches desired count
aws ecs describe-services --cluster <cluster> --services <service> \
  --query 'services[0].{Running:runningCount,Desired:desiredCount,Status:status}'

# Target group shows healthy
aws elbv2 describe-target-health --target-group-arn <arn> \
  --query 'TargetHealthDescriptions[].TargetHealth.State'

# Task definition secrets/env correctly wired
aws ecs describe-task-definition --task-definition <name> \
  --query 'taskDefinition.containerDefinitions[0].{Secrets:secrets,Env:environment}'

# Last migration one-off task exited 0
aws ecs describe-tasks --cluster <cluster> --tasks <migration-task-arn> \
  --query 'tasks[0].containers[0].exitCode'
```

If any check fails, stop and fix Epic 3 before proceeding to Epic 4.
