'use client';

import React, { useState } from 'react';
import { EditorialSidebar, DashboardView } from './EditorialSidebar';
import { EditorialTopBar } from './EditorialTopBar';
import { OverviewDashboard } from './OverviewDashboard';
import { TransactionsView } from './TransactionsView';
import { FraudSecurityView } from './FraudSecurityView';
import { QueueMonitorView } from './QueueMonitorView';
import { InfrastructureView } from './InfrastructureView';
import { PolyglotDbViewer } from './PolyglotDbViewer';
import { ComplianceAuditView } from './ComplianceAuditView';
import { MonitoringAlertsView } from './MonitoringAlertsView';
import { FinOpsView } from './FinOpsView';

import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_CLOUDTRAIL_EVENTS,
  executeSimulationStep
} from '../lib/aws-simulator';
import {
  BankAccount,
  CloudTrailEvent,
  CloudWatchMetrics,
  ExecutionMode,
  Transaction
} from '../types/cloud';
import { BellRing, X, ShieldCheck } from 'lucide-react';

export default function MasterDashboard() {
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('SIMULATION');
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Synchronize with URL query parameter (?view=...)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view') as DashboardView;
      if (v && [
        'overview', 'transactions', 'fraud', 'queue', 'infrastructure',
        'database', 'compliance', 'monitoring', 'finops'
      ].includes(v)) {
        setCurrentView(v);
      }
    }
  }, []);

  const handleSelectView = (view: DashboardView) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.pushState({}, '', url.toString());
    }
  };

  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(INITIAL_TRANSACTIONS[0]);
  const [cloudTrailEvents, setCloudTrailEvents] = useState<CloudTrailEvent[]>(INITIAL_CLOUDTRAIL_EVENTS);
  const [metrics, setMetrics] = useState<CloudWatchMetrics>({
    ec2CpuUtilization: 34.2,
    sqsQueueDepth: 0,
    sqsDlqDepth: 0,
    lambdaInvocations: 1420,
    lambdaDurationMs: 38,
    activeConnections: 18,
    rdsIops: 240,
    dynamoWriteCapacity: 180
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [burstProgress, setBurstProgress] = useState<{
    active: boolean;
    total: number;
    processed: number;
    remaining: number;
  } | null>(null);
  const [chaosHealing, setChaosHealing] = useState<boolean>(false);

  const [activeSnsToast, setActiveSnsToast] = useState<{
    messageId: string;
    topicArn: string;
    subject: string;
    details: string;
  } | null>(null);

  // Toggle Between Simulation and AWS SDK
  const handleToggleMode = () => {
    setExecutionMode((prev) => (prev === 'SIMULATION' ? 'AWS_SDK_LIVE' : 'SIMULATION'));
  };

  // Transaction Ingress Dispatch Handler
  const handleDispatchTransaction = (payload: {
    senderAccount: string;
    receiverAccount: string;
    amount: number;
    cardToken: string;
    location: string;
    merchantCode: string;
    narration: string;
    forceFraudAnomaly?: boolean;
    forcePoisonPill?: boolean;
  }) => {
    setIsProcessing(true);
    setActiveStage('alb');

    // Simulate animated packet transmission across pipeline stages
    setTimeout(() => setActiveStage('ec2'), 250);
    setTimeout(() => {
      setActiveStage('sqs');
      setMetrics((m) => ({ ...m, sqsQueueDepth: m.sqsQueueDepth + 1 }));
    }, 500);

    setTimeout(() => {
      setActiveStage('lambda');
      setMetrics((m) => ({ ...m, sqsQueueDepth: Math.max(0, m.sqsQueueDepth - 1) }));
    }, 850);

    setTimeout(() => {
      // Execute the simulation step
      const result = executeSimulationStep(payload, accounts, metrics);

      setTransactions((prev) => [result.transaction, ...prev]);
      setSelectedTxn(result.transaction);
      setAccounts(result.accounts);
      setCloudTrailEvents((prev) => [...result.cloudTrail, ...prev]);
      setMetrics(result.cloudWatch);

      if (result.snsToast) {
        setActiveSnsToast(result.snsToast);
      }

      setActiveStage(null);
      setIsProcessing(false);
    }, 1200);
  };

  // 50x Traffic Burst Handler (SQS Buffer & Drain Demonstration)
  const handleTriggerBurst = () => {
    const burstCount = 50;
    setBurstProgress({ active: true, total: burstCount, processed: 0, remaining: burstCount });
    setMetrics((m) => ({
      ...m,
      sqsQueueDepth: m.sqsQueueDepth + burstCount,
      ec2CpuUtilization: 68.4
    }));

    let processed = 0;
    const interval = setInterval(() => {
      processed += 5;
      if (processed >= burstCount) {
        clearInterval(interval);
        setBurstProgress(null);
        setMetrics((m) => ({
          ...m,
          sqsQueueDepth: 0,
          ec2CpuUtilization: 34.2,
          lambdaInvocations: m.lambdaInvocations + burstCount
        }));
      } else {
        setBurstProgress({
          active: true,
          total: burstCount,
          processed,
          remaining: burstCount - processed
        });
        setMetrics((m) => ({
          ...m,
          sqsQueueDepth: Math.max(0, burstCount - processed),
          lambdaInvocations: m.lambdaInvocations + 5
        }));
      }
    }, 400);
  };

  // High Value Fraud Demonstration Trigger
  const handleTriggerFraud = () => {
    handleDispatchTransaction({
      senderAccount: accounts[0]?.accountNumber || 'HDFC-00124891',
      receiverAccount: accounts[1]?.accountNumber || 'ICICI-00918234',
      amount: 245000,
      cardToken: 'CARD-4111-9981-2231-5501',
      location: 'Kyiv, UA (Offshore Proxy)',
      merchantCode: 'MCH-OFFSHORE-99',
      narration: 'Offshore Escrow Transfer',
      forceFraudAnomaly: true
    });
  };

  // Poison Pill DLQ Trigger
  const handleTriggerPoisonPill = () => {
    handleDispatchTransaction({
      senderAccount: accounts[0]?.accountNumber || 'HDFC-00124891',
      receiverAccount: accounts[1]?.accountNumber || 'ICICI-00918234',
      amount: 1500,
      cardToken: 'POISON_PILL_NULL_BYTE_EXPLOIT',
      location: 'UNKNOWN_TOR_EXIT',
      merchantCode: 'MCH-EXPLOIT-00',
      narration: 'MALFORMED_NON_DESERIALIZABLE_PAYLOAD',
      forcePoisonPill: true
    });
  };

  // Chaos EC2 Instance Termination Trigger
  const handleTriggerChaos = () => {
    if (chaosHealing) return;
    setChaosHealing(true);
    setMetrics((m) => ({ ...m, ec2CpuUtilization: 14.5 }));

    setTimeout(() => {
      setMetrics((m) => ({ ...m, ec2CpuUtilization: 29.8 }));
      setChaosHealing(false);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#171717] flex font-sans selection:bg-[#F45B2A]/20 selection:text-[#F45B2A]">
      
      {/* 1. Left Editorial Navigation Shell */}
      <EditorialSidebar
        currentView={currentView}
        onSelectView={handleSelectView}
        executionMode={executionMode}
        onToggleMode={handleToggleMode}
        isOpenMobile={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        sqsQueueDepth={metrics.sqsQueueDepth}
        sqsDlqDepth={metrics.sqsDlqDepth}
      />

      {/* 2. Main Workspace (Pushed right on desktop by 72 / 18rem) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* Editorial Top Telemetry Strip */}
        <EditorialTopBar
          currentView={currentView}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          executionMode={executionMode}
          onToggleMode={handleToggleMode}
          activePacketActive={isProcessing || (burstProgress?.active ?? false)}
          onTriggerBurst={handleTriggerBurst}
          onTriggerFraud={handleTriggerFraud}
          onTriggerPoisonPill={handleTriggerPoisonPill}
          onTriggerChaos={handleTriggerChaos}
          isProcessing={isProcessing}
          burstActive={burstProgress?.active ?? false}
        />

        {/* View Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1700px] w-full mx-auto">
          {currentView === 'overview' && (
            <OverviewDashboard
              accounts={accounts}
              transactions={transactions}
              selectedTxn={selectedTxn}
              onSelectTxn={setSelectedTxn}
              metrics={metrics}
              isProcessing={isProcessing}
              activeStage={activeStage}
              burstProgress={burstProgress}
              onSubmitTransaction={handleDispatchTransaction}
              onTriggerBurst={handleTriggerBurst}
              onNavigateView={handleSelectView}
              onTriggerChaos={handleTriggerChaos}
              chaosHealing={chaosHealing}
            />
          )}

          {currentView === 'transactions' && (
            <TransactionsView
              accounts={accounts}
              transactions={transactions}
              selectedTxn={selectedTxn}
              onSelectTxn={setSelectedTxn}
              onSubmitTransaction={handleDispatchTransaction}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'fraud' && (
            <FraudSecurityView
              transactions={transactions}
              selectedTxn={selectedTxn}
              onSelectTxn={setSelectedTxn}
              cloudTrailEvents={cloudTrailEvents}
              onTriggerFraud={handleTriggerFraud}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'queue' && (
            <QueueMonitorView
              metrics={metrics}
              transactions={transactions}
              onTriggerBurst={handleTriggerBurst}
              onTriggerPoisonPill={handleTriggerPoisonPill}
              isProcessing={isProcessing}
              burstProgress={burstProgress}
            />
          )}

          {currentView === 'infrastructure' && (
            <InfrastructureView metrics={metrics} />
          )}

          {currentView === 'database' && (
            <PolyglotDbViewer
              accounts={accounts}
              transactions={transactions}
              selectedTxn={selectedTxn}
            />
          )}

          {currentView === 'compliance' && (
            <ComplianceAuditView cloudTrailEvents={cloudTrailEvents} />
          )}

          {currentView === 'monitoring' && (
            <MonitoringAlertsView metrics={metrics} />
          )}

          {currentView === 'finops' && (
            <FinOpsView />
          )}
        </main>

        {/* 3. Editorial Footer System Strip */}
        <footer className="border-t border-[#D9D6CF] bg-white/80 backdrop-blur-md px-6 py-4 text-xs font-mono text-[#85837E] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#236B43]" />
            <span className="font-bold text-[#171717] font-sans">CloudGuard Bank Control Platform</span>
            <span className="text-[#D9D6CF]">•</span>
            <span>Cloud Computing Systems Architecture</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="text-[#236B43] bg-[#EDF7F0] px-2.5 py-0.5 rounded border border-[#C6E7D2] font-semibold">
              PCI-DSS v4.0 Req 3.4 & GDPR Art. 32
            </span>
            <span className="text-[#D9D6CF]">|</span>
            <span className="text-[#171717] bg-[#F5F3EF] px-2.5 py-0.5 rounded border border-[#D9D6CF] font-semibold">
              AWS Multi-AZ ap-south-1 & ap-southeast-1 CRR
            </span>
          </div>
        </footer>

      </div>

      {/* 4. Real-Time Amazon SNS Fraud Alert Notification Toast */}
      {activeSnsToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white border border-[#B91C1C] rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 font-sans text-xs">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5 text-[#B91C1C] font-bold">
              <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] flex items-center justify-center text-[#B91C1C]">
                <BellRing className="w-4 h-4 animate-bounce" />
              </div>
              <span className="text-sm font-display">{activeSnsToast.subject}</span>
            </div>
            <button
              onClick={() => setActiveSnsToast(null)}
              className="text-[#85837E] hover:text-[#171717] p-1 rounded-lg hover:bg-[#F5F3EF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[#73716B] text-xs mb-3 font-medium leading-relaxed">
            {activeSnsToast.details}
          </div>

          <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] text-[11px] font-mono space-y-1 text-[#403E39]">
            <div>
              <span className="text-[#85837E]">SNS Topic ARN: </span>
              <span className="text-[#B91C1C] font-medium truncate block">{activeSnsToast.topicArn}</span>
            </div>
            <div>
              <span className="text-[#85837E]">Message ID: </span>
              <span className="text-[#236B43] font-bold">{activeSnsToast.messageId}</span>
            </div>
            <div>
              <span className="text-[#85837E]">CloudWatch State: </span>
              <span className="text-[#B91C1C] font-bold">OK &rarr; ALARM (Tripwire Tripped)</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
