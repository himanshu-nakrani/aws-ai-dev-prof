# 02 — Inference Economics

Exam focus: match the purchasing/optimization model to the traffic pattern in the scenario. The traffic pattern matters more than the model name.

Cost of a request ≈ input tokens × input rate + output tokens × output rate (rates differ; output usually costs more).

## Four ways to buy inference

| Mode | Billing | Best for | Trap |
|---|---|---|---|
| On-demand | Per token | Variable, spiky, unpredictable traffic | Account/regional quotas; throttling at peak |
| Provisioned Throughput | Hourly per Model Unit (MU) | Sustained, predictable, high volume | You pay while idle; not automatically cheaper |
| Batch inference | Discounted per token (model-dependent) | Large async jobs over hours | Not for interactive apps |
| Prompt caching | Cache-write premium + discounted cache-read rate | Repeated long prompt prefixes | Caches prompt processing, not the final answer |

### Provisioned Throughput facts

- One MU = a model-specific amount of input tokens/min + output tokens/min. Estimate **both** peaks; an MU is not a number of requests.
- Billed hourly until deleted. Commitments: none, 1 month, 6 months (longer = cheaper hourly rate).
- A customized (fine-tuned/distilled) Bedrock model **requires** Provisioned Throughput to invoke.
- Traffic beyond purchased MUs can still throttle.
- Break-even only at sustained high utilization. Spiky workload → on-demand wins.

## Inference profiles (passed anywhere a `modelId` is accepted)

### Cross-region (system-defined)

- AWS-defined set of regions; IDs start with a geography prefix (`us.`, `eu.`, `apac.`).
- Routes requests to regional capacity → availability and throughput headroom.
- Requests may be processed in another region in that geography → conflicts with strict single-region data-residency requirements.
- Does **not** reserve capacity; it is not Provisioned Throughput.

### Application inference profile

- You create it around one regional model or one cross-region profile.
- Purpose: **cost attribution and usage metrics** — tags (team/app/tenant) flow into cost reporting; CloudWatch metrics per application.
- Exam trap: "Track Bedrock spend separately for three business units" → application inference profiles + tags, not three Provisioned Throughputs.
- It adds no capacity by itself.

## Prompt caching

- Caches the processed representation of a repeated prompt **prefix**; the model still generates a fresh answer.
- Structure prompts static-first, dynamic-last:

```text
Static system instructions / tool definitions / reference doc / few-shot examples
──────────────────────────────── cache checkpoint
Dynamic user input
```

- Explicit caching: model-specific cache checkpoints/controls. Some models also do implicit caching automatically.
- Cache hit needs an exact prefix match; changing an early token invalidates everything after it.
- Reads are cheaper and faster than normal input tokens; writes may cost more than standard input tokens.
- TTL is model-specific (commonly 5 min, sometimes 1 h); hits can refresh it. Hits are best-effort, never guaranteed.
- Monitor cache-read / cache-write token fields in response usage.
- Good candidates: long system prompts, tool definitions, shared documents, few-shot examples. Bad: unique prompts, fast-changing prefixes, infrequent traffic.

## Prompt caching vs application-level caching

| Technique | Matches | Returns/skips | Main risk |
|---|---|---|---|
| Prompt caching | Exact prompt prefix | Skips reprocessing cached input; model still answers | Miss/expiry |
| Exact response cache | Hash of normalized request + model + prompt version + params | Previous complete response | Stale answer; tenant leakage if key is wrong |
| Semantic cache | Embedding similarity of the question | Answer to a similar question | Similar question, different correct answer |
| Edge/precompute | Known predictable request | Pre-generated content | Staleness |

Cache keys must include tenant/user, model, prompt version, and knowledge version where relevant. Never share a semantic cache across tenants for personalized/authorized content.

## Model routing and cascading

- **Static routing**: config picks the model per task/tenant (AppConfig works well).
- **Rule-based**: length, language, modality, complexity signals.
- **Classifier routing**: a small model estimates difficulty.
- **Cascade**: cheap model first; low confidence or failed validation → escalate to a stronger model. Savings depend on the escalation rate; a bad cascade invokes two models and costs more.
- Routing also provides fallback during throttling/model unavailability.

## Token reduction (usually the cheapest lever)

- Retrieve fewer, sharper chunks; metadata-filter before retrieval; cap `topK`.
- Summarize old conversation turns instead of resending full history.
- Set `maxTokens`; request concise/structured output.
- Remove duplicated instructions. (Temperature is not a cost lever.)

## Decision rules

| Scenario wording | Likely answer |
|---|---|
| Sustained predictable traffic, 24/7 | Provisioned Throughput |
| Bursty and unpredictable | On-demand |
| Separate costs by department/application | Application inference profile + tags |
| Capacity unavailable in current region | Cross-region inference profile |
| Same long system prompt/document every request | Prompt caching |
| Same question phrased differently, repeatedly | Semantic caching (with threshold + TTL + tenant isolation) |
| Millions of documents, results by tomorrow | Batch inference |
| Mostly simple queries, a few complex | Routing or cascading to a larger model |
| Retrieved context too large | Reduce `topK`, filter, prune context |

## Hands-on checklist

- [ ] Create an application inference profile with tags; invoke through it; inspect usage.
- [ ] Add a cache checkpoint after a long static prefix; compare usage fields and latency across repeats.
- [ ] Estimate Provisioned Throughput from measured peak input/output token rates.

Sources: https://docs.aws.amazon.com/bedrock/latest/userguide/prov-throughput.html · https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles.html · https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html
