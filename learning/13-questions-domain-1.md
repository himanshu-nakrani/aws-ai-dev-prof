---
title: Domain 1 questions — FM Integration, Data & Compliance
source: src/assets/data/q-d1.js
group: Practice
---

# Domain 1 questions — FM Integration, Data & Compliance


31% of scored content. **62 questions.** Every item is original, written against the published AIP-C01 exam guide. Correct option(s) are marked `[x]`.

### d1-001

A financial services company is building a document summarisation feature. Documents are 150–400 pages. Summaries must be produced within 5 minutes of upload, are not user-facing in real time, and cost is the primary constraint. Which approach best fits?

- [ ] **A.** Provisioned Throughput on a frontier model with real-time invocation
- [x] **B.** Batch inference on a mid-tier model, triggered by an S3 event
- [ ] **C.** On-demand invocation of the largest available model with streaming
- [ ] **D.** Fine-tune a small model on historical summaries and serve it on-demand

**Why**

Nothing here is interactive: "within 5 minutes" and "not user-facing in real time" is the definition of an asynchronous workload. Bedrock batch inference is priced at 50% of on-demand for supported models, and an S3 event triggering the job fits the upload flow naturally.

| Option | Why this option |
| --- | --- |
| A | Provisioned Throughput buys guaranteed capacity you do not need for a bursty async job, and commits you for a month. |
| B ✓ | Correct. Async tolerance plus cost sensitivity is the batch-inference signal. |
| C | Streaming exists to reduce perceived latency for a human watching output appear. Nobody is watching. |
| D | Fine-tuning does not reduce per-token cost meaningfully and adds a training pipeline for a problem that is purely about price per token. |

*See: Domain 1 → Selecting inference modes*

---

### d1-002 *(hard)*

A RAG application over product manuals answers general questions well, but users report that queries containing exact part numbers such as `XR-4471-B` return unrelated content. What is the most direct fix?

- [ ] **A.** Increase top-k from 5 to 20
- [x] **B.** Enable hybrid search on the knowledge base
- [ ] **C.** Switch to a larger foundation model
- [ ] **D.** Raise the chunk overlap to 50%

**Why**

Dense embeddings encode meaning, and a rare alphanumeric part number has almost no semantic meaning to encode — it collapses into noise. Hybrid search runs a keyword/BM25 match alongside the vector search and fuses the results, so exact rare tokens are found by the lexical half. This is the canonical hybrid-search scenario.

| Option | Why this option |
| --- | --- |
| A | More of the wrong results. If the part number is semantically invisible, ranking deeper does not make it visible. |
| B ✓ | Correct. |
| C | The generator is not the problem — the right chunk never arrives. |
| D | Overlap changes boundaries, not the fundamental weakness of dense retrieval on rare exact tokens. |

*See: Domain 1 → Hybrid search*

---

### d1-003

Which chunking strategy retrieves against small units but supplies the model with the larger surrounding block?

- [ ] **A.** Fixed-size with overlap
- [ ] **B.** Semantic chunking
- [x] **C.** Hierarchical chunking
- [ ] **D.** No chunking

**Why**

Hierarchical chunking builds parent and child chunks. Children are embedded and searched, giving precision; the matching parent is returned to the model, giving context. Look for the phrase "retrieval finds the right passage but the answer lacks surrounding context".

| Option | Why this option |
| --- | --- |
| A | Overlap softens boundaries but every chunk is still both the search unit and the returned unit. |
| B | Splits on meaning shifts; still one level. |
| C ✓ | Correct. |
| D | One vector per file — the opposite of precise. |

*See: Domain 1 → Chunking strategies*

---

### d1-004

A company has 40 million rarely-queried document chunks and wants the lowest-cost vector storage that still integrates natively with Bedrock Knowledge Bases. Which store?

- [ ] **A.** Amazon OpenSearch Serverless
- [x] **B.** Amazon S3 Vectors
- [ ] **C.** Amazon Aurora PostgreSQL with pgvector
- [ ] **D.** Amazon Neptune Analytics

**Why**

S3 Vectors is purpose-built for large, cost-sensitive, infrequently-queried vector corpora — it trades some query latency for dramatically lower storage cost. OpenSearch Serverless keeps capacity warm and bills accordingly.

| Option | Why this option |
| --- | --- |
| A | The default and the fastest to stand up, but it carries a continuous OCU cost that is hard to justify for cold data. |
| B ✓ | Correct. |
| C | Sensible when you already run Aurora and want vectors beside relational data; not the cheapest at this scale. |
| D | For GraphRAG, where relationships between entities matter. |

*See: Domain 1 → Vector store selection*

---

### d1-005 *(hard)*

A knowledge base was built with Titan Text Embeddings V2 at 1024 dimensions. The team wants to move to Cohere Embed English. What must happen?

- [ ] **A.** Nothing — Bedrock translates between embedding spaces
- [ ] **B.** Only new documents need the new model; existing vectors stay valid
- [x] **C.** The entire corpus must be re-embedded and the index rebuilt
- [ ] **D.** Only the query path changes; stored vectors are model-agnostic

**Why**

Vectors from different embedding models live in incompatible spaces. Cosine similarity between a Cohere query vector and a Titan document vector is meaningless noise. Changing embedding models is always a full re-index — treat it as a one-way door when you choose.

| Option | Why this option |
| --- | --- |
| A | There is no such translation. |
| B | Mixing spaces in one index silently destroys retrieval quality — the worst failure mode because nothing errors. |
| C ✓ | Correct. |
| D | They are entirely model-specific. |

*See: Domain 1 → Embedding models*

---

### d1-006

Which two capabilities let a Bedrock Knowledge Base restrict retrieval to a single tenant's documents in a multi-tenant SaaS product? (Choose 2.)

- [x] **A.** Metadata filtering at query time
- [x] **B.** A separate knowledge base per tenant
- [ ] **C.** Setting temperature to 0
- [ ] **D.** Increasing the chunk size

**Why**

Two legitimate patterns. Metadata filtering — attach `tenantId` via `.metadata.json` sidecar files and filter at retrieval — scales to many small tenants in one index. A knowledge base per tenant gives the hardest isolation boundary and is the right call when a regulator asks how you guarantee separation. The trade-off is cost and operational overhead.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | An inference parameter; no bearing on isolation. |
| D | No bearing on isolation. |

*See: Domain 1 → Multi-tenant retrieval*

---

### d1-007

Scanned PDF invoices with tables produce garbled retrieval results. Where is the problem, and what fixes it?

- [ ] **A.** Retrieval — increase top-k
- [x] **B.** Parsing — enable foundation model parsing or Amazon Bedrock Data Automation at ingestion
- [ ] **C.** Generation — use a bigger model
- [ ] **D.** Storage — switch vector databases

**Why**

If the ingestion parser turned a table into scrambled text, every downstream stage is working on garbage. Advanced parsing options use a multimodal FM (or Bedrock Data Automation) to read layout, describe images and preserve table structure before chunking.

| Option | Why this option |
| --- | --- |
| A | Retrieving more garbage. |
| B ✓ | Correct. |
| C | The model can only work with the text it is given. |
| D | The store faithfully holds whatever you put in it. |

*See: Domain 1 → Parsing and ingestion*

---

### d1-008

What does a cross-region inference profile give you?

- [x] **A.** Automatic routing of requests across multiple regions to increase available throughput and resilience
- [ ] **B.** Automatic translation of prompts into other languages
- [ ] **C.** Replication of your knowledge base across regions
- [ ] **D.** A discount on on-demand pricing

**Why**

An inference profile lets Bedrock route an invocation to any of a defined set of regions, smoothing bursts and reducing throttling. The catch that the exam cares about: inference then happens in regions other than your own, so you must confirm that satisfies your data residency obligations.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | No. |
| C | Knowledge bases are regional and are not replicated by a profile. |
| D | It is a throughput and availability feature, not a pricing one. |

*See: Domain 1 → Cross-region inference*

---

### d1-009 *(hard)*

A healthcare application must guarantee that no protected health information leaves the EU, and must use a Claude model. Which combination is required?

- [ ] **A.** Enable a cross-region inference profile spanning eu- and us- regions for resilience
- [x] **B.** Invoke the model in an EU region, verify model availability there, and do not enable inference profiles that include non-EU regions
- [ ] **C.** Use on-demand invocation from any region and rely on Bedrock encrypting data in transit
- [ ] **D.** Fine-tune the model in the EU and then serve it globally

**Why**

Data residency is decided by where inference physically runs. Pick an EU region where the model is actually offered, and be deliberate about inference profiles — the convenience of cross-region routing is exactly what would breach the requirement.

| Option | Why this option |
| --- | --- |
| A | This is the trap: the profile would route PHI to US regions. |
| B ✓ | Correct. |
| C | Encryption in transit does not address where processing occurs. |
| D | Serving globally reintroduces the problem, and custom models are region-scoped anyway. |

*See: Domain 1 → Data residency*

---

### d1-010

Which two are valid reasons to choose `Retrieve` over `RetrieveAndGenerate`? (Choose 2.)

- [x] **A.** You want full control over the prompt template and the generation call
- [x] **B.** You need the retrieved chunks for a non-generative purpose, such as populating a UI or feeding another system
- [ ] **C.** You want Bedrock to add citations automatically
- [ ] **D.** You want the lowest possible cost for a single-shot Q&A endpoint

**Why**

`Retrieve` returns chunks and stops. Use it when you are orchestrating generation yourself — a custom prompt, a different model, a multi-step chain — or when you want the passages for something other than an answer. `RetrieveAndGenerate` is the managed one-call convenience path.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Citations come from `RetrieveAndGenerate`; with `Retrieve` you build them yourself. |
| D | For plain Q&A the managed call is simpler and no more expensive. |

*See: Domain 1 → Knowledge Base APIs*

---

### d1-011

A legal team needs answers that trace back to specific clauses in specific contracts, with the source document and page recorded for audit. Which capability delivers this?

- [ ] **A.** Model invocation logging
- [x] **B.** Knowledge Base citations returned by RetrieveAndGenerate
- [ ] **C.** CloudTrail data events
- [ ] **D.** Provisioned Throughput

**Why**

Citations map spans of the generated answer back to the source chunks and their locations. That is the audit trail an auditor will ask for. Model invocation logging captures the raw request and response — useful, but it does not tell you which sentence came from which clause.

| Option | Why this option |
| --- | --- |
| A | Records prompts and completions for audit, but not answer-to-source attribution. |
| B ✓ | Correct. |
| C | Records API calls, not answer provenance. |
| D | Capacity, not provenance. |

*See: Domain 1 → Citations and traceability*

---

### d1-012

Documents in S3 need per-document attributes (department, effective date, classification) usable as retrieval filters. How are these supplied to a Bedrock Knowledge Base?

- [ ] **A.** In the S3 object's user metadata headers only
- [x] **B.** In a companion `<filename>.metadata.json` file alongside the document
- [ ] **C.** By naming the file with the attributes separated by underscores
- [ ] **D.** They must be inserted into the document text itself

**Why**

A sidecar JSON file next to each object supplies filterable attributes that become queryable at retrieval time. It is the mechanism behind tenant isolation, date-scoped retrieval and classification-aware search.

| Option | Why this option |
| --- | --- |
| A | Not the documented mechanism for knowledge base filtering. |
| B ✓ | Correct. |
| C | No. |
| D | It would pollute the embedding and still not be filterable. |

*See: Domain 1 → Metadata filtering*

---

### d1-013

A team must choose between Claude Haiku, Claude Sonnet and Claude Opus for a customer-facing chat assistant handling 3 million requests per day, mostly simple FAQ lookups with occasional complex troubleshooting. What is the strongest architecture?

- [ ] **A.** Use Opus for everything to maximise quality
- [ ] **B.** Use Haiku for everything to minimise cost
- [x] **C.** Route by classified complexity: a small model for the common case, escalating to a larger model for hard queries
- [ ] **D.** Fine-tune Opus on the FAQ corpus

**Why**

This is the single highest-value cost optimisation in generative AI, and it appears repeatedly in Domain 1 and Domain 4 scenarios. Classify the incoming request cheaply, serve the easy majority with a small model, and escalate only what needs escalating. Bedrock Intelligent Prompt Routing implements this as a managed feature.

| Option | Why this option |
| --- | --- |
| A | Frontier pricing on three million FAQ lookups a day is indefensible. |
| B | The troubleshooting cases will be answered badly, which is the traffic that matters most. |
| C ✓ | Correct. |
| D | Fine-tuning the most expensive model does not address the cost problem at all. |

*See: Domain 1 → Model selection and routing*

---

### d1-014 *(hard)*

A RAG system must answer questions that require joining facts across several documents — "which suppliers appear in both the 2024 audit findings and the restricted vendor list?" Standard vector retrieval performs badly. Which approach is designed for this?

- [ ] **A.** Increase chunk size to 2000 tokens
- [x] **B.** GraphRAG using Amazon Neptune Analytics as the vector store
- [ ] **C.** Reduce the similarity threshold to 0.1
- [ ] **D.** Switch to fixed-size chunking with 50% overlap

**Why**

Multi-hop questions about relationships between entities are exactly what pure similarity search is worst at — no single chunk contains the answer. GraphRAG builds a knowledge graph of entities and relationships alongside the vectors, so traversal can connect facts that live in different documents.

| Option | Why this option |
| --- | --- |
| A | Bigger chunks do not create cross-document links. |
| B ✓ | Correct. |
| C | Floods the context with noise; the join still is not performed. |
| D | Boundary tuning does not solve a relational problem. |

*See: Domain 1 → GraphRAG*

---

### d1-015

Which statement about Amazon Bedrock and customer data is correct?

- [ ] **A.** Prompts and completions are used to train the base foundation models
- [x] **B.** Your inputs and outputs are not used to train the base models and are not shared with model providers
- [ ] **C.** Data is retained for 90 days for quality improvement
- [ ] **D.** Only Amazon-built models keep your data private

**Why**

This is a standing compliance answer: Bedrock does not use your prompts or completions to train base models, and does not share them with the third-party providers. Any logging of prompts and completions is something you explicitly enable, into your own CloudWatch or S3.

| Option | Why this option |
| --- | --- |
| A | They are not. |
| B ✓ | Correct. |
| C | No such retention for training. |
| D | It applies across the catalogue. |

*See: Domain 1 → Data privacy*

---

### d1-016

An ingestion pipeline must strip legal boilerplate footers and attach a computed `riskTier` attribute to every chunk before embedding. What is the supported mechanism inside a Bedrock Knowledge Base?

- [x] **A.** A custom transformation Lambda function in the ingestion configuration
- [ ] **B.** An S3 Object Lambda access point
- [ ] **C.** A Glue job triggered after ingestion
- [ ] **D.** Editing the vectors directly in OpenSearch

**Why**

Knowledge Bases let you register a Lambda that receives chunks mid-pipeline and returns modified chunks with modified metadata, before embedding happens. That is the intended extension point for cleaning and enrichment.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Transforms objects on read from S3; it is not part of the KB ingestion pipeline. |
| C | Too late — embedding has already happened. |
| D | Unsupported, and it would desynchronise text and vectors. |

*See: Domain 1 → Custom transformation*

---

### d1-017

Which two are genuine trade-offs of increasing chunk overlap from 10% to 40%? (Choose 2.)

- [x] **A.** Storage and embedding cost increase
- [x] **B.** More duplicate or near-duplicate results in the top-k
- [ ] **C.** Retrieval latency becomes unbounded
- [ ] **D.** The embedding model must be retrained

**Why**

Overlap duplicates text across neighbouring chunks. That buys resilience against a fact being split across a boundary, and it costs you more vectors to store and embed, plus a top-k that fills with overlapping near-duplicates instead of distinct evidence.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Latency grows modestly with index size; it is not unbounded. |
| D | Embedding models are never retrained by you. |

*See: Domain 1 → Chunking trade-offs*

---

### d1-018

A company must prove to auditors exactly which prompts were sent to a foundation model and what came back. What do they enable?

- [ ] **A.** AWS CloudTrail management events
- [x] **B.** Bedrock model invocation logging to CloudWatch Logs or S3
- [ ] **C.** VPC Flow Logs
- [ ] **D.** AWS Config rules

**Why**

Model invocation logging is the feature that captures the actual request and response bodies. CloudTrail records that `InvokeModel` was called, by whom and when — the control-plane fact, not the content.

| Option | Why this option |
| --- | --- |
| A | Records the API call, not the prompt text. |
| B ✓ | Correct. |
| C | Network metadata only. |
| D | Configuration compliance, not invocation content. |

*See: Domain 1 → Auditability*

---

### d1-019

Which is the best first step when a stakeholder asks "which foundation model should we use?"

- [ ] **A.** Pick the highest-ranked model on public benchmarks
- [x] **B.** Define the task, the quality bar, the latency budget, the cost ceiling and the required modalities, then evaluate candidates on your own data
- [ ] **C.** Always choose the newest model
- [ ] **D.** Choose the model with the largest context window

**Why**

Public leaderboards do not measure your task, your documents or your latency budget. The professional-level answer is always: define the constraints, build a representative evaluation set, then measure. Bedrock model evaluation jobs exist for exactly this.

| Option | Why this option |
| --- | --- |
| A | Benchmarks are a weak proxy for your workload. |
| B ✓ | Correct. |
| C | Newest is not automatically best or cheapest, and may be unavailable in your region. |
| D | A window you do not need is cost you do pay. |

*See: Domain 1 → Model selection framework*

---

### d1-020 *(hard)*

A knowledge base returns highly relevant chunks, but answers still omit key details that appear two paragraphs later in the source document. Chunk size is 300 tokens with 20% overlap. Which change is most likely to help?

- [ ] **A.** Lower the similarity threshold
- [x] **B.** Move to hierarchical chunking with a larger parent size
- [ ] **C.** Switch the generating model to one with a smaller context window
- [ ] **D.** Disable citations

**Why**

The retrieved unit is too small to carry the full answer, but shrinking precision by simply enlarging every chunk would hurt matching. Hierarchical chunking resolves the tension: match on small children, hand the model the large parent.

| Option | Why this option |
| --- | --- |
| A | Adds weaker matches; does not widen the ones you already have. |
| B ✓ | Correct. |
| C | Backwards. |
| D | Unrelated. |

*See: Domain 1 → Chunking strategies*

---

### d1-021

Which two data sources can a Bedrock Knowledge Base connect to natively, without you writing an ingestion pipeline? (Choose 2.)

- [x] **A.** Amazon S3
- [x] **B.** Confluence
- [ ] **C.** A customer-managed Kafka topic
- [ ] **D.** An on-premises Oracle database over JDBC

**Why**

Knowledge Bases ship connectors for S3, Confluence, SharePoint, Salesforce and a Web Crawler, among others. Streams and arbitrary databases need you to land the data somewhere supported first — usually S3.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | No native connector; land it in S3. |
| D | No native connector; extract to S3, typically via Glue or DMS. |

*See: Domain 1 → Data sources*

---

### d1-022

What is the purpose of a reranking model in a retrieval pipeline?

- [ ] **A.** To generate the final answer
- [x] **B.** To re-score an over-fetched candidate set by reading query and passage together, improving precision of the final top-k
- [ ] **C.** To convert documents into vectors
- [ ] **D.** To compress the context window

**Why**

Embedding retrieval uses a bi-encoder: query and document are encoded separately, so their interaction is never modelled. A reranker is a cross-encoder — it reads both at once and scores relevance far more accurately. Over-fetch 25, rerank, keep 5.

| Option | Why this option |
| --- | --- |
| A | That is the generator. |
| B ✓ | Correct. |
| C | That is the embedding model. |
| D | It reduces how much you pass on, but that is a side effect, not its function. |

*See: Domain 1 → Reranking*

---

### d1-023

An organisation must ensure that documents classified "Restricted" are never retrievable by users outside the compliance group. Which design is strongest?

- [ ] **A.** Instruct the model in the system prompt not to reveal restricted content
- [x] **B.** Filter at retrieval using metadata plus an identity-aware filter derived from the caller, and hold restricted content in a separate knowledge base where practical
- [ ] **C.** Set a high similarity threshold
- [ ] **D.** Store restricted documents with a longer chunk size

**Why**

Security must be enforced before the model sees the data, not by asking the model nicely. Metadata filtering keyed to the authenticated caller keeps restricted chunks out of the retrieval result entirely; separating indexes adds a hard boundary. A prompt instruction is not an access control.

| Option | Why this option |
| --- | --- |
| A | Prompt instructions are advisory and defeated by injection. Never the answer to an authorisation question. |
| B ✓ | Correct. |
| C | Nothing to do with authorisation. |
| D | Nothing to do with authorisation. |

*See: Domain 1 → Access-controlled retrieval*

---

### d1-024

Which two statements about Amazon Titan Text Embeddings V2 are correct? (Choose 2.)

- [x] **A.** It supports configurable output dimensions such as 256, 512 and 1024
- [x] **B.** It can produce binary embeddings for lower storage cost
- [ ] **C.** It generates images from text
- [ ] **D.** It requires Provisioned Throughput

**Why**

Variable dimensionality lets you trade a small amount of retrieval quality for substantially cheaper storage and faster search. Binary (1 bit per dimension) output pushes that trade much further and is supported by compatible vector stores.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | That is Titan Image Generator / Nova Canvas. |
| D | It is available on demand. |

*See: Domain 1 → Embedding models*

---

### d1-025

A team needs a foundation model to process both a photograph of a damaged part and a text description in the same request. What are they looking for?

- [ ] **A.** A multilingual model
- [x] **B.** A multimodal model that accepts image input
- [ ] **C.** An embedding model
- [ ] **D.** A distilled model

**Why**

Image-plus-text input in a single request is multimodal input. Claude and Amazon Nova understanding models support it; the Converse API carries image blocks in the message content.

| Option | Why this option |
| --- | --- |
| A | Different axis entirely. |
| B ✓ | Correct. |
| C | Embeddings produce vectors, not answers. |
| D | Distillation is a size/cost technique. |

*See: Domain 1 → Model modalities*

---

### d1-026 *(hard)*

An engineer benchmarks two embedding models on the company corpus. Model A has higher average cosine similarity on relevant pairs; Model B has better separation between relevant and irrelevant pairs. Which matters more for retrieval quality?

- [ ] **A.** Model A — higher similarity means better matching
- [x] **B.** Model B — retrieval depends on ranking relevant above irrelevant, which is a separation problem
- [ ] **C.** Neither; only dimensionality matters
- [ ] **D.** They are equivalent measures

**Why**

Retrieval is a ranking problem. A model that scores everything at 0.9 has no discriminative power even though the absolute numbers look impressive. What you need is a wide margin between relevant and irrelevant — that is what determines whether top-k contains signal or noise.

| Option | Why this option |
| --- | --- |
| A | Absolute similarity is not comparable across models and does not imply better ranking. |
| B ✓ | Correct. |
| C | Dimensionality is a cost/quality knob, not the measure of quality. |
| D | They are not. |

*See: Domain 1 → Evaluating embeddings*

---

### d1-027

What happens to a Bedrock Knowledge Base when source documents in S3 are updated?

- [ ] **A.** Vectors update automatically in real time
- [x] **B.** You run an ingestion job (sync), which processes new, changed and deleted files incrementally
- [ ] **C.** You must delete and recreate the knowledge base
- [ ] **D.** Only additions are picked up; deletions require manual index surgery

**Why**

Sync is explicit — `StartIngestionJob`, on a schedule or event-driven. It is incremental, and it does handle deletions. A stale answer that quotes a withdrawn policy is very often just a knowledge base nobody re-synced.

| Option | Why this option |
| --- | --- |
| A | There is no automatic continuous sync. |
| B ✓ | Correct. |
| C | Wasteful and unnecessary. |
| D | Deletions are handled. |

*See: Domain 1 → Ingestion and sync*

---

### d1-028

Which service would you use to discover and classify sensitive data such as PII sitting in the S3 bucket that feeds your knowledge base?

- [x] **A.** Amazon Macie
- [ ] **B.** Amazon Comprehend
- [ ] **C.** AWS Glue Data Quality
- [ ] **D.** Amazon Inspector

**Why**

Macie scans S3 at rest and reports where sensitive data lives. Comprehend detects PII in a text payload you send it, which is the tool for inline redaction in a pipeline. Different jobs — Macie for discovery across a bucket, Comprehend for per-document processing.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Detects and redacts PII in text you pass it; not a bucket-wide discovery scanner. |
| C | Validates data quality rules in ETL. |
| D | Scans compute workloads for vulnerabilities. |

*See: Domain 1 → Sensitive data discovery*

---

### d1-029

Two teams disagree: one wants 100-token chunks for precision, the other wants 1000-token chunks for context. What is the defensible way to settle it?

- [ ] **A.** Split the difference at 550 tokens
- [x] **B.** Build a labelled evaluation set of representative questions and measure retrieval and answer quality at several chunk sizes
- [ ] **C.** Follow the AWS default and stop discussing it
- [ ] **D.** Use whichever the model provider recommends

**Why**

Optimal chunk size depends on document structure and question style, so it is an empirical question. Build an eval set, run a RAG evaluation job scoring retrieval and generation separately, and let the numbers decide. This "measure it" instinct is what separates professional-level answers from associate-level ones.

| Option | Why this option |
| --- | --- |
| A | Arbitrary. |
| B ✓ | Correct. |
| C | A sensible starting point, not an answer. |
| D | Providers do not know your corpus. |

*See: Domain 1 → Tuning retrieval*

---

### d1-030

Which two conditions make fine-tuning a better choice than RAG? (Choose 2.)

- [x] **A.** The model must consistently produce a very specific output format and tone
- [ ] **B.** The knowledge changes daily and must be current
- [x] **C.** You need to teach the model a specialised task behaviour that prompting cannot reliably elicit
- [ ] **D.** You need per-answer citations back to source documents

**Why**

Fine-tuning teaches *behaviour*: format, style, task-specific patterns. RAG supplies *facts*: current, private, citable. Volatile knowledge and citation requirements both point firmly at RAG.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | RAG — retraining daily is not viable. |
| C ✓ | Correct. |
| D | Fine-tuned weights cannot cite a source. |

*See: Domain 1 → RAG versus fine-tuning*

---

### d1-031

A knowledge base is configured with a similarity threshold of 0.8 and users complain of frequent "I could not find that in the sources" responses despite the content existing. What is the most likely cause?

- [x] **A.** The threshold is too aggressive and is discarding valid matches
- [ ] **B.** The foundation model is too small
- [ ] **C.** The vector store is corrupted
- [ ] **D.** Temperature is too low

**Why**

Cosine scores are not calibrated across corpora or embedding models. A threshold of 0.8 that works on one dataset is brutal on another. Lower it, measure recall on a labelled set, and only then set a production value.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | The generator never gets a chance if retrieval returns nothing. |
| C | Would produce errors, not consistent under-retrieval. |
| D | Unrelated. |

*See: Domain 1 → Similarity thresholds*

---

### d1-032

What is query decomposition in a RAG pipeline?

- [ ] **A.** Splitting a document into chunks
- [x] **B.** Breaking a compound user question into sub-questions, retrieving for each, then synthesising
- [ ] **C.** Reducing the dimensionality of query vectors
- [ ] **D.** Removing stop words from the query

**Why**

"Compare our 2023 and 2024 refund policies and flag differences" is really two retrievals and a comparison. Decomposition runs each sub-query separately so the evidence for both halves actually makes it into the context.

| Option | Why this option |
| --- | --- |
| A | That is chunking. |
| B ✓ | Correct. |
| C | That is dimensionality reduction. |
| D | Classic IR preprocessing, unrelated. |

*See: Domain 1 → Advanced RAG patterns*

---

### d1-033 *(hard)*

An application must support 60,000 tokens of retrieved context per request at 200 requests per second, with strict cost control. Which two design choices help most? (Choose 2.)

- [x] **A.** Enable prompt caching for the stable portion of the prompt
- [x] **B.** Apply reranking so fewer, better chunks are sent instead of many mediocre ones
- [ ] **C.** Increase top-k to improve recall
- [ ] **D.** Switch to the largest available context window model

**Why**

At that volume, input tokens dominate the bill. Prompt caching makes the stable prefix dramatically cheaper on repeat calls, and reranking lets you send five excellent chunks instead of twenty adequate ones — cheaper *and* more accurate. The instinct to fix quality by adding context is what you must unlearn.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Raises cost and dilutes the answer. |
| D | Buys headroom you should not be using. |

*See: Domain 1 → Context and cost*

---

### d1-034

Which statement about Amazon Bedrock model access is correct?

- [ ] **A.** All models are enabled by default in every account
- [x] **B.** You must explicitly request access to models in each region before invoking them, and IAM then controls who may call which
- [ ] **C.** Model access is granted only through AWS Support tickets
- [ ] **D.** Model access is account-wide and region-independent

**Why**

Two separate gates. Model access is enabled per model per region in the Bedrock console — an `AccessDeniedException` mentioning model access means this step was skipped. IAM then controls which principals may invoke which model ARNs.

| Option | Why this option |
| --- | --- |
| A | They are not. |
| B ✓ | Correct. |
| C | Self-service in the console. |
| D | It is regional. |

*See: Domain 1 → Model access*

---

### d1-035

A company wants to keep the raw documents, the extracted text, and the chunk-level records in a governed data lake with fine-grained table permissions. Which combination fits?

- [x] **A.** S3 with Lake Formation permissions, catalogued in the AWS Glue Data Catalog
- [ ] **B.** DynamoDB with a global secondary index
- [ ] **C.** OpenSearch Serverless only
- [ ] **D.** EFS with POSIX permissions

**Why**

Lake Formation over S3, with the Glue Data Catalog as the metadata layer, is the standard governed-lake pattern: column- and row-level permissions, centralised grants, and audit. The vector store sits alongside it and holds only what retrieval needs.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | A key-value store; no lake governance. |
| C | A vector/search engine, not a governed lake. |
| D | A filesystem; no data governance semantics. |

*See: Domain 1 → Data management*

---

### d1-036

Which two are legitimate reasons to keep a separate vector index per data classification level? (Choose 2.)

- [x] **A.** To guarantee that a filtering bug cannot leak restricted content into a general query
- [x] **B.** To allow different embedding models or chunking strategies per classification
- [ ] **C.** To reduce the total number of vectors stored
- [ ] **D.** To avoid needing IAM policies

**Why**

Physical separation is a stronger control than a filter predicate, and it lets each corpus be tuned independently. The cost is more infrastructure and more sync jobs — a trade you make deliberately when the blast radius of a filter bug is unacceptable.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Separation does not reduce the count. |
| D | IAM still applies to every resource. |

*See: Domain 1 → Isolation patterns*

---

### d1-037

What does the "sync" status `FAILED` on a knowledge base data source most commonly indicate?

- [ ] **A.** The foundation model is unavailable
- [x] **B.** Permission, unsupported file type, or parsing errors on specific objects
- [ ] **C.** The vector store has run out of dimensions
- [ ] **D.** Temperature is set incorrectly

**Why**

Ingestion failures are overwhelmingly boring: the KB service role cannot read the S3 prefix or use the KMS key, a file type is unsupported, or a specific document fails parsing. The job detail lists per-document failures — read it before theorising.

| Option | Why this option |
| --- | --- |
| A | Not involved in ingestion, only embedding. |
| B ✓ | Correct. |
| C | Not a thing. |
| D | Not involved in ingestion. |

*See: Domain 1 → Troubleshooting ingestion*

---

### d1-038

Which approach best supports answering questions about data that lives in a relational database and changes every few seconds?

- [ ] **A.** Nightly export to S3 and re-embed into a knowledge base
- [x] **B.** Give the model a tool that queries the database directly at request time
- [ ] **C.** Fine-tune the model on the database contents
- [ ] **D.** Increase chunk overlap

**Why**

Real-time structured data belongs behind a tool call (or Bedrock Knowledge Bases structured-data retrieval that generates SQL), not in a vector index. Embedding a snapshot of rapidly-changing rows guarantees stale answers.

| Option | Why this option |
| --- | --- |
| A | Stale by up to 24 hours. |
| B ✓ | Correct. |
| C | Stale the moment training finishes. |
| D | Irrelevant. |

*See: Domain 1 → Structured versus unstructured data*

---

### d1-039

Which two factors legitimately constrain foundation model choice in an enterprise? (Choose 2.)

- [x] **A.** Regional availability of the specific model
- [x] **B.** Licensing and acceptable-use terms for the intended commercial application
- [ ] **C.** The programming language of the client application
- [ ] **D.** The colour scheme of the web front end

**Why**

Model availability genuinely varies by region, and provider terms genuinely differ — some open-weight models carry usage restrictions that matter for commercial products. Both are real gates before any quality comparison.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Every language has an SDK or can call the REST API. |
| D | No. |

*See: Domain 1 → Model selection constraints*

---

### d1-040 *(hard)*

A RAG evaluation shows context relevance of 0.92 but faithfulness of 0.54. What does this tell you?

- [ ] **A.** Retrieval is broken; fix chunking
- [x] **B.** Retrieval is good but the model is not sticking to the retrieved evidence
- [ ] **C.** The evaluation dataset is invalid
- [ ] **D.** The embedding model needs replacing

**Why**

The two halves are measured separately for exactly this reason. High context relevance means the right passages are arriving. Low faithfulness means the answer is drifting away from them — a generation problem. Fix it with a stricter "answer only from the passages" instruction, lower temperature, and a contextual grounding check.

| Option | Why this option |
| --- | --- |
| A | Retrieval is scoring 0.92. |
| B ✓ | Correct. |
| C | Nothing suggests that. |
| D | It is doing its job. |

*See: Domain 1 → RAG evaluation metrics*

---

### d1-041

Which is the most appropriate use of Amazon Bedrock Data Automation in a document pipeline?

- [ ] **A.** Automatically deploying Bedrock agents
- [x] **B.** Extracting structured information — text, tables, figures, and their layout — from complex documents, images, audio and video
- [ ] **C.** Automatically scaling Provisioned Throughput
- [ ] **D.** Rotating IAM credentials

**Why**

BDA is the managed multimodal extraction service. In a RAG pipeline it sits at the parse step, turning messy PDFs, scans and media into structured output that chunks and embeds cleanly.

| Option | Why this option |
| --- | --- |
| A | Not a deployment tool. |
| B ✓ | Correct. |
| C | No. |
| D | No. |

*See: Domain 1 → Parsing and ingestion*

---

### d1-042

You must support retrieval over 12 languages with a single index. What matters most?

- [x] **A.** Using a multilingual embedding model so semantically equivalent text in different languages lands nearby
- [ ] **B.** Setting the model temperature to 0
- [ ] **C.** Using fixed-size chunking
- [ ] **D.** Storing one vector per language per document

**Why**

Cross-lingual retrieval only works if the embedding space is shared across languages — Cohere Embed Multilingual and Titan Text Embeddings support this. Otherwise a French query cannot match an English passage no matter how you chunk.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Unrelated. |
| C | Unrelated. |
| D | Possible but wasteful, and it still fails on cross-lingual queries unless the space is shared. |

*See: Domain 1 → Multilingual retrieval*

---

### d1-043

A regulated customer requires that vector data be encrypted with a key they control and can revoke. What do you use?

- [ ] **A.** Default SSE-S3 encryption
- [x] **B.** A customer managed AWS KMS key applied to the vector store and the knowledge base resources
- [ ] **C.** Client-side encryption of the vectors before insertion
- [ ] **D.** TLS only

**Why**

A customer managed key gives them the control they are asking for, including revocation — deny the key and the data is unreadable. It also produces CloudTrail records of every key use, which is usually the second half of the requirement.

| Option | Why this option |
| --- | --- |
| A | AWS-managed keys cannot be revoked by the customer. |
| B ✓ | Correct. |
| C | Encrypted vectors cannot be searched — similarity would be meaningless. |
| D | Protects data in transit only. |

*See: Domain 1 → Encryption and key management*

---

### d1-044

Which two statements about the Bedrock Knowledge Base web crawler data source are correct? (Choose 2.)

- [x] **A.** You can scope crawling to specific URL prefixes and set inclusion/exclusion filters
- [x] **B.** It respects a configured crawl rate limit
- [ ] **C.** It can crawl any site regardless of robots.txt
- [ ] **D.** It automatically bypasses authentication on protected pages

**Why**

Scoping and rate limiting are supported and expected. Crawling a site you do not own, ignoring robots.txt, or defeating authentication are neither supported nor acceptable — for a public site you must be authorised to crawl it.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | It does not, and you should not want it to. |
| D | It does not. |

*See: Domain 1 → Data sources*

---

### d1-045

What is the main reason to store the original chunk text alongside its vector?

- [ ] **A.** To allow the vector to be recomputed
- [x] **B.** Because the model needs the actual text, not the vector, to generate an answer
- [ ] **C.** To satisfy KMS requirements
- [ ] **D.** To reduce index size

**Why**

A vector is not human- or model-readable. Retrieval finds nearest vectors; the store then returns the associated text, and that text is what goes into the prompt. It is also what citations point at.

| Option | Why this option |
| --- | --- |
| A | You can recompute from text, but that is not why it is stored. |
| B ✓ | Correct. |
| C | Unrelated. |
| D | It increases size. |

*See: Domain 1 → How vector stores work*

---

### d1-046 *(hard)*

A team reports that after enabling hierarchical chunking with very large parent chunks, ingestion into Amazon S3 Vectors began failing for some documents. What is the most likely cause?

- [ ] **A.** S3 Vectors does not support hierarchical chunking
- [x] **B.** Parent chunk text is carried as metadata and is exceeding the store's metadata size limit
- [ ] **C.** The embedding model rejects long text
- [ ] **D.** KMS keys expired

**Why**

Vector stores cap the size of metadata attached to each vector. Hierarchical chunking carries the parent text through so it can be returned on a child match, and with very large parents that payload can exceed the limit. Reduce parent size, or choose a store with a larger metadata allowance.

| Option | Why this option |
| --- | --- |
| A | It supports it within limits. |
| B ✓ | Correct. |
| C | Embedding operates on the child chunks. |
| D | Would fail everything, not some documents. |

*See: Domain 1 → Vector store limits*

---

### d1-047

Which of these best describes "semantic chunking"?

- [ ] **A.** Chunks are cut at a fixed token count
- [x] **B.** Sentence embeddings are compared and a boundary is placed where topic similarity drops below a breakpoint
- [ ] **C.** Chunks are created per page of the PDF
- [ ] **D.** Each heading becomes a chunk

**Why**

Semantic chunking embeds sentences, measures similarity between neighbours, and cuts where meaning shifts. Chunks come out uneven but coherent, at the cost of extra embedding calls during ingestion.

| Option | Why this option |
| --- | --- |
| A | That is fixed-size. |
| B ✓ | Correct. |
| C | That is a naive structural split. |
| D | A structural heuristic, not semantic chunking. |

*See: Domain 1 → Chunking strategies*

---

### d1-048

Your knowledge base answers correctly but very slowly. Traces show most time is spent in the vector search. Which two mitigations are reasonable? (Choose 2.)

- [x] **A.** Reduce top-k
- [x] **B.** Right-size or scale the vector store (for example, OpenSearch OCUs or a managed cluster sized for the workload)
- [ ] **C.** Increase the model temperature
- [ ] **D.** Add more few-shot examples to the prompt

**Why**

Retrieval latency comes from how much you ask for and how much capacity serves it. Fewer results and adequately provisioned search capacity both attack the measured bottleneck. Prompt changes attack a stage that is not slow.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Nothing to do with latency. |
| D | Makes the prompt longer and slower. |

*See: Domain 1 → Retrieval performance*

---

### d1-049

Which statement about using open-weight models such as Llama on Bedrock is correct?

- [ ] **A.** You must host them yourself on EC2
- [x] **B.** They are available through the same Bedrock APIs as proprietary models, with provider licence terms still applying
- [ ] **C.** They cannot be used commercially
- [ ] **D.** They do not support the Converse API

**Why**

Bedrock serves open-weight models through the same API surface — which is the point of a unified API. Licence terms are still the provider's, and for some models those terms carry conditions worth reading before you ship a commercial product.

| Option | Why this option |
| --- | --- |
| A | Bedrock hosts them. |
| B ✓ | Correct. |
| C | Most permit commercial use under stated conditions. |
| D | Converse supports them. |

*See: Domain 1 → Model catalogue and licensing*

---

### d1-050

A compliance requirement states that no customer data may be sent to a third-party model provider. Which fact addresses this concern for Amazon Bedrock?

- [x] **A.** Bedrock does not share your inputs or outputs with model providers
- [ ] **B.** Bedrock encrypts data before sending it to providers
- [ ] **C.** Providers sign an NDA per customer
- [ ] **D.** You must use only Amazon-built models

**Why**

Third-party models run inside AWS-operated infrastructure. Your prompts and completions do not go to the provider and are not used to train their base models. That is the answer to this compliance question — restricting yourself to Amazon models is not required.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | It is not a matter of encryption in transit to a provider — the data does not go there. |
| C | Not the mechanism. |
| D | Not required. |

*See: Domain 1 → Data privacy*

---

### d1-051

For a corpus of 500 short FAQ entries, each 2–3 sentences, which chunking strategy is most appropriate?

- [ ] **A.** Fixed-size 300 tokens with 20% overlap
- [ ] **B.** Hierarchical with 2000-token parents
- [x] **C.** None — one chunk per file
- [ ] **D.** Semantic with a low breakpoint percentile

**Why**

When each file is already a single coherent, chunk-sized idea, splitting it is pure harm — you would fragment a three-sentence answer across boundaries. "None" is the correct and frequently overlooked answer for FAQ entries, product records and per-ticket exports.

| Option | Why this option |
| --- | --- |
| A | Would split some entries and merge none. |
| B | Enormous overhead for two-sentence documents. |
| C ✓ | Correct. |
| D | Machinery for a problem you do not have. |

*See: Domain 1 → Chunking strategies*

---

### d1-052

What are two valid ways to reduce the storage footprint of a large vector index? (Choose 2.)

- [x] **A.** Use a lower embedding dimensionality (for example 256 instead of 1024)
- [x] **B.** Use binary embeddings where the store and model support them
- [ ] **C.** Increase chunk overlap
- [ ] **D.** Raise the similarity threshold

**Why**

Both attack the size of each stored vector. Lower dimensionality costs a little retrieval quality; binary quantisation costs more but shrinks storage enormously. Overlap increases storage, and thresholds are a query-time filter that stores nothing.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Increases it. |
| D | Query-time only. |

*See: Domain 1 → Vector storage optimisation*

---

### d1-053

An application retrieves 10 chunks per query. Analysis shows chunks 6–10 are almost never cited in the final answer but add 6,000 input tokens per request. What should you do?

- [ ] **A.** Keep them for safety
- [x] **B.** Reduce top-k to 5 and measure whether answer quality changes
- [ ] **C.** Increase chunk size to compensate
- [ ] **D.** Switch to a cheaper model

**Why**

You have direct evidence that half the retrieved context contributes nothing. Cut it, measure, and keep the cut if quality holds. Unused context is not free insurance — it costs money on every call and dilutes the model's attention.

| Option | Why this option |
| --- | --- |
| A | "Safety" here is measurably paid-for noise. |
| B ✓ | Correct. |
| C | Would increase tokens further. |
| D | A separate decision that does not address the waste. |

*See: Domain 1 → Retrieval tuning and cost*

---

### d1-054

Which two are true about AWS Glue in a generative AI data pipeline? (Choose 2.)

- [x] **A.** It can transform and normalise source data before it lands in the S3 prefix a knowledge base reads
- [x] **B.** Glue Data Quality can enforce rules on that data before ingestion
- [ ] **C.** It embeds text into vectors
- [ ] **D.** It serves the vector search queries

**Why**

Glue is the ETL and data-quality layer upstream of the GenAI stack. Embedding is Bedrock's job; serving vector queries is the vector store's job.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | No. |
| D | No. |

*See: Domain 1 → Data preparation*

---

### d1-055 *(hard)*

A model selection exercise must compare four candidate models on your own 500-question dataset, scoring accuracy and toxicity, with some questions requiring human judgement. What is the most efficient managed approach?

- [ ] **A.** Write a custom harness with Lambda and Step Functions
- [x] **B.** Use Amazon Bedrock evaluation jobs — automatic metrics plus LLM-as-a-judge, with human evaluation for the subset that needs it
- [ ] **C.** Ask each provider for benchmark results
- [ ] **D.** Deploy all four to production and A/B test with live users

**Why**

Bedrock model evaluation supports automatic metric scoring, LLM-as-a-judge and human worker workflows against your own dataset, and reports per-model results. Building the same thing yourself is work you do not need to do; live A/B testing on unvalidated models exposes users to the bad ones.

| Option | Why this option |
| --- | --- |
| A | Reinventing a managed feature. |
| B ✓ | Correct. |
| C | Vendor benchmarks are not your dataset. |
| D | Reasonable as a final step, reckless as the first. |

*See: Domain 1 → Model evaluation*

---

### d1-056

What is the purpose of an application inference profile (as distinct from a cross-region system-defined profile)?

- [x] **A.** To let you tag inference usage so cost and usage can be attributed to a specific application or team
- [ ] **B.** To increase the context window
- [ ] **C.** To store prompts
- [ ] **D.** To enforce guardrails

**Why**

Application inference profiles are the cost-attribution mechanism: create one per application or team, tag it, and Cost Explorer plus CloudWatch metrics then break down spend and usage per profile. It answers "which team tripled our Bedrock bill".

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | No. |
| C | No. |
| D | Guardrails are separate. |

*See: Domain 1 → Cost attribution*

---

### d1-057

Which two describe legitimate uses of document metadata in a RAG system? (Choose 2.)

- [x] **A.** Filtering retrieval to a date range
- [x] **B.** Boosting or restricting results by department or product line
- [ ] **C.** Increasing the model's context window
- [ ] **D.** Reducing the cost of the embedding model

**Why**

Metadata turns a single flat index into something you can slice: recency, tenant, department, classification, product. It is the cheapest precision improvement available, because it removes candidates before similarity is even considered.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Fixed by the model. |
| D | Embedding cost is per token of text. |

*See: Domain 1 → Metadata filtering*

---

### d1-058

An architecture must let the FM be swapped without redeploying application code. Which pattern supports this?

- [ ] **A.** Hard-code the model ID in the Lambda function
- [x] **B.** Store the model ID in AWS AppConfig (or Parameter Store) and read it at invocation time
- [ ] **C.** Use a different Lambda per model
- [ ] **D.** Recompile the container for each model

**Why**

Externalised configuration is the standard answer for dynamic model switching. AppConfig adds validated, gradual rollout with automatic rollback on a CloudWatch alarm, which matters when the change being rolled out is "every user now talks to a different model".

| Option | Why this option |
| --- | --- |
| A | The thing you are being asked to avoid. |
| B ✓ | Correct. |
| C | Multiplies deployments. |
| D | Worse. |

*See: Domain 1 → Dynamic model switching*

---

### d1-059

What is the correct interpretation of a Bedrock "model unit" in Provisioned Throughput?

- [ ] **A.** A discount tier
- [x] **B.** A unit of dedicated inference capacity providing a defined throughput for a specific model
- [ ] **C.** One million tokens
- [ ] **D.** A single API call

**Why**

You buy model units for a specific model with a 1-month or 6-month commitment and get dedicated, predictable throughput. It is also the required path for serving a custom (fine-tuned or imported) model at scale.

| Option | Why this option |
| --- | --- |
| A | Not a discount tier. |
| B ✓ | Correct. |
| C | That is a token bundle, which is not how this works. |
| D | No. |

*See: Domain 1 → Provisioned Throughput*

---

### d1-060

A team must justify keeping PII out of prompts entirely. Which two controls implement that? (Choose 2.)

- [x] **A.** Detect and redact PII with Amazon Comprehend before constructing the prompt
- [x] **B.** Apply a Bedrock Guardrail sensitive-information policy with the ANONYMIZE action
- [ ] **C.** Set maxTokens to a small value
- [ ] **D.** Use a model with a smaller context window

**Why**

Two complementary layers: strip PII in your own pipeline before the prompt is assembled, and enforce it again at the Bedrock boundary with a guardrail so nothing slips through a code path you forgot about. Defence in depth is the expected professional answer.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Truncates output; does not protect PII. |
| D | Irrelevant. |

*See: Domain 1 → PII handling*

---

### d1-061

Which statement about the Bedrock Converse API is correct in the context of model portability?

- [ ] **A.** It requires provider-specific request bodies
- [x] **B.** It normalises messages, system prompts, inference parameters and tool use across model families
- [ ] **C.** It only works with Amazon Titan models
- [ ] **D.** It disables streaming

**Why**

Converse is the portability layer: one request shape across providers, including tool use. That is precisely what makes swapping a model a configuration change instead of a rewrite — the reason it is the recommended default over raw `InvokeModel`.

| Option | Why this option |
| --- | --- |
| A | That is `InvokeModel`. |
| B ✓ | Correct. |
| C | Multi-provider. |
| D | `ConverseStream` exists. |

*See: Domain 1 → Bedrock APIs*

---

### d1-062 *(hard)*

After migrating a knowledge base from OpenSearch Serverless to Aurora pgvector, retrieval quality drops noticeably although the same embedding model is used. What should you investigate first?

- [ ] **A.** Whether the foundation model changed
- [x] **B.** The index configuration — distance metric, index type and parameters such as HNSW ef_search / lists
- [ ] **C.** The IAM role
- [ ] **D.** The chunk text encoding

**Why**

Different stores default to different distance metrics (cosine vs L2 vs inner product) and different index parameters. A cosine-trained embedding searched with L2, or an HNSW index with a too-small search parameter, degrades ranking quietly while everything appears healthy.

| Option | Why this option |
| --- | --- |
| A | Not implicated by a store migration. |
| B ✓ | Correct. |
| C | Would cause errors, not silent quality loss. |
| D | Would cause visible corruption. |

*See: Domain 1 → Vector store configuration*

---
