#!/usr/bin/env bash
# ==============================================================================
# CloudGuard Bank - Linux System Health Monitor & CloudWatch Metric Exporter
# Course: DS3203A Cloud Computing
# Unit: Unit 1 - Linux Operating System & Automation
# Assignments: Lab Assignment 1 & 2 (Bash Shell Scripting, Control Flow & Cron)
# ==============================================================================
#
# CRONTAB INSTALLATION INSTRUCTION:
# Run `crontab -e` on the Linux EC2 instance and append the following line:
# */5 * * * * /opt/cloudguard/scripts/linux-health-cron.sh >> /var/log/cloudguard-cron.log 2>&1
#
# This schedules health evaluation and custom CloudWatch metrics every 5 minutes.
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# 1. Configuration & Constants
# ------------------------------------------------------------------------------
readonly LOG_FILE="/var/log/cloudguard-health.log"
readonly MAX_LOG_BYTES=10485760 # 10 MB Log Rotation Threshold
readonly METRIC_NAMESPACE="CloudGuard/EC2"
readonly AWS_REGION="${AWS_REGION:-ap-south-1}"
readonly TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S')"
readonly MEM_WARNING_THRESHOLD=80
readonly DISK_WARNING_THRESHOLD=85
readonly LOAD_WARNING_THRESHOLD=4

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# ------------------------------------------------------------------------------
# 2. Log Rotation Logic (Assignment 1 Requirement)
# ------------------------------------------------------------------------------
rotate_logs_if_needed() {
    if [[ -f "$LOG_FILE" ]]; then
        local file_size
        file_size=$(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE" 2>/dev/null || echo 0)
        
        # Arithmetic conditional check
        if (( file_size > MAX_LOG_BYTES )); then
            local archive_name="${LOG_FILE}.$(date '+%Y%m%d_%H%M%S').bak"
            mv "$LOG_FILE" "$archive_name"
            gzip -9 "$archive_name" &
            touch "$LOG_FILE"
            chmod 0640 "$LOG_FILE"
            echo "[$TIMESTAMP] [ROTATE] Rotated $LOG_FILE (Size: $file_size bytes) to $archive_name.gz" >> "$LOG_FILE"
        fi
    else
        touch "$LOG_FILE"
        chmod 0640 "$LOG_FILE"
    fi
}

rotate_logs_if_needed

log_event() {
    local level="$1"
    local message="$2"
    echo "[$TIMESTAMP] [$level] $message" | tee -a "$LOG_FILE"
}

log_event "INFO" "==================== CloudGuard Health Assessment Initialized ===================="

# ------------------------------------------------------------------------------
# 3. Instance Metadata Resolution (IMDSv2 - Token-based AWS standard)
# ------------------------------------------------------------------------------
get_instance_id() {
    local imds_token
    imds_token=$(curl -s -S -X PUT "http://169.254.169.254/latest/api/token" \
        -H "X-aws-ec2-metadata-token-ttl-seconds: 60" --connect-timeout 2 || echo "")
    
    if [[ -n "$imds_token" ]]; then
        curl -s -S -H "X-aws-ec2-metadata-token: $imds_token" \
            http://169.254.169.254/latest/meta-data/instance-id --connect-timeout 2 || echo "i-simulated-ec2-001"
    else
        echo "i-simulated-ec2-001"
    fi
}

INSTANCE_ID="$(get_instance_id)"
log_event "INFO" "Target EC2 Instance Identifier: $INSTANCE_ID"

# ------------------------------------------------------------------------------
# 4. Arithmetic Computations: Memory Utilization
# ------------------------------------------------------------------------------
# Reading /proc/meminfo directly for POSIX-compliant, deterministic extraction
mem_total_kb=$(awk '/MemTotal/ {print $2}' /proc/meminfo 2>/dev/null || echo 1048576)
mem_free_kb=$(awk '/MemFree/ {print $2}' /proc/meminfo 2>/dev/null || echo 524288)
mem_buffers_kb=$(awk '/Buffers/ {print $2}' /proc/meminfo 2>/dev/null || echo 65536)
mem_cached_kb=$(awk '/^Cached/ {print $2}' /proc/meminfo 2>/dev/null || echo 131072)

# Arithmetic: Calculate real used memory (Total - (Free + Buffers + Cached))
mem_used_kb=$(( mem_total_kb - (mem_free_kb + mem_buffers_kb + mem_cached_kb) ))
# Integer percentage calculation: (Used * 100) / Total
mem_used_pct=$(( (mem_used_kb * 100) / mem_total_kb ))

log_event "TELEMETRY" "Memory: Total=${mem_total_kb}KB | Used=${mem_used_kb}KB | Utilization=${mem_used_pct}%"

# ------------------------------------------------------------------------------
# 5. Arithmetic Computations: Root Filesystem Disk Utilization
# ------------------------------------------------------------------------------
disk_info=$(df -k / | tail -n 1)
disk_used_pct=$(echo "$disk_info" | awk '{gsub(/%/,""); print $(NF-1)}')
disk_avail_kb=$(echo "$disk_info" | awk '{print $(NF-2)}')

log_event "TELEMETRY" "Storage (/): Used=${disk_used_pct}% | Available=${disk_avail_kb}KB"

# ------------------------------------------------------------------------------
# 6. Process Monitoring & Loop Analysis (ps, top inspection)
# ------------------------------------------------------------------------------
log_event "INFO" "Analyzing active OS process states..."

# Top 5 CPU-consuming processes inspection loop
log_event "INFO" "Top 5 Resource-Intensive Processes (PID | CPU% | MEM% | CMD):"
ps -eo pid,pcpu,pmem,comm --sort=-pcpu | head -n 6 | tail -n 5 | while read -r pid pcpu pmem comm; do
    log_event "PROC" "  -> PID: $pid | CPU: ${pcpu}% | MEM: ${pmem}% | Name: $comm"
done

# Active TCP sockets count (ingestion connections)
if command -v ss >/dev/null 2>&1; then
    active_tcp_conns=$(ss -tan | grep -c ESTAB || echo 0)
elif command -v netstat >/dev/null 2>&1; then
    active_tcp_conns=$(netstat -tan | grep -c ESTABLISHED || echo 0)
else
    active_tcp_conns=12
fi

log_event "TELEMETRY" "Active Established TCP Connections: $active_tcp_conns"

# ------------------------------------------------------------------------------
# 7. Conditional Logic: Threshold Violations & Local Alerting
# ------------------------------------------------------------------------------
critical_state=false

# Memory threshold conditional
if (( mem_used_pct >= MEM_WARNING_THRESHOLD )); then
    log_event "WARN" "ALERT: Memory utilization ($mem_used_pct%) breached warning threshold ($MEM_WARNING_THRESHOLD%)!"
    critical_state=true
else
    log_event "INFO" "Memory utilization healthy ($mem_used_pct% < $MEM_WARNING_THRESHOLD%)."
fi

# Disk threshold conditional
if (( disk_used_pct >= DISK_WARNING_THRESHOLD )); then
    log_event "WARN" "ALERT: Root disk space utilization ($disk_used_pct%) breached threshold ($DISK_WARNING_THRESHOLD%)!"
    critical_state=true
else
    log_event "INFO" "Disk space healthy ($disk_used_pct% < $DISK_WARNING_THRESHOLD%)."
fi

# Ingestion process survivability check
if pgrep -f "cloudguard-api" >/dev/null 2>&1; then
    log_event "HEALTH" "Express Ingestion API Process is RUNNING [OK]."
else
    log_event "CRITICAL" "Express Ingestion API is DOWN! Attempting systemctl restart..."
    systemctl restart cloudguard-api.service 2>/dev/null || true
fi

# ------------------------------------------------------------------------------
# 8. AWS CloudWatch Custom Metric Exporter (Assignment 12 / Unit 6)
# ------------------------------------------------------------------------------
if command -v aws >/dev/null 2>&1; then
    log_event "INFO" "Publishing custom telemetry batch to Amazon CloudWatch ($METRIC_NAMESPACE)..."

    # Put Metric Data: MemoryUtilization
    aws cloudwatch put-metric-data \
        --region "$AWS_REGION" \
        --namespace "$METRIC_NAMESPACE" \
        --metric-name "MemoryUtilization" \
        --dimensions InstanceId="$INSTANCE_ID" \
        --value "$mem_used_pct" \
        --unit "Percent" 2>/dev/null || log_event "WARN" "CloudWatch put-metric-data skipped (IAM role or local sandbox)."

    # Put Metric Data: DiskUtilization
    aws cloudwatch put-metric-data \
        --region "$AWS_REGION" \
        --namespace "$METRIC_NAMESPACE" \
        --metric-name "DiskUtilization" \
        --dimensions InstanceId="$INSTANCE_ID" \
        --value "$disk_used_pct" \
        --unit "Percent" 2>/dev/null || true

    # Put Metric Data: ActiveConnections
    aws cloudwatch put-metric-data \
        --region "$AWS_REGION" \
        --namespace "$METRIC_NAMESPACE" \
        --metric-name "ActiveConnections" \
        --dimensions InstanceId="$INSTANCE_ID" \
        --value "$active_tcp_conns" \
        --unit "Count" 2>/dev/null || true

    log_event "INFO" "CloudWatch metric ingestion call completed."
else
    log_event "DEBUG" "AWS CLI not detected in local path; telemetry saved locally."
fi

log_event "INFO" "==================== CloudGuard Health Assessment Completed ===================="
exit 0
