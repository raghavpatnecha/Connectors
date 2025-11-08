.PHONY: help install dev build start test lint clean docker-up docker-down docker-logs

# Default target
help:
	@echo "MCP Gateway - Available Commands:"
	@echo ""
	@echo "  make install       - Install dependencies"
	@echo "  make dev           - Run in development mode"
	@echo "  make build         - Build TypeScript"
	@echo "  make start         - Start production server"
	@echo "  make test          - Run tests"
	@echo "  make test-watch    - Run tests in watch mode"
	@echo "  make coverage      - Generate test coverage"
	@echo "  make lint          - Run linter"
	@echo "  make lint-fix      - Fix linting issues"
	@echo "  make format        - Format code with Prettier"
	@echo "  make typecheck     - Run TypeScript type checking"
	@echo "  make clean         - Clean build artifacts"
	@echo ""
	@echo "  make docker-up     - Start Docker services"
	@echo "  make docker-down   - Stop Docker services"
	@echo "  make docker-logs   - View Docker logs"
	@echo "  make docker-build  - Build Docker image"
	@echo ""

# Development
install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm start

# Testing
test:
	npm test

test-watch:
	npm run test:watch

coverage:
	npm run test:coverage

# Code Quality
lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

typecheck:
	npm run typecheck

# Cleanup
clean:
	npm run clean
	rm -rf node_modules
	rm -rf logs/*
	rm -rf coverage

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f gateway

docker-build:
	docker-compose build gateway

docker-restart:
	docker-compose restart gateway

# Docker with monitoring
docker-monitoring:
	docker-compose --profile monitoring up -d

# Database setup
neo4j-setup:
	@echo "Setting up Neo4j graph database..."
	docker-compose exec neo4j cypher-shell -u neo4j -p gateway-password < scripts/neo4j-init.cypher

# Vault setup
vault-setup:
	@echo "Setting up HashiCorp Vault..."
	docker-compose exec vault vault secrets enable -path=secret kv-v2
	docker-compose exec vault vault secrets enable transit

# Full setup
setup: docker-up
	@echo "Waiting for services to be ready..."
	sleep 10
	$(MAKE) vault-setup
	@echo "Gateway setup complete!"

# Health check
health:
	@curl -s http://localhost:3000/health | jq

# View logs
logs-error:
	tail -f logs/error.log

logs-combined:
	tail -f logs/combined.log
