# Déploiement JGazette sur Google Cloud Platform

Ce dossier contient tous les fichiers nécessaires pour déployer l'application JGazette sur Google Cloud Platform.

## 📁 Structure des fichiers

```
gcp/
├── README.md                    # Ce fichier
├── deploy.sh                    # Script de déploiement (Linux/Mac)
├── deploy.ps1                   # Script de déploiement (Windows PowerShell)
├── cloudbuild.yaml              # Configuration Cloud Build
├── cloud-run-api.yaml           # Configuration Cloud Run pour l'API
├── cloud-run-web.yaml           # Configuration Cloud Run pour le Frontend
├── mongodb-atlas-setup.md       # Guide de configuration MongoDB Atlas
└── env.gcp.example              # Exemple de variables d'environnement
```

## 🚀 Déploiement rapide

### Prérequis
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installé
- [Docker](https://docs.docker.com/get-docker/) installé
- Un projet GCP avec facturation activée
- Un compte MongoDB Atlas (recommandé)

### Option 1: Script automatisé (Linux/Mac)
```bash
chmod +x gcp/deploy.sh
./gcp/deploy.sh YOUR_PROJECT_ID
```

### Option 2: Script automatisé (Windows)
```powershell
.\gcp\deploy.ps1 -ProjectId "YOUR_PROJECT_ID"
```

### Option 3: Cloud Build (CI/CD)
```bash
gcloud builds submit --config gcp/cloudbuild.yaml
```

## 🔧 Configuration manuelle

### 1. Activer les APIs
```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com
```

### 2. Créer Artifact Registry
```bash
gcloud artifacts repositories create jgazette-repo \
    --repository-format=docker \
    --location=us-central1
```

### 3. Construire et pousser les images
```bash
# API
docker build -t us-central1-docker.pkg.dev/PROJECT_ID/jgazette-repo/jgazette-api:latest ./api
docker push us-central1-docker.pkg.dev/PROJECT_ID/jgazette-repo/jgazette-api:latest

# Web
docker build -t us-central1-docker.pkg.dev/PROJECT_ID/jgazette-repo/jgazette-web:latest ./web
docker push us-central1-docker.pkg.dev/PROJECT_ID/jgazette-repo/jgazette-web:latest
```

### 4. Créer les secrets
```bash
# JWT Secret
echo -n "your-super-secret-jwt-key" | gcloud secrets create jwt-secret --data-file=-

# MongoDB URI
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/jgazette" | gcloud secrets create mongodb-uri --data-file=-
```

### 5. Déployer les services
```bash
# API
gcloud run deploy jgazette-api \
    --image=us-central1-docker.pkg.dev/PROJECT_ID/jgazette-repo/jgazette-api:latest \
    --platform=managed \
    --region=us-central1 \
    --allow-unauthenticated \
    --set-secrets="JWT_SECRET=jwt-secret:latest,MONGODB_URI=mongodb-uri:latest" \
    --memory=2Gi \
    --cpu=2

# Web
gcloud run deploy jgazette-web \
    --image=us-central1-docker.pkg.dev/PROJECT_ID/jgazette-repo/jgazette-web:latest \
    --platform=managed \
    --region=us-central1 \
    --allow-unauthenticated \
    --memory=1Gi \
    --cpu=1
```

## 🗄️ Base de données

### MongoDB Atlas (Recommandé)
1. Créez un cluster sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Configurez l'accès réseau (0.0.0.0/0 pour Cloud Run)
3. Créez un utilisateur de base de données
4. Obtenez la chaîne de connexion
5. Mettez à jour le secret `mongodb-uri`

### Cloud SQL (Alternative)
⚠️ **Note**: MongoDB n'est pas supporté nativement. Vous devrez adapter le code pour PostgreSQL.

## 🔍 Vérification

### Vérifier les services
```bash
gcloud run services list --region=us-central1
```

### Tester les endpoints
```bash
# Obtenir les URLs
API_URL=$(gcloud run services describe jgazette-api --region=us-central1 --format="value(status.url)")
WEB_URL=$(gcloud run services describe jgazette-web --region=us-central1 --format="value(status.url)")

# Tester
curl $API_URL/health
curl $WEB_URL/health
```

### Vérifier les logs
```bash
gcloud run services logs read jgazette-api --region=us-central1
gcloud run services logs read jgazette-web --region=us-central1
```

## 🚨 Dépannage

### Problèmes courants

1. **Erreur de permissions**
   - Vérifiez que le service account a les bonnes permissions
   - Vérifiez que les APIs sont activées

2. **Images non trouvées**
   - Vérifiez que les images sont poussées dans Artifact Registry
   - Vérifiez le nom du projet et de la région

3. **Erreurs de connexion à la base de données**
   - Vérifiez que le secret `mongodb-uri` est correct
   - Vérifiez que MongoDB Atlas autorise les connexions depuis Cloud Run

4. **Erreurs CORS**
   - Vérifiez que `CORS_ORIGIN` pointe vers l'URL correcte du frontend

### Logs utiles
```bash
# Logs en temps réel
gcloud run services logs tail jgazette-api --region=us-central1

# Logs avec filtres
gcloud run services logs read jgazette-api --region=us-central1 --filter="severity>=ERROR"
```

## 💰 Coûts estimés

- **Cloud Run**: Gratuit jusqu'à 2M requêtes/mois
- **Artifact Registry**: Gratuit jusqu'à 0.5GB
- **Secret Manager**: Gratuit jusqu'à 6 secrets
- **MongoDB Atlas**: Gratuit avec cluster M0

## 📚 Ressources

- [Guide complet de déploiement](../GCP_DEPLOYMENT_GUIDE.md)
- [Configuration MongoDB Atlas](mongodb-atlas-setup.md)
- [Documentation Cloud Run](https://cloud.google.com/run/docs)
- [Documentation Artifact Registry](https://cloud.google.com/artifact-registry/docs)
