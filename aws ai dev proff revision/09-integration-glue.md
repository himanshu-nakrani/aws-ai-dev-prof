# 09 — Integration Glue

Exam focus: the non-AI services that carry GenAI workloads. Most scenario questions are won or lost here, not on model choice.

## Lambda — the default compute glue

GenAI roles: agent action groups (Lesson 04), KB custom transformation/chunking, prompt pre/post-processing, query decomposition, stateless MCP servers, API backends, guardrail-adjacent validation.

Know cold:

- Max execution **15 minutes**; long FM/agent calls must fit or move to Step Functions/async patterns.
- Concurrency: account/regional limits, reserved concurrency (protect a critical function), provisioned concurrency (kill cold starts).
- Cold starts matter for chat latency; memory size also buys CPU.
- Synchronous (API request/response), asynchronous (SQS/EventBridge invoke, retries + DLQ), and streaming-response invocation modes.

## API Gateway — the front door

| Type | Use |
|---|---|
| REST API | Full features: request validation, usage plans, API keys, caching, WAF integration |
| HTTP API | Cheaper/simpler JWT-authorized APIs |
| WebSocket API | Server-driven streaming chat UX (with Bedrock streaming behind Lambda) |

GenAI-specific traps:

- Integration timeouts make long-running synchronous FM calls risky → stream, go async (accept → poll/notify), or orchestrate with Step Functions.
- Request validation rejects malformed input before it costs tokens.
- Throttling/usage plans protect the token budget behind the API; API keys are **not** authentication (pair with Lambda authorizer/Cognito/IAM — Lesson 10).

## Step Functions — deterministic orchestration

- **Standard** workflows: long-running (up to 1 year), exactly-once, human approval via callback task tokens. **Express**: high-volume, short (≤5 min), cheaper.
- Built-in retries/backoff, catch branches, parallel branches, Map state (fan-out over arrays), Wait states.
- GenAI patterns named in the exam guide:
  - **ReAct / chain-of-thought loops** with explicit stopping conditions (the controllable alternative to autonomous agents).
  - **Circuit breaker** + graceful degradation around FM calls.
  - Query decomposition/transformation for RAG (Lesson 03).
  - Human review/approval steps (with Amazon A2I, Lesson 12).
  - Document-processing pipelines (ingest → extract → validate → index).
- Rule: if steps are known, auditable, and need retries/approvals → Step Functions. Model decides steps → Agent (Lesson 04). Prompt-centric chaining with minimal code → Prompt Flows (Lesson 06).

## EventBridge — event plumbing

- Triggers: S3 object events → start KB sync or a processing workflow; scheduled rules for periodic sync/evaluation jobs; SaaS/application events routed to targets.
- Event buses + rules decouple producers from GenAI consumers; Schema Registry and Pipes (point-to-point with filtering/transformation, e.g., SQS→Lambda) are recognition-level.

## SQS / SNS — decouple and fan out

- **SQS**: buffer bursty inference requests so Lambda workers process at a controlled rate (protects Bedrock quotas); DLQ for poison requests; FIFO for ordered, deduplicated processing (rarely needed for chat; relevant for sequential document/event processing). Watch visibility timeout vs worst-case FM call duration.
- **SNS**: fan-out notifications — job-complete alerts, multi-consumer events. Not a queue; pair SNS→SQS per consumer for durability.

## DynamoDB — state and metadata, not vectors

GenAI roles: conversation history, session state, agent/app metadata, semantic-cache metadata, prompt/feature flags adjunct.

- Design: partition key per user/session; sort key by timestamp; **TTL** to expire sessions automatically.
- Streams → trigger downstream processing (e.g., summarize completed conversations).
- Limits that bite: 400 KB item size → long documents/full histories belong in S3 with pointers in DynamoDB.
- On-demand capacity for spiky chat workloads.

## Reference patterns

**Interactive chat**: CloudFront → API Gateway (WebSocket or REST) → Lambda → Bedrock Converse/ConverseStream (or agent) → DynamoDB session history; guardrail attached at invoke.

**Async document pipeline**: S3 upload → EventBridge → Step Functions (parse → chunk → embed → index / start KB sync) with SQS buffering and DLQ; SNS notification on completion/failure.

**Batch inference front-end**: API accepts job → S3 staging → batch inference job (Lesson 01) → EventBridge/SNS completion → results to S3.

## Decision rules

| Scenario | Answer |
|---|---|
| Fixed multi-step process with retries and approval | Step Functions (Standard) |
| Sudden request spikes exhaust Bedrock quota | SQS buffer + controlled Lambda concurrency |
| Users must be notified when long jobs finish | SNS (or EventBridge targets) |
| New document in S3 must become searchable | EventBridge → KB sync / ingestion workflow |
| Chat needs per-user conversation state with expiry | DynamoDB + TTL |
| Lightweight stateless tool for agents | Lambda MCP server (complex/long-running → ECS, Lesson 04) |

## Hands-on checklist

- [ ] WebSocket or streaming REST chat endpoint → Lambda → ConverseStream.
- [ ] SQS queue fronting a Bedrock-calling Lambda; observe throttling protection and DLQ behavior.
- [ ] Step Functions workflow: prompt → condition → second prompt, with a retry policy.
- [ ] DynamoDB session table with TTL storing conversation turns.

Sources: https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html · https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html · https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html
