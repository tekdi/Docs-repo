# Backup and Monitoring System Setup Guide

**Version:** 1.0  
**Last Updated:** $(date +'%Y-%m-%d')

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
wget https://drive.google.com/file/d/1PJRifZ6v1eOJzhi4zi1-BnJWdrngJQ0f/view?usp=drive_link -O setup_backup_monitoring.sh
chmod +x setup_backup_monitoring.sh