#!/usr/bin/env node

/**
 * Script de vérification des données MongoDB locales
 * Vérifie si la base de données contient des données
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Charger les modèles Mongoose
import '../src/models/User.js';
import '../src/models/Post.js';
import '../src/models/Comment.js';

console.log('🔍 Vérification des données MongoDB locales...');

const checkData = async () => {
  try {
    // Connexion à MongoDB local
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette';
    console.log('📡 Connexion à MongoDB local:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion réussie !');

    // Vérifier la base de données
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 Base de données: ${dbName}`);

    // Lister toutes les collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Collections trouvées (${collections.length}):`);
    
    if (collections.length === 0) {
      console.log('⚠️  Aucune collection trouvée dans la base de données');
      console.log('💡 La base de données est vide ou n\'existe pas');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  - ${collection.name}: ${count} documents`);
      }
    }

    // Vérifier spécifiquement nos modèles
    console.log('\n🧪 Vérification des modèles Mongoose:');
    
    try {
      const User = mongoose.model('User');
      const Post = mongoose.model('Post');
      const Comment = mongoose.model('Comment');
      
      const userCount = await User.countDocuments();
      const postCount = await Post.countDocuments();
      const commentCount = await Comment.countDocuments();
      
      console.log(`👥 Utilisateurs: ${userCount}`);
      console.log(`📝 Articles: ${postCount}`);
      console.log(`💬 Commentaires: ${commentCount}`);
      
      if (userCount === 0 && postCount === 0 && commentCount === 0) {
        console.log('\n⚠️  Aucune donnée trouvée dans les modèles principaux');
        console.log('💡 Solutions possibles:');
        console.log('  1. Vérifiez que MongoDB local est démarré');
        console.log('  2. Vérifiez le nom de la base de données dans MONGODB_URI');
        console.log('  3. Créez des données de test avec: npm run seed');
        console.log('  4. Créez un utilisateur admin avec: npm run create-users');
      }
      
    } catch (modelError) {
      console.log('❌ Erreur lors de la vérification des modèles:', modelError.message);
    }

    // Vérifier la connexion MongoDB
    console.log('\n🔌 Informations de connexion:');
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Port: ${mongoose.connection.port}`);
    console.log(`État: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté'}`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB local n\'est pas démarré');
      console.log('Solutions:');
      console.log('1. Démarrez MongoDB local');
      console.log('2. Vérifiez que MongoDB écoute sur le port 27017');
      console.log('3. Vérifiez la configuration dans MONGODB_URI');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Problème d\'authentification MongoDB');
      console.log('Vérifiez vos identifiants dans MONGODB_URI');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
};

checkData();
