# Script de test du déploiement JGazette sur GCP
# Usage: .\test-deployment.ps1 PROJECT_ID

param(
    [Parameter(Mandatory=$true)]
    [string]$PROJECT_ID
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

Write-Info "🧪 Test du déploiement JGazette sur GCP"
Write-Info "Project ID: $PROJECT_ID"
Write-Info "Region: $REGION"

# Vérifier que gcloud est configuré
Write-Step "1. Vérification de la configuration gcloud..."
try {
    $currentProject = gcloud config get-value project
    if ($currentProject -ne $PROJECT_ID) {
        Write-Warn "Le projet configuré ($currentProject) ne correspond pas au projet demandé ($PROJECT_ID)"
        Write-Info "Configuration du projet..."
        gcloud config set project $PROJECT_ID
    }
    Write-Info "✅ Projet configuré: $PROJECT_ID"
} catch {
    Write-Error "Erreur lors de la configuration gcloud: $_"
    exit 1
}

# Vérifier que les services existent
Write-Step "2. Vérification des services Cloud Run..."

try {
    $apiService = gcloud run services describe jgazette-api --region=$REGION --format="value(status.url)" 2>$null
    if ($apiService) {
        Write-Info "✅ Service API trouvé: $apiService"
    } else {
        Write-Error "❌ Service API non trouvé"
        exit 1
    }
} catch {
    Write-Error "❌ Erreur lors de la vérification du service API: $_"
    exit 1
}

try {
    $webService = gcloud run services describe jgazette-web --region=$REGION --format="value(status.url)" 2>$null
    if ($webService) {
        Write-Info "✅ Service Web trouvé: $webService"
    } else {
        Write-Error "❌ Service Web non trouvé"
        exit 1
    }
} catch {
    Write-Error "❌ Erreur lors de la vérification du service Web: $_"
    exit 1
}

# Tester la santé de l'API
Write-Step "3. Test de santé de l'API..."
try {
    $healthResponse = Invoke-RestMethod -Uri "$apiService/health" -Method Get -TimeoutSec 30
    if ($healthResponse.status -eq "ok") {
        Write-Info "✅ API Health Check: OK"
    } else {
        Write-Warn "⚠️ API Health Check: Status inattendu - $($healthResponse.status)"
    }
} catch {
    Write-Error "❌ Erreur lors du test de santé de l'API: $_"
    Write-Info "Vérifiez les logs: gcloud run services logs read jgazette-api --region=$REGION"
}

# Tester la connexion MongoDB
Write-Step "4. Test de connexion MongoDB..."
try {
    $dbResponse = Invoke-RestMethod -Uri "$apiService/api/posts" -Method Get -TimeoutSec 30
    Write-Info "✅ Connexion MongoDB: OK (Posts récupérés: $($dbResponse.length))"
} catch {
    Write-Error "❌ Erreur lors du test MongoDB: $_"
    Write-Info "Vérifiez la configuration MongoDB Atlas et les secrets"
}

# Tester le frontend
Write-Step "5. Test du frontend..."
try {
    $webResponse = Invoke-WebRequest -Uri $webService -Method Get -TimeoutSec 30
    if ($webResponse.StatusCode -eq 200) {
        Write-Info "✅ Frontend: Accessible (Status: $($webResponse.StatusCode))"
    } else {
        Write-Warn "⚠️ Frontend: Status inattendu - $($webResponse.StatusCode)"
    }
} catch {
    Write-Error "❌ Erreur lors du test du frontend: $_"
}

# Vérifier les secrets
Write-Step "6. Vérification des secrets..."
try {
    $secrets = gcloud secrets list --format="value(name)" | Where-Object { $_ -match "jwt-secret|mongodb-atlas-uri" }
    if ($secrets.Count -ge 2) {
        Write-Info "✅ Secrets configurés: $($secrets.Count) trouvés"
    } else {
        Write-Warn "⚠️ Secrets manquants: $($secrets.Count) trouvés sur 2 attendus"
    }
} catch {
    Write-Error "❌ Erreur lors de la vérification des secrets: $_"
}

# Vérifier les images
Write-Step "7. Vérification des images Docker..."
try {
    $images = gcloud artifacts docker images list "${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo" --format="value(name)"
    if ($images.Count -ge 2) {
        Write-Info "✅ Images Docker: $($images.Count) trouvées"
    } else {
        Write-Warn "⚠️ Images Docker manquantes: $($images.Count) trouvées sur 2 attendues"
    }
} catch {
    Write-Error "❌ Erreur lors de la vérification des images: $_"
}

# Résumé
Write-Host ""
Write-Info "📊 Résumé des tests:"
Write-Info "🌐 Frontend: $webService"
Write-Info "🔧 API: $apiService"
Write-Host ""
Write-Info "🔗 Liens utiles:"
Write-Info "   - Console Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
Write-Info "   - Logs API: gcloud run services logs read jgazette-api --region=$REGION"
Write-Info "   - Logs Web: gcloud run services logs read jgazette-web --region=$REGION"
Write-Host ""
Write-Info "🧪 Tests manuels recommandés:"
Write-Info "   1. Ouvrir le frontend dans un navigateur: $webService"
Write-Info "   2. Tester la création d'un compte utilisateur"
Write-Info "   3. Tester la création d'un article"
Write-Info "   4. Tester l'upload d'images"
Write-Info "   5. Tester le système de commentaires"
