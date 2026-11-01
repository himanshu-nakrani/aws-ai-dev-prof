# 05 — Amazon Bedrock Guardrails

Exam focus: one policy layer filtering what goes into and out of any model. Each policy type solves a different problem — the exam tests telling them apart.

## The six policies

| Policy | Mechanism | Use for |
|---|---|---|
| Content filters | Predefined categories (Hate, Insults, Sexual, Violence, Misconduct, **Prompt Attack**), strength none→high, set separately for input/output | Harmful content; prompt injection/jailbreak attempts |
| Denied topics | Topics defined in natural language + example phrases; detected **semantically** | "Never discuss competitors / no personalized investment advice" — even paraphrased |
| Word filters | Exact whole-word/phrase match (case-insensitive); managed profanity list available | Specific strings: profanity, competitor names |
| Sensitive information filters | Probabilistic PII detection + custom regex; action = **block** or **mask/anonymize** | Redact SSN, email, account numbers in inputs, outputs, transcripts |
| Contextual grounding checks | Scores response vs retrieved source + query: grounding (supported by source?) and relevance (answers the question?); threshold-based | Hallucinated RAG answers |
| Automated Reasoning checks | Validates response claims against a formal logic policy built from your rule documents; returns findings/corrections | Deterministic correctness: eligibility, policy rules, calculations |

### Distinctions that decide questions

- **Denied topics ≠ word filters**: semantic topic vs exact string. A competitor can be discussed without being named.
- **Grounding ≠ fact-checking**: grounding verifies against *your provided source*, not the world.
- **Masking ≠ blocking**: masking keeps the conversation usable ("My SSN is {SSN}"); blocking rejects. Inputs can be blocked or anonymized pre-model; outputs are typically masked.

## Three ways to invoke

1. **Attached to inference** — `guardrailIdentifier` + version in Converse/InvokeModel; also attachable to Agents and Knowledge Base queries. Prompt and completion evaluated automatically.
2. **`ApplyGuardrail` API** — evaluates arbitrary text with **no model involved**. Critical uses:
   - Screen user input *before* it reaches a model, agent, or retrieval step.
   - Validate output from models Bedrock didn't run (SageMaker endpoint, self-hosted, third-party).
3. **Selective evaluation (tagging)** — mark only the user-supplied segment of a prompt for evaluation so system instructions, retrieved docs, and history aren't treated as "user input".

## Lifecycle

- Edit the **DRAFT**; production pins a **numbered version**. Updating a draft never silently changes production.
- Configure custom blocked-input / blocked-output messages.
- Trace output shows which policy intervened (`action: INTERVENED`) — debugging and audit trail.

## Defense in depth (Domain 3 pattern)

Guardrails are one layer, not the whole design:

```text
API Gateway / WAF (rate limits, payload size)
  → optional pre-filter (Comprehend PII, Lambda validation/sanitization)
  → Guardrail on input (prompt attack, denied topics, PII)
  → Knowledge Base / Agent / Model
  → Guardrail on output (content, PII masking, grounding check)
  → Lambda post-validation (JSON schema, business rules)
  → response
```

Guardrails do not replace IAM, network isolation, or schema validation; no filter catches every jailbreak — which is why layered designs are tested.

## Decision rules

| Scenario | Answer |
|---|---|
| Moderate text before any model call / from an external model | `ApplyGuardrail` |
| Topic must never be discussed, however phrased | Denied topics |
| Block these exact words | Word filters |
| Stored transcripts must not contain PII | Sensitive info filter with masking |
| RAG answers invent unsupported details | Contextual grounding checks (+ retrieval fixes, Lesson 03) |
| Verify decisions against formal policy rules | Automated Reasoning checks |
| Attackers override the system prompt | Content-filter prompt-attack category, inside the layered design |
| Different behavior test vs prod | DRAFT in test, pinned version in prod |

## Hands-on checklist

- [ ] Create a guardrail (denied topic + PII masking + content filters); exercise the test window.
- [ ] Call `ApplyGuardrail` on raw text — confirm block/redact with no model involved.
- [ ] Attach to a Converse call; trigger an intervention; read the trace.
- [ ] Run an ungrounded answer through a grounding check at different thresholds.

Source: https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.md
