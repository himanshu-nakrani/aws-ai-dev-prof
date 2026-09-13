---
title: Module 0 — Foundations questions
source: src/assets/data/q-d0.js
group: Practice
---

# Module 0 — Foundations questions


Not an exam domain. Excluded from weighted mock exams on purpose. **30 questions.** Every item is original, written against the published AIP-C01 exam guide. Correct option(s) are marked `[x]`.

### d0-001

A model is asked the same question twice with `temperature = 0` and produces the same answer both times. Then the temperature is raised to 1.0 and the answers differ. What is temperature actually changing?

- [ ] **A.** The amount of training data the model consults at inference time
- [x] **B.** The shape of the probability distribution over the next token before one is sampled
- [ ] **C.** The number of tokens the model is allowed to generate
- [ ] **D.** Whether the model uses its retrieved context or its parametric knowledge

**Why**

A language model predicts a probability for every token in its vocabulary. Temperature divides the logits before the softmax: low temperature sharpens the distribution so the top token dominates, high temperature flattens it so unlikely tokens get real probability mass. Nothing about the model, the data or the context changes — only the sampling.

| Option | Why this option |
| --- | --- |
| A | A model does not look anything up at inference time. Its weights are frozen; there is no training corpus to consult. |
| B ✓ | Correct. It rescales the logits, which changes how peaked the distribution is. |
| C | That is `maxTokens`, an entirely separate parameter. |
| D | Nothing about temperature touches retrieval. Context is just text in the prompt. |

*See: Module 0 → How a model actually generates text*

---

### d0-002

You paste a 40-page PDF into a prompt and the API returns a validation error about input length. Which limit did you hit?

- [x] **A.** The model's context window
- [ ] **B.** Your account's tokens-per-minute quota
- [ ] **C.** The maximum output tokens setting
- [ ] **D.** The vector store dimension limit

**Why**

The context window is the total number of tokens a model can hold in a single request — system prompt, history, retrieved content, question and the space reserved for the answer all share it. Exceed it and the request is rejected outright.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. Everything in one request shares this budget. |
| B | A TPM quota causes throttling (429) across many requests, not a length validation error on one. |
| C | maxTokens caps only the generated answer; it cannot cause an input-too-long error. |
| D | Vector dimensions are a property of the embedding model and the index, unrelated to prompt length. |

*See: Module 0 → Context windows*

---

### d0-003

Which statement about tokens is correct?

- [ ] **A.** A token is always exactly one word
- [ ] **B.** A token is one character
- [x] **C.** A token is a subword unit; English prose averages roughly four characters per token
- [ ] **D.** Tokens only apply to input, not output

**Why**

Tokenizers use subword vocabularies (byte-pair encoding and relatives). Common words are one token; rare words split into pieces. The 4-characters-per-token rule of thumb holds for English prose and breaks badly for code, JSON and non-Latin scripts, which are far denser.

| Option | Why this option |
| --- | --- |
| A | Rare and long words split into several tokens. |
| B | That would make vocabularies tiny and sequences enormous — no production model works that way. |
| C ✓ | Correct. |
| D | Both are billed, and output is normally billed at 3–5× the input rate. |

*See: Module 0 → Tokens*

---

### d0-004

What is an embedding?

- [ ] **A.** A compressed copy of the source document stored alongside the vector
- [x] **B.** A fixed-length numeric vector representing the meaning of a piece of text
- [ ] **C.** The fine-tuned weights produced by customising a foundation model
- [ ] **D.** The prompt template used to inject retrieved context

**Why**

An embedding model maps text to a fixed-length vector — 1024 numbers for Titan Text Embeddings V2 at full size. Semantically similar text lands in a similar direction, which is what makes nearest-neighbour retrieval work.

| Option | Why this option |
| --- | --- |
| A | You cannot reconstruct the text from the vector. The chunk text is stored separately in the vector store. |
| B ✓ | Correct. |
| C | Those are model weights, an entirely different artifact. |
| D | That is a prompt template. |

*See: Module 0 → Embeddings*

---

### d0-005

A hallucination is best described as which of the following?

- [ ] **A.** The model returning an error instead of an answer
- [x] **B.** The model producing fluent, confident output that is not supported by its sources or by fact
- [ ] **C.** The model exceeding its context window
- [ ] **D.** The model refusing to answer a question

**Why**

A hallucination is a confident, well-formed, wrong answer. It is a direct consequence of how these models work: they predict plausible continuations, and plausible is not the same as true. This is why grounding, citations and the contextual grounding check exist.

| Option | Why this option |
| --- | --- |
| A | That is an error, not a hallucination. |
| B ✓ | Correct. |
| C | That is a length failure. |
| D | That is a refusal — often the guardrail or the model working as intended. |

*See: Module 0 → Why models make things up*

---

### d0-006

Which AWS service is the managed API for calling foundation models from multiple providers behind a single interface?

- [ ] **A.** Amazon SageMaker AI
- [x] **B.** Amazon Bedrock
- [ ] **C.** Amazon Q Business
- [ ] **D.** AWS Glue

**Why**

Bedrock is the serverless, multi-provider foundation model API: Anthropic Claude, Amazon Nova and Titan, Meta Llama, Mistral, Cohere, AI21, Stability and others, all through one set of APIs, one IAM model and one billing line.

| Option | Why this option |
| --- | --- |
| A | SageMaker AI is the broader ML platform — training, hosting, notebooks. You reach for it when you need control Bedrock does not give you. |
| B ✓ | Correct. |
| C | Q Business is a finished enterprise assistant application, not a model API. |
| D | Glue is ETL. |

*See: Module 0 → The AWS GenAI stack*

---

### d0-007

What does IAM control in the context of a Bedrock application?

- [x] **A.** Which foundation models a principal is allowed to invoke, and in which region
- [ ] **B.** How many tokens the model may generate
- [ ] **C.** The chunking strategy of a knowledge base
- [ ] **D.** The temperature of model responses

**Why**

IAM is the authorisation layer. `bedrock:InvokeModel` scoped to specific model ARNs is how you stop a team from quietly running the most expensive frontier model, and how you keep inference inside an approved region.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | That is maxTokens, an inference parameter. |
| C | That is knowledge base configuration. |
| D | That is an inference parameter. |

*See: Module 0 → AWS building blocks*

---

### d0-008

Which of these are true about the relationship between AI, machine learning, deep learning and generative AI? (Choose 2.)

- [x] **A.** Generative AI is a subset of deep learning
- [x] **B.** Deep learning is a subset of machine learning
- [ ] **C.** Machine learning is a subset of generative AI
- [ ] **D.** Deep learning and machine learning are unrelated fields

**Why**

They nest: AI ⊃ machine learning ⊃ deep learning ⊃ generative AI. Generative models are deep neural networks; deep learning is the branch of ML that uses many-layered networks.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Backwards. |
| D | Deep learning is a branch of machine learning. |

*See: Module 0 → The nesting dolls*

---

### d0-009

What is the practical difference between a foundation model and a traditional supervised ML model?

- [x] **A.** A foundation model is pre-trained on broad data and adapted to many tasks; a supervised model is trained for one task on labelled data
- [ ] **B.** A foundation model cannot be customised
- [ ] **C.** A supervised model is always larger
- [ ] **D.** A foundation model requires no compute to run

**Why**

That generality is the whole point: one pre-trained model, adapted by prompting, RAG or fine-tuning, covers tasks that would each have needed their own labelled dataset and training run.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | It can — fine-tuning, continued pre-training, distillation. |
| C | Usually the opposite by orders of magnitude. |
| D | Inference is the dominant cost of most GenAI systems. |

*See: Module 0 → What makes a model "foundational"*

---

### d0-010

Amazon S3 is described as object storage. In a RAG system, what does it typically hold?

- [ ] **A.** The vector index
- [x] **B.** The source documents that get ingested into a knowledge base
- [ ] **C.** The IAM policies
- [ ] **D.** The model weights of Claude

**Why**

S3 is where the source corpus lives. A Bedrock Knowledge Base points at an S3 prefix, reads the documents, chunks and embeds them, and writes the resulting vectors to a vector store — which is a separate service.

| Option | Why this option |
| --- | --- |
| A | Vectors live in OpenSearch, Aurora, S3 Vectors and friends. Plain S3 is not a vector index (S3 Vectors is a distinct, purpose-built capability). |
| B ✓ | Correct. |
| C | IAM policies are stored in IAM. |
| D | Provider model weights are never exposed to you. |

*See: Module 0 → AWS building blocks*

---

### d0-011

What is AWS Lambda most commonly used for in a generative AI application?

- [ ] **A.** Storing embeddings
- [x] **B.** Running the glue code: pre/post-processing, tool implementations, custom chunking, API backends
- [ ] **C.** Training foundation models
- [ ] **D.** Serving as the vector database

**Why**

Lambda is the connective tissue: it backs API Gateway endpoints, implements the action groups an agent calls, performs custom chunking transformations at ingestion, and post-processes model output. Remember its 15-minute maximum execution time — long generations need streaming or an async pattern.

| Option | Why this option |
| --- | --- |
| A | Lambda is stateless compute, not storage. |
| B ✓ | Correct. |
| C | Wildly beyond Lambda's limits. |
| D | No. |

*See: Module 0 → AWS building blocks*

---

### d0-012

A "prompt" sent to a chat model is usually structured into which parts?

- [x] **A.** System instructions, conversation messages, and the current user turn
- [ ] **B.** Only the user's question
- [ ] **C.** Training data and validation data
- [ ] **D.** Encoder input and decoder output

**Why**

The Converse API makes this explicit: a `system` block for standing instructions, then an alternating list of user and assistant `messages`. Everything the model knows about this request is in that payload — it has no memory between calls.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Then it would have no persona, no rules and no memory of the conversation. |
| C | That is training, not inference. |
| D | An implementation detail of some architectures, not how you structure a prompt. |

*See: Module 0 → Anatomy of a prompt*

---

### d0-013

Why is a stateless model API a problem for chatbots, and how is it solved?

- [ ] **A.** It is not stateless; the model remembers automatically
- [x] **B.** The model has no memory between calls, so the application must resend the conversation history each time
- [ ] **C.** You must fine-tune the model after every message
- [ ] **D.** You have to keep a websocket open for the model to retain state

**Why**

Every invocation is independent. "Memory" is an illusion created by resending prior turns — which is why long conversations get expensive and eventually need summarisation or a managed memory store such as AgentCore Memory.

| Option | Why this option |
| --- | --- |
| A | It is stateless. |
| B ✓ | Correct. |
| C | Absurdly expensive and not how anything works. |
| D | Streaming transport has nothing to do with model memory. |

*See: Module 0 → Statelessness*

---

### d0-014

Which of the following best describes "grounding" a model?

- [ ] **A.** Reducing the model's temperature to zero
- [x] **B.** Supplying authoritative source material in the prompt and instructing the model to answer only from it
- [ ] **C.** Fine-tuning the model on your data
- [ ] **D.** Restricting the model to a single AWS region

**Why**

Grounding means the answer is traceable to supplied evidence. RAG is the standard mechanism, the "answer only from these passages" instruction is the standard prompt, and the contextual grounding check is the standard automated verification.

| Option | Why this option |
| --- | --- |
| A | Lowers variance; does nothing about factual sourcing. |
| B ✓ | Correct. |
| C | Fine-tuning changes style and behaviour; it is a poor and expensive way to inject facts. |
| D | Data residency, not grounding. |

*See: Module 0 → Grounding*

---

### d0-015

What does "top-p" (nucleus sampling) do?

- [x] **A.** Keeps only the smallest set of tokens whose cumulative probability reaches p, then samples from that set
- [ ] **B.** Keeps the p highest-probability tokens
- [ ] **C.** Multiplies every probability by p
- [ ] **D.** Sets the maximum output length to p tokens

**Why**

Top-p is adaptive: when the model is confident, the nucleus is one or two tokens; when it is unsure, the nucleus is wide. Top-k, by contrast, always keeps exactly k candidates regardless of confidence.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | That is top-k. |
| C | No. |
| D | That is maxTokens. |

*See: Module 0 → Sampling parameters*

---

### d0-016

Which is the correct order of the customisation ladder, from cheapest and fastest to most expensive?

- [ ] **A.** Fine-tuning → RAG → prompt engineering
- [x] **B.** Prompt engineering → RAG → fine-tuning → continued pre-training
- [ ] **C.** Continued pre-training → fine-tuning → RAG
- [ ] **D.** RAG → prompt engineering → fine-tuning

**Why**

Always climb this ladder in order, and the exam rewards the lowest rung that solves the stated problem. Prompt engineering costs nothing and ships in minutes. RAG adds current, private facts. Fine-tuning teaches behaviour, format and tone. Continued pre-training teaches a whole new domain vocabulary and needs enormous unlabelled corpora.

| Option | Why this option |
| --- | --- |
| A | Inverted. |
| B ✓ | Correct. |
| C | Inverted. |
| D | RAG is not cheaper than prompt engineering. |

*See: Module 0 → The customisation ladder*

---

### d0-017

A team wants the model to answer questions about internal HR policies updated weekly. Which approach fits best?

- [ ] **A.** Fine-tune the model weekly on the policy documents
- [x] **B.** Retrieval-augmented generation over the policy documents
- [ ] **C.** Continued pre-training on the HR corpus
- [ ] **D.** Increase the temperature so the model is more creative

**Why**

Facts that change on a schedule belong in a retrieval layer, not in weights. Re-syncing a knowledge base takes minutes and costs almost nothing; retraining weekly is expensive, slow and still gives you no citations.

| Option | Why this option |
| --- | --- |
| A | Cost and latency of retraining, with no citations and no way to delete a fact. |
| B ✓ | Correct. |
| C | Even heavier than fine-tuning. |
| D | Nonsense for a factual task. |

*See: Module 0 → When to use RAG*

---

### d0-018

What is a vector database's core job?

- [ ] **A.** Store documents as text for keyword search
- [x] **B.** Find the stored vectors nearest to a query vector, quickly, at scale
- [ ] **C.** Fine-tune embedding models
- [ ] **D.** Cache model responses

**Why**

It is an approximate-nearest-neighbour engine. Exact search over millions of vectors is too slow, so indexes such as HNSW trade a sliver of recall for orders of magnitude in speed.

| Option | Why this option |
| --- | --- |
| A | That is a search engine like classic OpenSearch/BM25 — although hybrid search combines both. |
| B ✓ | Correct. |
| C | No. |
| D | Different concern (semantic caching is built on top of one, but is not its job). |

*See: Module 0 → Vector stores*

---

### d0-019

Which two statements about foundation model inference costs are true? (Choose 2.)

- [x] **A.** Output tokens usually cost more per token than input tokens
- [ ] **B.** You are billed per API call regardless of length
- [x] **C.** Long retrieved contexts increase cost on every single request
- [ ] **D.** Input tokens are free on Amazon Bedrock

**Why**

Billing is per token, split into input and output rates, with output typically 3–5× input. That means a RAG app that stuffs 20k tokens of context into every call pays that toll on every call — which is exactly the problem prompt caching solves.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Length is the entire basis of billing. |
| C ✓ | Correct. |
| D | They are not. |

*See: Module 0 → What you pay for*

---

### d0-020

What is the difference between Amazon Q Business and Amazon Bedrock?

- [ ] **A.** They are the same service with different names
- [x] **B.** Q Business is a ready-made enterprise assistant application; Bedrock is the model API you build on
- [ ] **C.** Q Business is for developers, Bedrock is for end users
- [ ] **D.** Bedrock only supports Amazon models

**Why**

Q Business is bought and configured — connectors, an assistant UI, admin controls. Bedrock is built on — APIs, agents, knowledge bases, guardrails. If a scenario says "minimal development effort, connect to SharePoint and give staff a chat assistant", Q Business is the answer. If it says "embed in our product", it is Bedrock.

| Option | Why this option |
| --- | --- |
| A | Different services. |
| B ✓ | Correct. |
| C | The opposite. |
| D | Bedrock is deliberately multi-provider. |

*See: Module 0 → The AWS GenAI stack*

---

### d0-021

What does "multimodal" mean for a foundation model?

- [ ] **A.** It runs in multiple AWS regions
- [x] **B.** It accepts and/or produces more than one type of data, such as text plus images
- [ ] **C.** It supports multiple languages
- [ ] **D.** It can be fine-tuned in multiple ways

**Why**

Modality means data type: text, image, audio, video, embeddings. Claude and Nova models accept images alongside text; Nova Canvas generates images; Nova Reel generates video. Multilingual is a separate axis entirely.

| Option | Why this option |
| --- | --- |
| A | Region availability. |
| B ✓ | Correct. |
| C | Multilingual, not multimodal. |
| D | No. |

*See: Module 0 → Model modalities*

---

### d0-022

A developer says "the model has been trained on our data" after adding documents to a knowledge base. Why is that wrong?

- [ ] **A.** Knowledge bases do fine-tune the model behind the scenes
- [x] **B.** The documents are embedded and retrieved at query time; the model's weights never change
- [ ] **C.** Knowledge bases only work with Amazon Titan models
- [ ] **D.** The documents are used for training only after 30 days

**Why**

A knowledge base is a retrieval layer bolted onto an unchanged model. This matters practically: deleting a document removes it from answers immediately, whereas a fact baked into fine-tuned weights cannot be cleanly extracted.

| Option | Why this option |
| --- | --- |
| A | They do not. |
| B ✓ | Correct. |
| C | Multiple model families are supported. |
| D | Invented. |

*See: Module 0 → RAG versus fine-tuning*

---

### d0-023

What is "few-shot prompting"?

- [ ] **A.** Sending the same prompt several times and voting on the answers
- [x] **B.** Including a small number of worked input/output examples in the prompt
- [ ] **C.** Fine-tuning on a small dataset
- [ ] **D.** Limiting the model to a few output tokens

**Why**

Two to five examples inside the prompt beat paragraphs of prose description, especially for output format and edge-case handling. Zero-shot means no examples; one-shot means one. It is still the highest-leverage prompt technique after simply stating the task clearly.

| Option | Why this option |
| --- | --- |
| A | That is self-consistency / majority voting. |
| B ✓ | Correct. |
| C | That is few-shot *fine-tuning*, a different thing. |
| D | That is maxTokens. |

*See: Module 0 → Prompting techniques*

---

### d0-024

Why does the same prompt sometimes produce different token counts on different models?

- [x] **A.** Because model families use different tokenizers and vocabularies
- [ ] **B.** Because token counting is random
- [ ] **C.** Because AWS rounds token counts to the nearest hundred
- [ ] **D.** Because output tokens are counted twice

**Why**

Each family ships its own tokenizer. The same paragraph can be 210 tokens on one model and 240 on another, so cost comparisons between providers must be done on real payloads, not on character counts.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | It is deterministic per tokenizer. |
| C | It does not. |
| D | They are not. |

*See: Module 0 → Tokens*

---

### d0-025

In the Converse API, what is the `system` block for?

- [ ] **A.** Logging and telemetry configuration
- [x] **B.** Standing instructions that apply to the whole conversation
- [ ] **C.** The user's most recent message
- [ ] **D.** Defining the vector store connection

**Why**

System instructions set role, rules, tone and constraints, and are conceptually outside the user/assistant turn-taking. Converse normalises this across providers, which is exactly why you should prefer it over per-model `InvokeModel` payloads.

| Option | Why this option |
| --- | --- |
| A | No. |
| B ✓ | Correct. |
| C | That goes in `messages`. |
| D | Unrelated. |

*See: Module 0 → Anatomy of a prompt*

---

### d0-026

Which two of the following are genuine reasons to prefer a smaller model? (Choose 2.)

- [x] **A.** Lower cost per token
- [x] **B.** Lower latency
- [ ] **C.** Better reasoning on complex multi-step problems
- [ ] **D.** Larger context windows in every case

**Why**

Small models win on cost and speed and lose on hard reasoning. The professional-level instinct is to route: small model for the 80% of traffic that is classification, extraction and simple lookup, large model for the rest.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | This is where small models genuinely fall down. |
| D | Context size does not track model size — Nova Lite has a larger window than several much bigger models. |

*See: Module 0 → Choosing a model*

---

### d0-027

What is an "inference parameter"?

- [x] **A.** A setting that controls how the model generates output for a single request, such as temperature or maxTokens
- [ ] **B.** A weight inside the neural network
- [ ] **C.** A quota on your AWS account
- [ ] **D.** A field in the IAM policy

**Why**

Inference parameters are per-request knobs: temperature, topP, topK, maxTokens, stopSequences. They are cheap to change and are always worth checking before anyone proposes fine-tuning.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Those are model weights and you never see them. |
| C | That is a service quota. |
| D | No. |

*See: Module 0 → Sampling parameters*

---

### d0-028

Which best explains why a model's answer quality can drop when you give it far more context?

- [ ] **A.** Longer prompts always exceed the context window
- [x] **B.** Models attend unevenly across long inputs and can lose material buried in the middle
- [ ] **C.** Bedrock truncates all prompts to 4,000 tokens
- [ ] **D.** Additional context reduces the model's temperature

**Why**

The "lost in the middle" effect: recall is strongest at the start and end of a long input. It is a direct argument for retrieval precision over retrieval volume, and for putting the actual question last.

| Option | Why this option |
| --- | --- |
| A | Only if you actually exceed it. |
| B ✓ | Correct. |
| C | It does not. |
| D | Unrelated. |

*See: Module 0 → Context windows*

---

### d0-029

What is the role of an approximate nearest neighbour (ANN) index such as HNSW in a vector store?

- [ ] **A.** It compresses the stored text
- [x] **B.** It makes similarity search sublinear instead of comparing against every stored vector
- [ ] **C.** It converts text to vectors
- [ ] **D.** It enforces access control on documents

**Why**

Comparing a query vector against ten million stored vectors one by one is too slow for an interactive application. HNSW builds a navigable graph that finds very-nearly-nearest neighbours in logarithmic time, trading a little recall for a lot of speed.

| Option | Why this option |
| --- | --- |
| A | No. |
| B ✓ | Correct. |
| C | That is the embedding model. |
| D | That is IAM plus metadata filtering. |

*See: Module 0 → Vector stores*

---

### d0-030

Which statement about AWS regions matters most for a generative AI application?

- [ ] **A.** All foundation models are available in all regions
- [x] **B.** Model availability, feature availability and data residency all vary by region
- [ ] **C.** Bedrock is a global service with no regional endpoints
- [ ] **D.** Regions only affect latency, never functionality

**Why**

Model and feature availability are genuinely uneven across regions, and where inference runs determines where the data goes. Cross-region inference profiles exist precisely to spread load across regions — which means you must confirm the destination regions satisfy your residency requirements before enabling them.

| Option | Why this option |
| --- | --- |
| A | Very much not the case. |
| B ✓ | Correct. |
| C | Bedrock is regional. |
| D | They affect what you can even call. |

*See: Module 0 → AWS building blocks*

---
