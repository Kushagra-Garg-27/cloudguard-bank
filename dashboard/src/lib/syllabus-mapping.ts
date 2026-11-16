import { CourseUnit, LabAssignment } from '../types/cloud';

export const COURSE_UNITS: CourseUnit[] = [
  {
    id: 1,
    unitCode: 'UNIT-01',
    title: 'Linux Operating System, Process Management & Automation',
    curriculumFocus: 'POSIX shell scripting, file descriptors, CPU/Memory telemetry, process scheduling via cron, and daemon management via systemd.',
    implementedModule: 'Linux Health Watchdog & Ingestion Daemon',
    fileReference: 'scripts/linux-health-cron.sh',
    vivaTalkingPoints: [
      'Implemented arithmetic evaluation using $(( ... )) to compute exact memory utilization percentages directly from /proc/meminfo without subshell overhead.',
      'Configured automated log rotation with gzip compression when /var/log/cloudguard-health.log crosses the 10MB threshold.',
      'Structured cron schedule (*/5 * * * *) to sample system states and push custom CloudWatch metrics using the AWS CLI.'
    ]
  },
  {
    id: 2,
    unitCode: 'UNIT-02',
    title: 'Cloud Networking, VPC Architecture & Tier Isolation',
    curriculumFocus: 'Virtual Private Cloud (VPC), Classless Inter-Domain Routing (CIDR), Public/Private subnets, Route Tables, NAT Gateways, Security Groups, and VPC Peering.',
    implementedModule: 'CloudGuard VPC 3-Tier Network Isolation',
    fileReference: 'infra/cloudformation-template.yaml (Lines 44-180)',
    vivaTalkingPoints: [
      'Enforced defense-in-depth: ALB resides in Public Subnets (10.0.1.0/24), EC2 Ingestion in Private Subnets (10.0.10.0/24), and RDS in Private Data Subnets (10.0.20.0/24).',
      'Security groups are chained by ID rather than IP: RDS-SG strictly permits inbound TCP 5432 only from EC2-SG and Lambda-SG, rendering the database inaccessible to the public internet.',
      'Implemented inter-region VPC Peering to ap-southeast-1 with bilateral route table entries for disaster recovery.'
    ]
  },
  {
    id: 3,
    unitCode: 'UNIT-03',
    title: 'Compute, High Availability, Load Balancing & Decoupled Messaging',
    curriculumFocus: 'Amazon EC2, Auto Scaling Groups (ASG), Application Load Balancers (ALB), Amazon SQS, Dead Letter Queues (DLQ), and AWS Lambda serverless execution.',
    implementedModule: 'Event-Driven Asynchronous Buffer Pipeline',
    fileReference: 'aws-backend/ec2-ingestion-api/server.js',
    vivaTalkingPoints: [
      'Decoupled ingestion from settlement: The EC2 Express API accepts transfers in <15ms, sends them to SQS, and returns HTTP 202 Accepted, shielding the database from traffic spikes.',
      'Configured SQS Redrive Policy: Messages failing Lambda execution 3 times are quarantined in TransactionDLQ, preventing poison pills from blocking the processing pipeline.',
      'Auto Scaling Group adjusts instance count (Min: 2, Max: 4) based on CloudWatch average CPU utilization.'
    ]
  },
  {
    id: 4,
    unitCode: 'UNIT-04',
    title: 'Cloud Security, Identity (IAM) & Cryptographic Compliance',
    curriculumFocus: 'AWS Identity and Access Management (IAM), Least Privilege access, AWS Key Management Service (KMS), Envelope Encryption, and PCI-DSS / GDPR compliance.',
    implementedModule: 'KMS AES-256 Envelope Encryption & Scoped IAM Policies',
    fileReference: 'infra/iam-least-privilege-policy.json',
    vivaTalkingPoints: [
      'Customer credit card numbers and PANs never touch disks in plaintext; Lambda invokes kms:Encrypt using a Customer Managed Key (CMK) with annual rotation enabled.',
      'IAM policies explicitly enforce TLS in transit via condition "aws:SecureTransport": "false" -> Deny.',
      'Zero wildcard permissions on data resources: Lambda execution role is scoped down to exact SQS, KMS, and DynamoDB ARNs.'
    ]
  },
  {
    id: 5,
    unitCode: 'UNIT-05',
    title: 'Polyglot Cloud Storage & Database Consistency Models',
    curriculumFocus: 'Relational ACID vs. NoSQL BASE, Amazon RDS PostgreSQL (Strong Consistency) vs. Amazon DynamoDB (Eventual Consistency), S3 lifecycle rules and Cross-Region Replication.',
    implementedModule: 'Dual-Store Financial Ledger & Audit Trail',
    fileReference: 'aws-backend/lambda-fraud-worker/handler.py',
    vivaTalkingPoints: [
      'Financial ledgers require strict ACID guarantees: RDS PostgreSQL executes double-entry debit/credit using serializable transaction locks.',
      'High-throughput compliance telemetry uses Amazon DynamoDB (PAY_PER_REQUEST billing) for sub-10ms writes and eventual consistency.',
      'S3 bucket enforces KMS encryption, object versioning, 90-day transition to Glacier Instant Retrieval, and CRR to Singapore.'
    ]
  },
  {
    id: 6,
    unitCode: 'UNIT-06',
    title: 'Cloud Monitoring, Auditing, Chaos Resilience & FinOps',
    curriculumFocus: 'Amazon CloudWatch metrics, alarms, AWS CloudTrail immutable audit logs, fault tolerance, chaos self-healing, and cost optimization strategies.',
    implementedModule: 'CloudWatch Telemetry & FinOps Cost Engine',
    fileReference: 'dashboard/src/components/ChaosAndFinOpsPanel.tsx',
    vivaTalkingPoints: [
      'CloudWatch DLQ Depth Alarm triggers high-priority SNS notification when poisoned messages enter the quarantine queue.',
      'Demonstrated 71.6% FinOps cost reduction ($148/mo On-Demand down to $42/mo) by combining 1-year Reserved RDS, EC2 dynamic scaling, and pay-per-use Serverless execution.',
      'Simulated instance termination triggers ELB health-check failure and ASG auto-recovery within seconds.'
    ]
  }
];

export const LAB_ASSIGNMENTS: LabAssignment[] = [
  {
    id: 1,
    assignmentCode: 'LAB-01',
    title: 'Linux Shell Scripting & Arithmetic Telemetry',
    objective: 'Write a Bash automation script to calculate system metrics and automate log maintenance.',
    solutionSummary: 'Developed linux-health-cron.sh parsing /proc/meminfo and computing memory/disk metrics using integer math and conditional thresholds.',
    fileReference: 'scripts/linux-health-cron.sh (Lines 34-72)',
    codeSnippet: 'mem_used_kb=$(( mem_total_kb - (mem_free_kb + mem_buffers_kb + mem_cached_kb) ))\nmem_used_pct=$(( (mem_used_kb * 100) / mem_total_kb ))'
  },
  {
    id: 2,
    assignmentCode: 'LAB-02',
    title: 'Cron Job Scheduling & Process Monitoring',
    objective: 'Schedule periodic automated maintenance and health checks via Linux crontab.',
    solutionSummary: 'Configured crontab entry (*/5 * * * *) to evaluate active process states and restart failed daemons automatically.',
    fileReference: 'scripts/linux-health-cron.sh (Lines 11-16)',
    codeSnippet: '*/5 * * * * /opt/cloudguard/scripts/linux-health-cron.sh >> /var/log/cloudguard-cron.log 2>&1'
  },
  {
    id: 3,
    assignmentCode: 'LAB-03',
    title: 'AWS EC2 Instance Provisioning & UserData Hardening',
    objective: 'Automate instance bootstrapping, package installation, and kernel parameter tuning.',
    solutionSummary: 'Created ec2-bootstrap-userdata.sh to configure Node.js 20, Nginx reverse proxy, sysctl SYN flood mitigation, and systemd units.',
    fileReference: 'scripts/ec2-bootstrap-userdata.sh (Lines 41-58)',
    codeSnippet: 'cat <<EOF > /etc/sysctl.d/99-cloudguard-hardening.conf\nnet.ipv4.tcp_syncookies = 1\nnet.core.somaxconn = 65535\nEOF\nsysctl --system'
  },
  {
    id: 4,
    assignmentCode: 'LAB-04',
    title: 'Custom VPC Creation with Multi-Tier Subnetting',
    objective: 'Design a Virtual Private Cloud with dedicated public and private subnets across availability zones.',
    solutionSummary: 'Implemented CloudGuardVPC (10.0.0.0/16) in CloudFormation with dual public subnets (10.0.1.0/24, 10.0.2.0/24) and dual private subnets.',
    fileReference: 'infra/cloudformation-template.yaml (Lines 44-110)',
    codeSnippet: 'CloudGuardVPC:\n  Type: AWS::EC2::VPC\n  Properties:\n    CidrBlock: 10.0.0.0/16\n    EnableDnsSupport: true\n    EnableDnsHostnames: true'
  },
  {
    id: 5,
    assignmentCode: 'LAB-05',
    title: 'Inter-Region VPC Peering & Route Propagation',
    objective: 'Establish secure private peering between two VPCs in different AWS regions without internet gateway traversal.',
    solutionSummary: 'Wrote vpc-peering-s3-crr.sh establishing peering between ap-south-1 (Mumbai) and ap-southeast-1 (Singapore) with cross-VPC route entries.',
    fileReference: 'scripts/vpc-peering-s3-crr.sh (Lines 46-75)',
    codeSnippet: 'aws ec2 create-vpc-peering-connection \\\n  --region ap-south-1 \\\n  --vpc-id $PRIMARY_VPC_ID \\\n  --peer-vpc-id $DR_VPC_ID \\\n  --peer-region ap-southeast-1'
  },
  {
    id: 6,
    assignmentCode: 'LAB-06',
    title: 'S3 Cross-Region Replication (CRR) & Versioning',
    objective: 'Implement disaster recovery for cloud object storage with automated cross-region replication.',
    solutionSummary: 'Automated bucket versioning and IAM replication role policy to synchronize receipts between primary and DR buckets.',
    fileReference: 'scripts/vpc-peering-s3-crr.sh (Lines 80-145)',
    codeSnippet: 'aws s3api put-bucket-versioning --bucket $PRIMARY_BUCKET --versioning-configuration Status=Enabled\naws s3api put-bucket-replication --bucket $PRIMARY_BUCKET --replication-configuration file:///tmp/crr-config.json'
  },
  {
    id: 7,
    assignmentCode: 'LAB-07',
    title: 'Application Load Balancer & Target Group Health Checks',
    objective: 'Distribute incoming web traffic across redundant EC2 instances with active health polling.',
    solutionSummary: 'Configured internet-facing ALB forwarding HTTP traffic to target group on port 3000 with /health polling interval of 15 seconds.',
    fileReference: 'infra/cloudformation-template.yaml (Lines 325-365)',
    codeSnippet: 'ALBTargetGroup:\n  Type: AWS::ElasticLoadBalancingV2::TargetGroup\n  Properties:\n    Port: 3000\n    Protocol: HTTP\n    HealthCheckPath: /health'
  },
  {
    id: 8,
    assignmentCode: 'LAB-08',
    title: 'Auto Scaling Group Policies & High Availability',
    objective: 'Ensure horizontal compute scalability and automatic instance replacement upon failure.',
    solutionSummary: 'Defined EC2 ASG with min 2 and max 4 instances spanning multiple availability zones with ELB health checks.',
    fileReference: 'infra/cloudformation-template.yaml (Lines 370-410)',
    codeSnippet: 'EC2AutoScalingGroup:\n  Type: AWS::AutoScaling::AutoScalingGroup\n  Properties:\n    MinSize: "2"\n    MaxSize: "4"\n    HealthCheckType: ELB'
  },
  {
    id: 9,
    assignmentCode: 'LAB-09',
    title: 'Amazon SQS Decoupling & Dead-Letter Queue (DLQ)',
    objective: 'Decouple high-frequency ingestion from backend settlement and isolate poison-pill messages.',
    solutionSummary: 'Provisioned TransactionQueue with RedrivePolicy directing messages exceeding 3 receive counts to TransactionDLQ.',
    fileReference: 'infra/cloudformation-template.yaml (Lines 195-220)',
    codeSnippet: 'RedrivePolicy:\n  deadLetterTargetArn: !GetAtt TransactionDLQ.Arn\n  maxReceiveCount: 3'
  },
  {
    id: 10,
    assignmentCode: 'LAB-10',
    title: 'Serverless AWS Lambda Event Source Processing',
    objective: 'Deploy a serverless Python compute worker triggered automatically by SQS queue messages.',
    solutionSummary: 'Implemented handler.py consuming SQS batches, evaluating fraud scores, and invoking KMS and polyglot persistence.',
    fileReference: 'aws-backend/lambda-fraud-worker/handler.py',
    codeSnippet: 'def lambda_handler(event, context):\n    for record in event.get("Records", []):\n        txn = json.loads(record["body"])\n        fraud_score, violations = evaluate_fraud_rules(txn)'
  },
  {
    id: 11,
    assignmentCode: 'LAB-11',
    title: 'AWS KMS Envelope Encryption & Key Rotation',
    objective: 'Encrypt sensitive financial identifiers (PAN/Card) at rest using Customer Managed Keys (CMK).',
    solutionSummary: 'Configured CloudGuardKMSKey with automatic annual rotation and AES-256-GCM envelope encryption.',
    fileReference: 'aws-backend/lambda-fraud-worker/handler.py (Lines 55-80)',
    codeSnippet: 'response = kms_client.encrypt(\n    KeyId=KMS_KEY_ID,\n    Plaintext=card_token.encode("utf-8"),\n    EncryptionContext={"TransactionId": txn_id, "Compliance": "PCI-DSS-v4.0"}\n)'
  },
  {
    id: 12,
    assignmentCode: 'LAB-12',
    title: 'Amazon CloudWatch Alarms & Metric Dashboards',
    objective: 'Set up real-time alarms for operational CPU spikes and SQS DLQ message anomalies.',
    solutionSummary: 'Defined CloudWatch alarms on CPUUtilization (>80%) and ApproximateNumberOfMessagesVisible (>0) on the DLQ.',
    fileReference: 'infra/cloudformation-template.yaml (Lines 415-445)',
    codeSnippet: 'DLQDepthAlarm:\n  Type: AWS::CloudWatch::Alarm\n  Properties:\n    Namespace: AWS/SQS\n    MetricName: ApproximateNumberOfMessagesVisible\n    Threshold: 1'
  },
  {
    id: 13,
    assignmentCode: 'LAB-13',
    title: 'Polyglot Storage: Amazon RDS vs. DynamoDB',
    objective: 'Compare relational ACID transactions against NoSQL eventual consistency in an enterprise architecture.',
    solutionSummary: 'Integrated RDS PostgreSQL for double-entry financial accounting and DynamoDB for high-speed compliance audit logs.',
    fileReference: 'aws-backend/lambda-fraud-worker/handler.py (Lines 110-160)',
    codeSnippet: 'table = dynamo_resource.Table(DYNAMODB_TABLE_NAME)\ntable.put_item(Item={"transactionId": txn_id, "fraudScore": fraud_score, "ttl": ttl})'
  },
  {
    id: 14,
    assignmentCode: 'LAB-14',
    title: 'Cloud FinOps Cost Modeling & AWS Budgets',
    objective: 'Model infrastructure cost optimization comparing On-Demand vs. Reserved/Serverless tiers and set spend alerts.',
    solutionSummary: 'Implemented AWS::Budgets::Budget at $5.00 limit with 80% email trigger, and designed interactive FinOps calculator proving 71.6% savings.',
    fileReference: 'infra/cloudformation-template.yaml (Lines 450-465)',
    codeSnippet: 'MonthlyStudentBudget:\n  Type: AWS::Budgets::Budget\n  Properties:\n    Budget:\n      BudgetName: CloudGuard-Monthly-Student-Safety-Cap\n      BudgetLimit: { Amount: 5.00, Unit: USD }'
  }
];
