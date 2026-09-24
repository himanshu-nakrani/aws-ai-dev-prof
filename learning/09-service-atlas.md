---
title: Service atlas and decision tables
source: src/content/services.html
group: Reference
---

# Service atlas and decision tables

> **Info — How to use this page**
>
> Reference, not reading. Every service that plausibly appears in an AIP-C01 scenario, what it does, and — the part that actually earns marks — **what it is confused with**. Come back here when a practice question uses a service name you cannot place.

## 1. Amazon Bedrock and its capabilities

| Capability | What it does | Signals in a question |
| --- | --- | --- |
| **Foundation model APIs** | Serverless access to Anthropic, Amazon, Meta, Mistral, Cohere, AI21, Stability models through one interface | "multiple model providers", "managed", "no infrastructure" |
| **Converse API** | Unified messages, system prompt, inference config and tool use across providers | "swap models without rewriting", "portability" |
| **Knowledge Bases** | Managed RAG: ingest, parse, chunk, embed, store, retrieve, generate with citations | "RAG with least operational overhead", "citations" |
| **Agents** | Managed agent loop with action groups, Return of Control, memory, code interpreter, multi-agent collaboration | "the model decides which tools to call" |
| **AgentCore** | Production primitives for agents you build: Runtime, Memory, Gateway, Identity, Code Interpreter, Browser, Observability (plus Policy, Evaluations, Registry, Payments) | "our own framework", "long-running", "memory across sessions", "non-human identity" |
| **Guardrails** | Content filters, denied topics, word filters, PII, contextual grounding, Automated Reasoning checks, image filters. Plus `ApplyGuardrail` for non-Bedrock text | "safety", "block", "redact", "prevent hallucination", "provable" |
| **Flows** | Low-code visual workflow: prompts, KBs, agents, Lambda, conditions, iterators. Versioned | "visual", "low-code", "non-engineers iterate" |
| **Prompt Management** | Versioned prompts decoupled from deployments | "change the prompt without a deploy" |
| **Evaluations** | Automatic metrics, LLM-as-a-judge, human workflows, and RAG evaluation scoring retrieval and generation separately | "compare models on our own data", "measure RAG quality" |
| **Data Automation (BDA)** | Multimodal extraction from documents, images, audio, video | "scanned PDFs", "tables and figures", "mixed media" |
| **Batch inference** | Async bulk processing via S3 JSONL, ~50% of on-demand | "overnight", "backlog", "no human waiting" |
| **Provisioned Throughput** | Dedicated capacity in model units, 1- or 6-month commitment; required for custom models | "guaranteed throughput", "predictable latency", "custom model" |
| **Cross-region inference profiles** | Route invocations across regions for throughput and resilience | "throttling", "burst" — and the residency trap |
| **Application inference profiles** | Tagged profiles for cost and usage attribution | "which team is spending what" |
| **Intelligent Prompt Routing** | Managed routing between smaller and larger models by predicted complexity | "cut cost while keeping quality" |
| **Prompt caching** | Discounted, faster reuse of a stable prompt prefix | "the same large system prompt on every call" |
| **Model customisation** | Fine-tuning, continued pre-training, distillation, Custom Model Import | "specific tone / behaviour", "our own weights" |

## 2. The pairs the exam deliberately confuses

| This | Not this | The distinction |
| --- | --- | --- |
| **Amazon Bedrock** | Amazon SageMaker AI | Bedrock = managed FM API and building blocks. SageMaker = full ML platform where you run the infrastructure. Choose SageMaker only when Bedrock genuinely cannot do it. |
| **Amazon Q Business** | Amazon Q Developer | Q Business = enterprise knowledge assistant for end users. Q Developer = coding assistant in the IDE and CLI. |
| **Amazon Q Business** | Bedrock Knowledge Bases | Q Business is a finished product you configure. Knowledge Bases is a component you build with. "Minimal development effort, give staff a chat assistant" → Q Business. |
| **Amazon Macie** | Amazon Comprehend | Macie discovers sensitive data at rest in S3. Comprehend detects and redacts PII in text you send it. |
| **CloudTrail** | Model invocation logging | CloudTrail = who called what, when. Invocation logging = the actual prompt and completion content. |
| **Cross-region inference profile** | Application inference profile | Throughput and resilience across regions, versus cost attribution per application. |
| **Prompt caching** | Semantic caching | Prompt caching discounts a repeated input prefix (Bedrock feature). Semantic caching returns a stored *answer* for a similar question (you build it). |
| **Contextual grounding check** | Automated Reasoning checks | Learned probabilistic support score, versus formal logical verification against a policy. |
| **Bedrock Agents** | AgentCore | A managed agent, versus production infrastructure for agents you build yourself. |
| **Knowledge base web crawler** | AgentCore Browser | Bulk ingestion of page content, versus interactive navigation and form filling. |
| **Denied topics** | Word filters | Semantic subject matching from a definition, versus exact literal strings. |
| **Bedrock Flows** | AWS Step Functions | Low-code Bedrock-native chaining, versus a general-purpose state machine with rich retries and long-running execution. |
| **Titan Text Embeddings** | Titan Text | Embeddings produce vectors. Text models generate text. Different jobs entirely. |

## 3. Supporting services and their role here

| Service | Role in a generative AI workload | Limit or detail worth knowing |
| --- | --- | --- |
| **Amazon S3** | Source documents, batch input/output, long-term log retention | Object Lock for immutable retention; lifecycle tiering for cheap multi-year storage |
| **Amazon S3 Vectors** | Low-cost vector storage for large, cold corpora | Metadata size limits can bite with large hierarchical parent chunks |
| **Amazon OpenSearch Serverless** | Default vector store; supports hybrid dense + BM25 search | Continuous OCU cost even when idle |
| **Amazon OpenSearch Managed Cluster** | Vector store with full control over sizing | You operate the cluster |
| **Aurora PostgreSQL (pgvector)** | Vectors beside relational data | You own the distance metric and index parameters — a common cause of silent quality loss after migration |
| **Amazon Neptune Analytics** | GraphRAG — entities and relationships plus vectors | For multi-hop questions no single chunk can answer |
| **AWS Lambda** | API backends, action group implementations, custom chunking transformations | **15-minute maximum.** Supports response streaming via function URLs |
| **Amazon API Gateway** | Auth, throttling, usage plans; WebSocket for streaming | ~29-second REST integration timeout — the reason long generations need streaming or async |
| **AWS Step Functions** | Deterministic orchestration, per-step retries, human approval via task tokens | Standard workflows run up to a year |
| **Amazon SQS** | Decouple spiky traffic from Bedrock; retries and DLQ | The answer to "must not drop requests" |
| **Amazon EventBridge** | Event routing; notifying clients when async work finishes |  |
| **AWS AppConfig** | Externalised model IDs and feature flags with validated gradual rollout | Automatic rollback on a CloudWatch alarm — the safe model-swap pattern |
| **Amazon CloudWatch** | Metrics, logs, alarms, dashboards | Log group **data protection policies** mask sensitive patterns |
| **AWS X-Ray** | Distributed tracing across the request path | Pairs with agent traces and AgentCore Observability |
| **AWS CloudTrail** | API audit; anomaly detection on model usage | Records the call, not the prompt |
| **AWS IAM** | Who may invoke which models, where; condition keys for mandatory guardrails | The actual enforcement layer for Domain 3 |
| **AWS KMS** | Customer managed keys for KBs, custom models, vectors, logs | Revocable control plus CloudTrail on every key use |
| **AWS Secrets Manager** | Credentials for tools and external APIs | Never put secrets in a prompt or a tool description |
| **VPC / PrivateLink** | Private path to Bedrock plus an endpoint policy | Preferred over NAT when "no internet path" is the requirement |
| **AWS WAF** | Rate-based rules against denial-of-wallet attacks |  |
| **AWS Glue / Glue Data Quality** | ETL and quality rules upstream of ingestion | Not an embedding or retrieval service |
| **AWS Lake Formation** | Fine-grained governance over the data lake | Column and row level permissions |
| **Amazon Macie** | Sensitive data discovery in S3 | Discovery, not in-line redaction |
| **Amazon Comprehend** | PII detection and redaction in text | In-line, per document |
| **Amazon SageMaker Clarify** | Bias metrics and explainability; FM evaluations | The "prove fairness" answer |
| **Amazon SageMaker AI** | Host models Bedrock does not offer; full training control | JumpStart for open models |
| **AWS Cost Explorer** | Analyse and attribute Bedrock spend, broken down per application inference profile | The in-scope cost-analysis tool — AWS Budgets is out of scope for the exam |
| **AWS Cost Anomaly Detection** | Automatic alerts on unexpected spend spikes | The in-scope way to catch a runaway bill before month-end |
| **AWS Organizations / SCPs** | Preventive guardrails: region restrictions, protecting guardrail resources | Preventive, unlike CloudWatch alarms |

## 4. Limits and defaults that decide architectures

| Limit | Value | Consequence |
| --- | --- | --- |
| Lambda maximum execution | 15 minutes | Long agent runs go to AgentCore Runtime, Fargate or Step Functions |
| API Gateway REST integration timeout | ~29 seconds | Long generations need streaming or an async pattern |
| Bedrock quotas | Per model, per region (RPM and TPM) | Cross-region profiles, quota increases, Provisioned Throughput |
| KB fixed chunking default | 300 tokens, 20% overlap | A starting point, not a decision |
| Embedding model input limit | Per model token cap | Chunks over the limit are truncated — silently |
| Batch inference completion | Asynchronous, typically within hours | Never for interactive workloads |
| Provisioned Throughput commitment | 1 month or 6 months | Longer term, lower effective rate; a real financial commitment |
| Model access | Enabled per model, per region | Region-specific AccessDenied is often just this, not IAM |

Quotas and defaults change. Confirm against current AWS documentation before relying on any of these in production.

## 5. Two more decision helpers

> **Interactive widget (`dtree`)** — Which AWS service for this AI requirement?
>
> Interactive decision tree (full tree expanded below). Playable in the HTML study site.
>
> **Decision tree — Which AWS service for this AI requirement?**
>
> - What is the team actually trying to produce?
>   - **A finished assistant for employees over internal content**
>     - Do they want to build it, or buy and configure it?
>       - **Buy and configure — minimal development** → **Amazon Q Business**
>         Connectors to SharePoint, Confluence, S3 and more; an assistant UI; admin controls. When a stem says minimal development effort for an internal knowledge assistant, this is the answer and Bedrock is the over-engineered distractor.
>       - **Build it — we need it embedded in our own product** → **Bedrock Knowledge Bases + Converse**
>         Managed RAG as a component, with your own UI, your own auth and your own prompt. Add a guardrail with a contextual grounding check.
>   - **A coding assistant for our engineers** → **Amazon Q Developer**
>     IDE and CLI coding assistance. Do not confuse it with Q Business — the exam tests this distinction directly.
>   - **A generative feature inside our own application**
>     - Does the model need to take actions, or just answer?
>       - **Just answer, grounded in our documents** → **Bedrock Knowledge Bases + RetrieveAndGenerate + Guardrails**
>         Managed RAG with citations, plus a guardrail with a contextual grounding check to catch unsupported answers before users see them.
>       - **Take actions — call APIs, look things up, make changes** → **Bedrock Agents, or AgentCore if you need your own framework**
>         Action groups backed by least-privilege Lambdas, or Return of Control when execution must stay in your environment. Bound every tool, and gate consequential actions behind human approval.
>   - **Run a model Bedrock does not offer**
>     - Is it a supported open architecture whose weights you hold?
>       - **Yes** → **Bedrock Custom Model Import**
>         Brings your weights into the Bedrock API so you keep one API surface, one IAM model and one set of guardrails. Served via Provisioned Throughput.
>       - **No — custom architecture or full training control needed** → **Amazon SageMaker AI**
>         Full control over training and hosting. More operational work, which is the trade you are consciously making.

> **Interactive widget (`dtree`)** — Retrieval is not working — what do I change?
>
> Interactive decision tree (full tree expanded below). Playable in the HTML study site.
>
> **Decision tree — Retrieval is not working — what do I change?**
>
> - What exactly is going wrong?
>   - **Exact codes, IDs or part numbers are never found** → **Enable hybrid search**
>     Dense embeddings encode meaning, and a rare alphanumeric token has almost none to encode. BM25 keyword matching handles it. This is the textbook hybrid-search scenario and it appears verbatim in exam stems.
>   - **The right passage comes back but the answer misses nearby context** → **Hierarchical chunking**
>     Search small children for precision, return large parents for context. Alternatively increase chunk size or overlap, but hierarchical is the purpose-built answer.
>   - **Relevant chunks are in the results but ranked below noise** → **Add reranking**
>     Over-fetch 25, re-score with a cross-encoder that reads query and passage together, keep the best 5. Improves precision AND reduces tokens sent — rare to get both.
>   - **Answers cite documents from the wrong tenant, date or department** → **Metadata filtering, derived from the authenticated principal**
>     Attach attributes via .metadata.json sidecars and filter at query time. Derive the filter value from the authenticated caller inside one shared retrieval wrapper — never from client input.
>   - **Scanned PDFs and tables produce garbled results** → **Advanced parsing: FM parsing or Bedrock Data Automation**
>     This is a parse-time failure. If ingestion scrambled the table, every downstream stage works on garbage. No amount of retrieval tuning helps.
>   - **Questions spanning several documents about relationships fail** → **GraphRAG with Neptune Analytics**
>     No single chunk contains the answer, so similarity search cannot find it. A graph lets traversal connect entities across documents.
>   - **A query in one language cannot find documents in another** → **Multilingual embedding model (and re-index), or translate the query first**
>     Cross-lingual retrieval needs a shared embedding space. Re-indexing is the thorough fix; translating the query before embedding is the cheap one.
