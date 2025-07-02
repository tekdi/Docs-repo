
# AWS EC2 CloudWatch Alarm Setup

---

## 📌 Purpose

This script automates the configuration of **CloudWatch Alarms** for **EC2 instances** based on **CPU**, **Memory**, and **Disk utilization**. It also:

- Creates SNS topics per environment.
- Subscribes a user email to receive alert notifications.
- Creates alarms for each EC2 instance with user-defined thresholds.

---

## ⚙️ Prerequisites

- **AWS CLI** installed on your system.
- Properly configured **AWS credentials** or role-based access.
- EC2 instances must have **CloudWatch Agent** installed and configured to collect RAM and Disk metrics.

---

## 🚀 How to Use

### 1. ✅ Install AWS CLI

```bash
sudo apt install awscli  # Debian/Ubuntu
# or
brew install awscli      # macOS
```

### 2. ✅ Ensure IAM Permissions

Your IAM user or role must have permission for:
- `cloudwatch:PutMetricAlarm`
- `sns:CreateTopic`
- `sns:Subscribe`

### 3. ✅ Install and Configure CloudWatch Agent (for RAM and Disk)

```bash
sudo yum install amazon-cloudwatch-agent
# or
sudo apt install amazon-cloudwatch-agent

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
sudo systemctl start amazon-cloudwatch-agent
```

### 4. ✅ Run the Script

```bash
chmod +x setup_cloudwatch_alarms.sh
./setup_cloudwatch_alarms.sh
```

### 5. 📧 Confirm Email Subscription

Check your inbox and confirm the SNS subscription.

---

## 🛠 Script: `setup_cloudwatch_alarms.sh`

```bash
#!/bin/bash

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        echo "AWS CLI is not installed. Please install it and try again."
        exit 1
    fi
}

# Function to configure AWS CLI
configure_aws() {
    echo "Enter your AWS Region: "
    read -r region
    aws configure set region "$region"
    echo "AWS CLI configured successfully."
}

# Function to create an SNS topic
create_sns_topic() {
    local environment=$1
    local metric=$2
    local topic_name="${environment}_${metric}_alerts"
    local sns_topic_arn
    sns_topic_arn=$(aws sns create-topic --name "$topic_name" --query "TopicArn" --output text)
    echo "$sns_topic_arn"
}

# Function to subscribe email to SNS topic
subscribe_email() {
    local email=$1
    local sns_topic_arn=$2
    aws sns subscribe --topic-arn "$sns_topic_arn" --protocol email --notification-endpoint "$email"
}

# Function to create a CloudWatch alarm
create_alarm() {
    local instance_id=$1
    local metric=$2
    local threshold=$3
    local sns_topic_arn=$4
    local environment=$5

    local alarm_name="${environment}_${metric}_Threshold${threshold}_${instance_id}"

    aws cloudwatch put-metric-alarm \
        --alarm-name "$alarm_name" \
        --metric-name "$metric" \
        --namespace "AWS/EC2" \
        --statistic "Average" \
        --dimensions "Name=InstanceId,Value=$instance_id" \
        --period 300 \
        --evaluation-periods 1 \
        --threshold "$threshold" \
        --comparison-operator "GreaterThanOrEqualToThreshold" \
        --alarm-actions "$sns_topic_arn"
}

# Main script
check_aws_cli
configure_aws

echo "Enter the instance IDs (comma-separated): "
read -r instance_ids
echo "Enter the environment (e.g., dev, prod): "
read -r environment
echo "Enter CPU thresholds (comma-separated, default: 50,75,85): "
read -r cpu_thresholds
cpu_thresholds=${cpu_thresholds:-50,75,85}
echo "Enter RAM thresholds (comma-separated, default: 50,75,85): "
read -r ram_thresholds
ram_thresholds=${ram_thresholds:-50,75,85}
echo "Enter Disk thresholds (comma-separated, default: 50,75,85): "
read -r disk_thresholds
disk_thresholds=${disk_thresholds:-50,75,85}
echo "Enter the email address for notifications: "
read -r email

# Create SNS topics
cpu_topic_arn=$(create_sns_topic "$environment" "CPU")
ram_topic_arn=$(create_sns_topic "$environment" "RAM")
disk_topic_arn=$(create_sns_topic "$environment" "Disk")

# Subscribe email to topics
subscribe_email "$email" "$cpu_topic_arn"
subscribe_email "$email" "$ram_topic_arn"
subscribe_email "$email" "$disk_topic_arn"

# Create alarms for each instance
IFS=',' read -ra ids <<< "$instance_ids"
for id in "${ids[@]}"; do
    IFS=',' read -ra cpu_values <<< "$cpu_thresholds"
    for value in "${cpu_values[@]}"; do
        create_alarm "$id" "CPUUtilization" "$value" "$cpu_topic_arn" "$environment"
    done

    IFS=',' read -ra ram_values <<< "$ram_thresholds"
    for value in "${ram_values[@]}"; do
        create_alarm "$id" "MemoryUtilization" "$value" "$ram_topic_arn" "$environment"
    done

    IFS=',' read -ra disk_values <<< "$disk_thresholds"
    for value in "${disk_values[@]}"; do
        create_alarm "$id" "DiskSpaceUtilization" "$value" "$disk_topic_arn" "$environment"
    done
done

echo "Alerts successfully created for all instances."
```

---

## 📢 Outputs

- SNS topics created for CPU, RAM, and Disk alerts.
- Email subscriptions created (pending confirmation).
- CloudWatch alarms per instance and metric.

---

## 📌 Alarm Naming Convention

```
<environment>_<metric>_Threshold<threshold>_<instance-id>
```

**Example:**
```
prod_CPUUtilization_Threshold85_i-0123456789abcdef0
```

---

## 🧼 Limitations and Recommendations

- RAM and Disk metrics require **CloudWatch Agent**.
- Email confirmation is **mandatory** before alerts work.
- Currently supports only one email address.
- Consider extending this script to:
  - Add SMS or Slack notifications.
  - Handle deletion of alarms/SNS topics.
  - Include logging.

---
