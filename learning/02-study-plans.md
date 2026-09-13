---
title: Study plans: 8-week, 4-week, 10-day
source: src/content/studyplan.html
group: Orientation
---

# Study plans: 8-week, 4-week, 10-day

## 1. Pick the plan that matches your reality

Three plans. They differ in how much you can afford to skip, not in what matters. All three end the same way: mock exams until you are consistently above 800 on unseen questions.

## 8 weeks · beginner

**For:** new to AI, new to AWS, or both. Assumes ~12 hours a week — two weekday evenings and one weekend session. Total ≈ 100 hours, plus lab time.

#### Week 1 — Foundations, no AWS yet

Module 0 sections 1–5. What AI/ML/GenAI are, tokens, embeddings, how generation works, sampling parameters. Play with the tokenizer and sampler until temperature and top-p are intuitive, not memorised.

*Deliverable:* you can explain to a colleague why a model hallucinates, without using the word "hallucinate".

#### Week 2 — AWS foundations and the GenAI stack

Module 0 sections 6–10. IAM, S3, Lambda, regions, CloudWatch — only the parts that matter here. Then the AWS GenAI stack and the customisation ladder. **Open an AWS account this week.** Enable Bedrock model access in one region. Run your first `Converse` call from the CLI.

*Deliverable:* a working boto3 script that calls a model and prints the answer and the token usage.

#### Weeks 3–4 — Domain 1 (31%)

The biggest module, so give it two weeks. Model selection, embeddings, vector stores, chunking, the whole RAG pipeline, knowledge bases, data governance. Do Labs 1–3 in week 4: build a knowledge base, query it, then deliberately break retrieval and fix it.

*Deliverable:* a working RAG app over your own documents, and a written note on what changed when you switched chunking strategies. Drill Domain 1 to 75%+.

#### Week 5 — Domain 2 (26%)

Bedrock APIs, tool use, agents, AgentCore, orchestration choices, prompt engineering, customisation. Do Labs 4–5: a tool-using agent and a Return of Control flow.

*Deliverable:* an agent that calls two tools and does something useful. Drill Domain 2 to 75%+.

#### Week 6 — Domain 3 (20%)

Guardrails end to end, prompt injection, IAM, network, logging, responsible AI. Do Lab 6: build a guardrail and try to break it with your own injection payloads. This is genuinely fun and it is the fastest way to make the material stick.

*Deliverable:* a guardrail configuration you have attacked and tuned. Drill Domain 3 to 75%+.

#### Week 7 — Domains 4 and 5 (23% combined)

Cost, latency, throughput, quotas. Then evaluation, metrics, observability, troubleshooting. Do Labs 7–8: an evaluation harness and a cost-attribution setup. These are the smallest domains and the fastest wins.

*Deliverable:* both domains drilled to 75%+.

#### Week 8 — Consolidation and mocks

Full 180-minute mock on day 1. Whatever domain comes out weakest, re-read that module. Second mock mid-week. Cram sheet and flashcards daily. Third mock two days before. Do not learn new material in the last 48 hours — rest matters more than one extra topic.

*Gate:* two consecutive mocks above 800 on questions you have not seen before.

## 4 weeks · experienced

**For:** working AWS engineers who have shipped something with an LLM. Assumes ~12 hours a week. Total ≈ 50 hours.

#### Week 1 — Domain 1, hard

Skim Module 0 in one sitting (you will find one or two genuine gaps — most people do, usually around embedding dimensionality or the customisation ladder). Then all of Domain 1. Pay disproportionate attention to chunking strategies, hybrid search, vector store selection and data residency. Drill to 80%.

#### Week 2 — Domain 2

Focus on what is AWS-specific and easy to get wrong from general LLM experience: Converse vs InvokeModel, Return of Control, AgentCore components, agent vs Flows vs Step Functions, custom model serving. Build one agent even if you have built agents elsewhere — the Bedrock-specific mechanics are examinable. Drill to 80%.

#### Week 3 — Domains 3 and 4

Domain 3 is where non-AWS experience transfers worst: guardrail policy types, IAM condition keys, PrivateLink, cross-account guardrails, Automated Reasoning checks. Learn them explicitly. Domain 4 is mostly arithmetic and pricing shapes — a couple of evenings. Drill both to 80%.

#### Week 4 — Domain 5 and mocks

Domain 5 in two evenings, then three full mocks spread across the week with targeted re-reading between them. Cram sheet daily.

*Gate:* two consecutive mocks above 800.

## 10 days · crash

**For:** you already build this stuff daily and the exam is booked. Assumes 3–4 hours a day. This is a triage plan, not a learning plan — it will not save you if the fundamentals are missing.

#### Day 1 — Diagnostic

Take a full mock cold, before reading anything. The domain breakdown tells you where the next eight days go. Resist the urge to skip this — most people are wrong about where their gaps are.

#### Days 2–3 — Domain 1

Read the whole module. Chunking decision table, vector store table and the RAG pipeline stepper are the highest-value 45 minutes on the site. Drill Domain 1 twice.

#### Days 4–5 — Domain 2

Read the module. Memorise the orchestration decision table and the AgentCore component list. Drill twice.

#### Day 6 — Domain 3

Guardrail policy types cold. Every one, and exactly what it catches. Then IAM condition keys and the injection defence patterns. Drill twice.

#### Day 7 — Domains 4 and 5

Both in one day. Cost levers in order of magnitude; the retrieval-vs-generation diagnostic split. Drill both.

#### Day 8 — Mock and repair

Full mock. Review every single wrong answer properly — read the explanation for the options you did not pick, too.

#### Day 9 — Cram sheet, flashcards, retry missed

Use the "retry the ones I missed" mode. Flashcards on the Exam deck. Nothing new.

#### Day 10 — Final mock, then stop

Morning mock. Afternoon: skim the cram sheet once and stop. Sleep is worth more than the last topic.

> **Warning — Honest warning**
>
> If your diagnostic on day 1 comes in under 550, ten days is not enough and you should move the booking. A professional exam at $300 is not worth a coin flip.

## 2. The weekly rhythm that works

Whichever plan you pick, the shape of a productive week is the same. Most people fail by reading passively for 8 hours; the ratio below is what actually moves scores.

*If reading is more than about a third of your time, you are studying the way that feels productive rather than the way that works.*

| Item | Value |
| --- | --- |
| Reading / watching | 30 |
| Practice questions | 30 |
| Hands-on building | 30 |
| Review of mistakes | 10 |

#### High-Impact Study Habits

- Read the explanation for questions you got *right* — you may have been right for the wrong reason
- Write down, in your own words, why each wrong option was wrong
- Build the thing, even badly. A broken RAG pipeline teaches more than a working diagram
- Space your reviews — same material on day 1, day 3, day 7
- Take at least one full 180-minute mock in a single sitting

#### Ineffective Preparation Patterns

- Re-read a module you already scored 85% on
- Memorise prices. The exam tests the *ordering*, never the number
- Do questions without reading explanations — that is just measuring, not learning
- Study the interesting domain instead of the weak one
- Learn new material in the final 48 hours

## 3. Are you ready? A concrete checklist

Not "do you feel ready" — can you do these things without looking anything up?

### Domain 1 readiness

- Name all four chunking strategies and the symptom each one fixes
- Explain why changing embedding model forces a full re-index
- Give two reasons to pick S3 Vectors over OpenSearch Serverless, and two the other way
- Describe the nine stages of a RAG pipeline in order
- Explain what a cross-region inference profile does to your data residency posture
- Explain metadata filtering, including where the metadata comes from

### Domain 2 readiness

- Say what Converse gives you that InvokeModel does not, in one sentence
- Explain Return of Control and give two scenarios where it is the right answer
- List the AgentCore components and what each is for
- Choose between an agent, Bedrock Flows and Step Functions and defend the choice
- Explain the two most common causes of an agent looping
- Say how a fine-tuned model is served in production, and why that matters commercially

### Domain 3 readiness

- Name every guardrail policy type and what each catches
- Explain contextual grounding vs Automated Reasoning checks
- Describe indirect prompt injection and two defences that are not prompt instructions
- Explain how to make a guardrail impossible for a developer to omit
- Say what CloudTrail gives you that model invocation logging does not, and vice versa

### Domains 4 and 5 readiness

- Rank the cost levers by magnitude of impact
- Explain when Provisioned Throughput beats on-demand — including the non-cost reasons
- Explain the difference between prompt caching and semantic caching, and the risk of each
- Given "context relevance 0.45, faithfulness 0.95", say what is broken and what to fix
- Give the four-step ladder for responding to throttling

> **Exam — The numeric gate**
>
> Two consecutive full mocks above **800** on questions you have not seen before, with no domain below **70%**. If you are scoring 760 you are inside the noise band of a real exam — get to 800 and give yourself the margin.

## 4. What else to use alongside this

| Resource | Why | When |
| --- | --- | --- |
| **The official exam guide PDF** docs.aws.amazon.com and the awsstatic mirror | The authoritative task statements and weightings. Everything else, including this site, is an interpretation of it. | Read it first, then use it as a checklist at the end |
| **AWS Skill Builder exam prep** | Official practice question set and prep courses. AWS-authored questions are the closest in style to the real thing. | Mid-plan, then again in the final week |
| **Bedrock User Guide** | The source of truth for feature behaviour, quotas and limits. Go here whenever you catch yourself unsure whether something is still true. | Continuously |
| **AWS blog: Machine Learning / Generative AI** | New capabilities land here first. This is a young certification over a fast-moving service. | Weekly skim |
| **Your own AWS account** | Non-negotiable. Budget about $50 for the whole study period; set an AWS Budget alert at $25 on day one. | From week 2 |

> **Tip — Set a budget alarm before your first Bedrock call**
>
> Not after. It takes two minutes, and the failure mode — a runaway loop against a frontier model overnight — is exactly the kind of thing Domain 4 asks you about. Learning it from your own bill is memorable but expensive.
