import mongoose from 'mongoose';
import Post from '../models/Post.js';
import User from '../models/User.js';

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette';
    console.log('Tentative de connexion à MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

// Données de test pour les posts
const postsData = [
  {
    title: "Introduction à JavaScript",
    excerpt: "Découvrez les bases de JavaScript avec des exemples pratiques",
    content: `# Introduction à JavaScript

JavaScript est un langage de programmation dynamique et orienté objet.

## Variables et types de données

\`\`\`javascript
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
\`\`\`

## Fonctions

\`\`\`javascript
// Fonction simple
function saluer(nom) {
    return "Bonjour " + nom + " !";
}

// Fonction fléchée
const multiplier = (a, b) => a * b;

// Appel de fonction
console.log(saluer("Alice")); // Affiche: Bonjour Alice !
console.log(multiplier(5, 3)); // Affiche: 15
\`\`\`

JavaScript est un langage puissant qui permet de créer des applications web interactives et dynamiques.`,
    slug: "introduction-javascript",
    tags: ["javascript", "programmation", "web"],
    status: "published",
    featuredImage: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop",
    readTime: 8
  },
  {
    title: "Les bases de Python",
    excerpt: "Apprenez les fondamentaux du langage Python",
    content: `# Les bases de Python

Python est un langage de programmation simple et puissant.

## Variables et types

\`\`\`python
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
\`\`\`

## Fonctions

\`\`\`python
# Fonction simple
def saluer(nom):
    return f"Bonjour {nom} !"

# Fonction avec paramètres par défaut
def multiplier(a, b=1):
    return a * b

# Appel de fonctions
print(saluer("Alice"))  # Affiche: Bonjour Alice !
print(multiplier(5, 3))  # Affiche: 15
\`\`\`

Python est excellent pour débuter en programmation !`,
    slug: "bases-python",
    tags: ["python", "programmation", "débutant"],
    status: "published",
    featuredImage: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop",
    readTime: 6
  },
  {
    title: "Guide CSS Avancé",
    excerpt: "Maîtrisez les techniques avancées de CSS",
    content: `# Guide CSS Avancé

CSS permet de styliser vos pages web de manière professionnelle.

## Flexbox

\`\`\`css
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
\`\`\`

## Grid Layout

\`\`\`css
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
\`\`\`

CSS est essentiel pour créer des interfaces modernes et responsives !`,
    slug: "guide-css-avance",
    tags: ["css", "web", "design"],
    status: "published",
    featuredImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    readTime: 10
  },
  {
    title: "Développement Web avec React",
    excerpt: "Créez des applications web modernes avec React",
    content: `# Développement Web avec React

React est une bibliothèque JavaScript développée par Facebook pour créer des interfaces utilisateur.

## Composants React

\`\`\`jsx
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
\`\`\`

## Hooks React

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Compteur() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        document.title = \`Compteur: \${count}\`;
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
\`\`\`

React simplifie grandement le développement d'applications web modernes !`,
    slug: "developpement-react",
    tags: ["react", "javascript", "web", "frontend"],
    status: "published",
    featuredImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    readTime: 12
  },
  {
    title: "API REST avec Node.js et Express",
    excerpt: "Construisez des APIs robustes avec Node.js",
    content: `# API REST avec Node.js et Express

Node.js permet de créer des applications serveur performantes avec JavaScript.

## Configuration Express

\`\`\`javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`Serveur démarré sur le port \${PORT}\`);
});
\`\`\`

## Routes GET

\`\`\`javascript
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
\`\`\`

Node.js et Express offrent une base solide pour créer des APIs modernes !`,
    slug: "api-rest-nodejs-express",
    tags: ["nodejs", "express", "api", "backend"],
    status: "published",
    featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    readTime: 15
  }
];

// Créer des posts de test
const createTestPosts = async () => {
  try {
    // Récupérer l'utilisateur admin pour être l'auteur des posts
    const adminUser = await User.findOne({ email: 'admin@jgazette.com' });
    
    if (!adminUser) {
      console.log('❌ Utilisateur admin non trouvé. Exécutez d\'abord createAdmin.js');
      return;
    }

    // Supprimer les posts existants
    await Post.deleteMany({});
    console.log('🗑️  Posts existants supprimés');

    // Créer les nouveaux posts
    for (const postData of postsData) {
      const post = new Post({
        ...postData,
        author: adminUser._id,
        publishedAt: new Date()
      });
      
      await post.save();
      console.log(`✅ Post créé: ${post.title}`);
    }

    console.log(`\n🎉 ${postsData.length} posts créés avec succès !`);
  } catch (error) {
    console.error('❌ Erreur lors de la création des posts:', error);
  }
};

// Fonction principale
const main = async () => {
  await connectDB();
  await createTestPosts();
  
  console.log('\n📋 Posts de test créés:');
  console.log('📝 Introduction à JavaScript');
  console.log('🐍 Les bases de Python');
  console.log('🎨 Guide CSS Avancé');
  console.log('⚛️  Développement Web avec React');
  console.log('🚀 API REST avec Node.js et Express');
  
  process.exit(0);
};

main();

