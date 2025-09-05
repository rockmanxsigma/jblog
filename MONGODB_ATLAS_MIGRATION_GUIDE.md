# 🚀 Guide de Migration MongoDB Local → Atlas

Ce guide vous accompagne dans la migration de votre base de données MongoDB locale vers MongoDB Atlas.

## 📋 Prérequis

- Compte MongoDB Atlas (gratuit disponible)
- MongoDB local en cours d'exécution avec des données
- Node.js et npm installés

## 🔧 Étape 1 : Configuration MongoDB Atlas

### 1.1 Créer un cluster Atlas

1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com)
2. Cliquez sur "New Project" si nécessaire
3. Cliquez sur "Build a Database"
4. Choisissez le plan **M0 Sandbox** (gratuit)
5. Sélectionnez une région proche de vous
6. Donnez un nom à votre cluster (ex: `jblog-cluster`)

### 1.2 Créer un utilisateur de base de données

1. Dans "Database Access", cliquez sur "Add New Database User"
2. Choisissez "Password" comme méthode d'authentification
3. Créez un nom d'utilisateur et un mot de passe sécurisé
4. Donnez les permissions "Read and write to any database"
5. Cliquez sur "Add User"

### 1.3 Configurer l'accès réseau

1. Dans "Network Access", cliquez sur "Add IP Address"
2. Pour le développement, vous pouvez utiliser `0.0.0.0/0` (toutes les IPs)
3. Pour la production, ajoutez votre IP spécifique
4. Cliquez sur "Confirm"

### 1.4 Obtenir la chaîne de connexion

1. Dans "Database", cliquez sur "Connect"
2. Choisissez "Connect your application"
3. Sélectionnez "Node.js" et la version la plus récente
4. Copiez la chaîne de connexion

## 🔧 Étape 2 : Configuration du projet

### 2.1 Créer le fichier .env

Copiez `env.atlas.example` vers `.env` et configurez :

```bash
cp env.atlas.example .env
```

Éditez `.env` et remplacez :

```env
MONGODB_ATLAS_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

**Exemple :**
```env
MONGODB_ATLAS_URI=mongodb+srv://jbloguser:monmotdepasse@jblog-cluster.abc123.mongodb.net/jgazette?retryWrites=true&w=majority
```

### 2.2 Installer les dépendances nécessaires

```bash
cd api
npm install dotenv
```

## 🔧 Étape 3 : Export des données locales

### 3.1 Vérifier que MongoDB local fonctionne

```bash
# Vérifier que MongoDB local est en cours d'exécution
mongosh --eval "db.adminCommand('ismaster')"
```

### 3.2 Exporter les données

**Option A : Avec MongoDB Database Tools (nécessite l'installation)**
```bash
cd api
npm run export-data
```

**Option B : Avec Node.js (recommandé, ne nécessite pas d'installation supplémentaire)**
```bash
cd api
npm run export-data-nodejs
```

Ces scripts vont :
- Créer un dossier `mongodb-export/`
- Exporter toutes vos collections
- Créer un timestamp pour l'export
- Générer des fichiers JSON avec métadonnées

## 🔧 Étape 4 : Import vers Atlas

### 4.1 Tester la connexion Atlas

```bash
cd api
node scripts/test-atlas-connection.js
```

### 4.2 Importer les données

**Option A : Avec MongoDB Database Tools**
```bash
cd api
npm run import-atlas
```

**Option B : Avec Node.js (recommandé)**
```bash
cd api
npm run import-atlas-nodejs
```

Ces scripts vont :
- Trouver le dernier export
- Demander confirmation
- Importer toutes les données vers Atlas
- Générer un rapport d'import

## 🔧 Étape 5 : Test et validation

### 5.1 Redémarrer l'application

```bash
cd api
npm start
```

Vérifiez dans les logs que vous voyez :
```
✅ MongoDB connecté: [cluster-name].mongodb.net
📊 Base de données: jgazette
Type de connexion: Atlas (Cloud)
```

### 5.2 Tester les fonctionnalités

1. **Connexion utilisateur** : Testez la connexion/déconnexion
2. **Articles** : Créez, modifiez, supprimez des articles
3. **Commentaires** : Ajoutez des commentaires
4. **Upload d'images** : Testez l'upload d'images

## 🔧 Étape 6 : Configuration de production

### 6.1 Variables d'environnement de production

Pour la production, utilisez uniquement :

```env
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
NODE_ENV=production
```

### 6.2 Sécurité

- Supprimez `MONGODB_URI` (connexion locale) en production
- Utilisez des IPs spécifiques dans Network Access
- Activez l'authentification à 2 facteurs sur Atlas
- Utilisez des mots de passe forts

## 🚨 Dépannage

### Problème : 'mongodump' n'est pas reconnu

**Erreur :** `'mongodump' n'est pas reconnu en tant que commande interne`

**Solution :** Utilisez les scripts Node.js à la place :

```bash
# Au lieu de :
npm run export-data

# Utilisez :
npm run export-data-nodejs

# Au lieu de :
npm run import-atlas

# Utilisez :
npm run import-atlas-nodejs
```

**Alternative :** Installer MongoDB Database Tools
- Téléchargez depuis https://www.mongodb.com/try/download/database-tools
- Ajoutez au PATH Windows

### Problème de connexion

```bash
# Tester la connexion
npm run test-atlas
```

**Erreurs courantes :**

1. **Authentication failed** : Vérifiez username/password
2. **Network timeout** : Vérifiez Network Access dans Atlas
3. **SSL/TLS** : Assurez-vous que l'URI contient `mongodb+srv://`

### Problème d'import

```bash
# Vérifier les exports disponibles
ls -la mongodb-export/
```

### Rollback vers local

Si vous devez revenir en local temporairement :

```env
# Commenter Atlas, utiliser local
# MONGODB_ATLAS_URI=...
MONGODB_URI=mongodb://localhost:27017/jgazette
```

## 📊 Avantages d'Atlas

- ✅ **Scalabilité** : Montée en charge automatique
- ✅ **Sauvegarde** : Backups automatiques
- ✅ **Monitoring** : Métriques en temps réel
- ✅ **Sécurité** : Chiffrement et authentification
- ✅ **Disponibilité** : 99.95% de uptime
- ✅ **Support** : Documentation et communauté

## 🎯 Prochaines étapes

1. **Monitoring** : Configurez les alertes dans Atlas
2. **Backups** : Configurez les sauvegardes automatiques
3. **Performance** : Surveillez les métriques
4. **Scaling** : Planifiez la montée en charge

---

**🎉 Félicitations !** Votre migration vers MongoDB Atlas est terminée !
