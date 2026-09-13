---
title: Domain 5 questions — Testing, Validation, Debugging
source: src/assets/data/q-d5.js
group: Practice
---

# Domain 5 questions — Testing, Validation, Debugging


11% of scored content. **30 questions.** Every item is original, written against the published AIP-C01 exam guide. Correct option(s) are marked `[x]`.

### d5-001

A RAG evaluation reports context relevance 0.45 and faithfulness 0.95. What does this indicate?

- [ ] **A.** The model is hallucinating
- [x] **B.** Retrieval is bringing back poor passages, but the model is faithfully using what it is given
- [ ] **C.** The evaluation is broken
- [ ] **D.** The guardrail is too strict

**Why**

High faithfulness with low context relevance is the classic "garbage in, faithful garbage out" signature. The model is doing its job perfectly on bad evidence. Fix retrieval — chunking, hybrid search, reranking, metadata filters — not the prompt.

| Option | Why this option |
| --- | --- |
| A | It is faithfully using the context; that is the opposite of hallucinating. |
| B ✓ | Correct. |
| C | The split is exactly what the metrics are for. |
| D | Guardrails do not affect retrieval scores. |

*See: Domain 5 → RAG metrics*

---

### d5-002

Which two evaluation approaches does Amazon Bedrock support natively? (Choose 2.)

- [x] **A.** Automatic evaluation with built-in metrics against your dataset
- [x] **B.** Human evaluation using your own workforce or an AWS-managed team
- [ ] **C.** Automatic retraining of the base model
- [ ] **D.** Automatic prompt generation from CloudTrail

**Why**

Bedrock evaluation jobs cover automatic metric scoring, LLM-as-a-judge, and human workflows — plus dedicated RAG evaluation that scores retrieval and generation separately.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Base models are never retrained by you. |
| D | Not a feature. |

*See: Domain 5 → Bedrock evaluations*

---

### d5-003

Why should temperature be fixed at 0 during evaluation runs?

- [ ] **A.** It makes the model more accurate
- [x] **B.** It removes sampling variance so score differences reflect the change you made, not randomness
- [ ] **C.** It reduces cost
- [ ] **D.** It is required by Bedrock

**Why**

If your scores wobble ±6% run to run, you cannot detect a 4% improvement. Pin temperature and top-p, fix the dataset, and pin the judge model version too if you use LLM-as-a-judge.

| Option | Why this option |
| --- | --- |
| A | It reduces variance, not error. |
| B ✓ | Correct. |
| C | No cost effect. |
| D | Not required. |

*See: Domain 5 → Evaluation methodology*

---

### d5-004

Which metric family is most appropriate for evaluating summarisation against reference summaries?

- [x] **A.** ROUGE
- [ ] **B.** Latency percentiles
- [ ] **C.** Token count
- [ ] **D.** Cosine distance of embeddings only

**Why**

ROUGE measures n-gram overlap with reference summaries and is the conventional automatic metric for summarisation. Its weakness — it rewards surface overlap over meaning — is why semantic metrics such as BERTScore and LLM-as-a-judge are usually run alongside it.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Performance, not quality. |
| C | Not a quality metric. |
| D | A useful complement, not the standard summarisation metric. |

*See: Domain 5 → Metrics*

---

### d5-005 *(hard)*

An LLM-as-a-judge evaluation gives model A a higher score than model B, but human reviewers prefer B. What are the two most likely explanations? (Choose 2.)

- [x] **A.** The judge rubric does not capture what the humans actually value
- [x] **B.** The judge model has a stylistic bias — for example favouring longer or more confident answers
- [ ] **C.** The judge model is broken
- [ ] **D.** Model B is objectively worse

**Why**

Judge models have well-documented biases toward length, verbosity and assertive tone, and a vague rubric lets those biases dominate. The fix is to calibrate: score a sample with both humans and the judge, measure agreement, and tighten the rubric until they track.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Bias is not brokenness. |
| D | Human preference is the ground truth you were approximating. |

*See: Domain 5 → LLM-as-a-judge*

---

### d5-006

Users report the assistant "forgets" earlier parts of long conversations. What is the most likely cause?

- [ ] **A.** The model has a memory leak
- [x] **B.** Conversation history is being truncated to fit the context window
- [ ] **C.** The guardrail is deleting messages
- [ ] **D.** The vector store is full

**Why**

Models are stateless; history is resent each turn. When it no longer fits, something drops it — usually the oldest turns, usually silently. Fix with rolling summarisation, a managed memory store such as AgentCore Memory, or a larger window.

| Option | Why this option |
| --- | --- |
| A | Not a thing. |
| B ✓ | Correct. |
| C | Guardrails block, they do not prune history. |
| D | Unrelated. |

*See: Domain 5 → Conversation troubleshooting*

---

### d5-007

Which two AWS capabilities help trace a slow multi-step generative request end to end? (Choose 2.)

- [x] **A.** AWS X-Ray traces across API Gateway, Lambda and downstream calls
- [x] **B.** The Bedrock Agents trace showing per-step reasoning and tool timings
- [ ] **C.** S3 access logs
- [ ] **D.** IAM Access Analyzer

**Why**

X-Ray gives you the distributed picture; the agent trace gives you the inside of the black box — which step, which tool, how long. AgentCore Observability extends the same idea across AgentCore resources.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Object access, not request latency. |
| D | Permission analysis. |

*See: Domain 5 → Observability*

---

### d5-008

A model returns truncated JSON. What should you check first?

- [ ] **A.** The guardrail configuration
- [x] **B.** `stopReason` — if it is `max_tokens`, raise maxTokens or shorten the required output
- [ ] **C.** The vector store
- [ ] **D.** IAM permissions

**Why**

`stopReason` tells you precisely why generation stopped. `max_tokens` means you clipped it; `stop_sequence` means one of your own stop strings fired — a real hazard when generating JSON with a `}` stop sequence.

| Option | Why this option |
| --- | --- |
| A | Guardrails block, they do not truncate mid-structure. |
| B ✓ | Correct. |
| C | Unrelated. |
| D | Would produce an authorisation error. |

*See: Domain 5 → Output troubleshooting*

---

### d5-009

Which two are appropriate for testing a generative feature before general release? (Choose 2.)

- [x] **A.** Shadow testing: run the new configuration on live traffic without showing results to users, and compare offline
- [x] **B.** Canary release to a small percentage of users with quality and latency monitoring
- [ ] **C.** Release to all users and watch social media
- [ ] **D.** Skip testing because the model is managed

**Why**

Shadow mode measures on real traffic at zero user risk; canary limits blast radius when you are ready to expose it. Both are standard, and both apply to model swaps and prompt changes, not just code.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Not a testing strategy. |
| D | The model being managed changes nothing about your application's behaviour. |

*See: Domain 5 → Release strategy*

---

### d5-010

What is the purpose of a golden dataset in generative AI testing?

- [ ] **A.** To train the model
- [x] **B.** A fixed, curated set of inputs with known-good outputs used to detect regressions across changes
- [ ] **C.** To store embeddings
- [ ] **D.** To generate synthetic users

**Why**

Without a stable reference set you cannot tell improvement from noise. The golden set is your regression suite: run it on every prompt change, model change and retrieval change, and treat a drop as a build failure.

| Option | Why this option |
| --- | --- |
| A | Not training data. |
| B ✓ | Correct. |
| C | No. |
| D | No. |

*See: Domain 5 → Regression testing*

---

### d5-011 *(hard)*

After a knowledge base re-sync, some answers cite documents that were deleted last month. What are the two most likely causes? (Choose 2.)

- [x] **A.** The deletion happened in a source location the data source does not cover, so the vectors were never removed
- [x] **B.** A semantic or response cache is still serving pre-deletion answers
- [ ] **C.** The foundation model memorised them
- [ ] **D.** Guardrails cached the content

**Why**

Two boring, common causes. Either the sync never saw the deletion — wrong prefix, wrong data source, a copy left elsewhere — or a cache upstream of retrieval is replaying old answers. Check the retrieval result directly with the Retrieve API to separate the two.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Base models are not updated by your documents. |
| D | Guardrails do not cache content. |

*See: Domain 5 → Stale data*

---

### d5-012

Which two CloudWatch signals are most useful for a Bedrock-backed API? (Choose 2.)

- [x] **A.** Invocation count, latency and error/throttle counts per model
- [x] **B.** Input and output token counts per application inference profile
- [ ] **C.** EBS volume queue depth
- [ ] **D.** Route 53 health check status

**Why**

Those two answer the operational questions that actually come up: is it working and how fast, and what is it costing and why. Everything else is infrastructure noise for this workload.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Irrelevant to a serverless model API. |
| D | Not the signal. |

*See: Domain 5 → Monitoring*

---

### d5-013

A guardrail intervenes on 12% of legitimate requests. Which metric is this, and what is the correct next step?

- [ ] **A.** False negative rate; loosen the guardrail immediately
- [x] **B.** False positive rate; measure per category on a labelled set and tune the offending category rather than the whole guardrail
- [ ] **C.** Recall; add more documents
- [ ] **D.** Precision of retrieval; change chunking

**Why**

Blocking legitimate content is a false positive. Diagnose which policy and which category is responsible before touching anything — blanket loosening trades a usability problem for a safety one.

| Option | Why this option |
| --- | --- |
| A | A false negative is letting bad content through. |
| B ✓ | Correct. |
| C | Unrelated. |
| D | Unrelated. |

*See: Domain 5 → Guardrail tuning*

---

### d5-014

Which two are true about A/B testing a foundation model change? (Choose 2.)

- [x] **A.** You need a metric that reflects user value, not just an automatic score
- [x] **B.** You need enough traffic and duration for the result to be statistically meaningful
- [ ] **C.** One day of data is always sufficient
- [ ] **D.** Automatic metrics alone are always conclusive

**Why**

Automatic scores are proxies. The decision metric should be something you actually care about — task completion, escalation rate, thumbs-up rate — measured over enough traffic to distinguish signal from weekday effects.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Rarely. |
| D | They correlate imperfectly with user value. |

*See: Domain 5 → Experimentation*

---

### d5-015

An agent produces correct answers in testing but fails in production with tool errors. What is the first diagnostic artifact to inspect?

- [ ] **A.** The CloudFront cache
- [x] **B.** The agent trace, which shows tool inputs, outputs and errors per step
- [ ] **C.** The S3 bucket policy
- [ ] **D.** The model card

**Why**

The trace shows exactly which tool was called with which arguments and what came back. Production-only failures are usually environmental — a missing IAM permission, a VPC route, a different endpoint — and the trace error surfaces that in seconds.

| Option | Why this option |
| --- | --- |
| A | Not in the path. |
| B ✓ | Correct. |
| C | Possibly implicated later, but not the first artifact. |
| D | Documentation. |

*See: Domain 5 → Agent debugging*

---

### d5-016

Which two indicate that a hallucination problem is caused by retrieval rather than generation? (Choose 2.)

- [x] **A.** Inspecting retrieval results shows the correct passage was never returned
- [x] **B.** Context relevance scores are low while faithfulness is high
- [ ] **C.** The answer contradicts a passage that was retrieved
- [ ] **D.** The model invents citations to documents that were retrieved

**Why**

Always separate the two stages. If the evidence never arrived, it is a retrieval failure and no prompt change will fix it. If the evidence arrived and the answer contradicts it, that is generation.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | That is a generation failure — the evidence was there. |
| D | Also generation: it had the documents and misused them. |

*See: Domain 5 → Diagnosing hallucination*

---

### d5-017

What is the most reliable way to detect a regression after changing the chunking strategy?

- [ ] **A.** Ask a few colleagues
- [x] **B.** Re-run the golden dataset through a RAG evaluation job and compare retrieval and generation scores before and after
- [ ] **C.** Check that the sync completed
- [ ] **D.** Look at CloudWatch latency

**Why**

A chunking change alters what is retrievable, so it must be validated with retrieval metrics specifically. A green sync tells you ingestion worked, not that retrieval got better — and it is entirely possible to make it worse while everything looks healthy.

| Option | Why this option |
| --- | --- |
| A | Not systematic. |
| B ✓ | Correct. |
| C | Confirms ingestion, not quality. |
| D | Performance, not quality. |

*See: Domain 5 → Regression testing*

---

### d5-018

Which two describe good synthetic test data practice for a generative application? (Choose 2.)

- [x] **A.** Generate adversarial and edge-case inputs, including injection attempts and out-of-scope questions
- [x] **B.** Include questions whose correct answer is "I don't know" or "not in the sources"
- [ ] **C.** Only test happy paths
- [ ] **D.** Reuse production PII as test data

**Why**

The interesting failures live at the edges. A test set that never asks an unanswerable question cannot detect the most damaging failure mode there is: confident invention. And production PII in a test corpus is a compliance incident waiting to happen.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Misses every important failure. |
| D | Never. |

*See: Domain 5 → Test data*

---

### d5-019 *(hard)*

Latency p50 is 900 ms but p99 is 14 seconds. Traces show the slow requests have unusually long retrieved contexts. Which two changes address this? (Choose 2.)

- [x] **A.** Cap the total retrieved context size, truncating or reranking down to a budget
- [x] **B.** Investigate why some queries retrieve so much — for example an oversized parent chunk in hierarchical chunking
- [ ] **C.** Increase maxTokens
- [ ] **D.** Add another collaborator agent

**Why**

A long tail driven by input size is a context budget problem. Impose a hard ceiling so no single request can blow the latency budget, and find the structural cause — usually a handful of enormous parent chunks or documents that chunked badly.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Makes the tail worse. |
| D | Adds latency. |

*See: Domain 5 → Latency troubleshooting*

---

### d5-020

Which statement about evaluating an agent (as opposed to a single model call) is most accurate?

- [ ] **A.** Only the final answer matters
- [x] **B.** You should evaluate intermediate behaviour too — tool selection, argument correctness, number of steps and recovery from errors
- [ ] **C.** Agents cannot be evaluated
- [ ] **D.** Latency is the only meaningful metric

**Why**

An agent that reaches the right answer after eight wasted tool calls is expensive, slow and fragile — and it will fail differently tomorrow. Step-level metrics are what tell you whether the behaviour is sound or merely lucky.

| Option | Why this option |
| --- | --- |
| A | It matters, but it hides how it got there. |
| B ✓ | Correct. |
| C | They can. |
| D | One dimension of several. |

*See: Domain 5 → Agent evaluation*

---

### d5-021

Which two are reasonable automated checks in a CI pipeline for a prompt change? (Choose 2.)

- [x] **A.** Run the golden dataset and fail the build if quality drops beyond a threshold
- [x] **B.** Run adversarial prompts and fail if any produce disallowed output
- [ ] **C.** Verify the prompt is under 100 characters
- [ ] **D.** Confirm the prompt contains no vowels

**Why**

Prompts are code and deserve a test suite: a regression gate on quality and a safety gate on adversarial inputs. Both should fail the build, not produce a warning nobody reads.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Arbitrary. |
| D | Nonsense. |

*See: Domain 5 → CI for prompts*

---

### d5-022

Users report inconsistent answers to identical questions. Temperature is 0.9. What is the first thing to try?

- [x] **A.** Lower temperature toward 0 for this deterministic task and re-measure
- [ ] **B.** Change the model
- [ ] **C.** Add more documents
- [ ] **D.** Increase top-k

**Why**

Sampling variance is the obvious suspect when identical inputs produce different outputs. Lower temperature first — it is a one-line change and free to test — before touching anything structural.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Premature. |
| C | Does not address variance. |
| D | Does not address variance. |

*See: Domain 5 → Consistency*

---

### d5-023

What does "faithfulness" measure in RAG evaluation?

- [x] **A.** Whether the answer is supported by the retrieved context
- [ ] **B.** Whether the retrieved context is relevant to the question
- [ ] **C.** How fast the answer was produced
- [ ] **D.** How long the answer is

**Why**

Faithfulness is answer-versus-context. Context relevance is context-versus-question. Keeping those two straight is the single most useful diagnostic skill in Domain 5 — they point at completely different fixes.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | That is context relevance. |
| C | Latency. |
| D | Not a quality metric. |

*See: Domain 5 → RAG metrics*

---

### d5-024

Which two are sensible alarms for a production generative AI service? (Choose 2.)

- [x] **A.** Throttle rate above a threshold over 5 minutes
- [x] **B.** p99 latency above the SLO for a sustained period
- [ ] **C.** Any single guardrail intervention
- [ ] **D.** Number of S3 objects in the source bucket

**Why**

Alarm on sustained conditions that require action. A single guardrail intervention is the system working correctly — alarming on it produces noise that trains people to ignore alarms. Track the rate instead, and alarm on unusual spikes.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Normal operation. |
| D | Not an operational signal. |

*See: Domain 5 → Alerting*

---

### d5-025

A team wants to know whether a new model version changed behaviour on rare edge cases that the golden dataset does not cover. What is the most practical approach?

- [ ] **A.** Assume no change
- [x] **B.** Shadow the new model on live traffic and diff its responses against the current model, sampling the largest divergences for human review
- [ ] **C.** Read the model card only
- [ ] **D.** Increase temperature to explore

**Why**

Response diffing on live traffic surfaces exactly the cases your curated set missed, because production traffic contains the long tail by definition. Ranking by divergence puts the reviewer's attention where behaviour actually changed.

| Option | Why this option |
| --- | --- |
| A | Model versions do change behaviour. |
| B ✓ | Correct. |
| C | Necessary but not sufficient. |
| D | Adds noise, not coverage. |

*See: Domain 5 → Model migration testing*

---

### d5-026

Which two are true about OpenTelemetry-based instrumentation for GenAI applications on AWS? (Choose 2.)

- [x] **A.** It can emit traces and metrics to CloudWatch and other backends
- [x] **B.** It helps correlate model calls, tool calls and retrieval steps in one trace
- [ ] **C.** It replaces IAM
- [ ] **D.** It reduces token cost

**Why**

OTel gives you vendor-neutral, correlated traces across the whole request path, which is the only sane way to debug a multi-step agent. AgentCore Observability builds on the same foundation.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Unrelated. |
| D | No cost effect. |

*See: Domain 5 → Instrumentation*

---

### d5-027 *(hard)*

A knowledge base returns good chunks for English queries but poor results for the same questions asked in Spanish, over an English-only corpus. What is the most likely cause and fix?

- [ ] **A.** The vector store is misconfigured; rebuild it
- [x] **B.** The embedding model is not multilingual — switch to a multilingual embedding model and re-index, or translate queries before embedding
- [ ] **C.** The foundation model does not speak Spanish; change the model
- [ ] **D.** Chunk size is too small; increase it

**Why**

Cross-lingual retrieval requires a shared embedding space across languages. Either use a multilingual embedding model (which means re-indexing the whole corpus) or translate the query into the corpus language before embedding — the cheaper fix if re-indexing is expensive.

| Option | Why this option |
| --- | --- |
| A | The store is doing what it was told. |
| B ✓ | Correct. |
| C | Generation is fine; retrieval is the failure. |
| D | Unrelated to language. |

*See: Domain 5 → Multilingual troubleshooting*

---

### d5-028

Which is the correct order for diagnosing a poor RAG answer?

- [ ] **A.** Change the model, then the prompt, then retrieval
- [x] **B.** Inspect what was retrieved, then check whether the prompt uses it correctly, then consider model or parameter changes
- [ ] **C.** Increase top-k, then increase chunk size, then increase temperature
- [ ] **D.** Rebuild the vector store first

**Why**

Work along the pipeline from the evidence outward. Look at the retrieved chunks first — that one step resolves the majority of RAG complaints, and it stops you tuning a prompt that was never the problem.

| Option | Why this option |
| --- | --- |
| A | Starts at the most expensive change. |
| B ✓ | Correct. |
| C | Random knob-turning. |
| D | Drastic and usually unnecessary. |

*See: Domain 5 → Diagnostic method*

---

### d5-029

Which two statements about human evaluation are correct? (Choose 2.)

- [x] **A.** It is the ground truth against which automatic metrics should be calibrated
- [x] **B.** It is expensive and slow, so it is usually applied to a sample rather than everything
- [ ] **C.** It is unnecessary once you have automatic metrics
- [ ] **D.** It always agrees with ROUGE

**Why**

Automatic metrics are cheap approximations of human judgement and must be validated against it periodically. The practical pattern: automatic metrics on every run, human review on a sample, recalibrate when they diverge.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Automatic metrics drift from human preference. |
| D | It frequently does not. |

*See: Domain 5 → Human evaluation*

---

### d5-030

An intermittent `AccessDeniedException` appears only for requests routed to a particular region. What is the most likely cause?

- [x] **A.** The model is not enabled, or the IAM policy does not permit it, in that region — a cross-region inference profile is routing there
- [ ] **B.** The vector store is down
- [ ] **C.** The prompt is too long
- [ ] **D.** Temperature is invalid

**Why**

Cross-region inference makes region-specific configuration gaps intermittent rather than constant, which is what makes them confusing. Model access is enabled per region, and IAM resource ARNs are region-qualified — both must cover every region in the profile.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Would be a different error. |
| C | Would be a validation error. |
| D | Would be a validation error. |

*See: Domain 5 → Cross-region troubleshooting*

---
