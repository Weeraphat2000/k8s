# Kubernetes Deployment Guide

## 🎓 Kubernetes พื้นฐาน

### Kubernetes คืออะไร?

**Kubernetes (K8s)** คือ Container Orchestration Platform ที่ช่วยจัดการ containers โดยอัตโนมัติ รวมถึง:

- Deploy และ scale applications
- Load balancing traffic
- Self-healing (restart containers ที่ล้ม)
- Rolling updates โดยไม่มี downtime

### Architecture ของโปรเจคนี้

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                 Kubernetes Cluster                       │
                    │                                                          │
  User Request      │   ┌─────────────────────────────────────────────────┐   │
       │            │   │              Namespace: microservices            │   │
       ▼            │   │                                                  │   │
  ┌─────────┐       │   │   ┌─────────────┐      ┌─────────────────────┐  │   │
  │NodePort │───────┼───┼──▶│ API Gateway │─────▶│   Backend Services  │  │   │
  │ :30000  │       │   │   │   :3000     │      │                     │  │   │
  └─────────┘       │   │   └─────────────┘      │  ┌───────────────┐  │  │   │
                    │   │         │              │  │ user-service  │  │  │   │
                    │   │         │              │  │    :3001      │  │  │   │
                    │   │         ▼              │  └───────────────┘  │  │   │
                    │   │   ┌──────────┐         │  ┌───────────────┐  │  │   │
                    │   │   │   HPA    │         │  │product-service│  │  │   │
                    │   │   │AutoScale │         │  │    :3002      │  │  │   │
                    │   │   └──────────┘         │  └───────────────┘  │  │   │
                    │   │                        │  ┌───────────────┐  │  │   │
                    │   │                        │  │ order-service │  │  │   │
                    │   │                        │  │    :3003      │  │  │   │
                    │   │                        │  └───────────────┘  │  │   │
                    │   │                        │  ┌───────────────┐  │  │   │
                    │   │                        │  │notification-  │  │  │   │
                    │   │                        │  │service :3004  │  │  │   │
                    │   │                        │  └───────────────┘  │  │   │
                    │   │                        └─────────────────────┘  │   │
                    │   └─────────────────────────────────────────────────┘   │
                    └─────────────────────────────────────────────────────────┘
```

### K8s Resources ที่ใช้ในโปรเจคนี้

| Resource       | คำอธิบาย                                           | ไฟล์                |
| -------------- | -------------------------------------------------- | ------------------- |
| **Namespace**  | แยกกลุ่ม resources เหมือน folder                   | `namespace.yaml`    |
| **ConfigMap**  | เก็บ environment variables                         | `configmap.yaml`    |
| **Deployment** | กำหนดวิธี deploy pods (replicas, image, resources) | `*/deployment.yaml` |
| **Service**    | เปิด network ให้ pods สื่อสารกันได้                | `*/service.yaml`    |
| **HPA**        | Auto-scale pods ตาม CPU/Memory                     | `*/hpa.yaml`        |

### การทำงานของแต่ละ Resource

#### 1. Deployment

```yaml
spec:
  replicas: 1 # จำนวน pods ที่ต้องการ
  selector:
    matchLabels:
      app: api-gateway # เลือก pods ที่มี label นี้
  template:
    spec:
      containers:
        - image: api-gateway:latest # Docker image
          resources:
            requests: # ขอ resources ขั้นต่ำ
              memory: '128Mi'
              cpu: '100m'
            limits: # จำกัด resources สูงสุด
              memory: '256Mi'
              cpu: '200m'
```

#### 2. Service

```yaml
spec:
  type: ClusterIP # Internal only (default)
  # type: NodePort         # เข้าถึงจากภายนอกผ่าน node port
  selector:
    app: user-service # route traffic ไปหา pods ที่มี label นี้
  ports:
    - port: 3001 # port ของ service
      targetPort: 3001 # port ของ container
```

**Service Types:**
| Type | คำอธิบาย |
|------|----------|
| `ClusterIP` | Internal เท่านั้น (default) |
| `NodePort` | เข้าถึงผ่าน `<NodeIP>:<NodePort>` |
| `LoadBalancer` | สร้าง external load balancer (cloud) |

#### 3. HPA (Horizontal Pod Autoscaler)

```yaml
spec:
  minReplicas: 1 # จำนวน pods ขั้นต่ำ
  maxReplicas: 5 # จำนวน pods สูงสุด
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          averageUtilization: 70 # scale เมื่อ CPU > 70%
```

### Traffic Flow

1. **User** → ส่ง request ไปที่ `localhost:30000`
2. **NodePort Service** → รับ traffic และส่งต่อไป API Gateway pod
3. **API Gateway** → route request ไปยัง backend services ผ่าน ClusterIP
4. **Backend Services** → ประมวลผลและส่งผลลัพธ์กลับ

### Pod Communication

Pods สื่อสารกันผ่าน **Service DNS**:

```
http://<service-name>.<namespace>.svc.cluster.local:<port>

# ตัวอย่าง
http://user-service.microservices.svc.cluster.local:3001

# หรือแบบสั้น (ใน namespace เดียวกัน)
http://user-service:3001
```

---

## Prerequisites

### Option 1: Docker Desktop (แนะนำ)

1. ติดตั้ง [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. เปิด Kubernetes ใน Docker Desktop:
   - ไปที่ Settings → Kubernetes → Enable Kubernetes
   - รอจน Kubernetes พร้อมใช้งาน (ไอคอนเป็นสีเขียว)

### Option 2: Minikube

```bash
# ติดตั้ง Minikube
brew install minikube

# Start cluster
minikube start

# เพื่อให้ใช้ local Docker images ได้
eval $(minikube docker-env)
```

## Quick Start

### 1. Build Docker Images

```bash
# ให้ script executable
chmod +x k8s/*.sh

# Build ทุก images
./k8s/build-images.sh
```

### 2. Deploy to Kubernetes

```bash
./k8s/deploy.sh
```

### 3. ตรวจสอบ Status

```bash
# ดู pods
kubectl get pods -n microservices

# ดู services
kubectl get svc -n microservices

# ดู logs
kubectl logs -f deployment/api-gateway -n microservices
```

### 4. Access Application

- **Docker Desktop K8s**: http://localhost:30000
- **Minikube**: `minikube service api-gateway -n microservices`

## Manual Commands

### Deploy ทีละขั้นตอน

```bash
# สร้าง namespace
kubectl apply -f k8s/namespace.yaml

# สร้าง configmap
kubectl apply -f k8s/configmap.yaml

# Deploy services
kubectl apply -f k8s/user-service/
kubectl apply -f k8s/product-service/
kubectl apply -f k8s/order-service/
kubectl apply -f k8s/notification-service/
kubectl apply -f k8s/api-gateway/
```

### ดู Logs

```bash
# ดู logs ของ pod
kubectl logs -f <pod-name> -n microservices

# ดู logs ของ deployment
kubectl logs -f deployment/api-gateway -n microservices
```

### Debugging

```bash
# เข้าไปใน container
kubectl exec -it <pod-name> -n microservices -- sh

# ดู events
kubectl get events -n microservices --sort-by='.lastTimestamp'

# Describe pod (ดูปัญหา)
kubectl describe pod <pod-name> -n microservices
```

### Scaling

```bash
# Scale replicas
kubectl scale deployment api-gateway --replicas=3 -n microservices
```

### Load Testing

ทดสอบ load balancing และ HPA scaling:

```bash
# ยิง requests แบบง่ายๆ
for i in {1..50}; do curl -s http://localhost:30000/notifications && echo ""; done

# ยิง requests แบบ parallel (เร็วกว่า)
for i in {1..100}; do curl -s http://localhost:30000/notifications & done; wait

# ใช้ Apache Benchmark (ถ้าติดตั้งไว้)
ab -n 1000 -c 50 http://localhost:30000/notifications

# ใช้ hey (แนะนำ - ติดตั้ง: brew install hey)
hey -n 1000 -c 50 http://localhost:30000/notifications
```

#### ดู Logs ว่า Request กระจายไป Pod ไหน

```bash
# ดู logs ของทุก pods พร้อมกัน
kubectl logs -f deployment/notification-service -n microservices --all-containers --prefix

# หรือดูแยกแต่ละ pod
kubectl logs -f <pod-name> -n microservices
```

#### Monitor HPA ขณะ Load Test

```bash
# ดู HPA แบบ watch (update ทุก 2 วินาที)
kubectl get hpa -n microservices -w
```

### Delete

```bash
# ลบทั้งหมดด้วย script
./k8s/delete.sh

# หรือ delete namespace (ลบทุกอย่างใน namespace นั้น)
kubectl delete namespace microservices
```

#### ลบเฉพาะบาง Service

```bash
# ลบ deployment
kubectl delete deployment api-gateway -n microservices

# ลบ service
kubectl delete svc api-gateway -n microservices

# ลบ hpa
kubectl delete hpa api-gateway-hpa -n microservices

# หรือลบทั้ง folder ของ service นั้น
kubectl delete -f k8s/api-gateway/
```

#### ตรวจสอบว่าลบหมดแล้ว

```bash
kubectl get all -n microservices
```

## File Structure

```
k8s/
├── namespace.yaml              # Kubernetes namespace
├── configmap.yaml              # Environment variables
├── build-images.sh             # Build all Docker images
├── deploy.sh                   # Deploy all services
├── delete.sh                   # Delete all resources
├── api-gateway/
│   ├── deployment.yaml
│   └── service.yaml
├── user-service/
│   ├── deployment.yaml
│   └── service.yaml
├── product-service/
│   ├── deployment.yaml
│   └── service.yaml
├── order-service/
│   ├── deployment.yaml
│   └── service.yaml
└── notification-service/
    ├── deployment.yaml
    └── service.yaml
```

## Troubleshooting

### ImagePullBackOff Error

ถ้าเจอ error นี้ แสดงว่า K8s หา image ไม่เจอ:

```bash
# ตรวจสอบว่า build image แล้ว
docker images | grep -E "(api-gateway|user-service)"

# ถ้าใช้ Minikube ต้อง build ใน Minikube's Docker
eval $(minikube docker-env)
./k8s/build-images.sh
```

### Pod CrashLoopBackOff

```bash
# ดู logs
kubectl logs <pod-name> -n microservices --previous

# ดูรายละเอียด
kubectl describe pod <pod-name> -n microservices
```

### Service ไม่สามารถเข้าถึงได้

```bash
# ตรวจสอบ endpoints
kubectl get endpoints -n microservices

# Port forward เพื่อทดสอบ
kubectl port-forward svc/api-gateway 3000:3000 -n microservices
```

---

## Namespace คืออะไร?

**Namespace** คือการแบ่งกลุ่ม resources ใน Kubernetes cluster เหมือนกับ "folder" สำหรับจัดระเบียบ resources

### ทำไมต้องใช้ Namespace?

| ข้อดี                       | คำอธิบาย                                                       |
| --------------------------- | -------------------------------------------------------------- |
| **แยก Environment**         | แยก `dev`, `staging`, `production` ออกจากกันชัดเจน             |
| **จัดการง่าย**              | ลบทุกอย่างได้ด้วยคำสั่งเดียว `kubectl delete namespace <name>` |
| **Resource Quotas**         | กำหนด limit CPU/Memory ต่อ namespace ได้                       |
| **RBAC**                    | กำหนดสิทธิ์การเข้าถึงแยกตาม namespace                          |
| **ไม่ปนกับ resources อื่น** | ไม่ไปปนกับ system pods หรือ app อื่นๆ                          |

### Default Namespaces ใน Kubernetes

| Namespace         | คำอธิบาย                                             |
| ----------------- | ---------------------------------------------------- |
| `default`         | namespace เริ่มต้น ถ้าไม่ระบุจะใช้ตัวนี้             |
| `kube-system`     | สำหรับ system components (DNS, metrics-server, etc.) |
| `kube-public`     | resources ที่ทุกคนเข้าถึงได้                         |
| `kube-node-lease` | สำหรับ node heartbeat                                |

### คำสั่งที่เกี่ยวกับ Namespace

```bash
# ดู namespaces ทั้งหมด
kubectl get namespaces

# สร้าง namespace
kubectl create namespace my-namespace

# ดู resources ใน namespace
kubectl get all -n microservices

# ลบ namespace (ลบทุกอย่างใน namespace นั้น)
kubectl delete namespace microservices

# ตั้ง default namespace (ไม่ต้องใส่ -n ทุกครั้ง)
kubectl config set-context --current --namespace=microservices
```

### ไม่อยากใช้ Namespace แยก?

ถ้าเป็นโปรเจคเล็กๆ ทดสอบที่ local สามารถใช้ `default` namespace ได้ โดย:

1. ไม่ต้อง apply `namespace.yaml`
2. ลบ `namespace: microservices` ออกจากทุกไฟล์ YAML
3. ไม่ต้องใส่ `-n microservices` ในคำสั่ง kubectl

---

## HPA (Horizontal Pod Autoscaler)

HPA จะ scale pods อัตโนมัติตาม CPU/Memory usage

### ดู HPA Status

```bash
# ดู HPA ทั้งหมด
kubectl get hpa -n microservices

# ดูรายละเอียด
kubectl describe hpa api-gateway-hpa -n microservices

# ดูแบบ watch (update ทุก 2 วินาที)
kubectl get hpa -n microservices -w
```

### ⚠️ ต้องติดตั้ง Metrics Server

HPA ต้องการ Metrics Server เพื่อดู CPU/Memory usage:

```bash
# Docker Desktop - มักจะติดตั้งมาแล้ว

# Minikube
minikube addons enable metrics-server

# ตรวจสอบว่า metrics-server ทำงาน
kubectl get pods -n kube-system | grep metrics-server

# ทดสอบ metrics
kubectl top nodes
kubectl top pods -n microservices
```
