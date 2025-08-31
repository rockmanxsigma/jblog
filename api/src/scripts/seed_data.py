import pymongo
from datetime import datetime

# Connexion à MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["jgazette"]
posts_collection = db["posts"]

# Suppression des données existantes
posts_collection.delete_many({})

# Données de test avec des articles contenant du code
posts_data = [
    {
        "title": "Introduction à JavaScript",
        "excerpt": "Découvrez les bases de JavaScript avec des exemples pratiques",
        "content": """# Introduction à JavaScript

JavaScript est un langage de programmation dynamique et orienté objet.

## Variables et types de données

```javascript
// Déclaration de variables
let nom = "Alice";
const age = 25;
var ville = "Paris";

// Types de données
let nombre = 42;
let decimal = 3.14;
let booleen = true;
let tableau = [1, 2, 3, 4, 5];
let objet = { nom: "Bob", age: 30 };
```

## Fonctions

```javascript
// Fonction simple
function saluer(nom) {
    return "Bonjour " + nom + " !";
}

// Fonction fléchée
const multiplier = (a, b) => a * b;

// Appel de fonction
console.log(saluer("Alice")); // Affiche: Bonjour Alice !
console.log(multiplier(5, 3)); // Affiche: 15
```

## Boucles et conditions

```javascript
// Boucle for
for (let i = 0; i < 5; i++) {
    console.log("Itération " + i);
}

// Boucle while
let compteur = 0;
while (compteur < 3) {
    console.log("Compteur: " + compteur);
    compteur++;
}

// Condition if/else
let temperature = 25;
if (temperature > 30) {
    console.log("Il fait chaud !");
} else if (temperature > 20) {
    console.log("Il fait bon !");
} else {
    console.log("Il fait frais !");
}
```

## Manipulation du DOM

```javascript
// Sélectionner un élément
const element = document.getElementById("mon-element");

// Modifier le contenu
element.innerHTML = "Nouveau contenu";

// Ajouter une classe
element.classList.add("active");

// Écouter un événement
element.addEventListener("click", function() {
    alert("Clic détecté !");
});
```

JavaScript est un langage puissant qui permet de créer des applications web interactives et dynamiques.""",
        "slug": "introduction-javascript",
        "author": "Jean Dupont",
        "tags": ["javascript", "programmation", "web"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop",
        "readTime": 8,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Les bases de Python",
        "excerpt": "Apprenez les fondamentaux du langage Python",
        "content": """# Les bases de Python

Python est un langage de programmation simple et puissant.

## Variables et types

```python
# Variables simples
nom = "Alice"
age = 25
taille = 1.75
est_etudiant = True

# Types de données
nombre = 42
decimal = 3.14
texte = "Hello World"
liste = [1, 2, 3, 4, 5]
dictionnaire = {"nom": "Bob", "age": 30}
```

## Fonctions

```python
# Fonction simple
def saluer(nom):
    return f"Bonjour {nom} !"

# Fonction avec paramètres par défaut
def multiplier(a, b=1):
    return a * b

# Appel de fonctions
print(saluer("Alice"))  # Affiche: Bonjour Alice !
print(multiplier(5, 3))  # Affiche: 15
```

## Boucles et conditions

```python
# Boucle for
for i in range(5):
    print(f"Itération {i}")

# Boucle while
compteur = 0
while compteur < 3:
    print(f"Compteur: {compteur}")
    compteur += 1

# Condition if/elif/else
temperature = 25
if temperature > 30:
    print("Il fait chaud !")
elif temperature > 20:
    print("Il fait bon !")
else:
    print("Il fait frais !")
```

## Gestion des listes

```python
# Création de listes
fruits = ["pomme", "banane", "orange"]

# Ajouter un élément
fruits.append("kiwi")

# Parcourir une liste
for fruit in fruits:
    print(fruit)

# List comprehension
nombres = [1, 2, 3, 4, 5]
carres = [x**2 for x in nombres]
print(carres)  # [1, 4, 9, 16, 25]
```

Python est excellent pour débuter en programmation !""",
        "slug": "bases-python",
        "author": "Marie Martin",
        "tags": ["python", "programmation", "débutant"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop",
        "readTime": 6,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Guide CSS Avancé",
        "excerpt": "Maîtrisez les techniques avancées de CSS",
        "content": """# Guide CSS Avancé

CSS permet de styliser vos pages web de manière professionnelle.

## Flexbox

```css
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
}

.item {
    flex: 1;
    margin: 10px;
}
```

## Grid Layout

```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 20px;
    grid-template-areas: 
        "header header header"
        "sidebar main main"
        "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

## Animations CSS

```css
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animated-element {
    animation: fadeIn 0.5s ease-in-out;
}
```

## Media Queries

```css
/* Mobile first */
.container {
    width: 100%;
    padding: 10px;
}

/* Tablette */
@media (min-width: 768px) {
    .container {
        width: 750px;
        margin: 0 auto;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        width: 1000px;
    }
}
```

CSS est essentiel pour créer des interfaces modernes et responsives !""",
        "slug": "guide-css-avance",
        "author": "Pierre Durand",
        "tags": ["css", "web", "design"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
        "readTime": 10,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement Web avec React",
        "excerpt": "Créez des applications web modernes avec React",
        "content": """# Développement Web avec React

React est une bibliothèque JavaScript développée par Facebook pour créer des interfaces utilisateur.

## Composants React

```jsx
import React from 'react';

function MonComposant() {
    return (
        <div className="mon-composant">
            <h1>Bonjour React !</h1>
            <p>Ceci est mon premier composant</p>
        </div>
    );
}

export default MonComposant;
```

## Hooks React

```jsx
import React, { useState, useEffect } from 'react';

function Compteur() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        document.title = `Compteur: ${count}`;
    }, [count]);
    
    return (
        <div>
            <p>Compteur: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Incrémenter
            </button>
        </div>
    );
}
```

## Props et State

```jsx
function Utilisateur({ nom, age, ville }) {
    const [connecte, setConnecte] = useState(false);
    
    return (
        <div className="utilisateur">
            <h2>{nom}</h2>
            <p>Âge: {age}</p>
            <p>Ville: {ville}</p>
            <button onClick={() => setConnecte(!connecte)}>
                {connecte ? 'Se déconnecter' : 'Se connecter'}
            </button>
        </div>
    );
}
```

## Gestion des événements

```jsx
function Formulaire() {
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Nom:', nom);
        console.log('Email:', email);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Votre nom"
            />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
            />
            <button type="submit">Envoyer</button>
        </form>
    );
}
```

React simplifie grandement le développement d'applications web modernes !""",
        "slug": "developpement-react",
        "author": "Sophie Bernard",
        "tags": ["react", "javascript", "web", "frontend"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
        "readTime": 12,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "API REST avec Node.js et Express",
        "excerpt": "Construisez des APIs robustes avec Node.js",
        "content": """# API REST avec Node.js et Express

Node.js permet de créer des applications serveur performantes avec JavaScript.

## Configuration Express

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
```

## Routes GET

```javascript
// Route simple
app.get('/api/users', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, nom: 'Alice' },
            { id: 2, nom: 'Bob' }
        ]
    });
});

// Route avec paramètres
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({
        success: true,
        data: { id: userId, nom: 'Utilisateur' }
    });
});
```

## Routes POST

```javascript
app.post('/api/users', (req, res) => {
    const { nom, email } = req.body;
    
    // Validation
    if (!nom || !email) {
        return res.status(400).json({
            success: false,
            message: 'Nom et email requis'
        });
    }
    
    // Création utilisateur
    const newUser = {
        id: Date.now(),
        nom,
        email
    };
    
    res.status(201).json({
        success: true,
        data: newUser
    });
});
```

## Middleware d'authentification

```javascript
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token requis'
        });
    }
    
    // Vérification du token
    try {
        // Logique de vérification
        req.user = { id: 1, nom: 'Utilisateur' };
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token invalide'
        });
    }
};

// Utilisation du middleware
app.get('/api/profile', authMiddleware, (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});
```

## Gestion des erreurs

```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
    });
});

// Route 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});
```

Node.js et Express offrent une base solide pour créer des APIs modernes !""",
        "slug": "api-rest-nodejs-express",
        "author": "Thomas Leroy",
        "tags": ["nodejs", "express", "api", "backend"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
        "readTime": 15,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Base de données MongoDB",
        "excerpt": "Maîtrisez MongoDB pour vos applications",
        "content": """# Base de données MongoDB

MongoDB est une base de données NoSQL orientée documents.

## Connexion à MongoDB

```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion:'));
db.once('open', () => {
    console.log('Connexion à MongoDB réussie');
});
```

## Schéma et Modèle

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    age: {
        type: Number,
        min: 0,
        max: 120
    },
    actif: {
        type: Boolean,
        default: true
    },
    dateCreation: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
```

## Opérations CRUD

```javascript
// Créer un utilisateur
const nouveauUser = new User({
    nom: 'Alice',
    email: 'alice@example.com',
    age: 25
});

nouveauUser.save()
    .then(user => console.log('Utilisateur créé:', user))
    .catch(err => console.error('Erreur:', err));

// Trouver tous les utilisateurs
User.find()
    .then(users => console.log('Utilisateurs:', users))
    .catch(err => console.error('Erreur:', err));

// Trouver par ID
User.findById('60d21b4667d0d8992e610c85')
    .then(user => console.log('Utilisateur:', user))
    .catch(err => console.error('Erreur:', err));

// Mettre à jour
User.findByIdAndUpdate(
    '60d21b4667d0d8992e610c85',
    { age: 26 },
    { new: true }
)
    .then(user => console.log('Utilisateur mis à jour:', user))
    .catch(err => console.error('Erreur:', err));

// Supprimer
User.findByIdAndDelete('60d21b4667d0d8992e610c85')
    .then(() => console.log('Utilisateur supprimé'))
    .catch(err => console.error('Erreur:', err));
```

## Requêtes avancées

```javascript
// Recherche avec filtres
User.find({ age: { $gte: 18 }, actif: true })
    .select('nom email age')
    .sort({ nom: 1 })
    .limit(10)
    .then(users => console.log('Utilisateurs:', users));

// Agrégation
User.aggregate([
    { $match: { actif: true } },
    { $group: { 
        _id: null, 
        moyenneAge: { $avg: '$age' },
        total: { $sum: 1 }
    }}
])
.then(result => console.log('Statistiques:', result));

// Recherche textuelle
User.find({ $text: { $search: 'alice' } })
    .then(users => console.log('Résultats:', users));
```

## Index et Performance

```javascript
// Créer un index
userSchema.index({ email: 1 });
userSchema.index({ nom: 'text', email: 'text' });

// Index composé
userSchema.index({ age: 1, actif: 1 });

// Index unique
userSchema.index({ email: 1 }, { unique: true });
```

MongoDB offre une flexibilité exceptionnelle pour gérer vos données !""",
        "slug": "base-donnees-mongodb",
        "author": "Claire Dubois",
        "tags": ["mongodb", "database", "nosql", "backend"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop",
        "readTime": 14,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement Frontend avec Angular",
        "excerpt": "Créez des applications web avec Angular",
        "content": """# Développement Frontend avec Angular

Angular est un framework JavaScript complet pour créer des applications web.

## Composant Angular

```typescript
import { Component } from '@angular/core';

@Component({
    selector: 'app-mon-composant',
    template: `
        <div class="mon-composant">
            <h1>{{ titre }}</h1>
            <p>{{ description }}</p>
            <button (click)="onClick()">Cliquer</button>
        </div>
    `,
    styles: [`
        .mon-composant {
            padding: 20px;
            border: 1px solid #ccc;
        }
    `]
})
export class MonComposantComponent {
    titre = 'Mon Composant';
    description = 'Ceci est un composant Angular';
    
    onClick() {
        console.log('Bouton cliqué !');
    }
}
```

## Services Angular

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'https://api.example.com/users';
    
    constructor(private http: HttpClient) {}
    
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }
    
    getUser(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }
    
    createUser(user: User): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }
}
```

## Routing Angular

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'users', component: UsersComponent },
    { path: 'users/:id', component: UserDetailComponent },
    { path: '**', component: NotFoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
```

## Forms Angular

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-user-form',
    template: `
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div>
                <label>Nom:</label>
                <input formControlName="nom" type="text">
                <div *ngIf="userForm.get('nom')?.invalid && userForm.get('nom')?.touched">
                    Le nom est requis
                </div>
            </div>
            
            <div>
                <label>Email:</label>
                <input formControlName="email" type="email">
                <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
                    Email invalide
                </div>
            </div>
            
            <button type="submit" [disabled]="userForm.invalid">
                Envoyer
            </button>
        </form>
    `
})
export class UserFormComponent {
    userForm: FormGroup;
    
    constructor(private fb: FormBuilder) {
        this.userForm = this.fb.group({
            nom: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]]
        });
    }
    
    onSubmit() {
        if (this.userForm.valid) {
            console.log(this.userForm.value);
        }
    }
}
```

## State Management avec NgRx

```typescript
// Actions
export const loadUsers = createAction('[Users] Load Users');
export const loadUsersSuccess = createAction(
    '[Users] Load Users Success',
    props<{ users: User[] }>()
);

// Reducer
export const usersReducer = createReducer(
    initialState,
    on(loadUsers, state => ({ ...state, loading: true })),
    on(loadUsersSuccess, (state, { users }) => ({
        ...state,
        users,
        loading: false
    }))
);

// Effects
@Injectable()
export class UsersEffects {
    loadUsers$ = createEffect(() => this.actions$.pipe(
        ofType(loadUsers),
        mergeMap(() => this.userService.getUsers().pipe(
            map(users => loadUsersSuccess({ users }))
        ))
    ));
    
    constructor(
        private actions$: Actions,
        private userService: UserService
    ) {}
}
```

Angular offre un écosystème complet pour le développement d'applications web !""",
        "slug": "developpement-frontend-angular",
        "author": "Marc Lefevre",
        "tags": ["angular", "typescript", "frontend", "web"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1555066932-e78dd8fb77bb?w=800&h=400&fit=crop",
        "readTime": 18,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "DevOps et Déploiement",
        "excerpt": "Automatisez vos déploiements avec DevOps",
        "content": """# DevOps et Déploiement

Le DevOps combine développement et opérations pour optimiser le cycle de vie des applications.

## Docker et Conteneurisation

```dockerfile
# Dockerfile pour une application Node.js
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/app
    depends_on:
      - mongo
  
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## CI/CD avec GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          echo "Déploiement en cours..."
          # Scripts de déploiement
```

## Configuration Nginx

```nginx
# /etc/nginx/sites-available/myapp
server {
    listen 80;
    server_name monapp.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Scripts de Déploiement

```bash
#!/bin/bash
# deploy.sh

echo "Démarrage du déploiement..."

# Sauvegarde de la version actuelle
cp -r /var/www/app /var/www/app.backup.$(date +%Y%m%d_%H%M%S)

# Pull des dernières modifications
cd /var/www/app
git pull origin main

# Installation des dépendances
npm ci --production

# Build de l'application
npm run build

# Redémarrage des services
sudo systemctl restart myapp
sudo systemctl restart nginx

echo "Déploiement terminé avec succès !"
```

## Monitoring et Logs

```javascript
// Winston pour la gestion des logs
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
```

## Variables d'environnement

```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb://localhost:27017/production
JWT_SECRET=your-super-secret-key
REDIS_URL=redis://localhost:6379
```

Le DevOps améliore considérablement la qualité et la rapidité de déploiement !""",
        "slug": "devops-deploiement",
        "author": "Nathalie Rousseau",
        "tags": ["devops", "docker", "deploiement", "ci-cd"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1667372393119-5d6c2c0e2b3b?w=800&h=400&fit=crop",
        "readTime": 20,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Machine Learning avec Python",
        "excerpt": "Découvrez les bases du machine learning avec Python",
        "content": """# Machine Learning avec Python

Le machine learning révolutionne la façon dont nous analysons les données.

## Installation des bibliothèques

```python
pip install scikit-learn pandas numpy matplotlib
```

## Classification simple

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# Charger les données
iris = load_iris()
X = iris.data
y = iris.target

# Diviser en train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Entraîner le modèle
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Prédictions
predictions = model.predict(X_test)
print(f"Précision: {model.score(X_test, y_test):.2f}")
```

## Régression linéaire

```python
from sklearn.linear_model import LinearRegression
import numpy as np

# Données d'exemple
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

# Modèle de régression
model = LinearRegression()
model.fit(X, y)

# Prédiction
prediction = model.predict([[6]])
print(f"Prédiction pour 6: {prediction[0]:.2f}")
```

## Visualisation des données

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Créer un graphique
plt.figure(figsize=(10, 6))
sns.scatterplot(data=iris_df, x='sepal_length', y='sepal_width', hue='species')
plt.title('Analyse des iris')
plt.show()
```

Le machine learning ouvre de nouvelles possibilités d'analyse !""",
        "slug": "machine-learning-python",
        "author": "Dr. Sarah Chen",
        "tags": ["python", "machine-learning", "data-science", "scikit-learn"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
        "readTime": 16,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement Mobile avec React Native",
        "excerpt": "Créez des applications mobiles avec React Native",
        "content": """# Développement Mobile avec React Native

React Native permet de créer des applications mobiles avec JavaScript.

## Configuration du projet

```bash
npx react-native init MonApp
cd MonApp
npx react-native run-android
```

## Composant de base

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur React Native !</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

export default App;
```

## Navigation

```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## API calls

```jsx
import { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://api.example.com/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {loading ? (
        <Text>Chargement...</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text>{item.name}</Text>
          )}
        />
      )}
    </View>
  );
};
```

React Native simplifie le développement mobile cross-platform !""",
        "slug": "developpement-mobile-react-native",
        "author": "Alexandre Moreau",
        "tags": ["react-native", "mobile", "javascript", "cross-platform"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
        "readTime": 14,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Sécurité Web Avancée",
        "excerpt": "Protégez vos applications web contre les attaques",
        "content": """# Sécurité Web Avancée

La sécurité web est cruciale pour protéger vos applications.

## Protection XSS

```javascript
// Éviter les XSS
function sanitizeInput(input) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Utilisation
const userInput = '<script>alert("XSS")</script>';
const safeInput = sanitizeInput(userInput);
```

## Validation des données

```javascript
const Joi = require('joi');

const userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    age: Joi.number().min(18).max(100)
});

function validateUser(userData) {
    const { error, value } = userSchema.validate(userData);
    if (error) {
        throw new Error(error.details[0].message);
    }
    return value;
}
```

## Authentification JWT

```javascript
const jwt = require('jsonwebtoken');

// Générer un token
function generateToken(user) {
    return jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// Vérifier un token
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Token invalide');
    }
}
```

## Protection CSRF

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

app.get('/form', (req, res) => {
    res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/submit', csrfProtection, (req, res) => {
    // Traitement sécurisé
});
```

La sécurité doit être une priorité dans le développement web !""",
        "slug": "securite-web-avancee",
        "author": "Michel Dubois",
        "tags": ["securite", "web", "authentication", "csrf", "xss"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1517486803000-000000000000?w=800&h=400&fit=crop",
        "readTime": 22,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement avec Vue.js",
        "excerpt": "Créez des applications web avec Vue.js",
        "content": """# Développement avec Vue.js

Vue.js est un framework JavaScript progressif pour créer des interfaces utilisateur.

## Installation et configuration

```bash
npm install -g @vue/cli
vue create mon-projet
cd mon-projet
npm run serve
```

## Composant Vue de base

```vue
<template>
  <div class="hello">
    <h1>{{ message }}</h1>
    <button @click="incrementCount">Compteur: {{ count }}</button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      message: 'Bienvenue sur Vue.js !',
      count: 0
    }
  },
  methods: {
    incrementCount() {
      this.count++
    }
  }
}
</script>

<style scoped>
.hello {
  text-align: center;
  margin-top: 60px;
}
</style>
```

## Composition API

```vue
<template>
  <div>
    <h2>{{ title }}</h2>
    <input v-model="newTodo" @keyup.enter="addTodo">
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        {{ todo.text }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const title = ref('Ma Liste de Tâches')
const newTodo = ref('')
const todos = reactive([])

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.push({
      id: Date.now(),
      text: newTodo.value
    })
    newTodo.value = ''
  }
}
</script>
```

## Vuex pour la gestion d'état

```javascript
// store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    isAuthenticated: false
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    }
  },
  actions: {
    async login({ commit }, credentials) {
      // Appel API
      const user = await api.login(credentials)
      commit('setUser', user)
    }
  }
})
```

Vue.js offre une excellente expérience de développement !""",
        "slug": "developpement-vuejs",
        "author": "Julie Martin",
        "tags": ["vuejs", "javascript", "frontend", "framework"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1555066932-e78dd8fb77bb?w=800&h=400&fit=crop",
        "readTime": 12,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Base de données PostgreSQL",
        "excerpt": "Maîtrisez PostgreSQL pour vos applications",
        "content": """# Base de données PostgreSQL

PostgreSQL est un système de gestion de base de données relationnelle robuste.

## Installation et configuration

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Télécharger depuis postgresql.org
```

## Création de tables

```sql
-- Créer une base de données
CREATE DATABASE monapp;

-- Créer une table utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer une table posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    author_id INTEGER REFERENCES users(id),
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Requêtes avancées

```sql
-- Jointure avec agrégation
SELECT 
    u.username,
    COUNT(p.id) as post_count,
    AVG(LENGTH(p.content)) as avg_content_length
FROM users u
LEFT JOIN posts p ON u.id = p.author_id
WHERE p.published = TRUE
GROUP BY u.id, u.username
HAVING COUNT(p.id) > 0
ORDER BY post_count DESC;

-- Requête avec CTE (Common Table Expression)
WITH recent_posts AS (
    SELECT * FROM posts 
    WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
    author_id,
    COUNT(*) as posts_this_week
FROM recent_posts
GROUP BY author_id;
```

## Index et performance

```sql
-- Créer des index
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_users_email ON users(email);

-- Index partiel
CREATE INDEX idx_published_posts ON posts(created_at) 
WHERE published = TRUE;

-- Index composite
CREATE INDEX idx_posts_author_date ON posts(author_id, created_at);
```

## Fonctions et triggers

```sql
-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour automatiser updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

PostgreSQL est excellent pour les applications complexes !""",
        "slug": "base-donnees-postgresql",
        "author": "David Wilson",
        "tags": ["postgresql", "database", "sql", "backend"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1517486803000-000000000000?w=800&h=400&fit=crop",
        "readTime": 18,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement avec TypeScript",
        "excerpt": "Ajoutez la sécurité des types à JavaScript",
        "content": """# Développement avec TypeScript

TypeScript ajoute un système de types statiques à JavaScript.

## Configuration TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Types de base

```typescript
// Types primitifs
let name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;
let hobbies: string[] = ["lecture", "sport"];

// Types d'union
let status: "pending" | "approved" | "rejected" = "pending";

// Types d'intersection
interface User {
    id: number;
    name: string;
}

interface Admin {
    permissions: string[];
}

type AdminUser = User & Admin;

// Types génériques
function identity<T>(arg: T): T {
    return arg;
}

let output = identity<string>("hello");
```

## Interfaces et classes

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age?: number; // Propriété optionnelle
}

class UserService {
    private users: User[] = [];

    addUser(user: User): void {
        this.users.push(user);
    }

    getUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    getUsers(): User[] {
        return [...this.users];
    }
}

// Implémentation d'interface
class DatabaseUserService implements UserService {
    async getUserById(id: number): Promise<User | null> {
        // Logique de base de données
        return null;
    }
}
```

## Types avancés

```typescript
// Types utilitaires
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type UserKeys = keyof User;

// Types conditionnels
type NonNullable<T> = T extends null | undefined ? never : T;

// Types mappés
type ReadonlyUser = {
    readonly [K in keyof User]: User[K];
};

// Types de fonction
type EventHandler = (event: Event) => void;
type AsyncFunction<T> = () => Promise<T>;

// Overloads de fonction
function processData(data: string): string;
function processData(data: number): number;
function processData(data: string | number): string | number {
    if (typeof data === "string") {
        return data.toUpperCase();
    }
    return data * 2;
}
```

TypeScript améliore la maintenabilité du code !""",
        "slug": "developpement-typescript",
        "author": "Caroline Dupont",
        "tags": ["typescript", "javascript", "types", "development"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop",
        "readTime": 15,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement Backend avec Go",
        "excerpt": "Créez des APIs performantes avec Go",
        "content": """# Développement Backend avec Go

Go est un langage de programmation moderne pour le développement backend.

## Structure de base

```go
package main

import (
    "fmt"
    "net/http"
    "log"
)

func main() {
    http.HandleFunc("/", handleHome)
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleHome(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Bienvenue sur Go !")
}
```

## Structures et méthodes

```go
type User struct {
    ID       int    `json:"id"`
    Name     string `json:"name"`
    Email    string `json:"email"`
    Password string `json:"-"` // Exclu du JSON
}

func (u User) GetDisplayName() string {
    return fmt.Sprintf("%s (%s)", u.Name, u.Email)
}

func (u *User) UpdateEmail(email string) {
    u.Email = email
}
```

## Gestion des erreurs

```go
import "errors"

func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division par zéro")
    }
    return a / b, nil
}

func main() {
    result, err := divide(10, 0)
    if err != nil {
        log.Printf("Erreur: %v", err)
        return
    }
    fmt.Printf("Résultat: %f", result)
}
```

## Goroutines et channels

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d processing job %d\n", id, j)
        time.Sleep(time.Second)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // Démarrer 3 workers
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    // Envoyer des jobs
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)

    // Collecter les résultats
    for a := 1; a <= 9; a++ {
        <-results
    }
}
```

## API REST avec Gin

```go
import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()

    r.GET("/users", getUsers)
    r.GET("/users/:id", getUser)
    r.POST("/users", createUser)
    r.PUT("/users/:id", updateUser)
    r.DELETE("/users/:id", deleteUser)

    r.Run(":8080")
}

func getUsers(c *gin.Context) {
    users := []User{
        {ID: 1, Name: "Alice", Email: "alice@example.com"},
        {ID: 2, Name: "Bob", Email: "bob@example.com"},
    }
    c.JSON(http.StatusOK, users)
}

func getUser(c *gin.Context) {
    id := c.Param("id")
    // Logique pour récupérer un utilisateur
    c.JSON(http.StatusOK, gin.H{"id": id})
}
```

Go est excellent pour les services backend performants !""",
        "slug": "developpement-backend-go",
        "author": "Robert Chen",
        "tags": ["go", "golang", "backend", "api", "performance"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
        "readTime": 20,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement avec Flutter",
        "excerpt": "Créez des applications mobiles avec Flutter",
        "content": """# Développement avec Flutter

Flutter permet de créer des applications mobiles cross-platform avec Dart.

## Configuration du projet

```bash
flutter create mon_app
cd mon_app
flutter run
```

## Widget de base

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mon App Flutter',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Compteur Flutter'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'Vous avez appuyé sur le bouton:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: Icon(Icons.add),
      ),
    );
  }
}
```

## Navigation

```dart
class SecondPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Deuxième Page'),
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: Text('Retour'),
        ),
      ),
    );
  }
}

// Navigation avec paramètres
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => DetailPage(userId: 123),
  ),
);
```

## Gestion d'état avec Provider

```dart
import 'package:provider/provider.dart';

class UserProvider extends ChangeNotifier {
  User? _user;
  
  User? get user => _user;
  
  Future<void> login(String email, String password) async {
    // Appel API
    _user = await api.login(email, password);
    notifyListeners();
  }
  
  void logout() {
    _user = null;
    notifyListeners();
  }
}

// Utilisation dans un widget
class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<UserProvider>(
      builder: (context, userProvider, child) {
        return Scaffold(
          body: Column(
            children: [
              TextField(decoration: InputDecoration(labelText: 'Email')),
              TextField(decoration: InputDecoration(labelText: 'Mot de passe')),
              ElevatedButton(
                onPressed: () {
                  userProvider.login('email', 'password');
                },
                child: Text('Se connecter'),
              ),
            ],
          ),
        );
      },
    );
  }
}
```

Flutter simplifie le développement mobile cross-platform !""",
        "slug": "developpement-flutter",
        "author": "Emma Rodriguez",
        "tags": ["flutter", "dart", "mobile", "cross-platform"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
        "readTime": 16,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement avec Rust",
        "excerpt": "Créez des applications performantes avec Rust",
        "content": """# Développement avec Rust

Rust est un langage de programmation système avec sécurité mémoire.

## Installation et premier projet

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo new mon_projet
cd mon_projet
cargo run
```

## Structures et implémentations

```rust
struct User {
    id: u32,
    name: String,
    email: String,
    active: bool,
}

impl User {
    fn new(id: u32, name: String, email: String) -> Self {
        User {
            id,
            name,
            email,
            active: true,
        }
    }

    fn display_name(&self) -> String {
        format!("{} ({})", self.name, self.email)
    }

    fn deactivate(&mut self) {
        self.active = false;
    }
}

fn main() {
    let mut user = User::new(1, "Alice".to_string(), "alice@example.com".to_string());
    println!("{}", user.display_name());
    user.deactivate();
}
```

## Gestion des erreurs

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_file(filename: &str) -> Result<String, io::Error> {
    let mut file = File::open(filename)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

fn main() {
    match read_file("example.txt") {
        Ok(contents) => println!("Contenu: {}", contents),
        Err(e) => eprintln!("Erreur: {}", e),
    }
}
```

## Ownership et borrowing

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // s1 est déplacé vers s2
    
    // println!("{}", s1); // Erreur: s1 n'est plus valide
    
    let s3 = String::from("world");
    let len = calculate_length(&s3); // Emprunt de référence
    println!("Longueur de '{}': {}", s3, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

// Mutable borrowing
fn change_string(s: &mut String) {
    s.push_str(" world");
}
```

## Gestion de la mémoire

```rust
use std::rc::Rc;
use std::cell::RefCell;

struct Node {
    value: i32,
    children: Vec<Rc<RefCell<Node>>>,
}

fn main() {
    let leaf = Rc::new(RefCell::new(Node {
        value: 3,
        children: vec![],
    }));

    let branch = Rc::new(RefCell::new(Node {
        value: 5,
        children: vec![Rc::clone(&leaf)],
    }));

    println!("Valeur de la feuille: {}", leaf.borrow().value);
    println!("Valeur de la branche: {}", branch.borrow().value);
}
```

Rust offre sécurité mémoire sans garbage collector !""",
        "slug": "developpement-rust",
        "author": "Lucas Schmidt",
        "tags": ["rust", "system", "performance", "memory-safety"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1555066932-e78dd8fb77bb?w=800&h=400&fit=crop",
        "readTime": 19,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement avec Kotlin",
        "excerpt": "Créez des applications Android avec Kotlin",
        "content": """# Développement avec Kotlin

Kotlin est un langage moderne pour le développement Android et JVM.

## Configuration Android

```kotlin
// build.gradle.kts
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.example.myapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
}
```

## Activité Android

```kotlin
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        binding.button.setOnClickListener {
            val message = binding.editText.text.toString()
            if (message.isNotEmpty()) {
                binding.textView.text = "Bonjour $message !"
            }
        }
    }
}
```

## Fonctions et extensions

```kotlin
// Fonction avec paramètres par défaut
fun greet(name: String, greeting: String = "Bonjour") {
    println("$greeting $name !")
}

// Fonction d'extension
fun String.addExclamation() = "$this!"

fun main() {
    greet("Alice") // Bonjour Alice !
    greet("Bob", "Salut") // Salut Bob !
    
    val message = "Hello"
    println(message.addExclamation()) // Hello!
}
```

## Classes et objets

```kotlin
data class User(
    val id: Int,
    val name: String,
    val email: String
)

class UserService {
    private val users = mutableListOf<User>()
    
    fun addUser(user: User) {
        users.add(user)
    }
    
    fun getUserById(id: Int): User? {
        return users.find { it.id == id }
    }
    
    fun getAllUsers() = users.toList()
}

// Objet singleton
object Database {
    fun connect() {
        println("Connexion à la base de données...")
    }
}
```

## Coroutines pour l'asynchrone

```kotlin
import kotlinx.coroutines.*

class UserRepository {
    suspend fun getUser(id: Int): User {
        delay(1000) // Simulation d'appel réseau
        return User(id, "User $id", "user$id@example.com")
    }
    
    suspend fun getUsers(): List<User> {
        return withContext(Dispatchers.IO) {
            delay(2000)
            listOf(
                User(1, "Alice", "alice@example.com"),
                User(2, "Bob", "bob@example.com")
            )
        }
    }
}

// Utilisation dans une activité
class MainActivity : AppCompatActivity() {
    private val userRepository = UserRepository()
    
    private fun loadUsers() {
        lifecycleScope.launch {
            try {
                val users = userRepository.getUsers()
                // Mettre à jour l'UI
                updateUI(users)
            } catch (e: Exception) {
                // Gérer l'erreur
                showError(e.message)
            }
        }
    }
}
```

Kotlin simplifie le développement Android moderne !""",
        "slug": "developpement-kotlin",
        "author": "Anna Kowalski",
        "tags": ["kotlin", "android", "jvm", "mobile"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
        "readTime": 17,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement avec Swift",
        "excerpt": "Créez des applications iOS avec Swift",
        "content": """# Développement avec Swift

Swift est le langage moderne pour le développement iOS et macOS.

## Structure de base

```swift
import UIKit

class ViewController: UIViewController {
    
    @IBOutlet weak var label: UILabel!
    @IBOutlet weak var button: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    private func setupUI() {
        label.text = "Bienvenue sur iOS !"
        button.setTitle("Cliquer", for: .normal)
        button.addTarget(self, action: #selector(buttonTapped), for: .touchUpInside)
    }
    
    @objc private func buttonTapped() {
        label.text = "Bouton cliqué !"
    }
}
```

## Structures et classes

```swift
// Structure (value type)
struct User {
    let id: Int
    var name: String
    var email: String
    
    init(id: Int, name: String, email: String) {
        self.id = id
        self.name = name
        self.email = email
    }
    
    func displayName() -> String {
        return "\(name) (\(email))"
    }
}

// Classe (reference type)
class UserService {
    private var users: [User] = []
    
    func addUser(_ user: User) {
        users.append(user)
    }
    
    func getUser(by id: Int) -> User? {
        return users.first { $0.id == id }
    }
    
    func getAllUsers() -> [User] {
        return users
    }
}
```

## Gestion des erreurs

```swift
enum NetworkError: Error {
    case invalidURL
    case noData
    case decodingError
}

class NetworkService {
    func fetchUser(id: Int) async throws -> User {
        guard let url = URL(string: "https://api.example.com/users/\(id)") else {
            throw NetworkError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        
        do {
            let user = try JSONDecoder().decode(User.self, from: data)
            return user
        } catch {
            throw NetworkError.decodingError
        }
    }
}

// Utilisation
Task {
    do {
        let user = try await networkService.fetchUser(id: 1)
        print("Utilisateur: \(user.name)")
    } catch NetworkError.invalidURL {
        print("URL invalide")
    } catch NetworkError.decodingError {
        print("Erreur de décodage")
    } catch {
        print("Erreur inconnue: \(error)")
    }
}
```

## Extensions et protocoles

```swift
// Extension pour ajouter des fonctionnalités
extension String {
    func addExclamation() -> String {
        return self + "!"
    }
    
    var isEmail: Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format:"SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: self)
    }
}

// Protocole
protocol UserRepository {
    func fetchUser(id: Int) async throws -> User
    func saveUser(_ user: User) async throws
}

// Implémentation
class DatabaseUserRepository: UserRepository {
    func fetchUser(id: Int) async throws -> User {
        // Logique de base de données
        return User(id: id, name: "User \(id)", email: "user\(id)@example.com")
    }
    
    func saveUser(_ user: User) async throws {
        // Logique de sauvegarde
        print("Sauvegarde de l'utilisateur: \(user.name)")
    }
}
```

Swift offre une excellente expérience de développement iOS !""",
        "slug": "developpement-swift",
        "author": "Michael Johnson",
        "tags": ["swift", "ios", "apple", "mobile"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
        "readTime": 16,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    },
    {
        "title": "Développement avec PHP",
        "excerpt": "Créez des applications web avec PHP",
        "content": """# Développement avec PHP

PHP est un langage de script côté serveur pour le développement web.

## Configuration de base

```php
<?php
// Configuration de base
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Variables et types
$name = "Alice";
$age = 25;
$isActive = true;
$hobbies = ["lecture", "sport", "musique"];

// Affichage
echo "Bonjour $name !";
echo "Âge: " . $age;
?>
```

## Classes et objets

```php
<?php
class User {
    private $id;
    private $name;
    private $email;
    
    public function __construct($id, $name, $email) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
    }
    
    public function getId() {
        return $this->id;
    }
    
    public function getName() {
        return $this->name;
    }
    
    public function getEmail() {
        return $this->email;
    }
    
    public function setEmail($email) {
        $this->email = $email;
    }
    
    public function displayInfo() {
        return "{$this->name} ({$this->email})";
    }
}

// Utilisation
$user = new User(1, "Alice", "alice@example.com");
echo $user->displayInfo();
?>
```

## Gestion des erreurs

```php
<?php
function divide($a, $b) {
    if ($b == 0) {
        throw new Exception("Division par zéro");
    }
    return $a / $b;
}

try {
    $result = divide(10, 0);
    echo "Résultat: $result";
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage();
}

// Gestion des erreurs avec finally
function processFile($filename) {
    $file = null;
    try {
        $file = fopen($filename, 'r');
        if (!$file) {
            throw new Exception("Impossible d'ouvrir le fichier");
        }
        $content = fread($file, filesize($filename));
        return $content;
    } catch (Exception $e) {
        echo "Erreur: " . $e->getMessage();
        return null;
    } finally {
        if ($file) {
            fclose($file);
        }
    }
}
?>
```

## API REST avec PHP

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class UserController {
    private $users = [];
    
    public function __construct() {
        $this->users = [
            ['id' => 1, 'name' => 'Alice', 'email' => 'alice@example.com'],
            ['id' => 2, 'name' => 'Bob', 'email' => 'bob@example.com']
        ];
    }
    
    public function getUsers() {
        return json_encode($this->users);
    }
    
    public function getUser($id) {
        $user = array_filter($this->users, function($u) use ($id) {
            return $u['id'] == $id;
        });
        
        if (empty($user)) {
            http_response_code(404);
            return json_encode(['error' => 'Utilisateur non trouvé']);
        }
        
        return json_encode(array_values($user)[0]);
    }
    
    public function createUser($data) {
        $newUser = [
            'id' => count($this->users) + 1,
            'name' => $data['name'],
            'email' => $data['email']
        ];
        
        $this->users[] = $newUser;
        http_response_code(201);
        return json_encode($newUser);
    }
}

// Router simple
$controller = new UserController();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

switch ($method) {
    case 'GET':
        if (preg_match('/\/users\/(\d+)/', $path, $matches)) {
            echo $controller->getUser($matches[1]);
        } else {
            echo $controller->getUsers();
        }
        break;
        
    case 'POST':
        if ($path === '/users') {
            $data = json_decode(file_get_contents('php://input'), true);
            echo $controller->createUser($data);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Méthode non autorisée']);
}
?>
```

PHP reste populaire pour le développement web !""",
        "slug": "developpement-php",
        "author": "Sophie Laurent",
        "tags": ["php", "web", "backend", "server-side"],
        "status": "published",
        "featuredImage": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
        "readTime": 14,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
]

# Insertion des données
result = posts_collection.insert_many(posts_data)
print(f"{len(result.inserted_ids)} articles insérés avec succès !")

# Fermeture de la connexion
client.close()
