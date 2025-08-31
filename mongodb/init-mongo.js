// Script d'initialisation MongoDB pour JGazette
// Ce script s'exécute automatiquement au premier démarrage du conteneur

// Se connecter à la base de données admin
db = db.getSiblingDB('admin');

// Créer l'utilisateur root si il n'existe pas
if (!db.getUser('admin')) {
  db.createUser({
    user: 'admin',
    pwd: 'password',
    roles: [
      { role: 'userAdminAnyDatabase', db: 'admin' },
      { role: 'readWriteAnyDatabase', db: 'admin' },
      { role: 'dbAdminAnyDatabase', db: 'admin' }
    ]
  });
}

// Se connecter à la base de données de l'application
db = db.getSiblingDB('jgazette');

// Créer les collections avec des index optimisés
db.createCollection('users');
db.createCollection('posts');
db.createCollection('comments');
db.createCollection('likes');

// Index pour la collection users
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "isBanned": 1 });

// Index pour la collection posts
db.posts.createIndex({ "slug": 1 }, { unique: true });
db.posts.createIndex({ "status": 1 });
db.posts.createIndex({ "author": 1 });
db.posts.createIndex({ "tags": 1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "title": "text", "content": "text", "excerpt": "text" });

// Index pour la collection comments
db.comments.createIndex({ "post": 1 });
db.comments.createIndex({ "author": 1 });
db.comments.createIndex({ "parentComment": 1 });
db.comments.createIndex({ "status": 1 });
db.comments.createIndex({ "createdAt": -1 });

// Index pour la collection likes
db.likes.createIndex({ "post": 1, "user": 1 }, { unique: true });
db.likes.createIndex({ "comment": 1, "user": 1 }, { unique: true });
db.likes.createIndex({ "user": 1 });
db.likes.createIndex({ "createdAt": -1 });

print('✅ Base de données JGazette initialisée avec succès');
print('📊 Collections créées: users, posts, comments, likes');
print('🔍 Index optimisés créés pour toutes les collections');
