#!/usr/bin/env node

/**
 * Script d'export des données MongoDB utilisant Node.js/Mongoose
 * Alternative à mongodump qui ne nécessite pas les MongoDB Database Tools
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Charger les modèles Mongoose
import '../src/models/User.js';
import '../src/models/Post.js';
import '../src/models/Comment.js';

const EXPORT_DIR = './mongodb-export';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

console.log('🚀 Début de l\'export des données MongoDB (Node.js)...');

const exportData = async () => {
  try {
    // Connexion à MongoDB local
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette';
    console.log('📡 Connexion à MongoDB local:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion réussie !');

    // Créer le dossier d'export
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }

    const exportPath = path.join(EXPORT_DIR, `jgazette-export-${TIMESTAMP}`);
    fs.mkdirSync(exportPath, { recursive: true });

    console.log(`📁 Dossier d'export: ${exportPath}`);

    // Export des collections
    const collections = [
      { name: 'users', model: mongoose.model('User') },
      { name: 'posts', model: mongoose.model('Post') },
      { name: 'comments', model: mongoose.model('Comment') }
    ];

    const exportResults = {};

    for (const collection of collections) {
      try {
        console.log(`📤 Export de la collection: ${collection.name}`);
        
        const documents = await collection.model.find({}).lean();
        const count = documents.length;
        
        if (count > 0) {
          const filePath = path.join(exportPath, `${collection.name}.json`);
          fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
          
          exportResults[collection.name] = count;
          console.log(`  ✅ ${count} documents exportés vers ${filePath}`);
        } else {
          console.log(`  ⚠️  Aucun document dans ${collection.name}`);
          exportResults[collection.name] = 0;
        }
      } catch (error) {
        console.error(`  ❌ Erreur lors de l'export de ${collection.name}:`, error.message);
        exportResults[collection.name] = 0;
      }
    }

    // Créer un fichier de métadonnées
    const metadata = {
      exportDate: new Date().toISOString(),
      database: mongoose.connection.name,
      collections: exportResults,
      totalDocuments: Object.values(exportResults).reduce((sum, count) => sum + count, 0)
    };

    const metadataPath = path.join(exportPath, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log('\n📊 Résumé de l\'export:');
    console.log(`📅 Date: ${metadata.exportDate}`);
    console.log(`📊 Base de données: ${metadata.database}`);
    console.log(`📋 Total documents: ${metadata.totalDocuments}`);
    
    Object.entries(exportResults).forEach(([collection, count]) => {
      console.log(`  - ${collection}: ${count} documents`);
    });

    console.log(`\n✅ Export terminé avec succès !`);
    console.log(`📂 Données exportées dans: ${exportPath}`);
    console.log(`📄 Métadonnées: ${metadataPath}`);

    console.log('\n🎯 Prochaines étapes:');
    console.log('1. Configurez votre cluster MongoDB Atlas');
    console.log('2. Utilisez le script import-atlas-data-nodejs.js pour importer les données');
    console.log('3. Mettez à jour vos variables d\'environnement');

  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
};

exportData();
