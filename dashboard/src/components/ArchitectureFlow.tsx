'use client';

import React, { useState } from 'react';
import {
  Layers,
  Globe,
  Server,
  Inbox,
  Zap,
  Key,
  Database,
  Table,
  BellRing,
  Info,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { CloudWatchMetrics } from '../types/cloud';

interface ArchitectureFlowProps {
  metrics: CloudWatchMetrics;
  isProcessing: boolean;
  activeStage: string | null;
  onSelectNode?: (nodeKey: string) => void;
}

interface NodeDetails {
  id?: string;
  code?: string;
  name: string;
  category: string;
  awsService: string;
  cfnResource: string;
  subnetTier: string;
  cidrOrEndpoint: string;
  cloudDomain: string;
  securityControls: string[];
}

const NODE_CATALOG: Record<string, NodeDetails> = {
  s3: {
    name: 'S3 Static Portal & CRR',
    category: 'Storage Tier',
    awsService: 'Amazon S3',
    cfnResource: 'CloudGuardReceiptsBucket',
    subnetTier: 'Global AWS Edge (Public)',
    cidrOrEndpoint: 's3.ap-south-1.amazonaws.com',
    cloudDomain: 'Storage Tier & Cross-Region Disaster Recovery',
    securityControls: [
      'BlockPublicAcls: true',
      'BucketEncryption: aws:kms (Customer Managed Key)',
      'VersioningConfiguration: Status=Enabled',
      'Cross-Region Replication to ap-southeast-1'
    ]
  },
  alb: {
    name: 'Application Load Balancer',
    category: 'Ingress & Routing',
    awsService: 'Elastic Load Balancing v2',
    cfnResource: 'ApplicationLoadBalancer',
    subnetTier: 'Public Subnet (10.0.1.0/24, 10.0.2.0/24)',
    cidrOrEndpoint: 'cloudguard-alb-7392.ap-south-1.elb.amazonaws.com',
    cloudDomain: 'Ingress Routing & Multi-AZ High Availability',
    securityControls: [
      'TLS termination / HTTP port 80 -> 443',
      'TargetGroup port 3000 health check (/health polling every 15s)',
      'Cross-zone load balancing enabled'
    ]
  },
  ec2: {
    name: 'EC2 Auto Scaling Group',
    category: 'App Compute Tier',
    awsService: 'Amazon EC2 (t3.micro)',
    cfnResource: 'EC2AutoScalingGroup',
    subnetTier: 'Private App Subnet (10.0.10.0/24, 10.0.11.0/24)',
    cidrOrEndpoint: '10.0.10.184 / 10.0.11.92',
    cloudDomain: 'Compute Tier & Elastic Auto-Scaling',
    securityControls: [
      'Zero public IP assignments',
      'Inbound traffic accepted solely from ALB-SG',
      'IAM Instance Profile with scoped SQS Put permissions',
      'Hardened Linux kernel parameters (sysctl SYN flood mitigation)'
    ]
  },
  sqs: {
    name: 'Amazon SQS + Redrive DLQ',
    category: 'Asynchronous Decoupling',
    awsService: 'Amazon SQS',
    cfnResource: 'TransactionQueue & TransactionDLQ',
    subnetTier: 'AWS Managed VPC Gateway / VPC Endpoint',
    cidrOrEndpoint: 'https://sqs.ap-south-1.amazonaws.com/739201845201/CloudGuard-TransactionQueue',
    cloudDomain: 'Message Decoupling & Dead-Letter Quarantine',
    securityControls: [
      'KMS CMK server-side encryption enabled',
      'VisibilityTimeout: 60s',
      'RedrivePolicy: maxReceiveCount=3 -> TransactionDLQ',
      'Retention: 4 days main queue, 14 days quarantine DLQ'
    ]
  },
  lambda: {
    name: 'Serverless Fraud Worker',
    category: 'Event Processing',
    awsService: 'AWS Lambda (Python 3.11)',
    cfnResource: 'CloudGuardProcessingLambda',
    subnetTier: 'Private Subnet VPC Dual-ENI Integration',
    cidrOrEndpoint: 'arn:aws:lambda:ap-south-1:739201845201:function:CloudGuard-ProcessingLambda',
    cloudDomain: 'Serverless Event-Driven Compute & Tokenization',
    securityControls: [
      'Reserved concurrency: 50 concurrent executions',
      'VPC Security Group isolates database access',
      'X-Ray distributed active tracing enabled',
      'Automated dead-letter redrive integration'
    ]
  },
  kms: {
    name: 'AWS KMS (Customer Managed Key)',
    category: 'Cryptography & Key Mgmt',
    awsService: 'AWS Key Management Service',
    cfnResource: 'CloudGuardCustomerMasterKey',
    subnetTier: 'FIPS 140-3 Cryptographic HSM Boundary',
    cidrOrEndpoint: 'arn:aws:kms:ap-south-1:739201845201:key/e9322b38-138a-4893-a201-81dbabf6e82c',
    cloudDomain: 'Hardware Security Module & Envelope Encryption',
    securityControls: [
      'AES-256-GCM symmetric envelope encryption',
      'Key rotation: Automated annual rotation enabled',
      'Strict separation of Encrypt/Decrypt IAM roles',
      'Dual-log CloudTrail cryptographic audit verification'
    ]
  },
  rds: {
    name: 'Amazon RDS PostgreSQL',
    category: 'ACID Ledger Persistence',
    awsService: 'Amazon RDS (PostgreSQL 15.4)',
    cfnResource: 'CloudGuardLedgerDB',
    subnetTier: 'Private Data Subnet (10.0.20.0/24, 10.0.21.0/24)',
    cidrOrEndpoint: '10.0.20.42:5432 (Internal VPC DNS)',
    cloudDomain: 'Relational ACID Persistence & Strong Consistency',
    securityControls: [
      'Multi-AZ standby synchronous replication',
      'Storage encrypted with AWS KMS CMK',
      'Inbound access restricted to Lambda Security Group',
      'Automated daily snapshots with 7-day retention'
    ]
  },
  dynamo: {
    name: 'Amazon DynamoDB Audit Trail',
    category: 'NoSQL Append-Only Store',
    awsService: 'Amazon DynamoDB',
    cfnResource: 'CloudGuardAuditTable',
    subnetTier: 'AWS Managed DynamoDB Endpoint',
    cidrOrEndpoint: 'CloudGuard-AuditTable (Partition: transactionId)',
    cloudDomain: 'NoSQL High-Throughput & Eventual Consistency',
    securityControls: [
      'Pay-per-request (On-Demand) auto-scaling capacity',
      'Point-in-Time Recovery (PITR) enabled',
      'Continuous audit trail stream with cryptographic hash checks',
      'KMS CMK at-rest encryption'
    ]
  },
  sns: {
    name: 'Amazon SNS SecOps Topic',
    category: 'Alerting Bus',
    awsService: 'Amazon Simple Notification Service',
    cfnResource: 'FraudAlertSNSTopic',
    subnetTier: 'AWS Notification Bus',
    cidrOrEndpoint: 'arn:aws:sns:ap-south-1:739201845201:CloudGuard-FraudAlerts',
    cloudDomain: 'Push Alerting & CloudWatch Integration',
    securityControls: [
      'Server-side encryption enabled via KMS',
      'Topic policy limits publishing to authorized Lambda worker',
      'Integration with CloudWatch Alarms for threshold trips',
      'Multi-channel fanout (SMS, Email, PagerDuty webhook)'
    ]
  }
};

export const ArchitectureFlow: React.FC<ArchitectureFlowProps> = ({
  metrics,
  isProcessing,
  activeStage
}) => {
  const [selectedNode, setSelectedNode] = useState<NodeDetails | null>(null);

  return (
    <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 sm:p-6 shadow-bento font-sans relative overflow-hidden">
      
      {/* Topology Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[#D9D6CF]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white shadow-sm">
            <Layers className="w-4 h-4 text-[#F45B2A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-sm text-[#171717] tracking-tight">
                Asynchronous Cloud Architecture Topology
              </h2>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEECE6] text-[#403E39] border border-[#D9D6CF]">
                VPC 10.0.0.0/16
              </span>
            </div>
            <p className="text-xs text-[#85837E] mt-0.5">
              Decoupled banking event pipeline from edge ingress to polyglot persistence. Click any node to inspect AWS infrastructure specs.
            </p>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 bg-[#EDF7F0] text-[#236B43] px-2.5 py-1 rounded-lg border border-[#C6E7D2] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#236B43]" />
            ALB NOMINAL
          </span>
          <span className="flex items-center gap-1.5 bg-[#FFF3EE] text-[#F45B2A] px-2.5 py-1 rounded-lg border border-[#FDC4B0] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F45B2A]" />
            KMS ROTATED
          </span>
          <span className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#1E40AF] px-2.5 py-1 rounded-lg border border-[#DBEAFE] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF]" />
            MULTI-AZ ASG
          </span>
        </div>
      </div>

      {/* 6-Node Architecture Chain */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative">
        
        {/* Node 1: S3 Static & CRR */}
        <div
          onClick={() => setSelectedNode(NODE_CATALOG.s3)}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeStage === 's3'
              ? 'bg-[#FFF3EE] border-[#F45B2A] ring-2 ring-[#F45B2A]/20'
              : 'bg-[#F5F3EF]/60 hover:bg-white border-[#D9D6CF] hover:border-[#171717] hover:shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-[#D9D6CF] flex items-center justify-center text-[#171717]">
              <Globe className="w-4 h-4 text-[#F45B2A]" />
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#85837E] border border-[#D9D6CF]">
              01 S3
            </span>
          </div>
          <div className="text-xs font-bold text-[#171717]">Static Portal & CRR</div>
          <div className="text-[11px] text-[#85837E] font-mono mt-0.5">ap-southeast-1</div>
          <div className="mt-2.5 pt-2 border-t border-[#D9D6CF]/70 flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#85837E]">Replica:</span>
            <span className="text-[#236B43] font-bold">SYNCED</span>
          </div>
        </div>

        {/* Node 2: ALB Ingress */}
        <div
          onClick={() => setSelectedNode(NODE_CATALOG.alb)}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeStage === 'alb'
              ? 'bg-[#FFF3EE] border-[#F45B2A] ring-2 ring-[#F45B2A]/20'
              : 'bg-[#F5F3EF]/60 hover:bg-white border-[#D9D6CF] hover:border-[#171717] hover:shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-[#D9D6CF] flex items-center justify-center text-[#171717]">
              <Layers className="w-4 h-4 text-[#171717]" />
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#85837E] border border-[#D9D6CF]">
              02 ALB
            </span>
          </div>
          <div className="text-xs font-bold text-[#171717]">Public Ingress</div>
          <div className="text-[11px] text-[#85837E] font-mono mt-0.5">TLS Port 443</div>
          <div className="mt-2.5 pt-2 border-t border-[#D9D6CF]/70 flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#85837E]">Latency:</span>
            <span className="text-[#171717] font-bold">2.1ms</span>
          </div>
        </div>

        {/* Node 3: EC2 Auto Scaling Group */}
        <div
          onClick={() => setSelectedNode(NODE_CATALOG.ec2)}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeStage === 'ec2'
              ? 'bg-[#FFF3EE] border-[#F45B2A] ring-2 ring-[#F45B2A]/20'
              : 'bg-[#F5F3EF]/60 hover:bg-white border-[#D9D6CF] hover:border-[#171717] hover:shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-[#D9D6CF] flex items-center justify-center text-[#171717]">
              <Server className="w-4 h-4 text-[#171717]" />
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#85837E] border border-[#D9D6CF]">
              03 EC2
            </span>
          </div>
          <div className="text-xs font-bold text-[#171717]">ASG Compute (2/4)</div>
          <div className="text-[11px] text-[#85837E] font-mono truncate mt-0.5">Private Subnet</div>
          <div className="mt-2.5 pt-2 border-t border-[#D9D6CF]/70 flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#85837E]">CPU:</span>
            <span className="text-[#171717] font-bold">{metrics.ec2CpuUtilization.toFixed(1)}%</span>
          </div>
        </div>

        {/* Node 4: Amazon SQS + DLQ */}
        <div
          onClick={() => setSelectedNode(NODE_CATALOG.sqs)}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeStage === 'sqs' || metrics.sqsQueueDepth > 0
              ? 'bg-[#FEF3C7] border-[#92400E] ring-2 ring-[#FDE68A]'
              : 'bg-[#F5F3EF]/60 hover:bg-white border-[#D9D6CF] hover:border-[#171717] hover:shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-[#D9D6CF] flex items-center justify-center text-[#171717]">
              <Inbox className="w-4 h-4 text-[#F45B2A]" />
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#85837E] border border-[#D9D6CF]">
              04 SQS
            </span>
          </div>
          <div className="text-xs font-bold text-[#171717]">Decoupling Buffer</div>
          <div className="text-[11px] text-[#85837E] font-mono mt-0.5">
            Depth: <strong className="text-[#171717]">{metrics.sqsQueueDepth} msgs</strong>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#D9D6CF]/70 flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#85837E]">DLQ:</span>
            <span className={`font-bold ${metrics.sqsDlqDepth > 0 ? 'text-[#B91C1C]' : 'text-[#236B43]'}`}>
              {metrics.sqsDlqDepth} msgs
            </span>
          </div>
        </div>

        {/* Node 5: Serverless Lambda Worker */}
        <div
          onClick={() => setSelectedNode(NODE_CATALOG.lambda)}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeStage === 'lambda'
              ? 'bg-[#FFF3EE] border-[#F45B2A] ring-2 ring-[#F45B2A]/20'
              : 'bg-[#F5F3EF]/60 hover:bg-white border-[#D9D6CF] hover:border-[#171717] hover:shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-[#D9D6CF] flex items-center justify-center text-[#171717]">
              <Zap className="w-4 h-4 text-[#F45B2A]" />
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#85837E] border border-[#D9D6CF]">
              05 LAMBDA
            </span>
          </div>
          <div className="text-xs font-bold text-[#171717]">Fraud Worker</div>
          <div className="text-[11px] text-[#85837E] font-mono mt-0.5">Python 3.11</div>
          <div className="mt-2.5 pt-2 border-t border-[#D9D6CF]/70 flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#85837E]">Invocations:</span>
            <span className="text-[#171717] font-bold">{metrics.lambdaInvocations}</span>
          </div>
        </div>

        {/* Node 6: Persistence & SecOps */}
        <div className="p-3.5 rounded-xl border bg-[#F5F3EF]/60 border-[#D9D6CF] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-white border border-[#D9D6CF] flex items-center justify-center text-[#171717]">
                <Key className="w-3 h-3 text-[#F45B2A]" />
              </div>
              <div className="w-5 h-5 rounded bg-white border border-[#D9D6CF] flex items-center justify-center text-[#171717]">
                <Database className="w-3 h-3 text-[#236B43]" />
              </div>
              <div className="w-5 h-5 rounded bg-white border border-[#D9D6CF] flex items-center justify-center text-[#171717]">
                <Table className="w-3 h-3 text-[#1E40AF]" />
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-white text-[#85837E] border border-[#D9D6CF]">
              06 DATA
            </span>
          </div>

          <div className="text-xs font-bold text-[#171717]">Persistence & SecOps</div>
          
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono mt-2 pt-1 border-t border-[#D9D6CF]/70">
            <button
              onClick={() => setSelectedNode(NODE_CATALOG.kms)}
              className="text-left px-1.5 py-0.5 rounded bg-white hover:bg-[#EEECE6] border border-[#D9D6CF] font-semibold text-[#171717]"
            >
              KMS
            </button>
            <button
              onClick={() => setSelectedNode(NODE_CATALOG.rds)}
              className="text-left px-1.5 py-0.5 rounded bg-white hover:bg-[#EEECE6] border border-[#D9D6CF] font-semibold text-[#171717]"
            >
              RDS
            </button>
            <button
              onClick={() => setSelectedNode(NODE_CATALOG.dynamo)}
              className="text-left px-1.5 py-0.5 rounded bg-white hover:bg-[#EEECE6] border border-[#D9D6CF] font-semibold text-[#171717]"
            >
              DDB
            </button>
            <button
              onClick={() => setSelectedNode(NODE_CATALOG.sns)}
              className="text-left px-1.5 py-0.5 rounded bg-white hover:bg-[#EEECE6] border border-[#D9D6CF] font-semibold text-[#171717]"
            >
              SNS
            </button>
          </div>
        </div>

      </div>

      {/* Selected Node Technical Inspection Drawer */}
      {selectedNode && (
        <div className="mt-4 p-4 sm:p-5 bg-white border border-[#D9D6CF] rounded-xl text-xs font-sans shadow-bento animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D9D6CF]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#171717] text-white flex items-center justify-center">
                <Info className="w-4 h-4 text-[#F45B2A]" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#171717]">{selectedNode.name}</div>
                <div className="text-[11px] text-[#85837E] font-mono">
                  {selectedNode.awsService} • {selectedNode.category}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg text-[#85837E] hover:text-[#171717] hover:bg-[#EEECE6] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-3 font-mono">
            <div className="bg-[#F5F3EF] p-2.5 rounded-lg border border-[#D9D6CF]">
              <span className="text-[#85837E] text-[10px] block">CFN RESOURCE:</span>
              <span className="font-bold text-[#171717]">{selectedNode.cfnResource}</span>
            </div>
            <div className="bg-[#F5F3EF] p-2.5 rounded-lg border border-[#D9D6CF]">
              <span className="text-[#85837E] text-[10px] block">SUBNET TIER:</span>
              <span className="text-[#403E39]">{selectedNode.subnetTier}</span>
            </div>
            <div className="bg-[#F5F3EF] p-2.5 rounded-lg border border-[#D9D6CF]">
              <span className="text-[#85837E] text-[10px] block">TARGET ENDPOINT:</span>
              <span className="text-[#171717] truncate block" title={selectedNode.cidrOrEndpoint}>
                {selectedNode.cidrOrEndpoint}
              </span>
            </div>
            <div className="bg-[#F5F3EF] p-2.5 rounded-lg border border-[#D9D6CF]">
              <span className="text-[#85837E] text-[10px] block">DOMAIN:</span>
              <span className="text-[#F45B2A] font-semibold truncate block">
                {selectedNode.cloudDomain}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#85837E] font-bold mb-2">
              Active Security Controls & Verification:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedNode.securityControls.map((ctrl, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-[#F5F3EF] rounded-lg border border-[#D9D6CF] text-[#403E39]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#236B43] shrink-0" />
                  <span>{ctrl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
