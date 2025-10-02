# Frontend Dockerfile - Multi-stage Build
# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Debug: Check what's in the app directory
RUN echo "=== Contents of /app ===" && ls -la /app
RUN echo "=== Contents of /app/public ===" && ls -la /app/public || echo "Public directory does not exist"

# Ensure public directory exists
RUN mkdir -p /app/public
RUN if [ -d "./public" ] && [ "$(ls -A ./public)" ]; then \
  echo "Copying public files from source..."; \
  cp -r ./public/* /app/public/; \
  else \
  echo "No public files to copy, creating empty directory"; \
  touch /app/public/.gitkeep; \
  fi

# Stage 3: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

# Copy necessary files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public directory (will be created if it exists)
COPY --from=builder /app/public ./public

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]