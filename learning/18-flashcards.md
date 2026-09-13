---
title: Flashcards (spaced repetition)
source: src/content/flashcards.html
group: Practice
---

# Flashcards (spaced repetition)

## 1. Flashcards

104 cards across eight decks. Click a card or press space to flip. → marks it known, ← marks it for repetition — cards you keep missing come round sooner.

## 2. How to use these well

Flashcards are for **retention and sharpness**, not for learning. Read the modules first; use these to keep distinctions crisp in the weeks between studying and sitting.

#### The rhythm that works

- **While learning a domain:** that deck only, at the end of each session
- **Final two weeks:** all decks, ten minutes daily
- **Final two days:** the *Exam* deck only — it is the answer-instinct deck
- **Exam morning:** nothing. Rest beats revision at that point

#### Say it out loud before flipping

Recognition is not recall. If you flip and think "yes, I knew that", you probably did not — you recognised it. Force yourself to state the answer aloud, in a full sentence, before turning the card. It feels slower and it is dramatically more effective.

### The decks

| Deck | What is in it | Priority |
| --- | --- | --- |
| **Core** | Tokens, context, embeddings, sampling, the customisation ladder | Foundational — know these cold before anything else |
| **Bedrock** | APIs, inference modes, profiles, caching, customisation, Flows, BDA | High — feeds Domains 1, 2 and 4 |
| **RAG** | Pipeline stages, chunking, vector stores, hybrid, rerank, knowledge bases | **Highest.** The biggest slice of the biggest domain |
| **Agents** | Action groups, Return of Control, traces, AgentCore, orchestration choice | High — Domain 2 |
| **Security** | Guardrail policies, injection, IAM, logging, responsible AI | High — Domain 3 is 20% |
| **Cost** | Levers, ranked; caching; provisioned vs on-demand | Medium — small domain, quick wins |
| **Testing** | Metrics, the retrieval-vs-generation split, release strategy | Medium |
| **Exam** | Format facts and the keyword → answer instincts | **Do this deck last, and daily in the final week** |

> **Tip — If you only drill one deck**
>
> Make it **Exam**. It encodes the keyword-to-answer mappings — "exact codes not found" → hybrid search, "answer lacks context" → hierarchical chunking, "no human waiting" → batch — that turn a 2-minute question into a 30-second one. Time saved on the easy questions is time available for the genuinely ambiguous ones.

## Card decks

104 cards across 8 decks.

## Deck: Core

### Core 1. Token

A subword unit. English prose ≈ **4 characters per token**. Code and JSON are much denser. Both input and output are billed per token; output usually costs 3–5× input.

### Core 2. Context window

Total tokens a model can hold in one request. Shared by system prompt, tool schemas, history, retrieved context, the question *and* the reserved output. Exceeding it is a validation error.

### Core 3. Embedding

A fixed-length numeric vector representing meaning. Similar meaning → similar direction. Titan Text Embeddings V2 supports 256/512/1024 dims plus binary output.

### Core 4. Cosine similarity

Dot product of two vectors divided by the product of their magnitudes. 1 = same direction, 0 = unrelated, −1 = opposite. The basis of vector retrieval.

### Core 5. Temperature

Rescales logits before sampling. Low = deterministic (use for classification, extraction, evaluation). High = creative. Set to 0 for anything you need to reproduce or test.

### Core 6. Top-p vs top-k

**Top-p** keeps the smallest set of tokens whose cumulative probability reaches p — adaptive. **Top-k** always keeps exactly k candidates — fixed.

### Core 7. Hallucination

Fluent, confident output not supported by sources or fact. Mitigate with grounding, an explicit "say I don't know" escape hatch, low temperature, citations, and the contextual grounding check.

### Core 8. Statelessness

Models have no memory between calls. "Memory" is the application resending history — which is why long conversations get expensive and eventually need summarisation or AgentCore Memory.

### Core 9. Customisation ladder

Prompt engineering → RAG → fine-tuning → continued pre-training. Always choose the lowest rung that solves the stated problem. The exam rewards this ordering.

### Core 10. Lost in the middle

Models recall the start and end of a long input better than the middle. Put critical instructions and the question at the **end**; prefer retrieval precision over volume.

## Deck: Bedrock

### Bedrock 1. InvokeModel vs Converse

`InvokeModel` takes provider-specific JSON. **Converse** normalises messages, system prompts, inference params and tool use across providers — prefer it for portability.

### Bedrock 2. ConverseStream

Streaming variant of Converse. Returns tokens incrementally. Same token cost — it changes delivery and perceived latency, not price.

### Bedrock 3. stopReason values

`end_turn` (finished naturally), `max_tokens` (you clipped it), `stop_sequence` (your stop string fired), `tool_use` (waiting on you to run a tool). First thing to check on truncated output.

### Bedrock 4. Model access

Enabled **per model, per region** in the console. Separate from IAM. An AccessDenied mentioning model access means this step was skipped.

### Bedrock 5. Cross-region inference profile

Routes invocations across several regions for throughput and resilience. **Caveat:** inference then runs outside your region — check data residency before enabling.

### Bedrock 6. Application inference profile

Tagged profile used for **cost and usage attribution** per application or team. How you find out which team tripled the bill.

### Bedrock 7. Provisioned Throughput

Dedicated capacity in **model units**, 1- or 6-month commitment. Required to serve custom (fine-tuned or imported) models at scale. Choose for guaranteed throughput and predictable latency.

### Bedrock 8. Batch inference

JSONL manifest in S3 → async processing → results in S3. Roughly **50% of on-demand** on supported models. For anything where no human is waiting.

### Bedrock 9. Prompt caching

Caches a **stable prefix** of the prompt. Cache reads billed at a steep discount; big time-to-first-token win. Not response caching — the model still generates fresh output.

### Bedrock 10. Intelligent Prompt Routing

Managed routing between a smaller and larger model in a family based on predicted request complexity. Cuts cost while holding quality near the larger model.

### Bedrock 11. Model distillation

Fine-tune a small *student* on a large *teacher*'s outputs. Near-teacher quality at student cost and latency, for one specific task.

### Bedrock 12. Custom Model Import

Bring your own weights for supported open architectures and serve them through the Bedrock API. Served via Provisioned Throughput.

### Bedrock 13. Bedrock Flows

Low-code visual workflow builder inside Bedrock: prompts, knowledge bases, agents, Lambda, conditions, iterators. Versioned.

### Bedrock 14. Prompt Management

Version prompts independently of application deployments. Ship a prompt fix without a deploy; roll it back without one either.

### Bedrock 15. Bedrock Data Automation (BDA)

Managed multimodal extraction — text, tables, figures, layout — from complex documents, images, audio and video. Sits at the **parse** step of ingestion.

## Deck: RAG

### RAG 1. The nine RAG stages

Ingest → Chunk → Embed → Store → Retrieve → Augment → Generate → Guard → Observe. Diagnose failures by locating the stage, not by guessing.

### RAG 2. Chunking: fixed-size

Approximately N tokens with configurable overlap. Cheap and predictable; will cut sentences in half. Bedrock KB default is 300 tokens / 20% overlap.

### RAG 3. Chunking: semantic

Embeds sentences, cuts where topic similarity drops below a breakpoint percentile. Uneven but coherent chunks. Extra embedding cost at ingestion only.

### RAG 4. Chunking: hierarchical

**Search small children, return large parents.** The answer whenever retrieval finds the right passage but the answer lacks surrounding context.

### RAG 5. Chunking: none

One file = one chunk. Correct when files are already chunk-sized: FAQ entries, product records, per-ticket exports. Terrible on a 60-page PDF.

### RAG 6. Hybrid search

Dense vectors + keyword BM25, fused. The fix when **exact rare tokens** — part numbers, error codes, SKUs — are never retrieved.

### RAG 7. Reranking

Over-fetch (say 25), re-score with a cross-encoder that reads query and passage together, keep the best 5. Improves precision and *reduces* tokens sent.

### RAG 8. Query decomposition

Split a compound question into sub-questions, retrieve for each, synthesise. For "compare X and Y" style questions.

### RAG 9. GraphRAG

Knowledge graph alongside vectors (Neptune Analytics). For **multi-hop questions about relationships** where no single chunk holds the answer.

### RAG 10. Metadata filtering

Attach attributes via a `<file>.metadata.json` sidecar in S3. Filter by tenant, date, department, classification at query time. Cheapest precision win available.

### RAG 11. Retrieve vs RetrieveAndGenerate

`Retrieve` returns chunks only — use when you control the prompt or need passages for another purpose. `RetrieveAndGenerate` is the managed one-call path and returns citations.

### RAG 12. Changing embedding model

Requires a **full re-index**. Vectors from different models live in incompatible spaces. Treat the choice as a one-way door.

### RAG 13. Vector store options

OpenSearch Serverless (default), S3 Vectors (cheapest, large cold corpora), Aurora pgvector, Neptune Analytics (GraphRAG), OpenSearch Managed Cluster, Pinecone, MongoDB Atlas, Redis.

### RAG 14. Custom transformation Lambda

Registered in the KB ingestion config. Receives chunks mid-pipeline, before embedding — strip boilerplate, rewrite text, attach computed metadata.

### RAG 15. KB sync

Explicit `StartIngestionJob`, incremental, and it **does** handle deletions. Stale answers are very often just a knowledge base nobody re-synced.

## Deck: Agents

### Agents 1. Action group

A set of operations an agent can call, defined by OpenAPI schema or function details, backed by Lambda or Return of Control.

### Agents 2. Return of Control

The agent decides which tool and which arguments, then hands the decision back to **your** application to execute. Use when execution must stay in the caller's environment, or for a human approval gate.

### Agents 3. Agent trace

Per-step record of reasoning, tool selection, tool inputs/outputs and KB lookups. The primary debugging artifact — read it before theorising.

### Agents 4. Session state

Session attributes and prompt session attributes pass caller context (user ID, entitlements, locale) into an invocation without putting it in the user message.

### Agents 5. Multi-agent collaboration

Supervisor routes to specialised collaborators, each with own tools, KB and **IAM role**. Adopt for capability and access separation — latency goes up, not down.

### Agents 6. Agent loops — causes

(1) Tool returns an error or empty result the model cannot read as progress. (2) Tool description is ambiguous or overlaps another tool. Fix descriptions, return structured errors, bound iterations.

### Agents 7. ReAct

Reason → Act → Observe → repeat. The loop underneath most tool-using agents.

### Agents 8. Tool description

Not documentation — it *is* the prompt the model uses to choose. Vague descriptions are the number one cause of wrong-tool and looping behaviour.

### Agents 9. AgentCore Runtime

Long-running, session-isolated, framework-agnostic agent hosting. The answer when Lambda's 15-minute ceiling is the constraint.

### Agents 10. AgentCore Memory

Short-term (current conversation) and long-term (durable facts, preferences, summaries across sessions).

### Agents 11. AgentCore Gateway

Turns existing APIs and Lambdas into discoverable, access-controlled agent tools. Can expose them over MCP.

### Agents 12. AgentCore Identity

Identity and credential brokering for **non-human** callers: OAuth 2.0 flows, API keys, SigV4 — so tokens never live in agent code.

### Agents 13. AgentCore Code Interpreter / Browser

Sandboxed code execution, and a managed headless browser for navigating sites with no API. Never run model-generated code with your own function's IAM role.

### Agents 14. Strands Agents

Open-source, code-first agent SDK: tools as decorated functions, model drives the loop. Deploy to AgentCore Runtime or your own compute.

### Agents 15. MCP

Model Context Protocol — a standard interface between models/agents and external tools and data, so a server written once works with many clients.

### Agents 16. Agent vs Step Functions

Agent = model decides the path at runtime (unknown path, adaptive). Step Functions = you define the path (deterministic, auditable, per-step retries, long-running).

## Deck: Security

### Security 1. Guardrail policy types

Content filters · denied topics · word filters · sensitive information (PII) · contextual grounding check · automated reasoning checks · image/multimodal filters.

### Security 2. Contextual grounding check

Scores **grounding** (is the answer supported by the passages) and **relevance** (does it answer the question). Below threshold → blocked. The anti-hallucination control for RAG.

### Security 3. Automated Reasoning checks

Translates a policy document into **formal logic** and mathematically verifies claims: verified / contradicted / indeterminate. Look for "provable" or "formal verification" in the stem.

### Security 4. PII actions

**BLOCK** rejects the whole interaction. **ANONYMIZE** replaces the value with a placeholder like `{EMAIL}` and continues.

### Security 5. ApplyGuardrail API

Runs a guardrail against arbitrary text with no Bedrock model call — screen self-hosted models, third-party APIs, user-generated content, under one policy.

### Security 6. Guardrail evaluation points

Twice: **input** before the model is invoked (a blocked input is not billed for inference), and **output** before it reaches the user.

### Security 7. Denied topics vs word filters

Denied topics match **semantically** from a definition plus examples — catches paraphrase. Word filters match exact literals — precise for enumerable lists like internal code names.

### Security 8. Prompt injection (direct)

The user tries to override instructions. Defend with the prompt attack filter, a firm system prompt, and never putting secrets in the prompt.

### Security 9. Indirect prompt injection

Payload arrives via **retrieved or fetched content**. Defend by treating retrieved text as untrusted data (delimit it; instruct the model to ignore instructions inside it) and by bounding tool capability.

### Security 10. "The system prompt says not to"

Not a security control. Instructions are advisory to a probabilistic model. Enforcement lives in IAM, guardrails, bounded tools, output validation and human approval.

### Security 11. Insecure output handling

Model output is untrusted input to whatever consumes it. Escape before rendering as HTML; never pass to shell, SQL or eval unvalidated. A guardrail is not an output encoder.

### Security 12. Excessive agency

An agent can take real actions. Bound the tool itself (caps, ownership checks), require human approval above a threshold, and give each action group its own least-privilege role.

### Security 13. IAM condition keys for Bedrock

Require a specific guardrail ID on every invocation; restrict to a source VPC endpoint. Turns "please use the guardrail" into "AccessDenied without it".

### Security 14. PrivateLink for Bedrock

Interface VPC endpoint keeps traffic off the internet *and* gives an endpoint policy as an extra enforcement point.

### Security 15. CloudTrail vs invocation logging

CloudTrail = who called what, when (control plane). Model invocation logging = the actual prompts and completions. You want both; only the second gives you content.

### Security 16. Bedrock and your data

Prompts and completions are **not** used to train base models and are **not** shared with model providers. Logging is opt-in, into your own CloudWatch or S3.

### Security 17. Cross-account guardrails

Define policy once in a management account, enforce across member accounts and OUs via AWS Organizations. The difference between a standard and a suggestion.

### Security 18. SageMaker Clarify

Pre-training data bias metrics, post-training model bias metrics, feature-attribution explainability, and FM evaluations. The "prove fairness" answer.

### Security 19. AI Service Cards

Published documentation of intended use cases, limitations and responsible-AI design choices. The transparency artifact a risk committee asks for.

## Deck: Cost

### Cost 1. Biggest cost lever

**Model right-sizing and routing.** The catalogue spans 50–100× in price. Route the easy majority to a small model; escalate only what needs it.

### Cost 2. Cost formula

(input tokens × input rate) + (output tokens × output rate), per request, times volume. Output is 3–5× input. Both halves matter.

### Cost 3. Cost spike, flat volume

Almost always input-token growth: top-k or chunk size raised, unbounded conversation history, or a tool returning a bigger payload. Confirm with per-profile token metrics.

### Cost 4. Semantic caching

Embed the query, serve a cached answer above a similarity threshold. Exact-hash caching gets ~3% hit rates on natural language. **Risk:** too loose a threshold serves confidently wrong answers.

### Cost 5. Provisioned vs on-demand

On-demand scales linearly with traffic; provisioned is a flat line. But choose provisioned for guaranteed throughput, predictable latency or custom models regardless of where the lines cross.

### Cost 6. Streaming and cost

No effect on token cost. It is a perceived-latency optimisation.

### Cost 7. Agent cost multiplier

Agents make many model calls per user request. Trim the tool schema (shrinks every call) and use a small model for orchestration, large only for final synthesis.

## Deck: Testing

### Testing 1. Context relevance vs faithfulness

**Context relevance** = context vs question (retrieval quality). **Faithfulness** = answer vs context (generation quality). Different scores → different fixes.

### Testing 2. Low context relevance, high faithfulness

Retrieval is bringing back rubbish and the model is faithfully using it. Fix retrieval — chunking, hybrid search, reranking, filters. Not the prompt.

### Testing 3. High context relevance, low faithfulness

Right evidence, drifting answer. Tighten the "answer only from the passages" instruction, lower temperature, add a contextual grounding check.

### Testing 4. Golden dataset

A fixed curated set with known-good outputs. Your regression suite — run it on every prompt, model and retrieval change and treat a drop as a build failure.

### Testing 5. Evaluate at temperature 0

Removes sampling variance so score differences reflect your change, not randomness. Pin the judge model version too.

### Testing 6. LLM-as-a-judge bias

Judges favour longer, more confident answers. Calibrate against human review on a sample and tighten the rubric until they track.

### Testing 7. Shadow vs canary

**Shadow** = run on live traffic, show nobody, diff offline. **Canary** = small percentage of real users with monitoring. Shadow first, canary second.

### Testing 8. Agent evaluation

Score intermediate behaviour too: tool selection, argument correctness, step count, error recovery. Right answer after eight wasted calls is not success.

### Testing 9. Diagnostic order for bad RAG answers

1. Look at what was actually retrieved. 2. Check whether the prompt uses it correctly. 3. Only then consider model or parameter changes.

### Testing 10. Throttling response ladder

Exponential backoff with jitter → cross-region inference profile → service quota increase → Provisioned Throughput. Batch anything non-interactive.

## Deck: Exam

### Exam 1. AIP-C01 format

75 questions (65 scored + 10 unscored), 180 minutes, $300, scaled 100–1000, **750 to pass**, valid 3 years. Pearson VUE or online proctored.

### Exam 2. Domain weights

D1 FM integration/data/compliance **31%** · D2 implementation **26%** · D3 safety/security/governance **20%** · D4 operational efficiency **12%** · D5 testing/troubleshooting **11%**.

### Exam 3. Answer instinct: "minimal operational overhead"

Choose the managed service: Knowledge Bases over a custom pipeline, Bedrock Agents over hand-rolled orchestration, Q Business over building a UI.

### Exam 4. Answer instinct: "must never leave region X"

Regional endpoints, model availability check, and **do not** enable cross-region inference profiles that include other regions.

### Exam 5. Answer instinct: "prove it / audit / regulator"

Citations + model invocation logging + CloudTrail. For policy consistency specifically: Automated Reasoning checks.

### Exam 6. Answer instinct: "exact codes not found"

Hybrid search. Every time.

### Exam 7. Answer instinct: "answer lacks surrounding context"

Hierarchical chunking.

### Exam 8. Answer instinct: "knowledge changes daily"

RAG, not fine-tuning.

### Exam 9. Answer instinct: "specific tone / format / behaviour"

Fine-tuning (after prompt engineering and few-shot have genuinely failed).

### Exam 10. Answer instinct: "no human is waiting"

Batch inference, 50% off.

### Exam 11. Answer instinct: "execution must stay in our environment"

Return of Control.

### Exam 12. Answer instinct: prompt instruction as a security control

Always wrong. Look for the option that enforces outside the model.
