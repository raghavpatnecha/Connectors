# Google Calendar MCP Server Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3131

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3131

# Start server
CMD ["node", "dist/index.js"]
