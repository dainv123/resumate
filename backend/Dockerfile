# Backend Dockerfile - Multi-stage Build
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Skip Chromium download for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Increase Node.js heap size during build to avoid OOM in TypeScript/Nest build
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001

# Change ownership of app files
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main"]