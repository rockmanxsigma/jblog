# Script de déploiement JGazette sur Google Cloud Platform avec MongoDB Atlas
# Usage: .\deploy-atlas.ps1 PROJECT_ID MONGODB_ATLAS_URI

param(
    [Parameter(Mandatory=$true)]
    [string]$PROJECT_ID,
    
    [Parameter(Mandatory=$true)]
    [string]$MONGODB_ATLAS_URI
)

# Variables
$REGION = "us-central1"
$SERVICE_ACCOUNT = "jgazette-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

# Fonction pour afficher les logs colorés
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Blue
}

Write-Info "🚀 Déploiement de JGazette sur Google Cloud Platform avec MongoDB Atlas"
Write-Info "Project ID: $PROJECT_ID"
Write-Info "Region: $REGION"
Write-Info "Database: MongoDB Atlas (Cloud)"

# Vérifier que gcloud est installé et configuré
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Error "gcloud CLI n'est pas installé. Veuillez l'installer depuis https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Vérifier que Docker est installé
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker n'est pas installé. Veuillez l'installer depuis https://docs.docker.com/get-docker/"
    exit 1
}

Write-Step "1. Configuration du projet GCP..."
gcloud config set project $PROJECT_ID

Write-Step "2. Activation des APIs Google Cloud..."
gcloud services enable `
    cloudbuild.googleapis.com `
    run.googleapis.com `
    secretmanager.googleapis.com `
    artifactregistry.googleapis.com

Write-Step "3. Création du service account..."
try {
    gcloud iam service-accounts create jgazette-deploy `
        --display-name="JGazette Deploy Service Account" `
        --description="Service account pour le déploiement de JGazette"
} catch {
    Write-Warn "Service account existe déjà"
}

# Donner les permissions nécessaires
Write-Info "Configuration des permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SERVICE_ACCOUNT}" `
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SERVICE_ACCOUNT}" `
    --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SERVICE_ACCOUNT}" `
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SERVICE_ACCOUNT}" `
    --role="roles/secretmanager.secretAccessor"

Write-Step "4. Création du repository Artifact Registry..."
try {
    gcloud artifacts repositories create jgazette-repo `
        --repository-format=docker `
        --location=$REGION `
        --description="Repository Docker pour JGazette"
} catch {
    Write-Warn "Repository existe déjà"
}

# Configurer Docker pour Artifact Registry
Write-Info "Configuration de Docker pour Artifact Registry..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev"

Write-Step "5. Création des secrets..."
# Créer le secret JWT
$JWT_SECRET = "your-super-secret-jwt-key-change-in-production-$(Get-Date -Format 'yyyyMMddHHmmss')"
$JWT_SECRET | gcloud secrets create jwt-secret --data-file=- 2>$null
if ($LASTEXITCODE -ne 0) { Write-Warn "Secret jwt-secret existe déjà" }

# Créer le secret MongoDB Atlas URI
$MONGODB_ATLAS_URI | gcloud secrets create mongodb-atlas-uri --data-file=- 2>$null
if ($LASTEXITCODE -ne 0) { Write-Warn "Secret mongodb-atlas-uri existe déjà" }

Write-Step "6. Construction et push des images Docker..."

# Image API
Write-Info "Construction de l'image API..."
docker build -t "${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest" ../api
docker push "${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest"

# Image Web
Write-Info "Construction de l'image Web..."
docker build -t "${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest" ../web
docker push "${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest"

Write-Step "7. Déploiement des services Cloud Run..."

# Déployer l'API
Write-Info "Déploiement de l'API..."
gcloud run deploy jgazette-api `
    --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest" `
    --platform=managed `
    --region=$REGION `
    --allow-unauthenticated `
    --service-account=${SERVICE_ACCOUNT} `
    --set-secrets="JWT_SECRET=jwt-secret:latest,MONGODB_ATLAS_URI=mongodb-atlas-uri:latest" `
    --set-env-vars="NODE_ENV=production,CORS_ORIGIN=https://jgazette-web-${PROJECT_ID}.${REGION}.run.app,UPLOAD_PATH=/tmp/uploads" `
    --memory=2Gi `
    --cpu=2 `
    --max-instances=10 `
    --min-instances=1 `
    --timeout=300

# Obtenir l'URL de l'API
$API_URL = gcloud run services describe jgazette-api --region=$REGION --format="value(status.url)"

# Déployer le Web
Write-Info "Déploiement du Frontend..."
gcloud run deploy jgazette-web `
    --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest" `
    --platform=managed `
    --region=$REGION `
    --allow-unauthenticated `
    --service-account=${SERVICE_ACCOUNT} `
    --set-env-vars="API_URL=${API_URL}" `
    --memory=1Gi `
    --cpu=1 `
    --max-instances=10 `
    --min-instances=1 `
    --timeout=300

# Obtenir l'URL du Web
$WEB_URL = gcloud run services describe jgazette-web --region=$REGION --format="value(status.url)"

Write-Info "✅ Déploiement terminé avec succès!"
Write-Host ""
Write-Info "🌐 Frontend: $WEB_URL"
Write-Info "🔧 API: $API_URL"
Write-Info "📊 Base de données: MongoDB Atlas (Cloud)"
Write-Host ""
Write-Info "🔗 Liens utiles:"
Write-Info "   - Console Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
Write-Info "   - Console Secret Manager: https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
Write-Info "   - Console Artifact Registry: https://console.cloud.google.com/artifacts?project=$PROJECT_ID"
Write-Host ""
Write-Info "🧪 Test de l'application:"
Write-Info "   - Frontend: curl $WEB_URL"
Write-Info "   - API Health: curl $API_URL/health"
Write-Host ""
Write-Warn "⚠️  Notes importantes:"
Write-Warn "   - Vérifiez que MongoDB Atlas autorise les connexions depuis GCP"
Write-Warn "   - Configurez les IPs autorisées dans MongoDB Atlas Network Access"
Write-Warn "   - Testez toutes les fonctionnalités après le déploiement"
