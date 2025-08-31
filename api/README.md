# JGazette API

API REST pour le blog JGazette construite avec Node.js, Express et MongoDB.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
# Puis modifier les variables selon votre configuration
```

## 📋 Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/jgazette

# Configuration CORS
FRONTEND_URL=http://localhost:4200
```

## 🏃‍♂️ Démarrage

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

## 📚 Endpoints API

### Articles

#### GET `/api/posts`
Récupère tous les articles publiés avec pagination et filtres.

**Paramètres de requête :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'articles par page (défaut: 10)
- `tag` (optionnel) : Filtrer par tag
- `search` (optionnel) : Recherche dans le titre et contenu

**Exemple :**
```bash
GET /api/posts?page=1&limit=5&tag=javascript
```

#### GET `/api/posts/slug/:slug`
Récupère un article par son slug.

**Exemple :**
```bash
GET /api/posts/slug/mon-article-de-blog
```

#### GET `/api/posts/tag/:tag`
Récupère tous les articles d'un tag spécifique.

**Exemple :**
```bash
GET /api/posts/tag/javascript?page=1&limit=10
```

#### POST `/api/posts`
Crée un nouvel article.

**Body :**
```json
{
  "title": "Titre de l'article",
  "content": "Contenu de l'article...",
  "excerpt": "Extrait de l'article...",
  "slug": "titre-de-larticle",
  "author": "Nom de l'auteur",
  "tags": ["javascript", "nodejs"],
  "status": "draft",
  "featuredImage": "https://example.com/image.jpg"
}
```

#### PUT `/api/posts/:id`
Met à jour un article existant.

#### DELETE `/api/posts/:id`
Supprime un article.

## 🏗️ Architecture

L'API suit une architecture MVC :

- **Models** (`src/models/`) : Schémas Mongoose et modèles de données
- **Controllers** (`src/controllers/`) : Logique métier et validation des données
- **Routes** (`src/routes/`) : Définition des endpoints
- **Middleware** (`src/middleware/`) : Gestion d'erreurs et middlewares personnalisés
- **Config** (`src/config/`) : Configuration de la base de données et variables d'environnement

## 📦 Dépendances principales

- **Express** : Framework web
- **Mongoose** : ODM pour MongoDB
- **CORS** : Middleware pour les requêtes cross-origin
- **Helmet** : Sécurité des headers HTTP
- **Morgan** : Logging des requêtes
- **Dotenv** : Gestion des variables d'environnement

## 🔧 Scripts disponibles

- `npm start` : Démarre le serveur en mode production
- `npm run dev` : Démarre le serveur en mode développement avec nodemon

