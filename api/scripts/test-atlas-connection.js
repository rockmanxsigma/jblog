#!/usr/bin/env node

/**
 * Script de test de connexion MongoDB Atlas
 * Vérifie que la connexion fonctionne et liste les collections
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const testAtlasConnection = async () => {
  try {
    console.log('🔍 Test de connexion MongoDB Atlas...');

    if (!process.env.MONGODB_ATLAS_URI) {
      throw new Error('MONGODB_ATLAS_URI n\'est pas définie dans les variables d\'environnement');
    }

    console.log('📡 Tentative de connexion...');
    
    // Options de connexion
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Note: bufferMaxEntries et bufferCommands sont dépréciés dans Mongoose 6+
    };

    const conn = await mongoose.connect(process.env.MONGODB_ATLAS_URI, options);
    
    console.log('✅ Connexion réussie !');
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    console.log(`🔗 État: ${conn.connection.readyState === 1 ? 'Connecté' : 'Déconnecté'}`);

    // Lister les collections
    const collections = await conn.connection.db.listCollections().toArray();
    
    if (collections.length > 0) {
      console.log('\n📋 Collections trouvées:');
      for (const collection of collections) {
        const count = await conn.connection.db.collection(collection.name).countDocuments();
        console.log(`  - ${collection.name}: ${count} documents`);
      }
    } else {
      console.log('\n📋 Aucune collection trouvée (base de données vide)');
    }

    // Test des modèles principaux
    console.log('\n🧪 Test des modèles...');
    
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
      
    } catch (modelError) {
      console.log('⚠️  Modèles non encore chargés (normal si pas de données)');
    }

    await mongoose.disconnect();
    console.log('\n🎯 Test terminé avec succès !');
    console.log('🚀 Votre application peut maintenant utiliser MongoDB Atlas');

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Vérifiez vos identifiants MongoDB Atlas:');
      console.log('  - Nom d\'utilisateur');
      console.log('  - Mot de passe');
      console.log('  - URL du cluster');
    }
    
    if (error.message.includes('network')) {
      console.log('\n💡 Vérifiez votre configuration réseau:');
      console.log('  - Ajoutez votre IP dans MongoDB Atlas Network Access');
      console.log('  - Ou utilisez 0.0.0.0/0 pour toutes les IPs (moins sécurisé)');
    }
    
    process.exit(1);
  }
};

// Charger les modèles Mongoose
import '../src/models/User.js';
import '../src/models/Post.js';
import '../src/models/Comment.js';

testAtlasConnection();
