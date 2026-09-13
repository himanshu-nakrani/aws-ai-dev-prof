---
title: Domain 5 — Testing, Validation, Debugging
source: src/content/domain5.html
group: Learn
exam_weight: 11%
---

# Domain 5 — Testing, Validation, Debugging

> **Exam — Domain 5 — 11% of scored content, roughly 7 questions**
>
> The smallest domain, and the one that most rewards having actually operated one of these systems. Almost everything here reduces to one skill: **locating which stage failed** before proposing a fix.

## 1. The one distinction that carries this domain

A RAG system has two independently-failing halves. Measure them separately, diagnose them separately, fix them separately.

| Metric | What it compares | What it measures |
| --- | --- | --- |
| **Context relevance** | Retrieved context ↔ the question | **Retrieval quality.** Did the right evidence come back? |
| **Faithfulness / groundedness** | The answer ↔ the retrieved context | **Generation quality.** Did the model stick to the evidence? |
| **Answer relevance** | The answer ↔ the question | Did it actually answer what was asked? |
| **Context coverage / recall** | Retrieved context ↔ all relevant content in the corpus | Did we miss relevant material that exists? |

*Where to spend effort, given the two scores. Darker = more likely to be the actual problem.*

| Signal | fix retrieval | fix prompt | fix corpus |
| --- | --- | --- | --- |
| Ctx rel LOW · faith HIGH | 9 | 1 | 3 |
| Ctx rel HIGH · faith LOW | 1 | 9 | 1 |
| Both LOW | 7 | 5 | 4 |
| Both HIGH, user unhappy | 2 | 4 | 8 |

#### Context relevance LOW, faithfulness HIGH

Garbage in, faithful garbage out. The model is doing its job perfectly on bad evidence. **Fix retrieval** — chunking, hybrid search, reranking, metadata filters. Do not touch the prompt.

#### Context relevance HIGH, faithfulness LOW

The right evidence arrived and the answer drifted. **Fix generation** — a firmer "answer only from the passages" instruction, an explicit escape hatch, lower temperature, and a contextual grounding check to catch what slips through.

#### Both LOW

Start at retrieval. There is no point tuning generation against evidence that never arrives.

#### Both HIGH, users still unhappy

The answer is faithful to a corpus that does not contain what users need. This is a **content problem**, not an engineering one — and it is the failure mode engineers are slowest to consider.

## 2. Evaluation on Bedrock

| Type | How it works | Use for |
| --- | --- | --- |
| **Automatic evaluation** | Built-in metric scoring against your dataset — accuracy, robustness, toxicity | Fast, repeatable regression checks on every change |
| **LLM-as-a-judge** | A model scores outputs against a rubric you define | Nuanced quality where exact-match metrics fail. Cheaper and faster than humans |
| **Human evaluation** | Your own workforce or an AWS-managed team, with a defined task and rubric | Ground truth. Calibrate your automatic metrics and judges against it |
| **RAG evaluation** | Scores **retrieval and generation separately** | Everything in section 1. The reason you can diagnose rather than guess |

### Metrics worth knowing by name

| Metric | Measures | Weakness |
| --- | --- | --- |
| **ROUGE** | N-gram overlap with a reference — the conventional summarisation metric | Rewards surface overlap; a correct paraphrase scores badly |
| **BLEU** | Precision-oriented n-gram overlap; from machine translation | Same problem, more so |
| **BERTScore** | Semantic similarity using contextual embeddings | Better at paraphrase; still no notion of factual correctness |
| **Exact match / F1** | Extractive question answering | Only usable when there is one right string |
| **LLM-as-a-judge rubric score** | Whatever you define — helpfulness, correctness, tone | Judge bias toward length and confident phrasing |
| **Toxicity / safety scores** | Harmful content rates | Threshold-sensitive; needs its own labelled set |

> **Warning — LLM judges have measurable biases**
>
> They favour longer answers, more confident phrasing, and outputs that resemble their own style. If the judge prefers model A but humans prefer model B, the judge is probably right about style and wrong about value. Calibrate: score a sample with both, measure agreement, tighten the rubric until they track. And pin the judge model version, or your baseline moves under you.

### Evaluation hygiene

- **Temperature 0**, fixed top-p. Otherwise your scores wobble and you cannot detect a real 4% improvement.
- **A fixed golden dataset.** Curated inputs with known-good outputs. Run it on every prompt change, model change and retrieval change; treat a drop as a build failure.
- **Include unanswerable questions.** A test set that never asks something out of scope cannot detect confident invention — the most damaging failure mode there is.
- **Include adversarial inputs.** Injection attempts, out-of-scope requests, hypothetical framings.
- **Never use production PII as test data.**

## 3. Testing changes safely

| Technique | What it does | Risk to users | Best for |
| --- | --- | --- | --- |
| **Offline evaluation** | Golden dataset through the new configuration | None | Every change, always. The cheapest gate |
| **Shadow testing** | Run the new configuration on live traffic; show nobody; diff offline | None | Surfacing edge cases your golden set missed — production traffic contains the long tail by definition |
| **Canary** | Small percentage of real users, with monitoring | Bounded | Confirming real-world quality and latency before full rollout |
| **A/B test** | Split traffic, compare a metric that reflects user value | Bounded | Deciding between two viable options. Needs enough traffic and duration to be meaningful |

> **Exam — Migrating to a new model version**
>
> Offline evaluation catches what your golden set covers. For the rest, **shadow the new model and diff responses against the current one, then human-review the largest divergences**. That surfaces exactly the edge cases nobody curated a test for. "Read the model card and deploy" is not a testing strategy.

### CI for prompts and configuration

Prompts, chunking settings and guardrail thresholds are code. Gate them the same way:

- Run the golden dataset; fail the build if quality drops beyond a threshold
- Run adversarial prompts; fail if any produce disallowed output
- Version prompts in Bedrock Prompt Management so a rollback does not need a deployment

## 4. Observability

| Signal | Source | Answers |
| --- | --- | --- |
| Invocations, latency, errors, throttles per model | CloudWatch metrics | Is it working, and how fast? |
| Input and output tokens per application inference profile | CloudWatch metrics | What is it costing, and why is that changing? |
| The actual prompts and completions | Model invocation logging → CloudWatch or S3 | What was said? (Apply data protection policies) |
| Who called what, when, from where | CloudTrail | Audit and anomaly detection |
| Per-step reasoning, tool calls, KB lookups | Bedrock Agents trace | Why did the agent do that? |
| Metrics and traces across agent infrastructure | AgentCore Observability | Where is the time going in a multi-step agent? |
| End-to-end distributed traces | AWS X-Ray, OpenTelemetry | Which hop in the whole request is slow? |

### Alarms worth having

#### High-Priority Alarm Triggers

- Throttle rate above a threshold, sustained
- p99 latency above the SLO, sustained
- Error rate step change
- Guardrail intervention *rate* spiking
- Daily spend crossing a budget threshold

#### Low-Signal Anti-Patterns (Do Not Alarm)

- A single guardrail intervention — that is the system working
- Any individual slow request
- Anything that fires more than a few times a week without needing action

Noisy alarms train people to ignore alarms, which is worse than having none.

## 5. The troubleshooting playbook

Search for a symptom. These are the patterns the exam draws its scenario questions from.

> **Interactive widget (`symptomfinder`)**
>
> Symptom → diagnosis → fix lookup (Domain 5). Playable in the HTML study site.

## 6. Diagnostic method

Work along the pipeline from the evidence outward. In order:

#### 1. Look at what was actually retrieved

Call the `Retrieve` API directly with the failing question and read the chunks. This one step resolves the majority of RAG complaints, and it stops you tuning a prompt that was never the problem.

#### 2. Check whether the prompt uses the context correctly

Was the retrieved content actually inserted? Is the "answer only from the passages" instruction present? Is the question buried above 20k tokens of context? Is `stopReason` what you expect?

#### 3. Check the parameters

Temperature for consistency problems. `maxTokens` for truncation. Stop sequences for output that ends abruptly at a punctuation mark.

#### 4. Check the infrastructure

Throttling, permissions, region-specific model access, VPC routing. Intermittent failures that correlate with a region are usually a cross-region inference profile hitting a region where the model is not enabled or the IAM policy does not reach.

#### 5. Only then consider the model

Changing the model is the most expensive and least targeted intervention. It is occasionally right, and it is almost never the first thing to try.

> **Tip — For agents, start with the trace**
>
> The trace shows which tool was called, with which arguments, and what came back. Production-only agent failures are usually environmental — a missing IAM permission, a VPC route, a different endpoint — and the trace surfaces that in seconds where guessing takes hours.

## 7. Evaluating agents specifically

Final-answer accuracy hides how the agent got there. An agent that reaches the right answer after eight wasted tool calls is expensive, slow and fragile — and it will fail differently tomorrow. Score the behaviour:

| Dimension | Question | Why it matters |
| --- | --- | --- |
| Tool selection accuracy | Did it choose the right tool? | Wrong tool selection is nearly always an ambiguous description |
| Argument correctness | Were the parameters right? | Schema and description quality |
| Step efficiency | How many steps versus the minimum? | Directly drives cost and latency |
| Error recovery | Did it handle a tool failure sensibly? | Poor recovery is how loops start |
| Termination | Did it stop when it should? | Runaway loops are a cost incident |
| Task completion | Did the user get what they needed? | The outcome metric that matters |

## 8. Domain 5 check

Six questions. Aim for five.

- [Drill all 30 Domain 5 questions →](11-question-bank.md)
