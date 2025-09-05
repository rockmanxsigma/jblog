#!/usr/bin/env node

/**
 * Script pour basculer entre MongoDB local et Atlas
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const switchDatabase = async () => {
  try {
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ Fichier .env non trouvé');
      return;
    }

    let envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('🔄 Basculement de base de données');
    console.log('\nOptions disponibles:');
    console.log('1. Atlas (Cloud) - Production');
    console.log('2. Local - Développement');
    console.log('3. Afficher la configuration actuelle');
    
    const choice = await question('\nVotre choix (1-3): ');
    
    switch (choice) {
      case '1':
        // Activer Atlas, désactiver local
        envContent = envContent.replace(/^MONGODB_URI=.*$/m, '# MONGODB_URI=mongodb://admin:password@localhost:27017/jgazette?authSource=admin');
        
        if (!envContent.includes('MONGODB_ATLAS_URI=')) {
          console.log('❌ MONGODB_ATLAS_URI non configurée');
          console.log('💡 Utilisez: npm run setup-atlas');
          return;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Configuration basculée vers Atlas (Cloud)');
        console.log('🚀 Redémarrez l\'API pour appliquer les changements');
        break;
        
      case '2':
        // Activer local, désactiver Atlas
        envContent = envContent.replace(/^# MONGODB_URI=.*$/m, 'MONGODB_URI=mongodb://admin:password@localhost:27017/jgazette?authSource=admin');
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Configuration basculée vers MongoDB local');
        console.log('🚀 Redémarrez l\'API pour appliquer les changements');
        break;
        
      case '3':
        // Afficher la configuration
        console.log('\n📋 Configuration actuelle:');
        const lines = envContent.split('\n');
        lines.forEach(line => {
          if (line.includes('MONGODB_') && !line.startsWith('#')) {
            console.log(`✅ ${line}`);
          } else if (line.includes('MONGODB_') && line.startsWith('#')) {
            console.log(`❌ ${line}`);
          }
        });
        break;
        
      default:
        console.log('❌ Choix invalide');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    rl.close();
  }
};

switchDatabase();
