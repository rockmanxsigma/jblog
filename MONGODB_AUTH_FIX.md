# 🔧 Résolution du Problème d'Authentification MongoDB

## 🚨 Problème Identifié

L'erreur `command aggregate requires authentication` indique que votre MongoDB local nécessite une authentification, mais votre URI de connexion ne contient pas d'identifiants.

## 🔍 Diagnostic

### Étape 1 : Diagnostiquer la connexion

```bash
cd api
npm run diagnose-mongodb
```

Ce script va :
- Tester différentes configurations de connexion
- Identifier celle qui fonctionne
- Vous donner la configuration exacte à utiliser

### Étape 2 : Configurer le fichier .env

Créez le fichier `api/.env` avec la configuration recommandée par le script de diagnostic.

**Exemples de configurations courantes :**

```env
# Si MongoDB utilise l'authentification admin
MONGODB_URI=mongodb://admin:password@localhost:27017/jgazette?authSource=admin

# Si MongoDB utilise l'authentification root
MONGODB_URI=mongodb://root:password@localhost:27017/jgazette?authSource=admin

# Si MongoDB utilise un utilisateur spécifique
MONGODB_URI=mongodb://jgazette:password@localhost:27017/jgazette?authSource=jgazette

# Si MongoDB n'utilise pas d'authentification
MONGODB_URI=mongodb://localhost:27017/jgazette
```

## 🚀 Solutions Rapides

### Solution 1 : Utiliser les identifiants par défaut

Si vous utilisez Docker ou une installation par défaut :

```env
MONGODB_URI=mongodb://admin:password@localhost:27017/jgazette?authSource=admin
```

### Solution 2 : Créer un utilisateur MongoDB

Si vous n'avez pas d'identifiants :

1. **Connectez-vous à MongoDB** :
   ```bash
   mongosh
   ```

2. **Créez un utilisateur** :
   ```javascript
   use admin
   db.createUser({
     user: "jgazette",
     pwd: "password",
     roles: [
       { role: "readWrite", db: "jgazette" }
     ]
   })
   ```

3. **Utilisez cette configuration** :
   ```env
   MONGODB_URI=mongodb://jgazette:password@localhost:27017/jgazette?authSource=admin
   ```

### Solution 3 : Désactiver l'authentification (développement uniquement)

Si vous voulez désactiver l'authentification temporairement :

1. **Modifiez le fichier de configuration MongoDB** (généralement `mongod.conf`)
2. **Commentez la section security** :
   ```yaml
   # security:
   #   authorization: enabled
   ```
3. **Redémarrez MongoDB**
4. **Utilisez cette configuration** :
   ```env
   MONGODB_URI=mongodb://localhost:27017/jgazette
   ```

## ✅ Vérification

Après avoir configuré le fichier `.env` :

```bash
# Vérifier la connexion
npm run check-data

# Si ça fonctionne, exporter les données
npm run export-data-nodejs
```

## 🎯 Migration vers Atlas

Une fois que l'export fonctionne :

1. **Configurez Atlas** dans `.env` :
   ```env
   MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/jgazette
   ```

2. **Testez Atlas** :
   ```bash
   npm run test-atlas
   ```

3. **Importez vers Atlas** :
   ```bash
   npm run import-atlas-nodejs
   ```

## 🆘 En cas de Problème

- **Vérifiez que MongoDB est démarré** : `net start MongoDB` (Windows)
- **Vérifiez les logs MongoDB** pour les erreurs d'authentification
- **Testez la connexion manuelle** : `mongosh "mongodb://username:password@localhost:27017/jgazette"`
- **Vérifiez le fichier de configuration MongoDB** (`mongod.conf`)

---

**💡 Conseil** : Le script `diagnose-mongodb.js` vous donnera la configuration exacte qui fonctionne avec votre installation MongoDB !
