// Script d'initialisation MongoDB pour JGazette
// Ce script s'exécute automatiquement lors du premier démarrage du conteneur MongoDB

// Attendre que MongoDB soit prêt
print('Initialisation de la base de données JGazette...');

// Créer la base de données
db = db.getSiblingDB('jgazette');

// Créer un utilisateur pour l'application (optionnel, car nous utilisons l'utilisateur root)
// db.createUser({
//   user: "jgazette_user",
//   pwd: "jgazette_password",
//   roles: [
//     { role: "readWrite", db: "jgazette" }
//   ]
// });

// Créer les collections avec des index optimisés
print('Création des collections...');

// Collection users
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1, "isActive": 1 });
db.users.createIndex({ "banInfo.isBanned": 1, "banInfo.bannedUntil": 1 });

// Collection posts
db.createCollection('posts');
db.posts.createIndex({ "slug": 1 }, { unique: true });
db.posts.createIndex({ "author": 1 });
db.posts.createIndex({ "tags": 1 });
db.posts.createIndex({ "status": 1, "publishedAt": -1 });
db.posts.createIndex({ "createdAt": -1 });

// Collection comments
db.createCollection('comments');
db.comments.createIndex({ "post": 1 });
db.comments.createIndex({ "author": 1 });
db.comments.createIndex({ "parentComment": 1 });
db.comments.createIndex({ "isApproved": 1, "createdAt": -1 });
db.comments.createIndex({ "createdAt": -1 });

// Collection likes
db.createCollection('likes');
db.likes.createIndex({ "user": 1, "post": 1 }, { unique: true });
db.likes.createIndex({ "user": 1, "comment": 1 }, { unique: true });

print('Base de données JGazette initialisée avec succès!');
print('Collections créées: users, posts, comments, likes');
print('Index optimisés créés pour les performances');
