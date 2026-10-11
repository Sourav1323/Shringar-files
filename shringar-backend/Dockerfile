# ==============================================================================
# Multi-Stage Dockerfile for Shringar Spring Boot Backend
# Stage 1: Build & Package with Maven & Temurin JDK 17
# Stage 2: Lean, Secure JRE 17 Alpine Runtime with Non-Root User
# ==============================================================================

# --- STAGE 1: Build Stage ---
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# 1. Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 2. Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- STAGE 2: Production Runtime Stage ---
FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app

# Install curl for container health checks
RUN apk add --no-cache curl tzdata && \
    cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime && \
    echo "Asia/Kolkata" > /etc/timezone

# Create secure non-root user and group
RUN addgroup -S shringar && adduser -S shringar -G shringar

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R shringar:shringar /app

# Copy executable jar from builder stage
COPY --from=builder --chown=shringar:shringar /build/target/shringar-backend-*.jar app.jar

# Switch to non-root user
USER shringar

# Expose Spring Boot port
EXPOSE 8080

# Environment variables with sensible production defaults
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

# Health check to ensure API is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:8080/api/settings || exit 1

# Launch application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
