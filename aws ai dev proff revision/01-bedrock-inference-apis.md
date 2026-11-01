# 01 — Bedrock Inference APIs

Exam focus: how applications actually call foundation models, and which API shape fits a stated requirement.

## Control plane vs data plane

| API family | Purpose |
|---|---|
| `bedrock` | Control plane: models, provisioned throughput, customization jobs |
| `bedrock-runtime` | Inference: `InvokeModel`, `Converse`, streaming variants |
| `bedrock-agent` | Build-time: create agents, knowledge bases, prompts, flows |
| `bedrock-agent-runtime` | Runtime: `InvokeAgent`, `Retrieve`, `RetrieveAndGenerate`, `ApplyGuardrail` lives in `bedrock-runtime` |

## Converse vs InvokeModel

| | Converse | InvokeModel |
|---|---|---|
| Request format | Unified message schema across models | Provider-specific JSON body |
| Switching models | Change `modelId` only | Rewrite the request body |
| Tool use | Native `toolConfig` | Manual, per provider |
| Streaming | `ConverseStream` | `InvokeModelWithResponseStream` |
| Exam cue | "Portable", "multi-model", "no code changes when swapping models" | Model-specific parameters Converse doesn't expose |

Key Converse fields: `messages`, `system`, `inferenceConfig` (maxTokens, temperature, topP, stopSequences), `toolConfig`, `additionalModelRequestFields` (escape hatch for model-specific params), `guardrailConfig`.

## Tool use loop (model never executes anything)

1. Request includes `toolConfig`: tool name, description, JSON input schema.
2. Model replies with `stopReason: "tool_use"` and a `toolUse` block (name + arguments it chose).
3. **Your application** executes the tool (Lambda, API, database).
4. You return the result as a `toolResult` user message.
5. Model produces the final answer.

Agents (Lesson 04) automate this loop; Converse tool use is the manual version.

## Streaming and async

- Real-time token delivery: `ConverseStream` / `InvokeModelWithResponseStream`. Pairs with API Gateway WebSockets or server-sent events.
- No native async invoke on Bedrock. For bulk offline work use **batch inference**: JSONL in S3 → `CreateModelInvocationJob` → results in S3. Discounted per-token pricing (model-dependent), latency in hours.
- Application-level async (user submits, gets notified later): SQS + Lambda pattern you build yourself.

## Facts that decide questions

- **Model access**: most serverless models are available on demand; some third-party models require a use-case form / AWS Marketplace subscription before first invocation.
- **Data handling**: Bedrock does not use your prompts/responses to train models. Data stays in-region unless you use a cross-region inference profile.
- **Invocation logging**: opt-in setting that logs full requests/responses to S3 or CloudWatch Logs. This is the audit/compliance answer.
- **Quotas**: on-demand accounts have tokens/requests-per-minute limits. `ThrottlingException` → exponential backoff (SDK default), quota increase, cross-region profile, or provisioned throughput.
- Temperature/topP are behavior controls, not cost controls.

## Decision rules

| Scenario wording | Answer pattern |
|---|---|
| Swap models without code changes | Converse (+ AppConfig/inference profile routing) |
| Process millions of documents overnight | Batch inference |
| Typing effect / real-time UX | `ConverseStream` |
| Model capacity unavailable in our region | Cross-region inference profile (Lesson 02) |
| All data must remain in one region | Regional on-demand endpoint; avoid cross-region profiles |
| Audit every prompt and response | Enable model invocation logging |

## Hands-on checklist

- [ ] Call the same prompt via InvokeModel and Converse; compare request bodies.
- [ ] Run a two-step tool-use conversation by hand.
- [ ] Stream a response with `ConverseStream`.
- [ ] Enable invocation logging and find the record in CloudWatch Logs/S3.

Source: https://docs.aws.amazon.com/bedrock/latest/userguide/inference.html
