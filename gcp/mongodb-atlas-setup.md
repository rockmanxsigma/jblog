# Configuration MongoDB Atlas pour JGazette

## 🚀 Étapes pour configurer MongoDB Atlas

### 1. Créer un cluster MongoDB Atlas

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créez un compte gratuit
3. Créez un nouveau cluster (choisissez M0 Sandbox pour le gratuit)
4. Sélectionnez une région proche de votre déploiement GCP

### 2. Configurer l'accès réseau

1. Dans "Network Access", ajoutez l'IP `0.0.0.0/0` pour permettre l'accès depuis Cloud Run
2. Ou ajoutez spécifiquement les IPs de Google Cloud Run

### 3. Créer un utilisateur de base de données

1. Dans "Database Access", créez un nouvel utilisateur
2. Nom d'utilisateur: `jgazette-user`
3. Mot de passe: générez un mot de passe sécurisé
4. Rôles: `Read and write to any database`

### 4. Obtenir la chaîne de connexion

1. Dans "Database", cliquez sur "Connect"
2. Choisissez "Connect your application"
3. Copiez la chaîne de connexion
4. Remplacez `<password>` par le mot de passe de l'utilisateur
5. Remplacez `<dbname>` par `jgazette`

### 5. Mettre à jour les secrets GCP

```bash
# Remplacer par votre vraie chaîne de connexion MongoDB Atlas
MONGODB_URI="mongodb+srv://jgazette-user:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/jgazette?retryWrites=true&w=majority"

# Mettre à jour le secret
echo -n "$MONGODB_URI" | gcloud secrets versions add mongodb-uri --data-file=-
```

### 6. Avantages de MongoDB Atlas

- ✅ Support natif de MongoDB
- ✅ Sauvegarde automatique
- ✅ Monitoring intégré
- ✅ Scaling automatique
- ✅ Sécurité avancée
- ✅ Connexion SSL/TLS par défaut

### 7. Configuration pour la production

```yaml
# Dans cloud-run-api.yaml
env:
- name: MONGODB_URI
  valueFrom:
    secretKeyRef:
      name: jgazette-secrets
      key: mongodb-uri
- name: MONGODB_SSL
  value: "true"
- name: MONGODB_SSL_VALIDATE
  value: "true"
```

### 8. Script de migration des données

Si vous avez des données existantes, vous pouvez les migrer avec :

```bash
# Exporter depuis votre base locale
mongodump --uri="mongodb://localhost:27017/jgazette" --out=./backup

# Importer vers MongoDB Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/jgazette" ./backup/jgazette
```

### 9. Monitoring et alertes

Configurez des alertes dans MongoDB Atlas pour :
- Utilisation CPU/Mémoire
- Connexions actives
- Taille de la base de données
- Erreurs de requêtes

### 10. Sauvegarde

MongoDB Atlas inclut :
- Sauvegarde continue
- Point-in-time recovery
- Rétention configurable
- Restauration automatique
