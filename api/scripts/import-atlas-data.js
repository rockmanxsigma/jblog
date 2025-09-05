#!/usr/bin/env node

/**
 * Script d'import des données vers MongoDB Atlas
 * Utilise mongorestore pour importer les données exportées
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const EXPORT_DIR = './mongodb-export';
const DB_NAME = 'jgazette';

console.log('🚀 Début de l\'import des données vers MongoDB Atlas...');

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
    throw new Error('Aucun dossier d\'export trouvé. Exécutez d\'abord export-local-data.js');
  }

  const latestExport = exportFolders[0];
  const exportPath = path.join(EXPORT_DIR, latestExport, DB_NAME);

  console.log(`📁 Utilisation de l'export: ${latestExport}`);
  console.log(`📂 Chemin d'export: ${exportPath}`);

  if (!fs.existsSync(exportPath)) {
    throw new Error(`Le dossier d'export ${exportPath} n'existe pas`);
  }

  // Lister les collections à importer
  const collections = fs.readdirSync(exportPath);
  console.log('📋 Collections à importer:');
  collections.forEach(collection => {
    console.log(`  - ${collection}`);
  });

  // Commande mongorestore
  const command = `mongorestore --uri="${process.env.MONGODB_ATLAS_URI}" --db ${DB_NAME} ${exportPath}`;
  
  console.log('📤 Exécution de mongorestore...');
  console.log('⚠️  Attention: Cette opération va écraser les données existantes dans Atlas');
  
  // Demander confirmation
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise((resolve) => {
    rl.question('Voulez-vous continuer ? (y/N): ', resolve);
  });

  rl.close();

  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log('❌ Import annulé par l\'utilisateur');
    process.exit(0);
  }

  execSync(command, { stdio: 'inherit' });
  
  console.log('✅ Import terminé avec succès !');
  console.log('🎯 Vos données sont maintenant disponibles sur MongoDB Atlas');

} catch (error) {
  console.error('❌ Erreur lors de l\'import:', error.message);
  process.exit(1);
}
