# Guide de déploiement JGazette sur Google Cloud Platform

## 🚀 Vue d'ensemble

Ce guide vous accompagne dans le déploiement de l'application JGazette sur Google Cloud Platform en utilisant :
- **Cloud Run** pour les services (API et Frontend)
- **Artifact Registry** pour les images Docker
- **Secret Manager** pour les secrets
- **MongoDB Atlas** (recommandé) ou **Cloud SQL** pour la base de données

## 📋 Prérequis

### 1. Outils nécessaires
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installé et configuré
- [Docker](https://docs.docker.com/get-docker/) installé
- Un compte Google Cloud Platform avec facturation activée
- Un projet GCP créé

### 2. Vérification de l'installation
```bash
# Vérifier gcloud
gcloud version

# Vérifier Docker
docker --version

# Vérifier la configuration gcloud
gcloud config list
```

## 🛠️ Déploiement automatique

### Option 1: Script automatisé (Recommandé)

1. **Cloner le repository et naviguer vers le dossier**
```bash
git clone <votre-repo>
cd jgazette
```

2. **Rendre le script exécutable**
```bash
chmod +x gcp/deploy.sh
```

3. **Exécuter le script de déploiement**
```bash
./gcp/deploy.sh YOUR_PROJECT_ID
```

Le script va automatiquement :
- ✅ Activer les APIs nécessaires
- ✅ Créer les services accounts
- ✅ Configurer Artifact Registry
- ✅ Construire et pousser les images Docker
- ✅ Créer les secrets
- ✅ Déployer les services Cloud Run
- ✅ Configurer la base de données

## 🔧 Déploiement manuel

### 1. Configuration initiale

```bash
# Définir le projet
export PROJECT_ID="your-project-id"
export REGION="us-central1"

# Configurer gcloud
gcloud config set project $PROJECT_ID
```

### 2. Activer les APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com
```

### 3. Créer Artifact Registry

```bash
gcloud artifacts repositories create jgazette-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="Repository Docker pour JGazette"
```

### 4. Configurer Docker

```bash
gcloud auth configure-docker ${REGION}-docker.pkg.dev
```

### 5. Construire et pousser les images

```bash
# Image API
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest ./api
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest

# Image Web
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest ./web
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest
```

### 6. Créer les secrets

```bash
# Secret JWT
echo -n "your-super-secret-jwt-key" | gcloud secrets create jwt-secret --data-file=-

# Secret MongoDB (remplacer par votre URI)
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/jgazette" | gcloud secrets create mongodb-uri --data-file=-
```

### 7. Déployer les services

```bash
# Déployer l'API
gcloud run deploy jgazette-api \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-api:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --set-secrets="JWT_SECRET=jwt-secret:latest,MONGODB_URI=mongodb-uri:latest" \
    --memory=2Gi \
    --cpu=2

# Déployer le Frontend
gcloud run deploy jgazette-web \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo/jgazette-web:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --memory=1Gi \
    --cpu=1
```

## 🗄️ Configuration de la base de données

### Option A: MongoDB Atlas (Recommandé)

1. **Créer un cluster MongoDB Atlas**
   - Allez sur [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Créez un cluster gratuit (M0 Sandbox)
   - Configurez l'accès réseau (0.0.0.0/0 pour Cloud Run)
   - Créez un utilisateur de base de données

2. **Obtenir la chaîne de connexion**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/jgazette
   ```

3. **Mettre à jour le secret**
   ```bash
   echo -n "mongodb+srv://username:password@cluster.mongodb.net/jgazette" | \
   gcloud secrets versions add mongodb-uri --data-file=-
   ```

### Option B: Cloud SQL (PostgreSQL)

⚠️ **Note**: MongoDB n'est pas supporté nativement par Cloud SQL. Vous devrez adapter le code pour PostgreSQL.

```bash
# Créer une instance Cloud SQL
gcloud sql instances create jgazette-db \
    --database-version=POSTGRES_13 \
    --tier=db-f1-micro \
    --region=$REGION

# Créer la base de données
gcloud sql databases create jgazette --instance=jgazette-db

# Créer un utilisateur
gcloud sql users create jgazette-user \
    --instance=jgazette-db \
    --password=jgazette-password
```

## 🔍 Vérification du déploiement

### 1. Vérifier les services Cloud Run

```bash
# Lister les services
gcloud run services list --region=$REGION

# Obtenir les URLs
gcloud run services describe jgazette-api --region=$REGION --format="value(status.url)"
gcloud run services describe jgazette-web --region=$REGION --format="value(status.url)"
```

### 2. Tester les endpoints

```bash
# Tester l'API
curl https://jgazette-api-XXXXX-uc.a.run.app/health

# Tester le Frontend
curl https://jgazette-web-XXXXX-uc.a.run.app/health
```

### 3. Vérifier les logs

```bash
# Logs de l'API
gcloud run services logs read jgazette-api --region=$REGION

# Logs du Frontend
gcloud run services logs read jgazette-web --region=$REGION
```

## 🔧 Configuration avancée

### 1. Domaines personnalisés

```bash
# Mapper un domaine personnalisé
gcloud run domain-mappings create \
    --service=jgazette-web \
    --domain=your-domain.com \
    --region=$REGION
```

### 2. SSL/TLS

Les domaines personnalisés obtiennent automatiquement un certificat SSL via Google-managed certificates.

### 3. Monitoring et alertes

```bash
# Activer Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Créer des alertes pour les erreurs 5xx
gcloud alpha monitoring policies create --policy-from-file=monitoring-policy.yaml
```

### 4. Scaling automatique

Les services Cloud Run s'adaptent automatiquement à la charge, mais vous pouvez configurer :

```bash
# Mettre à jour les limites de scaling
gcloud run services update jgazette-api \
    --region=$REGION \
    --max-instances=50 \
    --min-instances=2 \
    --concurrency=100
```

## 💰 Estimation des coûts

### Cloud Run
- **Gratuit**: 2 millions de requêtes/mois
- **Payant**: $0.40 par million de requêtes supplémentaires
- **CPU/Mémoire**: Facturé par utilisation

### Artifact Registry
- **Gratuit**: 0.5 GB de stockage
- **Payant**: $0.10/GB/mois

### MongoDB Atlas
- **Gratuit**: Cluster M0 (512 MB RAM)
- **Payant**: À partir de $9/mois pour M2

### Secret Manager
- **Gratuit**: 6 secrets
- **Payant**: $0.06/secret/mois

## 🚨 Dépannage

### Problèmes courants

1. **Erreur de permissions**
   ```bash
   # Vérifier les permissions du service account
   gcloud projects get-iam-policy $PROJECT_ID
   ```

2. **Images non trouvées**
   ```bash
   # Vérifier que les images sont poussées
   gcloud artifacts docker images list ${REGION}-docker.pkg.dev/${PROJECT_ID}/jgazette-repo
   ```

3. **Erreurs de connexion à la base de données**
   ```bash
   # Vérifier les secrets
   gcloud secrets versions list mongodb-uri
   ```

4. **Erreurs CORS**
   - Vérifier que CORS_ORIGIN pointe vers l'URL correcte du frontend
   - Mettre à jour le secret si nécessaire

### Logs utiles

```bash
# Logs en temps réel
gcloud run services logs tail jgazette-api --region=$REGION

# Logs avec filtres
gcloud run services logs read jgazette-api --region=$REGION --filter="severity>=ERROR"
```

## 📚 Ressources supplémentaires

- [Documentation Cloud Run](https://cloud.google.com/run/docs)
- [Documentation Artifact Registry](https://cloud.google.com/artifact-registry/docs)
- [Documentation Secret Manager](https://cloud.google.com/secret-manager/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

## 🆘 Support

En cas de problème :
1. Vérifiez les logs Cloud Run
2. Consultez la documentation GCP
3. Vérifiez les quotas et limites de votre projet
4. Contactez le support Google Cloud si nécessaire
