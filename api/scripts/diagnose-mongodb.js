#!/usr/bin/env node

/**
 * Script de diagnostic MongoDB
 * Teste différentes configurations de connexion
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

console.log('🔍 Diagnostic MongoDB - Test de connexion...');

const testConnections = async () => {
  const connectionTests = [
    {
      name: 'Connexion sans authentification',
      uri: 'mongodb://localhost:27017/jgazette'
    },
    {
      name: 'Connexion avec authentification (admin/password)',
      uri: 'mongodb://admin:password@localhost:27017/jgazette?authSource=admin'
    },
    {
      name: 'Connexion avec authentification (root/password)',
      uri: 'mongodb://root:password@localhost:27017/jgazette?authSource=admin'
    },
    {
      name: 'Connexion avec authentification (jgazette/password)',
      uri: 'mongodb://jgazette:password@localhost:27017/jgazette?authSource=jgazette'
    }
  ];

  for (const test of connectionTests) {
    try {
      console.log(`\n📡 Test: ${test.name}`);
      console.log(`URI: ${test.uri.replace(/\/\/.*@/, '//***:***@')}`); // Masquer les identifiants
      
      await mongoose.connect(test.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000
      });

      console.log('✅ Connexion réussie !');
      
      // Vérifier les collections
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      console.log(`📊 Base de données: ${db.databaseName}`);
      console.log(`📋 Collections (${collections.length}):`);
      
      if (collections.length === 0) {
        console.log('  ⚠️  Aucune collection trouvée');
      } else {
        for (const collection of collections) {
          const count = await db.collection(collection.name).countDocuments();
          console.log(`  - ${collection.name}: ${count} documents`);
        }
      }

      await mongoose.disconnect();
      console.log('🎯 Cette configuration fonctionne !');
      
      // Afficher la configuration à utiliser
      console.log('\n💡 Configuration recommandée pour .env:');
      console.log(`MONGODB_URI=${test.uri}`);
      
      return test.uri; // Retourner la première configuration qui fonctionne
      
    } catch (error) {
      console.log(`❌ Échec: ${error.message}`);
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        // Ignorer les erreurs de déconnexion
      }
    }
  }

  console.log('\n❌ Aucune configuration de connexion n\'a fonctionné');
  console.log('\n💡 Solutions possibles:');
  console.log('1. Vérifiez que MongoDB est démarré');
  console.log('2. Vérifiez vos identifiants MongoDB');
  console.log('3. Vérifiez la base de données d\'authentification (authSource)');
  console.log('4. Créez un utilisateur MongoDB si nécessaire');
  
  return null;
};

const createMongoUser = async () => {
  try {
    console.log('\n🔧 Tentative de création d\'utilisateur MongoDB...');
    
    // Connexion sans authentification (pour créer un utilisateur)
    await mongoose.connect('mongodb://localhost:27017/admin');
    
    const db = mongoose.connection.db;
    
    // Créer un utilisateur pour la base jgazette
    await db.command({
      createUser: 'jgazette',
      pwd: 'password',
      roles: [
        { role: 'readWrite', db: 'jgazette' }
      ]
    });
    
    console.log('✅ Utilisateur jgazette créé avec succès !');
    console.log('🔑 Identifiants: jgazette / password');
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.log(`❌ Erreur création utilisateur: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignorer les erreurs de déconnexion
    }
    return false;
  }
};

const main = async () => {
  console.log('🚀 Début du diagnostic MongoDB...');
  
  // Test des connexions
  const workingUri = await testConnections();
  
  if (!workingUri) {
    // Essayer de créer un utilisateur
    const userCreated = await createMongoUser();
    
    if (userCreated) {
      console.log('\n🔄 Retest après création d\'utilisateur...');
      await testConnections();
    }
  }
  
  console.log('\n📋 Instructions:');
  console.log('1. Copiez la configuration recommandée dans api/.env');
  console.log('2. Relancez: npm run check-data');
  console.log('3. Puis: npm run export-data-nodejs');
};

main().catch(console.error);
