---
title: Start here
source: src/content/index.html
group: Orientation
---

# Start here

## You can pass this exam knowing nothing about AI or AWS today.

Not because it is easy — it is a professional-level exam and it is genuinely hard — but because everything it tests is learnable in a specific order, and almost nobody teaches it in that order. This guide does.

Start at Module 0, which assumes you have never opened the AWS console and have never heard the word “token”. By the end of Domain 5 you will be reasoning about chunking strategies, guardrail policies and cost-per-token the way the exam expects you to. Then drill the question bank until the patterns are boring.

- [Start Module 0 →](03-module-0-foundations.md)

- [What the exam actually is](01-the-exam.md)

- [Jump to the question bank](11-question-bank.md)

## 1. What is in here

#### Full Curriculum, In Sequence

Module 0 takes you from zero — what a token is, what S3 is, why a model makes things up. Then one deep module per exam domain, weighted the way the exam is weighted, each with worked scenarios and the reasoning behind the right answer rather than a list of facts to memorise.

#### Interactive Sandboxes & Visualisers

A tokenizer, a temperature sampler, a chunking playground, a cosine-similarity lab, a cost calculator, a guardrail simulator, a retrieval tuner, a context-budget planner. Concepts stick when you can break them.

#### Comprehensive Question Bank

Scenario questions written against the published blueprint, with an explanation for *every* option — including why each wrong one is wrong. Plus a timed 75-question mock exam weighted exactly like the real thing, and per-domain drills.

#### Production-Grade Hands-on Labs

Real boto3 and CDK you can run: a RAG pipeline, a tool-using agent, a guardrail, an evaluation harness. The exam is written for people who have built this stuff. Two weekends of building is worth a month of reading.

> **Warning — About “exam dumps”**
>
> You will find sites selling recalled real exam questions. Three reasons not to touch them, in ascending order of importance.
>
> They are **often wrong** — transcribed from memory, with answers voted on by people who failed. They are **ineffective** — item pools rotate, and memorising 60 stems teaches you none of the reasoning the scenarios test. And they **violate the AWS Certification Agreement**: AWS detects this and the penalty is revocation of every certification you hold, plus a ban.
>
> Every question in this guide is original, written against the published exam guide. That is a feature, not a limitation.

## 2. The shape of the thing you are studying for

Five domains, weighted unevenly. If you only have limited time, this chart tells you where to spend it: **Domains 1 and 2 are 57% of the exam between them.**

*AIP-C01 domain weightings. Roughly 65 scored questions, so 1% ≈ 0.65 questions.*

| Item | Value |
| --- | --- |
| D1 · FM integration, data, compliance | 31 |
| D2 · Implementation & integration | 26 |
| D3 · Safety, security, governance | 20 |
| D4 · Operational efficiency | 12 |
| D5 · Testing & troubleshooting | 11 |

**75** questions — 65 scored + 10 unscored

**180** minutes — 2.4 min per question

**750** to pass — scaled 100–1000

**$300** exam fee — valid 3 years

What makes it a *professional* exam is not obscurity — it is that the questions rarely have one obviously correct option. Usually two or three options would work, and you are picking the one that best satisfies a stated constraint: lowest operational overhead, strictest data residency, least cost, fastest to implement. **Read the constraint before you read the options.**

## 3. How to use this guide

#### 1. Read Module 0 even if you think you know it

It is written for a complete beginner, so it is fast to skim if you are not one. But the mental models in it — statelessness, the customisation ladder, what a token actually costs you — are the foundation for the reasoning the exam rewards. People who skip it end up memorising facts instead of understanding trade-offs.

#### 2. Work the domain modules in order, marking sections read

Each section has a **Mark read** control in its top-right corner. Progress is stored in your browser, shows in the sidebar ring, and is how you find your way back after a break. Domain 1 first — it is the biggest and everything else builds on it.

#### 3. Do the labs after Domain 2

By then you know enough to build a RAG pipeline and an agent. Do it. The scenario questions are written by people who have debugged these systems, and it shows.

#### 4. Drill by domain, then take mocks

Per-domain drills while you are learning; full weighted mocks once you have covered everything. Anything under 72% in a domain worth 20%+ is what stands between you and a pass — go back to that module rather than doing more questions.

#### 5. Use the cram sheet and flashcards in the last week

Not for learning — for keeping the distinctions sharp. Hierarchical vs semantic chunking. Denied topics vs word filters. Context relevance vs faithfulness. The exam lives in those distinctions.

> **Tip — Keyboard**
>
> Press / to search the whole guide from anywhere. On the flashcards page, space flips, ← and → grade.

## 4. An honest estimate of how long this takes

Everyone wants a number. Here are three, based on where you are starting from. These assume study that is actually study — not re-reading a page while a meeting happens in another window.

| Starting point | Total hours | Realistic calendar time | What to skip |
| --- | --- | --- | --- |
| **Complete beginner** — no AWS, no AI | 120–160 | 10–14 weeks at 12 h/week | Nothing. You also need an AWS account and a credit card with a $50 budget for hands-on. |
| **AWS developer**, new to GenAI | 60–80 | 6–8 weeks at 10 h/week | The AWS half of Module 0. Read the AI half properly — most AWS engineers have gaps here they do not know about. |
| **Built GenAI apps**, maybe on another cloud | 35–50 | 4 weeks at 10 h/week | Module 0 entirely. Focus on the AWS-specific service behaviour, quotas, guardrail policy types, and Domains 3 and 4, which are where non-AWS experience transfers worst. |

> **Info — The single best predictor of passing**
>
> Not hours studied — whether you have **built and debugged** a RAG application and an agent. The exam is stuffed with "this symptom, what is the cause" questions. If you have watched retrieval quietly return the wrong chunks at 1am, you will recognise them instantly. If you have not, they read as four plausible options.

## 5. Start

Module 0 is next. It assumes nothing.

- [Module 0 — From zero: AI and AWS →](03-module-0-foundations.md)

- [Pick a study plan first](02-study-plans.md)
