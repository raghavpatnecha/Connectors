# ============================================
# Multi-Stage Dockerfile for Gateway Service
# ============================================

# ============================================
# Stage 1: Base Image
# ============================================
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    wget

# Set working directory
WORKDIR /app

# ============================================
# Stage 2: Dependencies
# ============================================
FROM base AS dependencies

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Store production dependencies
RUN cp -R node_modules /prod_node_modules

# Install all dependencies (including dev)
RUN npm ci

# ============================================
# Stage 3: Build
# ============================================
FROM base AS build

# Copy all dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# ============================================
# Stage 4: Development
# ============================================
FROM base AS development

# Install development tools
RUN apk add --no-cache \
    vim \
    bash

# Copy all dependencies (including dev)
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Create data and logs directories
RUN mkdir -p /app/data /app/logs && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start with hot-reload
CMD ["npm", "run", "dev"]

# ============================================
# Stage 5: Production
# ============================================
FROM base AS production

# Install only runtime dependencies
RUN apk add --no-cache \
    tini \
    curl

# Copy production dependencies
COPY --from=dependencies /prod_node_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist

# Copy configuration files
COPY package.json ./

# Create data and logs directories
RUN mkdir -p /app/data /app/logs && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["node", "dist/index.js"]

# ============================================
# Metadata
# ============================================
LABEL maintainer="Connectors Platform Team"
LABEL description="MCP Gateway with FAISS semantic search and GraphRAG"
LABEL version="1.0.0"
