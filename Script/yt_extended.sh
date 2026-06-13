#!/bin/bash
# Script to run YouTrack server container with extended configuration

# --- Configuration ---
CONTAINER_NAME="youtrack-server"
YOUTRACK_VERSION="2026.1.13570"
BASE_DIR="/opt/youtrack"
DATA_DIR="$BASE_DIR/data"
CONF_DIR="$BASE_DIR/conf"
LOGS_DIR="$BASE_DIR/logs"
BACKUP_DIR="$BASE_DIR/backups"

# Remove the existing container if it exists to avoid conflicts
sudo docker rm -f $CONTAINER_NAME

# Run the YouTrack container with resource limits, volume mappings, port configuration, and custom Java options
sudo docker run -it --name $CONTAINER_NAME \
  --restart=unless-stopped \
  --memory=6g \
  --memory-swap=6g \
  -e JAVA_OPTS="-Xms1g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:G1HeapRegionSize=32m -XX:InitiatingHeapOccupancyPercent=35 -Dexodus.gc.utilization.percent=70"  \
  -v $DATA_DIR:/opt/youtrack/data \
  -v $CONF_DIR:/opt/youtrack/conf \
  -v $LOGS_DIR:/opt/youtrack/logs \
  -v $BACKUP_DIR:/opt/youtrack/backups \
  -p 8080:8080 \
  jetbrains/youtrack:$YOUTRACK_VERSION
