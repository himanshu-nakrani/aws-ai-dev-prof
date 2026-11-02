# 08 — Vector Stores Outside Knowledge Bases

Exam focus: what the Knowledge Base hides from you, and when to build the pipeline yourself.

## Why build custom at all?

A KB already uses these stores. Go custom only for control the KB doesn't expose: custom chunking/preprocessing, streaming/near-real-time ingestion, your own hybrid scoring or multi-index/tenant design, or an existing OpenSearch/Postgres platform. Otherwise the exam default is "use a Knowledge Base".

## ANN in one paragraph

Exact nearest-neighbor compares the query vector to **every** stored vector — too slow at scale. **Approximate** nearest neighbor (ANN) trades a little recall for large speed gains:

- **HNSW**: graph-based; high recall, fast queries; memory-hungry, slower to build.
- **IVFFlat** (pgvector): clustered; needs existing data to train clusters; cheaper memory; recall depends on probes searched.

Distance metric must match the embedding model's design (Titan/Cohere → cosine is the norm). Mismatched metric = silently degraded retrieval.

## OpenSearch — the search specialist

| | Managed cluster (OpenSearch Service) | OpenSearch Serverless |
|---|---|---|
| You manage | Instances, shards, replicas, index design | Almost nothing; capacity scales via OCUs |
| Choose when | Tuning control, predictable large scale, cost tuning | Variable load, minimal ops, KB quick-start |

Key concepts:

- `knn_vector` field with fixed dimension matching your embedding model; engine (e.g., FAISS/HNSW).
- **BM25 keyword search is native** → OpenSearch is the hybrid-search answer. Search pipelines merge keyword + vector scores (normalization or reciprocal rank fusion).
- **Neural search**: query text is embedded for you (in-cluster model or Bedrock connector) instead of by your app.
- Scaling levers: shard size/count, replicas (read throughput). k-NN graphs live in memory → watch `KNNGraphMemoryUsage` vs node RAM in CloudWatch.
- Patterns: separate indices per domain/tenant; metadata as filterable fields (Lesson 03 filtering).

## Aurora PostgreSQL + pgvector — the relational option

- `vector` column + HNSW or IVFFlat index; operators `<=>` cosine, `<->` L2, `<#>` inner product.
- Killer feature is **SQL**: similarity + `WHERE` filters + joins to live business tables + `tsvector` full-text (hybrid) in one query. Metadata filtering is just SQL.
- Aurora scaling: storage auto-scale, read replicas, Serverless v2.
- As a KB store it needs specific wiring: Data API enabled, credentials in Secrets Manager, table with chunk/embedding/metadata columns, HNSW cosine index. Custom RAG can use any schema.
- Choose when data already lives in Postgres and retrieval must join transactional data. Pure vector scale/search sophistication → OpenSearch.

## Supporting cast

- **Neptune Analytics**: GraphRAG — retrieval follows entity *relationships* ("which suppliers does this component failure affect?").
- **S3 Vectors**: low-cost S3-native vectors for large, latency-tolerant corpora.
- **DynamoDB**: **not** a vector store. Roles: metadata, conversation history, session state beside a real vector index.

## The custom pipeline

```text
Ingest:  S3 event → EventBridge/Step Functions → parse + chunk (Lambda)
         → Bedrock embeddings (batch where possible) → bulk index
Query:   app → embed query → hybrid search + metadata filters
         → optional rerank → Converse with retrieved context
Change:  source change → re-embed changed docs only
         embedding-model change → NEW index, dual-run, cut over (blue/green)
```

Embeddings from different models live in different vector spaces. Never mix models in one index or query a Titan index with Cohere vectors.

## Decision rules

| Scenario | Answer |
|---|---|
| Full control of indexing, shards, hybrid scoring | OpenSearch managed cluster |
| Vector search, zero cluster ops | OpenSearch Serverless |
| Join semantic search to live customer/order tables | Aurora pgvector |
| Questions about relationships between entities | Neptune GraphRAG |
| Millions of rarely queried vectors, cost first | S3 Vectors |
| Standard RAG, no search expertise on team | Knowledge Base (Lesson 03), not custom |

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Quality collapsed after a "small change" | Embedding model/dimension changed without re-indexing |
| Slow queries at scale | Shard/replica sizing; k-NN graph over node memory; IVFFlat probes too low |
| Exact-match terms not found | Semantic-only search → switch to hybrid |
| Fresh documents not searchable | Ingestion lag/failure; refresh/sync not wired |
| Filtered queries return too little | Over-restrictive metadata filters before ANN search |

## Hands-on checklist

- [ ] OpenSearch index with `knn_vector`; kNN query, then a hybrid query.
- [ ] Aurora: `CREATE EXTENSION vector`, `vector` column, HNSW index, cosine query with a SQL `WHERE` filter.
- [ ] Query an index with the wrong embedding model once — observe garbage results; remember the vector-space rule.

Sources: https://docs.aws.amazon.com/opensearch-service/latest/developerguide/knn.html · https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraPostgreSQL.VectorDB.html
