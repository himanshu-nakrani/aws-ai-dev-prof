---
title: Module 0 — From zero: AI and AWS
source: src/content/foundations.html
group: Learn
---

# Module 0 — From zero: AI and AWS

> **Info — Who this module is for**
>
> Someone who has never written a line of AWS code and has never used an AI model beyond typing into a chat box. If that is not you, skim — but do not skip. The mental models here (statelessness, the customisation ladder, what a token costs) are what the exam's scenario questions are really testing, and experienced engineers routinely have holes in exactly these places.

## 1. AI, machine learning, deep learning, generative AI

Four words people use interchangeably. They nest, largest to smallest:

*Every generative model is a deep learning model. Not every machine learning model is generative — a fraud classifier is ML and is not generative.*

- Artificial intelligence
- any system doing something that looks intelligent — including hand-written rules
- Machine learning
- the behaviour is learned from data instead of written by a programmer
- Deep learning
- learning with many-layered neural networks
- Generative AI — models that produce new content: text, images, audio, code

### What changed to make generative AI a thing

Two shifts. First, the **transformer** architecture (2017) made it practical to train on enormous text corpora. Second, people discovered that if you make these models big enough and train them on enough text, they acquire general capability — one model that can summarise, translate, classify, write code and reason, without being trained for each task separately.

That generality is what makes them "foundation" models. The old way was one labelled dataset and one training run per task. The new way is one pre-trained model that you *adapt*.

> **Analogy**
>
> A traditional ML model is a purpose-built tool: a corkscrew. Excellent at one job, useless at everything else. A foundation model is a graduate who has read most of the internet: not an expert in your business, but able to attempt almost anything if you explain the task — and much better if you hand them the relevant documents.

## 2. How a language model actually generates text

This is worth understanding properly, because almost every counter-intuitive behaviour in the exam falls out of it.

A language model does exactly one thing: **given a sequence of tokens, predict a probability distribution over what the next token should be.** That is it. Everything else — answering questions, writing code, reasoning through a problem — is that single operation applied repeatedly.

1. **Input** — Your prompt becomes a sequence of token IDs
2. **Forward pass** — The network computes a score for every token in its vocabulary
3. **Sample** — One token is chosen from that distribution
4. **Append** — The chosen token is added to the sequence
5. **Repeat** — Until a stop condition — end token, stop sequence, or maxTokens

Three consequences you should carry into every exam question:

- **Generation is sequential.** Input is processed in one parallel pass, but output comes out one token at a time. This is why output tokens dominate latency, and why streaming exists.
- **The model has no idea whether it is right.** It produces the most plausible continuation. Plausible and true are different properties, and nothing in the architecture distinguishes them.
- **There is no lookup.** The model is not consulting a database. Everything it "knows" is compressed into fixed weights from training. That is why facts go stale and why RAG exists.

> **Info — A useful thing to understand about attention**
>
> The transformer's key trick is *attention*: when computing each token, the model weighs every other token in the input by relevance. This is what lets it connect a pronoun to a noun twenty sentences earlier. It also has a cost — attention work grows roughly with the square of input length, which is why very long prompts are disproportionately slow and expensive, and why models attend unevenly across long inputs. That last point has a name: **lost in the middle**, and it is the reason you put critical instructions at the end of a long prompt.

## 3. Tokens — the unit of everything

Models do not see characters or words. They see **tokens**: subword pieces from a fixed vocabulary, typically 30,000–200,000 entries. Common words are one token. Rare words split into pieces. Whitespace usually attaches to the token that follows it.

Tokens are the unit of billing, the unit of the context window, and the unit of most limits you will hit. Get a feel for them:

> **Interactive widget (`tokenizer`)**
>
> Token counter — type text and see approximate tokens, the unit Bedrock bills on. Playable in the HTML study site.

### Why this matters commercially

You pay per token, input and output separately, with output typically 3–5× the input rate. A RAG application that injects 20,000 tokens of retrieved context into every request pays for those 20,000 tokens on *every single call*, forever. At a million calls a month that is a meaningful line item, and it is why Domain 4 exists.

| Content type | Rough tokens per 1,000 characters | Note |
| --- | --- | --- |
| English prose | ~250 | The familiar 4-characters-per-token rule |
| Code | ~330 | Punctuation and identifiers fragment |
| JSON | ~400–500 | Braces, quotes and keys are expensive. Never paste raw API responses into prompts if you can help it |
| CJK / non-Latin scripts | ~500–1000 | Often close to one token per character |

> **Warning — Tokenizers differ between models**
>
> The same paragraph might be 210 tokens on one model family and 240 on another. This means you cannot compare provider prices on character counts — you have to measure on real payloads. Exam-wise: you will never be asked to recall a token count, but you may be asked to reason about why two models cost differently for the same text.

## 4. Temperature, top-p and top-k

The model produces a probability for every token. These three parameters decide how that distribution gets turned into one actual choice. Play with them until the behaviour is intuitive:

> **Interactive widget (`sampler`)**
>
> Temperature / top-p / top-k visualiser — how a model picks the next token. Playable in the HTML study site.

| Parameter | What it does | Set it to |
| --- | --- | --- |
| `temperature` | Rescales the distribution. Low = peaked (top token dominates). High = flat (unlikely tokens get real mass). | **0–0.2** for classification, extraction, routing, SQL, evaluation. **0.5–0.8** for RAG answers and assistants. **1.0+** for brainstorming. |
| `topP` | Nucleus sampling — keep the smallest set of tokens whose cumulative probability reaches p. Adaptive to model confidence. | Leave at 1.0 unless you have a reason. Tune temperature *or* top-p, not both. |
| `topK` | Keep exactly the k most likely tokens. Fixed regardless of confidence. | Rarely needed. Not supported by every model. |
| `maxTokens` | Hard ceiling on generated tokens. | Set deliberately. Too low truncates mid-sentence; too high lets a runaway generation cost you real money. |
| `stopSequences` | Stop as soon as one of these strings appears. | Useful for format control. Careful with JSON — a `}` stop sequence will cut off nested objects. |

> **Exam — Exam angle**
>
> The examinable point is not the parameter definitions — it is the *consequence*. "Users report inconsistent answers to identical questions" with temperature at 0.9 is a sampling problem, and lowering temperature is the first, cheapest thing to try. Likewise, evaluation runs must be at temperature 0 or your scores are measuring noise.

## 5. The context window

The context window is the total number of tokens a model can consider in one request. Crucially, **everything shares it**: system instructions, tool definitions, conversation history, retrieved documents, the user's question, and the space reserved for the answer.

> **Interactive widget (`contextbudget`)**
>
> Context-window budget planner — system, history, retrieved, output. Playable in the HTML study site.

A large context window is a capability, not a strategy. Filling one has three costs:

- **Money** — you pay for every input token, on every call
- **Latency** — time-to-first-token scales with input length
- **Quality** — the lost-in-the-middle effect means material buried in a long input is recalled less reliably than material at the start or the end

That third point is counter-intuitive and is why "just retrieve more chunks" is usually the wrong answer to a quality problem. Precision beats volume.

## 6. Why models make things up, and what to do about it

A hallucination is fluent, confident output that is not supported by fact or by your sources. It is not a bug in a particular model — it is a direct consequence of next-token prediction. The model is optimising for plausibility. A fabricated policy number is extremely plausible text.

### The four things that reduce it

#### 1. Grounding (RAG)

Put the authoritative source material in the prompt and instruct the model to answer only from it. This is the big one, and it is what Domain 1 is largely about.

#### 2. An explicit escape hatch

"If the passages do not contain the answer, reply exactly: I don't have that in my sources." Models invent partly because nothing in the prompt permits them to fail. One sentence, large effect.

#### 3. Low temperature

Less sampling from the tail means fewer creative departures from the evidence.

#### 4. Automated verification

Bedrock Guardrails' **contextual grounding check** scores whether the answer is supported by the retrieved passages and blocks it if not. **Automated Reasoning checks** go further and verify claims against a policy using formal logic.

> **Warning — Nothing eliminates hallucination**
>
> If an exam option claims a control "prevents all hallucinations" or "guarantees accuracy", that phrasing alone is usually enough to eliminate it. These are risk-reduction layers, not proofs — with the narrow exception of Automated Reasoning checks, which do provide formal verification against a defined policy, and which is exactly why they are worth remembering as a distinct thing.

## 7. Embeddings, vectors and similarity

An **embedding model** is a different kind of model: instead of generating text, it converts text into a fixed-length list of numbers — a **vector**. The useful property is that text with similar meaning produces vectors pointing in a similar direction.

Similarity is measured with **cosine similarity**: the angle between two vectors, from 1 (identical direction) through 0 (unrelated) to −1 (opposite). Try it:

> **Interactive widget (`similarity`)**
>
> Embeddings and cosine similarity lab — the maths behind retrieval. Playable in the HTML study site.

### Why this is the foundation of retrieval

Take a thousand documents, split them into chunks, embed each chunk, store the vectors. When a question arrives, embed the question and find the stored vectors closest to it. Those chunks are, semantically, the most relevant text you have. That is **the entire idea behind RAG**, and everything in Domain 1 is refinement on top of it.

> **Info — Two facts to lock in now**
>
> **1. Query and documents must be embedded by the same model.** Vectors from different models occupy incompatible spaces; comparing them produces meaningless numbers. Changing embedding model means re-indexing everything. This appears on the exam.
>
> **2. A vector database is just a fast nearest-neighbour engine.** Comparing against ten million vectors one by one is too slow, so it builds an approximate index (usually HNSW) that finds very-nearly-nearest neighbours in logarithmic time.

## 8. Prompting — the parts of a prompt and what each earns

A production prompt is not a question. It is a structured document. Toggle the components below and read why each one costs tokens for a reason:

> **Interactive widget (`promptlab`)**
>
> Prompt anatomy — role, task, context, constraints, format, few-shot, CoT. Playable in the HTML study site.

### The techniques worth knowing by name

| Technique | What it is | Use when |
| --- | --- | --- |
| **Zero-shot** | Just the instruction, no examples | The task is simple and the model already does it well |
| **Few-shot** | 2–5 worked input/output examples in the prompt | You need a specific output format or edge-case handling. Highest leverage technique after stating the task clearly |
| **Chain-of-thought** | "Think step by step before answering" | Multi-hop reasoning, arithmetic, anything with intermediate steps. Costs output tokens and latency — do not apply it to lookups |
| **ReAct** | Reason → Act (call a tool) → Observe → repeat | The loop underneath tool-using agents. Bedrock Agents implement it for you |
| **Self-consistency** | Sample several answers, take the majority | High-stakes reasoning where you can afford several calls |
| **Structured output** | Constrain generation to a schema via tool use | Anything a machine will parse. Far more reliable than asking for JSON in prose |
| **Delimiting** | Wrap sections in XML-ish tags: `<passages>…</passages>` | Always, in RAG. It gives the model an unambiguous boundary between instruction and data — which is also a mild defence against injection |

## 9. The model has no memory

Every call to a model API is completely independent. The model does not remember your previous question. It cannot. There is no session on its side.

Chat "memory" is an illusion your application creates by resending the conversation each turn:

**turn 3 of a conversation — what actually gets sent**

```text
{
  "system": [{"text": "You are a support assistant for Acme Cloud."}],
  "messages": [
    {"role": "user",      "content": [{"text": "My invoice looks wrong"}]},
    {"role": "assistant", "content": [{"text": "Happy to help. Which invoice number?"}]},
    {"role": "user",      "content": [{"text": "INV-4471"}]},
    {"role": "assistant", "content": [{"text": "That one covers March. What looks wrong?"}]},
    {"role": "user",      "content": [{"text": "The total is higher than last month"}]}
  ]
}
```

Three consequences:

- **Long conversations get expensive.** Every turn resends everything before it. Cost per turn grows roughly linearly with conversation length.
- **Conversations eventually overflow the context window.** Something must give: usually the oldest turns are dropped, silently, and the assistant appears to "forget". This is a real exam scenario.
- **Real memory has to be built.** Roll older turns into a summary, or use a managed store like **AgentCore Memory** which keeps short-term conversation state and extracts durable long-term facts across sessions.

## 10. AWS in twenty minutes — only the parts you need

If you have used AWS, skip to section 11. If not, here is the minimum model of AWS that the rest of this guide assumes.

### Accounts and regions

An **AWS account** is a billing and isolation boundary. Inside it, almost everything lives in a **region** — a geographic cluster of data centres like `us-east-1` (N. Virginia) or `eu-west-1` (Ireland). Regions matter enormously here for three reasons: **not every foundation model is available in every region**, **not every feature is either**, and **where you run inference determines where your data is processed**. That last one is a compliance question, and it shows up repeatedly in Domain 1 and Domain 3.

### The services you will actually touch

| Service | What it is | Its role in a GenAI app |
| --- | --- | --- |
| **IAM** | Identity and Access Management — who can do what | Controls which principals may invoke which models, in which regions. A *role* is a set of permissions that a service (like a Lambda) assumes. Least privilege is the rule. |
| **Amazon S3** | Object storage — files in buckets, effectively infinite | Where your source documents live. A knowledge base points at an S3 prefix. Also where batch inference reads input and writes output. |
| **AWS Lambda** | Run code without managing servers; billed per millisecond | The glue. Backs API endpoints, implements the tools an agent calls, does custom chunking. **15-minute maximum** — remember that limit, it decides architectures. |
| **Amazon API Gateway** | Managed HTTP/WebSocket front door | Authentication, throttling, usage plans. Note the ~29-second integration timeout for REST — long generations need streaming or async. |
| **Amazon CloudWatch** | Metrics, logs, alarms, dashboards | Where invocation counts, latency, token counts and errors show up. Where you alarm on throttling. |
| **AWS CloudTrail** | Audit log of API calls | Who called `InvokeModel`, when, from where. Note: it records the *call*, not the prompt text. |
| **AWS KMS** | Managed encryption keys | Customer managed keys for knowledge bases, custom models and vector data when a customer needs revocable control. |
| **VPC / PrivateLink** | Private networking; interface endpoints for AWS services | Keeping Bedrock traffic off the public internet, and adding an endpoint policy as an extra enforcement point. |
| **AWS Step Functions** | Visual state machines for orchestration | Deterministic multi-step workflows with per-step retries, error handling and long-running execution. |
| **AWS Glue** | ETL and a data catalogue | Cleaning and normalising source data before it becomes a knowledge base. |

> **Tip — If you learn one AWS concept properly, make it IAM**
>
> Domain 3 is 20% of the exam and a large slice of it is "which control actually enforces this". The answer is almost always IAM — scoped actions on specific resource ARNs, with condition keys — rather than anything you can write in a prompt.

## 11. The AWS generative AI stack

AWS presents this as three layers. Knowing which layer a question is about eliminates half the options immediately.

*AIP-C01 is overwhelmingly a middle-layer exam. When an option reaches down a layer without a stated reason, it is usually the over-engineered distractor.*

- TOP — applications you buy and configure
- Amazon Q Business · Amazon Q Developer · Amazon Connect AI
- Finished products. Minimal build. Choose when the scenario says “least development effort”.
- MIDDLE — tools to build with ← the exam lives here
- Amazon Bedrock: model APIs · Knowledge Bases · Agents · AgentCore · Guardrails
- Flows · Prompt Management · Evaluations · Data Automation
- Managed building blocks. You write application code; AWS runs the models and the plumbing.
- BOTTOM — infrastructure to build models on
- Amazon SageMaker AI · EC2 with accelerators (Trainium, Inferentia, GPUs)
- Maximum control, maximum work. Choose when Bedrock genuinely cannot do it.

### Bedrock versus SageMaker versus Q — the distinction the exam tests

|  | Amazon Bedrock | Amazon SageMaker AI | Amazon Q |
| --- | --- | --- | --- |
| **What it is** | Serverless multi-provider FM API plus managed GenAI building blocks | Full ML platform: train, tune, host any model you can containerise | Finished AI assistant products |
| **You manage** | Prompts, data, configuration | Instances, containers, endpoints, scaling | Connectors and permissions |
| **Choose when** | Default. You want to build a GenAI application without running infrastructure | You need a model Bedrock does not offer, or full control of training and serving | You want the product, not the platform |
| **Exam signal** | "managed", "minimal operational overhead", "multiple model providers" | "custom architecture", "full control over training", "model not available on Bedrock" | "give employees a chat assistant over SharePoint with minimal development" |

## 12. The customisation ladder

When a model does not do what you want, there are four things you can do about it. They differ by orders of magnitude in cost and effort. **The exam consistently rewards the lowest rung that solves the stated problem.**

*Relative effort and cost, roughly. The gaps are real and large.*

| Item | Value |
| --- | --- |
| 1. Prompt engineering | 1 |
| 2. RAG | 8 |
| 3. Fine-tuning | 60 |
| 4. Continued pre-training | 100 |

| Rung | What it fixes | What it cannot fix | Time to ship |
| --- | --- | --- | --- |
| **1. Prompt engineering** instructions, few-shot, format | Wrong tone, wrong format, unclear task, inconsistent structure | Missing facts. The model cannot be prompted into knowing your Q3 policy | Minutes |
| **2. RAG** retrieve, then generate | Private, current, citable facts. Knowledge that changes. Auditability | Behaviour and style. Retrieval does not teach the model *how* to respond | Days |
| **3. Fine-tuning** labelled prompt/completion pairs | Consistent specialised behaviour, tone, format, task patterns that prompting cannot reliably elicit | Volatile facts. And you cannot cleanly delete a fact from weights | Weeks — plus Provisioned Throughput to serve it |
| **4. Continued pre-training** large unlabelled domain corpus | A genuinely alien domain vocabulary — specialised medicine, law, a proprietary language | Almost everything else, more cheaply done lower down | Months, and serious money |

> **Exam — The two questions that decide the rung**
>
> **"Is the problem facts, or behaviour?"** Facts → RAG. Behaviour → prompting, then fine-tuning.
>
> **"How often does it change?"** Frequently → RAG, always. Anything that changes weekly cannot live in weights.

## 13. What you actually pay for

Five cost lines in a typical Bedrock application. The first one usually dwarfs the rest:

1. **Model inference** — input tokens × input rate + output tokens × output rate
2. **Embeddings** — per token, at ingestion and on every query. Cheap per call, but a large corpus re-embedded unnecessarily is real money
3. **Vector storage** — OpenSearch Serverless OCUs, or S3 Vectors storage, or your Aurora instance
4. **Supporting compute** — Lambda, containers, API Gateway
5. **Logging and monitoring** — CloudWatch Logs ingestion is not free at volume, and prompts are large

> **Interactive widget (`costcalc`)**
>
> Bedrock cost model — input vs output, caching, batch, catalogue spread. Playable in the HTML study site.

> **Warning — Prices here are illustrative and editable**
>
> Bedrock pricing changes regularly. Everything on this page is for building intuition about *shape* — the ordering of magnitudes, the input/output split, where the levers are. The exam never asks you to recall a number. Before you make a real architectural decision, check the current pricing page.

## 14. Twenty terms you now know

#### Concepts

**Token** · subword unit, the billing unit  ·  **Context window** · total tokens per request  ·  **Embedding** · text as a vector  ·  **Cosine similarity** · angle between vectors  ·  **Temperature** · sampling randomness  ·  **Top-p / top-k** · candidate set trimming  ·  **Hallucination** · confident unsupported output  ·  **Grounding** · answering from supplied evidence  ·  **RAG** · retrieve then generate  ·  **Lost in the middle** · weak recall of long-input middles

#### AWS

**Bedrock** · managed FM API  ·  **Knowledge Base** · managed RAG  ·  **Agent** · model that calls tools  ·  **Guardrail** · safety policy on input and output  ·  **IAM** · who can do what  ·  **S3** · object storage  ·  **Lambda** · serverless functions, 15 min max  ·  **Region** · where it runs, and where the data is  ·  **Provisioned Throughput** · dedicated capacity  ·  **Inference profile** · cross-region routing, or cost attribution

## 15. Quick check

Five questions on Module 0. If you get four or more, move on to Domain 1.
