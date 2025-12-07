#!/bin/bash

# ===========================================
# Build Docker Images for Kubernetes
# ===========================================

set -e

echo "🔨 Building Docker images for all services..."

# Build API Gateway
echo "📦 Building api-gateway..."
docker build -t api-gateway:latest ./apps/api-gateway

# Build User Service
echo "📦 Building user-service..."
docker build -t user-service:latest ./apps/user-service

# Build Product Service
echo "📦 Building product-service..."
docker build -t product-service:latest ./apps/product-service

# Build Order Service
echo "📦 Building order-service..."
docker build -t order-service:latest ./apps/order-service

# Build Notification Service
echo "📦 Building notification-service..."
docker build -t notification-service:latest ./apps/notification-service

echo "✅ All images built successfully!"
echo ""
echo "📋 Built images:"
docker images | grep -E "(api-gateway|user-service|product-service|order-service|notification-service)"
