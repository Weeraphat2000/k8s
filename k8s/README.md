# Kubernetes Deployment Guide

## 🎓 Kubernetes พื้นฐาน

### Kubernetes คืออะไร?

**Kubernetes (K8s)** คือ Container Orchestration Platform ที่ช่วยจัดการ containers โดยอัตโนมัติ รวมถึง:

- Deploy และ scale applications
- Load balancing traffic
- Self-healing (restart containers ที่ล้ม)
- Rolling updates โดยไม่มี downtime

## Ingress NGINX (Reverse Proxy สำหรับ K8s)

### วิธีเช็คว่า Ingress NGINX ติดตั้งแล้วหรือยัง

```bash
kubectl get pods -n ingress-nginx
```

ถ้าเห็น pod เช่น `ingress-nginx-controller-xxxx` แปลว่าติดตั้งแล้ว

### วิธีติดตั้ง Ingress NGINX

#### Docker Desktop (Kubernetes)

1. เปิด Kubernetes ใน Preferences (Settings → Kubernetes → Enable Kubernetes)
2. ถ้าไม่มี Ingress NGINX ให้ติดตั้งด้วย:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml
```

3. รอให้ pod ใน namespace `ingress-nginx` ขึ้น Running

#### Minikube

1. เปิด Ingress addon:

```bash
minikube addons enable ingress
```

2. รอให้ pod ใน namespace `ingress-nginx` ขึ้น Running

---

## 🔄 Request Flow: จาก User ถึง Pod

### ภาพรวมการเดินทางของ Request

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                              KUBERNETES CLUSTER                                            │
│                                                                                            │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                          NAMESPACE: microservices                                     │ │
│  │                                                                                       │ │
│  │                                                                                       │ │
│  │   ┌──────────────┐      ┌──────────────┐      ┌──────────────────────────────┐        │ │
│  │   │  NodePort    │      │   Service    │      │        Deployment            │        │ │
│  │   │  :30000      │─────▶│ api-gateway  │─────▶│   ┌─────────────────────┐    │        │ │
│  │   │              │      │  ClusterIP   │      │   │ API Gateway Pod 1   │    │        │ │
│  │   └──────────────┘      └──────────────┘      │   │ API Gateway Pod 2   │    │        │ │
│  │          ▲                                    │   └─────────────────────┘    │        │ │
│  │          │                                    └──────────────────────────────┘        │ │
│  │          │                                                 │                          │ │
│  │          │                                                 ▼                          │ │
│  │          │                                    ┌──────────────────────────────┐        │ │
│  │          │                                    │         RabbitMQ             │        │ │
│  │          │                                    │    (Message Queue)           │        │ │
│  │          │                                    │                              │        │ │
│  │          │                                    │  ┌────────────────────────┐  │        │ │
│  │          │                                    │  │ notification_queue     │  │        │ │
│  │          │                                    │  └────────────────────────┘  │        │ │
│  │          │                                    └──────────────────────────────┘        │ │
│  │          │                                                 │                          │ │
│  │          │                              ┌──────────────────┼──────────────────┐       │ │
│  │          │                              ▼                  ▼                  ▼       │ │
│  │          │                     ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │ │
│  │          │                     │ Notif Pod 1 │    │ Notif Pod 2 │    │ Notif Pod N │  │ │
│  │          │                     │  Consumer   │    │  Consumer   │    │  Consumer   │  │ │
│  │          │                     └─────────────┘    └─────────────┘    └─────────────┘  │ │
│  │          │                                                                            │ │
│  └──────────│────────────────────────────────────────────────────────────────────────────┘ │
│             │                                                                              │
└─────────────│──────────────────────────────────────────────────────────────────────────────┘
              │
      ┌───────┴─────────┐
      │    User         │
      │ localhost:30000 │
      └─────────────────┘
```

### ขั้นตอนการทำงาน (Step by Step)

#### Step 1: User ส่ง Request

```
User → curl http://localhost:30000/notifications
```

- Request เข้ามาที่ **port 30000** ของ Node (เครื่อง local)

#### Step 2: NodePort Service รับ Request

```yaml
# api-gateway/service.yaml
spec:
  type: NodePort
  ports:
    - port: 3000 # Service port (internal)
      targetPort: 3000 # Container port
      nodePort: 30000 # External port (เข้าจากภายนอก)
```

- **NodePort** เปิด port บน Node ทุกตัว
- Route traffic ไปที่ Service `api-gateway`

#### Step 3: Service เลือก Pod (Load Balancing)

```
Service (api-gateway) → kube-proxy → iptables → Pod
```

- **kube-proxy** สร้าง iptables rules
- ใช้ **Round Robin** กระจาย request ไปทุก pods ที่ Ready
- ดู pods ที่พร้อมรับงานจาก **Endpoints**

```bash
# ดู endpoints
kubectl get endpoints api-gateway -n microservices
# ผลลัพธ์: 10.1.1.100:3000,10.1.1.101:3000
```

#### Step 4: API Gateway Pod รับ Request

```
API Gateway Pod → Process request → เรียก backend service
```

- Pod รับ request และประมวลผล
- เรียกไปยัง backend services (user, product, order, notification)

#### Step 5: Communication แบบต่างๆ

**แบบ TCP (user, product, order services):**

```
API Gateway ──TCP Connection──▶ Service ──▶ Pod
```

- สร้าง persistent connection
- DNS resolve ครั้งเดียว → ได้ Pod IP เดียว
- ⚠️ ไม่ load balance ระหว่าง pods!

**แบบ RabbitMQ (notification service):**

```
API Gateway ──▶ RabbitMQ Queue ──▶ Consumer Pods
```

- ส่ง message เข้า queue
- หลาย pods แย่งกัน consume
- ✅ Load balance ได้จริง!

#### Step 6: Response กลับ

```
Pod → Service → NodePort → User
```

---

## 🔀 Load Balancing: ใครเลือก Pod?

### TCP Services (ไม่ load balance ระหว่าง pods)

```
┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐
│   API Gateway   │────▶│    Service      │────▶│    Pod 1 ✅   │
│   (TCP Client)  │     │  user-service   │     │               │
│                 │     │                 │     ├───────────────┤
│  DNS resolve    │     │   ClusterIP     │     │    Pod 2 ❌   │
│  ครั้งเดียว        │     │   10.96.x.x     │     │    (ไม่ถูกใช้)   │
└─────────────────┘     └─────────────────┘     └───────────────┘
```

**ปัญหา:**

- NestJS TCP transport สร้าง **persistent connection**
- DNS resolve ครั้งเดียวตอน startup
- ได้ IP ของ pod เดียว → ใช้ pod นั้นตลอด

### RabbitMQ (load balance ได้จริง)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   API Gateway   │────▶│    RabbitMQ     │────▶│    Pod 1 ✅     │
│   (Publisher)   │     │                 │     │   Consumer      │
│                 │     │ notification_   │     ├─────────────────┤
│  Send message   │     │ queue           │────▶│    Pod 2 ✅     │
│  to queue       │     │                 │     │   Consumer      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**ทำงานอย่างไร:**

1. API Gateway ส่ง message เข้า queue
2. RabbitMQ เก็บ message ไว้
3. Consumer pods แย่งกัน consume (prefetch = 1)
4. Pod ไหนว่างก็รับไป → **load balance อัตโนมัติ!**

---

## 🏗️ K8s Components ที่เกี่ยวข้อง

### 1. kube-proxy

- รันบนทุก Node
- สร้าง iptables/IPVS rules สำหรับ Services
- จัดการ load balancing ระดับ L4 (TCP/UDP)

### 2. CoreDNS

- DNS server ของ cluster
- แปลงชื่อ Service → ClusterIP
- ตัวอย่าง: `user-service` → `10.96.0.15`

### 3. Endpoints Controller

- ติดตาม pods ที่ตรงกับ Service selector
- อัพเดท Endpoints เมื่อ pods เปลี่ยนแปลง
- Pod ต้อง Ready ถึงจะอยู่ใน Endpoints

### 4. Scheduler

- เลือกว่า Pod ควรรันบน Node ไหน
- พิจารณา: resources, affinity, taints/tolerations

### 5. kubelet

- รันบนทุก Node
- จัดการ lifecycle ของ pods
- รัน health checks (liveness, readiness probes)

---

## 📊 Architecture ของโปรเจคนี้

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
                    │   │   │ RabbitMQ │         │  │product-service│  │  │   │
                    │   │   │  Queue   │         │  │    :3002      │  │  │   │
                    │   │   └──────────┘         │  └───────────────┘  │  │   │
                    │   │         │              │  ┌───────────────┐  │  │   │
                    │   │         ▼              │  │ order-service │  │  │   │
                    │   │   ┌──────────┐         │  │    :3003      │  │  │   │
                    │   │   │   HPA    │         │  └───────────────┘  │  │   │
                    │   │   │AutoScale │         │  ┌───────────────┐  │  │   │
                    │   │   └──────────┘         │  │notification-  │  │  │   │
                    │   │                        │  │service :3004  │  │  │   │
                    │   │                        │  └───────────────┘  │  │   │
                    │   │                        └─────────────────────┘  │   │
                    │   └─────────────────────────────────────────────────┘   │
                    └─────────────────────────────────────────────────────────┘
```

---

## 📦 K8s Resources ที่ใช้ในโปรเจคนี้

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

---

## 🔗 Pod Communication

Pods สื่อสารกันผ่าน **Service DNS**:

```
http://<service-name>.<namespace>.svc.cluster.local:<port>

# ตัวอย่าง
http://user-service.microservices.svc.cluster.local:3001

# หรือแบบสั้น (ใน namespace เดียวกัน)
http://user-service:3001
```

---

## 🐰 RabbitMQ ในโปรเจคนี้

### ทำไมต้องใช้ RabbitMQ?

| แบบเดิม (TCP)              | แบบใหม่ (RabbitMQ)       |
| -------------------------- | ------------------------ |
| Persistent connection      | Message queue            |
| Request ไปที่ pod เดิมตลอด | Request กระจายไปทุก pods |
| ❌ ไม่ load balance        | ✅ Load balance ได้จริง  |

### การทำงาน

```
API Gateway                RabbitMQ              Notification Pods
     │                         │                        │
     │  1. Publish message     │                        │
     │ ───────────────────────▶│                        │
     │                         │  2. Store in queue     │
     │                         │ ─────────────────────▶ │
     │                         │                        │ 3. Consumer 1 ack
     │                         │                        │◀────────────────
     │                         │  4. Next message       │
     │                         │ ─────────────────────▶ │
     │                         │                        │ 5. Consumer 2 ack
     │                         │                        │◀────────────────
```

### RabbitMQ Management UI

เข้าที่ http://localhost:31672

- Username: `admin`
- Password: `password`

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
