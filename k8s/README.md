# Kubernetes Manifests

## Structure

```
k8s/
├── namespace.yaml          # food-delivery namespace
├── configmap.yaml          # non-secret env vars
├── secret.yaml             # credentials (DO NOT commit real values)
├── postgres/
│   ├── statefulset.yaml    # PostgreSQL 16 with PVC
│   └── service.yaml        # ClusterIP — internal only
├── pgbouncer/
│   ├── deployment.yaml     # PgBouncer 1.23 — transaction-mode connection pooler
│   └── service.yaml        # ClusterIP port 6432 — app connects here, not postgres:5432
├── redis/
│   ├── statefulset.yaml    # Redis 7 with PVC + AOF persistence
│   └── service.yaml        # ClusterIP — internal only
├── migrate/
│   └── job.yaml            # Prisma migrate deploy — connects DIRECTLY to postgres:5432
└── app/
    ├── deployment.yaml     # NestJS app, 2 replicas, rolling update
    ├── service.yaml        # ClusterIP, port 80 → 3000
    ├── hpa.yaml            # Auto-scale 2–6 pods on CPU/memory
    └── ingress.yaml        # nginx ingress + WebSocket support
```

## Before First Deploy

### 1. Build and push the image

```bash
docker build -t YOUR_REGISTRY/food-delivery-backend:latest .
docker push YOUR_REGISTRY/food-delivery-backend:latest
```

Replace `YOUR_REGISTRY/food-delivery-backend:latest` in:
- `k8s/migrate/job.yaml`
- `k8s/app/deployment.yaml`

### 2. Fill in real secret values

```bash
# Encode each value
echo -n "your-db-password" | base64
echo -n "postgresql://postgres:PASSWORD@postgres-service:5432/food_delivery" | base64
echo -n "your-jwt-access-secret-min-32-chars" | base64
echo -n "your-jwt-refresh-secret-min-32-chars" | base64
```

Edit `k8s/secret.yaml` with the encoded values.  
**Never commit `secret.yaml` with real values** — use Sealed Secrets or External Secrets Operator.

### 3. Set your domain

Edit `k8s/app/ingress.yaml` → replace `api.yourdomain.com`.

---

## Deploy Order

```bash
# 1. Namespace first
kubectl apply -f k8s/namespace.yaml

# 2. Config + Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 3. Postgres
kubectl apply -f k8s/postgres/
kubectl rollout status statefulset/postgres -n food-delivery

# 4. PgBouncer (after Postgres is ready)
kubectl apply -f k8s/pgbouncer/
kubectl rollout status deployment/pgbouncer -n food-delivery

# 5. Redis
kubectl apply -f k8s/redis/
kubectl rollout status statefulset/redis -n food-delivery

# 6. DB migration — connects DIRECTLY to Postgres (bypasses PgBouncer)
kubectl apply -f k8s/migrate/job.yaml
kubectl wait --for=condition=complete job/db-migrate -n food-delivery --timeout=120s

# 7. App — connects to pgbouncer-service:6432
kubectl apply -f k8s/app/
kubectl rollout status deployment/food-delivery-app -n food-delivery
```

## Update App (after new image push)

```bash
# Update image tag and rolling-update
kubectl set image deployment/food-delivery-app \
  app=YOUR_REGISTRY/food-delivery-backend:NEW_TAG \
  -n food-delivery

kubectl rollout status deployment/food-delivery-app -n food-delivery
```

## Useful Commands

```bash
# Check all pods
kubectl get pods -n food-delivery

# App logs
kubectl logs -f deployment/food-delivery-app -n food-delivery

# Postgres shell
kubectl exec -it statefulset/postgres -n food-delivery -- psql -U postgres -d food_delivery

# Redis shell
kubectl exec -it statefulset/redis -n food-delivery -- redis-cli

# Scale manually
kubectl scale deployment/food-delivery-app --replicas=4 -n food-delivery

# Rollback
kubectl rollout undo deployment/food-delivery-app -n food-delivery
```
