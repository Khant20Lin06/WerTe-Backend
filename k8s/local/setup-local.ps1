# ═══════════════════════════════════════════════════════════════════
# WerTee Local Kubernetes Setup Script
# Run from backend root: .\k8s\local\setup-local.ps1
# Prerequisites: Docker Desktop + k3d installed
# ═══════════════════════════════════════════════════════════════════

param(
    [switch]$Monitoring,   # -Monitoring flag ဆိုရင် Grafana ပါ install
    [switch]$Reset         # -Reset flag ဆိုရင် cluster ကို delete ပြီး ပြန်ဆောက်
)

$ErrorActionPreference = "Stop"
$CLUSTER_NAME = "wertee-local"
$BACKEND_DIR = "$PSScriptRoot\..\.."

function Write-Step($msg) {
    Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Write-Success($msg) {
    Write-Host "OK  $msg" -ForegroundColor Green
}

# ── 0. Reset ──────────────────────────────────────────────────────────────────
if ($Reset) {
    Write-Step "Deleting existing cluster..."
    k3d cluster delete $CLUSTER_NAME 2>$null
    Write-Success "Old cluster removed"
}

# ── 1. Cluster ────────────────────────────────────────────────────────────────
Write-Step "Checking k3d cluster..."
$existing = k3d cluster list --no-headers 2>$null | Select-String $CLUSTER_NAME
if (-not $existing) {
    Write-Step "Creating k3d cluster '$CLUSTER_NAME'..."
    k3d cluster create $CLUSTER_NAME `
        --port "8080:80@loadbalancer" `
        --port "5433:5432@loadbalancer" `
        --agents 1
    Write-Success "Cluster created"
} else {
    Write-Success "Cluster already exists, skipping create"
}

kubectl config use-context "k3d-$CLUSTER_NAME"

# ── 2. Docker Image Build ─────────────────────────────────────────────────────
Write-Step "Building backend Docker image..."
docker build -t wertee-backend:local $BACKEND_DIR
Write-Success "Image built"

Write-Step "Importing image into k3d cluster..."
k3d image import wertee-backend:local -c $CLUSTER_NAME
Write-Success "Image imported"

# ── 3. Namespaces ─────────────────────────────────────────────────────────────
Write-Step "Applying namespace..."
kubectl apply -f "$PSScriptRoot\base\00-namespace.yaml"
Write-Success "Namespace: wertee-dev"

# ── 4. Config + Secrets ───────────────────────────────────────────────────────
Write-Step "Applying ConfigMap + Secrets..."
kubectl apply -f "$PSScriptRoot\base\01-config.yaml"
Write-Success "Config applied"

# ── 5. PostgreSQL ─────────────────────────────────────────────────────────────
Write-Step "Deploying PostgreSQL..."
kubectl apply -f "$PSScriptRoot\base\02-postgres.yaml"

Write-Host "  Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
kubectl rollout status statefulset/postgres -n wertee-dev --timeout=120s
Write-Success "PostgreSQL ready"

# ── 6. Redis ──────────────────────────────────────────────────────────────────
Write-Step "Deploying Redis..."
kubectl apply -f "$PSScriptRoot\base\03-redis.yaml"

kubectl rollout status deployment/redis -n wertee-dev --timeout=60s
Write-Success "Redis ready"

# ── 6b. PgBouncer ─────────────────────────────────────────────────────────────
Write-Step "Deploying PgBouncer..."
kubectl apply -f "$PSScriptRoot\base\02b-pgbouncer.yaml"

kubectl rollout status deployment/pgbouncer -n wertee-dev --timeout=60s
Write-Success "PgBouncer ready"

# ── 7. Prisma Migrate ─────────────────────────────────────────────────────────
Write-Step "Running Prisma migrations..."

# Previous job ရှိရင် delete လုပ် (re-run အတွက်)
kubectl delete job prisma-migrate -n wertee-dev 2>$null

kubectl apply -f "$PSScriptRoot\base\04-migrate-job.yaml"

Write-Host "  Waiting for migration to complete..." -ForegroundColor Yellow
kubectl wait --for=condition=complete job/prisma-migrate `
    -n wertee-dev --timeout=120s

if ($LASTEXITCODE -ne 0) {
    Write-Host "Migration failed! Logs:" -ForegroundColor Red
    kubectl logs job/prisma-migrate -n wertee-dev
    exit 1
}
Write-Success "Migrations applied"

# ── 8. Backend ────────────────────────────────────────────────────────────────
Write-Step "Deploying WerTee Backend..."
kubectl apply -f "$PSScriptRoot\base\05-backend.yaml"

kubectl rollout status deployment/wertee-backend -n wertee-dev --timeout=120s
Write-Success "Backend ready"

# ── 9. Monitoring (Optional) ──────────────────────────────────────────────────
if ($Monitoring) {
    Write-Step "Deploying Monitoring (Prometheus + Grafana)..."
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
    kubectl apply -f "$PSScriptRoot\monitoring\grafana-simple.yaml"
    kubectl rollout status deployment/grafana -n monitoring --timeout=120s
    Write-Success "Monitoring ready"
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "══════════════════════════════════════════" -ForegroundColor Green
Write-Host "  WerTee Local Setup Complete!" -ForegroundColor Green
Write-Host "══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend API:  http://localhost:8080/api/v1" -ForegroundColor White
Write-Host "  Swagger UI:   http://localhost:8080/api/v1/docs" -ForegroundColor White
Write-Host "  Health:       http://localhost:8080/api/v1/health/live" -ForegroundColor White

if ($Monitoring) {
    Write-Host ""
    Write-Host "  (New terminal မှာ run ပါ)" -ForegroundColor Yellow
    Write-Host "  Grafana:  kubectl port-forward svc/grafana 3030:3000 -n monitoring" -ForegroundColor White
    Write-Host "            http://localhost:3030  (admin / admin123)" -ForegroundColor White
}

Write-Host ""
Write-Host "  Useful commands:" -ForegroundColor Yellow
Write-Host "  kubectl get pods -n wertee-dev" -ForegroundColor Gray
Write-Host "  kubectl logs -f deploy/wertee-backend -n wertee-dev" -ForegroundColor Gray
Write-Host "  kubectl port-forward svc/postgres 5432:5432 -n wertee-dev" -ForegroundColor Gray
