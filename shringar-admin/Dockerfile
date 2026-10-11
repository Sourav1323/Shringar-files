# ==============================================================================
# Dockerfile for Standalone Shringar Admin Portal
# Serves static dashboard HTML, CSS, and JS using Nginx Alpine
# ==============================================================================
FROM nginx:1.27-alpine

RUN apk add --no-cache curl

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all admin assets
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/dashboard.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
