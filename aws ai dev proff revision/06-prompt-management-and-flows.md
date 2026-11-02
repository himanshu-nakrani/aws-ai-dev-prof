# 06 — Prompt Management + Prompt Flows

Exam focus: prompts as versioned, testable configuration — not strings buried in code — and chaining them into workflows.

## Part A — Prompt Management

A managed prompt bundles: **template text + variables + model + inference settings**. Changing any of them creates a new **variant** — the unit you test and compare.

- **Variables**: `{{placeholder}}` values filled at test/runtime. One template, many use cases.
- **Variants**: alternative wording, model, or temperature/topP for the same prompt. Test window runs variants side-by-side on identical inputs.
- **Versions**: immutable snapshots. Applications reference a specific version; draft edits never affect production. Rollback = point back to the previous version.
- **Prompt optimization**: Bedrock can auto-rewrite a prompt for a chosen model; keep the result as a variant.
- **Prompt caching** can be enabled on the prompt (Lesson 02) — natural home for long, stable system prompts.
- Usable directly as a Converse target, or as a prompt node inside a Flow.

Governance angle: centrally owned templates, controlled promotion draft→version, usage tracked via CloudTrail/CloudWatch. Anti-pattern tested against: prompts hardcoded in application code.

### Prompt-craft techniques to recognize

- Role/system definition + explicit output-format spec ("return only this JSON schema")
- Structured, delimited input sections separating instructions from data
- Few-shot examples for format/behavior consistency
- Chain-of-thought instructions for multi-step reasoning
- Iterative refinement driven by evaluation feedback (Lesson 07)

## Part B — Prompt Flows

A directed graph of nodes; node outputs wire into inputs via expressions (JSONPath-style) with type validation.

### Node catalog

| Category | Nodes |
|---|---|
| Logic | Input, Output, **Condition** (branching; first match wins), **Iterator/Collector** (fan array out and back), **DoWhile** (loop with `maxIterations`) |
| Work | **Prompt** (managed or inline; guardrail attachable), **Knowledge base** (retrieve-only, or RetrieveAndGenerate with guardrails), **Agent** (can pause mid-flow for user input — multi-turn), **Lambda**, **Inline code** (small Python transforms), **S3 retrieval/storage** |

### Lifecycle (same alias/version discipline as agents and guardrails)

```text
Working draft → Prepare → test → publish Version (immutable) → Alias (can weight-split versions) → InvokeFlow
```

Long flows can run **asynchronously** with execution tracking; synchronous invocation streams node events.

## Flows vs Step Functions vs Agents

| | Prompt Flows | Step Functions | Agents |
|---|---|---|---|
| Who decides steps | You, visually, in advance | You, in advance | The model, at runtime |
| Strength | Prompt/KB/agent chaining, almost no code | Enterprise orchestration: retries, error handling, human approval, long waits, broad service integrations | Open-ended tasks |
| Weakness | Bedrock-centric; limited general orchestration | No native prompt/KB nodes (wire Lambda/Converse yourself) | Cost, latency, nondeterminism |
| Exam cue | "Chain prompts with branching, minimal code" | "Auditable workflow with approval step and retries" | "Model decides which actions to take" |

## Decision rules

| Scenario | Answer |
|---|---|
| Same prompt across apps; changes reviewed and reversible | Prompt Management + versions |
| Compare two prompt wordings/models before choosing | Variants in the test window |
| Classify request, route to a specialized prompt | Flow + Condition node |
| Summarize each document in a list, then combine | Iterator → Prompt → Collector → Prompt |
| Workflow needs manager approval + retry logic | Step Functions, not Flows |
| Steps unknowable in advance | Agent (Lesson 04), not a Flow |

## Hands-on checklist

- [ ] Prompt with two variables; second variant on another model/temperature; compare; publish a version.
- [ ] Flow: Input → Knowledge base node → Prompt node (managed prompt) → Output; publish version + alias; invoke.
- [ ] Add a Condition node routing on a classification result.

Sources: https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.md · https://docs.aws.amazon.com/bedrock/latest/userguide/flows.md
