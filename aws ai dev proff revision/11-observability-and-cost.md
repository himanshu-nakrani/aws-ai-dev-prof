# 11 — Observability + Cost

Exam focus (Domains 4–5): seeing what your GenAI system did, what it cost, and why quality or latency changed.

## What to measure (GenAI-specific)

Traditional metrics (requests, errors, latency) plus FM-specific signals:

- **Token usage**: input/output/cache-read/cache-write tokens per model, per application (inference profile, Lesson 02).
- **Invocation latency** split by stage: retrieval, model, guardrail, downstream tools.
- **Throttling and quota pressure**: `ThrottlingException` rates, tokens-per-minute headroom.
- **Guardrail interventions**: which policy fired, how often (from guardrail trace data).
- **Quality proxies**: evaluation scores (Lesson 07), hallucination/grounding rates, user feedback (thumbs, ratings), agent task-completion rate.
- **Cost per request / per conversation / per tenant** — the unit economics Domain 4 asks about.

## The tool set

### CloudWatch
- Bedrock publishes invocation metrics (count, latency, client/server errors, token counts) dimensioned by model and inference profile.
- **Model invocation logging** (opt-in, Lesson 01) sends full request/response payloads to CloudWatch Logs and/or S3 — required for deep debugging, audit, and building evaluation datasets. This is also a cost and privacy decision (Lessons 05/10).
- Logs Insights queries over invocation logs: find the prompts behind latency spikes, sample low-quality responses.
- Alarms + anomaly detection: token-burst anomalies (runaway agent loops show up here first), latency/error thresholds.
- Custom metrics/dashboards: publish app-side quality metrics (grounding pass rate, cache hit rate) via Embedded Metric Format; one dashboard per application.

### X-Ray
- End-to-end tracing across API Gateway → Lambda → Bedrock/KB/agent calls; service map shows which hop owns the latency.
- Exam cue: "the chatbot is slow but the model is fast" → trace breaks down retrieval vs invocation vs tool execution.

### CloudTrail
- API audit trail: who created/modified/deleted agents, KBs, guardrails, prompts; who invoked what, when. Governance and incident forensics (Lesson 10).
- CloudTrail does **not** contain prompt/response content — that's invocation logging. Confusing the two is a classic distractor.

### CloudWatch Synthetics
- Canaries that periodically call your GenAI endpoint with golden prompts and alert on failures or response drift — production smoke tests.

## Cost visibility and control

- **Application inference profiles + tags** (Lesson 02) → per-team/app token spend in **Cost Explorer** and the Cost and Usage Report; activate the tags as cost-allocation tags.
- **Cost Anomaly Detection**: alerts on unusual Bedrock spend (e.g., a looping agent burning tokens).
- Optimization loop (from Lesson 02): measure with token metrics → route/cache/prune/batch → re-measure. Cost questions are answered with this loop, not with a single feature.
- Budgets/alerts on forecasted Bedrock spend for guardrails at account level.

## Troubleshooting playbooks

| Symptom | First places to look |
|---|---|
| Sudden cost spike | Token metrics by inference profile → invocation logs for the top prompts; suspect agent loops or lost caching |
| Latency regression | X-Ray trace breakdown (retrieval vs model vs tool); check cross-region routing and cache hit rates |
| Quality complaints, metrics green | Sample invocation logs; run evaluation job (Lesson 07) — separate retrieval vs generation failure (Lesson 03) |
| Intermittent throttling | Token-per-minute metrics vs quota; SQS buffering / provisioned throughput / cross-region profile (Lessons 02/09) |
| Agent doing bizarre things | Agent trace (Lesson 04) + invocation logs; check prompt/guardrail version drift |
| Need to prove compliance | CloudTrail (actions) + invocation logs (content) + guardrail traces |

## Decision rules

| Scenario | Answer |
|---|---|
| "Show Bedrock spend per business unit" | Application inference profiles + cost allocation tags + Cost Explorer |
| "Alert us when token spend behaves abnormally" | Cost Anomaly Detection / CloudWatch anomaly alarms |
| "Which prompts caused last night's latency spike" | Model invocation logs + Logs Insights |
| "Where is time spent in each request" | X-Ray tracing |
| "Who changed the production guardrail" | CloudTrail |
| "Detect runaway agent token burn early" | CloudWatch token metrics + anomaly alarm |
| "Continuously verify the live endpoint still answers correctly" | Synthetics canary with golden prompts + scheduled evaluation |

## Hands-on checklist

- [ ] Enable invocation logging; query it with Logs Insights.
- [ ] Dashboard: invocations, p95 latency, input/output tokens, throttles for one model.
- [ ] Tag an inference profile; find its spend in Cost Explorer.
- [ ] Trace one chat request end-to-end in X-Ray.

Sources: https://docs.aws.amazon.com/bedrock/latest/userguide/monitoring.html · https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html
