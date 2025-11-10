#!/bin/bash
# ============================================
# Stop Development Environment
# ============================================

set -e

echo "======================================"
echo "Stopping Connectors Platform"
echo "======================================"

# Parse options
REMOVE_VOLUMES=false
REMOVE_IMAGES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--volumes)
            REMOVE_VOLUMES=true
            shift
            ;;
        -i|--images)
            REMOVE_IMAGES=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -v, --volumes    Remove all data volumes (⚠️ DATA LOSS)"
            echo "  -i, --images     Remove all images"
            echo "  -h, --help       Show this help message"
            echo ""
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Build docker compose down command
CMD="docker compose down"

if [ "$REMOVE_VOLUMES" = true ]; then
    echo "⚠️  WARNING: This will remove all data volumes!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Cancelled."
        exit 0
    fi
    CMD="$CMD -v"
fi

if [ "$REMOVE_IMAGES" = true ]; then
    CMD="$CMD --rmi all"
fi

echo ""
echo "Running: $CMD"
eval $CMD

echo ""
echo "======================================"
echo "Services Stopped"
echo "======================================"
