# 04 — Bedrock Agents + AgentCore

Exam focus: when the model should decide the steps, and how to run agents safely in production.

## Do you even need an agent?

| Situation | Tool |
|---|---|
| Answer questions from documents | Knowledge Base `RetrieveAndGenerate` (Lesson 03) |
| Steps known and fixed in advance | Step Functions / Prompt Flows — deterministic, cheaper |
| Open-ended task; model must choose tools and order | Agent |

Agents trade determinism and cost for flexibility: every reasoning step is another FM call.

## Bedrock Agents (managed orchestration)

An agent is a configured resource, not code:

```text
Agent = foundation model + instructions + action groups (tools)
      + knowledge bases (optional) + guardrail (optional) + memory config (optional)
```

### Orchestration loop (ReAct: reason → act → observe)

```text
User input → pre-processing (categorize/validate)
  → agent reasons → query KB | call action group | ask user (clarification)
  → observes result → reasons again … → post-processing → final answer
```

Stops when done, at step limits, or on failure — hence exam emphasis on stopping conditions, timeouts, circuit breakers.

### Action groups

- Defined by a **schema** (OpenAPI schema for API operations, or function schema: names + parameters only) plus an **executor**.
- **Lambda executor**: Bedrock calls your Lambda with the action name and model-extracted parameters. The classic, most-tested pattern.
- **Return of control**: Bedrock returns the requested call to *your application* in the `InvokeAgent` response; you execute it (systems only your app tier can reach, extra validation) and pass the result back.
- Built-in groups: **User input** (agent asks clarifying questions), **Code interpretation** (agent writes/runs code in a Bedrock sandbox).
- Quality lever: **schema descriptions are prompts.** Vague parameter descriptions → wrong/hallucinated arguments. First fix for "agent calls the tool wrong", together with tracing.

### Memory — three different things

| Type | Mechanism | Scope |
|---|---|---|
| In-session context | Same `sessionId` across `InvokeAgent` calls | One conversation |
| Session attributes | `SessionState` passed in/out per request | App-injected data (user tier, cart) |
| Agent memory | Bedrock stores **session summaries** per user (`memoryId`), configurable retention | Cross-session recall |

DIY alternative: DynamoDB conversation history (Lesson 09). AgentCore Memory: framework-agnostic version (below).

### Deployment lifecycle

```text
DRAFT (test alias TSTALIASID) → Prepare → Version (immutable snapshot) → Alias → InvokeAgent
```

- Alias can weight-split traffic between two versions (canary).
- **Inline agents** (`InvokeInlineAgent`): model/tools/instructions defined in the request; nothing persisted. Cue: "ephemeral per-request/per-tenant agents".
- **Tracing**: `enableTrace` returns rationale, action inputs, KB queries, observations per step. Primary debugging tool for agent misbehavior.

### Multi-agent collaboration

Supervisor agent delegates to specialized collaborator agents (own tools/KBs/permissions):

- **Supervisor mode**: supervisor orchestrates every step — capable, expensive.
- **Supervisor-router mode**: classifier routes the request to one collaborator — faster, less flexible.

Use when domains are genuinely separate (billing vs tech support), not to organize what one agent with several action groups could do.

## AgentCore (bring your own framework)

Bedrock Agents = AWS orchestrates, configured, Bedrock models. **AgentCore = production primitives for agents you build** — any framework (Strands, LangGraph, CrewAI), any model. Modular, usable independently:

| Component | Job |
|---|---|
| Runtime | Serverless agent hosting; isolated session per user (own microVM), long-running sessions; HTTP/MCP/A2A protocols |
| Memory | Short-term session events + long-term memory (summaries, semantic facts, user preferences) for any framework |
| Gateway | Wraps existing Lambda functions / OpenAPI APIs / API Gateway endpoints as **MCP tools** — no rewrite |
| Identity | Inbound auth (who may invoke) + outbound credentials (agent calls SaaS **on behalf of the signed-in user**, OAuth) |
| Browser Tool | Managed cloud browser for web-interaction tasks |
| Code Interpreter | Sandboxed execution of agent-generated code |
| Policy | Deterministic (Cedar) rules on Gateway tool calls — control outside the model's judgment |
| Observability / Evaluations | OpenTelemetry traces to CloudWatch; online agent quality evaluation |

### Names to recognize

- **MCP (Model Context Protocol)**: open standard for agent↔tool discovery and calls. Exam rule: stateless MCP servers on **Lambda** for lightweight tools; **ECS** for complex/long-running ones.
- **A2A**: agent-to-agent protocol.
- **Strands Agents**: AWS open-source, model-driven agent SDK.
- **Agent Squad**: AWS multi-agent orchestration framework.

## Decision rules

| Scenario | Answer |
|---|---|
| Create records, check order status from user intent | Bedrock Agent + Lambda action group |
| Existing REST APIs must become tools for MCP agents | AgentCore Gateway |
| Agent built in LangGraph needs secure scalable hosting | AgentCore Runtime |
| Agent acts on the user's own Google Drive/permissions | AgentCore Identity (outbound OAuth) |
| Agent must browse a website / run generated Python | Browser Tool / Code Interpreter |
| Fixed, auditable steps | Step Functions, not an agent |
| Remember returning users across sessions | Agent memory / AgentCore Memory (DIY: DynamoDB) |
| Agent loops or calls wrong tool | Enable trace; fix schema descriptions; iteration limits; guardrails |
| Sensitive action needs approval first | User confirmation / return-of-control, or Step Functions human-approval |

## Hands-on checklist

- [ ] Bedrock Agent with one Lambda action group; invoke with `enableTrace`; read the reasoning steps.
- [ ] Attach a Knowledge Base; observe when it chooses KB vs action.
- [ ] Publish version 1 behind an alias; test changes on `TSTALIASID`.
- [ ] Expose one Lambda/API through AgentCore Gateway as an MCP tool.

Sources: https://docs.aws.amazon.com/bedrock/latest/userguide/agents-how.html · https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html
