# Backup and Monitoring System Setup Guide


---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)
8. [Security](#security)
9. [Script Reference](#script-reference)

---

## Overview

This system provides automated backups for **PostgreSQL** and **MongoDB** databases with optional monitoring via:

- **AWS CloudWatch** (for cloud environments)
- **Prometheus + Grafana** (for on-premises visualization)

Key Features:
- Daily compressed backups with retention policy
- One-click restore functionality
- Interactive setup script
- Log rotation and monitoring

---

## Prerequisites

### For All Systems
- Linux server (Ubuntu/CentOS recommended)
- `sudo` privileges
- Docker installed
- `docker-compose` (for Prometheus/Grafana)

### For CloudWatch
- AWS account with IAM permissions
- AWS CLI configured (`aws configure`)

### For Prometheus/Grafana
- Open ports: `9090` (Prometheus), `3000` (Grafana), `8080` (cAdvisor)

---

## Installation

### 1. Download the Script
```bash
wget https://drive.google.com/file/d/19EfWRFF5bJFtAkJoNBo5INapjxicB828/view?usp=drive_link -O setup_backup_monitoring.sh
chmod +x setup_backup_monitoring.sh

## 2. Run Interactive Setup

```bash
./setup_backup_monitoring.sh
```

## 3. Follow Prompts

The script will guide you through:

- Backup system configuration
- Monitoring system selection
- Final confirmation

---

## Configuration

### Backup System Defaults

| Parameter           | Default Value                            |
|---------------------|-------------------------------------------|
| Base Directory      | /opt/backup-monitoring                   |
| Retention Period    | 7 days                                   |
| PostgreSQL User     | postgres                                 |
| Backup Schedule     | MongoDB: 2 AM, PostgreSQL: 3 AM          |

### Monitoring Options

#### CloudWatch
- **Metrics**: Disk/Memory usage
- **Config**: `cloudwatch-config.json`

#### Prometheus/Grafana

| Service    | Port | Credentials              |
|------------|------|---------------------------|
| Prometheus | 9090 | None                      |
| Grafana    | 3000 | admin / [your-password]   |
| cAdvisor   | 8080 | None                      |

---

## Usage

### Manual Backups

```bash
/opt/backup-monitoring/postgres_backup.sh
/opt/backup-monitoring/mongo_backup.sh
```

### Restore Databases

```bash
/opt/backup-monitoring/postgres_restore.sh  # Follow date prompt
/opt/backup-monitoring/mongo_restore.sh     # Follow date prompt
```

### Access Monitoring

- Prometheus: `http://<server-ip>:9090`
- Grafana: `http://<server-ip>:3000`

---

## Troubleshooting

### Common Issues

| Symptom                  | Solution                            |
|--------------------------|-------------------------------------|
| Backup fails             | Check container names in logs       |
| Grafana inaccessible     | Verify port 3000 is open            |
| CloudWatch metrics missing | Check IAM permissions            |

### Log Locations

- **Backup logs**: `/opt/backup-monitoring/logs/`
- **Docker logs**: `docker logs [container-name]`

---

## Maintenance

### Update Retention

```bash
nano /opt/backup-monitoring/postgres_backup.sh  # Edit RETENTION_DAYS
nano /opt/backup-monitoring/mongo_backup.sh
```

### Rotate Logs

```bash
logrotate -f /etc/logrotate.d/backup_logs
```

---

## Security

- 🔒 Change default Grafana password
- 🔐 Restrict access to monitoring ports
- 🛡️ Update Docker images regularly:

```bash
docker-compose -f /opt/backup-monitoring/docker-compose.yml pull
```
