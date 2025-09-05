# 🚀 Guide de Déploiement GCP - jBlog

Ce guide vous accompagne pour déployer votre application jBlog sur Google Cloud Platform avec MongoDB Atlas.

## 📋 Prérequis

### 1. Outils nécessaires
- **Google Cloud CLI** : [Installation](https://cloud.google.com/sdk/docs/install)
- **Docker** : [Installation](https://docs.docker.com/get-docker/)
- **Node.js** (pour les tests locaux)

### 2. Comptes et services
- **Compte Google Cloud Platform** avec facturation activée
- **Projet GCP** créé
- **MongoDB Atlas** configuré (déjà fait ✅)

## 🔧 Configuration Initiale

### 1. Authentification GCP
```bash
# Se connecter à votre compte Google
gcloud auth login

# Configurer le projet par défaut
gcloud config set project YOUR_PROJECT_ID

# Vérifier la configuration
gcloud config list
```

### 2. Configuration MongoDB Atlas
Assurez-vous que votre MongoDB Atlas :
- ✅ Est configuré et accessible
- ✅ Autorise les connexions depuis n'importe où (0.0.0.0/0) pour le déploiement
- ✅ A une URI de connexion valide

## 🚀 Déploiement Automatique

### Option 1 : Script PowerShell (Recommandé pour Windows)
```powershell
# Dans le dossier gcp/
.\deploy-atlas.ps1 "YOUR_PROJECT_ID" "mongodb+srv://user:pass@cluster.mongodb.net/jgazette"
```

### Option 2 : Script Bash (Linux/Mac)
```bash
# Dans le dossier gcp/
chmod +x deploy-atlas.sh
./deploy-atlas.sh "YOUR_PROJECT_ID" "mongodb+srv://user:pass@cluster.mongodb.net/jgazette"
```

### Option 3 : Cloud Build (CI/CD)
```bash
# Déployer avec Cloud Build
gcloud builds submit --config gcp/cloudbuild.yaml \
  --substitutions=_REGION=us-central1,_REPO_NAME=jgazette-repo,_TAG=latest
```

## 📝 Déploiement Manuel (Étape par étape)

### 1. Activation des APIs
```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

### 2. Création du repository Artifact Registry
```bash
gcloud artifacts repositories create jgazette-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Repository Docker pour JGazette"
```

### 3. Configuration Docker
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 4. Création des secrets
```bash
# Secret JWT
echo -n "your-super-secret-jwt-key-change-in-production" | \
gcloud secrets create jwt-secret --data-file=-

# Secret MongoDB Atlas URI
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/jgazette" | \
gcloud secrets create mongodb-atlas-uri --data-file=-
```

### 5. Construction des images
```bash
# Image API
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/jgazette-repo/jgazette-api:latest ./api
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/jgazette-repo/jgazette-api:latest

# Image Web
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/jgazette-repo/jgazette-web:latest ./web
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/jgazette-repo/jgazette-web:latest
```

### 6. Déploiement API
```bash
gcloud run deploy jgazette-api \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/jgazette-repo/jgazette-api:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-secrets="JWT_SECRET=jwt-secret:latest,MONGODB_ATLAS_URI=mongodb-atlas-uri:latest" \
  --set-env-vars="NODE_ENV=production,PORT=5000,UPLOAD_PATH=/tmp/uploads" \
  --memory=2Gi \
  --cpu=2 \
  --max-instances=10 \
  --min-instances=1
```

### 7. Déploiement Frontend
```bash
# Obtenir l'URL de l'API
API_URL=$(gcloud run services describe jgazette-api --region=us-central1 --format="value(status.url)")

# Déployer le frontend
gcloud run deploy jgazette-web \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/jgazette-repo/jgazette-web:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-env-vars="API_URL=${API_URL}" \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --min-instances=1
```

## 🔍 Vérification du Déploiement

### 1. Obtenir les URLs
```bash
# URL de l'API
gcloud run services describe jgazette-api --region=us-central1 --format="value(status.url)"

# URL du Frontend
gcloud run services describe jgazette-web --region=us-central1 --format="value(status.url)"
```

### 2. Tests de santé
```bash
# Test API
curl https://YOUR_API_URL/health

# Test Frontend
curl https://YOUR_WEB_URL
```

### 3. Logs
```bash
# Logs API
gcloud run services logs read jgazette-api --region=us-central1

# Logs Frontend
gcloud run services logs read jgazette-web --region=us-central1
```

## 🔧 Configuration MongoDB Atlas pour GCP

### 1. Network Access
Dans MongoDB Atlas :
1. Allez dans **Network Access**
2. Ajoutez l'IP `0.0.0.0/0` (toutes les IPs) pour le déploiement
3. Ou configurez les IPs spécifiques de GCP

### 2. Database Access
Assurez-vous que votre utilisateur a les permissions :
- `readWrite` sur la base de données `jgazette`
- Ou `dbAdmin` pour plus de permissions

## 🛠️ Gestion Post-Déploiement

### Mise à jour des secrets
```bash
# Mettre à jour le secret JWT
echo -n "new-jwt-secret" | gcloud secrets versions add jwt-secret --data-file=-

# Mettre à jour l'URI MongoDB
echo -n "new-mongodb-uri" | gcloud secrets versions add mongodb-atlas-uri --data-file=-
```

### Redéploiement
```bash
# Redéployer l'API
gcloud run deploy jgazette-api --region=us-central1

# Redéployer le Frontend
gcloud run deploy jgazette-web --region=us-central1
```

### Monitoring
- **Cloud Run Console** : https://console.cloud.google.com/run
- **Secret Manager** : https://console.cloud.google.com/security/secret-manager
- **Artifact Registry** : https://console.cloud.google.com/artifacts

## 🚨 Dépannage

### Erreurs courantes

#### 1. "Permission denied"
```bash
# Vérifier l'authentification
gcloud auth list
gcloud config get-value project
```

#### 2. "Image not found"
```bash
# Vérifier que l'image est poussée
gcloud artifacts docker images list us-central1-docker.pkg.dev/YOUR_PROJECT_ID/jgazette-repo
```

#### 3. "Secret not found"
```bash
# Lister les secrets
gcloud secrets list
```

#### 4. "MongoDB connection failed"
- Vérifiez l'URI MongoDB Atlas
- Vérifiez les permissions Network Access
- Vérifiez les logs de l'API

### Logs détaillés
```bash
# Logs en temps réel
gcloud run services logs tail jgazette-api --region=us-central1

# Logs avec filtres
gcloud run services logs read jgazette-api --region=us-central1 --filter="severity>=ERROR"
```

## 💰 Optimisation des coûts

### 1. Configuration Cloud Run
- **Min instances** : 0 (pour économiser)
- **Max instances** : 5 (au lieu de 10)
- **Memory** : 1Gi pour l'API, 512Mi pour le Web
- **CPU** : 1 pour l'API, 0.5 pour le Web

### 2. Monitoring des coûts
- Surveillez l'utilisation dans la console GCP
- Configurez des alertes de budget
- Utilisez les quotas pour limiter les dépenses

## 🎯 Prochaines étapes

1. **Domaine personnalisé** : Configurez un domaine avec Cloud DNS
2. **SSL/TLS** : Certificats automatiques avec Cloud Run
3. **CDN** : Cloud CDN pour améliorer les performances
4. **Monitoring** : Cloud Monitoring et Alerting
5. **CI/CD** : GitHub Actions ou Cloud Build pour l'automatisation

## 📞 Support

- **Documentation GCP** : https://cloud.google.com/docs
- **Documentation Cloud Run** : https://cloud.google.com/run/docs
- **Documentation MongoDB Atlas** : https://docs.atlas.mongodb.com/

---

🎉 **Félicitations !** Votre application jBlog est maintenant déployée sur Google Cloud Platform avec MongoDB Atlas !