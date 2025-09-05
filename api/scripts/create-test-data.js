#!/usr/bin/env node

/**
 * Script de création de données de test
 * Crée des utilisateurs, articles et commentaires de test
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Charger les modèles Mongoose
import '../src/models/User.js';
import '../src/models/Post.js';
import '../src/models/Comment.js';

console.log('🚀 Création de données de test...');

const createTestData = async () => {
  try {
    // Connexion à MongoDB local
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette';
    console.log('📡 Connexion à MongoDB local:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion réussie !');

    const User = mongoose.model('User');
    const Post = mongoose.model('Post');
    const Comment = mongoose.model('Comment');

    // Vérifier si des données existent déjà
    const existingUsers = await User.countDocuments();
    const existingPosts = await Post.countDocuments();
    const existingComments = await Comment.countDocuments();

    if (existingUsers > 0 || existingPosts > 0 || existingComments > 0) {
      console.log('⚠️  Des données existent déjà:');
      console.log(`  - Utilisateurs: ${existingUsers}`);
      console.log(`  - Articles: ${existingPosts}`);
      console.log(`  - Commentaires: ${existingComments}`);
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise((resolve) => {
        rl.question('Voulez-vous continuer et ajouter des données de test ? (y/N): ', resolve);
      });

      rl.close();

      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Création annulée par l\'utilisateur');
        process.exit(0);
      }
    }

    console.log('\n👥 Création des utilisateurs...');

    // Créer des utilisateurs de test
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        username: 'admin',
        email: 'admin@jblog.com',
        password: hashedPassword,
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          avatar: 'https://via.placeholder.com/150'
        }
      },
      {
        username: 'publisher',
        email: 'publisher@jblog.com',
        password: hashedPassword,
        role: 'publisher',
        profile: {
          firstName: 'John',
          lastName: 'Publisher',
          avatar: 'https://via.placeholder.com/150'
        }
      },
      {
        username: 'moderator',
        email: 'moderator@jblog.com',
        password: hashedPassword,
        role: 'moderator',
        profile: {
          firstName: 'Jane',
          lastName: 'Moderator',
          avatar: 'https://via.placeholder.com/150'
        }
      },
      {
        username: 'user1',
        email: 'user1@jblog.com',
        password: hashedPassword,
        role: 'user',
        profile: {
          firstName: 'Alice',
          lastName: 'User',
          avatar: 'https://via.placeholder.com/150'
        }
      },
      {
        username: 'user2',
        email: 'user2@jblog.com',
        password: hashedPassword,
        role: 'user',
        profile: {
          firstName: 'Bob',
          lastName: 'User',
          avatar: 'https://via.placeholder.com/150'
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} utilisateurs créés`);

    console.log('\n📝 Création des articles...');

    // Créer des articles de test
    const posts = [
      {
        title: 'Bienvenue sur jBlog',
        slug: 'bienvenue-sur-jblog',
        content: `# Bienvenue sur jBlog !

Ceci est le premier article de votre blog. Vous pouvez :

- Créer de nouveaux articles
- Gérer les commentaires
- Uploader des images
- Personnaliser votre contenu

## Fonctionnalités

- **Système de cooldown** : Limite anti-spam pour les commentaires
- **Upload d'images** : Support des images pour vos articles
- **Gestion des utilisateurs** : Rôles et permissions
- **Interface moderne** : Design responsive avec Tailwind CSS

Bon blogging ! 🚀`,
        excerpt: 'Découvrez les fonctionnalités de votre nouveau blog jBlog',
        author: createdUsers[0]._id,
        tags: ['blog', 'bienvenue', 'fonctionnalités'],
        status: 'published',
        featuredImage: 'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=jBlog+Welcome'
      },
      {
        title: 'Guide de Migration MongoDB Atlas',
        slug: 'guide-migration-mongodb-atlas',
        content: `# Guide de Migration MongoDB Atlas

Ce guide vous accompagne dans la migration de votre base de données MongoDB locale vers MongoDB Atlas.

## Avantages d'Atlas

- **Scalabilité** : Montée en charge automatique
- **Sauvegarde** : Backups automatiques
- **Monitoring** : Métriques en temps réel
- **Sécurité** : Chiffrement et authentification

## Étapes de migration

1. Configuration du cluster Atlas
2. Export des données locales
3. Import vers Atlas
4. Test et validation

Suivez le guide complet pour une migration réussie !`,
        excerpt: 'Apprenez à migrer votre base de données vers MongoDB Atlas',
        author: createdUsers[1]._id,
        tags: ['mongodb', 'atlas', 'migration', 'tutoriel'],
        status: 'published',
        featuredImage: 'https://via.placeholder.com/800x400/059669/FFFFFF?text=MongoDB+Atlas'
      },
      {
        title: 'Système de Cooldown Anti-Spam',
        slug: 'systeme-cooldown-anti-spam',
        content: `# Système de Cooldown Anti-Spam

Le système de cooldown empêche le spam dans les commentaires en imposant des délais entre les publications.

## Limites par rôle

- **Utilisateur** : 5 minutes entre chaque commentaire
- **Modérateur** : 2 minutes entre chaque commentaire
- **Publisher/Admin** : 1 minute entre chaque commentaire

## Fonctionnement

Le système vérifie automatiquement le temps écoulé depuis le dernier commentaire et affiche un timer en temps réel.

Cela améliore la qualité des discussions et réduit le spam !`,
        excerpt: 'Découvrez le système de cooldown qui protège votre blog du spam',
        author: createdUsers[0]._id,
        tags: ['cooldown', 'anti-spam', 'commentaires', 'sécurité'],
        status: 'published',
        featuredImage: 'https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Anti-Spam+System'
      }
    ];

    const createdPosts = await Post.insertMany(posts);
    console.log(`✅ ${createdPosts.length} articles créés`);

    console.log('\n💬 Création des commentaires...');

    // Créer des commentaires de test
    const comments = [
      {
        content: 'Excellent article ! Merci pour ce guide détaillé.',
        author: createdUsers[3]._id,
        post: createdPosts[0]._id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // Il y a 2 heures
      },
      {
        content: 'Très utile, je vais essayer la migration vers Atlas.',
        author: createdUsers[4]._id,
        post: createdPosts[1]._id,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // Il y a 1 heure
      },
      {
        content: 'Le système de cooldown est une excellente idée pour éviter le spam.',
        author: createdUsers[3]._id,
        post: createdPosts[2]._id,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // Il y a 30 minutes
      },
      {
        content: 'J\'ai une question sur la configuration des délais. Peux-tu m\'aider ?',
        author: createdUsers[4]._id,
        post: createdPosts[2]._id,
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // Il y a 10 minutes
      }
    ];

    const createdComments = await Comment.insertMany(comments);
    console.log(`✅ ${createdComments.length} commentaires créés`);

    // Mettre à jour les compteurs de commentaires dans les posts
    for (const post of createdPosts) {
      const commentCount = await Comment.countDocuments({ post: post._id });
      await Post.findByIdAndUpdate(post._id, { 
        $set: { 
          commentsCount: commentCount,
          likesCount: Math.floor(Math.random() * 10) // Likes aléatoires
        } 
      });
    }

    console.log('\n📊 Résumé des données créées:');
    console.log(`👥 Utilisateurs: ${createdUsers.length}`);
    console.log(`📝 Articles: ${createdPosts.length}`);
    console.log(`💬 Commentaires: ${createdComments.length}`);

    console.log('\n🎯 Identifiants de test:');
    console.log('Tous les utilisateurs ont le mot de passe: password123');
    console.log('- admin@jblog.com (Admin)');
    console.log('- publisher@jblog.com (Publisher)');
    console.log('- moderator@jblog.com (Moderator)');
    console.log('- user1@jblog.com (User)');
    console.log('- user2@jblog.com (User)');

    console.log('\n✅ Données de test créées avec succès !');
    console.log('🚀 Vous pouvez maintenant exporter vos données avec: npm run export-data-nodejs');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
};

createTestData();
