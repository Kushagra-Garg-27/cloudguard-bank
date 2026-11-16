import { NextRequest, NextResponse } from 'next/server';
import { executeSimulationStep, INITIAL_ACCOUNTS } from '@/lib/aws-simulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const isLiveAws = Boolean(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION
    );

    // If live AWS credentials exist, forward to real AWS Ingestion API or SQS
    if (isLiveAws && process.env.EC2_INGESTION_ENDPOINT) {
      try {
        const liveResponse = await fetch(`${process.env.EC2_INGESTION_ENDPOINT}/api/transfer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const liveData = await liveResponse.json();
        return NextResponse.json({
          mode: 'AWS_SDK_LIVE',
          ...liveData
        });
      } catch (liveErr: any) {
        console.warn('Live AWS endpoint unavailable, falling back to simulator:', liveErr.message);
      }
    }

    // High-Fidelity Deterministic Simulator Path
    const currentMetrics = {
      ec2CpuUtilization: 34.2,
      sqsQueueDepth: 0,
      sqsDlqDepth: 0,
      lambdaInvocations: 1420,
      lambdaDurationMs: 38,
      activeConnections: 18,
      rdsIops: 240,
      dynamoWriteCapacity: 180
    };

    const result = executeSimulationStep(
      {
        senderAccount: body.senderAccount || 'HDFC-00124891',
        receiverAccount: body.receiverAccount || 'ICICI-00918234',
        amount: Number(body.amount) || 4500,
        currency: body.currency || 'INR',
        cardToken: body.cardToken,
        location: body.location || 'Mumbai, IN',
        merchantCode: body.merchantCode || 'MCH-RETAIL-99',
        narration: body.narration || 'Online Transfer',
        forceFraudAnomaly: Boolean(body.forceFraudAnomaly),
        forcePoisonPill: Boolean(body.forcePoisonPill)
      },
      INITIAL_ACCOUNTS,
      currentMetrics
    );

    return NextResponse.json({
      mode: 'SIMULATION',
      success: true,
      data: result
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Transaction processing failed'
      },
      { status: 500 }
    );
  }
}
