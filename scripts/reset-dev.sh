#!/bin/bash
# ============================================
# Reset Development Environment
# ⚠️ WARNING: This will delete ALL data!
# ============================================

set -e

echo "======================================"
echo "⚠️  RESET DEVELOPMENT ENVIRONMENT"
echo "======================================"
echo ""
echo "This will:"
echo "  1. Stop all containers"
echo "  2. Remove all volumes (DATA LOSS!)"
echo "  3. Remove all images"
echo "  4. Rebuild from scratch"
echo ""
read -p "Are you absolutely sure? Type 'reset' to continue: " confirm

if [ "$confirm" != "reset" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Step 1: Stopping all services..."
docker compose down -v --rmi all --remove-orphans

echo ""
echo "Step 2: Cleaning Docker system..."
docker system prune -f

echo ""
echo "Step 3: Rebuilding images..."
docker compose build --no-cache

echo ""
echo "Step 4: Starting services..."
docker compose up -d

echo ""
echo "Step 5: Waiting for services..."
sleep 15

echo ""
echo "======================================"
echo "Reset Complete!"
echo "======================================"
echo ""
echo "Access URLs:"
echo "  Gateway:          http://localhost:3000"
echo "  Vault UI:         http://localhost:8200 (token: dev-root-token)"
echo "  Neo4j Browser:    http://localhost:7474 (neo4j / connectors-dev-2024)"
echo ""
