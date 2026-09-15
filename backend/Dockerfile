# Multi-stage Dockerfile for Kimbia Spring Boot Backend

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Ensure uploads directory exists
RUN mkdir -p /app/uploads

# Copy compiled artifact from build stage
COPY --from=builder /app/target/*.jar app.jar

# JVM options optimized for cloud containers with low RAM (Render free tier 512MB)
ENV JAVA_OPTS="-XX:+UseSerialGC -XX:MaxRAMPercentage=75.0 -Xss256k"

EXPOSE 8081

ENTRYPOINT ["sh", "-c", "java  -jar app.jar"]
