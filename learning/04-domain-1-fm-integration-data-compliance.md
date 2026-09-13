---
title: Domain 1 — FM Integration, Data & Compliance
source: src/content/domain1.html
group: Learn
exam_weight: 31%
---

# Domain 1 — FM Integration, Data & Compliance

> **Exam — Domain 1 — 31% of scored content, roughly 20 questions**
>
> The biggest domain and the one everything else builds on. It covers choosing a foundation model against real constraints, choosing how to invoke it, and then the whole of retrieval-augmented generation — chunking, embeddings, vector stores, knowledge bases, advanced retrieval — plus the data governance and compliance wrapper around all of it.

## 1. Choosing a foundation model

"Which model should we use?" is never answered by a benchmark leaderboard on this exam. It is answered by working through constraints. There are eight that matter, and a question will always pin at least one of them.

| Constraint | What to check | How it shows up in a stem |
| --- | --- | --- |
| **Capability** | Can it do the task at the required quality? Measure on *your* data, not on public benchmarks. | "complex multi-step reasoning", "must handle legal nuance" |
| **Modality** | Text only? Image input? Image or video generation? Embeddings? | "users upload a photograph of the damaged part" |
| **Context window** | Does the largest realistic request fit — including retrieved context and reserved output? | "documents are 150–400 pages" |
| **Latency** | Interactive (sub-second to a few seconds) or asynchronous? Smaller models are faster. | "must respond within 800 ms at p95" |
| **Cost** | Input and output rates, multiplied by real volume. The catalogue spans 50–100×. | "cost is the primary constraint", "3 million requests per day" |
| **Region availability** | Not every model is offered in every region. Check before designing. | "must run in eu-central-1" |
| **Data residency** | Where inference physically runs. Cross-region inference profiles move it. | "no data may leave the EU" |
| **Licensing / terms** | Provider acceptable-use and licence terms for your commercial application. | "redistributed as part of our product" |

### The model catalogue, organised the way you need it

| Family | Members | Where it fits |
| --- | --- | --- |
| **Anthropic Claude** | Haiku (fast) · Sonnet (balanced) · Opus (most capable) | Strong general reasoning, long context, excellent tool use. Sonnet is the common default for RAG and agents. |
| **Amazon Nova** | Micro · Lite · Pro · Premier (understanding); Canvas (image); Reel (video); Sonic (speech) | Aggressive price-performance. Nova Micro and Lite are strong candidates for the high-volume "easy 80%" of traffic. |
| **Meta Llama** | 8B through 405B, several generations | Open weights. Attractive when licence terms and portability matter. |
| **Mistral** | Small, Large, and code-specialised variants | Efficient European models; some strong code performance. |
| **Cohere** | Command (generation) · Embed (embeddings) · Rerank | Cohere Embed and Rerank are the ones to remember for retrieval pipelines. |
| **Amazon Titan** | Text Embeddings V2 · Multimodal Embeddings · Image Generator | Titan Text Embeddings V2 is the default embedding model for Bedrock Knowledge Bases. |
| **AI21, Stability, others** | Jamba, Stable Diffusion family | Specialised. Know they exist. |

The examinable point is not the roster — it is the **tiering pattern**. Every major family ships a small/medium/large ladder. Recognising that is what lets you answer routing and cost questions without knowing any specific model's numbers.

> **Interactive widget (`modeltable`)**
>
> Model picker sorted by input price, output price, or context window. Playable in the HTML study site.

> **Tip — How to actually decide, and what the exam calls the right answer**
>
> Define the constraints → shortlist models that satisfy the hard ones (modality, region, context, licence) → build a representative evaluation dataset from your own traffic → run a **Bedrock model evaluation job** scoring the candidates → pick on measured quality per dollar. Any option that says "pick the top model on a public benchmark" is wrong.

## 2. How to invoke: the four inference modes

Choosing the model is half the decision. How you call it is the other half, and it is worth more marks than most people expect.

| Mode | What it is | Choose it when | Watch out for |
| --- | --- | --- | --- |
| **On-demand** | Pay per token, shared capacity pool, no commitment | Default for interactive workloads and anything variable | Subject to per-model, per-region quotas — you will meet `ThrottlingException` |
| **Batch inference** | JSONL manifest in S3 → async processing → results to S3 | No human waiting: backlogs, bulk classification, one-off corpus processing. Roughly **50% of on-demand** on supported models | Not interactive. Completion is measured in hours |
| **Provisioned Throughput** | Dedicated capacity in **model units**, 1- or 6-month commitment | Sustained predictable load; guaranteed throughput; predictable latency; **required to serve custom models at scale** | You pay for the commitment whether you use it or not |
| **Cross-region inference profile** | Routes invocations across a set of regions | Bursty traffic, throttling relief, resilience to regional capacity pressure | **Inference runs outside your region.** Check residency before enabling — this is a favourite trap |

> **Interactive widget (`throughput`)**
>
> On-demand vs Provisioned Throughput crossover calculator. Playable in the HTML study site.

> **Warning — Two profiles, easily confused**
>
> **Cross-region (system-defined) inference profiles** spread invocations across regions for throughput and resilience.
>
> **Application inference profiles** are a tagging construct for *cost and usage attribution* — one per team or application, so Cost Explorer and CloudWatch can tell you who spent what. Different purpose entirely, and both are examinable.

## 3. Dynamic model switching

Models improve, prices change, and a model you depend on may become unavailable in a region. An architecture that hard-codes a model ID into a deployment artifact is one you will regret.

1. **Client** — Request arrives at API Gateway
2. **Lambda** — Reads the current model ID from configuration at invocation time
3. **AppConfig** — Holds the model ID, validated, with a deployment strategy
4. **Bedrock** — Invoked via Converse, so the request shape is model-agnostic
5. **CloudWatch** — Alarm on error rate or latency triggers automatic rollback

Two pieces make this work, and both are examinable:

- **The Converse API** normalises messages, system prompts, inference parameters and tool definitions across providers. Without it, swapping Claude for Nova means rewriting your request builder. With it, it is a string change.
- **Externalised configuration** — AWS AppConfig or Parameter Store — means the change ships without a deployment. AppConfig adds validated, gradual rollout with automatic rollback on a CloudWatch alarm, which is what you want when the change being rolled out is "everyone now talks to a different model".

> **Interactive widget (`dtree`)** — Which inference mode?
>
> Interactive decision tree (full tree expanded below). Playable in the HTML study site.
>
> **Decision tree — Which inference mode?**
>
> - Is a human waiting for this response?
>   - **Yes — it is interactive**
>     - Is the load sustained and predictable, or bursty?
>       - **Sustained, high, 24/7 — and we are hitting throttles**
>         - Is it a base model or a custom (fine-tuned / imported) model?
>           - **Base model** → **Provisioned Throughput — after modelling the crossover**
>             Model the crossover against on-demand first. But note that guaranteed throughput and predictable latency under load are reasons to choose it *regardless* of where the cost lines cross. Consider a cross-region inference profile first if the throttling is bursty rather than sustained.
>           - **Custom model** → **Provisioned Throughput — required**
>             Custom models (fine-tuned or imported) are served through Provisioned Throughput, not the shared on-demand pool. Factor that commitment into any fine-tuning business case.
>       - **Bursty, with occasional throttling** → **On-demand + cross-region inference profile**
>         Backoff with jitter first, then a cross-region profile to widen the capacity pool. **Confirm the profile’s regions satisfy your data residency requirements** before enabling it.
>       - **Low or moderate and variable** → **On-demand**
>         The default. No commitment, pay per token, scales to zero. Set an AWS Budget alarm and watch your throttle metrics.
>   - **No — it can complete later**
>     - Does it need to finish within seconds, or is hours acceptable?
>       - **Hours are fine — a backlog, a nightly job, a migration** → **Batch inference**
>         Roughly 50% of on-demand pricing on supported models. Write a JSONL manifest to S3, submit the job, collect results from S3. No throttling to manage. This is the correct answer whenever a stem says overnight, backlog, or not user-facing.
>       - **Seconds — an async API where the client polls shortly after** → **On-demand behind SQS + a worker**
>         A queue absorbs bursts, provides retries and a dead-letter queue, and lets you consume at a rate that respects your quotas. Batch would be too slow for a client that polls within seconds.

## 4. Embeddings in depth

You met embeddings in Module 0. Here is what Domain 1 expects you to know beyond the concept.

| Property | Detail | Why it matters |
| --- | --- | --- |
| **Dimensionality** | Titan Text Embeddings V2 supports 256 / 512 / 1024 | Fewer dimensions = less storage and faster search, at some quality cost. A real, tunable trade-off |
| **Binary embeddings** | 1 bit per dimension instead of a float | Dramatic storage reduction for very large corpora, where supported by both model and store |
| **Multilingual** | Cohere Embed Multilingual, Titan multilingual support | Required if a query in one language must match a document in another. Otherwise cross-lingual retrieval simply fails |
| **Multimodal** | Titan Multimodal Embeddings put images and text in one space | Lets you retrieve images by text description and vice versa |
| **Max input length** | Each embedding model has a token limit per input | Chunks larger than the limit get truncated — silently losing the tail of your content |

> **Warning — The one-way door**
>
> Query vectors and stored vectors must come from the **same embedding model at the same dimensionality**. Comparing a Cohere query vector to a Titan document vector produces a number, and that number is meaningless. Changing embedding model requires re-embedding and re-indexing the entire corpus. The failure mode if you get this wrong is the worst kind: nothing errors, retrieval quality just quietly collapses.

### How to compare embedding models

Not by absolute similarity scores — those are not comparable across models. What matters is **separation**: the margin between how a model scores relevant pairs versus irrelevant ones. A model that scores everything at 0.9 has no discriminative power. Build a labelled set of query/relevant-chunk pairs plus known-irrelevant chunks, and measure the gap.

## 5. Vector stores

Bedrock Knowledge Bases supports several vector stores natively. The choice is a genuine architectural decision with cost, latency and capability consequences.

| Store | Strength | Choose it when | Trade-off |
| --- | --- | --- | --- |
| **OpenSearch Serverless** | The default; fast, fully managed, supports hybrid search | You want it to work with the least thought. Most scenarios. | Continuous OCU cost even when idle — expensive for cold data |
| **Amazon S3 Vectors** | By far the cheapest storage at scale | Very large corpora, infrequently queried, cost-sensitive | Higher query latency; metadata size limits can bite with large hierarchical parent chunks |
| **Aurora PostgreSQL (pgvector)** | Vectors alongside relational data, with SQL and transactions | You already run Aurora and want joins between vectors and business data | You manage index tuning; distance metric and index parameters matter |
| **Neptune Analytics** | Graph plus vectors — GraphRAG | Multi-hop questions about relationships between entities | More modelling work; you must build the graph |
| **OpenSearch Managed Cluster** | Full control over cluster sizing and configuration | Existing OpenSearch estate, or capacity needs the serverless model does not fit | You operate the cluster |
| **Pinecone · MongoDB Atlas · Redis Enterprise** | Third-party managed options | Existing investment or a specific capability you need | Another vendor relationship and another bill |

> **Interactive widget (`dtree`)** — Which vector store?
>
> Interactive decision tree (full tree expanded below). Playable in the HTML study site.
>
> **Decision tree — Which vector store?**
>
> - What is the dominant characteristic of your corpus and access pattern?
>   - **Millions of vectors, queried rarely, cost is the driver** → **Amazon S3 Vectors**
>     Purpose-built for large, cold, cost-sensitive vector corpora. Accept higher query latency. Watch the metadata size limit if you use hierarchical chunking with very large parent chunks — that combination is a known failure.
>   - **Questions are about relationships between entities across documents** → **Neptune Analytics (GraphRAG)**
>     “Which suppliers appear in both the audit findings and the restricted list” cannot be answered by similarity search, because no single chunk contains the answer. A graph lets traversal connect facts across documents.
>   - **We already run Aurora and want vectors beside relational data** → **Aurora PostgreSQL with pgvector**
>     Joins between vectors and business tables, one database to operate, transactional consistency. You own index tuning — check the distance metric matches how the embeddings were trained, and size HNSW parameters deliberately.
>   - **Standard RAG, want it managed, hybrid search matters** → **OpenSearch Serverless**
>     The default for good reasons: managed, fast, supports dense plus BM25 hybrid search, integrates cleanly with Knowledge Bases. The cost is continuous OCU spend, so revisit it if the corpus is genuinely cold.

## 6. Chunking — the highest-leverage decision in RAG

Chunking decides what a "unit of retrievable knowledge" is. Get it wrong and no amount of prompt engineering, reranking or model upgrading will rescue the answers. Get it right and mediocre everything else still works.

> **Interactive widget (`chunker`)**
>
> Chunking playground — fixed-size, semantic, hierarchical, and none. Playable in the HTML study site.

### The decision table you should be able to reproduce from memory

| Strategy | How it works | Best for | The symptom it fixes |
| --- | --- | --- | --- |
| **Fixed-size** KB default: 300 tokens, 20% overlap | Cut every N tokens, repeat the tail of each chunk at the head of the next | Homogeneous prose where structure is weak; a sane starting point | Nothing specific — it is the baseline you tune away from |
| **Semantic** | Embed sentences, cut where topic similarity drops below a breakpoint percentile | Policies, contracts, documentation — prose with clear topic shifts | "Chunks contain two unrelated topics, so retrieval matches on the wrong half" |
| **Hierarchical** | **Search small children, return large parents** | Long structured documents; anywhere precision and context are both needed | **"The right passage is retrieved but the answer lacks surrounding context"** — memorise this pairing |
| **None** | One file, one chunk, one vector | FAQ entries, product records, per-ticket exports — files already chunk-sized | "Short self-contained records are being fragmented" |
| **Custom (Lambda)** | Your own logic in an ingestion transformation function | Structured formats, boilerplate stripping, computed metadata | Anything the four built-ins cannot express |

### Overlap: what it buys and what it costs

Overlap repeats the tail of chunk *n* at the head of chunk *n+1*, so a fact straddling a boundary still appears intact somewhere. It costs you more vectors to store and embed, and it fills your top-k with near-duplicates instead of distinct evidence. Twenty percent is a reasonable default. Forty percent is usually a sign that something else — probably semantic or hierarchical chunking — is the real fix.

> **Exam — Settle it with measurement, not opinion**
>
> When two engineers disagree about chunk size, the professional answer is always: build a labelled evaluation set of representative questions, run a Bedrock RAG evaluation job at several chunk sizes, and compare retrieval and generation scores separately. "Follow the default" is a starting point, not a decision.

## 7. The RAG pipeline end to end

Nine stages. Learn them as a sequence, because **diagnosis in Domain 5 is entirely about locating which stage failed.**

> **Interactive widget (`ragflow`)**
>
> Nine-stage RAG pipeline stepper (ingest → observe). Playable in the HTML study site.

*Ingestion runs on sync. Everything below the dashed line runs on every single request — which is where your cost and latency live.*

- S3 documents
- + .metadata.json
- Parse + chunk
- BDA / FM parsing, Lambda
- Embed
- Titan V2 / Cohere
- Vector store
- HNSW index
- INGESTION — runs on sync, incremental
- User question
- embedded, same model
- Retrieve top-k
- + filters, hybrid, rerank
- Augment prompt
- template + passages
- Generate
- + citations
- store lookup
- Guardrail — contextual grounding, PII, topics
- blocks unsupported answers before the user sees them
- Answer to user
- QUERY TIME — every request

## 8. Bedrock Knowledge Bases in detail

Knowledge Bases is the managed implementation of everything above. Know its configuration surface, because questions are frequently "which knob".

### Data sources

Native connectors: **Amazon S3**, **SharePoint**, **Confluence**, **Salesforce**, **Web Crawler**, and structured retrieval over data lakes. Anything else — a Kafka stream, an on-premises Oracle database — must be landed into a supported source first, usually S3 via Glue or DMS.

### Parsing

| Option | What it handles | When you need it |
| --- | --- | --- |
| Default parser | Plain text extraction | Text files, simple PDFs, markdown |
| Foundation model parsing | Uses a multimodal FM to read layout, describe images, preserve tables | Complex PDFs, slide decks, documents where tables carry the meaning |
| Amazon Bedrock Data Automation | Managed multimodal extraction across documents, images, audio and video | Mixed-media corpora, scanned documents, structured extraction at scale |

> **Exam — "Scanned PDFs with tables give garbled answers"**
>
> This is a **parse-time** problem, not a retrieval problem. If ingestion turned a table into scrambled text, every downstream stage is working on garbage and no amount of top-k tuning will help. The fix is advanced parsing or BDA. This exact scenario appears in the exam.

### Metadata and filtering

Place a `<filename>.metadata.json` file next to each document in S3. Its attributes become filterable at query time — the mechanism behind tenant isolation, date-scoped retrieval, department scoping and classification-aware search. It is the cheapest precision improvement available, because filtering removes candidates *before* similarity is even computed.

**documents/policy-2024.pdf.metadata.json**

```json
{
  "metadataAttributes": {
    "tenantId":       "acme-corp",
    "department":     "finance",
    "classification": "internal",
    "effectiveDate":  "2024-01-01",
    "documentType":   "policy"
  }
}
```

### Custom transformation

Register a Lambda in the ingestion configuration and it receives chunks mid-pipeline, *before* embedding. Use it to strip legal boilerplate, normalise formatting, redact PII, or attach computed metadata such as a risk tier. This is the supported extension point — a Glue job after ingestion is too late, because embedding has already happened.

### Sync

Ingestion is explicit: `StartIngestionJob`, run on a schedule or triggered by an event. It is **incremental** — new, changed and deleted files only — and it does handle deletions. Two practical consequences:

- A stale answer quoting a withdrawn policy is very often just a knowledge base nobody re-synced.
- A pipeline that recreates the data source instead of syncing it re-embeds the entire corpus every run. On a corpus with a 2% daily delta that is a 50× waste of embedding spend, and it is a real Domain 4 scenario.

### Retrieve versus RetrieveAndGenerate

|  | `Retrieve` | `RetrieveAndGenerate` |
| --- | --- | --- |
| Returns | Chunks and scores only | A generated answer plus citations |
| You control | Everything after retrieval — prompt, model, chaining | The prompt template, the model, and guardrail attachment |
| Choose when | Custom orchestration, non-generative use of the passages, feeding another system | Standard Q&A with the least code |

## 9. Advanced retrieval

Baseline dense retrieval fails in specific, recognisable ways. Each failure has a specific fix, and the exam tests the pairing.

> **Interactive widget (`retrievaltuner`)**
>
> Retrieval tuner — top-k, score threshold, reranking. Playable in the HTML study site.

| Technique | What it does | The symptom it fixes |
| --- | --- | --- |
| **Hybrid search** | Combines dense vector similarity with keyword BM25 and fuses the rankings | **Exact rare tokens are never found** — part numbers, error codes, SKUs, person names. Dense embeddings have almost no meaning to encode for these |
| **Reranking** | Over-fetch (say 25), re-score with a cross-encoder that reads query and passage together, keep the best 5 | "Relevant chunks are in the result set but ranked below noise". Improves precision *and* reduces tokens sent |
| **Metadata filtering** | Pre-filters candidates by attribute before similarity search | Cross-tenant leakage; stale documents surfacing; wrong-department results |
| **Query decomposition** | Splits a compound question into sub-queries, retrieves for each, synthesises | "Compare X and Y" questions where evidence for only one half is retrieved |
| **GraphRAG** | Knowledge graph of entities and relationships alongside vectors | Multi-hop questions where *no single chunk* contains the answer |
| **Score threshold** | Drops results below a similarity floor | Weak matches poisoning the context. But note thresholds are not calibrated across corpora — measure before setting one |

> **Warning — The instinct to unlearn**
>
> When answers are poor, the reflex is to retrieve *more*. It is almost always wrong. More chunks means more cost, more latency, and — because of the lost-in-the-middle effect — often a worse answer. The professional move is to retrieve **fewer, better** chunks: filter, rerank, and cut top-k.

## 10. RAG versus fine-tuning, decided properly

#### Choose RAG when…

- The knowledge changes — daily, weekly, ever
- You need citations and an audit trail
- You must be able to delete a fact and have it disappear from answers
- The corpus is large and mostly not needed on any given request
- Different users must see different subsets of the data

#### Choose fine-tuning when…

- You need consistent tone, format or task behaviour that prompting cannot reliably produce
- You have hundreds to thousands of high-quality labelled examples
- The behaviour is stable — it will not change next quarter
- You have accepted the Provisioned Throughput cost of serving a custom model
- You genuinely tried prompt engineering and few-shot first

They are not exclusive. A mature system often fine-tunes for format and behaviour, then retrieves for facts. But on the exam, a scenario emphasising *changing knowledge* or *citations* is RAG, full stop.

## 11. Data management, governance and compliance

### Where data lives, and who governs it

| Layer | Service | Governance control |
| --- | --- | --- |
| Raw source documents | Amazon S3 | Bucket policies, KMS, Object Lock, versioning, Macie for sensitive-data discovery |
| Governed data lake | S3 + Glue Data Catalog + Lake Formation | Fine-grained table, column and row permissions; centralised grants; audit |
| Data preparation | AWS Glue, Glue Data Quality | Transformation, normalisation, quality rules enforced before ingestion |
| Chunks and vectors | Vector store | Metadata filtering, per-classification indexes, encryption with a CMK |
| Prompts and completions | Model invocation logging → CloudWatch or S3 | Data protection policies, retention, Object Lock, KMS |

### PII: discovery versus in-line handling

Two services, frequently confused on the exam:

- **Amazon Macie** — scans S3 *at rest* and reports where sensitive data lives. Discovery across a bucket.
- **Amazon Comprehend** — detects and redacts PII in a text payload you send it. Per-document processing inside a pipeline.

And a third layer at the model boundary: the **Bedrock Guardrails sensitive information policy**, which can BLOCK or ANONYMIZE. Defence in depth means using more than one of these, and that is usually the "best" answer when a question offers a single control versus a layered one.

### Data residency — the trap

Residency is determined by **where inference physically runs**. Three things follow:

1. Choose a region where the model you need is actually available. Availability is genuinely uneven.
2. **Do not enable a cross-region inference profile that includes regions outside your permitted boundary.** The convenience of extra throughput is exactly what breaches the requirement, and this is a deliberately attractive distractor.
3. The knowledge base, vector store and logs are all regional resources too. All of them must sit inside the boundary.

### Privacy facts worth memorising

> **Info — Amazon Bedrock and your data**
>
> - Your prompts and completions are **not used to train the base foundation models**.
> - They are **not shared with the third-party model providers**. Third-party models run inside AWS-operated infrastructure.
> - Nothing is retained for logging unless **you** enable model invocation logging, into **your own** CloudWatch log group or S3 bucket.
> - AWS performs automated abuse detection against the Acceptable Use Policy. That is a platform control and is not a substitute for your own guardrails.

### Encryption and keys

TLS in transit throughout. At rest, use a **customer managed KMS key** when the customer needs control they can exercise — including revocation. Denying the key makes the data unreadable, and every key use lands in CloudTrail, which is usually the second half of the requirement. Note that you cannot encrypt vectors client-side and still search them: similarity over ciphertext is meaningless.

### Auditability

| Question an auditor asks | What answers it |
| --- | --- |
| "Which source did this specific sentence come from?" | **Citations** from `RetrieveAndGenerate` |
| "What exactly was sent to the model, and what came back?" | **Model invocation logging** |
| "Who called the model, when, from where?" | **CloudTrail** |
| "Can you prove the answer does not contradict our written policy?" | **Automated Reasoning checks** (Domain 3) |
| "Where is sensitive data in the source corpus?" | **Amazon Macie** |

## 12. Domain 1 check

Six questions across the domain. Aim for five.

- [Drill all 62 Domain 1 questions →](11-question-bank.md)
