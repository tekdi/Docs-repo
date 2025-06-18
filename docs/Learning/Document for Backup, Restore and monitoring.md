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

### 1. Copy the Script

```bash
#!/bin/bash

# Function to log messages
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

log "Starting interactive setup for Backup and Monitoring System."

# Initialize configuration variables
BASE_DIR=""
POSTGRES_CONTAINER=""
MONGO_CONTAINER=""
RETENTION_DAYS=""
POSTGRES_USER=""
POSTGRES_PASSWORD=""
MONGO_BACKUP_HOUR=""
POSTGRES_BACKUP_HOUR=""
SETUP_BACKUP=false
SETUP_MONITORING=false
MONITOR_TYPE=""
CLOUDWATCH_CONFIG=""
PROMETHEUS_PORT=""
GRAFANA_PORT=""
CADVISOR_PORT=""
GRAFANA_PASSWORD=""

# Function to validate directory path
validate_directory() {
    local dir=$1
    if [[ ! -d "$dir" ]]; then
        read -p "Directory $dir does not exist. Create it? (yes/no): " create_dir
        if [[ "$create_dir" =~ ^(yes|y)$ ]]; then
            mkdir -p "$dir" || {
                log "Failed to create directory $dir"
                return 1
            }
            return 0
        else
            return 1
        fi
    fi
    return 0
}

# Function to validate container name
validate_container() {
    local container=$1
    if ! docker ps --format '{{.Names}}' | grep -q "^${container}\$"; then
        log "Warning: Container '$container' not found in running Docker containers."
        read -p "Continue anyway? (yes/no): " continue_anyway
        if [[ ! "$continue_anyway" =~ ^(yes|y)$ ]]; then
            return 1
        fi
    fi
    return 0
}

# Function to validate port
validate_port() {
    local port=$1
    if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
        log "Invalid port number: $port. Must be between 1-65535."
        return 1
    fi
    
    if ss -tuln | grep -q ":${port} "; then
        log "Warning: Port $port is already in use."
        read -p "Continue anyway? (yes/no): " continue_anyway
        if [[ ! "$continue_anyway" =~ ^(yes|y)$ ]]; then
            return 1
        fi
    fi
    return 0
}

# Function to collect backup configuration
collect_backup_config() {
    log "Collecting backup system configuration..."
    
    # Get base directory
    while true; do
        read -p "Enter base directory for scripts (default: /opt/backup-monitoring): " BASE_DIR
        BASE_DIR=${BASE_DIR:-/opt/backup-monitoring}
        if validate_directory "$BASE_DIR"; then
            break
        fi
    done

    # Get container names
    while true; do
        read -p "Enter PostgreSQL Docker container name: " POSTGRES_CONTAINER
        if validate_container "$POSTGRES_CONTAINER"; then
            break
        fi
    done

    while true; do
        read -p "Enter MongoDB Docker container name: " MONGO_CONTAINER
        if validate_container "$MONGO_CONTAINER"; then
            break
        fi
    done

    # Get retention policy
    while true; do
        read -p "Enter backup retention period in days (default: 7): " RETENTION_DAYS
        RETENTION_DAYS=${RETENTION_DAYS:-7}
        if [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]] && [ "$RETENTION_DAYS" -gt 0 ]; then
            break
        else
            log "Invalid retention period. Please enter a positive number."
        fi
    done

    # Get PostgreSQL credentials
    read -p "Enter PostgreSQL username (default: postgres): " POSTGRES_USER
    POSTGRES_USER=${POSTGRES_USER:-postgres}
    read -s -p "Enter PostgreSQL password (leave empty if none): " POSTGRES_PASSWORD
    echo ""

    # Get backup schedule
    while true; do
        read -p "Enter hour for MongoDB backup (0-23, default 2): " MONGO_BACKUP_HOUR
        MONGO_BACKUP_HOUR=${MONGO_BACKUP_HOUR:-2}
        if [[ "$MONGO_BACKUP_HOUR" =~ ^[0-9]+$ ]] && [ "$MONGO_BACKUP_HOUR" -ge 0 ] && [ "$MONGO_BACKUP_HOUR" -le 23 ]; then
            break
        else
            log "Invalid hour. Please enter between 0-23."
        fi
    done

    while true; do
        read -p "Enter hour for PostgreSQL backup (0-23, default 3): " POSTGRES_BACKUP_HOUR
        POSTGRES_BACKUP_HOUR=${POSTGRES_BACKUP_HOUR:-3}
        if [[ "$POSTGRES_BACKUP_HOUR" =~ ^[0-9]+$ ]] && [ "$POSTGRES_BACKUP_HOUR" -ge 0 ] && [ "$POSTGRES_BACKUP_HOUR" -le 23 ]; then
            break
        else
            log "Invalid hour. Please enter between 0-23."
        fi
    done

    SETUP_BACKUP=true
}

# Function to collect CloudWatch configuration
collect_cloudwatch_config() {
    log "Collecting CloudWatch configuration..."
    
    read -p "Enter metrics collection interval in seconds (default: 60): " COLLECTION_INTERVAL
    COLLECTION_INTERVAL=${COLLECTION_INTERVAL:-60}

    read -p "Monitor disk usage? (yes/no, default: yes): " MONITOR_DISK
    MONITOR_DISK=${MONITOR_DISK:-yes}

    read -p "Monitor memory usage? (yes/no, default: yes): " MONITOR_MEM
    MONITOR_MEM=${MONITOR_MEM:-yes}

    # Build metrics_collected object
    METRICS_COLLECTED="{"
    if [[ "$MONITOR_DISK" =~ ^(yes|y)$ ]]; then
        METRICS_COLLECTED+="\"disk\":{\"measurement\":[\"used_percent\"],\"metrics_collection_interval\":$COLLECTION_INTERVAL,\"resources\":[\"*\"]},"
    fi
    if [[ "$MONITOR_MEM" =~ ^(yes|y)$ ]]; then
        METRICS_COLLECTED+="\"mem\":{\"measurement\":[\"mem_used_percent\"],\"metrics_collection_interval\":$COLLECTION_INTERVAL},"
    fi
    METRICS_COLLECTED=${METRICS_COLLECTED%,}
    METRICS_COLLECTED+="}"

    CLOUDWATCH_CONFIG="$BASE_DIR/cloudwatch-config.json"
    cat <<EOF >"$CLOUDWATCH_CONFIG"
{
    "agent": {
        "metrics_collection_interval": $COLLECTION_INTERVAL,
        "run_as_user": "root"
    },
    "metrics": {
        "aggregation_dimensions": [["InstanceId"]],
        "append_dimensions": {
            "InstanceId": "\${aws:InstanceId}"
        },
        "metrics_collected": $METRICS_COLLECTED
    }
}
EOF

    MONITOR_TYPE="cloudwatch"
    SETUP_MONITORING=true
}

# Function to collect Prometheus/Grafana configuration
collect_prometheus_config() {
    log "Collecting Prometheus & Grafana configuration..."
    
    # Get server IP
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    # Get configuration options
    while true; do
        read -p "Enter Prometheus port (default: 9090): " PROMETHEUS_PORT
        PROMETHEUS_PORT=${PROMETHEUS_PORT:-9090}
        if validate_port "$PROMETHEUS_PORT"; then
            break
        fi
    done

    while true; do
        read -p "Enter Grafana port (default: 3000): " GRAFANA_PORT
        GRAFANA_PORT=${GRAFANA_PORT:-3000}
        if validate_port "$GRAFANA_PORT"; then
            break
        fi
    done

    while true; do
        read -p "Enter cAdvisor port (default: 8080): " CADVISOR_PORT
        CADVISOR_PORT=${CADVISOR_PORT:-8080}
        if validate_port "$CADVISOR_PORT"; then
            break
        fi
    done

    read -p "Enter Grafana admin password (default: admin): " GRAFANA_PASSWORD
    GRAFANA_PASSWORD=${GRAFANA_PASSWORD:-admin}

    MONITOR_TYPE="prometheus"
    SETUP_MONITORING=true
}

# Function to show configuration summary
show_config_summary() {
    echo ""
    echo "========================================"
    echo "       Configuration Summary"
    echo "========================================"
    
    if [ "$SETUP_BACKUP" = true ]; then
        echo "Backup System:"
        echo "  Base Directory: $BASE_DIR"
        echo "  PostgreSQL Container: $POSTGRES_CONTAINER"
        echo "  MongoDB Container: $MONGO_CONTAINER"
        echo "  Retention Period: $RETENTION_DAYS days"
        echo "  PostgreSQL User: $POSTGRES_USER"
        echo "  MongoDB Backup Hour: $MONGO_BACKUP_HOUR:00"
        echo "  PostgreSQL Backup Hour: $POSTGRES_BACKUP_HOUR:00"
        echo ""
    fi
    
    if [ "$SETUP_MONITORING" = true ]; then
        echo "Monitoring System:"
        if [ "$MONITOR_TYPE" = "cloudwatch" ]; then
            echo "  Type: AWS CloudWatch"
            echo "  Config File: $CLOUDWATCH_CONFIG"
            echo "  Collection Interval: $COLLECTION_INTERVAL seconds"
        elif [ "$MONITOR_TYPE" = "prometheus" ]; then
            echo "  Type: Prometheus & Grafana"
            echo "  Prometheus Port: $PROMETHEUS_PORT"
            echo "  Grafana Port: $GRAFANA_PORT"
            echo "  cAdvisor Port: $CADVISOR_PORT"
            echo "  Grafana Admin Password: $GRAFANA_PASSWORD"
        fi
        echo ""
    fi
    
    read -p "Proceed with this configuration? (yes/no): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^(yes|y)$ ]]; then
        log "Configuration aborted by user."
        exit 0
    fi
}

# Function to setup backup scripts
setup_backup_scripts() {
    log "Setting up backup system..."
    
    # Subdirectories
    LOG_DIR="$BASE_DIR/logs"
    POSTGRES_BACKUP_DIR="$BASE_DIR/postgres-backup"
    MONGO_BACKUP_DIR="$BASE_DIR/mongo-backup"
    
    mkdir -p "$LOG_DIR" "$POSTGRES_BACKUP_DIR" "$MONGO_BACKUP_DIR"

    # Create postgres_backup.sh with all variables expanded
    cat <<EOF >"$BASE_DIR/postgres_backup.sh"
#!/bin/bash

# Configurations
DOCKER_CONTAINER_NAME="$POSTGRES_CONTAINER"
BACKUP_DIR="$POSTGRES_BACKUP_DIR"
RETENTION_DAYS=$RETENTION_DAYS
POSTGRES_USER="$POSTGRES_USER"
POSTGRES_PASSWORD="$POSTGRES_PASSWORD"
DATE=\$(date +%F)

# Ensure backup directory exists
mkdir -p "\$BACKUP_DIR"

# Create today's backup directory
TODAYS_BACKUP_DIR="\$BACKUP_DIR/\$DATE"
mkdir -p "\$TODAYS_BACKUP_DIR"

# Function to log messages
log() {
  echo "\$(date +'%Y-%m-%d %H:%M:%S') - \$1" >> "$LOG_DIR/postgres_backup.log"
}

log "Starting PostgreSQL backup process."

# Set password if provided
if [ -n "\$POSTGRES_PASSWORD" ]; then
    export PGPASSWORD="\$POSTGRES_PASSWORD"
fi

# Step 1: List all databases
log "Fetching database list from container: \$DOCKER_CONTAINER_NAME"
DATABASES=\$(docker exec -i "\$DOCKER_CONTAINER_NAME" psql -U "\$POSTGRES_USER" -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;")
if [ -z "\$DATABASES" ]; then
  log "No databases found or an error occurred. Exiting."
  exit 1
fi

log "Databases found: \$DATABASES"

# Step 2: Backup each database
for DB in \$DATABASES; do
  DB=\${DB// /} # Remove whitespace
  if [ -n "\$DB" ]; then
    DUMP_FILE="\$TODAYS_BACKUP_DIR/\$DB.sql"
    log "Backing up database: \$DB to \$DUMP_FILE"
    docker exec -i "\$DOCKER_CONTAINER_NAME" pg_dump -U "\$POSTGRES_USER" "\$DB" > "\$DUMP_FILE"
  fi
done

# Step 3: Compress the backups into a zip file
ZIP_FILE="\$BACKUP_DIR/\$DATE.zip"
log "Compressing backup files into: \$ZIP_FILE"
cd "\$BACKUP_DIR" || exit 1
zip -r "\$DATE.zip" "\$DATE" > /dev/null 2>&1
rm -rf "\$TODAYS_BACKUP_DIR" # Remove uncompressed backup folder
log "Backup completed and stored at \$ZIP_FILE"

# Step 4: Retention policy - Delete backups older than retention period
log "Applying retention policy: Keeping last \$RETENTION_DAYS days of backups."
find "\$BACKUP_DIR" -type f -name "*.zip" -mtime +\$RETENTION_DAYS -exec rm -f {} \;
log "Old backups removed."

log "PostgreSQL backup process completed successfully."
EOF
    chmod +x "$BASE_DIR/postgres_backup.sh"
    log "Created and set permissions for postgres_backup.sh."

    # Create postgres_restore.sh with all variables expanded
    cat <<EOF >"$BASE_DIR/postgres_restore.sh"
#!/bin/bash

# Configurations
DOCKER_CONTAINER_NAME="$POSTGRES_CONTAINER"
BACKUP_DIR="$POSTGRES_BACKUP_DIR"
POSTGRES_USER="$POSTGRES_USER"
POSTGRES_PASSWORD="$POSTGRES_PASSWORD"

# Function to log messages
log() {
  echo "\$(date +'%Y-%m-%d %H:%M:%S') - \$1" >> "$LOG_DIR/postgres_restore.log"
}

# Set password if provided
if [ -n "\$POSTGRES_PASSWORD" ]; then
    export PGPASSWORD="\$POSTGRES_PASSWORD"
fi

# Step 1: Ask for the date to restore
read -p "Enter the backup date to restore (YYYY-MM-DD): " RESTORE_DATE

# Validate the date format
if ! [[ \$RESTORE_DATE =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}\$ ]]; then
  log "Invalid date format. Use YYYY-MM-DD."
  exit 1
fi

ZIP_FILE="\$BACKUP_DIR/\$RESTORE_DATE.zip"

# Step 2: Check if the backup file exists
if [ ! -f "\$ZIP_FILE" ]; then
  log "Backup file \$ZIP_FILE not found. Exiting."
  exit 1
fi

log "Backup file found: \$ZIP_FILE"

# Step 3: Unzip the file
TEMP_RESTORE_DIR="\$BACKUP_DIR/\$RESTORE_DATE"
mkdir -p "\$TEMP_RESTORE_DIR"
log "Extracting \$ZIP_FILE to \$TEMP_RESTORE_DIR"
unzip -o "\$ZIP_FILE" -d "\$TEMP_RESTORE_DIR" > /dev/null 2>&1

# Step 4: Create databases and restore
log "Restoring databases from backup files."
for DUMP_FILE in "\$TEMP_RESTORE_DIR"/*.sql; do
  if [ -f "\$DUMP_FILE" ]; then
    DB_NAME=\$(basename "\$DUMP_FILE" .sql)

    log "Ensuring database '\$DB_NAME' exists."
    docker exec -i "\$DOCKER_CONTAINER_NAME" psql -U "\$POSTGRES_USER" -c "CREATE DATABASE \"\$DB_NAME\";" > /dev/null 2>&1

    log "Restoring dump file \$DUMP_FILE into database \$DB_NAME."
    docker exec -i "\$DOCKER_CONTAINER_NAME" psql -U "\$POSTGRES_USER" -d "\$DB_NAME" < "\$DUMP_FILE"
  fi
done

# Step 5: Cleanup temporary restore directory
log "Cleaning up temporary files."
rm -rf "\$TEMP_RESTORE_DIR"

log "Database restore process completed successfully."
EOF
    chmod +x "$BASE_DIR/postgres_restore.sh"
    log "Created and set permissions for postgres_restore.sh."

    # Create mongo_backup.sh with all variables expanded
    cat <<EOF >"$BASE_DIR/mongo_backup.sh"
#!/bin/bash

# Configuration variables
CONTAINER_NAME="$MONGO_CONTAINER"
BACKUP_DIR="$MONGO_BACKUP_DIR"
RETENTION_DAYS=$RETENTION_DAYS
EXCLUDE_DBS=("admin" "config" "local")  # Databases to exclude

# Function to log messages
log() {
  echo "\$(date +'%Y-%m-%d %H:%M:%S') - \$1" >> "$LOG_DIR/mongo_backup.log"
}

# Create backup directory for today
TODAY=\$(date +"%Y-%m-%d")
TODAY_DIR="\$BACKUP_DIR/tmp_\$TODAY"
mkdir -p "\$TODAY_DIR"

# Step 1: List databases
DATABASES=\$(docker exec "\$CONTAINER_NAME" mongo --quiet --eval "db.adminCommand('listDatabases').databases.map(db => db.name).join(' ')" | tr -d '\r')

# Step 2: Filter databases to exclude specified ones
DBS_TO_BACKUP=()
for DB in \$DATABASES; do
  if [[ ! " \${EXCLUDE_DBS[@]} " =~ " \${DB} " ]]; then
    DBS_TO_BACKUP+=("\$DB")
  fi
done

# Step 3: Dump each database
for DB in "\${DBS_TO_BACKUP[@]}"; do
  log "Backing up database: \$DB"
  docker exec "\$CONTAINER_NAME" mongodump --db="\$DB" --archive > "\$TODAY_DIR/\$DB.archive"
done

# Step 4: Compress the backup
ZIP_FILE="\$BACKUP_DIR/\${TODAY}.zip"
(cd "\$TODAY_DIR" && zip -r "\$ZIP_FILE" .)
rm -rf "\$TODAY_DIR"  # Remove the temporary uncompressed files

# Step 5: Retain only the last \$RETENTION_DAYS days of backups
find "\$BACKUP_DIR" -type f -name "*.zip" -mtime +\$RETENTION_DAYS -exec rm {} \;

log "Backup completed and stored in: \$ZIP_FILE"
EOF
    chmod +x "$BASE_DIR/mongo_backup.sh"
    log "Created and set permissions for mongo_backup.sh."

    # Create mongo_restore.sh with all variables expanded
    cat <<EOF >"$BASE_DIR/mongo_restore.sh"
#!/bin/bash

# Configuration variables
CONTAINER_NAME="$MONGO_CONTAINER"
BACKUP_DIR="$MONGO_BACKUP_DIR"

# Function to log messages
log() {
  echo "\$(date +'%Y-%m-%d %H:%M:%S') - \$1" >> "$LOG_DIR/mongo_restore.log"
}

# Step 1: Ask for the date
read -p "Enter the backup date to restore (YYYY-MM-DD): " RESTORE_DATE
ZIP_FILE="\$BACKUP_DIR/\${RESTORE_DATE}.zip"
RESTORE_DIR="\$BACKUP_DIR/tmp_restore_\$RESTORE_DATE"

if [[ ! -f "\$ZIP_FILE" ]]; then
  log "Error: Backup file for \$RESTORE_DATE not found."
  exit 1
fi

# Step 2: Unzip the backup file
mkdir -p "\$RESTORE_DIR"
unzip "\$ZIP_FILE" -d "\$RESTORE_DIR"

# Step 3: List the databases in the backup
DBS_IN_BACKUP=()
for FILE in "\$RESTORE_DIR"/*.archive; do
  BASENAME=\$(basename "\$FILE" .archive)
  DBS_IN_BACKUP+=("\$BASENAME")
done

# Step 4: Check existing databases in the container
EXISTING_DBS=\$(docker exec "\$CONTAINER_NAME" mongo --quiet --eval "db.adminCommand('listDatabases').databases.map(db => db.name).join(' ')" | tr -d '\r')

# Step 5: Restore each database
for DB in "\${DBS_IN_BACKUP[@]}"; do
  log "Restoring database: \$DB"

  # Check if the database exists
  if [[ ! " \${EXISTING_DBS[@]} " =~ " \${DB} " ]]; then
    log "Database \$DB does not exist. It will be created."
  fi

  # Restore the database
  cat "\$RESTORE_DIR/\$DB.archive" | docker exec -i "\$CONTAINER_NAME" mongorestore --archive --nsInclude="\$DB.*"
done

# Cleanup
rm -rf "\$RESTORE_DIR"

log "Restore completed successfully."
EOF
    chmod +x "$BASE_DIR/mongo_restore.sh"
    log "Created and set permissions for mongo_restore.sh."

    # Configure cronjobs
    log "Configuring cronjobs for backup scripts."
    (crontab -l 2>/dev/null; echo "0 $MONGO_BACKUP_HOUR * * * $BASE_DIR/mongo_backup.sh >> $LOG_DIR/mongo_backup.log 2>&1") | crontab -
    (crontab -l 2>/dev/null; echo "0 $POSTGRES_BACKUP_HOUR * * * $BASE_DIR/postgres_backup.sh >> $LOG_DIR/postgres_backup.log 2>&1") | crontab -

    # Configure logrotate
    log "Setting up logrotate for backup logs."
    sudo tee /etc/logrotate.d/backup_logs << EOF
$LOG_DIR/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 644 $(whoami) $(whoami)
    dateext
}
EOF
    sudo chmod 644 /etc/logrotate.d/backup_logs
    sudo chown root:root /etc/logrotate.d/backup_logs

    log "Backup system setup completed successfully."
}

# Function to setup CloudWatch monitoring
setup_cloudwatch() {
    log "Setting up CloudWatch monitoring..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log "AWS CLI not found. Installing..."
        sudo apt-get update
        sudo apt-get install -y awscli
    fi

    # Configure AWS CLI if not already configured
    if [ ! -f ~/.aws/config ]; then
        log "AWS CLI not configured. Running setup..."
        aws configure
    fi

    # Install CloudWatch agent
    if ! command -v amazon-cloudwatch-agent &> /dev/null; then
        log "Installing CloudWatch agent..."
        sudo apt-get update
        sudo apt-get install -y amazon-cloudwatch-agent
    fi

    # Start CloudWatch agent
    sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:$CLOUDWATCH_CONFIG -s
    log "CloudWatch agent started with configuration at $CLOUDWATCH_CONFIG"
}

# Function to setup Prometheus/Grafana monitoring
setup_prometheus_grafana() {
    log "Setting up Prometheus & Grafana monitoring..."

    SERVER_IP=$(hostname -I | awk '{print $1}')
    SERVER_IP_PUB=$(curl -s ifconfig.me)

    # Define paths for docker-compose and Prometheus configuration
    COMPOSE_FILE="$BASE_DIR/docker-compose.yml"
    PROMETHEUS_CONFIG="$BASE_DIR/prometheus.yml"

    # Create docker-compose.yml
    cat <<EOF >"$COMPOSE_FILE"
version: '3.3'
services:
   prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "$PROMETHEUS_PORT:9090"
    volumes:
      - $BASE_DIR/prometheus.yml:/etc/prometheus/prometheus.yml
      - $BASE_DIR/prometheus-data:/prometheus
    restart: unless-stopped

   grafana:
    image: grafana/grafana-oss:latest
    container_name: grafana
    ports:
      - "$GRAFANA_PORT:3000"
    volumes:
      - $BASE_DIR/grafana-data:/var/lib/grafana
    environment:
     - GF_SERVER_ROOT_URL=http://$SERVER_IP_PUB/grafana
     - GF_SECURITY_ADMIN_PASSWORD=$GRAFANA_PASSWORD
    restart: unless-stopped

   node_exporter:
    image: quay.io/prometheus/node-exporter:latest
    container_name: node_exporter
    command:
      - '--path.rootfs=/host'
    network_mode: host
    pid: host
    restart: unless-stopped
    volumes:
      - /:/host:ro,rslave

   cadvisor:
    image: google/cadvisor
    container_name: cadvisor
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "$CADVISOR_PORT:8080"
EOF

    # Create prometheus.yml
    cat <<EOF >"$PROMETHEUS_CONFIG"
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['$SERVER_IP:9090']

  - job_name: 'node_exporter'
    static_configs:
      - targets: ['$SERVER_IP:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['$SERVER_IP:$CADVISOR_PORT']

  - job_name: 'docker'
    static_configs:
      - targets: ['$SERVER_IP:9323']
EOF

    # Start containers
    log "Starting monitoring containers with docker-compose."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Add firewall rules if needed
    if command -v ufw &> /dev/null; then
        sudo ufw allow "$PROMETHEUS_PORT/tcp"
        sudo ufw allow "$GRAFANA_PORT/tcp"
        sudo ufw allow 9100/tcp  # node_exporter
        sudo ufw allow "$CADVISOR_PORT/tcp"
        log "Firewall rules added for monitoring ports."
    fi
    
    log "Prometheus is available at http://$SERVER_IP:$PROMETHEUS_PORT"
    log "Grafana is available at http://$SERVER_IP:$GRAFANA_PORT (username: admin, password: $GRAFANA_PASSWORD)"
}

# Main interactive menu
while true; do
    echo ""
    echo "========================================"
    echo "  Backup and Monitoring Setup Menu"
    echo "========================================"
    echo "1. Configure Backup System"
    echo "2. Configure Monitoring System"
    echo "3. Review Configuration and Install"
    echo "4. Exit"
    echo ""
    read -p "Enter your choice (1-4): " MAIN_CHOICE

    case "$MAIN_CHOICE" in
        1)
            collect_backup_config
            ;;
        2)
            echo ""
            echo "Select Monitoring Option:"
            echo "1. AWS CloudWatch"
            echo "2. Prometheus & Grafana"
            read -p "Enter your choice (1-2): " MONITOR_OPTION
            
            case "$MONITOR_OPTION" in
                1)
                    collect_cloudwatch_config
                    ;;
                2)
                    collect_prometheus_config
                    ;;
                *)
                    log "Invalid monitoring option selected."
                    ;;
            esac
            ;;
        3)
            if [ "$SETUP_BACKUP" = false ] && [ "$SETUP_MONITORING" = false ]; then
                log "Nothing to install. Please configure at least one system first."
                continue
            fi
            
            show_config_summary
            
            if [ "$SETUP_BACKUP" = true ]; then
                setup_backup_scripts
            fi
            
            if [ "$SETUP_MONITORING" = true ]; then
                if [ "$MONITOR_TYPE" = "cloudwatch" ]; then
                    setup_cloudwatch
                elif [ "$MONITOR_TYPE" = "prometheus" ]; then
                    setup_prometheus_grafana
                fi
            fi
            
            log "Setup completed successfully."
            exit 0
            ;;
        4)
            log "Exiting setup script."
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac
done
```
Create a file 

```bash
nano setup_backup_monitoring.sh
```
Give the executable permission

```bash
chmod +x setup_backup_monitoring.sh
```

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
