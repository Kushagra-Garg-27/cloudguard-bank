/**
 * CloudGuard Bank - EC2 Application Tier: High-Throughput Ingestion API
 * Course: DS3203A Cloud Computing | Unit 3: Compute & Messaging Tier
 * 
 * Sits behind an Application Load Balancer (ALB) inside private app subnets.
 * Validates transaction payloads, generates cryptographic tracing IDs,
 * pushes messages to Amazon SQS, and emits CloudWatch operational telemetry.
 */

'use strict';

const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL || 'https://sqs.ap-south-1.amazonaws.com/739201845201/CloudGuard-TransactionQueue';
const METRIC_NAMESPACE = 'CloudGuard/Ingestion';

// Initialize AWS SDK v3 Clients
const sqsClient = new SQSClient({ region: AWS_REGION });
const cloudWatchClient = new CloudWatchClient({ region: AWS_REGION });

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// In-Memory Telemetry Counter (for local health reporting)
const runtimeMetrics = {
  requestsTotal: 0,
  successfulTransfers: 0,
  validationFailures: 0,
  sqsDispatches: 0,
  sqsErrors: 0,
  startTime: Date.now()
};

/**
 * 1. Application Load Balancer Health Check Endpoint
 * Path: GET /health
 * Target group health checks verify instance survivability.
 */
app.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - runtimeMetrics.startTime) / 1000);
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'HEALTHY',
    service: 'cloudguard-ec2-ingestion-api',
    instanceId: process.env.INSTANCE_ID || 'i-0a8f92c19e73b400a',
    region: AWS_REGION,
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    memory: {
      rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
      heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2)
    },
    metricsSummary: runtimeMetrics
  });
});

/**
 * 2. FinTech Transaction Ingestion Endpoint
 * Path: POST /api/transfer
 * Receives bank transfer, validates schema, pushes to Amazon SQS.
 */
app.post('/api/transfer', async (req, res) => {
  runtimeMetrics.requestsTotal++;
  const ingressTimestamp = Date.now();

  const {
    senderAccount,
    receiverAccount,
    amount,
    currency = 'INR',
    cardToken,
    location = 'Mumbai, IN',
    merchantCode = 'MCH-RETAIL-99',
    narration = 'Fund Transfer'
  } = req.body;

  // Strict Schema Validation
  if (!senderAccount || !receiverAccount || !amount || amount <= 0) {
    runtimeMetrics.validationFailures++;
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: 'Invalid payload: senderAccount, receiverAccount and positive amount are required.'
    });
  }

  const transactionId = `TXN-${randomUUID()}`;
  const traceId = `1-${Math.floor(Date.now() / 1000).toString(16)}-${randomUUID().replace(/-/g, '').slice(0, 24)}`;

  const transactionMessage = {
    transactionId,
    traceId,
    senderAccount,
    receiverAccount,
    amount: Number(amount),
    currency,
    cardToken: cardToken || `CARD-4532-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-8910`,
    location,
    merchantCode,
    narration,
    ingressTimestamp,
    clientIp: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    status: 'QUEUED_FOR_EVALUATION'
  };

  let sqsMessageId = `sim-sqs-${randomUUID().slice(0, 12)}`;

  try {
    // Check if AWS environment is actively configured
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const sqsCommand = new SendMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        MessageBody: JSON.stringify(transactionMessage),
        MessageAttributes: {
          TransactionId: { DataType: 'String', StringValue: transactionId },
          Currency: { DataType: 'String', StringValue: currency },
          IngressTraceId: { DataType: 'String', StringValue: traceId }
        }
      });

      const sqsResponse = await sqsClient.send(sqsCommand);
      sqsMessageId = sqsResponse.MessageId || sqsMessageId;
      runtimeMetrics.sqsDispatches++;

      // Emit Custom CloudWatch Metric Asynchronously
      cloudWatchClient.send(new PutMetricDataCommand({
        Namespace: METRIC_NAMESPACE,
        MetricData: [
          {
            MetricName: 'TransactionsIngested',
            Value: 1,
            Unit: 'Count',
            Dimensions: [{ Name: 'Region', Value: AWS_REGION }]
          },
          {
            MetricName: 'TransferAmountVolume',
            Value: Number(amount),
            Unit: 'None',
            Dimensions: [{ Name: 'Currency', Value: currency }]
          }
        ]
      })).catch(cwErr => console.warn('[CloudWatch Telemetry Warning]', cwErr.message));

    } else {
      // Deterministic Local Simulation Path
      runtimeMetrics.sqsDispatches++;
      console.log(`[SIMULATOR] Dispatched transfer ${transactionId} to SQS Queue: ${SQS_QUEUE_URL}`);
    }

    runtimeMetrics.successfulTransfers++;

    // Return 202 Accepted (Event-driven asynchronous acceptance)
    return res.status(202).json({
      success: true,
      statusCode: 202,
      transactionId,
      traceId,
      sqsMessageId,
      queueUrl: SQS_QUEUE_URL,
      status: 'QUEUED',
      ingressDurationMs: Date.now() - ingressTimestamp,
      message: 'Transaction accepted and safely enqueued in Amazon SQS for fraud and KMS evaluation.'
    });

  } catch (error) {
    runtimeMetrics.sqsErrors++;
    console.error(`[SQS Ingestion Error] Failed to enqueue transaction ${transactionId}:`, error);

    return res.status(500).json({
      error: 'QUEUE_INGESTION_FAILURE',
      message: 'Failed to buffer transaction into Amazon SQS.',
      transactionId,
      details: error.message
    });
  }
});

/**
 * 3. Operational Telemetry & Queue Inspector
 * Path: GET /api/metrics
 */
app.get('/api/metrics', (req, res) => {
  res.status(200).json({
    timestamp: new Date().toISOString(),
    runtimeMetrics,
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid
    }
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`  CloudGuard EC2 Ingestion API Active on port ${PORT}`);
    console.log(`  Target SQS Queue: ${SQS_QUEUE_URL}`);
    console.log(`  Region: ${AWS_REGION}`);
    console.log(`========================================================`);
  });
}

module.exports = app;
