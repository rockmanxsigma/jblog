#!/usr/bin/env node

/**
 * Script d'import des données vers MongoDB Atlas utilisant Node.js/Mongoose
 * Alternative à mongorestore qui ne nécessite pas les MongoDB Database Tools
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

console.log('🚀 Début de l\'import des données vers MongoDB Atlas (Node.js)...');

const importData = async () => {
  try {
    // Vérifier que MONGODB_ATLAS_URI est définie
    if (!process.env.MONGODB_ATLAS_URI) {
      throw new Error('MONGODB_ATLAS_URI n\'est pas définie dans les variables d\'environnement');
    }

    // Trouver le dossier d'export le plus récent
    const exportFolders = fs.readdirSync(EXPORT_DIR)
      .filter(folder => folder.startsWith('jgazette-export-'))
      .sort()
      .reverse();

    if (exportFolders.length === 0) {
      throw new Error('Aucun dossier d\'export trouvé. Exécutez d\'abord export-data-nodejs.js');
    }

    const latestExport = exportFolders[0];
    const exportPath = path.join(EXPORT_DIR, latestExport);

    console.log(`📁 Utilisation de l'export: ${latestExport}`);
    console.log(`📂 Chemin d'export: ${exportPath}`);

    if (!fs.existsSync(exportPath)) {
      throw new Error(`Le dossier d'export ${exportPath} n'existe pas`);
    }

    // Lire les métadonnées
    const metadataPath = path.join(exportPath, 'metadata.json');
    let metadata = {};
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      console.log(`📅 Export original: ${metadata.exportDate}`);
      console.log(`📊 Documents à importer: ${metadata.totalDocuments}`);
    }

    // Connexion à MongoDB Atlas
    console.log('📡 Connexion à MongoDB Atlas...');
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Note: bufferMaxEntries et bufferCommands sont dépréciés dans Mongoose 6+
    };

    await mongoose.connect(process.env.MONGODB_ATLAS_URI, options);
    console.log('✅ Connexion Atlas réussie !');

    // Demander confirmation
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question('⚠️  Cette opération va écraser les données existantes dans Atlas. Continuer ? (y/N): ', resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Import annulé par l\'utilisateur');
      process.exit(0);
    }

    // Import des collections
    const collections = [
      { name: 'users', model: mongoose.model('User') },
      { name: 'posts', model: mongoose.model('Post') },
      { name: 'comments', model: mongoose.model('Comment') }
    ];

    const importResults = {};

    for (const collection of collections) {
      try {
        const filePath = path.join(exportPath, `${collection.name}.json`);
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  Fichier ${collection.name}.json non trouvé, ignoré`);
          importResults[collection.name] = 0;
          continue;
        }

        console.log(`📥 Import de la collection: ${collection.name}`);
        
        // Lire les données
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (data.length === 0) {
          console.log(`  ⚠️  Aucun document à importer dans ${collection.name}`);
          importResults[collection.name] = 0;
          continue;
        }

        // Vider la collection existante
        await collection.model.deleteMany({});
        console.log(`  🗑️  Collection ${collection.name} vidée`);

        // Insérer les nouveaux documents
        const result = await collection.model.insertMany(data);
        const count = result.length;
        
        importResults[collection.name] = count;
        console.log(`  ✅ ${count} documents importés dans ${collection.name}`);

      } catch (error) {
        console.error(`  ❌ Erreur lors de l'import de ${collection.name}:`, error.message);
        importResults[collection.name] = 0;
      }
    }

    // Créer un fichier de rapport d'import
    const importReport = {
      importDate: new Date().toISOString(),
      sourceExport: latestExport,
      collections: importResults,
      totalDocuments: Object.values(importResults).reduce((sum, count) => sum + count, 0)
    };

    const reportPath = path.join(exportPath, 'import-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(importReport, null, 2));

    console.log('\n📊 Résumé de l\'import:');
    console.log(`📅 Date d'import: ${importReport.importDate}`);
    console.log(`📂 Source: ${importReport.sourceExport}`);
    console.log(`📋 Total documents importés: ${importReport.totalDocuments}`);
    
    Object.entries(importResults).forEach(([collection, count]) => {
      console.log(`  - ${collection}: ${count} documents`);
    });

    console.log(`\n✅ Import terminé avec succès !`);
    console.log(`📄 Rapport d'import: ${reportPath}`);
    console.log('🎯 Vos données sont maintenant disponibles sur MongoDB Atlas');

  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
};

importData();
