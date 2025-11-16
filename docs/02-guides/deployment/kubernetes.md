# Kubernetes Deployment Guide

**Connectors Platform - Production Deployment**

---

## Overview

Production deployment with HA and auto-scaling.

**Duration:** 1-2 hours | **Resources:** 12-42GB RAM, 11-21 CPUs

---

## Prerequisites

```bash
kubectl version --client  # kubectl 1.24+
helm version             # Helm 3.0+
docker --version
```

**Requirements:** K8s 1.24+, 3+ nodes (4 vCPU, 16GB), PV provisioner, LB/Ingress, Registry

---

## Quick Start

```bash
# Build & push
docker build -t yourregistry/mcp-gateway:latest ./gateway && docker push yourregistry/mcp-gateway:latest

# Deploy
kubectl create namespace connectors
kubectl apply -f k8s/ -n connectors
kubectl get pods -n connectors
```

---

## Gateway Deployment

**`k8s/gateway-deployment.yaml`:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: mcp-gateway, namespace: connectors }
spec:
  replicas: 3
  selector:
    matchLabels: { app: mcp-gateway }
  template:
    metadata:
      labels: { app: mcp-gateway }
    spec:
      containers:
      - name: gateway
        image: yourregistry/mcp-gateway:latest
        ports: [{ containerPort: 3000 }]
        resources:
          requests: { memory: "2Gi", cpu: "1000m" }
          limits: { memory: "4Gi", cpu: "2000m" }
        env:
        - { name: NODE_ENV, value: "production" }
        - { name: VAULT_ADDR, value: "http://vault:8200" }
        - { name: NEO4J_URI, value: "bolt://neo4j:7687" }
        livenessProbe:
          httpGet: { path: /health, port: 3000 }
          initialDelaySeconds: 30
        readinessProbe:
          httpGet: { path: /ready, port: 3000 }
          initialDelaySeconds: 5
```

---

## Service & HPA

**Service:**
```yaml
apiVersion: v1
kind: Service
metadata: { name: mcp-gateway, namespace: connectors }
spec:
  type: LoadBalancer
  selector: { app: mcp-gateway }
  ports: [{ port: 8000, targetPort: 3000 }]
```

**HPA:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: mcp-gateway-hpa, namespace: connectors }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: mcp-gateway }
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
```

---

## MCP Deployment

**`k8s/code-mcp.yaml`:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: code-mcp, namespace: connectors }
spec:
  replicas: 2
  selector:
    matchLabels: { app: code-mcp }
  template:
    metadata: { labels: { app: code-mcp } }
    spec:
      containers:
      - name: code-mcp
        image: yourregistry/code-mcp:latest
        ports: [{ containerPort: 3000 }]
        resources:
          requests: { memory: "2Gi", cpu: "1000m" }
          limits: { memory: "4Gi", cpu: "2000m" }
        env: [{ name: CATEGORY, value: "code" }]
---
apiVersion: v1
kind: Service
metadata: { name: code-mcp }
spec:
  type: ClusterIP
  selector: { app: code-mcp }
  ports: [{ port: 3000 }]
```

---

## Secrets

```bash
kubectl create secret generic vault-token --from-literal=token=your-token -n connectors
kubectl create secret generic neo4j-auth --from-literal=username=neo4j --from-literal=password=pass -n connectors
```

**Use:**
```yaml
env:
- name: VAULT_TOKEN
  valueFrom: { secretKeyRef: { name: vault-token, key: token } }
```

---

## Storage

**Vault:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: vault-data, namespace: connectors }
spec:
  accessModes: [ReadWriteOnce]
  resources: { requests: { storage: 10Gi } }
```

**Neo4j StatefulSet:**
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata: { name: neo4j }
spec:
  serviceName: neo4j
  replicas: 3
  volumeClaimTemplates:
  - metadata: { name: neo4j-data }
    spec:
      accessModes: [ReadWriteOnce]
      resources: { requests: { storage: 50Gi } }
```

---

## Monitoring

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata: { name: mcp-gateway, namespace: connectors }
spec:
  selector: { matchLabels: { app: mcp-gateway } }
  endpoints: [{ port: http, path: /metrics, interval: 30s }]
```

---

## Commands

```bash
# Deploy
kubectl create namespace connectors
kubectl apply -f k8s/ -n connectors

# Update
kubectl set image deployment/mcp-gateway gateway=yourregistry/mcp-gateway:v1.2.0 -n connectors
kubectl rollout status deployment/mcp-gateway -n connectors

# Verify
kubectl get pods,svc,hpa -n connectors

# Rollback
kubectl rollout undo deployment/mcp-gateway -n connectors
```

---

## Scaling

**Gateway:** Small (min=2, max=5) | Large (min=3, max=10)
**MCPs:** Popular (min=2, max=10) | Others (min=1, max=3)

---

## Production Checklist

**Pre:** Images pushed, Secrets created, Storage ready, LB configured
**Post:** Pods running, HPA scaling, Metrics working, Alerts set
**Security:** RBAC, Network policies, TLS, Audit logging

---

## Troubleshooting

**Pods:**
```bash
kubectl logs [pod] -n connectors
kubectl describe pod [pod] -n connectors
```

**Service:**
```bash
kubectl get endpoints -n connectors
kubectl run -it --rm debug --image=busybox -n connectors -- wget http://mcp-gateway:8000/health
```

**HPA:** `kubectl top nodes` | `kubectl describe hpa mcp-gateway-hpa -n connectors`

