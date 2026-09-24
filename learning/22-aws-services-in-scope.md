---
title: AWS services in scope
source: https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-in-scope-services.html
group: Reference
---

# AWS services in scope for AIP-C01

Every AWS service and feature the official exam guide lists as **in scope**, grouped by the guide's own categories, with why it matters for a generative AI developer. The list is transcribed from the official *In-Scope AWS Services* appendix (retrieved 2026-09-25) and is non-exhaustive and subject to change — always confirm against the current guide.

> **How to read this**
>
> The exam is ~95% Amazon Bedrock and a tight ring of services around it (retrieval, orchestration, security, observability, cost). Everything else on this list is *supporting* knowledge — background you are assumed to have as a professional-level AWS developer, tested only when it appears inside a Bedrock scenario. The **Tier** column tells you where to spend time: **Core** = learn cold; **Support** = know what it does and when it wins; **Background** = recognise the name and its one-line role.

## The services that actually decide answers (learn cold)

These are the services that appear in the constraint-driven scenarios that make up most of the exam. If you know only these well, you pass the bulk of the questions.

- **Amazon Bedrock** — the centre of the exam. FM access, Converse/InvokeModel APIs, batch inference, provisioned throughput, cross-region + application inference profiles, intelligent prompt routing, prompt caching, model customisation (fine-tuning, continued pre-training, distillation, Custom Model Import).
- **Amazon Bedrock Knowledge Bases** — managed RAG: ingest, parse, chunk, embed, store, retrieve, cite. Sync is not automatic.
- **Amazon Bedrock Guardrails** — content filters, denied topics, word filters, PII, contextual grounding, Automated Reasoning checks; `ApplyGuardrail` for non-Bedrock text.
- **Amazon Bedrock AgentCore** — Runtime, Memory, Gateway, Identity, Code Interpreter, Browser, Observability for agents you build.
- **Amazon Bedrock Agents** — managed agent loop, action groups, Return of Control, memory, multi-agent collaboration.
- **Amazon Bedrock Prompt Management** and **Amazon Bedrock Prompt Flows** — versioned prompts; low-code prompt/KB/agent chaining.
- **Amazon OpenSearch Service** — default vector store; hybrid dense + BM25 search at scale.
- **Amazon Aurora (pgvector)** and **Amazon RDS** — vectors beside relational data; moderate scale.
- **AWS Lambda** — API backends, action-group tools, custom chunking. 15-minute ceiling.
- **Amazon API Gateway** and **AWS AppSync** — front doors; streaming, throttling, WebSocket/subscriptions; ~29s REST timeout.
- **AWS Step Functions** — deterministic orchestration, retries, human-in-the-loop via task tokens (Standard vs Express).
- **Amazon SQS**, **Amazon SNS**, **Amazon EventBridge** — decoupling, fan-out, event-driven pipelines.
- **Amazon DynamoDB** (+ **DynamoDB Streams**) — conversation/session state; on-demand + KMS.
- **AWS AppConfig** — externalised model IDs and feature flags with validated rollout and automatic rollback.
- **Amazon CloudWatch** / **CloudWatch Logs** and **AWS X-Ray** — token/latency metrics, alarms, tracing, prompt/response analysis.
- **AWS CloudTrail** — API audit (who called what) — distinct from Bedrock model invocation logging (prompt/response content).
- **IAM**, **AWS KMS**, **AWS PrivateLink**, **Amazon VPC**, **AWS Secrets Manager**, **AWS WAF** — the Domain 3 enforcement layer.
- **Amazon Comprehend** and **Amazon Macie** — PII detection/redaction in text; sensitive-data discovery at rest.
- **Amazon SageMaker AI** (+ **JumpStart**, **Clarify**, **Model Registry**, **Ground Truth**) — host models Bedrock lacks, fine-tune open models, bias/fairness, versioning, human evaluation workforce.
- **Amazon Bedrock model evaluation** and **Amazon Neptune** (Analytics, GraphRAG) — quality gates and multi-hop retrieval.
- **Amazon Titan** — embeddings (Text V2 normalised, Multimodal) and Titan models.
- **Amazon Textract** and **Amazon Bedrock Data Automation** — document/multimodal extraction before ingestion.
- **Amazon Augmented AI (A2I)** — human review of low-confidence outputs in production.
- **Amazon Q Business** (+ **Q Business Apps**) and **Amazon Q Developer** — end-user enterprise assistant vs IDE/CLI coding assistant.

## Full in-scope list by category

### Analytics
| Service | Tier | Role in a GenAI workload |
| --- | --- | --- |
| Amazon OpenSearch Service | Core | Vector store; k-NN/HNSW; hybrid keyword + semantic search |
| AWS Glue (+ Glue Data Quality, Data Catalog) | Support | ETL, data-quality rules, and data-lineage/source tracking upstream of ingestion |
| Amazon Athena | Background | Query S3 data; text-to-SQL result sources |
| Amazon EMR | Background | Large-scale data processing for corpus prep |
| Amazon Kinesis | Background | Streaming ingestion for real-time indexing pipelines |
| Amazon QuickSight | Background | Dashboards/visualisation for evaluation and cost reporting |
| Amazon MSK (Managed Streaming for Apache Kafka) | Background | Event streaming backbone for enterprise integration |

*The guide also lists "Amazon Quick" under Machine Learning (likely Amazon Quick Suite, the agentic BI assistant); treat it as background.*

### Application Integration
| Service | Tier | Role |
| --- | --- | --- |
| AWS Step Functions | Core | Deterministic orchestration; ReAct/human-in-the-loop; Standard vs Express |
| Amazon EventBridge | Core | Event routing; trigger ingestion/canary pipelines |
| Amazon SQS | Core | Decouple spiky traffic from Bedrock; retries + DLQ |
| Amazon SNS | Support | Fan-out notifications |
| AWS AppConfig | Support | Feature flags / model-ID swaps without redeploy; rollback on alarm |
| Amazon AppFlow | Background | SaaS data transfer into a knowledge source |

### Compute
| Service | Tier | Role |
| --- | --- | --- |
| AWS Lambda (+ Lambda@Edge) | Core | Backends, tools, chunking; 15-min limit; response streaming |
| Amazon EC2 | Support | Self-hosted model/tool hosting when managed options do not fit |
| AWS App Runner | Background | Container app hosting for GenAI services |
| AWS Outposts | Background | On-premises data-residency integration |
| AWS Wavelength | Background | Edge deployment for low latency |

### Containers
| Service | Tier | Role |
| --- | --- | --- |
| AWS Fargate / Amazon ECS | Support | Long-running agents/MCP servers past Lambda's 15 min |
| Amazon EKS | Background | Kubernetes-based agent/tool hosting |
| Amazon ECR | Background | Container image registry for model/tool containers |

### Customer Engagement
| Service | Tier | Role |
| --- | --- | --- |
| Amazon Connect | Background | Contact-centre integration for conversational AI |

### Database
| Service | Tier | Role |
| --- | --- | --- |
| Amazon DynamoDB (+ DynamoDB Streams) | Core | Conversation/session state; change capture |
| Amazon Aurora | Core | pgvector vector store alongside relational data |
| Amazon RDS | Support | Relational store; pgvector on PostgreSQL |
| Amazon Neptune | Support | GraphRAG — entity/relationship traversal for multi-hop questions |
| Amazon ElastiCache | Support | Low-latency cache (not durable enough alone for compliance state) |
| Amazon DocumentDB | Background | Document store option for app data |

### Developer Tools
| Service | Tier | Role |
| --- | --- | --- |
| AWS Tools and SDKs / AWS CLI | Core | Boto3 etc.; exponential backoff, streaming calls |
| AWS X-Ray | Core | Distributed tracing across FM API calls |
| AWS CodePipeline / CodeBuild / CodeDeploy | Support | CI/CD for GenAI components with tests + rollback |
| AWS CloudFormation / AWS CDK | Support | Infrastructure as code for GenAI stacks |
| AWS Amplify | Support | Declarative UI / AI-kit front ends with streaming |
| AWS CodeArtifact | Background | Private package registry for approved dependencies |
| Kiro | Background | AWS agentic IDE / developer tooling |

### Machine Learning
| Service | Tier | Role |
| --- | --- | --- |
| Amazon Bedrock | Core | FM access, APIs, RAG, agents, guardrails, customisation, cost levers |
| Amazon Bedrock AgentCore | Core | Production primitives for custom agents |
| Amazon Bedrock Knowledge Bases | Core | Managed RAG |
| Amazon Bedrock Prompt Management | Core | Versioned prompt templates |
| Amazon Bedrock Prompt Flows | Core | Low-code workflow chaining |
| Amazon Comprehend | Core | PII detection/redaction, entity/intent extraction |
| Amazon Titan | Core | Embeddings (Text V2, Multimodal) and Titan models |
| Amazon Textract | Support | OCR/structured extraction from documents |
| Amazon Kendra | Support | Managed enterprise search (semantic + keyword) |
| Amazon Augmented AI (A2I) | Support | Human review of low-confidence outputs |
| Amazon SageMaker AI | Support | Host/fine-tune models Bedrock does not offer |
| Amazon SageMaker JumpStart | Support | Deploy open-source models |
| Amazon SageMaker Clarify | Support | Bias metrics, explainability, FM evaluation |
| Amazon SageMaker Ground Truth | Support | Human-labelling workforce (backs Bedrock human eval) |
| Amazon SageMaker Model Registry | Support | Version and deploy customised models |
| Amazon SageMaker Data Wrangler / Processing | Support | Data validation and preparation for FM consumption |
| Amazon Q Business (+ Q Business Apps) | Core | Enterprise knowledge assistant for end users; respects source permissions |
| Amazon Q Developer | Support | IDE/CLI coding assistant; org customisations |
| Amazon Transcribe | Support | Speech-to-text for voice pipelines |
| Amazon Lex | Background | Chatbot/intent front end |
| Amazon Rekognition | Background | Image/video analysis input to multimodal flows |
| Amazon SageMaker Model Monitor | Background | Drift/quality monitoring for hosted models |
| Amazon SageMaker Neo | Background | Model compilation/optimisation |
| Amazon SageMaker Unified Studio | Background | Unified ML/analytics workspace |

### Management and Governance
| Service | Tier | Role |
| --- | --- | --- |
| Amazon CloudWatch (+ Logs) | Core | Metrics, alarms, dashboards; log data-protection masking |
| AWS CloudTrail | Core | API audit and usage-anomaly detection |
| AWS Well-Architected Tool | Support | GenAI Lens reviews for standardised designs |
| AWS Cost Explorer | Support | In-scope spend analysis / per-profile attribution |
| AWS Cost Anomaly Detection | Support | In-scope automatic spend-spike alerts |
| Amazon Managed Grafana | Background | Observability dashboards |
| AWS CloudWatch Synthetics | Background | Synthetic canaries for endpoint health |
| AWS Systems Manager | Background | Parameter store / fleet ops |
| AWS Auto Scaling | Background | Scaling hosted endpoints/containers |
| AWS Service Catalog | Background | Governed self-service provisioning |
| AWS Chatbot | Background | ChatOps alert delivery |

*Note: **AWS Budgets**, **AWS Cost and Usage Report**, and **AWS Savings Plans** are explicitly **out of scope** — the in-scope cost tools are **Cost Explorer** and **Cost Anomaly Detection**.*

### Migration and Transfer
| Service | Tier | Role |
| --- | --- | --- |
| AWS DataSync | Background | Bulk data movement into S3 corpora |
| AWS Transfer Family | Background | Managed SFTP ingestion of source documents |

### Networking and Content Delivery
| Service | Tier | Role |
| --- | --- | --- |
| Amazon API Gateway | Core | API front door; streaming, throttling, request validation |
| AWS AppSync | Support | GraphQL + real-time subscriptions for streaming UIs |
| AWS PrivateLink | Core | Private path to Bedrock — the "no internet" answer |
| Amazon VPC | Core | Network isolation; interface endpoints |
| Amazon CloudFront | Background | Edge caching/delivery for app front ends |
| Elastic Load Balancing (ELB) | Background | Distribute traffic to hosted endpoints |
| Amazon Route 53 | Background | DNS / failover routing |
| AWS Global Accelerator | Background | Global entry-point latency/availability |

### Security, Identity, and Compliance
| Service | Tier | Role |
| --- | --- | --- |
| IAM (+ Access Analyzer, Identity Center) | Core | Who may invoke which model, where; condition keys; federation |
| AWS KMS | Core | CMKs for KBs, custom models, vectors, logs |
| AWS Secrets Manager | Core | Tool/API credentials — never in a prompt |
| AWS WAF | Support | Rate-based rules against denial-of-wallet |
| Amazon Macie | Core | Sensitive-data discovery in S3 |
| Amazon Cognito | Support | End-user auth for GenAI front ends |
| AWS Encryption SDK | Background | Client-side encryption of sensitive payloads |

### Storage
| Service | Tier | Role |
| --- | --- | --- |
| Amazon S3 (+ Lifecycle, Intelligent-Tiering, Cross-Region Replication) | Core | Source docs, batch I/O, log retention, residency |
| Amazon EFS | Background | Shared file storage for containers/training |
| Amazon EBS | Background | Block storage for EC2-hosted workloads |

## Out-of-scope services the exam deliberately uses as distractors

These are real services that solve a *different* job; they show up as wrong answers. Know why each is the trap, not the fix.

- **AWS Budgets / Cost and Usage Report / Savings Plans** — out of scope; the cost answers are Cost Explorer and Cost Anomaly Detection.
- **Amazon Redshift, Amazon Timestream, Amazon Keyspaces, Amazon QLDB** — not the vector/session stores; OpenSearch/Aurora-pgvector/DynamoDB are.
- **Amazon SES** — out of scope; not a GenAI channel here.
- **Amazon Forecast, Fraud Detector, Lookout\*, Panorama, DeepRacer/DeepComposer** — legacy/narrow ML, not generative AI.
- **AWS Batch, Elastic Beanstalk, Lightsail** — not the GenAI compute answers (Lambda, Fargate/ECS, SageMaker are).
- **AWS Transit Gateway, Direct Connect, VPN, App Mesh, Cloud Map** — networking distractors; PrivateLink/VPC endpoints answer the isolation questions.
- **Amazon MQ** — not the decoupling answer; SQS/SNS/EventBridge are.
- **AWS Cloud9, CloudShell, CodeGuru, CodeStar** — not the developer-tool answers (Q Developer, CodePipeline/Build/Deploy, Kiro are).

See the official appendices for the complete out-of-scope list: it also excludes IoT, Blockchain, Media Services, Game Development, Quantum, Robotics, Satellite, and End User Computing families entirely.
