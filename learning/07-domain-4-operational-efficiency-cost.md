---
title: Domain 4 — Operational Efficiency & Cost
source: src/content/domain4.html
group: Learn
exam_weight: 12%
---

# Domain 4 — Operational Efficiency & Cost

> **Exam — Domain 4 — 12% of scored content, roughly 8 questions**
>
> The smallest domain except Domain 5, and the highest marks-per-hour on the exam. It is almost entirely learnable in a day because it reduces to a handful of levers and their relative magnitudes. Learn the *ordering*, not the prices.

## 1. Token economics

Cost = (input tokens × input rate) + (output tokens × output rate), per request, times volume. Two facts drive everything downstream:

- **Output costs 3–5× input per token.** Concise output formats and sensible `maxTokens` are real savings.
- **Input volume is usually where the money actually is**, because RAG applications send thousands of context tokens on every call while producing a few hundred output tokens.

> **Interactive widget (`costcalc`)**
>
> Bedrock cost model — input vs output, caching, batch, catalogue spread. Playable in the HTML study site.

> **Warning — Do not memorise prices**
>
> Bedrock pricing changes. The exam tests reasoning about magnitude and direction — that a small model is one to two orders of magnitude cheaper, that output exceeds input, that batch is roughly half. Never a specific figure.

### The five cost lines in a typical application

| Line | Driver | Typical share | How it surprises people |
| --- | --- | --- | --- |
| Model inference | Tokens × rate × volume | Usually dominant | Grows with context size, not just request count |
| Embeddings | Tokens embedded at ingestion + per query | Small, unless… | …a pipeline re-embeds the whole corpus nightly for a 2% delta |
| Vector storage | Vectors × bytes, or OCU-hours | Moderate | OpenSearch Serverless bills continuously, including for cold data |
| Supporting compute | Lambda, containers, API Gateway | Small | Rarely the problem |
| Logging | CloudWatch Logs ingestion and retention | Small but nonzero | Prompts are large. Multi-year retention in CloudWatch instead of S3 is expensive |

## 2. The cost levers, ranked by magnitude

*Indicative percentage reduction each lever can deliver on a suitable workload. They compose — routing plus caching plus reranking together routinely reaches 60–70%.*

| Item | Value |
| --- | --- |
| Model right-sizing / routing | 85 |
| Batch inference (async work) | 50 |
| Prompt caching (repeated prefix) | 45 |
| Distillation (high-volume task) | 40 |
| Reranking / lower top-k | 25 |
| Semantic caching | 20 |
| Output format / maxTokens | 10 |

### 1. Model right-sizing and routing — the big one

The catalogue spans 50–100× in price. Nothing else you do comes close. The pattern:

- Classify the incoming request cheaply — a tiny model, or a heuristic
- Serve the easy majority with a small model
- Escalate only genuinely hard requests to a large one

**Bedrock Intelligent Prompt Routing** is the managed implementation: it routes between a smaller and larger model in a family based on predicted complexity, aiming to keep quality near the larger model.

### 2. Batch inference

Roughly 50% of on-demand on supported models. Applies whenever no human is waiting: backlogs, nightly classification, corpus migration, bulk embedding.

### 3. Prompt caching

Caches a **stable prefix** — system prompt, tool schemas, a long static document. Subsequent calls sharing that prefix are billed at a steeply reduced cache-read rate and skip re-processing, so you get a latency win as well. The ideal shape is a large identical prefix plus a short variable suffix, which is exactly what a RAG or agent application looks like.

It is **not** response caching. The model still generates fresh output every time.

### 4. Distillation

Train a small student on a large teacher's outputs for one specific task. The answer to "we need frontier quality at very high volume within budget" when routing alone is not enough. Costs: a training pipeline, an evaluation pipeline, and Provisioned Throughput to serve the result.

### 5. Reranking and lower top-k

Over-fetch, rerank, send five excellent chunks instead of twenty adequate ones. This is the rare optimisation that is *cheaper and more accurate at the same time*, because irrelevant context both costs tokens and dilutes the answer.

### 6. Semantic caching

Embed the query; if a previous query is sufficiently similar, serve the stored answer. Exact-hash caching gets ~3% hit rates on natural language because questions are never byte-identical.

> **Warning — The semantic cache trap**
>
> "What is the refund window for enterprise customers?" and "What is the refund window?" are semantically close and have *different answers*. Too loose a threshold turns your cache into a hallucination source that no guardrail will catch — the answer is well-formed, grounded-looking, and was correct once. Set the threshold conservatively and evaluate it like any other quality change.

## 3. Throughput, quotas and throttling

Bedrock enforces requests-per-minute and tokens-per-minute quotas **per model, per region**. Exceed them and you get `ThrottlingException`. The response ladder, in order:

1. **Exponential backoff with jitter** — configure the SDK retry mode. Tight retries make congestion worse
2. **Cross-region inference profile** — widen the capacity pool. Check residency first
3. **Service quota increase** — request more of the shared pool
4. **Provisioned Throughput** — dedicated capacity, for sustained load
5. **Always** — **Batch** anything that is not interactive, and queue anything spiky

> **Interactive widget (`throughput`)**
>
> On-demand vs Provisioned Throughput crossover calculator. Playable in the HTML study site.

> **Info — Cost is not the only reason to buy Provisioned Throughput**
>
> Model the crossover, yes. But three requirements decide it regardless of where the lines meet: **guaranteed throughput**, **predictable latency under load**, and **serving a custom model** — which has no on-demand path. If a stem states any of those, the crossover arithmetic is not the deciding factor.

## 4. Latency

| Contributor | Affects | What to do |
| --- | --- | --- |
| **Input length** | Time to first token | Cut retrieved context; rerank; enable prompt caching on the stable prefix |
| **Output length** | Total duration — generation is sequential | Concise formats, sensible `maxTokens`, stop sequences |
| **Model size** | Both | Smaller or latency-optimised model for the fast path |
| **Retrieval** | Pre-model time | Lower top-k; right-size the vector store |
| **Agent hops** | Multiplies everything | Fewer tools (shorter prompt, simpler decision), a faster orchestration model, bound iterations |
| **Perception** | What the user experiences | **Stream.** No token cost change, large UX change |

> **Exam — A p99 that is 15× the p50**
>
> A long tail almost always means *some requests have much larger inputs*. Cap the total retrieved context so no single request can blow the latency budget, and then find the structural cause — usually a handful of oversized parent chunks, or documents that chunked badly. Raising `maxTokens` makes it worse.

## 5. Cost observability and control

### Attribution

**Application inference profiles** are the mechanism: one per application or team, tagged, so Cost Explorer and CloudWatch break spend and token usage down per profile. Without them a shared account's Bedrock line is a single opaque number and no one is accountable for growth.

### The metrics that matter

- Input tokens per request, over time — the leading indicator of cost growth
- Output tokens per request, over time
- Invocation count, latency and throttle count per model
- Spend per application inference profile

> **Exam — "Cost tripled overnight, request volume unchanged"**
>
> Requests flat plus cost up means **each request got bigger**. Three usual suspects: top-k or chunk size was raised, conversation history became unbounded, or a tool started returning a much larger payload. Confirm in minutes with per-profile input-token metrics — that is precisely what profiles are for.

### Preventive controls

- **AWS Cost Anomaly Detection** for automatic spend-spike alerts, and **AWS Cost Explorer** for per-profile attribution (these are the in-scope cost tools; AWS Budgets works too but is outside the exam's stated scope)
- **IAM scoped to cheap model ARNs** for experimental workloads — so the experiment structurally cannot reach a frontier model
- **Input length caps and rate limits** at API Gateway, and WAF rate-based rules, so an abusive caller cannot run up your bill

## 6. Eliminating waste, not just discounting it

A distinct category, and one the exam likes because the tempting answers all discount the wrong thing.

| Waste | Wrong instinct | Right fix |
| --- | --- | --- |
| Nightly job re-summarises documents already summarised | Move it to a cheaper model | **Change detection.** Hash or timestamp the content, persist previous outputs, process only the delta. Cheaper waste is still waste |
| Ingestion re-embeds the whole corpus for a 2% delta | Reduce embedding dimensions | **Incremental sync.** Almost always caused by a pipeline that recreates the data source instead of syncing it |
| Chunks 6–10 of top-10 never appear in any answer | Keep them "for safety" | **Cut top-k to 5 and measure.** Unused context is paid-for noise that also dilutes attention |
| Three sequential model calls where one would do | Optimise each call | **Collapse the steps** using structured output — then verify quality held |
| Unbounded conversation history | Buy a bigger context window | **Rolling summarisation** or a managed memory store |

## 7. Optimisation is not minimisation

The exam will offer you an option that saves money and breaks the stated requirement. Recognise it.

Legitimate reasons to spend *more*:

- The task requires multi-step reasoning that small models fail at
- The cost of a wrong answer is high — legal, medical, financial, safety consequences
- Latency requirements need Provisioned Throughput or a priority tier
- Compliance requires a region or configuration that happens to be more expensive
- Measurement shows the extra context genuinely earns its cost

> **Tip — The framing that gets it right**
>
> When error cost dominates inference cost, the expensive model *is* the cheap option. Saying so — rather than reflexively picking the smallest model — is what a professional-level answer looks like.

## 8. Domain 4 check

Six questions. Aim for five.

- [Drill all 30 Domain 4 questions →](11-question-bank.md)
