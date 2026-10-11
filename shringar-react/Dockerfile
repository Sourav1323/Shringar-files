# ==============================================================================
# Multi-Stage Dockerfile for Shringar React Frontend (Vite + Tailwind + React 19)
# Stage 1: Build production static distribution with Node 20 Alpine
# Stage 2: Serve high-performance static files with Nginx Alpine
# ==============================================================================

# --- STAGE 1: Build React Assets ---
FROM node:20-alpine AS builder
WORKDIR /app

# Cache node dependencies layer
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy frontend source files
COPY . .

# Build production bundle (outputs to /app/dist)
RUN npm run build

# --- STAGE 2: Nginx Production Server ---
FROM nginx:1.27-alpine AS runner

# Install curl for container health check
RUN apk add --no-cache curl

# Copy custom Nginx configuration with SPA routing and caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled production bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
