# JGazette - Images Docker

Ce repository contient les images Docker pour l'application JGazette, un blog moderne avec API REST et interface web.

## 🐳 Images disponibles

### Base de données MongoDB
- **Image**: `rockmanxsigma/jblog:mongodb-latest`
- **Version**: `rockmanxsigma/jblog:mongodb-v1.0`
- **Description**: MongoDB 6.0 avec configuration optimisée et index pour JGazette
- **Port**: 27017

### API Backend
- **Image**: `rockmanxsigma/jblog:api-latest`
- **Version**: `rockmanxsigma/jblog:api-v1.0`
- **Description**: API REST construite avec Node.js, Express et MongoDB
- **Port**: 5000

### Frontend Web
- **Image**: `rockmanxsigma/jblog:web-latest`
- **Version**: `rockmanxsigma/jblog:web-v1.0`
- **Description**: Interface web Angular avec Nginx
- **Port**: 80

## 🚀 Démarrage rapide

### Option 1: Docker Compose (Recommandé)

```bash
# Cloner le repository
git clone <repository-url>
cd jgazette

# Créer le fichier .env
cp env.example .env
# Modifier les variables selon vos besoins

# Démarrer l'application
docker compose up -d
```

L'application sera accessible sur `http://localhost:80`

### Option 2: Images individuelles

```bash
# Base de données MongoDB
docker run -d --name jgazette-mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -p 27017:27017 \
  rockmanxsigma/jblog:mongodb-latest

# API Backend
docker run -d --name jgazette-api \
  --link jgazette-mongodb:mongodb \
  -e MONGODB_URI=mongodb://admin:password@mongodb:27017/jgazette?authSource=admin \
  -e JWT_SECRET=your-secret-key \
  -p 5000:5000 \
  rockmanxsigma/jblog:api-latest

# Frontend Web
docker run -d --name jgazette-web \
  --link jgazette-api:api \
  -p 80:80 \
  rockmanxsigma/jblog:web-latest
```

## 📋 Variables d'environnement

### API Backend
- `MONGODB_URI`: URI de connexion MongoDB
- `JWT_SECRET`: Clé secrète pour les tokens JWT
- `JWT_EXPIRES_IN`: Durée de validité des tokens (défaut: 7d)
- `CORS_ORIGIN`: Origines autorisées pour CORS
- `UPLOAD_PATH`: Chemin pour les uploads (défaut: ./uploads)

### Base de données
- `MONGO_ROOT_USERNAME`: Nom d'utilisateur root MongoDB
- `MONGO_ROOT_PASSWORD`: Mot de passe root MongoDB
- `MONGO_DATABASE`: Nom de la base de données

## 🔧 Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Redémarrer un service
docker compose restart api

# Arrêter l'application
docker compose down

# Reconstruire les images
docker compose build --no-cache

# Accéder au shell d'un conteneur
docker compose exec api sh
```

## 📊 Monitoring

L'application inclut des endpoints de santé :
- API: `http://localhost:5000/health`
- Frontend: `http://localhost:80/health`

## 🛠️ Développement

Pour le développement local :

```bash
# Mode développement avec rechargement automatique
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Exécuter les tests
docker compose exec api npm test
```

## 📝 Notes importantes

- Les images sont optimisées pour la production
- Le frontend utilise Nginx comme serveur web
- L'API inclut la gestion des erreurs et la validation
- La base de données est persistante via des volumes Docker
- Les uploads sont stockés dans un volume partagé

## 🔗 Liens utiles

- [Documentation API](api/README.md)
- [Documentation Frontend](web/README.md)
- [Guide Docker complet](DOCKER_README.md)

## 📞 Support

Pour toute question ou problème, consultez la documentation ou créez une issue sur le repository.
