---
title: Domain 4 questions — Operational Efficiency & Cost
source: src/assets/data/q-d4.js
group: Practice
---

# Domain 4 questions — Operational Efficiency & Cost


12% of scored content. **30 questions.** Every item is original, written against the published AIP-C01 exam guide. Correct option(s) are marked `[x]`.

### d4-001

A RAG assistant sends a 12,000-token system prompt and tool schema with every request, followed by a short user question. Traffic is 500,000 requests per day. Which optimisation gives the largest cost reduction with the least behavioural change?

- [ ] **A.** Reduce maxTokens
- [x] **B.** Enable prompt caching on the static prefix
- [ ] **C.** Switch to batch inference
- [ ] **D.** Increase temperature

**Why**

A large, identical prefix on every call is the textbook prompt-caching shape. Cache reads are billed at a small fraction of the normal input rate and skip re-processing, so you get both a cost and a latency win with no change to what the model produces.

| Option | Why this option |
| --- | --- |
| A | Output is already short; there is little to reclaim. |
| B ✓ | Correct. |
| C | Batch halves the rate but makes an interactive assistant asynchronous — a behavioural change users would notice immediately. |
| D | Not a cost lever. |

*See: Domain 4 → Prompt caching*

---

### d4-002

Which two workloads are good candidates for Bedrock batch inference? (Choose 2.)

- [x] **A.** Overnight classification of a document backlog
- [x] **B.** Generating embeddings for a one-time corpus migration
- [ ] **C.** An interactive customer chat
- [ ] **D.** A real-time fraud decision in a payment flow

**Why**

Batch trades latency for roughly half the price. Anything where no human is waiting qualifies; anything in a synchronous user or transaction path does not.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Humans are waiting. |
| D | Milliseconds matter. |

*See: Domain 4 → Batch inference*

---

### d4-003

Analysis shows 78% of requests to an assistant are simple FAQ lookups. What is the highest-leverage cost optimisation?

- [ ] **A.** Reduce the context window
- [x] **B.** Route simple requests to a small model and escalate only complex ones
- [ ] **C.** Disable streaming
- [ ] **D.** Reduce the number of guardrail policies

**Why**

Model tier is the biggest single cost multiplier available — the gap between the cheapest and most expensive model in the catalogue is 50–100×. Routing by complexity, whether hand-rolled or via Intelligent Prompt Routing, beats every token-level tweak.

| Option | Why this option |
| --- | --- |
| A | Marginal. |
| B ✓ | Correct. |
| C | Costs nothing to run and helps UX. |
| D | Trivial cost, and you lose safety. |

*See: Domain 4 → Model right-sizing*

---

### d4-004

Which two statements about output tokens are correct? (Choose 2.)

- [x] **A.** They are typically billed at 3–5× the input rate
- [x] **B.** They dominate latency because generation is sequential
- [ ] **C.** They are free below 1,000 tokens
- [ ] **D.** They do not count toward the context window

**Why**

Output is the expensive half in both dimensions. Input is processed in parallel; output is produced one token at a time, which is why time-to-completion tracks output length so closely. Concise output formats are a genuine optimisation.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | They are not. |
| D | They do. |

*See: Domain 4 → Token economics*

---

### d4-005 *(hard)*

A workload runs steadily at 40 requests per second, 24/7, on one model, and occasionally hits throttling. Which option should be evaluated first?

- [x] **A.** Provisioned Throughput sized to the steady load
- [ ] **B.** Batch inference
- [ ] **C.** A smaller context window
- [ ] **D.** Disabling guardrails

**Why**

Sustained, predictable, round-the-clock load with throttling is exactly the Provisioned Throughput case: dedicated capacity, no shared-pool contention, and at high steady utilisation the committed rate usually beats on-demand. Model the crossover before committing.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | The workload is real-time. |
| C | Does not address capacity. |
| D | A safety control, not a capacity lever. |

*See: Domain 4 → Provisioned Throughput*

---

### d4-006

Which two techniques reduce input tokens without reducing answer quality? (Choose 2.)

- [x] **A.** Reranking so fewer, more relevant chunks are sent
- [x] **B.** Summarising older conversation turns into a rolling summary
- [ ] **C.** Increasing top-k
- [ ] **D.** Adding more few-shot examples

**Why**

Both replace volume with quality. Reranking sends five excellent chunks instead of twenty adequate ones; rolling summarisation keeps the substance of a long conversation at a fraction of the tokens. The other two options deliberately add tokens.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Adds tokens. |
| D | Adds tokens — often worth it, but not a reduction. |

*See: Domain 4 → Token efficiency*

---

### d4-007

What is model distillation used for in a cost context?

- [ ] **A.** Compressing prompts
- [x] **B.** Training a smaller student model on a larger teacher's outputs, so you get near-teacher quality at student cost and latency
- [ ] **C.** Caching responses
- [ ] **D.** Reducing vector dimensions

**Why**

Distillation is the answer when a scenario demands frontier-model quality on a specific task at high volume within budget, and simple routing is not enough. The trade: it is task-specific, and you own a training and evaluation pipeline.

| Option | Why this option |
| --- | --- |
| A | That is prompt compression. |
| B ✓ | Correct. |
| C | That is caching. |
| D | That is embedding configuration. |

*See: Domain 4 → Distillation*

---

### d4-008

Which two are valid uses of application inference profiles? (Choose 2.)

- [x] **A.** Attributing Bedrock spend to a specific team or application via tags
- [x] **B.** Tracking per-application invocation and token metrics in CloudWatch
- [ ] **C.** Increasing the context window
- [ ] **D.** Encrypting prompts

**Why**

Profiles are the unit of cost and usage attribution. Without them, a shared account's Bedrock line is a single opaque number and nobody can be held accountable for growth.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | No. |
| D | No. |

*See: Domain 4 → Cost attribution*

---

### d4-009

A team caches complete model responses keyed by an exact prompt hash and sees a 3% hit rate. What would raise it meaningfully?

- [ ] **A.** Increase the cache TTL to a year
- [x] **B.** Semantic caching — embed the query and serve a cached answer when a previous query is sufficiently similar
- [ ] **C.** Cache only the system prompt
- [ ] **D.** Disable the cache

**Why**

Natural language questions are almost never byte-identical, so exact-match caching is nearly useless. Semantic caching embeds the query and returns a stored answer when similarity clears a threshold. Set that threshold carefully — too loose and you serve confidently wrong answers.

| Option | Why this option |
| --- | --- |
| A | A longer TTL on a key that never repeats changes nothing. |
| B ✓ | Correct. |
| C | That is prompt caching, a different mechanism (and worth doing too). |
| D | Gives up. |

*See: Domain 4 → Semantic caching*

---

### d4-010

Which two metrics should be on a Bedrock cost dashboard? (Choose 2.)

- [x] **A.** Input tokens per request over time
- [x] **B.** Output tokens per request over time
- [ ] **C.** Number of IAM roles
- [ ] **D.** Vector dimensionality

**Why**

Cost is tokens times rate, so per-request token trends are the leading indicator. A cost spike with flat request volume is almost always input-token growth: a raised top-k, unbounded history, or a tool now returning a much larger payload.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Not a cost driver. |
| D | A fixed configuration choice. |

*See: Domain 4 → Cost observability*

---

### d4-011

Which change most directly reduces time-to-first-token?

- [x] **A.** Reducing the input prompt length and enabling prompt caching for the stable prefix
- [ ] **B.** Increasing maxTokens
- [ ] **C.** Adding more retrieved chunks
- [ ] **D.** Raising temperature

**Why**

Time-to-first-token is dominated by processing the input. Shorter prompts and a cached prefix both cut that work directly. maxTokens affects total time, not first-token time.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Affects total duration, not TTFT. |
| C | Increases TTFT. |
| D | No effect. |

*See: Domain 4 → Latency*

---

### d4-012

Which two are true about Bedrock service quotas? (Choose 2.)

- [x] **A.** They are defined per model and per region
- [x] **B.** They can be increased through Service Quotas requests
- [ ] **C.** They are unlimited by default
- [ ] **D.** They apply only to batch inference

**Why**

Requests-per-minute and tokens-per-minute quotas are per model, per region, and adjustable. Knowing they are regional is what makes cross-region inference profiles an obvious throttling mitigation.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | They are not. |
| D | They apply broadly. |

*See: Domain 4 → Quotas*

---

### d4-013 *(hard)*

An application's Bedrock bill rose 4× in a week with request volume unchanged. Which is the most likely cause and the fastest way to confirm it?

- [ ] **A.** Model prices changed; check the pricing page
- [x] **B.** Input tokens per request grew — confirm with CloudWatch input-token metrics broken down by application inference profile
- [ ] **C.** More IAM users were added; check IAM
- [ ] **D.** The region changed; check CloudTrail

**Why**

Flat requests plus rising cost means each request got bigger. Usual suspects: top-k or chunk size increased, conversation history became unbounded, or a tool started returning a much larger payload. Per-profile token metrics show you which application and which direction within minutes.

| Option | Why this option |
| --- | --- |
| A | Possible but rare, and it would not be 4×. |
| B ✓ | Correct. |
| C | No relationship to cost. |
| D | Regional price differences are small. |

*See: Domain 4 → Cost investigation*

---

### d4-014

Which two are legitimate reasons to choose a larger, more expensive model despite the cost? (Choose 2.)

- [x] **A.** The task requires multi-step reasoning that smaller models fail
- [x] **B.** The cost of a wrong answer is high — legal, medical or financial consequences
- [ ] **C.** It has a nicer name
- [ ] **D.** Larger models are always faster

**Why**

Cost optimisation is not cost minimisation. When error cost dominates inference cost, the expensive model is the cheap option — and framing it that way is what a professional-level answer looks like.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | No. |
| D | Larger models are generally slower. |

*See: Domain 4 → Cost versus risk*

---

### d4-015

What is the effect of enabling response streaming on total token cost?

- [ ] **A.** It halves the cost
- [x] **B.** It has no effect on token cost; it changes delivery, improving perceived latency
- [ ] **C.** It doubles the cost
- [ ] **D.** It removes input token charges

**Why**

Streaming is a UX optimisation, not a pricing one. Same tokens, same bill — the user just sees the first words in a few hundred milliseconds instead of staring at a spinner for eight seconds.

| Option | Why this option |
| --- | --- |
| A | No. |
| B ✓ | Correct. |
| C | No. |
| D | No. |

*See: Domain 4 → Streaming*

---

### d4-016

Which two design changes reduce cost in an agentic workflow specifically? (Choose 2.)

- [x] **A.** Reduce the number of tools so the tool schema and decision space shrink
- [x] **B.** Use a smaller model for orchestration while reserving a larger model for the final synthesis step
- [ ] **C.** Add more collaborator agents
- [ ] **D.** Increase the agent iteration limit

**Why**

Agents make many model calls per user request, so each call's prompt size and model tier are multiplied. Trimming the tool schema shrinks every call; splitting orchestration from synthesis puts the expensive model only where it earns its keep.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | More agents means more calls. |
| D | More iterations means more calls. |

*See: Domain 4 → Agent cost*

---

### d4-017

A knowledge base ingestion job re-embeds the entire corpus every night, though only 2% of documents change. What should you do?

- [ ] **A.** Accept it as necessary
- [x] **B.** Use incremental sync so only new, changed and deleted documents are processed
- [ ] **C.** Reduce the embedding dimensions
- [ ] **D.** Switch vector stores

**Why**

Knowledge base ingestion is incremental by design. Re-embedding 100% of the corpus for a 2% delta is a 50× waste of embedding spend and job time — almost always caused by a pipeline that recreates the data source rather than syncing it.

| Option | Why this option |
| --- | --- |
| A | It is not necessary. |
| B ✓ | Correct. |
| C | A separate optimisation that does not fix the waste. |
| D | Does not address it. |

*See: Domain 4 → Ingestion efficiency*

---

### d4-018

Which two are true about cross-region inference profiles from an operational standpoint? (Choose 2.)

- [x] **A.** They increase effective throughput by spreading requests across regions
- [x] **B.** They can improve resilience to regional capacity constraints
- [ ] **C.** They guarantee lower cost
- [ ] **D.** They keep all inference in the source region

**Why**

More capacity pools means fewer throttles and better burst tolerance. What they explicitly do *not* do is keep processing local — which is the residency caveat you must check before enabling them.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Not a pricing feature. |
| D | They deliberately do the opposite. |

*See: Domain 4 → Throughput*

---

### d4-019

Which is the best way to prevent runaway spend from an experimental workload?

- [ ] **A.** Hope for the best
- [x] **B.** AWS Cost Anomaly Detection alerts with Cost Explorer per-application attribution, plus per-application inference profiles and scoped IAM so the workload cannot invoke expensive models
- [ ] **C.** Check the bill monthly
- [ ] **D.** Disable CloudWatch

**Why**

Detective plus preventive. Cost Anomaly Detection alerts (and Cost Explorer attribution) surface spend the moment it crosses normal patterns; IAM scoped to cheap model ARNs means the experiment structurally cannot reach the expensive ones. The profile makes the attribution unambiguous.

| Option | Why this option |
| --- | --- |
| A | No. |
| B ✓ | Correct. |
| C | Too late by weeks. |
| D | Removes visibility. |

*See: Domain 4 → Cost controls*

---

### d4-020

Which two factors most affect the latency of a single Bedrock invocation? (Choose 2.)

- [x] **A.** Number of input tokens to process
- [x] **B.** Number of output tokens to generate
- [ ] **C.** Number of IAM policies attached
- [ ] **D.** The name of the S3 bucket

**Why**

Input length drives time-to-first-token; output length drives everything after it, because generation is sequential. Model size sits behind both. Nothing else on that list is in the path.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Negligible. |
| D | Irrelevant. |

*See: Domain 4 → Latency drivers*

---

### d4-021 *(hard)*

A team must cut inference spend by 60% without degrading answer quality for complex questions. Which combination is most likely to achieve it? (Choose 2.)

- [x] **A.** Complexity-based routing: small model for simple requests, large model for complex ones
- [x] **B.** Prompt caching for the shared static prefix, plus reranking to send fewer retrieved chunks
- [ ] **C.** Switch every request to the smallest model
- [ ] **D.** Disable retrieval entirely

**Why**

The constraint is "without degrading quality for complex questions", which rules out anything applied uniformly. Routing protects the hard cases while moving the bulk of traffic to cheap inference; caching and reranking cut per-call tokens across the board. Together, 60% is realistic.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Degrades exactly the cases the requirement protects. |
| D | Destroys grounding. |

*See: Domain 4 → Optimisation strategy*

---

### d4-022

What is the operational risk of setting an aggressive semantic cache similarity threshold (for example 0.75)?

- [ ] **A.** Higher storage cost
- [x] **B.** Serving a cached answer for a question that is related but materially different, producing confidently wrong responses
- [ ] **C.** Slower responses
- [ ] **D.** More input tokens

**Why**

"What is the refund window for enterprise customers?" and "What is the refund window?" are semantically close and have different answers. A loose threshold turns your cache into a hallucination source that no guardrail will catch, because the answer is well-formed and was once correct.

| Option | Why this option |
| --- | --- |
| A | Marginal. |
| B ✓ | Correct. |
| C | Caching is faster. |
| D | Fewer, if anything. |

*See: Domain 4 → Caching risk*

---

### d4-023

Which two reduce the cost of a vector store? (Choose 2.)

- [x] **A.** Lower embedding dimensionality where quality permits
- [x] **B.** Binary or quantised embeddings where supported
- [ ] **C.** More chunk overlap
- [ ] **D.** Higher top-k

**Why**

Storage cost scales with vectors × bytes per vector. Both options shrink the second factor. Overlap increases the first, and top-k is a query-time parameter that stores nothing.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Increases vector count. |
| D | Query-time only. |

*See: Domain 4 → Storage cost*

---

### d4-024

Which statement about Provisioned Throughput commitment terms is correct?

- [ ] **A.** There is no commitment
- [x] **B.** Commitments are typically 1-month or 6-month, with longer terms at lower effective rates
- [ ] **C.** Commitments are hourly
- [ ] **D.** Commitments are 3 years only

**Why**

Longer commitment, lower effective rate — the usual AWS shape. A no-commitment option exists for evaluation, but it is priced accordingly and is not how you run production.

| Option | Why this option |
| --- | --- |
| A | Committed terms are the norm for production. |
| B ✓ | Correct. |
| C | Hourly is the billing granularity, not the commitment. |
| D | No. |

*See: Domain 4 → Provisioned Throughput*

---

### d4-025

An application makes three sequential model calls to answer one question: classify, retrieve-and-answer, then summarise. Which two optimisations are worth evaluating? (Choose 2.)

- [x] **A.** Merge the classify step into the main call using structured output, if quality allows
- [x] **B.** Drop the summarise step and instruct the main call to produce a concise answer directly
- [ ] **C.** Add a fourth verification call
- [ ] **D.** Increase temperature on all three

**Why**

Three calls means three round trips and three prompts. Collapsing steps that do not need to be separate cuts cost and latency proportionally — but measure quality before and after, because sometimes the separation is what makes it work.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Adds cost and latency. |
| D | Not an optimisation. |

*See: Domain 4 → Call reduction*

---

### d4-026

Which two situations justify keeping a larger context rather than aggressively trimming? (Choose 2.)

- [x] **A.** Evaluation shows answer quality drops materially with less context
- [x] **B.** The task genuinely requires cross-referencing many passages
- [ ] **C.** The team prefers it
- [ ] **D.** Cost is not being measured

**Why**

Optimisation is not dogma. If measurement shows the context earns its cost, keep it. What is not acceptable is either extreme held without evidence.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Not a reason. |
| D | That is a gap to fix, not a justification. |

*See: Domain 4 → Evidence-based tuning*

---

### d4-027

What does "right-sizing" mean in the context of foundation models?

- [x] **A.** Choosing the smallest model that meets the quality bar for each task
- [ ] **B.** Always choosing the newest model
- [ ] **C.** Choosing the model with the most parameters
- [ ] **D.** Matching the model to the size of the S3 bucket

**Why**

Per task, not per application. A single product may right-size to three different models: a tiny one for intent classification, a mid-tier for RAG answers, a frontier model for the rare hard analysis.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Newest is not automatically right. |
| C | Bigger is not better if smaller suffices. |
| D | Nonsense. |

*See: Domain 4 → Right-sizing*

---

### d4-028

Which two are reasonable responses to sustained `ThrottlingException` rates in production? (Choose 2.)

- [x] **A.** Request a service quota increase for the model and region
- [x] **B.** Adopt Provisioned Throughput for the steady portion of the load
- [ ] **C.** Retry immediately without backoff
- [ ] **D.** Increase output token limits

**Why**

Sustained throttling means demand exceeds allocated capacity, so you need more capacity — either a higher shared-pool quota or dedicated capacity. Tight retries amplify congestion, and larger outputs consume more of the capacity you are already short of.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Makes it worse. |
| D | Consumes more capacity. |

*See: Domain 4 → Capacity management*

---

### d4-029

Which two are true of the Bedrock flex / lower-priority service tiers where offered? (Choose 2.)

- [x] **A.** They trade higher or more variable latency for a lower price
- [x] **B.** They suit non-urgent workloads that can tolerate delay
- [ ] **C.** They guarantee the lowest latency
- [ ] **D.** They are required for streaming

**Why**

Service tiers are a latency-for-price dial alongside batch and on-demand. The pattern to remember: the less you demand in responsiveness, the less you pay.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | That is the priority tier, at higher cost. |
| D | Unrelated. |

*See: Domain 4 → Service tiers*

---

### d4-030 *(hard)*

A cost review finds that 30% of Bedrock spend comes from a nightly job that summarises documents already summarised the previous night. What is the correct fix?

- [ ] **A.** Move the job to a cheaper model
- [x] **B.** Add change detection so only new or modified documents are summarised, and persist previous summaries
- [ ] **C.** Run the job less often
- [ ] **D.** Increase batch size

**Why**

The work itself is redundant, so no amount of making it cheaper is the right answer. Track content hashes or modification timestamps, store the outputs, and process only the delta — this eliminates the spend rather than discounting it.

| Option | Why this option |
| --- | --- |
| A | Cheaper waste is still waste. |
| B ✓ | Correct. |
| C | Reduces frequency of the waste, not the waste. |
| D | Processes the same redundant work. |

*See: Domain 4 → Eliminating redundant work*

---
