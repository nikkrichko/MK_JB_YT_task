# Scripts Folder

This folder contains shell scripts to automate the YouTrack container deployment and system initialization.

## Scripts Overview

* `00_init_sys.sh`: Initializes the environment by installing dependencies (Docker, OpenJDK), creating necessary directories for data volumes, and pulling the YouTrack Docker image.
* `yt_run.sh`: Deploys the YouTrack server container with standard configuration.
* `yt_extended.sh`: Deploys the YouTrack server container with extended configuration (increased memory and Java options).
* `yt_kill.sh`: Stops and removes the active YouTrack container.

## Usage

1. Run `00_init_sys.sh` first to set up the system and required directories.
2. Use `yt_run.sh` or `yt_extended.sh` to start the YouTrack server.
3. Use `yt_kill.sh` to stop/remove the container when needed.
