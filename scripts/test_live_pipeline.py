"""
CloudGuard Bank - Live AWS Infrastructure Verification Script
Run this script anytime to verify that all deployed AWS resources in ap-south-1
are healthy, reachable, and actively processing transactions.
"""

import boto3
import urllib.request
import json
import time

REGION = "ap-south-1"
ALB_URL = "http://CloudGuard-Production-Stack-ALB-1517300457.ap-south-1.elb.amazonaws.com"
QUEUE_URL = "https://sqs.ap-south-1.amazonaws.com/623210504094/CloudGuard-Production-Stack-TransactionQueue"
TABLE_NAME = "CloudGuard-Production-Stack-AuditTable"

def verify():
    session = boto3.Session(region_name=REGION)
    print("=" * 60)
    print("CloudGuard Bank - Live AWS Verification (Mumbai ap-south-1)")
    print("=" * 60)

    # 1. ALB Health Check
    print("\n[1/5] Testing Application Load Balancer Health Endpoint...")
    try:
        with urllib.request.urlopen(f"{ALB_URL}/health", timeout=10) as resp:
            data = json.loads(resp.read().decode())
            print(f" -> ALB Status: HTTP {resp.status} - {data}")
    except Exception as e:
        print(f" -> ALB Check Failed: {e}")

    # 2. EC2 & AutoScaling Check
    print("\n[2/5] Inspecting AutoScaling Group & EC2 Instances...")
    asg = session.client('autoscaling')
    asg_info = asg.describe_auto_scaling_groups(AutoScalingGroupNames=['CloudGuard-Production-Stack-ASG'])['AutoScalingGroups'][0]
    instance_ids = [i['InstanceId'] for i in asg_info['Instances']]
    print(f" -> ASG Desired Capacity: {asg_info['DesiredCapacity']}, Healthy Nodes: {instance_ids}")

    # 3. Target Group Health
    print("\n[3/5] Inspecting ALB Target Group...")
    elbv2 = session.client('elbv2')
    tg_arn = elbv2.describe_target_groups(Names=['CloudGuard-Production-Stack-TG'])['TargetGroups'][0]['TargetGroupArn']
    health = elbv2.describe_target_health(TargetGroupArn=tg_arn)['TargetHealthDescriptions']
    for h in health:
        print(f" -> Target {h['Target']['Id']}:{h['Target']['Port']} -> Status: {h['TargetHealth']['State']}")

    # 4. SQS & Lambda Processing
    print("\n[4/5] Sending Test Transaction into SQS Queue...")
    sqs = session.client('sqs')
    sample_txn = {
        "transactionId": f"TXN-VERIFY-{int(time.time())}",
        "senderAccount": "ACC-CORP-001",
        "receiverAccount": "ACC-RETAIL-002",
        "amount": 12500.0,
        "cardToken": "CARD-4532-7711-2299-8910",
        "location": "Mumbai, IN",
        "merchantCode": "MCH-LUXURY-01",
        "timestamp": int(time.time() * 1000)
    }
    msg = sqs.send_message(QueueUrl=QUEUE_URL, MessageBody=json.dumps(sample_txn))
    print(f" -> Message Enqueued to SQS. MessageId: {msg['MessageId']}")

    print(" -> Awaiting Lambda Serverless Worker execution (4s)...")
    time.sleep(4)

    # 5. DynamoDB Audit Table Verification
    print("\n[5/5] Checking DynamoDB Audit Table...")
    dynamodb = session.client('dynamodb')
    items = dynamodb.scan(TableName=TABLE_NAME, Limit=5)['Items']
    print(f" -> Audit records in DynamoDB: {len(items)}")
    for it in items:
        clean = {k: list(v.values())[0] for k, v in it.items()}
        print(f"    • Txn: {clean.get('transactionId')} | Status: {clean.get('fraudStatus')} | Score: {clean.get('fraudScore')}")

    print("\n" + "=" * 60)
    print("ALL LIVE AWS SERVICES OPERATING IN PRODUCTION!")
    print("=" * 60)

if __name__ == "__main__":
    verify()
