/**
 * CloudGuard Bank - High-Fidelity Deterministic AWS Cloud Simulator
 * Course: DS3203A Cloud Computing
 * 
 * Provides an exact local simulation of the AWS pipeline:
 * ALB -> EC2 ASG -> SQS (+DLQ) -> Lambda -> KMS Envelope Encryption ->
 * RDS PostgreSQL (ACID Strong Consistency) -> DynamoDB (Eventual Consistency) -> SNS
 */

import {
  Transaction,
  KMSEnvelope,
  RDSLedgerRecord,
  DynamoDBAuditItem,
  CloudTrailEvent,
  CloudWatchMetrics,
  BankAccount,
  ChaosState,
  FinOpsBreakdownItem
} from '../types/cloud';

// -----------------------------------------------------------------------------
// SEED DATA: 4 Realistic Bank Accounts
// -----------------------------------------------------------------------------
export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    accountNumber: 'HDFC-00124891',
    holderName: 'Rajesh Sharma',
    bank: 'HDFC Bank Ltd',
    balance: 485000.00,
    currency: 'INR',
    status: 'ACTIVE'
  },
  {
    accountNumber: 'ICICI-00918234',
    holderName: 'Priya Patel',
    bank: 'ICICI Bank Ltd',
    balance: 215400.00,
    currency: 'INR',
    status: 'ACTIVE'
  },
  {
    accountNumber: 'SBI-00349102',
    holderName: 'Aarav Verma',
    bank: 'State Bank of India',
    balance: 84250.00,
    currency: 'INR',
    status: 'ACTIVE'
  },
  {
    accountNumber: 'AXIS-00778129',
    holderName: 'Vikramaditya Rao',
    bank: 'Axis Bank Corp',
    balance: 1240000.00,
    currency: 'INR',
    status: 'ACTIVE'
  }
];

function safeBase64(str: string): string {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
  } catch (e) {}
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  return 'S01TLUFFUzI1NkdDTTpBUk46YXdzOmttczphcC1zb3V0aC0x';
}

// Helper to generate realistic KMS ciphertext
export function generateKMSEnvelope(cardRaw: string, txnId: string, latencyMs = 12): KMSEnvelope {
  const masked = cardRaw.replace(/\d(?=\d{4})/g, '•');
  // Deterministic AES-256-GCM ciphertext representation
  const rawBytes = `KMS-AES256GCM:ARN:aws:kms:ap-south-1:739201845201:key/e9322b38-138a-4893-a201-81dbabf6e82c:${txnId}:${cardRaw}`;
  const base64Cipher = safeBase64(rawBytes).padEnd(64, '=').slice(0, 52) + '==';

  return {
    keyArn: 'arn:aws:kms:ap-south-1:739201845201:key/e9322b38-138a-4893-a201-81dbabf6e82c',
    keyAlias: 'alias/cloudguard-fintech-key',
    algorithm: 'AES-256-GCM',
    keyRotationStatus: 'ROTATION_ENABLED',
    plaintextMasked: masked,
    plaintextRaw: cardRaw,
    ciphertextBlob: `AQICAHhKz1N/Earb${base64Cipher.slice(12)}`,
    encryptionContext: {
      TransactionId: txnId,
      Compliance: 'PCI-DSS-v4.0',
      Department: 'TreasuryOperations'
    },
    kmsLatencyMs: latencyMs
  };
}

// -----------------------------------------------------------------------------
// SEED DATA: 6 Realistic Initial Transactions
// -----------------------------------------------------------------------------
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    transactionId: 'TXN-9a81c-001',
    traceId: '1-655f4a10-482a9fbc10294e0192a8174e',
    senderAccount: 'HDFC-00124891',
    receiverAccount: 'ICICI-00918234',
    amount: 14500.00,
    currency: 'INR',
    cardToken: 'CARD-4532-8821-3490-8910',
    location: 'Mumbai, IN',
    merchantCode: 'MCH-RETAIL-99',
    narration: 'Vendor Invoice #4891',
    status: 'COMMITTED',
    fraudScore: 12,
    fraudViolations: [],
    kmsEnvelope: generateKMSEnvelope('CARD-4532-8821-3490-8910', 'TXN-9a81c-001'),
    rdsLedger: {
      journalId: 'JRNL-881901',
      transactionId: 'TXN-9a81c-001',
      debitAccount: 'HDFC-00124891',
      creditAccount: 'ICICI-00918234',
      amount: 14500.00,
      currency: 'INR',
      status: 'COMMITTED',
      dbSubnet: 'Private-Data-Subnet-1 (10.0.20.42)',
      isolationLevel: 'SERIALIZABLE',
      executionDurationMs: 14,
      snapshotArn: 'arn:aws:rds:ap-south-1:739201845201:snapshot:cloudguard-auto-snap-01'
    },
    dynamoAudit: {
      transactionId: 'TXN-9a81c-001',
      timestamp: Date.now() - 3600000,
      senderAccount: 'HDFC-00124891',
      receiverAccount: 'ICICI-00918234',
      amount: 14500.00,
      currency: 'INR',
      fraudScore: 12,
      status: 'APPROVED',
      kmsKeyId: 'alias/cloudguard-fintech-key',
      kmsCiphertextPreview: 'AQIDAHgS205m...4b9a',
      ttlEpoch: Math.floor(Date.now() / 1000) + 31536000,
      writeConsistency: 'EVENTUAL',
      storageTier: 'PAY_PER_REQUEST',
      writeLatencyMs: 4
    },
    snsAlertDispatched: false,
    timestamp: Date.now() - 3600000,
    latencyMs: 38
  },
  {
    transactionId: 'TXN-7b19d-002',
    traceId: '1-655f4a12-89cd12ef44810a9182bb1102',
    senderAccount: 'ICICI-00918234',
    receiverAccount: 'SBI-00349102',
    amount: 3200.00,
    currency: 'INR',
    cardToken: 'CARD-5120-7712-4401-2291',
    location: 'Bengaluru, IN',
    merchantCode: 'MCH-GROCERY-01',
    narration: 'Office Consumables',
    status: 'COMMITTED',
    fraudScore: 8,
    fraudViolations: [],
    kmsEnvelope: generateKMSEnvelope('CARD-5120-7712-4401-2291', 'TXN-7b19d-002'),
    rdsLedger: {
      journalId: 'JRNL-881902',
      transactionId: 'TXN-7b19d-002',
      debitAccount: 'ICICI-00918234',
      creditAccount: 'SBI-00349102',
      amount: 3200.00,
      currency: 'INR',
      status: 'COMMITTED',
      dbSubnet: 'Private-Data-Subnet-2 (10.0.21.18)',
      isolationLevel: 'SERIALIZABLE',
      executionDurationMs: 11,
      snapshotArn: 'arn:aws:rds:ap-south-1:739201845201:snapshot:cloudguard-auto-snap-01'
    },
    dynamoAudit: {
      transactionId: 'TXN-7b19d-002',
      timestamp: Date.now() - 2400000,
      senderAccount: 'ICICI-00918234',
      receiverAccount: 'SBI-00349102',
      amount: 3200.00,
      currency: 'INR',
      fraudScore: 8,
      status: 'APPROVED',
      kmsKeyId: 'alias/cloudguard-fintech-key',
      kmsCiphertextPreview: 'AQIDAHgT991m...33fa',
      ttlEpoch: Math.floor(Date.now() / 1000) + 31536000,
      writeConsistency: 'EVENTUAL',
      storageTier: 'PAY_PER_REQUEST',
      writeLatencyMs: 3
    },
    snsAlertDispatched: false,
    timestamp: Date.now() - 2400000,
    latencyMs: 32
  },
  {
    transactionId: 'TXN-4c88f-003',
    traceId: '1-655f4a15-cc9900aa1122334455667788',
    senderAccount: 'SBI-00349102',
    receiverAccount: 'AXIS-00778129',
    amount: 285000.00,
    currency: 'INR',
    cardToken: 'CARD-4111-9981-2231-5501',
    location: 'Kyiv, UA (Offshore Proxy)',
    merchantCode: 'MCH-OFFSHORE-99',
    narration: 'Offshore Escrow Transfer',
    status: 'FRAUD_BLOCKED',
    fraudScore: 95,
    fraudViolations: [
      'HIGH_VALUE_THRESHOLD_EXCEEDED: Transfer of INR 285,000.00 exceeds INR 1,00,000 limit.',
      'SANCTIONED_MERCHANT: Target merchant matches Offshore Cayman Shell Entity.'
    ],
    kmsEnvelope: generateKMSEnvelope('CARD-4111-9981-2231-5501', 'TXN-4c88f-003'),
    rdsLedger: null,
    dynamoAudit: {
      transactionId: 'TXN-4c88f-003',
      timestamp: Date.now() - 1800000,
      senderAccount: 'SBI-00349102',
      receiverAccount: 'AXIS-00778129',
      amount: 285000.00,
      currency: 'INR',
      fraudScore: 95,
      status: 'REJECTED',
      kmsKeyId: 'alias/cloudguard-fintech-key',
      kmsCiphertextPreview: 'AQIDAHgR719a...11bc',
      ttlEpoch: Math.floor(Date.now() / 1000) + 31536000,
      writeConsistency: 'EVENTUAL',
      storageTier: 'PAY_PER_REQUEST',
      writeLatencyMs: 5
    },
    snsAlertDispatched: true,
    snsMessageId: 'msg-sns-7f91-2281-990a',
    timestamp: Date.now() - 1800000,
    latencyMs: 25
  },
  {
    transactionId: 'TXN-3e21a-004',
    traceId: '1-655f4a18-1122aabb3344cc55dd66ee77',
    senderAccount: 'AXIS-00778129',
    receiverAccount: 'HDFC-00124891',
    amount: 52000.00,
    currency: 'INR',
    cardToken: 'CARD-6011-0021-9932-4412',
    location: 'New Delhi, IN',
    merchantCode: 'MCH-AIRLINE-04',
    narration: 'Corporate Travel Booking',
    status: 'COMMITTED',
    fraudScore: 18,
    fraudViolations: [],
    kmsEnvelope: generateKMSEnvelope('CARD-6011-0021-9932-4412', 'TXN-3e21a-004'),
    rdsLedger: {
      journalId: 'JRNL-881903',
      transactionId: 'TXN-3e21a-004',
      debitAccount: 'AXIS-00778129',
      creditAccount: 'HDFC-00124891',
      amount: 52000.00,
      currency: 'INR',
      status: 'COMMITTED',
      dbSubnet: 'Private-Data-Subnet-1 (10.0.20.42)',
      isolationLevel: 'SERIALIZABLE',
      executionDurationMs: 18,
      snapshotArn: 'arn:aws:rds:ap-south-1:739201845201:snapshot:cloudguard-auto-snap-01'
    },
    dynamoAudit: {
      transactionId: 'TXN-3e21a-004',
      timestamp: Date.now() - 1200000,
      senderAccount: 'AXIS-00778129',
      receiverAccount: 'HDFC-00124891',
      amount: 52000.00,
      currency: 'INR',
      fraudScore: 18,
      status: 'APPROVED',
      kmsKeyId: 'alias/cloudguard-fintech-key',
      kmsCiphertextPreview: 'AQIDAHgM442b...88aa',
      ttlEpoch: Math.floor(Date.now() / 1000) + 31536000,
      writeConsistency: 'EVENTUAL',
      storageTier: 'PAY_PER_REQUEST',
      writeLatencyMs: 4
    },
    snsAlertDispatched: false,
    timestamp: Date.now() - 1200000,
    latencyMs: 41
  },
  {
    transactionId: 'TXN-1d90c-005',
    traceId: '1-655f4a20-aa11bb22cc33dd44ee55ff66',
    senderAccount: 'HDFC-00124891',
    receiverAccount: 'SBI-00349102',
    amount: 18400.00,
    currency: 'INR',
    cardToken: 'CARD-4532-1100-2299-8910',
    location: 'Pune, IN',
    merchantCode: 'MCH-TECH-12',
    narration: 'AWS Cloud Hosting Invoice',
    status: 'COMMITTED',
    fraudScore: 5,
    fraudViolations: [],
    kmsEnvelope: generateKMSEnvelope('CARD-4532-1100-2299-8910', 'TXN-1d90c-005'),
    rdsLedger: {
      journalId: 'JRNL-881904',
      transactionId: 'TXN-1d90c-005',
      debitAccount: 'HDFC-00124891',
      creditAccount: 'SBI-00349102',
      amount: 18400.00,
      currency: 'INR',
      status: 'COMMITTED',
      dbSubnet: 'Private-Data-Subnet-2 (10.0.21.18)',
      isolationLevel: 'SERIALIZABLE',
      executionDurationMs: 12,
      snapshotArn: 'arn:aws:rds:ap-south-1:739201845201:snapshot:cloudguard-auto-snap-01'
    },
    dynamoAudit: {
      transactionId: 'TXN-1d90c-005',
      timestamp: Date.now() - 600000,
      senderAccount: 'HDFC-00124891',
      receiverAccount: 'SBI-00349102',
      amount: 18400.00,
      currency: 'INR',
      fraudScore: 5,
      status: 'APPROVED',
      kmsKeyId: 'alias/cloudguard-fintech-key',
      kmsCiphertextPreview: 'AQIDAHgP110x...44cc',
      ttlEpoch: Math.floor(Date.now() / 1000) + 31536000,
      writeConsistency: 'EVENTUAL',
      storageTier: 'PAY_PER_REQUEST',
      writeLatencyMs: 3
    },
    snsAlertDispatched: false,
    timestamp: Date.now() - 600000,
    latencyMs: 35
  },
  {
    transactionId: 'TXN-8f33b-006',
    traceId: '1-655f4a25-99887766554433221100aabb',
    senderAccount: 'ICICI-00918234',
    receiverAccount: 'AXIS-00778129',
    amount: 7500.00,
    currency: 'INR',
    cardToken: 'CARD-5120-3341-9981-2291',
    location: 'Chennai, IN',
    merchantCode: 'MCH-RETAIL-99',
    narration: 'Hardware Procurement',
    status: 'COMMITTED',
    fraudScore: 10,
    fraudViolations: [],
    kmsEnvelope: generateKMSEnvelope('CARD-5120-3341-9981-2291', 'TXN-8f33b-006'),
    rdsLedger: {
      journalId: 'JRNL-881905',
      transactionId: 'TXN-8f33b-006',
      debitAccount: 'ICICI-00918234',
      creditAccount: 'AXIS-00778129',
      amount: 7500.00,
      currency: 'INR',
      status: 'COMMITTED',
      dbSubnet: 'Private-Data-Subnet-1 (10.0.20.42)',
      isolationLevel: 'SERIALIZABLE',
      executionDurationMs: 15,
      snapshotArn: 'arn:aws:rds:ap-south-1:739201845201:snapshot:cloudguard-auto-snap-01'
    },
    dynamoAudit: {
      transactionId: 'TXN-8f33b-006',
      timestamp: Date.now() - 120000,
      senderAccount: 'ICICI-00918234',
      receiverAccount: 'AXIS-00778129',
      amount: 7500.00,
      currency: 'INR',
      fraudScore: 10,
      status: 'APPROVED',
      kmsKeyId: 'alias/cloudguard-fintech-key',
      kmsCiphertextPreview: 'AQIDAHgK992z...11dd',
      ttlEpoch: Math.floor(Date.now() / 1000) + 31536000,
      writeConsistency: 'EVENTUAL',
      storageTier: 'PAY_PER_REQUEST',
      writeLatencyMs: 4
    },
    snsAlertDispatched: false,
    timestamp: Date.now() - 120000,
    latencyMs: 36
  }
];

// -----------------------------------------------------------------------------
// SEED DATA: CloudTrail Audit Stream
// -----------------------------------------------------------------------------
export const INITIAL_CLOUDTRAIL_EVENTS: CloudTrailEvent[] = [
  {
    eventId: 'ct-event-01',
    eventName: 'kms:Encrypt',
    eventSource: 'kms.amazonaws.com',
    awsRegion: 'ap-south-1',
    sourceIPAddress: '10.0.10.42 (Lambda VPC ENI)',
    userAgent: 'aws-sdk-python/3.11 Boto3/1.34',
    principalArn: 'arn:aws:iam::739201845201:role/CloudGuard-LambdaExecutionRole',
    eventTime: '2026-11-15T06:15:22Z',
    status: 'SUCCESS'
  },
  {
    eventId: 'ct-event-02',
    eventName: 'sqs:SendMessage',
    eventSource: 'sqs.amazonaws.com',
    awsRegion: 'ap-south-1',
    sourceIPAddress: '10.0.1.184 (EC2 ASG Node)',
    userAgent: 'aws-sdk-js/v3.540.0',
    principalArn: 'arn:aws:iam::739201845201:role/CloudGuard-EC2InstanceRole',
    eventTime: '2026-11-15T06:15:21Z',
    status: 'SUCCESS'
  },
  {
    eventId: 'ct-event-03',
    eventName: 'dynamodb:PutItem',
    eventSource: 'dynamodb.amazonaws.com',
    awsRegion: 'ap-south-1',
    sourceIPAddress: '10.0.11.109 (Lambda VPC ENI)',
    userAgent: 'aws-sdk-python/3.11 Boto3/1.34',
    principalArn: 'arn:aws:iam::739201845201:role/CloudGuard-LambdaExecutionRole',
    eventTime: '2026-11-15T06:15:23Z',
    status: 'SUCCESS'
  },
  {
    eventId: 'ct-event-04',
    eventName: 'sts:AssumeRole',
    eventSource: 'sts.amazonaws.com',
    awsRegion: 'ap-south-1',
    sourceIPAddress: '13.234.12.8',
    userAgent: 'aws-cli/2.15.14',
    principalArn: 'arn:aws:iam::739201845201:user/devops-lead',
    eventTime: '2026-11-15T06:10:04Z',
    status: 'SUCCESS'
  },
  {
    eventId: 'ct-event-05',
    eventName: 'sns:Publish',
    eventSource: 'sns.amazonaws.com',
    awsRegion: 'ap-south-1',
    sourceIPAddress: '10.0.10.42 (Lambda VPC ENI)',
    userAgent: 'aws-sdk-python/3.11 Boto3/1.34',
    principalArn: 'arn:aws:iam::739201845201:role/CloudGuard-LambdaExecutionRole',
    eventTime: '2026-11-15T05:58:12Z',
    status: 'SUCCESS'
  }
];

// -----------------------------------------------------------------------------
// SEED DATA: FinOps Cost Breakdown (Assignment 14)
// -----------------------------------------------------------------------------
export const FINOPS_BREAKDOWN: FinOpsBreakdownItem[] = [
  {
    item: 'EC2 Compute (2x t3.micro ASG vs Dynamic)',
    category: 'Compute',
    onDemand: 38.40,
    optimized: 11.20,
    savings: 27.20
  },
  {
    item: 'RDS PostgreSQL (db.t3.micro On-Demand vs 1-Yr Reserved)',
    category: 'Database',
    onDemand: 42.80,
    optimized: 14.50,
    savings: 28.30
  },
  {
    item: 'Amazon SQS + DLQ (Pay-Per-Request Ingestion)',
    category: 'Messaging',
    onDemand: 8.50,
    optimized: 1.20,
    savings: 7.30
  },
  {
    item: 'AWS Lambda Worker (Provisioned vs Pay-per-Call)',
    category: 'Compute',
    onDemand: 24.00,
    optimized: 3.40,
    savings: 20.60
  },
  {
    item: 'DynamoDB Audit Trail (Provisioned vs On-Demand PAYG)',
    category: 'Database',
    onDemand: 19.50,
    optimized: 4.80,
    savings: 14.70
  },
  {
    item: 'S3 Receipts + Cross-Region Replication to Singapore',
    category: 'Storage',
    onDemand: 14.80,
    optimized: 6.90,
    savings: 7.90
  }
];

// -----------------------------------------------------------------------------
// CORE DETERMINISTIC SIMULATION ENGINE
// -----------------------------------------------------------------------------
export interface SimulationResult {
  transaction: Transaction;
  accounts: BankAccount[];
  cloudTrail: CloudTrailEvent[];
  cloudWatch: CloudWatchMetrics;
  snsToast: {
    messageId: string;
    topicArn: string;
    subject: string;
    details: string;
  } | null;
}

export function executeSimulationStep(
  input: {
    senderAccount: string;
    receiverAccount: string;
    amount: number;
    currency?: string;
    cardToken?: string;
    location?: string;
    merchantCode?: string;
    narration?: string;
    forceFraudAnomaly?: boolean;
    forcePoisonPill?: boolean;
  },
  currentAccounts: BankAccount[],
  currentMetrics: CloudWatchMetrics
): SimulationResult {
  const timestamp = Date.now();
  const txnId = `TXN-${Math.random().toString(36).substring(2, 7)}-${Math.floor(100 + Math.random() * 900)}`;
  const traceId = `1-${Math.floor(timestamp / 1000).toString(16)}-${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;

  const cardToken = input.cardToken || `CARD-4532-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-8910`;
  const kmsEnvelope = generateKMSEnvelope(cardToken, txnId);

  // DLQ Poison Pill Branch
  if (input.forcePoisonPill) {
    const poisonTxn: Transaction = {
      transactionId: txnId,
      traceId,
      senderAccount: input.senderAccount,
      receiverAccount: input.receiverAccount,
      amount: input.amount,
      currency: input.currency || 'INR',
      cardToken: 'POISON_PILL_NULL_BYTE_MALFORMED',
      location: 'UNKNOWN_PROXY',
      merchantCode: 'MCH-EXPLOIT-00',
      narration: 'MALFORMED_PAYLOAD_TEST',
      status: 'POISON_PILL_DLQ',
      fraudScore: 100,
      fraudViolations: [
        'POISON_PILL_DETECTED: SQS Message failed Lambda unhandled exception 3 consecutive times.',
        'MAX_RECEIVE_COUNT_EXCEEDED: Moved automatically to TransactionDLQ via RedrivePolicy.'
      ],
      kmsEnvelope,
      rdsLedger: null,
      dynamoAudit: {
        transactionId: txnId,
        timestamp,
        senderAccount: input.senderAccount,
        receiverAccount: input.receiverAccount,
        amount: input.amount,
        currency: input.currency || 'INR',
        fraudScore: 100,
        status: 'QUARANTINED',
        kmsKeyId: 'alias/cloudguard-fintech-key',
        kmsCiphertextPreview: kmsEnvelope.ciphertextBlob.slice(0, 20) + '...',
        ttlEpoch: Math.floor(timestamp / 1000) + 86400,
        writeConsistency: 'EVENTUAL',
        storageTier: 'PAY_PER_REQUEST',
        writeLatencyMs: 3
      },
      snsAlertDispatched: true,
      snsMessageId: `msg-sns-dlq-${Math.random().toString(36).substring(2, 8)}`,
      timestamp,
      latencyMs: 65
    };

    const newMetrics: CloudWatchMetrics = {
      ...currentMetrics,
      sqsDlqDepth: currentMetrics.sqsDlqDepth + 1,
      lambdaInvocations: currentMetrics.lambdaInvocations + 3
    };

    const newCloudTrail: CloudTrailEvent[] = [
      {
        eventId: `ct-${Math.random().toString(36).substring(2, 9)}`,
        eventName: 'sqs:SendMessage',
        eventSource: 'sqs.amazonaws.com',
        awsRegion: 'ap-south-1',
        sourceIPAddress: '10.0.1.184 (EC2 Ingestion Node)',
        userAgent: 'aws-sdk-js/v3.540.0',
        principalArn: 'arn:aws:iam::739201845201:role/CloudGuard-EC2InstanceRole',
        eventTime: new Date().toISOString(),
        status: 'SUCCESS'
      },
      {
        eventId: `ct-${Math.random().toString(36).substring(2, 9)}`,
        eventName: 'sns:Publish',
        eventSource: 'sns.amazonaws.com',
        awsRegion: 'ap-south-1',
        sourceIPAddress: '10.0.10.42 (Lambda VPC ENI)',
        userAgent: 'aws-sdk-python/3.11 Boto3/1.34',
        principalArn: 'arn:aws:iam::739201845201:role/CloudGuard-LambdaExecutionRole',
        eventTime: new Date().toISOString(),
        status: 'SUCCESS'
      }
    ];

    return {
      transaction: poisonTxn,
      accounts: currentAccounts,
      cloudTrail: newCloudTrail,
      cloudWatch: newMetrics,
      snsToast: {
        messageId: poisonTxn.snsMessageId!,
        topicArn: 'arn:aws:sns:ap-south-1:739201845201:CloudGuard-FraudAlerts',
        subject: '⚠️ DLQ Depth Alert: Poison Pill Quarantined',
        details: `Message ${txnId} failed 3 retries and was routed to TransactionDLQ.`
      }
    };
  }

  // Fraud Evaluation
  let fraudScore = 10;
  const violations: string[] = [];

  if (input.forceFraudAnomaly || input.amount > 100000) {
    fraudScore += 60;
    violations.push(`HIGH_VALUE_THRESHOLD_EXCEEDED: Transfer of INR ${input.amount.toLocaleString()} exceeds INR 1,00,000 threshold.`);
  }

  if (input.merchantCode === 'MCH-OFFSHORE-99' || input.location?.includes('Offshore')) {
    fraudScore += 35;
    violations.push('SANCTIONED_MERCHANT: Offshore Cayman Shell Entity transaction pattern matched.');
  }

  const isFraud = fraudScore >= 75;

  // Polyglot persistence update
  let updatedAccounts = [...currentAccounts];
  let rdsRecord: RDSLedgerRecord | null = null;
  let snsToast = null;

  if (isFraud) {
    // SNS Alert Triggered
    const snsMsgId = `msg-sns-${Math.random().toString(36).substring(2, 8)}`;
    snsToast = {
      messageId: snsMsgId,
      topicArn: 'arn:aws:sns:ap-south-1:739201845201:CloudGuard-FraudAlerts',
      subject: `🚨 [CloudGuard SecOps] Fraud Anomaly: ${txnId}`,
      details: `INR ${input.amount.toLocaleString()} transfer flagged (Score: ${fraudScore}/100). RDS debit aborted.`
    };
  } else {
    // Legitimate: Atomic balance mutation
    updatedAccounts = currentAccounts.map(acc => {
      if (acc.accountNumber === input.senderAccount) {
        return { ...acc, balance: Math.max(0, acc.balance - input.amount) };
      }
      if (acc.accountNumber === input.receiverAccount) {
        return { ...acc, balance: acc.balance + input.amount };
      }
      return acc;
    });

    rdsRecord = {
      journalId: `JRNL-${Math.floor(881900 + Math.random() * 999)}`,
      transactionId: txnId,
      debitAccount: input.senderAccount,
      creditAccount: input.receiverAccount,
      amount: input.amount,
      currency: input.currency || 'INR',
      status: 'COMMITTED',
      dbSubnet: 'Private-Data-Subnet-1 (10.0.20.42)',
      isolationLevel: 'SERIALIZABLE',
      executionDurationMs: Math.floor(12 + Math.random() * 8),
      snapshotArn: 'arn:aws:rds:ap-south-1:739201845201:snapshot:cloudguard-auto-snap-01'
    };
  }

  const dynamoAudit: DynamoDBAuditItem = {
    transactionId: txnId,
    timestamp,
    senderAccount: input.senderAccount,
    receiverAccount: input.receiverAccount,
    amount: input.amount,
    currency: input.currency || 'INR',
    fraudScore,
    status: isFraud ? 'REJECTED' : 'APPROVED',
    kmsKeyId: 'alias/cloudguard-fintech-key',
    kmsCiphertextPreview: kmsEnvelope.ciphertextBlob.slice(0, 20) + '...',
    ttlEpoch: Math.floor(timestamp / 1000) + 31536000,
    writeConsistency: 'EVENTUAL',
    storageTier: 'PAY_PER_REQUEST',
    writeLatencyMs: Math.floor(3 + Math.random() * 3)
  };

  const newTxn: Transaction = {
    transactionId: txnId,
    traceId,
    senderAccount: input.senderAccount,
    receiverAccount: input.receiverAccount,
    amount: input.amount,
    currency: input.currency || 'INR',
    cardToken,
    location: input.location || 'Mumbai, IN',
    merchantCode: input.merchantCode || 'MCH-RETAIL-99',
    narration: input.narration || 'Online Settlement',
    status: isFraud ? 'FRAUD_BLOCKED' : 'COMMITTED',
    fraudScore,
    fraudViolations: violations,
    kmsEnvelope,
    rdsLedger: rdsRecord,
    dynamoAudit,
    snsAlertDispatched: isFraud,
    snsMessageId: snsToast ? snsToast.messageId : undefined,
    timestamp,
    latencyMs: Math.floor(30 + Math.random() * 18)
  };

  const newCloudTrail: CloudTrailEvent[] = [
    {
      eventId: `ct-${Math.random().toString(36).substring(2, 9)}`,
      eventName: 'kms:Encrypt',
      eventSource: 'kms.amazonaws.com',
      awsRegion: 'ap-south-1',
      sourceIPAddress: '10.0.10.42 (Lambda VPC ENI)',
      userAgent: 'aws-sdk-python/3.11 Boto3/1.34',
      principalArn: 'arn:aws:iam::739201845201:role/CloudGuard-LambdaExecutionRole',
      eventTime: new Date().toISOString(),
      status: 'SUCCESS'
    },
    {
      eventId: `ct-${Math.random().toString(36).substring(2, 9)}`,
      eventName: 'dynamodb:PutItem',
      eventSource: 'dynamodb.amazonaws.com',
      awsRegion: 'ap-south-1',
      sourceIPAddress: '10.0.11.109 (Lambda VPC ENI)',
      userAgent: 'aws-sdk-python/3.11 Boto3/1.34',
      principalArn: 'arn:aws:iam::739201845201:role/CloudGuard-LambdaExecutionRole',
      eventTime: new Date().toISOString(),
      status: 'SUCCESS'
    }
  ];

  if (isFraud) {
    newCloudTrail.push({
      eventId: `ct-${Math.random().toString(36).substring(2, 9)}`,
      eventName: 'sns:Publish',
      eventSource: 'sns.amazonaws.com',
      awsRegion: 'ap-south-1',
      sourceIPAddress: '10.0.10.42 (Lambda VPC ENI)',
      userAgent: 'aws-sdk-python/3.11 Boto3/1.34',
      principalArn: 'arn:aws:iam::739201845201:role/CloudGuard-LambdaExecutionRole',
      eventTime: new Date().toISOString(),
      status: 'SUCCESS'
    });
  }

  const newMetrics: CloudWatchMetrics = {
    ...currentMetrics,
    lambdaInvocations: currentMetrics.lambdaInvocations + 1,
    lambdaDurationMs: newTxn.latencyMs,
    dynamoWriteCapacity: currentMetrics.dynamoWriteCapacity + 1,
    rdsIops: isFraud ? currentMetrics.rdsIops : currentMetrics.rdsIops + 2
  };

  return {
    transaction: newTxn,
    accounts: updatedAccounts,
    cloudTrail: newCloudTrail,
    cloudWatch: newMetrics,
    snsToast
  };
}
