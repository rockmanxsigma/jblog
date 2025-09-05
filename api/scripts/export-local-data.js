#!/usr/bin/env node

/**
 * Script d'export des données MongoDB locales
 * Utilise mongodump pour exporter toutes les collections
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const DB_NAME = 'jgazette';
const EXPORT_DIR = './mongodb-export';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

console.log('🚀 Début de l\'export des données MongoDB locales...');

try {
  // Créer le dossier d'export
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }

  const exportPath = path.join(EXPORT_DIR, `jgazette-export-${TIMESTAMP}`);

  console.log(`📁 Dossier d'export: ${exportPath}`);

  // Commande mongodump
  const command = `mongodump --db ${DB_NAME} --out ${exportPath}`;
  
  console.log('📤 Exécution de mongodump...');
  console.log(`Commande: ${command}`);
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('✅ Export terminé avec succès !');
  console.log(`📂 Données exportées dans: ${exportPath}`);
  
  // Lister les collections exportées
  const collectionsPath = path.join(exportPath, DB_NAME);
  if (fs.existsSync(collectionsPath)) {
    const collections = fs.readdirSync(collectionsPath);
    console.log('📋 Collections exportées:');
    collections.forEach(collection => {
      console.log(`  - ${collection}`);
    });
  }

  console.log('\n🎯 Prochaines étapes:');
  console.log('1. Configurez votre cluster MongoDB Atlas');
  console.log('2. Utilisez le script import-atlas-data.js pour importer les données');
  console.log('3. Mettez à jour vos variables d\'environnement');

} catch (error) {
  console.error('❌ Erreur lors de l\'export:', error.message);
  process.exit(1);
}
