#!/bin/bash

# ===========================================
# Deploy to Kubernetes
# ===========================================

set -e

echo "🚀 Deploying microservices to Kubernetes..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create namespace
echo "📁 Creating namespace..."
kubectl apply -f "$SCRIPT_DIR/namespace.yaml"

# Create ConfigMap
echo "⚙️  Creating ConfigMap..."
kubectl apply -f "$SCRIPT_DIR/configmap.yaml"

# Deploy RabbitMQ first (message broker)
echo "🐰 Deploying RabbitMQ..."
kubectl apply -f "$SCRIPT_DIR/rabbitmq/"

# Wait for RabbitMQ to be ready
echo "⏳ Waiting for RabbitMQ to be ready..."
kubectl wait --for=condition=available --timeout=120s deployment/rabbitmq -n microservices || true
sleep 5  # Extra wait for RabbitMQ to fully initialize

# Deploy MongoDB
echo "🍃 Deploying MongoDB..."
kubectl apply -f "$SCRIPT_DIR/mongo-service/"

# Deploy backend services
echo "🔧 Deploying user-service..."
kubectl apply -f "$SCRIPT_DIR/user-service/"

echo "🔧 Deploying product-service..."
kubectl apply -f "$SCRIPT_DIR/product-service/"

echo "🔧 Deploying order-service..."
kubectl apply -f "$SCRIPT_DIR/order-service/"

echo "🔧 Deploying notification-service..."
kubectl apply -f "$SCRIPT_DIR/notification-service/"

# Wait for backend services to be ready
echo "⏳ Waiting for backend services to be ready..."
kubectl wait --for=condition=available --timeout=120s deployment/user-service -n microservices || true
kubectl wait --for=condition=available --timeout=120s deployment/product-service -n microservices || true
kubectl wait --for=condition=available --timeout=120s deployment/order-service -n microservices || true
kubectl wait --for=condition=available --timeout=120s deployment/notification-service -n microservices || true

# Deploy API Gateway
echo "🌐 Deploying api-gateway..."
kubectl apply -f "$SCRIPT_DIR/api-gateway/"

# # Deploy Ingress
# echo "🌐 Deploying Ingress..."
# kubectl apply -f "$SCRIPT_DIR/ingress.yaml"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Checking pod status..."
kubectl get pods -n microservices

echo ""
echo "🔗 Services:"
kubectl get svc -n microservices

# echo ""
# echo "🌍 Access the API Gateway via Ingress:"
# echo "   - http://localhost/ (Docker Desktop K8s with NGINX Ingress)"
# echo "   - Or use your configured Ingress Controller hostname"
echo ""
echo "🌍 Access the API Gateway (NodePort) at:"
echo "   - Docker Desktop K8s: http://localhost:30000"
echo "   - Minikube: Run 'minikube service api-gateway -n microservices'"
echo ""
echo "🐰 RabbitMQ Management UI:"
echo "   - http://localhost:31672 (admin/password)"
echo ""
echo "🍃 MongoDB Service is running internally on port 32017"
echo "   - localhost:32017 (for local development)"