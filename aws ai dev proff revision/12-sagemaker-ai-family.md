# 12 — SageMaker AI Family

Exam focus: when Bedrock's managed path isn't enough — custom models, fine-tuning control, and the ML-platform services that support GenAI governance. Model *training* internals are out of scope; deployment and lifecycle are in scope.

## SageMaker vs Bedrock — the master decision

| | Bedrock | SageMaker AI |
|---|---|---|
| Model access | Managed APIs; no infra | You deploy and run model endpoints |
| Customization | SFT / distillation / RFT on supported models (Lesson 07) | Full control: full fine-tuning, LoRA/adapters, any open/custom weights |
| Serving | On-demand / provisioned throughput | Real-time, serverless, async, batch endpoints; GPU choice; autoscaling |
| Ops burden | Minimal | Endpoint lifecycle, instance sizing, scaling, patching |
| Choose when | Managed models meet the need | Model not on Bedrock, custom weights, serving control, existing ML platform |

Exam default: Bedrock first; SageMaker when the scenario demands control Bedrock doesn't offer.

## Components that matter for AIP-C01

### JumpStart
One-click deploy and fine-tune of popular foundation models (open and proprietary) to SageMaker endpoints. Fastest SageMaker path to a hosted FM; also the entry point for models not available on Bedrock.

### Endpoints (serving options)
- **Real-time endpoints**: always-on, GPU instance choice, autoscaling — custom/fine-tuned model inference.
- **Serverless inference**: sporadic/low traffic, no instance management, cold starts.
- **Asynchronous inference**: long-running requests, queued, S3-based results.
- **Batch transform**: offline scoring over datasets.
- Multi-model / multi-container endpoints: many models behind one endpoint for cost efficiency.

### Model Registry
Versioned model packages with approval workflows (Pending → Approved → deployed). The governance answer for self-managed models: which version is in production, rollback to the previous approved version. Pairs with SageMaker Pipelines (CI/CD for model build/deploy) and evaluation gates (Lesson 07).

### Clarify
Bias detection and explainability: pre-training data bias, post-training prediction bias, and SHAP-based feature attribution. Exam role: fairness evaluation and bias drift monitoring for governance (Domain 3) — "demonstrate the model treats groups equitably / explain its decisions".

### Model Monitor
Baselines from training/reference data; scheduled monitoring of data quality, model quality, bias drift, and feature attribution drift on live endpoints, with CloudWatch alerts. Exam role: "detect model/data drift in production" for SageMaker deployments (for Bedrock, the equivalents are evaluations + invocation-log analysis, Lessons 07/11).

### Ground Truth + Amazon Augmented AI (A2I)
- **Ground Truth**: managed data-labeling with human workforces; creates training/evaluation datasets.
- **A2I**: human-in-the-loop review of model predictions at runtime — low-confidence outputs routed to humans; approval/correction workflows. GenAI pattern: human review of sensitive agent actions or generated content (often orchestrated by Step Functions, Lesson 09).

### Supporting pieces (recognition level)
- **Data Wrangler**: visual data prep and data-quality analysis for FM-consumption pipelines (Domain 1 data validation).
- **Processing jobs**: Spark/scikit-style preprocessing at scale (e.g., preparing corpora for embedding/fine-tuning).
- **Feature Store, Pipelines, Studio / Unified Studio**: feature management, ML CI/CD, and the IDE/workspace — know they exist and their one-line job (Lesson 13 covers the sweep).
- **Neo**: compiles models for edge/device targets — rarely central; recognition only.

## Decision rules

| Scenario | Answer |
|---|---|
| Deploy an open-weight model with our own LoRA adapter | SageMaker (JumpStart/endpoint) + Model Registry |
| Model unavailable on Bedrock; need GPU serving control | SageMaker real-time endpoint |
| Track/approve/roll back custom model versions | Model Registry (+ Pipelines) |
| Detect bias and explain predictions | Clarify |
| Alert when live model behavior drifts | Model Monitor |
| Humans must review low-confidence outputs | A2I (often via Step Functions) |
| Build labeled datasets with a workforce | Ground Truth |
| Standard RAG/chat with managed models | Bedrock — not SageMaker |

## Hands-on checklist

- [ ] Deploy a JumpStart model to a real-time endpoint; invoke it; delete it (cost).
- [ ] Register two model versions in Model Registry; approve one; note the deployment/rollback mechanics.
- [ ] (Read) A Clarify bias report and a Model Monitor drift report — know what each metric means.

Source: https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html
