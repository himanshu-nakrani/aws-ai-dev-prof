# 07 — Model Evaluation + Customization

Exam focus: prove a model/prompt works, then decide whether to change the model itself — and how.

## Part A — Evaluation

### Three evaluation methods

| Method | Scoring | Cost/speed | Use when |
|---|---|---|---|
| Programmatic (automatic) | Deterministic metrics vs expected outputs: accuracy, ROUGE/BERTScore/F1-style similarity | Cheapest, fastest | Objectively checkable answers; regression testing |
| LLM-as-a-judge | A second model scores + explains: correctness, completeness, **faithfulness**, helpfulness, coherence, instruction-following; responsible-AI metrics (harmfulness, stereotyping, refusal) | Moderate; scales to thousands | Open-ended generation with no exact-match answer |
| Human evaluation | Your employees/SMEs rate outputs via managed work teams | Slowest, most expensive | Subjective quality, brand voice, safety; calibrating the judge |

Production pattern: **judge at scale, humans on a sample** to validate the judge.

### Mechanics

- Input: custom prompt dataset (JSONL in S3) for your use case, or built-in benchmark datasets.
- Evaluable: foundation models, fine-tuned/imported models, provisioned-throughput models, inference profiles, prompt routers, **knowledge bases**.
- Output: report card (console + S3) per metric → usable as deployment quality gates ("faithfulness must not regress below X").

### RAG evaluation — two separate failure domains

| Layer | Question | If it fails, fix |
|---|---|---|
| Retrieval | Did we fetch relevant context? (context relevance/coverage vs ground truth) | Chunking, embeddings, hybrid search, filters, reranking (Lesson 03) |
| Generation | Is the answer correct, complete, **faithful to what was retrieved**? | Prompt, model choice, grounding checks (Lessons 05–06) |

Needs ground truth: queries + expected source texts + expected responses. This split drives Domain 5 troubleshooting: never "fix" generation when retrieval is the broken half.

### Adjacent patterns

- **A/B and canary**: alias weight-splitting (agents, flows), app-level routing, or offline eval on the same dataset. Compare quality **and** cost/latency (token efficiency, latency-to-quality).
- **Agent evaluation**: task-completion rate, tool-call effectiveness, reasoning quality from traces (Lesson 04; AgentCore Evaluations).

## Part B — Customization

### Decision ladder — try in order

```text
1. Prompt engineering     → fixable with instructions/examples? stop
2. RAG                    → missing or changing facts? stop
3. Fine-tuning            → consistent style/format/task behavior?
4. Continued pre-training → must absorb domain language/corpus?
5. Distillation           → big model right but too slow/expensive at volume?
6. SageMaker self-managed → full control (LoRA/adapters, custom models)?
```

### Methods

| Method | Training data | Changes | Exam cue |
|---|---|---|---|
| Supervised fine-tuning (SFT) | Labeled prompt→response pairs (JSONL in S3) | Behavior: format, tone, task pattern | "Always output our exact ticket-classification format" |
| Reinforcement fine-tuning | Prompts + a **reward function** (Lambda) scoring responses | Alignment with your quality criteria, learned iteratively | "Optimize for our business-rule scoring without labeled answers" |
| Continued pre-training | Large unlabeled domain corpus | Domain vocabulary/knowledge | Deep domain adaptation (model availability varies — verify) |
| Distillation | Your prompts; **teacher** generates responses, **student** fine-tuned on them (Bedrock automates) | Small model inherits big-model quality on your task distribution | "Frontier quality at small-model cost/latency" |
| LoRA / adapters (SageMaker) | Labeled data; trains small adapter weights on frozen base | Cheap, swappable adaptation | Self-managed open models; Model Registry versioning/rollback (Lesson 12) |

### Operational facts

- Fine-tuning cost = training tokens × epochs, plus per-model monthly storage.
- Customized Bedrock models invoke **only through Provisioned Throughput** (Lesson 02) — budget for it.
- Controllable hyperparameters: epochs, learning rate, batch size; training/validation split from your dataset.
- Lifecycle: evaluate customized vs base model before deploying; keep a rollback path to the previous version.

### Amazon's own models

- **Titan Embeddings** (text + multimodal): the KB embedding workhorse (Lesson 03). **Titan Image Generator**: image generation/editing.
- **Nova family**: current generation — text/multimodal tiers (Micro/Lite/Pro map to the Lesson 02 cost/capability ladder), plus image/video/speech variants.

## Decision rules

| Scenario | Answer |
|---|---|
| Data changes daily; answers cite current documents | RAG, never fine-tuning |
| Output format inconsistent despite clear instructions | SFT (after prompt engineering fails) |
| Frontier model works; unit economics fail at scale | Distillation |
| Nightly scoring of thousands of responses | LLM-as-a-judge |
| Subjective brand/safety judgments | Human evaluation |
| RAG quality dropped | Evaluate retrieval and generation **separately** first |
| Choosing between two models for our workload | Eval job on **your** dataset + cost/latency analysis, not public benchmarks |

## Hands-on checklist

- [ ] ~50-prompt JSONL dataset from your Lesson 03 app; automatic eval comparing two models.
- [ ] LLM-as-judge job; read explanations, not just scores.
- [ ] RAG evaluation; classify your errors as retrieval vs generation.
- [ ] (Read-only) Walk the fine-tuning flow: dataset format, hyperparameters, Provisioned Throughput requirement.

Sources: https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.md · https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.md
