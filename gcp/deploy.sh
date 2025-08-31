#!/bin/bash

# Script de déploiement JGazette sur Google Cloud Platform
# Usage: ./deploy.sh PROJECT_ID

set -e

# Variables
PROJECT_ID=$1
REGION="us-central1"
SERVICE_ACCOUNT="jgazette-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Vérifier que PROJECT_ID est fourni
if [ -z "$PROJECT_ID" ]; then
    log_error "Usage: $0 PROJECT_ID"
    log_error "Exemple: $0 my-gcp-project"
    exit 1
fi

log_info "Déploiement de JGazette sur Google Cloud Platform"
log_info "Project ID: $PROJECT_ID"
log_info "Region: $REGION"

# Vérifier que gcloud est installé et configuré
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI n'est pas installé. Veuillez l'installer depuis https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Configurer le projet
log_info "Configuration du projet GCP..."
gcloud config set project $PROJECT_ID

# Activer les APIs nécessaires
log_info "Activation des APIs Google Cloud..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com

# Créer un service account pour le déploiement
log_info "Création du service account..."
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

# Créer un repository Artifact Registry
log_info "Création du repository Artifact Registry..."
gcloud artifacts repositories create jgazette-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="Repository Docker pour JGazette" \
    || log_warn "Repository existe déjà"

# Configurer Docker pour Artifact Registry
log_info "Configuration de Docker pour Artifact Registry..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Construire et pousser les images
log_info "Construction et push des images Docker..."

# Image API
log_info "Construction de l'image API..."
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest ./api
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest

# Image Web
log_info "Construction de l'image Web..."
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest ./web
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest

# Créer les secrets
log_info "Création des secrets..."
echo -n "your-super-secret-jwt-key-change-in-production" | gcloud secrets create jwt-secret --data-file=- || log_warn "Secret jwt-secret existe déjà"

# Créer une instance Cloud SQL pour MongoDB (MongoDB Atlas recommandé pour la production)
log_warn "Note: Pour la production, il est recommandé d'utiliser MongoDB Atlas au lieu de Cloud SQL"
log_warn "Création d'une instance Cloud SQL pour le développement..."

# Instance Cloud SQL (PostgreSQL - MongoDB n'est pas supporté nativement)
gcloud sql instances create jgazette-db \
    --database-version=POSTGRES_13 \
    --tier=db-f1-micro \
    --region=$REGION \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup \
    --enable-ip-alias \
    || log_warn "Instance Cloud SQL existe déjà"

# Créer la base de données
gcloud sql databases create jgazette \
    --instance=jgazette-db \
    || log_warn "Base de données existe déjà"

# Créer un utilisateur
gcloud sql users create jgazette-user \
    --instance=jgazette-db \
    --password=jgazette-password \
    || log_warn "Utilisateur existe déjà"

# Obtenir l'IP de l'instance
DB_IP=$(gcloud sql instances describe jgazette-db --format="value(ipAddresses[0].ipAddress)")

# Créer le secret MongoDB URI
MONGODB_URI="mongodb://jgazette-user:jgazette-password@${DB_IP}:5432/jgazette"
echo -n "$MONGODB_URI" | gcloud secrets create mongodb-uri --data-file=- || log_warn "Secret mongodb-uri existe déjà"

# Mettre à jour les fichiers de configuration avec le PROJECT_ID
log_info "Mise à jour des fichiers de configuration..."
sed -i "s/PROJECT_ID/$PROJECT_ID/g" gcp/cloud-run-api.yaml
sed -i "s/PROJECT_ID/$PROJECT_ID/g" gcp/cloud-run-web.yaml

# Déployer les services Cloud Run
log_info "Déploiement des services Cloud Run..."

# Déployer l'API
log_info "Déploiement de l'API..."
gcloud run deploy jgazette-api \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --service-account=${SERVICE_ACCOUNT} \
    --set-secrets="JWT_SECRET=jwt-secret:latest,MONGODB_URI=mongodb-uri:latest" \
    --memory=2Gi \
    --cpu=2 \
    --max-instances=10 \
    --min-instances=1

# Obtenir l'URL de l'API
API_URL=$(gcloud run services describe jgazette-api --region=$REGION --format="value(status.url)")

# Mettre à jour l'URL de l'API dans la configuration web
sed -i "s|https://jgazette-api-XXXXX-uc.a.run.app|$API_URL|g" gcp/cloud-run-web.yaml

# Déployer le Web
log_info "Déploiement du Frontend..."
gcloud run deploy jgazette-web \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --service-account=${SERVICE_ACCOUNT} \
    --memory=1Gi \
    --cpu=1 \
    --max-instances=10 \
    --min-instances=1

# Obtenir l'URL du Web
WEB_URL=$(gcloud run services describe jgazette-web --region=$REGION --format="value(status.url)")

log_info "✅ Déploiement terminé avec succès!"
log_info "🌐 Frontend: $WEB_URL"
log_info "🔧 API: $API_URL"
log_info "📊 Base de données: Cloud SQL PostgreSQL (${DB_IP})"

log_warn "⚠️  Note importante:"
log_warn "   - MongoDB n'est pas supporté nativement par Cloud SQL"
log_warn "   - Pour la production, utilisez MongoDB Atlas"
log_warn "   - L'application utilise actuellement PostgreSQL"
log_warn "   - Vous devrez adapter le code pour PostgreSQL ou utiliser MongoDB Atlas"

echo ""
log_info "🔗 Liens utiles:"
log_info "   - Console Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
log_info "   - Console Cloud SQL: https://console.cloud.google.com/sql?project=$PROJECT_ID"
log_info "   - Console Artifact Registry: https://console.cloud.google.com/artifacts?project=$PROJECT_ID"
