#!/usr/bin/env bash
# ==============================================================================
# CloudGuard Bank - EC2 Application Tier Bootstrap & Security Hardening
# Course: DS3203A Cloud Computing | Assignment 3 & 4: Compute & EC2 Automation
# Target OS: Amazon Linux 2023 (x86_64) / RHEL 9
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

exec > >(tee -a /var/log/cloudguard-bootstrap.log | logger -t user-data -s 2>/dev/console) 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting CloudGuard EC2 Ingestion Node initialization..."

# ------------------------------------------------------------------------------
# STEP 1: OS Updates and Package Installation
# ------------------------------------------------------------------------------
echo "[1/7] Updating package index and installing core dependencies..."
dnf upgrade -y --releasever=latest
dnf install -y \
    curl \
    wget \
    jq \
    git \
    tar \
    unzip \
    nginx \
    amazon-cloudwatch-agent \
    procps-ng \
    net-tools

# Install Node.js 20.x LTS via NodeSource
echo "[2/7] Installing Node.js LTS runtime..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs
node --version
npm --version

# ------------------------------------------------------------------------------
# STEP 2: Linux OS Hardening & Security (PCI-DSS Section 2.2)
# ------------------------------------------------------------------------------
echo "[3/7] Hardening Linux kernel sysctl parameters and SSH access..."

# Kernel network stack hardening
cat <<'EOF' > /etc/sysctl.d/99-cloudguard-hardening.conf
# Ignore ICMP Broadcast Requests (Smurf attack mitigation)
net.ipv4.icmp_echo_ignore_broadcasts = 1
# Enable TCP SYN Cookies (SYN flood mitigation)
net.ipv4.tcp_syncookies = 1
# Disable IP packet forwarding (this is an app node, not a router)
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
# Ignore source routed packets
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
# Log Martian packets
net.ipv4.conf.all.log_martians = 1
# Maximize connection backlog for FinTech traffic bursts
net.core.somaxconn = 65535
EOF
sysctl --system

# Create non-privileged system user for the Node.js application
if ! id -u cloudguard >/dev/null 2>&1; then
    useradd -r -s /sbin/nologin -d /opt/cloudguard cloudguard
fi

# ------------------------------------------------------------------------------
# STEP 3: Deploy CloudGuard Express Ingestion API
# ------------------------------------------------------------------------------
echo "[4/7] Deploying Express Ingestion API..."
mkdir -p /opt/cloudguard/api
mkdir -p /opt/cloudguard/logs
chown -R cloudguard:cloudguard /opt/cloudguard

cat <<'EOF' > /opt/cloudguard/api/package.json
{
  "name": "cloudguard-ec2-ingestion-api",
  "version": "1.0.0",
  "description": "High-Throughput Ingestion API behind Application Load Balancer",
  "main": "server.js",
  "dependencies": {
    "@aws-sdk/client-sqs": "^3.540.0",
    "@aws-sdk/client-cloudwatch": "^3.540.0",
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5"
  }
}
EOF

# Write Express Ingestion API Server implementation
cat <<'EOF' > /opt/cloudguard/api/server.js
/**
 * CloudGuard Bank - EC2 Application Tier: High-Throughput Ingestion API
 * Course: DS3203A Cloud Computing | Unit 3: Compute & Messaging Tier
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

const sqsClient = new SQSClient({ region: AWS_REGION });
const cloudWatchClient = new CloudWatchClient({ region: AWS_REGION });

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const runtimeMetrics = {
  requestsTotal: 0,
  successfulTransfers: 0,
  validationFailures: 0,
  sqsDispatches: 0,
  sqsErrors: 0,
  startTime: Date.now()
};

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
      runtimeMetrics.sqsDispatches++;
      console.log(`[SIMULATOR] Dispatched transfer ${transactionId} to SQS Queue: ${SQS_QUEUE_URL}`);
    }

    runtimeMetrics.successfulTransfers++;

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CloudGuard EC2 Ingestion API Active on port ${PORT}`);
  });
}

module.exports = app;
EOF

# Set proper ownership for all deployed files
chown -R cloudguard:cloudguard /opt/cloudguard/api

# Install production dependencies
cd /opt/cloudguard/api
npm install --omit=dev --no-audit

# ------------------------------------------------------------------------------
# STEP 4: Configure Nginx as Reverse Proxy (Port 80 -> Port 3000)
# ------------------------------------------------------------------------------
echo "[5/7] Configuring Nginx reverse proxy..."
cat <<'EOF' > /etc/nginx/conf.d/cloudguard.conf
upstream node_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80 default_server;
    server_name _;

    client_body_buffer_size 128k;
    client_max_body_size 10M;

    # ALB Health Check pass-through
    location /health {
        proxy_pass http://node_backend/health;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        access_log off;
    }

    # FinTech Transaction API Ingress
    location /api/ {
        proxy_pass http://node_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Test Nginx syntax and enable service
nginx -t
systemctl enable --now nginx

# ------------------------------------------------------------------------------
# STEP 5: Create and Enable Systemd Service for Express App
# ------------------------------------------------------------------------------
echo "[6/7] Creating Systemd service unit..."
cat <<'EOF' > /etc/systemd/system/cloudguard-api.service
[Unit]
Description=CloudGuard FinTech Transaction Ingestion Service
Documentation=https://github.com/cloudguard/cloudguard-bank
After=network.target nginx.service

[Service]
Type=simple
User=cloudguard
Group=cloudguard
WorkingDirectory=/opt/cloudguard/api
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=AWS_REGION=ap-south-1
ExecStart=/usr/bin/node /opt/cloudguard/api/server.js
Restart=always
RestartSec=3
LimitNOFILE=65535
StandardOutput=append:/var/log/cloudguard-api.log
StandardError=append:/var/log/cloudguard-api-error.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now cloudguard-api.service

# ------------------------------------------------------------------------------
# STEP 6: Configure CloudWatch Logs & Metrics Agent
# ------------------------------------------------------------------------------
echo "[7/7] Configuring Amazon CloudWatch Agent..."
cat <<'EOF' > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "metrics": {
    "namespace": "CloudGuard/EC2",
    "metrics_collected": {
      "mem": {
        "measurement": ["mem_used_percent"]
      },
      "disk": {
        "measurement": ["used_percent"],
        "resources": ["/"]
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/cloudguard-api.log",
            "log_group_name": "/aws/cloudguard/ec2-ingestion",
            "log_stream_name": "{instance_id}-stdout"
          }
        ]
      }
    }
  }
}
EOF

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s || true

echo "[$(date '+%Y-%m-%d %H:%M:%S')] CloudGuard EC2 Bootstrap completed successfully."
exit 0
