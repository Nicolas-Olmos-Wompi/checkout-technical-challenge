# Epic 1: Networking & Security

**Goal:** Provision the VPC, subnets, route tables, and security groups that all other
epics depend on.

**Depends on:** Nothing — first epic.

## Task 0: Prerequisite check

- Confirm AWS CLI is configured: `aws sts get-caller-identity`
- Confirm Terraform is installed: `terraform version`

## Task 1: Terraform project scaffolding and provider setup

- Objective: Set up the base Terraform project structure with AWS provider, variables,
  and outputs conventions.
- Guidance: Create `infra/` directory with `versions.tf` (Terraform + AWS provider version
  pins), `providers.tf` (region from variable), `variables.tf` (project name, region,
  environment tag), `outputs.tf` (empty scaffold), and `terraform.tfvars.example`. Use
  consistent tagging (`Project`, `Environment`) via `default_tags` on the provider.
- Test requirement: `terraform init` succeeds; `terraform validate` passes.
- Demo: `terraform init && terraform validate` shows a clean pass with zero resources.

## Task 2: VPC and networking (public + private subnets, IGW, route tables)

- Objective: Provision a new VPC with 2 public subnets (ECS tasks + ALB) and 2 private
  subnets (RDS only), an Internet Gateway, and route tables — no NAT Gateway.
- Guidance: `aws_vpc`, `aws_subnet` x4 across 2 AZs, `aws_internet_gateway`,
  `aws_route_table` + associations for public subnets (route `0.0.0.0/0` -> IGW). Private
  subnets get a route table with local-only routes.
- Test requirement: `terraform apply` succeeds; verify via `aws ec2 describe-subnets`
  that subnets exist with correct CIDR/AZ placement.
- Demo: Apply and show the VPC, subnets, and route tables via CLI output.

## Task 3: Security groups

- Objective: Define security groups for ALB, ECS tasks, and RDS with least-privilege rules.
- Guidance: `sg_alb` (ingress on port 80 scoped appropriately for VPC Link, egress to
  `sg_ecs` on 3000); `sg_ecs` (ingress from `sg_alb` only on 3000, egress all); `sg_rds`
  (ingress from `sg_ecs` only on 5432, no egress).
- Test requirement: `terraform apply` succeeds; verify via
  `aws ec2 describe-security-groups` that all internal rules reference security group
  IDs, not open CIDRs.
- Demo: Show the three security groups and their rules, confirming RDS/ECS have zero
  public ingress.

## Handoff check for Epic 2

Run before starting Epic 2. All must pass:

```bash
# VPC exists and available
aws ec2 describe-vpcs --filters "Name=tag:Project,Values=<project>" \
  --query 'Vpcs[0].State'

# 2 public + 2 private subnets across 2 AZs
aws ec2 describe-subnets --filters "Name=vpc-id,Values=<vpc-id>" \
  --query 'Subnets[].{Id:SubnetId,AZ:AvailabilityZone,CIDR:CidrBlock,MapPublicIp:MapPublicIpOnLaunch}'

# Public route tables have 0.0.0.0/0 -> IGW; private ones don't
aws ec2 describe-route-tables --filters "Name=vpc-id,Values=<vpc-id>" \
  --query 'RouteTables[].{Id:RouteTableId,Routes:Routes[].{Dest:DestinationCidrBlock,Gw:GatewayId}}'

# sg_alb, sg_ecs, sg_rds exist with expected rule counts
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=<vpc-id>" \
  --query 'SecurityGroups[].{Name:GroupName,Id:GroupId,Ingress:length(IpPermissions)}'
```

If any check fails, stop and fix Epic 1 before proceeding to Epic 2.
