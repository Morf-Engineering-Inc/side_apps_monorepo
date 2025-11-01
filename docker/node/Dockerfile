# Node.js Application Dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/example-app/package.json ./apps/example-app/

# Install pnpm
RUN npm install -g pnpm@8

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY apps/example-app ./apps/example-app

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy dependencies and built app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/example-app ./apps/example-app

WORKDIR /app/apps/example-app

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "src/index.js"]
