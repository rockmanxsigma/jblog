#!/usr/bin/env python3
"""
Script de seed pour la base de données JGazette
Crée des utilisateurs et posts de test avec des ObjectIds valides
"""

import os
import sys
from datetime import datetime, timezone
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration MongoDB
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/jgazette')
DB_NAME = 'jgazette'

# Données de test pour les utilisateurs
sample_users = [
    {
        "username": "jean.dupont",
        "email": "jean.dupont@example.com",
        "password": "password123",
        "role": "editor",
        "profile": {
            "firstName": "Jean",
            "lastName": "Dupont"
        }
    },
    {
        "username": "marie.martin",
        "email": "marie.martin@example.com",
        "password": "password123",
        "role": "editor",
        "profile": {
            "firstName": "Marie",
            "lastName": "Martin"
        }
    },
    {
        "username": "pierre.durand",
        "email": "pierre.durand@example.com",
        "password": "password123",
        "role": "editor",
        "profile": {
            "firstName": "Pierre",
            "lastName": "Durand"
        }
    },
    {
        "username": "sophie.bernard",
        "email": "sophie.bernard@example.com",
        "password": "password123",
        "role": "editor",
        "profile": {
            "firstName": "Sophie",
            "lastName": "Bernard"
        }
    },
    {
        "username": "lucas.moreau",
        "email": "lucas.moreau@example.com",
        "password": "password123",
        "role": "editor",
        "profile": {
            "firstName": "Lucas",
            "lastName": "Moreau"
        }
    }
]

# Données de test pour les posts (sans author pour l'instant)
sample_posts_data = [
    {
        "title": "Introduction à Node.js et Express",
        "content": """# Introduction à Node.js et Express

Node.js est un runtime JavaScript basé sur le moteur V8 de Chrome qui permet d'exécuter du code JavaScript côté serveur. Express.js est un framework web minimaliste et flexible pour Node.js qui simplifie la création d'APIs REST.

## Pourquoi Node.js ?

Node.js offre plusieurs avantages :
- Performance : Architecture événementielle non-bloquante
- JavaScript : Même langage côté client et serveur
- Écosystème riche : npm avec des milliers de packages
- Scalabilité : Facilement extensible

## Créer une API avec Express

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});
```

## Middleware et Routes

Express utilise le concept de middleware pour traiter les requêtes. Chaque middleware peut modifier la requête ou la réponse avant de passer au suivant.

## Gestion des erreurs

Il est important de gérer les erreurs de manière appropriée dans une API Express.

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});
```

## Conclusion

Node.js et Express forment une combinaison puissante pour créer des APIs modernes et performantes. Avec une architecture bien pensée et une gestion d'erreurs appropriée, vous pouvez construire des applications robustes et évolutives.""",
        "excerpt": "Découvrez comment créer des APIs REST modernes avec Node.js et Express.js. Apprenez les concepts fondamentaux, la gestion des middleware et les bonnes pratiques.",
        "slug": "introduction-nodejs-express",
        "tags": ["nodejs", "express", "api", "javascript"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop"
    },
    {
        "title": "MongoDB : Guide complet pour débutants",
        "content": """# MongoDB : Guide complet pour débutants

MongoDB est une base de données NoSQL orientée documents qui stocke les données au format JSON (BSON). Contrairement aux bases de données relationnelles, MongoDB n'utilise pas de schéma fixe, ce qui offre une grande flexibilité.

## Concepts fondamentaux

### Collections et Documents

- Collection : Équivalent à une table dans une base relationnelle
- Document : Équivalent à une ligne, stocké au format BSON
- Champ : Équivalent à une colonne

### Exemple de document

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "title": "Mon article",
  "author": "Jean Dupont",
  "content": "Contenu de l'article...",
  "tags": ["mongodb", "nosql"],
  "createdAt": ISODate("2023-01-01T00:00:00Z")
}
```

## Opérations CRUD

### Créer (Create)

```javascript
// Insérer un document
db.collection('posts').insertOne({
  title: "Nouvel article",
  content: "Contenu..."
});
```

### Lire (Read)

```javascript
// Trouver tous les documents
db.collection('posts').find();

// Trouver avec filtres
db.collection('posts').find({ author: "Jean Dupont" });
```

### Mettre à jour (Update)

```javascript
// Mettre à jour un document
db.collection('posts').updateOne(
  { _id: ObjectId("...") },
  { $set: { title: "Nouveau titre" } }
);
```

### Supprimer (Delete)

```javascript
// Supprimer un document
db.collection('posts').deleteOne({ _id: ObjectId("...") });
```

## Avantages de MongoDB

1. Flexibilité : Schéma dynamique
2. Scalabilité : Sharding horizontal
3. Performance : Requêtes rapides avec index
4. JSON natif : Intégration facile avec JavaScript
5. Écosystème riche : Drivers pour tous les langages

## Conclusion

MongoDB est un excellent choix pour les applications modernes qui nécessitent flexibilité et performance. Sa nature documentaire et son intégration native avec JavaScript en font un choix populaire pour le développement web.""",
        "excerpt": "Apprenez les bases de MongoDB, la base de données NoSQL la plus populaire. Découvrez les opérations CRUD, l'agrégation et les bonnes pratiques.",
        "slug": "mongodb-guide-complet-debutants",
        "tags": ["mongodb", "nosql", "base-de-donnees", "javascript"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop"
    },
    {
        "title": "Angular 17 : Les nouvelles fonctionnalités",
        "content": """# Angular 17 : Les nouvelles fonctionnalités

Angular 17 apporte de nombreuses améliorations et nouvelles fonctionnalités qui simplifient le développement d'applications web modernes. Découvrons les principales nouveautés.

## Control Flow Syntax

Angular 17 introduit une nouvelle syntaxe de contrôle de flux plus performante et plus lisible.

### Ancienne syntaxe

```html
<div *ngIf="user">
  <h2>Bienvenue {{ user.name }}</h2>
</div>
<div *ngIf="!user">
  <p>Veuillez vous connecter</p>
</div>
```

### Nouvelle syntaxe

```html
@if (user) {
  <h2>Bienvenue {{ user.name }}</h2>
} @else {
  <p>Veuillez vous connecter</p>
}
```

### Boucles avec @for

```html
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <p>Aucun élément trouvé</p>
}
```

## Deferred Loading

Le chargement différé permet d'améliorer les performances en chargeant les composants à la demande.

```html
@defer (on viewport) {
  <heavy-component />
} @placeholder {
  <loading-spinner />
} @error {
  <error-message />
}
```

## Standalone Components

Les composants autonomes simplifient la structure des applications Angular.

```typescript
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '<div class="user-card"><h3>{{ user.name }}</h3><p>{{ user.email }}</p></div>'
})
export class UserCardComponent {
  @Input() user!: User;
}
```

## Performance Improvements

### Build Performance

- Compilation plus rapide avec le nouveau compilateur
- Optimisations automatiques du bundle
- Support amélioré des Web Workers

### Runtime Performance

- Détection de changements plus efficace
- Hydration SSR améliorée
- Optimisations du Virtual DOM

## Server-Side Rendering (SSR)

Angular 17 améliore le support du rendu côté serveur.

```bash
# Créer une application avec SSR
ng new my-app --ssr

# Ou ajouter SSR à une application existante
ng add @angular/ssr
```

## Developer Experience

### DevTools améliorées

- Angular DevTools avec plus de fonctionnalités
- Debugging amélioré
- Profiling des performances

### CLI Updates

```bash
# Nouvelle commande pour créer des composants
ng generate component user-card --standalone

# Support des templates inline
ng generate component user-card --inline-template
```

## Migration Guide

Pour migrer vers Angular 17 :

1. Mettre à jour Angular CLI
   ```bash
   npm install -g @angular/cli@latest
   ```

2. Mettre à jour les dépendances
   ```bash
   ng update @angular/core @angular/cli
   ```

3. Migrer vers la nouvelle syntaxe de contrôle
   ```bash
   ng generate @angular/core:control-flow
   ```

## Conclusion

Angular 17 apporte des améliorations significatives en termes de performance, de DX et de fonctionnalités. La nouvelle syntaxe de contrôle de flux et le support amélioré du SSR en font une version majeure à ne pas manquer.""",
        "excerpt": "Découvrez les nouvelles fonctionnalités d'Angular 17 : Control Flow Syntax, Deferred Loading, Standalone Components et améliorations des performances.",
        "slug": "angular-17-nouvelles-fonctionnalites",
        "tags": ["angular", "typescript", "frontend", "javascript"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1555066932-4f5d840a2c83?w=800&h=400&fit=crop"
    },
    {
        "title": "Architecture MEAN Stack : Bonnes pratiques",
        "content": """# Architecture MEAN Stack : Bonnes pratiques

Le stack MEAN (MongoDB, Express.js, Angular, Node.js) est une solution complète pour développer des applications web modernes. Voici les bonnes pratiques pour une architecture robuste.

## Structure du projet

### Organisation des dossiers

```
project/
├── api/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Contrôleurs
│   │   ├── models/      # Modèles Mongoose
│   │   ├── routes/      # Routes API
│   │   ├── middleware/  # Middlewares personnalisés
│   │   └── server.js    # Point d'entrée
│   └── package.json
├── web/                 # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── styles/
│   └── package.json
└── README.md
```

## Backend (Node.js/Express)

### Configuration de la base de données

```javascript
// config/database.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connecté');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
```

### Modèles Mongoose

```javascript
// models/Post.js
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, {
  timestamps: true
});

export default mongoose.model('Post', postSchema);
```

### Contrôleurs

```javascript
// controllers/postController.js
import Post from '../models/Post.js';

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

## Frontend (Angular)

### Services API

```typescript
// services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getPosts(): Observable<any> {
    return this.http.get(this.apiUrl + '/posts');
  }

  getPost(id: string): Observable<any> {
    return this.http.get(this.apiUrl + '/posts/' + id);
  }

  createPost(post: any): Observable<any> {
    return this.http.post(this.apiUrl + '/posts', post);
  }
}
```

### Composants

```typescript
// components/post-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-post-list',
  template: '<div class="posts"><div class="post-card" *ngFor="let post of posts"><h3>{{ post.title }}</h3><p>{{ post.excerpt }}</p><span class="author">{{ post.author }}</span></div></div>'
})
export class PostListComponent implements OnInit {
  posts: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getPosts().subscribe({
      next: (response) => {
        this.posts = response.data;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }
}
```

## Sécurité

### CORS Configuration

```javascript
// server.js
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Validation des données

```javascript
// middleware/validate.js
import Joi from 'joi';

export const validatePost = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(200),
    content: Joi.string().required().min(10),
    author: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};
```

## Performance

### Indexation MongoDB

```javascript
// Créer des index pour améliorer les performances
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ author: 1, createdAt: -1 });
```

### Caching

```javascript
// middleware/cache.js
import redis from 'redis';

const client = redis.createClient();

export const cache = (duration) => {
  return async (req, res, next) => {
    const key = 'cache:' + req.originalUrl;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};
```

## Déploiement

### Environment Variables

```bash
# .env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-secret-key
FRONTEND_URL=https://myapp.com
```

### Docker Configuration

```dockerfile
# Dockerfile pour l'API
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Conclusion

Une architecture MEAN Stack bien structurée offre une base solide pour développer des applications web modernes. En suivant ces bonnes pratiques, vous pouvez créer des applications performantes, maintenables et évolutives.""",
        "excerpt": "Découvrez les bonnes pratiques pour architecturer une application MEAN Stack complète avec MongoDB, Express, Angular et Node.js.",
        "slug": "architecture-mean-stack-bonnes-pratiques",
        "tags": ["mean-stack", "mongodb", "express", "angular", "nodejs"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop"
    },
    {
        "title": "TypeScript : Maîtrisez le typage avancé",
        "content": """# TypeScript : Maîtrisez le typage avancé

TypeScript est un sur-ensemble de JavaScript qui ajoute un système de types statiques. Découvrons les fonctionnalités avancées du typage TypeScript.

## Types de base

### Types primitifs

```typescript
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;
let nothing: null = null;
let undefined: undefined = undefined;
```

### Types de référence

```typescript
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["John", "Jane", "Bob"];

let tuple: [string, number] = ["John", 30];
let mixed: (string | number)[] = ["John", 30, "Jane", 25];
```

## Types personnalisés

### Interfaces

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Propriété optionnelle
  readonly createdAt: Date; // Propriété en lecture seule
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date()
};
```

### Types

```typescript
type Status = "pending" | "approved" | "rejected";
type UserRole = "admin" | "user" | "moderator";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  status: Status;
};
```

## Types génériques

### Fonctions génériques

```typescript
function identity<T>(arg: T): T {
  return arg;
}

const result1 = identity<string>("Hello");
const result2 = identity<number>(42);
const result3 = identity("Hello"); // Inférence de type
```

### Classes génériques

```typescript
class Container<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }

  setValue(value: T): void {
    this.value = value;
  }
}

const stringContainer = new Container<string>("Hello");
const numberContainer = new Container<number>(42);
```

### Interfaces génériques

```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
}
```

## Types utilitaires

### Partial, Required, Readonly

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

// Partial - rend toutes les propriétés optionnelles
type PartialUser = Partial<User>;
// Équivalent à: { id?: number; name?: string; email?: string; age?: number; }

// Required - rend toutes les propriétés obligatoires
type RequiredUser = Required<User>;
// Équivalent à: { id: number; name: string; email: string; age: number; }

// Readonly - rend toutes les propriétés en lecture seule
type ReadonlyUser = Readonly<User>;
// Équivalent à: { readonly id: number; readonly name: string; ... }
```

### Pick, Omit, Record

```typescript
// Pick - sélectionne certaines propriétés
type UserBasicInfo = Pick<User, 'name' | 'email'>;
// Équivalent à: { name: string; email: string; }

// Omit - exclut certaines propriétés
type UserWithoutId = Omit<User, 'id'>;
// Équivalent à: { name: string; email: string; age?: number; }

// Record - crée un type avec des clés et valeurs spécifiques
type StatusMap = Record<string, Status>;
// Équivalent à: { [key: string]: Status; }
```

### Exclude, Extract

```typescript
type T0 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
type T1 = Exclude<string | number | (() => void), Function>; // string | number

type T2 = Extract<"a" | "b" | "c", "a" | "f">; // "a"
type T3 = Extract<string | number | (() => void), Function>; // () => void
```

## Types conditionnels

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// Exemple d'utilisation
function getUser(id: string): User {
  return { id: 1, name: "John", email: "john@example.com" };
}

type UserReturnType = ReturnType<typeof getUser>; // User
type UserParameters = Parameters<typeof getUser>; // [string]
```

## Types mappés

```typescript
type MappedType<T> = {
  [P in keyof T]: T[P] | null;
};

type NullableUser = MappedType<User>;
// Équivalent à: { id: number | null; name: string | null; ... }

// Avec modificateurs
type ReadonlyMapped<T> = {
  readonly [P in keyof T]: T[P];
};

type OptionalMapped<T> = {
  [P in keyof T]?: T[P];
};
```

## Types de template literals

```typescript
type EmailLocale = "en" | "fr" | "es";
type EmailType = "welcome" | "reset" | "notification";

type EmailTemplate = EmailType + "_" + EmailLocale;
// "welcome_en" | "welcome_fr" | "welcome_es" | "reset_en" | ...

type ApiEndpoint = "/api/" + string;
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type ApiRoute = HttpMethod + " " + ApiEndpoint;
// "GET /api/users" | "POST /api/posts" | ...
```

## Types avancés avec infer

```typescript
// Extraire le type d'un tableau
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type StringArray = string[];
type StringElement = ArrayElement<StringArray>; // string

// Extraire le type d'une Promise
type PromiseType<T> = T extends Promise<infer U> ? U : never;

type UserPromise = Promise<User>;
type UserFromPromise = PromiseType<UserPromise>; // User
```

## Types avec contraintes

```typescript
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

loggingIdentity("hello"); // OK
loggingIdentity([1, 2, 3]); // OK
loggingIdentity(42); // Erreur: number n'a pas de propriété 'length'
```

## Conclusion

TypeScript offre un système de types puissant et flexible qui améliore la qualité du code et l'expérience de développement. En maîtrisant ces concepts avancés, vous pouvez créer des applications plus robustes et maintenables.""",
        "excerpt": "Explorez les fonctionnalités avancées du typage TypeScript : types génériques, utilitaires, conditionnels et mappés pour un code plus robuste.",
        "slug": "typescript-maitrisez-typage-avance",
        "tags": ["typescript", "javascript", "typage", "programmation"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop"
    }
]

def connect_db():
    """Se connecter à MongoDB"""
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        print("✅ MongoDB connecté avec succès")
        return client, db
    except Exception as e:
        print(f"❌ Erreur de connexion MongoDB: {e}")
        sys.exit(1)

def create_users(db):
    """Créer les utilisateurs de test"""
    try:
        print("👥 Création des utilisateurs de test...")
        
        # Supprimer les utilisateurs existants
        db.users.delete_many({})
        print("🗑️  Anciens utilisateurs supprimés")
        
        # Créer les nouveaux utilisateurs
        created_users = []
        for user_data in sample_users:
            # Hasher le mot de passe
            hashed_password = bcrypt.hashpw(user_data["password"].encode('utf-8'), bcrypt.gensalt())
            
            # Créer l'utilisateur avec les champs requis par le modèle
            user = {
                "username": user_data["username"],
                "email": user_data["email"],
                "password": hashed_password.decode('utf-8'),
                "role": user_data["role"],
                "profile": user_data["profile"],
                "stats": {
                    "postsCount": 0,
                    "commentsCount": 0,
                    "likesGiven": 0,
                    "likesReceived": 0,
                    "lastActivity": datetime.now(timezone.utc)
                },
                "preferences": {
                    "emailNotifications": True,
                    "theme": "light"
                },
                "isActive": True,
                "isBanned": False,
                "banInfo": {
                    "isBanned": False,
                    "reason": None,
                    "bannedBy": None,
                    "bannedAt": None,
                    "bannedUntil": None,
                    "duration": None
                }
            }
            
            result = db.users.insert_one(user)
            user["_id"] = result.inserted_id
            created_users.append(user)
            print(f"✅ Utilisateur créé: {user['username']} ({user['profile']['firstName']} {user['profile']['lastName']})")
        
        return created_users
    except Exception as e:
        print(f"❌ Erreur lors de la création des utilisateurs: {e}")
        raise

def create_posts(db, users):
    """Créer les posts de test"""
    try:
        print("📝 Création des posts de test...")
        
        # Supprimer les posts existants
        db.posts.delete_many({})
        print("🗑️  Anciens posts supprimés")
        
        # Créer les posts avec les ObjectIds des utilisateurs
        posts_with_authors = []
        for i, post_data in enumerate(sample_posts_data):
            post = {
                **post_data,
                "author": users[i % len(users)]["_id"],  # Répartir les posts entre les utilisateurs
                "likes": [],
                "likesCount": 0,
                "createdAt": datetime.now(timezone.utc),
                "updatedAt": datetime.now(timezone.utc)
            }
            posts_with_authors.append(post)
        
        # Insérer les posts
        result = db.posts.insert_many(posts_with_authors)
        print(f"✅ {len(result.inserted_ids)} articles insérés avec succès")
        
        return result.inserted_ids
    except Exception as e:
        print(f"❌ Erreur lors de la création des posts: {e}")
        raise

def main():
    """Fonction principale"""
    try:
        print("🌱 Début de l'injection des données de test...")
        
        # Se connecter à la base de données
        client, db = connect_db()
        
        # Créer les utilisateurs
        users = create_users(db)
        
        # Créer les posts
        create_posts(db, users)
        
        # Afficher un résumé
        print("\n📊 Résumé des données créées :")
        print(f"👥 Utilisateurs: {len(users)}")
        print(f"📝 Posts: {len(sample_posts_data)}")
        
        print("\n🎉 Injection des données terminée avec succès !")
        print("🌐 Vous pouvez maintenant tester l'API sur http://localhost:5000")
        print("🔑 Identifiants de test:")
        for user in users:
            print(f"   - {user['username']} / {user['password']}")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'injection des données: {e}")
    finally:
        # Fermer la connexion
        if 'client' in locals():
            client.close()
            print("🔌 Connexion MongoDB fermée")

if __name__ == "__main__":
    main()
