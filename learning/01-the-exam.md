---
title: The exam, decoded
source: src/content/exam.html
group: Orientation
---

# The exam, decoded

## 1. The facts, in one table

| Term | Definition |
| --- | --- |
| **Full name** | AWS Certified Generative AI Developer – Professional |
| **Exam code** | `AIP-C01` |
| **Level** | Professional (the tier above Associate; there is no prerequisite certification) |
| **Questions** | 75 total — **65 scored, 10 unscored**. The unscored ones are not marked and are being trialled for future exams. You cannot tell which is which, so answer everything as if it counts. |
| **Question types** | Multiple choice (one correct) and multiple response (choose 2 or 3). AWS has been introducing additional formats such as ordering and matching across its exams — read each instruction line. |
| **Duration** | 180 minutes — 2.4 minutes per question |
| **Cost** | $300 USD |
| **Scoring** | Scaled 100–1000. **750 to pass.** Compensatory: you do not need to pass each domain individually, only the total. |
| **Delivery** | Pearson VUE test centre, or online proctored from home |
| **Languages** | English, Japanese, Korean, and Simplified Chinese |
| **Validity** | 3 years |
| **History** | Announced November 2025 as part of an AI certification portfolio expansion. Beta registration opened 18 November 2025; the beta window closed 31 March 2026. Standard registration is now open. It is one of the newest AWS certifications. |

> **Info — Compensatory scoring, and what it means for strategy**
>
> You do not have to clear a bar in every domain. A weak Domain 5 can be carried by a strong Domain 1. That said — Domain 5 is only 11%, so *strategically* ignoring it costs you at most about 7 questions, while ignoring Domain 1 costs you about 20. Spend your revision time proportionally to the weights, not to how interesting you find the topic.

## 2. The five domains and what each really covers

*Approximate scored questions: D1 ≈ 20, D2 ≈ 17, D3 ≈ 13, D4 ≈ 8, D5 ≈ 7*

| Item | Value |
| --- | --- |
| D1 · FM integration, data, compliance | 31 |
| D2 · Implementation & integration | 26 |
| D3 · Safety, security, governance | 20 |
| D4 · Operational efficiency | 12 |
| D5 · Testing & troubleshooting | 11 |

### Domain 1 — Foundation Model Integration, Data Management and Compliance · 31%

The biggest domain, and the one that carries the most RAG content. Expect questions on:

- Choosing a foundation model against real constraints — capability, context window, latency, cost, modality, region availability, licensing
- Dynamic model switching and inference-mode selection (on-demand, batch, provisioned, cross-region profiles)
- Retrieval design end to end: chunking strategies, embedding models, vector store selection, hybrid search, reranking, metadata filtering, GraphRAG
- Bedrock Knowledge Bases: data sources, sync, parsing, custom transformation
- Data management, governance and compliance — residency, PII, encryption, auditability, licensing

**Where people lose marks:** treating chunking as a detail. It is not. Several questions turn on knowing exactly which chunking strategy addresses which symptom.

### Domain 2 — Implementation and Integration · 26%

The build domain. Expect:

- Bedrock APIs — `InvokeModel` vs `Converse` vs the streaming variants, and why Converse is the portability answer
- Tool use / function calling, and the fact that the model never executes anything itself
- Bedrock Agents: action groups, Return of Control, session state, memory, multi-agent collaboration
- AgentCore: Runtime, Memory, Gateway, Identity, Code Interpreter, Browser, Observability
- When to use an agent vs Bedrock Flows vs Step Functions vs plain Lambda
- Prompt engineering at depth, prompt management and versioning
- Customisation: fine-tuning, custom model import, distillation — and when *not* to
- Streaming architectures and integration patterns

**Where people lose marks:** the agent-vs-Step-Functions judgement call, and Return of Control, which is easy to read past and is the correct answer more often than you would expect.

### Domain 3 — AI Safety, Security and Governance · 20%

Bigger than most candidates expect, and the domain where instinct from other clouds transfers worst. Expect:

- Every Bedrock Guardrails policy type and exactly what each one catches
- Contextual grounding checks and Automated Reasoning checks — probabilistic vs formal verification
- Prompt injection, direct and indirect, and defences that actually work
- IAM for Bedrock, condition keys, SCPs, PrivateLink, KMS
- Logging, auditability, data residency, responsible AI, fairness, transparency

**Where people lose marks:** picking the option that solves a security problem with a prompt instruction. It is never the answer.

### Domain 4 — Operational Efficiency and Optimization · 12%

Small but very learnable — the highest marks-per-hour of any domain. Expect token economics, prompt caching, batch, provisioned throughput, distillation, routing, caching layers, quotas and throttling, latency optimisation and cost attribution.

**Where people lose marks:** reaching for a micro-optimisation when the question is really about model right-sizing.

### Domain 5 — Testing, Validation and Troubleshooting · 11%

The smallest domain and the one that most rewards real experience. Expect Bedrock evaluations, RAG metrics, LLM-as-a-judge, A/B and shadow testing, observability, and a lot of symptom-to-cause reasoning.

**Where people lose marks:** failing to separate retrieval failures from generation failures. Learn that distinction cold and this domain becomes easy.

## 3. What the questions actually look like

Professional-level AWS questions share a structure. Once you can see it, they become much less intimidating.

#### Anatomy of a scenario question

· Context A financial services company is building a document summarisation feature. Documents are 150–400 pages.

· Constraint Summaries must be produced within 5 minutes of upload, are **not user-facing in real time**, and **cost is the primary constraint**.

· Question Which approach best fits?

Three of the four options will *work*. Only one satisfies the constraint. Here, "not user-facing in real time" plus "cost is the primary constraint" is the batch-inference signal, and everything else in the stem is scenery.

### The constraint keywords that decide answers

| If the stem says… | It is steering you toward… |
| --- | --- |
| "with the least operational overhead" | The managed service. Knowledge Bases over a custom pipeline. Bedrock Agents over hand-rolled orchestration. Q Business over building a UI. |
| "must not leave the EU / must remain in region X" | Regional endpoints, model availability check, and **no** cross-region inference profile spanning other regions. |
| "no human is waiting" / "overnight" / "backlog" | Batch inference. |
| "must be auditable" / "prove to a regulator" | Citations, model invocation logging, CloudTrail. For policy consistency: Automated Reasoning checks. |
| "exact part numbers / error codes are not found" | Hybrid search. |
| "answer lacks surrounding context" | Hierarchical chunking. |
| "knowledge changes daily / weekly" | RAG. Never fine-tuning. |
| "specific tone, format or task behaviour" | Fine-tuning — but only after prompting and few-shot have genuinely been tried. |
| "execution must stay in our environment" | Return of Control. |
| "guaranteed throughput" / "predictable latency under load" | Provisioned Throughput. |
| "the process is fixed and each step must be retryable and auditable" | Step Functions, not an agent. |
| "prevent the developer from disabling it" | IAM condition keys and SCPs — preventive, not detective. |

> **Exam — The single most useful habit**
>
> Read the **last sentence of the stem first**, then the constraint sentence, then the options, then the rest of the scenario only if you still need it. Most of a professional-exam stem is context that does not change the answer. You have 2.4 minutes per question; do not spend 90 seconds absorbing a company backstory.

## 4. How the wrong answers are built

Distractors on AWS professional exams are not random. They come in recognisable flavours, and spotting the flavour eliminates them fast.

#### TRAP 01 The Plausible-but-Heavier Option

Technically works, but involves building something AWS already manages. If a stem mentions operational overhead at all, this is a trap.

#### TRAP 02 The Right Idea, Wrong Layer

"Instruct the model in the system prompt not to…" as an answer to a security question. Or "increase top-k" as an answer to a generation problem. Correct-sounding, aimed at the wrong stage.

#### TRAP 03 The Over-Engineered Option

Multi-agent collaboration for a single lookup. Fine-tuning for a facts problem. Impressive, disproportionate, wrong.

#### TRAP 04 The Absolute (“Always / Never”)

"Always", "never", "guarantees", "eliminates all". Real engineering answers have trade-offs; distractors often do not.

#### TRAP 05 The Stale Architecture Fact

Something that was true two years ago — "custom models cannot be served on Bedrock", "guardrails only apply to output". Feature coverage has moved.

#### TRAP 06 The Adjacent Service Swap

Macie where you need Comprehend. Q Business where you need Bedrock. Real services doing a genuinely different job.

## 5. Timing and exam-day mechanics

#### Pacing & Time Budgeting

- 2.4 minutes per question average
- Target **25 questions per hour** — that leaves ~15 minutes at the end
- If a question is still unclear after 90 seconds: pick your best guess, flag it, move on
- There is no penalty for a wrong answer. **Never leave a question blank.**
- Multi-response questions take longer. Budget for it rather than panicking at question 60

#### Reviewing Flagged Questions

- Change an answer only if you find a concrete reason — a constraint you misread, a keyword you missed
- Do not change on a vague feeling. First instinct is right more often than second-guessing
- Re-read the constraint sentence, not the whole scenario
- If two options still look identical, one of them almost always violates a stated constraint. Find it.

### Online proctored versus test centre

|  | Test centre | Online proctored |
| --- | --- | --- |
| **Environment** | Controlled, quiet, someone else's problem | Your room must be empty, clear desk, no interruptions for 3 hours |
| **Setup risk** | Low | Webcam, microphone, bandwidth and a room scan; allow 30 minutes before start |
| **Interruptions** | Rare | A person entering the room can void your exam |
| **Best for** | Most people, especially a 3-hour professional exam | Those with no centre nearby and a genuinely controllable space |

> **Tip — Three hours is long**
>
> This is a real endurance factor and candidates routinely underestimate it. Take at least one full 180-minute mock in one sitting before exam day so the fatigue at question 55 is not a surprise. Eat first. If you are at a test centre you can usually take an unscheduled break, but the clock keeps running.

## 6. Do you need other certifications first?

**No.** There is no prerequisite. But be honest about the gap:

| Your background | Recommendation |
| --- | --- |
| Never used AWS | Do **Cloud Practitioner** or at least its content first — not for the badge, but because AIP-C01 assumes IAM, S3, Lambda, VPC and CloudWatch as background knowledge it will not explain. |
| AWS developer, no AI | Go straight for AIP-C01. Consider **AI Practitioner (AIF-C01)** as a cheap two-week confidence check on the AI vocabulary; it is foundational and much easier. |
| Data scientist / ML engineer, light on AWS | Straight for AIP-C01, but do the labs. Your ML instincts are useful; your knowledge of which AWS service does what is the gap. |
| Already hold AI Practitioner or ML Engineer – Associate | Straight for AIP-C01. Note that ML Engineer – Associate is mostly classical ML pipelines and transfers less than you would hope. |

> **Info — Where it sits in the portfolio**
>
> AWS retired **Machine Learning – Specialty** (last exam date 31 March 2026). The current AI/ML track is: AI Practitioner (foundational) → Machine Learning Engineer – Associate and Data Engineer – Associate (associate) → **Generative AI Developer – Professional** (professional). This one is the top of the generative AI line.

## 7. A first taste

Two questions in the exam's actual style. Do not worry about getting them right yet — you have not read anything. Notice the *shape*: how much of the stem is scenery, and where the constraint hides.
