# 📘 AWS Environment Tagging + Daily Cost Reporting (Slack Notifications) – Full Implementation Guide

This document explains the full end-to-end process for:
- Tagging AWS resources environment-wise using `TAG.py`
- Setting up Slack + S3 prerequisites
- Creating and configuring a Lambda function for daily cost reporting
- Configuring IAM trust relationships & policies
- Uploading Lambda code (`lambda.py`)
- Testing the end-to-end solution

---

## 1. Prerequisites

Before starting the implementation, ensure the following items are already prepared.

### ✅ 1. Slack Channel
Create a Slack channel where daily cost updates will be posted.

### ✅ 2. Slack Webhook URL
Create an Incoming Webhook:
1. Go to **Slack → Apps → Incoming Webhooks**
2. Click **Add to Slack**
3. Select your channel
4. Copy the Webhook URL

You will use this in Lambda as an environment variable:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### ✅ 3. S3 Private Bucket
A private S3 bucket for storing daily cost histories.

**Example bucket:** `my-cost-history-bucket`

Set this bucket name as:
```
S3_BUCKET=my-cost-history-bucket
```

---

## 2. Using TAG.py for AWS Resource Tagging

**File referenced:** `TAG.py`

### Overview
This script:
- Discovers VPCs in the selected region
- Lets you select which VPCs to process
- Lets you assign Environment values (`saas-prod`, `saas-qa`, `sl-prod`, `sl-qa`, or custom)
- Tags all VPC-scoped resources

### Resources Tagged by TAG.py
- VPC
- Subnets
- Route Tables
- Internet Gateways
- NAT Gateways
- ENIs (Network Interfaces)
- Elastic IPs
- Security Groups
- EC2 Instances
- EBS Volumes
- EBS Snapshots
- AMIs
- Launch Templates
- Auto Scaling Groups (propagate at launch)
- Load Balancers (ALB/NLB)
- Target Groups
- Listeners
- VPC Endpoints
- VPC Peering Connections

### Key Configuration
**Environment Tag Key:** `Environment` (Line 28)

**Environment Values:** (Lines 137-140)
- `TAG1` → `saas-prod`
- `TAG2` → `saas-qa`
- `TAG3` → `sl-prod`
- `TAG4` → `sl-qa`

### 2.1 How to Run the Script

**Install dependencies:**
```bash
pip install boto3 botocore
```

**Run script:**
```bash
python3 TAG.py --region ap-south-1
```

**To preview without tagging:**
```bash
python3 TAG.py --region ap-south-1 --dry-run
```

---

## 3. User Inputs While Running TAG.py

Below is the complete user interaction flow.

### 3.1 Step 1: Script Lists All VPCs

Example output:
```
#    VPC ID               Name                     CIDR             Default
1    vpc-123abc          test1                    172.31.0.0/16    True
2    vpc-456def          test2                    10.0.0.0/16      False
3    vpc-789ghi          test3                    10.1.0.0/16      False
```

### 3.2 Step 2: Select VPCs to Tag

Example:
```
Your choice: 1,3
```

OR select all:
```
Your choice: <Enter>
```

### 3.3 Step 3: Assign Environment Tags

For each VPC, you will be prompted:
```
1) TAG1
2) TAG2
3) TAG3
4) TAG4
5) Custom value
6) Skip this VPC
```

**Your implementation defines:**
- `TAG1` → `saas-prod`
- `TAG2` → `saas-qa`
- `TAG3` → `sl-prod`
- `TAG4` → `sl-qa`

**Example:**
- Select `2` for `saas-qa`
- Or choose `5` for custom:
  ```
  Enter custom Environment value: dev-test
  ```

### 3.4 Step 4: Confirmation

```
Proceed with tagging these VPCs? (yes/no): yes
```

---

## 4. Verify Tags Are Applied Correctly

After `TAG.py` finishes, pick any random resources and check if the Environment tag is correctly assigned:

### Example Commands

**EC2 Instance:**
```bash
aws ec2 describe-instances --instance-ids i-123 --query "Reservations[].Instances[].Tags"
```

**Subnet:**
```bash
aws ec2 describe-subnets --subnet-ids subnet-abc --query "Subnets[].Tags"
```

**AMI:**
```bash
aws ec2 describe-images --image-ids ami-xyz --query "Images[].Tags"
```

---

## 5. Create the AWS Lambda Function

This Lambda will:
- Fetch finalized AWS cost (D-2 & D-3)
- Compare costs
- Publish a formatted report to Slack
- Store history in S3

### 5.1 Steps to Create Lambda Function

**Step 1 — Open AWS Lambda Console**
1. Go to **AWS Console → Lambda**
2. Click **Create Function**
3. Choose **Author from scratch**
4. Fill details:

| Field | Value |
|-------|-------|
| Name | `aws-cost-report-lambda` |
| Runtime | Python 3.12 |
| Architecture | x86_64 |
| Execution role | Create new role with basic permissions |

5. Click **Create Function**

---

## 6. Configure Lambda Environment Variables

Go to **Lambda → Configuration → Environment Variables**

Add:

| Key | Value |
|-----|-------|
| `SLACK_WEBHOOK_URL` | `<Your Slack Webhook>` |
| `S3_BUCKET` | `<Your Private Bucket Name>` |
| `USE_SUMMARY_MESSAGE` | `true` |

**Example:**
```
SLACK_WEBHOOK_URL = https://hooks.slack.com/services/T0000/B000/XXXX
S3_BUCKET = my-cost-history-bucket
USE_SUMMARY_MESSAGE = true
```

---

## 7. IAM Role Configuration

Open: **Lambda → Configuration → Permissions → Execution Role → IAM**

### 7.1 Update Trust Relationship

Go to **Trust Relationships → Edit**

Paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### 7.2 Add Policies

**Policy 1 — Access to Cost Explorer + S3 + CloudWatch Logs**

⚠️ Replace `<privatebucketname>` with your bucket.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CostExplorerAccess",
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::<privatebucketname>",
        "arn:aws:s3:::<privatebucketname>/*"
      ]
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:ap-south-1:*:*"
    }
  ]
}
```

**Policy 2 — Cost Explorer + CloudWatch**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CostExplorerAccess",
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

**Attach both policies.**

---

## 8. Upload Lambda Code

Under **Lambda → Code → Upload ZIP / Paste Code**

Paste the content of `lambda.py`:

**⚠️ Variables to Replace:**
- Line 21: `BUCKET_NAME`
- Line 22: `COST_HISTORY_KEY`
- Line 23: `SLACK_WEBHOOK`
- Line 24: `USE_SUMMARY`

**Environment Mapping (Lines 26-33):**
```python
ENVIRONMENTS = {
    'tag1': 'TAG1',
    'tag2': 'TAG2',
    'tag3': 'TAG3',
    'tag4': 'TAG4',
    'common': 'COMMON',
    'untagged': 'UNTAGGED'
}
```

Click **Deploy**.

---

## 9. Test the Lambda Function

### Step 1: Create Test Event
1. Go to **Test → Create Test Event**
2. Choose "Hello World" template
3. Set event name: `cost-test-event`
4. Leave event JSON default: `{}`

### Step 2: Click Test

**Expected results:**
- ✅ Lambda returns HTTP 200
- ✅ Slack receives formatted cost messages
- ✅ S3 stores `cost-history.json` file

---

## 10. Final Architecture Summary

| Component | Purpose |
|-----------|---------|
| `TAG.py` | Tags VPC-scoped resources with correct Environment tag |
| Lambda | Fetches finalized billing for D-2 and compares with D-3 |
| Slack Webhook | Sends daily cost report |
| S3 Bucket | Stores daily cost history |
| IAM Roles/Policies | Allows Lambda access to CE + S3 + CW Logs |

---

## Key Features

### TAG.py Script
- ✅ Interactive VPC selection
- ✅ Custom environment values
- ✅ Dry-run mode for preview
- ✅ Comprehensive resource tagging
- ✅ Summary report after execution

### Lambda Function
- ✅ Fetches finalized billing data (D-2)
- ✅ Compares with previous day (D-3)
- ✅ Parallel cost fetching for performance
- ✅ Trend indicators (📈 📉 ➡️)
- ✅ Summary or detailed Slack reports
- ✅ Historical cost tracking in S3

---

**📌 Note:** Ensure all environment variables and IAM policies are correctly configured before running the Lambda function in production.