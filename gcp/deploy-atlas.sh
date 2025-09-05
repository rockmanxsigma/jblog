#!/bin/bash

# Script de déploiement JGazette sur Google Cloud Platform avec MongoDB Atlas
# Usage: ./deploy-atlas.sh PROJECT_ID MONGODB_ATLAS_URI

set -e

# Variables
PROJECT_ID=$1
MONGODB_ATLAS_URI=$2
REGION="us-central1"
SERVICE_ACCOUNT="jgazette-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les logs colorés
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Vérifier que PROJECT_ID et MONGODB_ATLAS_URI sont fournis
if [ -z "$PROJECT_ID" ] || [ -z "$MONGODB_ATLAS_URI" ]; then
    log_error "Usage: $0 PROJECT_ID MONGODB_ATLAS_URI"
    log_error "Exemple: $0 my-gcp-project 'mongodb+srv://user:pass@cluster.mongodb.net/jgazette'"
    exit 1
fi

log_info "🚀 Déploiement de JGazette sur Google Cloud Platform avec MongoDB Atlas"
log_info "Project ID: $PROJECT_ID"
log_info "Region: $REGION"
log_info "Database: MongoDB Atlas (Cloud)"

# Vérifier que gcloud est installé et configuré
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI n'est pas installé. Veuillez l'installer depuis https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé. Veuillez l'installer depuis https://docs.docker.com/get-docker/"
    exit 1
fi

log_step "1. Configuration du projet GCP..."
gcloud config set project $PROJECT_ID

log_step "2. Activation des APIs Google Cloud..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com

log_step "3. Création du service account..."
gcloud iam service-accounts create jgazette-deploy \
    --display-name="JGazette Deploy Service Account" \
    --description="Service account pour le déploiement de JGazette" \
    || log_warn "Service account existe déjà"

# Donner les permissions nécessaires
log_info "Configuration des permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

log_step "4. Création du repository Artifact Registry..."
gcloud artifacts repositories create jgazette-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="Repository Docker pour JGazette" \
    || log_warn "Repository existe déjà"

# Configurer Docker pour Artifact Registry
log_info "Configuration de Docker pour Artifact Registry..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev

log_step "5. Création des secrets..."
# Créer le secret JWT
echo -n "your-super-secret-jwt-key-change-in-production-$(date +%s)" | gcloud secrets create jwt-secret --data-file=- || log_warn "Secret jwt-secret existe déjà"

# Créer le secret MongoDB Atlas URI
echo -n "$MONGODB_ATLAS_URI" | gcloud secrets create mongodb-atlas-uri --data-file=- || log_warn "Secret mongodb-atlas-uri existe déjà"

log_step "6. Construction et push des images Docker..."

# Image API
log_info "Construction de l'image API..."
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest ./api
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest

# Image Web
log_info "Construction de l'image Web..."
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest ./web
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest

log_step "7. Déploiement des services Cloud Run..."

# Déployer l'API
log_info "Déploiement de l'API..."
gcloud run deploy jgazette-api \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --service-account=${SERVICE_ACCOUNT} \
    --set-secrets="JWT_SECRET=jwt-secret:latest,MONGODB_ATLAS_URI=mongodb-atlas-uri:latest" \
    --set-env-vars="NODE_ENV=production,PORT=5000,CORS_ORIGIN=https://jgazette-web-${PROJECT_ID}.${REGION}.run.app,UPLOAD_PATH=/tmp/uploads" \
    --memory=2Gi \
    --cpu=2 \
    --max-instances=10 \
    --min-instances=1 \
    --timeout=300

# Obtenir l'URL de l'API
API_URL=$(gcloud run services describe jgazette-api --region=$REGION --format="value(status.url)")

# Déployer le Web
log_info "Déploiement du Frontend..."
gcloud run deploy jgazette-web \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --service-account=${SERVICE_ACCOUNT} \
    --set-env-vars="API_URL=${API_URL}" \
    --memory=1Gi \
    --cpu=1 \
    --max-instances=10 \
    --min-instances=1 \
    --timeout=300

# Obtenir l'URL du Web
WEB_URL=$(gcloud run services describe jgazette-web --region=$REGION --format="value(status.url)")

log_info "✅ Déploiement terminé avec succès!"
echo ""
log_info "🌐 Frontend: $WEB_URL"
log_info "🔧 API: $API_URL"
log_info "📊 Base de données: MongoDB Atlas (Cloud)"
echo ""
log_info "🔗 Liens utiles:"
log_info "   - Console Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
log_info "   - Console Secret Manager: https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
log_info "   - Console Artifact Registry: https://console.cloud.google.com/artifacts?project=$PROJECT_ID"
echo ""
log_info "🧪 Test de l'application:"
log_info "   - Frontend: curl $WEB_URL"
log_info "   - API Health: curl $API_URL/health"
echo ""
log_warn "⚠️  Notes importantes:"
log_warn "   - Vérifiez que MongoDB Atlas autorise les connexions depuis GCP"
log_warn "   - Configurez les IPs autorisées dans MongoDB Atlas Network Access"
log_warn "   - Testez toutes les fonctionnalités après le déploiement"
