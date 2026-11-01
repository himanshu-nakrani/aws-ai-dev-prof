# 13 — Recognition Sweep

Exam focus: services you only need to recognize in one line — what it is, and the scenario cue that makes it the answer (or reveals it as a distractor). If a service below is ever the *core* of a question, it's usually one of these cues.

## Specialized AI services (vs "just use Bedrock")

| Service | One line | Cue |
|---|---|---|
| Amazon Comprehend | NLP APIs: entities, sentiment, PII detection/redaction, custom classification | Real-time text analytics/redaction without an FM (Lesson 10) |
| Amazon Textract | OCR + forms/tables extraction from documents | "Extract fields from scanned invoices" (feeds RAG pipelines) |
| Amazon Transcribe | Speech → text | Call recordings, meeting audio → then summarize with Bedrock |
| Amazon Rekognition | Image/video analysis and content moderation | "Moderate user-uploaded images" |
| Amazon Lex | Conversational chatbots (ASR + NLU), pairs with Connect | Structured voice/chat bots with intents and slots |
| Amazon Kendra | Managed enterprise search with ranking | Traditional enterprise search; KBs are the GenAI successor for most cases |
| Amazon Q Business | Managed enterprise assistant over company data sources | "Employees ask questions across Confluence/SharePoint/Slack" with minimal build |
| Amazon Q Developer | AI coding assistant (IDE/CLI) | Developer productivity, code generation/refactoring, AWS guidance |
| Kiro | Agentic AI IDE (spec-driven development) | Recognize as AWS's AI IDE |
| Amazon Quick | Agentic business-assistant/research offering | Recognition only |
| Amazon Connect | Cloud contact center | Voice/chat support with Lex, Transcribe, and Bedrock summaries |
| Amazon Augmented AI (A2I) | Human review loops for model output | Covered in Lesson 12 |

## Analytics and data

| Service | One line | Cue |
|---|---|---|
| Amazon Athena | Serverless SQL over S3 | Ad-hoc queries over logs/data lake |
| AWS Glue | ETL + Data Catalog + data-quality checks | Prepare/catalog data; data lineage for governance |
| Amazon EMR | Managed Spark/Hadoop | Very large-scale data processing |
| Amazon Kinesis | Real-time data streaming | Streaming ingestion/analytics |
| Amazon MSK | Managed Kafka | Existing Kafka workloads |
| Amazon QuickSight | BI dashboards | Business-facing dashboards over app metrics |
| Amazon OpenSearch Service | Search/vector platform | Lesson 08 |
| Amazon Managed Grafana | Managed Grafana dashboards | Dashboards over CloudWatch/Prometheus |

## Compute and containers (where custom GenAI code runs)

| Service | One line | Cue |
|---|---|---|
| Amazon EC2 | VMs, incl. GPU instances | Self-hosted models, full OS control |
| Amazon ECS / EKS / Fargate | Container orchestration (AWS-native / Kubernetes / serverless containers) | Long-running MCP servers, custom model servers, agent runtimes (Lesson 04) |
| Amazon ECR | Container image registry | Storing agent/model container images |
| AWS App Runner | Simplest managed container web service | Small GenAI web apps/APIs without infra |
| Lambda@Edge / CloudFront Functions | Code at CDN edge | Edge personalization/auth (rarely central) |
| AWS Outposts | AWS infrastructure on-premises | Data must stay on-prem while using AWS services |
| AWS Wavelength | Telco-edge compute | Ultra-low-latency edge inference |

## Databases and storage (beyond Lessons 03/08/09)

| Service | One line | Cue |
|---|---|---|
| Amazon RDS / Aurora | Relational DBs (Aurora = Lesson 08 pgvector) | Structured app data; structured KBs (Redshift/Glue path, Lesson 03) |
| Amazon DocumentDB | MongoDB-compatible document DB | Existing MongoDB workloads |
| Amazon ElastiCache | Redis/Valkey-compatible cache | Session cache, semantic cache backing store, rate limiting (Lesson 02) |
| DynamoDB Streams | Change stream from DynamoDB | Trigger processing on state changes (Lesson 09) |
| Amazon EBS / EFS | Block / shared file storage for EC2/ECS | Model artifacts, shared files for compute |
| S3 Intelligent-Tiering / Lifecycle / Cross-Region Replication | Storage cost, retention, and DR controls | Archive logs, expire data per retention policy, replicate KB sources |

## Integration, developer tools, and delivery

| Service | One line | Cue |
|---|---|---|
| Amazon AppFlow | No-code SaaS→AWS data flows (Salesforce etc.) | Ingest SaaS data into S3 for a KB |
| AWS AppConfig | Managed configuration/feature flags | Model routing config, kill switches (Lesson 02) |
| AWS Amplify | Frontend hosting + auth/data for web/mobile | Ship the chat UI fast |
| AWS AppSync | Managed GraphQL APIs (+ real-time subscriptions) | GraphQL front door for GenAI apps |
| CloudFormation / AWS CDK | Infrastructure as code | Provision GenAI stacks repeatably; exam prefers IaC answers for scale |
| CodeBuild / CodePipeline / CodeDeploy (+ CodeArtifact) | CI/CD | Deploy prompts/agents/apps with eval quality gates (Lesson 07) |
| AWS CLI / SDKs / Tools | Programmatic access | Boto3 etc. — how everything above is automated |
| AWS X-Ray | Distributed tracing | Lesson 11 |

## Management, governance, and migration

| Service | One line | Cue |
|---|---|---|
| AWS Auto Scaling | Automatic capacity scaling | Endpoint/app scaling policies |
| AWS Systems Manager | Ops management; Parameter Store for config/secrets-adjacent values | Fleet/config operations (Secrets Manager still wins for rotatable secrets) |
| AWS Service Catalog | Curated, approved product templates | "Only approved GenAI stacks may be deployed" |
| AWS Well-Architected Tool (+ GenAI Lens) | Architecture reviews against best practice | Design-review scenarios (Domain 1) |
| AWS Chatbot | CloudWatch alarms into Slack/Teams | Alerting channel |
| AWS DataSync | Managed data movement into AWS | Migrate file corpora into S3 for ingestion |
| AWS Transfer Family | SFTP/FTP file ingestion | Partners upload documents via SFTP |
| CloudWatch Synthetics / Cost Explorer / Cost Anomaly Detection | Canaries / spend analysis / spend alerts | Lesson 11 |

## Networking front doors

| Service | One line | Cue |
|---|---|---|
| Amazon CloudFront | CDN + edge TLS/WAF | Global low-latency delivery of the GenAI app |
| Elastic Load Balancing (ALB/NLB) | Load balance ECS/EC2 backends | Fronting containerized inference/agent services |
| AWS Global Accelerator | Anycast entry for global apps | Global performance/availability front door |
| Amazon Route 53 | DNS + routing policies | Failover/latency-based routing for app endpoints |

## How to use this file in the final week

- Read the cue column only. Any cue you can't map back to a lesson = revisit that lesson.
- On the exam, these services are usually **distractors** ("sounds plausible, solves the wrong moment"). The correct answer is normally the Lesson 01–12 service whose cue matches the scenario's constraint words.

Source: https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-in-scope-services.html
