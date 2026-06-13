#!/bin/bash
# 02_YTSTP_01: Install dependencies, JDK, Nginx, and Docker

set -e # Stop on any error

echo "=== system update ==="
sudo apt-update && sudo apt upgrade -y

echo "=== Install OpenJDK 17 ==="
sudo apt install -y openjdk-17-jdk openjdk-17-jre


echo "=== Install Docker ==="
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add the current user to the docker group so Docker can run without sudo
sudo usermod -aG docker $USER

echo "Done! Installed software versions:"
java -version
nginx -v
docker -v
echo "IMPORTANT: Reconnect over SSH for the Docker group permissions to take effect."


CONTAINER_NAME="youtrack-server"
YOUTRACK_VERSION="2026.1.13570"
BASE_DIR="/opt/youtrack"
DATA_DIR="$BASE_DIR/data"
CONF_DIR="$BASE_DIR/conf"
LOGS_DIR="$BASE_DIR/logs"
BACKUP_DIR="$BASE_DIR/backups"




sudo docker pull jetbrains/youtrack:$YOUTRACK_VERSION

echo "=== Craete dirs for YouTrack (Volumes) ==="
sudo mkdir -p -m 750 $DATA_DIR
sudo mkdir -p -m 750 $CONF_DIR
sudo mkdir -p -m 750 $LOGS_DIR
sudo mkdir -p -m 750 $BACKUP_DIR

echo "=== assign user modes JetBrains (UID 13001) ==="
sudo chown -R 13001:13001 $DATA_DIR \
$LOGS_DIR \
$CONF_DIR \
$BACKUP_DIR