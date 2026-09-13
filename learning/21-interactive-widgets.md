---
title: Interactive widget teaching notes
source: src/assets/js/interactive.js
group: Reference
---

# Interactive widget teaching notes

The HTML site has 14 playable widgets. This file keeps the teaching copy that lives inside them — the notes, lookup tables and decision rules — so it can be studied without the UI.

Rates and model IDs here are **illustrative**. The exam tests magnitude ordering, not a specific price list.

## 1. Token counter

A token is a subword unit. Bedrock bills on tokens, and a context window is measured in tokens.

Rule of thumb for English prose: **1 token ≈ 4 characters ≈ 0.75 words**. Code, JSON and non-Latin scripts are much denser — JSON can hit 1 token per 2 characters, which is why stuffing raw API responses into a prompt gets expensive fast.

## 2. Temperature, top-p and top-k

The model produces a probability for every token in its vocabulary. These three knobs reshape that distribution before one token is sampled.

| Setting | What it means |
| --- | --- |
| Temperature ≤ 0.15 | Near-deterministic. Same prompt → same answer. Use for classification, extraction, routing, SQL, anything you unit-test. |
| Temperature ≤ 0.8 | Balanced. Sensible default for RAG answers and assistants. |
| Temperature ≤ 1.3 | Creative. Brainstorming and copy. Bad for reproducible evals. |
| Temperature higher | Chaotic. Low-probability tokens get real mass; RAG answers drift off the retrieved context. |

If top-p / top-k clamps the candidate set to one or two tokens, temperature barely matters — there is almost nothing left to choose between.

**Top-p** keeps the smallest set of tokens whose cumulative probability reaches p (adaptive). **Top-k** always keeps exactly k candidates (fixed).

## 3. Embeddings and cosine similarity

An embedding model turns text into a list of numbers — a **vector**. Similar meaning lands in a similar direction. Retrieval is “find the stored vectors pointing the same way as my question.”

Cosine similarity: 1 = same direction, 0 = unrelated, −1 = opposite.

| Score | Retriever behaviour |
| --- | --- |
| > 0.75 | Near-duplicates — a strong hit |
| > 0.45 | Plausible hit; a 0.5 threshold squeaks it in |
| > 0.2 | Weak — naive top-k=5 quietly poisons the prompt |
| below | Unrelated — a threshold filter should drop it |

Real embedding models (Titan Text Embeddings V2, Cohere Embed) use 256–1024 dimensions. A vector database exists to run this comparison against millions of stored vectors in milliseconds using an ANN index such as HNSW.

## 4. Chunking playground

Chunk too big and retrieval drags in noise. Chunk too small and you sever the sentence from the fact that gives it meaning.

| Strategy | Teaching point |
| --- | --- |
| **Fixed-size** | Bedrock Knowledge Bases default (300 tokens, 20% overlap). Cheap, predictable, and it will slice a sentence in half. Overlap repeats the tail of chunk n at the head of chunk n+1 so a straddling fact still appears intact. Overlap costs storage and adds duplicate hits to top-k. |
| **Semantic** | Splits where meaning shifts: embed each sentence, cut when neighbour similarity drops below a breakpoint percentile. Uneven but coherent. Extra embedding cost at ingestion only. Best for prose: policies, contracts, docs. |
| **Hierarchical** | Search small child chunks, return the large parent. Favourite exam answer when “retrieval finds the right passage but the answer lacks surrounding context.” |
| **None** | One file, one chunk, one vector. Correct only when files are already chunk-sized (FAQ entries, product records, per-ticket exports). On a 60-page PDF it produces one blurry average vector. |

## 5. The RAG pipeline (nine stages)

### 1. Ingest — load the source documents

A **data source** — usually an S3 prefix, but also SharePoint, Confluence, Salesforce, Web Crawler or Amazon S3 tables — is registered against a Bedrock Knowledge Base. On `StartIngestionJob` the service walks the source and picks up new, changed and deleted files.

Parsing happens here too. Default parsing handles plain text. For PDFs full of tables and diagrams you switch on **foundation-model parsing** or **Amazon Bedrock Data Automation**, which describes images and preserves table structure.

Exam trigger: “scanned PDFs with tables and charts return poor answers” → the fix is at **parse time**, not retrieval time.

### 2. Chunk — split into retrievable units

Fixed-size, semantic, hierarchical, or none — plus an optional **custom transformation Lambda** that can rewrite chunks, strip boilerplate, or attach metadata before embedding.

A `.metadata.json` sidecar next to each document in S3 becomes filterable attributes at query time (per-tenant, per-department, date-scoped retrieval without a separate index).

### 3. Embed — turn each chunk into a vector

Titan Text Embeddings V2 (256/512/1024 dims, plus binary output) or Cohere Embed (English/multilingual).

**The embedding model is a one-way door.** Query vectors and stored vectors must come from the same model with the same dimensionality. Switching models means a full re-index.

### 4. Store — write vectors to the vector store

OpenSearch Serverless is the default. Others: Amazon S3 Vectors (cheapest, large cold corpora), Aurora PostgreSQL with pgvector, Neptune Analytics (GraphRAG), OpenSearch Managed Cluster, plus Pinecone, MongoDB Atlas, Redis Enterprise.

The store keeps the vector, the chunk text and the metadata. An ANN index (HNSW) makes nearest-neighbour lookup sublinear.

### 5. Retrieve — find the chunks that match the question

The question is embedded with the *same* model; the store returns the top-k nearest chunks.

- **Hybrid search** — dense vectors + BM25. Fixes exact product codes / error IDs that are semantically invisible.
- **Metadata filtering** — pre-filter by tenant, date, department.
- **Reranking** — over-fetch (say 25), reranker reorders, keep the best 5.
- **Query decomposition** — split a compound question and retrieve for each.

### 6. Augment — build the final prompt

Retrieved chunks go into a prompt template with the question and system instructions. The instruction that matters most: answer *only* from the provided context and say “I don't know” otherwise.

If you need the chunks but want to build your own prompt, call `Retrieve` instead of `RetrieveAndGenerate`.

### 7. Generate — model answers, with citations

Knowledge Bases returns **citations** mapping spans of the answer back to source chunks and their S3 URIs — the audit trail. In regulated scenarios that is a requirement.

### 8. Guard — check the answer before it ships

A Bedrock Guardrail applies content filters, denied topics, PII redaction and the **contextual grounding check** (is the answer supported by the passages, and is it relevant?). Below threshold, blocked.

**Automated Reasoning checks** translate a policy document into formal logic and mathematically verify claims: verified / contradicted / indeterminate.

### 9. Observe — log, evaluate, iterate

Model invocation logging to CloudWatch or S3, CloudWatch metrics, X-Ray traces. RAG evaluation jobs score retrieval (context relevance, coverage) separately from generation (faithfulness, correctness, completeness).

**Always diagnose retrieval and generation separately.** If the right chunk never came back, no amount of prompt tuning will save the answer.

## 6. Bedrock cost model

On-demand billing is **per token, input and output priced separately**, and output is typically 3–5× input.

Prompt cache hits on Anthropic models bill cache reads at a steep discount (~10% of the input rate in the widget’s model). Batch inference is ~50% of on-demand on supported models.

The gap between the cheapest and most expensive models at the same volume is usually **50–100×**, which is why “route the easy 80% of traffic to a small model” beats every other optimisation.

Illustrative US on-demand $/1M tokens (check current Bedrock pricing — these move):

| Model | Input $/M | Output $/M | Context | Reach for it when |
| --- | ---: | ---: | ---: | --- |
| Amazon Nova Micro | 0.035 | 0.14 | 128k | High volume, classification, routing, extraction, simple RAG |
| Amazon Nova Lite | 0.06 | 0.24 | 300k | High volume, classification, routing, extraction, simple RAG |
| Amazon Nova Pro | 0.80 | 3.20 | 300k | General assistants, most RAG, tool-using agents |
| Claude 3.5 Haiku | 0.80 | 4.00 | 200k | High volume, classification, routing, extraction, simple RAG |
| Claude 3.5 Sonnet | 3.00 | 15.00 | 200k | General assistants, most RAG, tool-using agents |
| Claude 3 Opus | 15.00 | 75.00 | 200k | Hard multi-step reasoning, code, high-stakes analysis, LLM-as-a-judge |
| Llama 3.1 8B | 0.22 | 0.22 | 128k | High volume, classification, routing, extraction, simple RAG |
| Llama 3.3 70B | 0.72 | 0.72 | 128k | General assistants, most RAG, tool-using agents |
| Mistral Large 2 | 2.00 | 6.00 | 128k | General assistants, most RAG, tool-using agents |

The exam never asks you to recall a number, only the **ordering**: small models are one to two orders of magnitude cheaper, and output always costs more than input.

## 7. Guardrail simulator

A guardrail runs **twice**: once on the input before it reaches the model, once on the output before it reaches the user.

| Policy | What it does |
| --- | --- |
| Prompt attack filter (input) | Known injection patterns. Input **BLOCKED** before the model — you are not billed for inference. |
| Sensitive information (PII) | Detect and **ANONYMIZE** (placeholder like `{EMAIL}`) or **BLOCK** the whole request. |
| Denied topics | Semantic match from a definition plus examples. Returns `blockedInputMessaging`; model never invoked. |
| Contextual grounding check (output) | Scores whether the answer is supported by retrieved passages. Below threshold → blocked as a likely hallucination. |

Blocked responses carry `"action": "GUARDRAIL_INTERVENED"` and CloudWatch records the trace.

## 8. Context window budget

A context window is not just “the question”. System prompt, tool schemas, conversation history, retrieved chunks, the question **and** reserved output all share one budget.

Overflow → validation error, or the framework silently truncates oldest history and the assistant “forgets”. Fixes: rolling summary, cut top-k, hierarchical chunking, larger-context model.

Filling a big window is not free: you pay for every input token on every call, and long contexts degrade recall of material buried in the middle (**lost in the middle**). Prompt caching is designed for a large stable prefix plus a small varying tail.

## 9. Retrieval tuning

Knobs: **top-k**, **score threshold**, **rerank** (over-fetch then keep k).

Irrelevant chunks are not harmless: they cost input tokens and they pull the answer off-target.

Reranking re-scores an over-fetched pool with a **cross-encoder** that reads query and chunk *together*, which a bi-encoder embedding cannot.

Precision = relevant among retrieved. Recall = relevant retrieved among relevant in the corpus.

## 10. Prompt anatomy

| Block | Why it earns its tokens |
| --- | --- |
| Role / persona | Sets tone and vocabulary. Cheap, mildly useful. Does not improve factual accuracy on its own. |
| Explicit task | Highest-value line in a RAG prompt. “Only” is doing the work — without it the model blends parametric knowledge with your documents. |
| Retrieved context | Delimit with XML-ish tags so “cite the passage” instructions actually work. |
| Constraints / escape hatch | “If the passages do not contain the answer, say you don't know.” Cheapest hallucination control. Models hallucinate partly because nothing permits them to fail. |
| Output format | Machine-readable. Pair with a tool schema or Converse structured output. |
| Few-shot examples | Two to five examples beat three paragraphs of description for format and edge cases. Highest-leverage technique after the task line. |
| Reasoning / CoT | Helps multi-hop and arithmetic. Costs output tokens and latency — do not apply to simple lookups. |
| The question | Put it **last**. Models weight the end of the prompt; burying the question above 20k tokens of context is a self-inflicted wound. |

## 11. On-demand vs Provisioned Throughput

Provisioned Throughput buys dedicated capacity in **model units** with a 1-month or 6-month commitment. It is the option for a custom (fine-tuned or imported) model served at scale, and the right one when you need guaranteed throughput instead of shared-pool quotas.

On-demand scales linearly with traffic; provisioned is a flat line. They cross on the chart. Below the crossover you pay for idle capacity; above it you leave money on the table.

**Cost is often not the deciding factor.** Choose PT when you need predictable latency under load, when quota throttling is unacceptable, or when you are serving a customised model.

## 12. Symptom → diagnosis → fix

| Symptom | Diagnosis | Fix |
| --- | --- | --- |
| Answer invents a policy number that appears nowhere in our documents | Generation, ungrounded | Contextual grounding check; “answer only from the passages, otherwise say you don't know”; drop temperature. Also check whether retrieval returned anything — empty context + chatty prompt is a hallucination factory. |
| The right document exists but never comes back | Retrieval | Inspect chunks with the Retrieve API. Usual causes: chunking split the fact from its heading; query vocabulary the document does not use (enable hybrid search); metadata filter silently excluding it. Re-sync after any chunking change. |
| Exact product codes and error IDs are never found | Retrieval, semantic-only | Enable hybrid search. Dense embeddings are poor at rare exact tokens; BM25 handles them. |
| Right passage retrieved, but the answer misses surrounding context | Chunking | Hierarchical chunking (search children, return parents). Or increase chunk size / overlap. |
| ThrottlingException / 429 under load | Quota | Backoff+jitter → cross-region inference profile → quota increase → Provisioned Throughput if load is sustained. Batch anything not interactive. |
| Answers get cut off mid-sentence | Output limit | `maxTokens` too low, or a stop sequence. Check `stopReason`: `max_tokens` vs `end_turn` vs `stop_sequence`. |
| Agent loops, calling the same tool repeatedly | Agent orchestration | Ambiguous tool description, or tool returns an error the model cannot interpret. Read the agent trace. Tighten the description, return structured errors, bound iterations. |
| Latency spikes only on long documents | Prompt size | TTFT scales with input length. Cut retrieved context, enable prompt caching for the static prefix, stream, or move to a smaller model. |
| Guardrail blocks legitimate medical questions | Guardrail false positive | Filter too aggressive or denied topic drawn too broadly. Narrow the definition, lower strength, test against a labelled set. |
| Cost tripled overnight with flat request volume | Token growth | Almost always input tokens: top-k or chunk size raised, unbounded history, or a tool returning a larger payload. Check CloudWatch input-token metrics per application inference profile. |
| Model ignores instructions buried in a long prompt | Prompt structure | Lost-in-the-middle. Move critical instructions to the end, delimit with XML tags, cut irrelevant context. |
| Evaluation scores swing wildly between runs | Non-determinism | Temperature 0 and fixed top-p for eval; fixed dataset; average several runs; pin the judge model version. |
