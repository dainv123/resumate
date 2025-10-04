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

# Install dependencies for PDF generation
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  ttf-dejavu \
  ttf-liberation \
  fontconfig \
  curl \
  xvfb \
  dbus \
  && rm -rf /var/cache/apk/*

# Create a wrapper script for chromium optimized for low memory
RUN cat > /usr/bin/chromium-wrapper << 'EOF'
#!/bin/sh
exec /usr/bin/chromium-browser \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --no-first-run \
  --no-zygote \
  --single-process \
  --disable-extensions \
  --disable-plugins \
  --disable-images \
  --disable-javascript \
  --disable-default-apps \
  --disable-sync \
  --disable-translate \
  --hide-scrollbars \
  --mute-audio \
  --no-default-browser-check \
  --disable-web-security \
  --disable-features=VizDisplayCompositor \
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding \
  --disable-features=TranslateUI \
  --disable-ipc-flooding-protection \
  --disable-background-networking \
  --disable-component-extensions-with-background-pages \
  --disable-client-side-phishing-detection \
  --disable-hang-monitor \
  --disable-prompt-on-repost \
  --disable-domain-reliability \
  --disable-features=AudioServiceOutOfProcess \
  --disable-print-preview \
  --disable-speech-api \
  --disable-file-system \
  --disable-permissions-api \
  --disable-presentation-api \
  --disable-remote-fonts \
  --disable-speech-synthesis-api \
  --disable-webgl \
  --disable-webgl2 \
  --disable-3d-apis \
  --disable-accelerated-video-decode \
  --disable-accelerated-mjpeg-decode \
  --disable-gpu-compositing \
  --disable-gpu-rasterization \
  --disable-gpu-sandbox \
  --disable-software-rasterizer \
  --disable-background-mode \
  --disable-field-trial-config \
  --disable-back-forward-cache \
  --force-color-profile=srgb \
  --metrics-recording-only \
  --use-mock-keychain \
  --disable-component-update \
  --no-pings \
  --memory-pressure-off \
  --max_old_space_size=512 \
  "$@"
EOF

RUN chmod +x /usr/bin/chromium-wrapper

# Set display for headless operation
ENV DISPLAY=:99

# Create temp directory with proper permissions
RUN mkdir -p /tmp/pdf && chmod 777 /tmp/pdf

# Tell Puppeteer to skip installing Chromium. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-wrapper

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