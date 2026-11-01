# 03 — Amazon Bedrock Knowledge Bases (managed RAG)

Exam focus: the ingestion → embedding → retrieval pipeline, and the controls that fix retrieval quality.

```text
Data source → parse → chunk → embed → vector index
User query → embed query → filter + similarity search → optional rerank → prompt + model → answer + citations
```

## Creation choices (expensive to reverse)

### Data sources
S3 (most common), web crawler, Confluence/SharePoint/OneDrive/Google Drive connectors, custom/direct ingestion APIs.

Changing source content does nothing until you **sync** (`StartIngestionJob`). Sync is incremental: added/modified/deleted documents are processed; deletions leave the index.

### Parsing
- Default parser: plain text extraction.
- Advanced parsing (Bedrock Data Automation or an FM-based parser): complex PDFs, tables, charts, scanned/visual content.
- Custom transformation Lambda: your own cleaning, redaction, metadata enrichment, or splitting.
- Exam cue: "answers must use the tables/diagrams in our PDFs" → advanced/multimodal parsing, not default parsing alone.

### Embedding model
- Same model embeds chunks and queries (same vector space — non-negotiable).
- Selection factors: language/domain fit, dimensions, multimodal support, cost.
- Treat as a creation-time decision: changing it generally means a new index/KB and full re-ingestion.

### Vector store options
| Store | Choose when |
|---|---|
| OpenSearch Serverless (KB can auto-create) | Fastest managed setup; semantic + hybrid search |
| OpenSearch Service managed cluster | Cluster-level control (Lesson 08) |
| Aurora PostgreSQL + pgvector | Already on Postgres; SQL joins to relational data |
| Neptune Analytics | Relationship/graph questions (GraphRAG) |
| S3 Vectors / Pinecone / Redis / MongoDB Atlas | Cost or existing-platform reasons |

Newer consoles also offer a fully **Managed Knowledge Base** (AWS runs ingestion/index/storage/retrieval). The mechanics in this lesson apply either way.

## Chunking — the highest-impact quality lever

| Strategy | How | Best for |
|---|---|---|
| Default | ~300-token chunks, honors sentence boundaries | Quick start, general docs |
| Fixed-size | Max tokens + overlap % you set | Uniform documents |
| No chunking | Whole document = one chunk | You pre-split documents yourself (often via Lambda) |
| Hierarchical | Small child chunks match precisely, then are replaced by larger parent chunks for context | Long structured docs: manuals, contracts, policies |
| Semantic | Splits where sentence meaning shifts; uses an FM (extra cost) | Mixed-topic documents |

Tradeoffs: too small → precise but context-poor; too large → noisy and token-expensive; overlap preserves cross-boundary context but duplicates content.

## Query-time configuration

| Control | Rule |
|---|---|
| `numberOfResults` (default 5) | More = better recall, more noise/cost/context pressure |
| Semantic search | Paraphrased, conceptual questions |
| Hybrid search (keyword + vector; OpenSearch Serverless, Aurora/RDS, MongoDB) | Exact terms matter: SKUs, error codes, names |
| Metadata filtering | Restrict corpus before ranking: tenant, department, date, type |
| Reranking | Retrieve wide, reranker re-scores, keep the best few; adds a model call, can reduce prompt cost |
| Query transformation | Complex/multi-hop questions: decompose (Lambda/Step Functions/Bedrock), retrieve per sub-question, combine |

Metadata filtering is **not** authorization by itself: the application must inject tenant/user filters server-side; never trust filter values from the end user.

## Retrieve vs RetrieveAndGenerate

| API | Returns | Use when |
|---|---|---|
| `Retrieve` | Chunks, scores, source locations | You control the prompt, model call, guardrails, routing, multi-KB merging |
| `RetrieveAndGenerate` | Answer **with citations**; supports `sessionId` for multi-turn | Fastest working RAG app |
| `RetrieveAndGenerateStream` | Streaming version | Real-time UI |

Citations improve verifiability; they do not prove faithfulness (grounding checks, Lesson 05/07).

**Structured-data KBs**: for Redshift/Glue-backed sources, Bedrock converts natural language to SQL and queries tables directly — no embeddings. Cue: "live tabular sales data" → text-to-SQL beats embedding rows.

## Troubleshooting patterns

| Symptom | Likely cause |
|---|---|
| Retrieved chunks irrelevant | Chunking, embedding fit, need hybrid search or reranker |
| Right chunk retrieved, answer wrong | Prompt/generation problem; conflicting/insufficient context |
| Answers cite outdated policy | Sync never ran / not automated (S3 event → Lambda/EventBridge → `StartIngestionJob`) |
| Documents missing | Ingestion or parsing failure; IAM/KMS permissions |
| Users see other departments' docs | Missing server-side metadata filtering / access design |
| Table/diagram questions fail | Text-only parsing; need advanced parsing or multimodal embeddings |

## Decision rules

- Managed RAG with citations, minimal code → Knowledge Bases + `RetrieveAndGenerate`.
- Custom prompt/model orchestration over chunks → `Retrieve` + own Converse call.
- Precise match **and** full context in long manuals → hierarchical chunking.
- Exact product codes in queries → hybrid search.
- Restrict to the user's department → server-injected metadata filtering.
- Hourly document changes → automated incremental sync.
- Live relational/tabular data → structured KB (NL→SQL).

## Hands-on checklist

- [ ] Ingest the same PDFs with fixed-size vs semantic/hierarchical chunking; compare retrieved chunks.
- [ ] Add `.metadata.json` sidecar files; filter a query by an attribute.
- [ ] Call `Retrieve` (inspect scores), then `RetrieveAndGenerate` (inspect citations).
- [ ] Modify/delete a source document, sync, verify index behavior.

Sources: https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html · https://docs.aws.amazon.com/bedrock/latest/userguide/kb-chunking.md · https://docs.aws.amazon.com/bedrock/latest/userguide/kb-test-config.md
