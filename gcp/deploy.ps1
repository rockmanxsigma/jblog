# Script de déploiement JGazette sur Google Cloud Platform (PowerShell)
# Usage: .\deploy.ps1 -ProjectId "your-project-id"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [string]$Region = "us-central1",
    [string]$ServiceAccount = "jgazette-deploy@$ProjectId.iam.gserviceaccount.com"
)

# Fonctions pour les logs colorés
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

# Vérifier que gcloud est installé
try {
    $gcloudVersion = gcloud version 2>$null
    if (-not $gcloudVersion) {
        throw "gcloud not found"
    }
} catch {
    Write-Error "gcloud CLI n'est pas installé. Veuillez l'installer depuis https://cloud.google.com/sdk/docs/install"
    exit 1
}

Write-Info "Déploiement de JGazette sur Google Cloud Platform"
Write-Info "Project ID: $ProjectId"
Write-Info "Region: $Region"

# Configurer le projet
Write-Info "Configuration du projet GCP..."
gcloud config set project $ProjectId

# Activer les APIs nécessaires
Write-Info "Activation des APIs Google Cloud..."
gcloud services enable cloudbuild.googleapis.com,run.googleapis.com,sqladmin.googleapis.com,secretmanager.googleapis.com,artifactregistry.googleapis.com

# Créer un service account pour le déploiement
Write-Info "Création du service account..."
try {
    gcloud iam service-accounts create jgazette-deploy --display-name="JGazette Deploy Service Account" --description="Service account pour le déploiement de JGazette"
} catch {
    Write-Warn "Service account existe déjà"
}

# Donner les permissions nécessaires
Write-Info "Configuration des permissions..."
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$ServiceAccount" --role="roles/run.admin"
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$ServiceAccount" --role="roles/cloudbuild.builds.builder"
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$ServiceAccount" --role="roles/artifactregistry.writer"

# Créer un repository Artifact Registry
Write-Info "Création du repository Artifact Registry..."
try {
    gcloud artifacts repositories create jgazette-repo --repository-format=docker --location=$Region --description="Repository Docker pour JGazette"
} catch {
    Write-Warn "Repository existe déjà"
}

# Configurer Docker pour Artifact Registry
Write-Info "Configuration de Docker pour Artifact Registry..."
gcloud auth configure-docker "${Region}-docker.pkg.dev"

# Construire et pousser les images
Write-Info "Construction et push des images Docker..."

# Image API
Write-Info "Construction de l'image API..."
docker build -t "${Region}-docker.pkg.dev/${ProjectId}/jgazette-repo/jgazette-api:latest" ./api
docker push "${Region}-docker.pkg.dev/${ProjectId}/jgazette-repo/jgazette-api:latest"

# Image Web
Write-Info "Construction de l'image Web..."
docker build -t "${Region}-docker.pkg.dev/${ProjectId}/jgazette-repo/jgazette-web:latest" ./web
docker push "${Region}-docker.pkg.dev/${ProjectId}/jgazette-repo/jgazette-web:latest"

# Créer les secrets
Write-Info "Création des secrets..."
try {
    "your-super-secret-jwt-key-change-in-production" | gcloud secrets create jwt-secret --data-file=-
} catch {
    Write-Warn "Secret jwt-secret existe déjà"
}

# Demander l'URI MongoDB à l'utilisateur
Write-Info "Configuration de MongoDB..."
Write-Warn "Pour la production, il est recommandé d'utiliser MongoDB Atlas"
$MongoUri = Read-Host "Entrez votre URI MongoDB (ex: mongodb+srv://user:pass@cluster.mongodb.net/jgazette)"

try {
    $MongoUri | gcloud secrets create mongodb-uri --data-file=-
} catch {
    Write-Warn "Secret mongodb-uri existe déjà"
    $MongoUri | gcloud secrets versions add mongodb-uri --data-file=-
}

# Déployer les services Cloud Run
Write-Info "Déploiement des services Cloud Run..."

# Déployer l'API
Write-Info "Déploiement de l'API..."
gcloud run deploy jgazette-api --image="${Region}-docker.pkg.dev/${ProjectId}/jgazette-repo/jgazette-api:latest" --platform=managed --region=$Region --allow-unauthenticated --service-account=$ServiceAccount --set-secrets="JWT_SECRET=jwt-secret:latest,MONGODB_URI=mongodb-uri:latest" --memory=2Gi --cpu=2 --max-instances=10 --min-instances=1

# Obtenir l'URL de l'API
$ApiUrl = gcloud run services describe jgazette-api --region=$Region --format="value(status.url)"

# Déployer le Web
Write-Info "Déploiement du Frontend..."
gcloud run deploy jgazette-web --image="${Region}-docker.pkg.dev/${ProjectId}/jgazette-repo/jgazette-web:latest" --platform=managed --region=$Region --allow-unauthenticated --service-account=$ServiceAccount --memory=1Gi --cpu=1 --max-instances=10 --min-instances=1

# Obtenir l'URL du Web
$WebUrl = gcloud run services describe jgazette-web --region=$Region --format="value(status.url)"

Write-Info "✅ Déploiement terminé avec succès!"
Write-Info "🌐 Frontend: $WebUrl"
Write-Info "🔧 API: $ApiUrl"

Write-Warn "⚠️  Note importante:"
Write-Warn "   - Assurez-vous que votre URI MongoDB est correcte"
Write-Warn "   - Pour la production, utilisez MongoDB Atlas"
Write-Warn "   - Vérifiez les logs en cas de problème"

Write-Host ""
Write-Info "🔗 Liens utiles:"
Write-Info "   - Console Cloud Run: https://console.cloud.google.com/run?project=$ProjectId"
Write-Info "   - Console Artifact Registry: https://console.cloud.google.com/artifacts?project=$ProjectId"
