# Epic 4: Public Ingress & Docs

**Goal:** Expose the app publicly via API Gateway, verify end-to-end, and document
operational steps.

**Depends on:** Epic 3 (Compute).

## Task 1 (handoff check): Verify Epic 3 completion via AWS CLI

Run before starting any new work. All must pass:

```bash
aws ecs describe-services --cluster <cluster> --services <service> \
  --query 'services[0].{Running:runningCount,Desired:desiredCount,Status:status}'

aws elbv2 describe-target-health --target-group-arn <arn> \
  --query 'TargetHealthDescriptions[].TargetHealth.State'

aws ecs describe-task-definition --task-definition <name> \
  --query 'taskDefinition.containerDefinitions[0].{Secrets:secrets,Env:environment}'

aws ecs describe-tasks --cluster <cluster> --tasks <migration-task-arn> \
  --query 'tasks[0].containers[0].exitCode'
```

Confirm: `runningCount == desiredCount == 1`; target healthy; task def secrets/env
correct; migration task exited 0. If any check fails, stop and fix Epic 3 before
proceeding.

## Task 2: API Gateway HTTP API with VPC Link v2 to the private ALB

- Objective: Expose the app publicly via API Gateway HTTP API using a VPC Link v2
  direct integration to the ALB listener.
- Guidance: `aws_apigatewayv2_vpc_link` (public subnets), `aws_apigatewayv2_api` (HTTP),
  `aws_apigatewayv2_integration` (`HTTP_PROXY`, `connection_type = VPC_LINK`, pointing to
  ALB listener ARN), `aws_apigatewayv2_route` (`ANY /{proxy+}`), `aws_apigatewayv2_stage`
  (auto-deploy `$default`). Output invoke URL.
- Test requirement: `curl <invoke-url>/health` returns 200; test `/api` (Swagger) and a
  real business endpoint (e.g. `/products`) end-to-end.
- Demo: Full path live — public HTTPS URL serving real traffic through the entire stack.

## Task 3: Documentation and teardown safety net

- Objective: Document manual steps (image build/push, migration trigger, DB user
  bootstrap) and cost/cleanup notes.
- Guidance: Write `infra/README.md` covering prerequisites, apply order, image
  build/push commands, migration trigger CLI commands, `terraform destroy` teardown, and
  a note pointing to AWS Pricing Calculator for cost estimates (not a fixed quote).
- Test requirement: Review the README against the actual steps taken to confirm nothing
  undocumented remains.
- Demo: A newcomer can go from `git clone` to a working public URL using only the
  README and `terraform apply`.

## Final verification (end-to-end)

```bash
curl -s <invoke-url>/health
curl -s <invoke-url>/api
curl -s <invoke-url>/products
```

All should return successful responses, proving API Gateway -> VPC Link -> ALB -> ECS
-> RDS is fully operational.
