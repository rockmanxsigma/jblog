# 🐳 Déploiement Docker - JGazette

Ce guide explique comment déployer JGazette en utilisant Docker et Docker Compose.

## 📋 Prérequis

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Au moins 4GB de RAM disponible
- Au moins 10GB d'espace disque libre

## 🚀 Démarrage rapide

### 1. Cloner le projet
```bash
git clone <repository-url>
cd jgazette
```

### 2. Configuration des variables d'environnement
```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env
```

### 3. Démarrer l'application
```bash
# Rendre le script exécutable
chmod +x start.sh


# Démarrer en mode développement
./start.sh

# Ou démarrer en mode production
./start.sh prod
```

## 🏗️ Architecture Docker

L'application est composée de 4 services principaux :

### 📊 MongoDB (Base de données)
- **Image** : `mongo:6.0`
- **Port** : `27017`
- **Volume** : `mongodb_data` (persistance des données)
- **Initialisation** : Script automatique de création des collections et index

### 🔧 API Backend (Node.js)
- **Image** : Custom build depuis `api/Dockerfile`
- **Port** : `5000`
- **Volume** : `api_uploads` (stockage des fichiers uploadés)
- **Dépendances** : MongoDB

### 🌐 Frontend (Angular + Nginx)
- **Image** : Multi-stage build (Node.js + Nginx)
- **Port** : `80`
- **Proxy** : Redirection automatique vers l'API
- **Dépendances** : API Backend

### 🔒 Nginx Reverse Proxy (Production)
- **Image** : `nginx:alpine`
- **Ports** : `443` (HTTPS), `8080` (HTTP)
- **SSL** : Support des certificats SSL
- **Load Balancing** : Répartition de charge (optionnel)

## ⚙️ Configuration

### Variables d'environnement (.env)

```bash
# Configuration MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password
MONGO_DATABASE=jgazette

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Configuration CORS
CORS_ORIGIN=http://localhost:80

# Configuration Uploads
UPLOAD_PATH=./uploads
```

### Ports exposés

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 80 | Interface utilisateur |
| API | 5000 | API REST |
| MongoDB | 27017 | Base de données |
| Nginx (prod) | 443, 8080 | Reverse proxy |

## 🛠️ Commandes utiles

### Gestion des conteneurs
```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f api

# Redémarrer un service
docker-compose restart api
```

### Maintenance
```bash
# Nettoyer les volumes
docker-compose down -v

# Reconstruire les images
docker-compose build --no-cache

# Mettre à jour les images
docker-compose pull

# Voir l'utilisation des ressources
docker stats
```

### Base de données
```bash
# Accéder à MongoDB
docker-compose exec mongodb mongosh

# Sauvegarder la base de données
docker-compose exec mongodb mongodump --out /backup

# Restaurer la base de données
docker-compose exec mongodb mongorestore /backup
```

## 🔒 Sécurité

### Bonnes pratiques
1. **Changez les mots de passe par défaut** dans le fichier `.env`
2. **Utilisez un JWT_SECRET fort** en production
3. **Limitez l'accès aux ports** MongoDB en production
4. **Utilisez des volumes nommés** pour la persistance
5. **Activez HTTPS** en production avec des certificats SSL

### Variables critiques à changer
- `MONGO_ROOT_PASSWORD`
- `JWT_SECRET`
- `CORS_ORIGIN` (en production)

## 📊 Monitoring

### Health Checks
Chaque service dispose de health checks automatiques :
- **MongoDB** : Ping de la base de données
- **API** : Endpoint `/health`
- **Frontend** : Endpoint `/health`

### Logs
```bash
# Logs en temps réel
docker-compose logs -f

# Logs filtrés par service
docker-compose logs -f api | grep ERROR

# Logs avec timestamps
docker-compose logs -f --timestamps
```

## 🚀 Déploiement en production

### 1. Configuration SSL
```bash
# Créer le dossier SSL
mkdir -p nginx/ssl

# Ajouter vos certificats
cp your-cert.pem nginx/ssl/
cp your-key.pem nginx/ssl/
```

### 2. Variables d'environnement production
```bash
# .env.production
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your-super-secure-production-secret
```

### 3. Démarrage production
```bash
./start.sh prod
```

### 4. Reverse proxy avec Nginx
Le service nginx est automatiquement activé en mode production avec :
- Support SSL/HTTPS
- Compression gzip
- Headers de sécurité
- Cache des assets statiques

## 🔧 Dépannage

### Problèmes courants

#### 1. Ports déjà utilisés
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :80
netstat -tulpn | grep :5000

# Arrêter les services qui utilisent ces ports
sudo systemctl stop apache2  # exemple
```

#### 2. Permissions Docker
```bash
# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer la session
newgrp docker
```

#### 3. Espace disque insuffisant
```bash
# Nettoyer Docker
docker system prune -a
docker volume prune
```

#### 4. Problèmes de connexion MongoDB
```bash
# Vérifier les logs MongoDB
docker-compose logs mongodb

# Redémarrer MongoDB
docker-compose restart mongodb
```

### Logs d'erreur courants

#### Erreur de connexion à l'API
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```
**Solution** : Vérifier que l'API est démarrée et accessible

#### Erreur CORS
```
Access to fetch at 'http://localhost:5000/api/posts' from origin 'http://localhost' has been blocked by CORS policy
```
**Solution** : Vérifier la configuration CORS_ORIGIN dans .env

#### Erreur MongoDB
```
MongoNetworkError: connect ECONNREFUSED mongodb:27017
```
**Solution** : Vérifier que MongoDB est démarré et accessible

## 📈 Performance

### Optimisations recommandées
1. **Utiliser des volumes SSD** pour MongoDB
2. **Augmenter la mémoire** MongoDB si nécessaire
3. **Activer la compression** nginx
4. **Utiliser un CDN** pour les assets statiques
5. **Configurer le cache** Redis pour les sessions (optionnel)

### Monitoring des ressources
```bash
# Voir l'utilisation des ressources
docker stats

# Voir l'utilisation des volumes
docker system df
```

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez les logs : `docker-compose logs -f`
2. Consultez ce guide de dépannage
3. Vérifiez la documentation Docker officielle
4. Ouvrez une issue sur le repository

---

**Note** : Ce guide est spécifique à JGazette. Pour des questions générales sur Docker, consultez la [documentation officielle Docker](https://docs.docker.com/).
