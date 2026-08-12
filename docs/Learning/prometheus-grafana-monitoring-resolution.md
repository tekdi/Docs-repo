# Prometheus + Grafana Monitoring Stack
## Resolution & Configuration Guide

**Stack:** Ubuntu EC2 · Docker Compose · Prometheus · Grafana · Node Exporter · cAdvisor · Docker Engine Metrics

**Purpose:** This document records the troubleshooting process and final resolution for Prometheus target health failures and Grafana dashboard data issues encountered while running Prometheus and Grafana in Docker containers.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Initial Symptoms](#2-initial-symptoms)
3. [Root Cause Analysis](#3-root-cause-analysis)
4. [Final Architecture](#4-final-architecture)
5. [Docker Daemon Metrics Configuration](#5-docker-daemon-metrics-configuration)
6. [Docker Compose Configuration](#6-docker-compose-configuration)
7. [Prometheus Configuration](#7-prometheus-configuration)
8. [Validation and Troubleshooting Procedure](#8-validation-and-troubleshooting-procedure)
9. [Grafana Configuration and Dashboard Verification](#9-grafana-configuration-and-dashboard-verification)
10. [Troubleshooting Reference](#10-troubleshooting-reference)
11. [Key Lessons Learned](#11-key-lessons-learned)
12. [Resolution Evidence](#12-resolution-evidence)
13. [References](#13-references)

---

## 1. Executive Summary

The monitoring stack initially showed Prometheus as **UP** while `docker_metrics` was **DOWN** and `cAdvisor`/`Node Exporter` were not being scraped correctly. The root causes were a combination of:

- Missing Docker daemon metrics configuration
- cAdvisor not running or exposed correctly
- Docker networking semantics — `127.0.0.1` inside the Prometheus container refers to the Prometheus container itself, not the Ubuntu host

The final working design uses **Docker Compose service discovery** for cAdvisor and **`host.docker.internal`** for host-level Docker daemon metrics and Node Exporter. The Prometheus target-health page ultimately showed all four targets as **UP**.

---

## 2. Initial Symptoms

| Target | Initial Endpoint | Initial State | Observed Issue |
|---|---|---|---|
| `prometheus` | `localhost:9090` | UP | Prometheus itself was healthy. |
| `docker_metrics` | `127.0.0.1:9323` | DOWN | Connection refused. |
| `cadvisor` | `127.0.0.1:8005` | UNKNOWN / DOWN | No cAdvisor process was listening on the host port. |
| `node` | `127.0.0.1:9100` | UNKNOWN | Node Exporter was running in host networking, but Prometheus was in a different network namespace. |

The Docker daemon metrics endpoint was later confirmed to expose valid Prometheus-formatted metrics, including Docker engine/container metrics.

---

## 3. Root Cause Analysis

### 3.1 Docker Metrics Was Not Initially Enabled

The host did not initially have `/etc/docker/daemon.json`. Docker's Prometheus metrics endpoint was therefore not listening on port `9323`. Docker documents `/etc/docker/daemon.json` as the default Linux daemon configuration location and uses `metrics-addr` to configure the metrics endpoint.

### 3.2 Container `localhost` vs. Host `localhost`

Prometheus was running inside a Docker container. Therefore, `127.0.0.1:9323` and `127.0.0.1:9100` — as seen from Prometheus — refer to the **Prometheus container's own network namespace**, not the Ubuntu host.

Docker's official documentation demonstrates the same pattern for Prometheus running in a container: use `host.docker.internal:9323` and add the `host-gateway` mapping when needed on Linux.

### 3.3 cAdvisor Was Not Available at the Original Endpoint

The host test against `127.0.0.1:8005` returned connection refused because cAdvisor was not running/listening at that address. After cAdvisor was started correctly and placed on the Compose network, Prometheus successfully scraped `cadvisor:8080`.

### 3.4 Grafana Dashboard Data

Once Prometheus target health was restored, the remaining Grafana issue was separate: the **Node Exporter Full** dashboard showed *No data / N/A* and warning icons on datasource/job/node variables. The resolution step was to ensure Grafana's Prometheus data source uses the Docker service name (`http://prometheus:9090`) and that the dashboard variables resolve to the correct `node` job and instance.

---

## 4. Final Architecture

```
Ubuntu EC2 Host
│
├── Docker daemon metrics
│   └── host:9323
│
├── Node Exporter
│   └── host:9100  (host network mode)
│
└── Docker Compose network
    ├── Prometheus  :9090
    ├── Grafana     :3000
    └── cAdvisor    :8080

Prometheus scrape targets:
  prometheus      → localhost:9090
  docker_metrics  → host.docker.internal:9323
  node            → host.docker.internal:9100
  cadvisor        → cadvisor:8080
```

---

## 5. Docker Daemon Metrics Configuration

Create the Docker daemon configuration if it does not already exist:

```bash
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

Use the following configuration so that the Prometheus container can reach the host metrics endpoint:

```json
{
  "metrics-addr": "0.0.0.0:9323",
  "experimental": true
}
```

Restart Docker and verify the listening address:

```bash
sudo systemctl restart docker
sudo ss -lntp | grep 9323
curl http://127.0.0.1:9323/metrics | head
```

**Expected result:** the listener should be bound to `0.0.0.0:9323` (or another host-reachable address), and `curl` should return Prometheus-formatted metrics.

> ⚠️ **Security note:** Exposing `0.0.0.0:9323` makes the metrics service reachable on the host interfaces. Keep TCP/9323 closed to the public internet via the AWS Security Group and host firewall. Docker specifically warns that using `0.0.0.0` exposes the Prometheus port to the wider network.

---

## 6. Docker Compose Configuration

A working Compose structure used for the monitoring stack:

```yaml
version: '3.8'

volumes:
  grafana-data:
    driver: local
  prometheus-data:
    driver: local

services:

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - /etc/prometheus/config:/etc/prometheus:ro
      - prometheus-data:/prometheus
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped
    depends_on:
      - cadvisor

  grafana:
    image: grafana/grafana-oss:latest
    container_name: grafana
    ports:
      - "3005:3000"
    volumes:
      - grafana-data:/var/lib/grafana
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
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    ports:
      - "8005:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
    restart: unless-stopped
```

**Critical setting:** `extra_hosts` on the `prometheus` service. It maps `host.docker.internal` to the Docker host gateway so a Linux container can reach host-level services.

---

## 7. Prometheus Configuration

The final scrape configuration uses container-local service DNS for cAdvisor and `host.docker.internal` for host-level services:

```yaml
global:
  scrape_interval: 5s
  evaluation_interval: 1m

scrape_configs:

  - job_name: 'prometheus'
    scrape_interval: 6s
    static_configs:
      - targets:
          - 'localhost:9090'

  - job_name: 'docker_metrics'
    scrape_interval: 15s
    static_configs:
      - targets:
          - 'host.docker.internal:9323'

  - job_name: 'cadvisor'
    scrape_interval: 15s
    static_configs:
      - targets:
          - 'cadvisor:8080'

  - job_name: 'node'
    scrape_interval: 15s
    static_configs:
      - targets:
          - 'host.docker.internal:9100'
```

> **Rule of thumb:** Do not use `127.0.0.1` for the Docker daemon metrics or host Node Exporter targets when Prometheus is running in a normal Docker network. `localhost` is only appropriate for Prometheus scraping itself.

---

## 8. Validation and Troubleshooting Procedure

### 8.1 Validate Compose YAML

```bash
docker compose config
```

If YAML parsing fails, inspect the reported line and verify indentation — especially under `services`, `ports`, `volumes`, and `extra_hosts`.

### 8.2 Recreate the Monitoring Containers

```bash
docker compose up -d --force-recreate --no-deps prometheus
docker compose up -d
docker ps
```

### 8.3 Validate Docker Metrics From the Prometheus Container

```bash
docker exec prometheus wget -qO- http://host.docker.internal:9323/metrics | head
```

Successful output begins with Prometheus metric `HELP`/`TYPE` lines such as `builder_builds_failed_total`. During troubleshooting, this test first failed with *connection refused* because Docker was listening only on `127.0.0.1:9323`; after changing the listener to `0.0.0.0:9323`, the request succeeded.

### 8.4 Validate Node Exporter From Prometheus

```bash
docker exec prometheus wget -qO- http://host.docker.internal:9100/metrics | head
```

### 8.5 Validate cAdvisor From Prometheus

```bash
docker exec prometheus wget -qO- http://cadvisor:8080/metrics | head
```

This test succeeded and returned `cadvisor_version_info` and container metrics.

### 8.6 Validate Prometheus Target Health

Open the Prometheus **Targets** page and confirm all monitoring jobs are green / UP:

- `prometheus` → **UP**
- `docker_metrics` → **UP**
- `cadvisor` → **UP**
- `node` → **UP**

---

## 9. Grafana Configuration and Dashboard Verification

After Prometheus target health is green, configure Grafana to use Prometheus through the Compose network.

In Grafana: **Connections → Data sources → Prometheus**

Set the URL to:

```
http://prometheus:9090
```

Then select **Save & test**.

### 9.1 Test Grafana/Prometheus Connectivity

```bash
docker exec grafana wget -qO- http://prometheus:9090/-/ready
```

Expected response:

```
Prometheus is Ready.
```

### 9.2 Test Metrics in Grafana Explore

Select the Prometheus data source and run:

```
up
```

**Expected result:** four healthy series, one for each configured job.

### 9.3 Verify Node Exporter Metrics

```
node_uname_info
node_cpu_seconds_total
node_memory_MemTotal_bytes
```

If these return data, Node Exporter and Prometheus are working correctly, and any remaining *No data / N/A* problem in the **Node Exporter Full** dashboard is a dashboard datasource/variable configuration issue rather than an exporter connectivity issue.

---

## 10. Troubleshooting Reference

| Symptom | Likely Cause | Action |
|---|---|---|
| Connection refused on `127.0.0.1:9323` | Docker metrics not enabled, or listener bound only to host loopback. | Configure `/etc/docker/daemon.json` and verify with `ss -lntp \| grep 9323`. |
| Bad address `host.docker.internal` | Host gateway mapping missing. | Add `extra_hosts: host.docker.internal:host-gateway` and recreate Prometheus. |
| `host.docker.internal` resolves but connection refused | Service is listening only on `127.0.0.1`. | Bind the host service to a host-reachable address such as `0.0.0.0:9323`, then restrict inbound access with firewall/security group rules. |
| `cadvisor:8080` works but `127.0.0.1:8005` fails | cAdvisor is container-local and/or host port mapping is absent. | Use `cadvisor:8080` from Prometheus; optionally publish `8005:8080` for host/browser access. |
| Grafana dashboard shows *No data* | Data source or dashboard variables are not resolving. | Set Grafana Prometheus URL to `http://prometheus:9090` and test `up`, `node_uname_info`, and `node_cpu_seconds_total`. |
| `docker compose` YAML parsing error | Indentation or malformed YAML. | Run `docker compose config` and inspect the reported line. |

---

## 11. Key Lessons Learned

- A container's `127.0.0.1` is not the host's `127.0.0.1`.
- Use Compose service names such as `cadvisor:8080` for container-to-container communication.
- Use `host.docker.internal` with `host-gateway` when a Linux container must reach a host-level service.
- Validate connectivity from **inside** the Prometheus container, not only from the Ubuntu host.
- A green Prometheus target confirms scraping; Grafana can still show *No data* if its data source or dashboard variables are misconfigured.
- Do not expose Docker's metrics endpoint publicly — use AWS Security Groups and host firewall rules to restrict access.

---

## 12. Resolution Evidence

During troubleshooting, the Docker metrics endpoint returned valid Prometheus-formatted metrics from the Ubuntu host. The output included Docker container state and engine information, confirming that the daemon metrics endpoint itself was healthy.

The Prometheus target-health screenshot subsequently showed cAdvisor, `docker_metrics`, `node`, and `prometheus` all in the **UP** state. The cAdvisor test from inside Prometheus also returned cAdvisor metrics successfully.

---

## 13. References.

- [Docker Docs — Collect Docker metrics with Prometheus](https://docs.docker.com/engine/daemon/prometheus/)
- [Docker Docs — dockerd CLI / daemon metrics](https://docs.docker.com/reference/cli/dockerd/)
- [Prometheus Docs — Getting started](https://prometheus.io/docs/prometheus/latest/getting_started/)
- [Prometheus Docs — cAdvisor monitoring guide](https://prometheus.io/docs/guides/cadvisor/)
- [Prometheus Docs — Configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)
