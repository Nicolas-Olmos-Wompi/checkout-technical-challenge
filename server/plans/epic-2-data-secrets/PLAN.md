# Epic 2: Data & Secrets

**Goal:** Provision RDS, ECR, SSM parameters, and the ECS task execution role.

**Depends on:** Epic 1 (Networking & Security).

## Task 1 (handoff check): Verify Epic 1 completion via AWS CLI

Run before starting any new work. All must pass:

```bash
aws ec2 describe-vpcs --filters "Name=tag:Project,Values=<project>" \
  --query 'Vpcs[0].State'

aws ec2 describe-subnets --filters "Name=vpc-id,Values=<vpc-id>" \
  --query 'Subnets[].{Id:SubnetId,AZ:AvailabilityZone,CIDR:CidrBlock}'

aws ec2 describe-route-tables --filters "Name=vpc-id,Values=<vpc-id>" \
  --query 'RouteTables[].{Id:RouteTableId,Routes:Routes[].{Dest:DestinationCidrBlock,Gw:GatewayId}}'

aws ec2 describe-security-groups --filters "Name=vpc-id,Values=<vpc-id>" \
  --query 'SecurityGroups[].{Name:GroupName,Id:GroupId}'
```

Confirm: VPC `available`; 2 public + 2 private subnets across 2 AZs; public route tables
have an IGW route, private ones don't; `sg_alb`/`sg_ecs`/`sg_rds` exist with expected rule
counts. If any check fails, stop and fix Epic 1 before proceeding.

## Task 2: RDS PostgreSQL instance with IAM auth enabled

- Objective: Provision RDS Postgres (single-AZ, `db.t4g.micro`) in private subnets with
  IAM database authentication enabled and a generated master password stored in SSM.
- Guidance: `aws_db_subnet_group` (private subnets), `random_password` for master
  password, `aws_ssm_parameter` (SecureString) to store it, `aws_db_instance` with
  `iam_database_authentication_enabled = true`, `vpc_security_group_ids = [sg_rds]`,
  `publicly_accessible = false`, `skip_final_snapshot = true`.
- Test requirement: `aws rds describe-db-instances` shows
  `IAMDatabaseAuthenticationEnabled: true`, status `available`.
- Demo: RDS instance running, private, IAM-auth-enabled.

## Task 3: ECR repository

- Objective: Create the ECR repository for the app image.
- Guidance: `aws_ecr_repository`, `image_tag_mutability = "MUTABLE"`,
  `scan_on_push = true`. Output the repository URL.
- Test requirement: Manually build/tag/push the existing `Dockerfile` to the new repo;
  confirm via `aws ecr describe-images`.
- Demo: A real image pushed to ECR, visible via CLI.

## Task 4: SSM parameters for app secrets and ECS task execution role

- Objective: Store app secrets (JWT_SECRET, WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY,
  WOMPI_INTEGRITY_SECRET) in SSM, and create the ECS task execution role.
- Guidance: `aws_ssm_parameter` (SecureString) per secret via sensitive tfvars.
  `aws_iam_role` for execution role with `AmazonECSTaskExecutionRolePolicy` plus inline
  `ssm:GetParameters` scoped to the specific parameter ARNs.
- Test requirement: `aws ssm get-parameters-by-path` confirms parameter names exist;
  `aws iam get-role-policy` confirms scoped policy.
- Demo: Secrets encrypted in SSM; execution role scoped correctly — no ECS running yet.

## Handoff check for Epic 3

Run before starting Epic 3. All must pass:

```bash
# RDS available with IAM auth enabled
aws rds describe-db-instances --db-instance-identifier <id> \
  --query 'DBInstances[0].{Status:DBInstanceStatus,IAMAuth:IAMDatabaseAuthenticationEnabled}'

# ECR repo exists
aws ecr describe-repositories --repository-names <name> \
  --query 'repositories[0].repositoryUri'

# All expected SSM parameter names present
aws ssm get-parameters-by-path --path /<project>/ --recursive \
  --query 'Parameters[].Name'

# Execution role exists with expected policies
aws iam get-role --role-name <execution-role-name> --query 'Role.RoleName'
aws iam list-attached-role-policies --role-name <execution-role-name>
```

If any check fails, stop and fix Epic 2 before proceeding to Epic 3.
