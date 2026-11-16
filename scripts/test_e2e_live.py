import urllib.request
import json
import time
import boto3

alb_url = "http://CloudGuard-Production-Stack-ALB-1517300457.ap-south-1.elb.amazonaws.com/api/transfer"
payload = {
    "senderAccount": "ACC-CORP-001",
    "receiverAccount": "ACC-RETAIL-002",
    "amount": 25000,
    "cardToken": "CARD-4532-8821-9923-8910",
    "location": "Mumbai, IN",
    "merchantCode": "MCH-LUXURY-01",
    "narration": "Live AWS ALB Ingestion Test"
}

print(f"Sending POST to {alb_url}...")
req = urllib.request.Request(
    alb_url,
    data=json.dumps(payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        print("ALB Response Status:", resp.status)
        body = json.loads(resp.read().decode())
        print("ALB Response Body:", json.dumps(body, indent=2))
except Exception as ex:
    print("ALB Request Failed:", ex)

# Wait 5 seconds for SQS -> Lambda -> DynamoDB
print("Waiting 6 seconds for Lambda processing...")
time.sleep(6)

session = boto3.Session(region_name='ap-south-1')
dynamodb = session.client('dynamodb')
table_name = 'CloudGuard-Production-Stack-AuditTable'

try:
    items = dynamodb.scan(TableName=table_name, Limit=5)['Items']
    print(f"DynamoDB Table ({table_name}) scanned. Total items found: {len(items)}")
    for it in items:
        print("Item:", {k: list(v.values())[0] for k, v in it.items()})
except Exception as ex:
    print("DynamoDB Scan Error:", ex)
