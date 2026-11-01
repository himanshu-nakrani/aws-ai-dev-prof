# 10 — Security Stack

Exam focus (Domain 3, 20%): who can call what, where data flows, and how sensitive data is found and protected. Guardrails (Lesson 05) are one layer in this stack, not the stack.

## IAM — least privilege for GenAI

- Scope inference permissions to specific resources: `bedrock:InvokeModel` / `bedrock:Converse` on named model or **inference profile ARNs**, not `bedrock:*` on `*`.
- Separate permissions per operation: invoking models ≠ managing knowledge bases ≠ `bedrock:ApplyGuardrail` ≠ starting ingestion jobs.
- Every Bedrock resource runs under an **execution/service role**: KB role (read S3, write vector store, call embedding model), agent role (invoke action-group Lambdas, query KBs, invoke its model). Missing role permission is the top cause of "agent/KB suddenly fails" scenarios.
- Lambda action groups also need a resource-based policy allowing the agent to invoke them.
- Guard with SCPs and permission boundaries at org scale; use **IAM Access Analyzer** to find overly broad policies and generate least-privilege policies from CloudTrail activity.

## Network isolation — VPC endpoints (PrivateLink)

- Interface endpoints for `bedrock-runtime`, `bedrock-agent-runtime`, and the Bedrock control plane keep inference traffic off the public internet; S3 uses a gateway endpoint.
- Endpoint policies further restrict which models/resources an endpoint may reach.
- Data-residency interplay: endpoints keep traffic private per region; cross-region inference profiles (Lesson 02) deliberately route across regions — a compliance tradeoff, not a free upgrade.
- Bedrock itself is a managed service outside your VPC; PrivateLink controls *your* path to it.

## KMS — encryption everywhere

- Encrypt S3 source buckets, vector stores, CloudWatch Logs, and invocation-log destinations; customer-managed keys when you need key policies, rotation control, grants, and cross-account access.
- KB/agent service roles need `kms:Decrypt`/`GenerateDataKey` on the keys protecting their data — the classic hidden cause of ingestion failures.
- Envelope encryption concept; AWS Encryption SDK for client-side encryption of especially sensitive payloads.

## Secrets and app identity

- **Secrets Manager**: Aurora credentials for KB vector stores (Lesson 08), third-party API keys for agent tools; automatic rotation. Never secrets in prompts, code, or environment plaintext.
- **Amazon Cognito**: user pools = sign-in/JWT authorization for your app and API Gateway; identity pools = temporary AWS credentials for direct client access. User authentication; IAM remains service authorization.
- **IAM Identity Center**: workforce SSO for console/CLI access (human operators, not application traffic).
- **WAF**: in front of API Gateway/CloudFront/ALB — rate limiting, managed rule groups, bot control. Stops HTTP abuse; it is **not** a prompt-injection defense (that's Guardrails + validation, Lesson 05).

## Finding sensitive data — three tools, three moments

| Tool | When | What it does |
|---|---|---|
| **Amazon Macie** | Data **at rest** in S3 | Discovers and classifies PII/sensitive data in buckets; findings for remediation before data enters a KB |
| **Amazon Comprehend** | Text **in motion**, real-time APIs | PII entity detection/redaction, entities, sentiment, custom classification — pre-filter before the FM |
| **Guardrails sensitive-info filters** | **In-flight** at the model boundary | Block/mask PII in prompts and responses (Lesson 05) |

Exam pattern: "scan the training/RAG corpus for PII before ingestion" → Macie. "Redact PII from live chat text before it reaches the model" → Comprehend or Guardrail input filter. "Ensure model responses never expose PII" → Guardrail output filter.

## Data protection facts about Bedrock itself

- Prompts/responses are **not** used to train Bedrock models; invocation logging is opt-in and goes only to your S3/CloudWatch destinations (Lesson 01).
- Audit: **CloudTrail** records API activity (who created/modified/invoked what); model invocation logs record content when enabled.
- Retention: S3 lifecycle policies expire logs/source data per policy; KB sync propagates source deletions (Lesson 03).
- Tenant isolation pattern: server-side metadata filtering (Lesson 03) + per-tenant IAM-scoped invocation where feasible + tenant-aware cache keys (Lesson 02).

## Decision rules

| Scenario | Answer |
|---|---|
| App may invoke only one model | IAM policy scoped to that model/inference-profile ARN |
| Inference must never traverse the internet | VPC interface endpoints (PrivateLink) + endpoint policies |
| Ingestion fails after bucket encryption enabled | KB role missing KMS permissions |
| Find PII across the S3 data lake | Macie |
| Detect/redact PII in real-time text | Comprehend (pre-processing) or Guardrails (at model boundary) |
| Store DB/API credentials for agents and KBs | Secrets Manager with rotation |
| End-user sign-in for the GenAI app | Cognito user pool (+ API Gateway authorizer) |
| Prove who changed a guardrail/agent and when | CloudTrail |

## Hands-on checklist

- [ ] IAM policy allowing Converse on exactly one inference profile; verify another model is denied.
- [ ] Create a `bedrock-runtime` VPC endpoint; invoke a model from a private subnet.
- [ ] Run a Macie scan (or Comprehend PII detect) over sample documents destined for a KB.
- [ ] Reproduce and fix a KMS-permission ingestion failure.

Sources: https://docs.aws.amazon.com/bedrock/latest/userguide/security.html · https://docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html · https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html
