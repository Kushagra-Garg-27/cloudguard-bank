/**
 * CloudGuard Bank - Domain & Cloud Infrastructure TypeScript Interfaces
 * Course: DS3203A Cloud Computing
 */

export type ExecutionMode = 'SIMULATION' | 'AWS_SDK_LIVE';

export type TransactionStatus =
  | 'QUEUED'
  | 'EVALUATING'
  | 'COMMITTED'
  | 'FRAUD_BLOCKED'
  | 'POISON_PILL_DLQ';

export interface KMSEnvelope {
  keyArn: string;
  keyAlias: string;
  algorithm: 'SYMMETRIC_DEFAULT' | 'AES-256-GCM';
  keyRotationStatus: 'ROTATION_ENABLED' | 'PENDING';
  plaintextMasked: string;
  plaintextRaw: string;
  ciphertextBlob: string;
  encryptionContext: Record<string, string>;
  kmsLatencyMs: number;
}

export interface RDSLedgerRecord {
  journalId: string;
  transactionId: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  status: 'COMMITTED' | 'ROLLBACK';
  dbSubnet: string;
  isolationLevel: 'SERIALIZABLE' | 'REPEATABLE_READ';
  executionDurationMs: number;
  snapshotArn: string;
}

export interface DynamoDBAuditItem {
  transactionId: string;
  timestamp: number;
  senderAccount: string;
  receiverAccount: string;
  amount: number;
  currency: string;
  fraudScore: number;
  status: 'APPROVED' | 'REJECTED' | 'QUARANTINED';
  kmsKeyId: string;
  kmsCiphertextPreview: string;
  ttlEpoch: number;
  writeConsistency: 'EVENTUAL' | 'STRONG';
  storageTier: 'PAY_PER_REQUEST';
  writeLatencyMs: number;
}

export interface Transaction {
  transactionId: string;
  traceId: string;
  senderAccount: string;
  receiverAccount: string;
  amount: number;
  currency: string;
  cardToken: string;
  location: string;
  merchantCode: string;
  narration: string;
  status: TransactionStatus;
  fraudScore: number;
  fraudViolations: string[];
  kmsEnvelope: KMSEnvelope;
  rdsLedger: RDSLedgerRecord | null;
  dynamoAudit: DynamoDBAuditItem | null;
  snsAlertDispatched: boolean;
  snsMessageId?: string;
  timestamp: number;
  latencyMs: number;
}

export interface CloudTrailEvent {
  eventId: string;
  eventName:
    | 'kms:Encrypt'
    | 'kms:Decrypt'
    | 'sqs:SendMessage'
    | 'sqs:ReceiveMessage'
    | 'dynamodb:PutItem'
    | 'sts:AssumeRole'
    | 'sns:Publish'
    | 'rds:CommitTransaction';
  eventSource: string;
  awsRegion: string;
  sourceIPAddress: string;
  userAgent: string;
  principalArn: string;
  eventTime: string;
  status: 'SUCCESS' | 'DENIED' | 'THROTTLED';
}

export interface CloudWatchMetrics {
  ec2CpuUtilization: number;
  sqsQueueDepth: number;
  sqsDlqDepth: number;
  lambdaInvocations: number;
  lambdaDurationMs: number;
  activeConnections: number;
  rdsIops: number;
  dynamoWriteCapacity: number;
}

export interface BankAccount {
  accountNumber: string;
  holderName: string;
  bank: string;
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'FLAGGED';
}

export interface EC2InstanceNode {
  id: string;
  az: string;
  ip: string;
  state: 'running' | 'terminated' | 'initializing';
  cpu: number;
  healthy: boolean;
}

export interface ChaosState {
  ec2Instances: EC2InstanceNode[];
  isS3Replicating: boolean;
  s3PrimaryCount: number;
  s3DrReplicaCount: number;
  activeAlarm: string | null;
  asgDesiredCapacity: number;
}

export interface FinOpsBreakdownItem {
  item: string;
  category: 'Compute' | 'Storage' | 'Database' | 'Messaging' | 'Networking';
  onDemand: number;
  optimized: number;
  savings: number;
}

export interface CourseUnit {
  id: number;
  unitCode: string;
  title: string;
  curriculumFocus: string;
  implementedModule: string;
  fileReference: string;
  vivaTalkingPoints: string[];
}

export interface LabAssignment {
  id: number;
  assignmentCode: string;
  title: string;
  objective: string;
  solutionSummary: string;
  fileReference: string;
  codeSnippet: string;
}
