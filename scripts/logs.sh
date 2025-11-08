#!/bin/bash
# ============================================
# View Service Logs
# ============================================

set -e

SERVICE=${1:-""}
FOLLOW=${2:-"-f"}

if [ -z "$SERVICE" ]; then
    echo "======================================"
    echo "Viewing All Service Logs"
    echo "======================================"
    docker compose logs $FOLLOW
else
    echo "======================================"
    echo "Viewing Logs for: $SERVICE"
    echo "======================================"
    docker compose logs $FOLLOW $SERVICE
fi
