# Script de nettoyage des ressources GCP pour jBlog
# Usage: .\cleanup.ps1 PROJECT_ID [--confirm]

param(
    [Parameter(Mandatory=$true)]
    [string]$PROJECT_ID,
    
    [Parameter(Mandatory=$false)]
    [switch]$Confirm
)

$REGION = "us-central1"

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

Write-Warn "🧹 Nettoyage des ressources GCP pour jBlog"
Write-Warn "Project ID: $PROJECT_ID"
Write-Warn "Region: $REGION"

if (-not $Confirm) {
    Write-Warn "⚠️  ATTENTION: Cette opération va supprimer toutes les ressources jBlog sur GCP!"
    Write-Warn "   - Services Cloud Run (API et Web)"
    Write-Warn "   - Images Docker dans Artifact Registry"
    Write-Warn "   - Secrets dans Secret Manager"
    Write-Warn "   - Repository Artifact Registry"
    Write-Warn ""
    Write-Warn "Pour confirmer, relancez avec --confirm"
    Write-Warn "Exemple: .\cleanup.ps1 $PROJECT_ID --confirm"
    exit 0
}

Write-Info "✅ Confirmation reçue. Début du nettoyage..."

# Vérifier que gcloud est configuré
Write-Step "1. Vérification de la configuration gcloud..."
try {
    $currentProject = gcloud config get-value project
    if ($currentProject -ne $PROJECT_ID) {
        Write-Info "Configuration du projet..."
        gcloud config set project $PROJECT_ID
    }
    Write-Info "✅ Projet configuré: $PROJECT_ID"
} catch {
    Write-Error "Erreur lors de la configuration gcloud: $_"
    exit 1
}

# Supprimer les services Cloud Run
Write-Step "2. Suppression des services Cloud Run..."

try {
    Write-Info "Suppression du service API..."
    gcloud run services delete jgazette-api --region=$REGION --quiet 2>$null
    Write-Info "✅ Service API supprimé"
} catch {
    Write-Warn "⚠️ Erreur lors de la suppression du service API: $_"
}

try {
    Write-Info "Suppression du service Web..."
    gcloud run services delete jgazette-web --region=$REGION --quiet 2>$null
    Write-Info "✅ Service Web supprimé"
} catch {
    Write-Warn "⚠️ Erreur lors de la suppression du service Web: $_"
}

# Supprimer les images Docker
Write-Step "3. Suppression des images Docker..."

try {
    Write-Info "Suppression des images API..."
    gcloud artifacts docker images delete "${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest" --quiet 2>$null
    Write-Info "✅ Images API supprimées"
} catch {
    Write-Warn "⚠️ Erreur lors de la suppression des images API: $_"
}

try {
    Write-Info "Suppression des images Web..."
    gcloud artifacts docker images delete "${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest" --quiet 2>$null
    Write-Info "✅ Images Web supprimées"
} catch {
    Write-Warn "⚠️ Erreur lors de la suppression des images Web: $_"
}

# Supprimer les secrets
Write-Step "4. Suppression des secrets..."

try {
    Write-Info "Suppression du secret JWT..."
    gcloud secrets delete jwt-secret --quiet 2>$null
    Write-Info "✅ Secret JWT supprimé"
} catch {
    Write-Warn "⚠️ Erreur lors de la suppression du secret JWT: $_"
}

try {
    Write-Info "Suppression du secret MongoDB Atlas..."
    gcloud secrets delete mongodb-atlas-uri --quiet 2>$null
    Write-Info "✅ Secret MongoDB Atlas supprimé"
} catch {
    Write-Warn "⚠️ Erreur lors de la suppression du secret MongoDB Atlas: $_"
}

# Supprimer le repository Artifact Registry
Write-Step "5. Suppression du repository Artifact Registry..."

try {
    Write-Info "Suppression du repository jgazette-repo..."
    gcloud artifacts repositories delete jgazette-repo --location=$REGION --quiet 2>$null
    Write-Info "✅ Repository Artifact Registry supprimé"
} catch {
    Write-Warn "⚠️ Erreur lors de la suppression du repository: $_"
}

# Supprimer le service account
Write-Step "6. Suppression du service account..."

try {
    Write-Info "Suppression du service account jgazette-deploy..."
    gcloud iam service-accounts delete "jgazette-deploy@${PROJECT_ID}.iam.gserviceaccount.com" --quiet 2>$null
    Write-Info "✅ Service account supprimé"
} catch {
    Write-Warn "⚠️ Erreur lors de la suppression du service account: $_"
}

# Vérifier les ressources restantes
Write-Step "7. Vérification des ressources restantes..."

Write-Info "Services Cloud Run restants:"
$remainingServices = gcloud run services list --region=$REGION --format="value(name)" | Where-Object { $_ -match "jgazette" }
if ($remainingServices) {
    Write-Warn "⚠️ Services restants: $remainingServices"
} else {
    Write-Info "✅ Aucun service jgazette restant"
}

Write-Info "Secrets restants:"
$remainingSecrets = gcloud secrets list --format="value(name)" | Where-Object { $_ -match "jwt-secret|mongodb-atlas-uri" }
if ($remainingSecrets) {
    Write-Warn "⚠️ Secrets restants: $remainingSecrets"
} else {
    Write-Info "✅ Aucun secret jgazette restant"
}

Write-Info "Repositories Artifact Registry restants:"
$remainingRepos = gcloud artifacts repositories list --location=$REGION --format="value(name)" | Where-Object { $_ -match "jgazette" }
if ($remainingRepos) {
    Write-Warn "⚠️ Repositories restants: $remainingRepos"
} else {
    Write-Info "✅ Aucun repository jgazette restant"
}

Write-Host ""
Write-Info "🎉 Nettoyage terminé!"
Write-Info "📊 Résumé:"
Write-Info "   - Services Cloud Run: Supprimés"
Write-Info "   - Images Docker: Supprimées"
Write-Info "   - Secrets: Supprimés"
Write-Info "   - Repository Artifact Registry: Supprimé"
Write-Info "   - Service Account: Supprimé"
Write-Host ""
Write-Info "💡 Pour redéployer, utilisez:"
Write-Info "   .\deploy-atlas.ps1 $PROJECT_ID 'MONGODB_ATLAS_URI'"
Write-Host ""
Write-Warn "⚠️  Note: MongoDB Atlas n'est pas affecté par ce nettoyage"
Write-Warn "   Vos données restent intactes dans MongoDB Atlas"
