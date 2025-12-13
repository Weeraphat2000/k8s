#!/bin/bash

# ===========================================
# Delete all Kubernetes resources
# ===========================================

set -e

echo "🗑️  Deleting all microservices resources..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Delete resources in reverse order of creation
kubectl delete -f "$SCRIPT_DIR/mongo-service/" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/rabbitmq/" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/api-gateway/" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/user-service/" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/product-service/" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/order-service/" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/notification-service/" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/configmap.yaml" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/namespace.yaml" --ignore-not-found

echo "✅ All resources deleted!"
