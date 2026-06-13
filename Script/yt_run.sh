#!/bin/bash
# Script to run YouTrack server container

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

# Run the YouTrack container with resource limits, volume mappings, and port configuration
sudo docker run -it --name $CONTAINER_NAME \
  --cpus="2" \
  --memory="3g" \
  --restart=unless-stopped \
  -v $DATA_DIR:/opt/youtrack/data \
  -v $CONF_DIR:/opt/youtrack/conf \
  -v $LOGS_DIR:/opt/youtrack/logs \
  -v $BACKUP_DIR:/opt/youtrack/backups \
  -p 8080:8080 \
  jetbrains/youtrack:$YOUTRACK_VERSION
