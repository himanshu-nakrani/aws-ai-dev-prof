---
title: Domain 2 questions — Implementation and Integration
source: src/assets/data/q-d2.js
group: Practice
---

# Domain 2 questions — Implementation and Integration


26% of scored content. **55 questions.** Every item is original, written against the published AIP-C01 exam guide. Correct option(s) are marked `[x]`.

### d2-001

An agent must call an internal pricing API that sits inside a private VPC with no internet route, and the calling team wants to keep the HTTP call inside their own code rather than exposing an OpenAPI schema to Bedrock. Which Bedrock Agents feature fits?

- [ ] **A.** Action group backed by a Lambda function
- [x] **B.** Return of Control
- [ ] **C.** Knowledge base attachment
- [ ] **D.** Code interpreter

**Why**

Return of Control means the agent decides *which* tool to call and with what arguments, then hands that decision back to your application to execute. Your code makes the call; Bedrock never touches the private API. It is the answer whenever the scenario says the execution must stay in the caller's environment.

| Option | Why this option |
| --- | --- |
| A | Workable, but the Lambda must reach the VPC and Bedrock invokes it — the scenario explicitly wants execution to stay with the caller. |
| B ✓ | Correct. |
| C | For document retrieval, not API calls. |
| D | Runs generated code in a sandbox; not a mechanism for calling your API. |

*See: Domain 2 → Bedrock Agents*

---

### d2-002

Which two things does the Converse API give you that raw `InvokeModel` does not? (Choose 2.)

- [x] **A.** A uniform message and parameter shape across model providers
- [x] **B.** A uniform tool-use (function calling) interface across providers
- [ ] **C.** Automatic retrieval from a knowledge base
- [ ] **D.** Free inference

**Why**

Converse abstracts away the per-provider JSON dialects for both conversation structure and tool definitions. That is the whole value: swapping Claude for Nova becomes a model-ID change rather than a rewrite of your request builder.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | That is `RetrieveAndGenerate` or an agent. |
| D | No. |

*See: Domain 2 → Bedrock APIs*

---

### d2-003 *(hard)*

A production agent workflow must run for up to 40 minutes, survive process restarts, keep per-user session memory across days, and be reachable from an existing container-based service. Which Bedrock AgentCore capabilities are the primary fit? (Choose 2.)

- [x] **A.** AgentCore Runtime for long-running, session-isolated agent execution
- [x] **B.** AgentCore Memory for persistent short-term and long-term memory
- [ ] **C.** AgentCore Browser for headless web navigation
- [ ] **D.** AgentCore Code Interpreter for sandboxed code execution

**Why**

Runtime addresses the execution requirement — long-running, isolated, framework-agnostic hosting that a Lambda's 15-minute ceiling cannot satisfy. Memory addresses persistence across sessions and days. Browser and Code Interpreter are tools an agent may use, but neither is what the requirements describe.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Not required by this scenario. |
| D | Not required by this scenario. |

*See: Domain 2 → AgentCore*

---

### d2-004

What is the role of AgentCore Gateway?

- [x] **A.** It converts existing APIs, Lambda functions and services into tools an agent can discover and call
- [ ] **B.** It load-balances model invocations
- [ ] **C.** It stores conversation history
- [ ] **D.** It generates OpenAPI documentation for humans

**Why**

Gateway is the tool plane: it turns your existing APIs and Lambdas into agent-callable tools with consistent discovery and access control, rather than each agent hand-rolling its own integration code.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | That is inference profiles and throughput. |
| C | That is Memory. |
| D | Not its purpose. |

*See: Domain 2 → AgentCore*

---

### d2-005

An agent needs to act on a user's behalf against a third-party SaaS API using OAuth 2.0, without the agent code ever handling the raw refresh token. Which component addresses this?

- [x] **A.** AgentCore Identity
- [ ] **B.** IAM roles anywhere
- [ ] **C.** Amazon Cognito user pools alone
- [ ] **D.** AWS Secrets Manager alone

**Why**

AgentCore Identity is built for non-human identities and delegated access: it manages OAuth flows, API keys and SigV4 credentials on the agent's behalf so tokens never live in agent code. Cognito and Secrets Manager are pieces of a hand-rolled version of the same thing.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | For non-AWS compute to assume IAM roles; different problem. |
| C | Authenticates end users; does not broker agent-to-SaaS delegated tokens. |
| D | Stores secrets; does not run OAuth flows. |

*See: Domain 2 → AgentCore Identity*

---

### d2-006

Which two statements about tool use (function calling) are correct? (Choose 2.)

- [x] **A.** The model returns a structured request naming the tool and its arguments; your code executes it and returns the result
- [x] **B.** The quality of the tool `description` strongly affects whether the model picks the right tool
- [ ] **C.** The model executes the tool itself inside Bedrock
- [ ] **D.** Tool use requires fine-tuning the model

**Why**

The model never executes anything — it emits a structured intent. And the description field is not documentation, it is the prompt the model uses to choose: vague descriptions are the most common cause of wrong-tool and looping behaviour.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | It does not; you or the agent runtime execute. |
| D | Modern models support tool use natively. |

*See: Domain 2 → Tool use*

---

### d2-007

A team wants a visual, low-code way to chain a prompt, a knowledge base lookup, a Lambda call and a condition into a reusable workflow inside Bedrock. What should they use?

- [x] **A.** Amazon Bedrock Flows
- [ ] **B.** AWS Step Functions Express Workflows
- [ ] **C.** Amazon MWAA
- [ ] **D.** Bedrock batch inference

**Why**

Bedrock Flows is the managed visual builder for exactly this: prompts, knowledge bases, agents, Lambda functions, conditions and iterators, wired together and versioned inside Bedrock.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Powerful and the right answer for complex enterprise orchestration with retries and long-running state — but it is not the low-code, Bedrock-native visual builder described. |
| C | Managed Airflow, for data pipelines. |
| D | Async bulk inference, not orchestration. |

*See: Domain 2 → Bedrock Flows*

---

### d2-008 *(hard)*

Which is the strongest reason to choose AWS Step Functions over a Bedrock Agent for a multi-step generative workflow?

- [ ] **A.** Step Functions is cheaper per token
- [x] **B.** The sequence of steps is deterministic and must be auditable, retried per step, and survive for hours or days
- [ ] **C.** Step Functions can call foundation models and agents cannot
- [ ] **D.** Bedrock Agents cannot call Lambda

**Why**

Agents decide the order of operations at runtime using the model — powerful when the path is genuinely unknown, but non-deterministic and harder to audit. When the business process is fixed, an explicit state machine gives you per-step retries, error handling, long-running execution and a visual audit trail. Choose deterministic orchestration for deterministic processes.

| Option | Why this option |
| --- | --- |
| A | Token cost is identical; the model is the same. |
| B ✓ | Correct. |
| C | Both can. |
| D | They can. |

*See: Domain 2 → Orchestration choices*

---

### d2-009

Which two describe prompt caching on Amazon Bedrock? (Choose 2.)

- [x] **A.** It caches a stable prefix of the prompt so repeated calls reuse it at a much lower input token rate
- [x] **B.** It can substantially reduce time-to-first-token for long, repeated prefixes
- [ ] **C.** It caches the model's final answer and returns it verbatim for identical prompts
- [ ] **D.** It works only with fine-tuned models

**Why**

Prompt caching operates on the input side: mark a stable prefix — system prompt, tool definitions, a long static document — and subsequent calls that share it are billed at a steeply reduced cache-read rate and skip re-processing. It is not response caching; the model still generates fresh output.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | That is semantic/response caching, which you build yourself with DynamoDB, ElastiCache or a vector store. |
| D | It works with supported base models. |

*See: Domain 2 → Prompt caching*

---

### d2-010

What is the difference between short-term and long-term memory in AgentCore Memory?

- [ ] **A.** Short-term is stored in RAM, long-term on disk
- [x] **B.** Short-term holds the immediate conversation context; long-term extracts and persists durable facts, preferences and summaries across sessions
- [ ] **C.** Short-term is encrypted, long-term is not
- [ ] **D.** They are the same thing with different retention settings

**Why**

Short-term memory keeps the current conversation coherent. Long-term memory distils what is worth keeping — user preferences, established facts, session summaries — and makes it available in future sessions, which is what turns a chatbot into an assistant that remembers you.

| Option | Why this option |
| --- | --- |
| A | Not the distinction that matters. |
| B ✓ | Correct. |
| C | Both are encrypted. |
| D | They serve different purposes. |

*See: Domain 2 → AgentCore Memory*

---

### d2-011

A chat UI must display tokens as they are generated. Which API and integration pattern fit?

- [ ] **A.** `Converse` with API Gateway REST
- [x] **B.** `ConverseStream` with either API Gateway WebSocket or Lambda response streaming through a function URL
- [ ] **C.** `InvokeModel` with SQS
- [ ] **D.** Batch inference with S3 notifications

**Why**

You need a streaming model API and a transport that can push incrementally. `ConverseStream` (or `InvokeModelWithResponseStream`) supplies the former; WebSocket or Lambda response streaming supplies the latter. A standard REST integration buffers the whole response and defeats the purpose.

| Option | Why this option |
| --- | --- |
| A | Non-streaming API and a buffering transport. |
| B ✓ | Correct. |
| C | Queues are asynchronous; nothing to stream to. |
| D | Async bulk processing. |

*See: Domain 2 → Streaming architectures*

---

### d2-012

Which two are true about Bedrock Agents multi-agent collaboration? (Choose 2.)

- [x] **A.** A supervisor agent can route work to specialised collaborator agents
- [x] **B.** It suits workloads where distinct expertise or distinct tool sets are needed per sub-task
- [ ] **C.** It removes the need for guardrails
- [ ] **D.** It guarantees lower latency than a single agent

**Why**

The supervisor/collaborator pattern decomposes a problem across specialists, each with its own instructions, tools and knowledge bases. The cost is more model calls, so latency generally goes *up*, not down — you adopt it for capability, not speed.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Guardrails are still required, arguably more so. |
| D | More agents means more invocations and more latency. |

*See: Domain 2 → Multi-agent collaboration*

---

### d2-013

What problem does the Model Context Protocol (MCP) solve?

- [ ] **A.** It compresses prompts to fit smaller context windows
- [x] **B.** It provides a standard protocol for connecting models and agents to external tools and data sources
- [ ] **C.** It encrypts model traffic
- [ ] **D.** It replaces IAM for agents

**Why**

MCP standardises the tool/data-source interface so a server written once can be consumed by many agents and clients, instead of every framework inventing its own integration shape. AgentCore Gateway can expose tools over MCP.

| Option | Why this option |
| --- | --- |
| A | No. |
| B ✓ | Correct. |
| C | TLS does that. |
| D | It does not replace authorisation. |

*See: Domain 2 → MCP*

---

### d2-014

Which customisation technique trains a smaller "student" model to reproduce the behaviour of a larger "teacher" model?

- [ ] **A.** Continued pre-training
- [x] **B.** Model distillation
- [ ] **C.** Retrieval-augmented generation
- [ ] **D.** Prompt caching

**Why**

Distillation generates responses from a strong teacher on your task, then fine-tunes a small model on those responses. You get much of the teacher's task-specific quality at the small model's cost and latency — the classic answer when a scenario demands "frontier quality at high volume within budget".

| Option | Why this option |
| --- | --- |
| A | Teaches a new domain from large unlabelled corpora. |
| B ✓ | Correct. |
| C | Supplies facts; does not shrink the model. |
| D | A cost feature, not customisation. |

*See: Domain 2 → Model customisation*

---

### d2-015 *(hard)*

A fine-tuned Claude model has been created in Bedrock. How is it served in production?

- [ ] **A.** On-demand, like a base model, with no further configuration
- [x] **B.** Through Provisioned Throughput purchased for that custom model
- [ ] **C.** Only through batch inference
- [ ] **D.** By exporting the weights to SageMaker

**Why**

Custom models do not sit in the shared on-demand pool. You buy Provisioned Throughput for them, which is a real commitment and a real cost — one of the strongest practical arguments for exhausting prompting and RAG before reaching for fine-tuning.

| Option | Why this option |
| --- | --- |
| A | Custom models are not served on demand in the same way base models are. |
| B ✓ | Correct. |
| C | Not the mechanism. |
| D | Provider weights are not exportable. |

*See: Domain 2 → Serving custom models*

---

### d2-016

What does Custom Model Import allow?

- [x] **A.** Importing your own weights for supported open model architectures and serving them through the Bedrock API
- [ ] **B.** Importing prompts from another account
- [ ] **C.** Importing a knowledge base
- [ ] **D.** Importing CloudWatch dashboards

**Why**

If you have fine-tuned a supported open architecture elsewhere, Custom Model Import lets you bring those weights into Bedrock and invoke them through the same API surface, rather than standing up your own inference infrastructure.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | That is prompt management. |
| C | No. |
| D | No. |

*See: Domain 2 → Custom Model Import*

---

### d2-017

Which two are appropriate uses of Amazon Bedrock Prompt Management? (Choose 2.)

- [x] **A.** Versioning prompts independently of application deployments
- [x] **B.** Letting non-engineers iterate on prompt text with review before promotion
- [ ] **C.** Storing customer PII
- [ ] **D.** Replacing IAM permissions on models

**Why**

Treating prompts as versioned artifacts decoupled from code is a maturity marker: a prompt fix ships without a deployment, and a bad prompt rolls back without one either. It also gives non-engineers a safe place to work.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Never store PII in prompt templates. |
| D | Unrelated. |

*See: Domain 2 → Prompt Management*

---

### d2-018

An agent repeatedly calls the same tool with the same arguments and never terminates. What are the two most likely causes? (Choose 2.)

- [x] **A.** The tool returns an error or an empty result the model cannot interpret as progress
- [x] **B.** The tool description is ambiguous or overlaps with another tool
- [ ] **C.** The context window is too large
- [ ] **D.** The temperature is set to 0

**Why**

Loops come from the model not perceiving progress. Either the tool result is unusable (an opaque error, an empty body) or the model cannot tell which tool it should have used. Fix the descriptions, return structured and actionable errors, and bound the iterations — then read the agent trace, which shows the reasoning at each step.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Large windows do not cause loops. |
| D | Determinism does not cause loops. |

*See: Domain 2 → Agent troubleshooting*

---

### d2-019

Which two are genuine advantages of the Strands Agents SDK? (Choose 2.)

- [x] **A.** A model-driven agent loop you define in code, with tools as plain functions
- [x] **B.** It can be deployed to AgentCore Runtime or to your own compute
- [ ] **C.** It requires no foundation model
- [ ] **D.** It is only usable with Amazon Titan

**Why**

Strands is an open-source, code-first agent framework: define tools as decorated functions, let the model drive the loop, and deploy wherever you like — including AgentCore Runtime, which is deliberately framework-agnostic.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | It drives a model. |
| D | Model-agnostic. |

*See: Domain 2 → Agent frameworks*

---

### d2-020

A batch of 200,000 support tickets must be classified overnight at the lowest possible cost. Which approach?

- [ ] **A.** Real-time on-demand invocation in a loop with concurrency limits
- [x] **B.** Bedrock batch inference with a JSONL manifest in S3
- [ ] **C.** Provisioned Throughput for 24 hours
- [ ] **D.** A Bedrock Agent per ticket

**Why**

Overnight, bulk, no interactivity — the batch signal. Write a JSONL file of records to S3, submit the job, collect results from S3. Roughly half the on-demand price on supported models, and no throttling to manage.

| Option | Why this option |
| --- | --- |
| A | Costs double and you fight quotas all night. |
| B ✓ | Correct. |
| C | Pays for a full month of capacity to use one night of it. |
| D | Enormous overhead for a classification task. |

*See: Domain 2 → Batch inference*

---

### d2-021

What is the practical purpose of `stopSequences`?

- [ ] **A.** To stop the model from being toxic
- [x] **B.** To end generation as soon as a specified string appears, which controls format and saves output tokens
- [ ] **C.** To pause the agent loop
- [ ] **D.** To stop billing

**Why**

A stop sequence terminates generation the moment it appears — useful when you want a single JSON object and not the model's subsequent commentary. Because output tokens dominate cost, it is a small but real optimisation as well as a format control.

| Option | Why this option |
| --- | --- |
| A | That is a guardrail. |
| B ✓ | Correct. |
| C | No. |
| D | It reduces output tokens, which reduces cost — but it is not a billing switch. |

*See: Domain 2 → Inference parameters*

---

### d2-022 *(hard)*

A synchronous API backed by Lambda calls a foundation model. Long generations occasionally exceed the API Gateway 29-second integration timeout. Which two are valid remediations? (Choose 2.)

- [x] **A.** Switch to a streaming pattern so the client receives tokens as they are produced
- [x] **B.** Make the operation asynchronous: accept the request, return a job ID, and deliver the result via polling, WebSocket or EventBridge
- [ ] **C.** Increase the Lambda memory to 10 GB
- [ ] **D.** Raise the model temperature

**Why**

You cannot make a long generation short, so you change the interaction model. Streaming keeps a connection producing output continuously; async decouples the request from the completion entirely. Both are standard, and the choice depends on whether a human is waiting.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Does not change model generation time. |
| D | Irrelevant. |

*See: Domain 2 → Integration patterns*

---

### d2-023

Which statement about Bedrock Agents action groups is correct?

- [ ] **A.** They are defined only in natural language
- [x] **B.** They are defined with an OpenAPI schema or a function-detail definition, and backed by Lambda or Return of Control
- [ ] **C.** They can only call AWS services
- [ ] **D.** They require a knowledge base

**Why**

An action group is a set of callable operations. You define them with an OpenAPI schema or the simpler function-detail format, and back them either with a Lambda or with Return of Control. Nothing restricts them to AWS services.

| Option | Why this option |
| --- | --- |
| A | A schema is required so the model knows the parameters. |
| B ✓ | Correct. |
| C | They can call anything the backing implementation can reach. |
| D | Independent features. |

*See: Domain 2 → Action groups*

---

### d2-024

Which two prompt techniques most reliably improve accuracy on multi-step reasoning tasks? (Choose 2.)

- [x] **A.** Chain-of-thought — instructing the model to reason step by step before answering
- [x] **B.** Few-shot examples that demonstrate the reasoning pattern
- [ ] **C.** Raising temperature to 1.5
- [ ] **D.** Removing the system prompt

**Why**

Explicit stepwise reasoning and worked examples both help substantially on multi-hop and arithmetic problems. Both cost output tokens and latency, so apply them where the task is genuinely hard rather than to every request.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Adds noise. |
| D | Removes the instructions doing the work. |

*See: Domain 2 → Prompt engineering*

---

### d2-025

What is ReAct in the context of agents?

- [ ] **A.** A JavaScript framework for the chat UI
- [x] **B.** An interleaved reason-then-act loop where the model alternates between thinking and calling tools, using observations to inform the next step
- [ ] **C.** A Bedrock API operation
- [ ] **D.** A guardrail policy type

**Why**

ReAct — Reason + Act — is the loop underneath most tool-using agents: think, choose a tool, observe the result, think again. Bedrock Agents implement this pattern for you and expose the reasoning in the trace.

| Option | Why this option |
| --- | --- |
| A | Different React entirely. |
| B ✓ | Correct. |
| C | Not an API. |
| D | Not a guardrail. |

*See: Domain 2 → Agent patterns*

---

### d2-026

An agent must run untrusted Python generated by the model to analyse an uploaded CSV. What is the safe managed option?

- [ ] **A.** Run it in the Lambda that backs the action group
- [x] **B.** AgentCore Code Interpreter (or the Bedrock Agents code interpreter), which executes in an isolated sandbox
- [ ] **C.** Run it on an EC2 instance with an admin role
- [ ] **D.** Ask the model to simulate the result instead

**Why**

Model-generated code is untrusted input. Managed code interpreters run it in an isolated sandbox with no path back into your account. Running it inside your own execution environment hands an attacker your Lambda's IAM role.

| Option | Why this option |
| --- | --- |
| A | Executing model-generated code with your function's permissions is a serious vulnerability. |
| B ✓ | Correct. |
| C | Worse — and an admin role makes it catastrophic. |
| D | Simulated arithmetic is exactly what you should not trust. |

*See: Domain 2 → Code interpreter*

---

### d2-027

Which two are true of Amazon Bedrock Intelligent Prompt Routing? (Choose 2.)

- [x] **A.** It routes each request to a smaller or larger model in a family based on predicted complexity
- [x] **B.** It aims to cut cost while holding quality close to the larger model
- [ ] **C.** It rewrites the user prompt to be shorter
- [ ] **D.** It caches responses

**Why**

It is managed complexity-based routing within a model family: easy requests go to the cheap model, hard ones to the strong model, with the goal of most of the savings and little of the quality loss. It does not rewrite prompts and it does not cache.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | It does not. |
| D | That is caching, a separate feature. |

*See: Domain 2 → Prompt routing*

---

### d2-028

You need structured JSON output that always conforms to a schema. What is the most reliable approach?

- [ ] **A.** Ask nicely in the prompt and parse whatever comes back
- [x] **B.** Define a tool/function schema and have the model call it, or use the API's structured output support, then validate against the schema
- [ ] **C.** Set temperature to 2.0
- [ ] **D.** Use a stop sequence of `}`

**Why**

Schema-constrained tool use is far more reliable than prose instructions, and you still validate the result before trusting it. Belt and braces: constrain generation, then verify.

| Option | Why this option |
| --- | --- |
| A | Works most of the time, which is the problem. |
| B ✓ | Correct. |
| C | Makes it worse. |
| D | Would truncate at the first nested object. |

*See: Domain 2 → Structured output*

---

### d2-029

Which service best decouples a spiky front end from Bedrock invocations that must not be dropped?

- [x] **A.** Amazon SQS between the API and the worker that calls Bedrock
- [ ] **B.** Increasing the Lambda timeout
- [ ] **C.** Amazon CloudFront
- [ ] **D.** AWS WAF

**Why**

A queue absorbs bursts, provides retries and a dead-letter queue, and lets the worker consume at a rate that respects Bedrock quotas. This is the standard answer whenever a scenario pairs "spiky traffic" with "must not lose requests".

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Does not address bursts or loss. |
| C | A CDN. |
| D | A web firewall. |

*See: Domain 2 → Integration patterns*

---

### d2-030 *(hard)*

A Bedrock Agent gives inconsistent results: sometimes it calls the `get_order_status` tool, sometimes it answers from memory with invented data. What are the two best fixes? (Choose 2.)

- [x] **A.** Sharpen the agent instructions to state that order status must always be obtained from the tool and never inferred
- [x] **B.** Improve the tool description so its purpose and required parameters are unambiguous
- [ ] **C.** Increase maxTokens
- [ ] **D.** Add more collaborator agents

**Why**

Tool selection is driven entirely by text: the agent instruction and the tool description. When a model answers from parametric knowledge instead of calling the tool, you have not told it forcefully enough that the tool is the only acceptable source.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Output length is unrelated. |
| D | Adds complexity without addressing the cause. |

*See: Domain 2 → Agent reliability*

---

### d2-031

Which two AWS options let you run an open-weight model that Bedrock does not offer? (Choose 2.)

- [x] **A.** Amazon SageMaker AI real-time endpoints
- [x] **B.** Bedrock Custom Model Import for supported architectures
- [ ] **C.** Amazon Q Business
- [ ] **D.** AWS Glue

**Why**

SageMaker gives you full control over hosting any model you can containerise. Custom Model Import brings supported open architectures into the Bedrock API. Choose SageMaker for maximum flexibility, Custom Model Import to keep one API surface.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | A finished application. |
| D | ETL. |

*See: Domain 2 → Hosting options*

---

### d2-032

What does `stopReason` in a Converse response tell you?

- [x] **A.** Why generation ended — for example `end_turn`, `max_tokens`, `stop_sequence`, or `tool_use`
- [ ] **B.** Why the request was throttled
- [ ] **C.** Why the guardrail intervened
- [ ] **D.** The cost of the request

**Why**

It is the first thing to check when output looks truncated: `max_tokens` means you clipped it, `stop_sequence` means your own stop string fired, `end_turn` means the model finished naturally, and `tool_use` means it is waiting on you to run a tool.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Throttling raises an exception. |
| C | Guardrail intervention is reported separately. |
| D | Usage tokens are reported separately. |

*See: Domain 2 → Response handling*

---

### d2-033

A workflow must fan out one document to five different prompts and combine the results. Which two implementations are reasonable? (Choose 2.)

- [x] **A.** Step Functions Map state invoking the model in parallel
- [x] **B.** Bedrock Flows with parallel nodes
- [ ] **C.** A single prompt asking the model to do all five things at once with no structure
- [ ] **D.** Five sequential Lambda invocations chained by S3 events

**Why**

Parallel fan-out with an explicit join is a workflow problem, and both Step Functions Map and Bedrock Flows model it natively. Sequential chaining through S3 events is slow and fragile; one giant unstructured prompt gives you no per-task control or retry.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Loses per-task control, retries and evaluation. |
| D | Serialises what should be parallel and hides failures. |

*See: Domain 2 → Orchestration*

---

### d2-034

Which statement about agent session state is correct?

- [ ] **A.** It is automatically shared between all users
- [x] **B.** Session attributes and prompt session attributes let you pass context into an agent invocation for the life of a session
- [ ] **C.** It is stored in the model weights
- [ ] **D.** It cannot be modified by the application

**Why**

Session state is how you inject caller context — user ID, entitlements, locale — without putting it in the user's message. Prompt session attributes additionally make values available inside the orchestration prompt template.

| Option | Why this option |
| --- | --- |
| A | That would be a serious data leak. |
| B ✓ | Correct. |
| C | No. |
| D | The application sets it. |

*See: Domain 2 → Agent session state*

---

### d2-035

A team wants to give an agent the ability to browse a web application that has no API, filling forms and reading results. Which capability fits?

- [x] **A.** AgentCore Browser
- [ ] **B.** Knowledge base web crawler
- [ ] **C.** Bedrock Flows
- [ ] **D.** SageMaker Processing

**Why**

AgentCore Browser provides a managed headless browser runtime for interactive navigation. The knowledge base web crawler is for bulk ingestion of page content into an index — it does not fill in forms or drive a session.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Ingestion, not interaction. |
| C | Orchestration. |
| D | Batch data processing. |

*See: Domain 2 → AgentCore Browser*

---

### d2-036

Which two facts about Lambda matter when it backs a generative AI workload? (Choose 2.)

- [x] **A.** A 15-minute maximum execution duration
- [x] **B.** Response streaming is available via function URLs and supported integrations
- [ ] **C.** Lambda can hold a WebSocket connection open indefinitely
- [ ] **D.** Lambda has no concurrency limits

**Why**

The 15-minute ceiling is what pushes genuinely long agent runs onto AgentCore Runtime, ECS or Step Functions. Response streaming is what makes Lambda viable for token-by-token UX without API Gateway WebSockets.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | API Gateway manages the WebSocket; Lambda handles discrete messages. |
| D | Account and function concurrency limits very much exist. |

*See: Domain 2 → Compute choices*

---

### d2-037 *(hard)*

An enterprise wants one agent that can answer HR questions, raise IT tickets and query financial reports, each governed by different data access rules. Which design is strongest?

- [ ] **A.** A single agent with all tools and knowledge bases attached and a long instruction explaining the rules
- [x] **B.** A supervisor agent routing to three collaborator agents, each with its own tools, knowledge base and IAM role
- [ ] **C.** Three separate chat applications
- [ ] **D.** One agent with a very large context window

**Why**

Different access rules mean different execution identities. Collaborator agents let each domain carry its own role, its own tools and its own knowledge base, so authorisation is enforced by IAM rather than by an instruction the model may ignore or an injection may override.

| Option | Why this option |
| --- | --- |
| A | Access control by prompt instruction is not access control. |
| B ✓ | Correct. |
| C | Poor user experience, and the routing problem does not disappear. |
| D | Window size has nothing to do with authorisation. |

*See: Domain 2 → Multi-agent design*

---

### d2-038

What is the effect of setting `maxTokens` too low for a task?

- [ ] **A.** The model refuses the request
- [x] **B.** Output is truncated mid-sentence with `stopReason = max_tokens`
- [ ] **C.** The model automatically continues in a second call
- [ ] **D.** Input is truncated instead

**Why**

Generation simply stops at the limit. Users see a sentence cut off mid-word; the API tells you exactly why in `stopReason`. Continuation is something your application must implement if you want it.

| Option | Why this option |
| --- | --- |
| A | No refusal. |
| B ✓ | Correct. |
| C | Not automatic. |
| D | Input is untouched. |

*See: Domain 2 → Inference parameters*

---

### d2-039

Which two are valid ways to reduce agent latency? (Choose 2.)

- [x] **A.** Reduce the number of tools so the model has a smaller decision space and a shorter prompt
- [x] **B.** Use a faster model for the orchestration step
- [ ] **C.** Add more collaborator agents
- [ ] **D.** Increase top-k retrieval

**Why**

Every tool definition is prompt tokens and another candidate to weigh. Trimming the tool list shortens the prompt and simplifies the decision; a faster orchestration model cuts the per-hop cost of the loop. The other two options add work.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | More agents means more round trips. |
| D | More retrieval means more tokens and more time. |

*See: Domain 2 → Agent performance*

---

### d2-040

What does AgentCore Observability provide?

- [x] **A.** Built-in metrics and traces for agent runtime, memory, gateway, tools and identity resources
- [ ] **B.** A visual prompt editor
- [ ] **C.** Automatic guardrails
- [ ] **D.** Cheaper inference

**Why**

Agents are distributed systems with a non-deterministic controller, so you cannot debug them without traces. AgentCore Observability emits metrics and traces across the AgentCore resource types, and integrates with CloudWatch and OpenTelemetry-based tooling.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | That is Prompt Management / Flows. |
| C | Guardrails are separate. |
| D | Not a pricing feature. |

*See: Domain 2 → Observability*

---

### d2-041

Which two statements about fine-tuning on Bedrock are correct? (Choose 2.)

- [x] **A.** It requires a labelled dataset of prompt/completion pairs in the expected format, staged in S3
- [x] **B.** The resulting custom model is private to your account
- [ ] **C.** It updates the base model for all Bedrock customers
- [ ] **D.** It eliminates the need for prompt engineering

**Why**

You supply the data, Bedrock trains a private copy, and nobody else ever sees it. Prompting still matters afterwards — fine-tuning shifts the default behaviour, it does not make instructions unnecessary.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Absolutely not. |
| D | Prompts still drive each request. |

*See: Domain 2 → Fine-tuning*

---

### d2-042

A developer wants an IDE-integrated assistant to help write and refactor the application code for this project. Which AWS offering is aimed at that?

- [x] **A.** Amazon Q Developer
- [ ] **B.** Amazon Bedrock Agents
- [ ] **C.** Amazon Q Business
- [ ] **D.** AWS CodePipeline

**Why**

Q Developer is the developer-facing coding assistant in the IDE and CLI. Q Business is the enterprise knowledge assistant for end users. Do not confuse the two — the exam does test the distinction.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | A runtime building block, not a coding assistant. |
| C | For enterprise knowledge, not code. |
| D | CI/CD. |

*See: Domain 2 → Developer tooling*

---

### d2-043

Which two are advantages of defining infrastructure for a Bedrock application with AWS CDK or CloudFormation? (Choose 2.)

- [x] **A.** Knowledge bases, agents, guardrails and their IAM roles are reproducible across environments
- [x] **B.** Changes are reviewable and revertible in version control
- [ ] **C.** It reduces token costs
- [ ] **D.** It removes the need for evaluation

**Why**

Everything in this stack is a resource with configuration that materially changes behaviour — chunking strategy, guardrail thresholds, agent instructions. Managing that by hand in a console guarantees drift between dev and prod.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | No effect on tokens. |
| D | Evaluation is still required. |

*See: Domain 2 → Infrastructure as code*

---

### d2-044

An application must call a foundation model from inside a private subnet with no internet gateway. What is required?

- [ ] **A.** A NAT gateway is the only option
- [x] **B.** An interface VPC endpoint (AWS PrivateLink) for Bedrock
- [ ] **C.** A public IP on the Lambda
- [ ] **D.** Bedrock cannot be reached privately

**Why**

PrivateLink keeps Bedrock traffic on the AWS network with no internet path, and the endpoint policy gives you an additional enforcement point for which models may be called from that VPC. NAT would work but sends traffic out to the internet, which is usually what the requirement forbids.

| Option | Why this option |
| --- | --- |
| A | NAT routes via the internet — normally the thing being prohibited. |
| B ✓ | Correct. |
| C | Not how Lambda VPC networking works. |
| D | It can. |

*See: Domain 2 → Private connectivity*

---

### d2-045 *(hard)*

Which two design choices best support gradual, reversible rollout of a new model version in production? (Choose 2.)

- [x] **A.** Read the model identifier from AWS AppConfig with a deployment strategy and a CloudWatch alarm rollback
- [x] **B.** Route a percentage of traffic to the new model and compare quality and latency metrics before increasing it
- [ ] **C.** Deploy to all users at once and monitor
- [ ] **D.** Hard-code the new model and redeploy

**Why**

Treat a model change like any other risky change: externalise the choice, ramp gradually, watch the metrics, and have an automatic rollback. AppConfig gives you the ramp and the alarm-triggered rollback for free.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | No blast-radius control. |
| D | Slow to revert and invisible to operators. |

*See: Domain 2 → Safe deployment*

---

### d2-046

What is the purpose of the agent "trace" returned by Bedrock Agents?

- [x] **A.** It records the model's reasoning, tool selections, tool inputs/outputs and knowledge base lookups for each step
- [ ] **B.** It records billing information
- [ ] **C.** It is the CloudTrail event
- [ ] **D.** It is the guardrail policy

**Why**

The trace is the primary debugging artifact for agents. When an agent loops, picks the wrong tool or invents data, the trace tells you at which step it went wrong and what it was thinking — the alternative is guesswork.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Billing is elsewhere. |
| C | CloudTrail records the API call. |
| D | No. |

*See: Domain 2 → Agent debugging*

---

### d2-047

Which two message roles exist in a Converse conversation? (Choose 2.)

- [x] **A.** user
- [x] **B.** assistant
- [ ] **C.** system
- [ ] **D.** tool

**Why**

The `messages` array alternates `user` and `assistant`. System instructions go in a separate top-level `system` field rather than as a message, and tool results are carried inside user message content blocks.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Real, but it is a separate top-level field, not a message role in the array. |
| D | Tool results ride inside message content blocks. |

*See: Domain 2 → Converse API*

---

### d2-048

A generative feature must be exposed to a mobile app with per-user authentication and rate limiting. Which combination is most appropriate?

- [x] **A.** API Gateway with a Cognito authorizer and usage plans, fronting Lambda that calls Bedrock
- [ ] **B.** Direct Bedrock credentials embedded in the mobile app
- [ ] **C.** A public Lambda function URL with no auth
- [ ] **D.** S3 static hosting

**Why**

Never put AWS credentials in a client. API Gateway supplies authentication, throttling and usage plans; Lambda holds the IAM role that may invoke Bedrock; the app holds only a user token.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Credentials in a distributed binary are compromised credentials. |
| C | Unauthenticated access to a paid model API. |
| D | Cannot call Bedrock. |

*See: Domain 2 → Application integration*

---

### d2-049

What distinguishes `InvokeModelWithResponseStream` from `InvokeModel`?

- [x] **A.** It returns the response incrementally as chunks rather than as a single complete body
- [ ] **B.** It is cheaper
- [ ] **C.** It supports more models
- [ ] **D.** It applies guardrails automatically

**Why**

Streaming changes delivery, not price or capability. Total tokens billed are the same; what changes is that time-to-first-token becomes visible to the user instead of them staring at a spinner.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Same token pricing. |
| C | Support is model-dependent either way. |
| D | Guardrails are configured explicitly. |

*See: Domain 2 → Streaming*

---

### d2-050

Which two are reasonable ways to handle a `ThrottlingException` from Bedrock? (Choose 2.)

- [x] **A.** Retry with exponential backoff and jitter
- [x] **B.** Spread load using a cross-region inference profile
- [ ] **C.** Immediately retry in a tight loop
- [ ] **D.** Increase maxTokens

**Why**

Backoff with jitter is the baseline and is built into the AWS SDK retry configuration. Cross-region inference profiles then widen the capacity pool. Beyond that: request a quota increase, or buy Provisioned Throughput for sustained load.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Makes congestion worse. |
| D | Unrelated, and larger outputs consume more capacity. |

*See: Domain 2 → Quotas and resilience*

---

### d2-051

An agent needs read-only access to a DynamoDB table through a Lambda action group. What is the correct permission model?

- [x] **A.** Give the Lambda execution role a scoped read-only policy on that table only
- [ ] **B.** Give the Bedrock service role administrator access
- [ ] **C.** Embed AWS keys in the Lambda environment variables
- [ ] **D.** Give the agent an IAM user

**Why**

Least privilege applied to the executing identity. The Lambda's execution role gets exactly `dynamodb:GetItem`/`Query` on that one table ARN — nothing broader, no static keys, no IAM users.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B | Wildly over-permissioned. |
| C | Static credentials in environment variables is a classic finding. |
| D | Agents are not IAM users. |

*See: Domain 2 → Agent permissions*

---

### d2-052

Which two are true about Amazon Bedrock Guardrails in relation to agents? (Choose 2.)

- [x] **A.** A guardrail can be associated with an agent so all its model interactions are screened
- [x] **B.** The ApplyGuardrail API can screen arbitrary text outside a model call
- [ ] **C.** Guardrails replace IAM authorisation
- [ ] **D.** Guardrails prevent all hallucinations

**Why**

Guardrails attach to agents, and `ApplyGuardrail` lets you run the same policy against text that never touches Bedrock — a self-hosted model, a third-party API, user-generated content. They reduce hallucination risk via contextual grounding; they do not eliminate it, and they are not an authorisation mechanism.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Different layer entirely. |
| D | Nothing prevents all hallucinations. |

*See: Domain 2 → Guardrails and agents*

---

### d2-053

A workflow requires human approval before an agent executes a refund. What is the cleanest pattern?

- [ ] **A.** Trust the model to ask for confirmation in the chat
- [x] **B.** Use Return of Control (or a Step Functions callback with a task token) so the action is executed only after explicit approval
- [ ] **C.** Set temperature to 0
- [ ] **D.** Add the approval rule to the system prompt

**Why**

A human-in-the-loop gate must be enforced outside the model. Return of Control hands the intent back for your application to approve and execute; Step Functions `waitForTaskToken` pauses the workflow until an approval callback arrives. Both make the gate structural rather than advisory.

| Option | Why this option |
| --- | --- |
| A | A prompt instruction is not an approval gate. |
| B ✓ | Correct. |
| C | Determinism is not authorisation. |
| D | Same flaw as option A. |

*See: Domain 2 → Human in the loop*

---

### d2-054

Which is the best description of Amazon Nova model variants Micro, Lite, Pro and Premier?

- [ ] **A.** Different modalities
- [x] **B.** A capability and cost ladder within one family, from fastest and cheapest to most capable
- [ ] **C.** Different regions
- [ ] **D.** Different context windows only

**Why**

It is a tiering ladder — the same pattern as Haiku / Sonnet / Opus. Knowing the ladder exists is what lets you answer routing and cost questions: start at the bottom, escalate only when quality demands it.

| Option | Why this option |
| --- | --- |
| A | Nova Canvas and Nova Reel are the separate image/video models. |
| B ✓ | Correct. |
| C | Not a regional distinction. |
| D | Capability differs too. |

*See: Domain 2 → Model families*

---

### d2-055 *(hard)*

A latency-sensitive assistant must respond in under 800 ms at p95, while still retrieving from a knowledge base. Which three-part change gives the best chance of hitting it? (Choose 2.)

- [x] **A.** Use a small, latency-optimised model and stream the response
- [x] **B.** Reduce retrieved context via reranking and a lower top-k, and enable prompt caching on the stable prefix
- [ ] **C.** Add a supervisor agent with three collaborators
- [ ] **D.** Increase maxTokens to 8000

**Why**

Latency is driven by model size, input length and output length. A small fast model plus streaming attacks the first and makes the rest feel faster; fewer, better-ranked chunks plus a cached prefix attacks the second. Multi-agent orchestration and huge output limits move you in the wrong direction.

| Option | Why this option |
| --- | --- |
| A ✓ | Correct. |
| B ✓ | Correct. |
| C | Adds round trips. |
| D | More output tokens means more time. |

*See: Domain 2 → Latency optimisation*

---
