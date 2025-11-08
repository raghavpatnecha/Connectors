#!/bin/bash
# ============================================
# Quick Start Script for Development
# ============================================

set -e

echo "======================================"
echo "Connectors Platform - Starting Dev Environment"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker compose &> /dev/null; then
    echo "Error: docker compose not found. Please install Docker Compose."
    exit 1
fi

echo ""
echo "Starting core services..."
docker compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "Checking service status..."
docker compose ps

echo ""
echo "======================================"
echo "Services Started Successfully!"
echo "======================================"
echo ""
echo "Access URLs:"
echo "  Gateway:          http://localhost:3000"
echo "  Gateway Health:   http://localhost:3000/health"
echo "  Vault UI:         http://localhost:8200 (token: dev-root-token)"
echo "  Neo4j Browser:    http://localhost:7474 (neo4j / connectors-dev-2024)"
echo "  Redis Commander:  http://localhost:8081"
echo ""
echo "Useful Commands:"
echo "  View logs:        docker compose logs -f"
echo "  Stop services:    docker compose down"
echo "  Restart:          docker compose restart"
echo ""
echo "To start with MCP servers:"
echo "  docker compose --profile mcp-servers up -d"
echo ""
echo "To start with monitoring:"
echo "  docker compose --profile monitoring up -d"
echo ""
