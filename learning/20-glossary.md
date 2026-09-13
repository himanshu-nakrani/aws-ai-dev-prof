---
title: Glossary
source: src/content/glossary.html
group: Reference
---

# Glossary

## 1. Glossary

Every term used in this guide, defined the way it matters for AIP-C01. Use / to search, or Ctrl+F on this page.

## 2. A – C

| Term | Definition |
| --- | --- |
| **Action group** | A set of operations a Bedrock Agent can call, defined by OpenAPI schema or function details, backed by a Lambda or by Return of Control. |
| **AgentCore** | Bedrock's production primitives for agents you build yourself: Runtime, Memory, Gateway, Identity, Code Interpreter, Browser, Observability, plus Policy, Evaluations, Registry and Payments. |
| **AI Service Card** | Published AWS documentation of an AI service's intended use cases, limitations and responsible-AI design choices. The transparency artifact for a governance review. |
| **ANN (approximate nearest neighbour)** | Index structure (usually HNSW) that finds very-nearly-nearest vectors in logarithmic rather than linear time, trading a sliver of recall for a lot of speed. |
| **ApplyGuardrail** | API that runs a guardrail against arbitrary text with no Bedrock model call — used to apply one policy to self-hosted models, third-party APIs and user content. |
| **Application inference profile** | A tagged Bedrock profile used for cost and usage attribution per team or application. Distinct from a cross-region inference profile. |
| **Attention** | The transformer mechanism that weighs every token against every other. Its cost grows roughly with the square of input length, and its unevenness across long inputs produces the lost-in-the-middle effect. |
| **Automated Reasoning checks** | Guardrails capability that translates a written policy into formal logic and mathematically verifies claims, returning verified, contradicted or indeterminate. The "provable" answer. |
| **Batch inference** | Asynchronous bulk processing via a JSONL manifest in S3, at roughly 50% of on-demand price on supported models. |
| **Bedrock Data Automation (BDA)** | Managed multimodal extraction — text, tables, figures, layout — from documents, images, audio and video. Sits at the parse step of ingestion. |
| **Bedrock Flows** | Low-code visual workflow builder inside Bedrock chaining prompts, knowledge bases, agents, Lambdas, conditions and iterators. Versioned. |
| **BERTScore** | Evaluation metric using contextual embeddings to measure semantic similarity to a reference. Handles paraphrase better than ROUGE; still says nothing about factual truth. |
| **Binary embedding** | Embedding quantised to one bit per dimension. Very large storage reduction, some quality loss, needs model and store support. |
| **BLEU** | Precision-oriented n-gram overlap metric from machine translation. |
| **BM25** | Classic keyword ranking function. The lexical half of hybrid search, and what actually finds rare exact tokens. |
| **Canary release** | Exposing a change to a small percentage of real users with monitoring before full rollout. |
| **Chain-of-thought** | Prompting the model to reason step by step before answering. Helps multi-hop and arithmetic; costs output tokens and latency. |
| **Chunking** | Splitting documents into retrievable units. Strategies: fixed-size, semantic, hierarchical, none, custom. |
| **Citations** | Mappings from spans of a generated answer back to source chunks and their locations. Returned by `RetrieveAndGenerate`. The audit trail for RAG. |
| **Cold start (retrieval sense)** | Not a Bedrock term — but note that OpenSearch Serverless bills continuously, so "cold" corpora are still expensive there. S3 Vectors exists for this. |
| **Content filter** | Guardrail policy covering harm categories (hate, insults, sexual, violence, misconduct) plus prompt attacks. Strength configurable per category and per direction. |
| **Context relevance** | RAG metric: do the retrieved passages contain what is needed to answer the question? Measures *retrieval*. |
| **Context window** | Total tokens a model can hold in one request — shared by system prompt, tools, history, retrieved content, question and reserved output. |
| **Contextual grounding check** | Guardrail policy scoring whether an answer is supported by the retrieved passages (grounding) and answers the question (relevance). Probabilistic, not formal. |
| **Continued pre-training** | Further training a base model on a large unlabelled domain corpus. The top of the customisation ladder; months and serious money. |
| **Converse API** | Bedrock's unified conversational interface across providers — messages, system prompt, inference config, tool use. The portability answer. |
| **Cosine similarity** | Angle between two vectors. 1 = same direction, 0 = unrelated, −1 = opposite. The basis of vector retrieval. |
| **Cross-encoder** | A model that reads query and passage together to score relevance. What a reranker uses, and why it beats bi-encoder embedding similarity. |
| **Cross-region inference profile** | Routes invocations across several regions for throughput and resilience. Moves where inference runs — a data residency consideration. |
| **Custom Model Import** | Bringing your own weights for supported open architectures into the Bedrock API. Served via Provisioned Throughput. |

## 3. D – H

| Term | Definition |
| --- | --- |
| **Denied topic** | Guardrail policy blocking a subject area, matched semantically from a natural-language definition plus example phrasings. Coverage is only as good as your examples. |
| **Dimensionality** | Length of an embedding vector. Titan Text Embeddings V2 supports 256, 512 and 1024. Fewer dimensions = cheaper storage, faster search, some quality loss. |
| **Distillation** | Training a small student model on a large teacher's outputs. Near-teacher quality at student cost, for one specific task. |
| **Embedding** | Fixed-length numeric vector representing the meaning of text. Query and documents must use the same model. |
| **Excessive agency** | OWASP LLM risk: an agent able to take consequential real-world actions. Mitigated by bounding tools, approval gates and least-privilege roles. |
| **Faithfulness** | RAG metric: is the answer supported by the retrieved context, with nothing invented? Measures *generation*. |
| **Few-shot** | Including 2–5 worked examples in the prompt. Highest-leverage technique after stating the task clearly. |
| **Fine-tuning** | Training a base model on labelled prompt/completion pairs to change behaviour, tone or format. Served via Provisioned Throughput. |
| **Foundation model (FM)** | A large model pre-trained on broad data and adapted to many tasks, rather than trained for one. |
| **Function calling** | See *tool use*. |
| **Golden dataset** | A fixed curated set of inputs with known-good outputs, used as a regression suite across prompt, model and retrieval changes. |
| **GraphRAG** | Retrieval combining a knowledge graph of entities and relationships with vectors. For multi-hop questions no single chunk can answer. |
| **Grounding** | Supplying authoritative source material and instructing the model to answer only from it. |
| **Guardrail** | A configurable Bedrock safety layer evaluating input before the model and output before the user. |
| **Hallucination** | Fluent, confident output not supported by sources or fact. A consequence of next-token prediction, not a bug in a particular model. |
| **Hierarchical chunking** | Search small child chunks, return large parent chunks. Fixes "the right passage is retrieved but the answer lacks context". |
| **HNSW** | Hierarchical Navigable Small World — the common ANN graph index in vector stores. |
| **Hybrid search** | Dense vector similarity fused with BM25 keyword matching. The fix for exact rare tokens like part numbers and error codes. |

## 4. I – P

| Term | Definition |
| --- | --- |
| **Indirect prompt injection** | An attack payload arriving through content the system fetches — a poisoned document, a web page, an email. More dangerous than direct injection because the user never sees it. |
| **Inference parameter** | A per-request generation setting: temperature, topP, topK, maxTokens, stopSequences. |
| **Insecure output handling** | OWASP LLM risk: treating model output as trusted. Rendering it as HTML invites XSS; passing it to a shell or SQL invites injection. |
| **Intelligent Prompt Routing** | Bedrock feature routing each request to a smaller or larger model in a family based on predicted complexity. |
| **Knowledge Base** | Bedrock's managed RAG: data sources, parsing, chunking, embedding, vector storage, retrieval, generation with citations. |
| **LLM-as-a-judge** | Using a model to score outputs against a rubric. Biased toward length and confident phrasing; calibrate against human review. |
| **Lost in the middle** | Models recall the start and end of a long input better than the middle. Put critical instructions and the question at the end. |
| **MCP (Model Context Protocol)** | Open standard for connecting models and agents to external tools and data sources. AgentCore Gateway can expose tools over it. |
| **Metadata filtering** | Restricting retrieval by document attributes supplied via a `.metadata.json` sidecar. The mechanism for tenant, date and classification scoping. |
| **Model access** | Per-model, per-region enablement in the Bedrock console. Separate from IAM, and a common cause of region-specific AccessDenied. |
| **Model invocation logging** | Bedrock feature capturing actual prompts and completions to CloudWatch Logs or S3. Distinct from CloudTrail, which records the call not the content. |
| **Model unit** | The unit of dedicated capacity purchased under Provisioned Throughput. |
| **Multimodal** | Accepting or producing more than one data type — text plus images, audio, video. Distinct from multilingual. |
| **Nucleus sampling** | See *top-p*. |
| **OWASP Top 10 for LLM Applications** | The standard risk taxonomy: prompt injection, insecure output handling, training data poisoning, model DoS, supply chain, sensitive information disclosure, insecure plugin design, excessive agency, overreliance. |
| **pgvector** | PostgreSQL extension providing vector types and similarity search. Used with Aurora PostgreSQL as a Bedrock vector store. |
| **PII** | Personally identifiable information. Handled by Comprehend (in-line redaction), Macie (discovery at rest) and the Guardrails sensitive information policy (BLOCK or ANONYMIZE). |
| **PrivateLink** | Interface VPC endpoints keeping AWS service traffic off the public internet, with an endpoint policy as an extra enforcement point. |
| **Prompt attack filter** | Content filter category targeting injection and jailbreak attempts on input. |
| **Prompt caching** | Reusing a stable prompt prefix at a steeply reduced input rate, with a latency benefit. Not response caching. |
| **Prompt injection** | Adversarial text that overrides your instructions. Unfixable at the model layer; mitigated by bounding what tools can do. |
| **Prompt Management** | Bedrock feature storing prompts as versioned artifacts decoupled from application deployments. |
| **Provisioned Throughput** | Dedicated Bedrock capacity in model units, 1- or 6-month commitment. Required to serve custom models at scale. |

## 5. Q – Z

| Term | Definition |
| --- | --- |
| **Query decomposition** | Splitting a compound question into sub-questions, retrieving for each, then synthesising. |
| **RAG** | Retrieval-augmented generation. Retrieve relevant content, put it in the prompt, generate an answer grounded in it. |
| **ReAct** | Reason → Act → Observe → repeat. The loop underneath tool-using agents. |
| **Reranking** | Over-fetching candidates then re-scoring them with a cross-encoder to improve precision of the final top-k. |
| **Retrieve / RetrieveAndGenerate** | Knowledge Base APIs. `Retrieve` returns chunks only; `RetrieveAndGenerate` also produces an answer with citations. |
| **Return of Control** | The agent decides which tool to call and with what arguments; your application executes it. For private resources, existing business logic, and human approval gates. |
| **ROUGE** | N-gram overlap metric conventionally used for summarisation. Rewards surface overlap over meaning. |
| **S3 Vectors** | Low-cost vector storage for large, infrequently-queried corpora. Watch metadata size limits with large hierarchical parent chunks. |
| **SageMaker Clarify** | Bias metrics (pre- and post-training) and feature-attribution explainability; also runs FM evaluations. |
| **SCP (Service Control Policy)** | Organizations-level preventive guardrail — for example denying Bedrock in non-approved regions, or preventing guardrail deletion. |
| **Semantic caching** | Serving a stored answer when a new question is sufficiently similar to a previous one. Too loose a threshold produces confidently wrong answers. |
| **Semantic chunking** | Cutting where sentence-to-sentence similarity drops below a breakpoint percentile. |
| **Session state** | Attributes passed into an agent invocation to carry caller context — user ID, entitlements, locale — without putting it in the user message. |
| **Shadow testing** | Running a new configuration on live traffic without showing results to users, then diffing offline. Zero user risk. |
| **stopReason** | Field in a Converse response explaining why generation ended: `end_turn`, `max_tokens`, `stop_sequence`, `tool_use`. |
| **Strands Agents** | Open-source, code-first AWS agent SDK. Tools are decorated functions; deploys to AgentCore Runtime or your own compute. |
| **Structured output** | Constraining generation to a schema, usually via tool use, then validating the result. |
| **Supervisor / collaborator** | Multi-agent pattern where a supervisor routes work to specialised agents, each with its own tools, knowledge base and IAM role. |
| **Temperature** | Rescales the next-token distribution before sampling. Low = deterministic, high = creative. Set to 0 for evaluation. |
| **Titan Text Embeddings V2** | Amazon's embedding model. 256 / 512 / 1024 dimensions, plus binary output. Default for Bedrock Knowledge Bases. |
| **Token** | Subword unit from a model's vocabulary. The unit of billing and of the context window. English prose ≈ 4 characters per token. |
| **Tool use** | The model emits a structured request naming a tool and arguments; *your* code executes it and returns the result. The model never executes anything. |
| **Top-k** | Keep exactly the k highest-probability tokens, regardless of model confidence. |
| **Top-p** | Nucleus sampling — keep the smallest set of tokens whose cumulative probability reaches p. Adaptive to confidence. |
| **Trace** | Bedrock Agents' per-step record of reasoning, tool selection, inputs, outputs and knowledge base lookups. The primary agent debugging artifact. |
| **Transformer** | The neural architecture underlying modern language models, built on attention. |
| **Vector store** | A database optimised for approximate nearest-neighbour search over embeddings, holding the vector, the chunk text and its metadata. |
| **Watermarking** | Invisible marking of generated images by Amazon Titan Image Generator / Nova Canvas, with a detection API. The provenance mechanism for generated imagery. |
| **Word filter** | Guardrail policy blocking exact strings, plus a managed profanity list. Precise for enumerable lists; blind to paraphrase. |
| **Zero-shot** | Prompting with an instruction and no examples. |
