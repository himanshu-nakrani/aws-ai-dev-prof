---
title: The cram sheet
source: src/content/cheatsheet.html
group: Reference
---

# The cram sheet

> **Exam — The last-week page**
>
> Not for learning — for keeping distinctions sharp. Everything here is compressed to the point where it only makes sense if you have read the modules. Printable: use your browser's print function and the navigation drops away.

## 1. Exam facts

**AIP-C01** · 75 questions (65 scored + 10 unscored) · 180 minutes · $300 · scaled 100–1000, **750 to pass** · compensatory scoring · 3 years validity · Pearson VUE or online proctored · no prerequisites.

**Weights:** D1 31% · D2 26% · D3 20% · D4 12% · D5 11%. D1+D2 = 57%.

**Pacing:** 2.4 min/question. Target 25/hour. Flag and move on after 90 seconds. Never leave a blank.

## 2. Keyword → answer instincts

| Stem says | Answer |
| --- | --- |
| Exact part numbers / error codes / SKUs not found | **Hybrid search** |
| Right passage retrieved, answer lacks surrounding context | **Hierarchical chunking** |
| Relevant chunks present but ranked below noise | **Reranking** (over-fetch, re-score, keep k) |
| Multi-hop / relationships across documents | **GraphRAG** (Neptune Analytics) |
| Scanned PDFs, tables, figures garbled | **Advanced parsing** — FM parsing or Bedrock Data Automation |
| Cross-tenant / date / department leakage | **Metadata filtering** from the authenticated principal, or separate KBs |
| Knowledge changes daily/weekly | **RAG**, never fine-tuning |
| Specific tone / format / task behaviour | **Fine-tuning** — after prompting and few-shot |
| Need citations / auditability | **RAG with citations** + model invocation logging |
| "Provable" / formal verification / must not contradict policy | **Automated Reasoning checks** |
| Prevent hallucination in RAG | **Contextual grounding check** + "answer only from passages" + escape hatch |
| No human waiting / overnight / backlog | **Batch inference** (~50% off) |
| Guaranteed throughput / predictable latency / custom model | **Provisioned Throughput** |
| Bursty traffic, throttling | Backoff+jitter → **cross-region inference profile** → quota increase → PT |
| Must not leave region X | Regional endpoint, check model availability, **no cross-region profile** |
| Execution must stay in our environment | **Return of Control** |
| Human approval before the action | Return of Control, or Step Functions **task token** |
| Fixed process, per-step retries, auditable, long-running | **Step Functions**, not an agent |
| Low-code visual chaining inside Bedrock | **Bedrock Flows** |
| Long-running agent beyond 15 minutes | **AgentCore Runtime** |
| Memory across sessions and days | **AgentCore Memory** |
| Agent acts on user's behalf against SaaS via OAuth | **AgentCore Identity** |
| Turn existing APIs into agent tools | **AgentCore Gateway** |
| Prevent a developer disabling the guardrail | **IAM condition key** `bedrock:GuardrailIdentifier` + **SCP** |
| Same large system prompt on every call | **Prompt caching** |
| 80% of traffic is simple, cost must fall | **Model routing / right-sizing** (or Intelligent Prompt Routing) |
| Frontier quality, huge volume, tight budget | **Distillation** |
| Cost tripled, request volume flat | **Input token growth** — check per-profile token metrics |
| Which team is spending what | **Application inference profiles** (tagged) |
| Minimal development effort, internal chat assistant | **Amazon Q Business** |
| Screen a non-Bedrock model's output with our policy | **ApplyGuardrail** API |
| One policy enforced across all accounts | **Cross-account guardrails** via Organizations |
| Spiky traffic, must not drop requests | **SQS** + worker |
| Long generation times out at API Gateway | **Stream**, or go **async** |
| Answer quality: retrieval or generation? | Low ctx-relevance → retrieval. Low faithfulness → generation |

> **Warning — Two options that are always wrong**
>
> **1. A prompt instruction as a security control.** "Instruct the model not to reveal restricted data" is never the answer to an authorisation question.
>
> **2. An absolute.** "Guarantees", "eliminates all", "always", "never fails". Real engineering answers have trade-offs.

## 3. Chunking

| Strategy | Mechanism | Fixes |
| --- | --- | --- |
| Fixed-size (default 300 tok / 20% overlap) | Every N tokens, tail repeated at next head | Baseline |
| Semantic | Cut where sentence-similarity drops below a breakpoint | Chunks mixing unrelated topics |
| **Hierarchical** | **Search children, return parents** | **Answer lacks surrounding context** |
| None | One file = one chunk | FAQ entries, product records being fragmented |
| Custom Lambda | Your logic, pre-embedding | Boilerplate stripping, computed metadata |

**Overlap:** buys resilience at boundaries; costs storage and fills top-k with near-duplicates. 20% is a reasonable default.

**Embedding model change ⇒ full re-index.** One-way door.

## 4. Vector stores

| Store | Pick it for |
| --- | --- |
| OpenSearch Serverless | Default. Managed, fast, hybrid search. Continuous OCU cost |
| S3 Vectors | Huge, cold, cost-sensitive. Watch metadata size limits with big parent chunks |
| Aurora pgvector | Vectors beside relational data. You own distance metric + index params |
| Neptune Analytics | GraphRAG |
| OpenSearch Managed Cluster | Existing estate, full sizing control |
| Pinecone / MongoDB Atlas / Redis | Existing third-party investment |

## 5. Guardrails

| Policy | Catches |
| --- | --- |
| Content filters | Hate, insults, sexual, violence, misconduct, **prompt attacks**. Strength per category, per direction |
| Denied topics | Subject areas, matched **semantically** from definition + examples |
| Word filters | Exact strings + managed profanity list |
| Sensitive information | PII entities + custom regex. Actions: **BLOCK** or **ANONYMIZE** |
| Contextual grounding | Grounding + relevance scores vs retrieved passages. *Probabilistic* |
| Automated Reasoning | Formal logic verification: **verified / contradicted / indeterminate** |
| Image / multimodal | Harmful content in image input and output |

Evaluated **twice**: input (before the model, so not billed) and output. `ApplyGuardrail` works with no model call. Cross-account enforcement via Organizations. Standard vs Classic tier — Standard is better, same price.

## 6. Agents and orchestration

|  | Agent | Flows | Step Functions | Lambda |
| --- | --- | --- | --- | --- |
| Path decided by | Model, at runtime | You, visually | You, state machine | You, code |
| Deterministic | No | Yes | Yes | Yes |
| Long-running | No | No | Yes | 15 min |
| Per-step retries | Limited | Basic | Rich | DIY |
| Human gate | Return of Control | Limited | Task token | DIY |

**AgentCore:** Runtime (long-running, isolated) · Memory (short + long term) · Gateway (APIs → tools, MCP) · Identity (OAuth/API keys/SigV4 for non-human callers) · Code Interpreter (sandbox) · Browser (headless) · Observability (metrics + traces). Also Policy, Evaluations, Registry, Payments.

**Agent loops** ⇐ unusable tool results, or ambiguous/overlapping tool descriptions. Fix descriptions, return structured errors, bound iterations, read the **trace**.

## 7. Cost and performance

**Levers, ranked:** model right-sizing/routing (biggest by far) → batch (−50%) → prompt caching → distillation → reranking/lower top-k → semantic caching → output format.

**Prompt caching** = discounted repeated input *prefix*. **Semantic caching** = stored *answer* for a similar question (you build it; too loose a threshold serves confidently wrong answers).

**Throttling ladder:** backoff+jitter → cross-region profile → quota increase → Provisioned Throughput. Batch anything non-interactive.

**Latency:** input length → TTFT. Output length → total duration. Streaming changes perception, not cost. Long p99 tail = some requests have huge inputs; cap the context budget.

**Provisioned Throughput** also chosen for non-cost reasons: guaranteed throughput, predictable latency, and it is *required* for custom models.

## 8. Testing and diagnosis

| Ctx relevance | Faithfulness | Diagnosis | Fix |
| --- | --- | --- | --- |
| LOW | HIGH | Retrieval failure; model faithful to bad evidence | Chunking, hybrid, rerank, filters |
| HIGH | LOW | Generation drift | "Only from passages", escape hatch, temp↓, grounding check |
| LOW | LOW | Start at retrieval | Fix retrieval first |
| HIGH | HIGH | Corpus gap | Content problem, not engineering |

**Diagnostic order:** look at what was retrieved → check the prompt uses it → check parameters (`stopReason`, temperature, maxTokens) → check infrastructure (throttling, IAM, region) → only then change the model.

**Evaluation hygiene:** temperature 0, fixed golden dataset, include unanswerable and adversarial questions, pin the judge model version, never use production PII.

**Release:** offline eval → shadow (diff on live traffic, show nobody) → canary → full.

## 9. Numbers worth carrying in

| Term | Definition |
| --- | --- |
| Lambda max execution | **15 minutes** |
| API Gateway REST integration timeout | **~29 seconds** |
| KB fixed chunking default | **300 tokens, 20% overlap** |
| Batch inference discount | **~50%** |
| Output vs input token price | **~3–5×** |
| English tokens per character | **~1 per 4** |
| Titan Text Embeddings V2 dimensions | **256 / 512 / 1024** + binary |
| Provisioned Throughput commitment | **1 or 6 months** |
| Exam pass mark | **750 / 1000** |

Service defaults change. These are for reasoning, not for quoting in production.

## 10. Exam morning

- Eat. Three hours is a long time and fatigue at question 55 is real
- Skim this page once. Learn nothing new
- Read the **constraint sentence** before the options, every time
- Two options both work? Find which one violates a stated constraint
- Flag and move on after 90 seconds. Answer every question — no penalty for wrong
- Change a flagged answer only for a concrete reason, never a feeling
- "Least operational overhead" → the managed service. "Prevent" → IAM/SCP, not an alarm
