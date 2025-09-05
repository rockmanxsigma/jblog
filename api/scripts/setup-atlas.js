#!/usr/bin/env node

/**
 * Script de configuration interactive MongoDB Atlas
 * Aide à configurer la connexion Atlas
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

console.log('🚀 Configuration MongoDB Atlas - Assistant de configuration');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const setupAtlas = async () => {
  try {
    console.log('\n📋 Instructions MongoDB Atlas:');
    console.log('1. Allez sur https://cloud.mongodb.com');
    console.log('2. Créez un cluster gratuit M0');
    console.log('3. Créez un utilisateur de base de données');
    console.log('4. Configurez l\'accès réseau (0.0.0.0/0)');
    console.log('5. Obtenez votre chaîne de connexion');
    
    console.log('\n🔧 Configuration de la connexion:');
    
    const username = await question('Nom d\'utilisateur Atlas: ');
    const password = await question('Mot de passe Atlas: ');
    const clusterUrl = await question('URL du cluster (ex: cluster.abc123.mongodb.net): ');
    const database = await question('Nom de la base de données [jgazette]: ') || 'jgazette';
    
    // Construire l'URI Atlas
    const atlasUri = `mongodb+srv://${username}:${password}@${clusterUrl}/${database}?retryWrites=true&w=majority`;
    
    console.log('\n📝 Configuration générée:');
    console.log(`MONGODB_ATLAS_URI=${atlasUri}`);
    
    // Lire le fichier .env existant ou créer un nouveau
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('\n📄 Fichier .env existant trouvé');
    } else {
      console.log('\n📄 Création d\'un nouveau fichier .env');
      envContent = `# Configuration MongoDB locale
MONGODB_URI=mongodb://admin:password@localhost:27017/jgazette?authSource=admin

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Configuration CORS
CORS_ORIGIN=http://localhost:80

# Configuration Uploads
UPLOAD_PATH=./uploads
`;
    }
    
    // Ajouter ou mettre à jour MONGODB_ATLAS_URI
    if (envContent.includes('MONGODB_ATLAS_URI=')) {
      envContent = envContent.replace(
        /MONGODB_ATLAS_URI=.*/,
        `MONGODB_ATLAS_URI=${atlasUri}`
      );
      console.log('✅ MONGODB_ATLAS_URI mise à jour');
    } else {
      envContent += `\n# Configuration MongoDB Atlas\nMONGODB_ATLAS_URI=${atlasUri}\n`;
      console.log('✅ MONGODB_ATLAS_URI ajoutée');
    }
    
    // Écrire le fichier .env
    fs.writeFileSync(envPath, envContent);
    console.log(`📁 Fichier .env sauvegardé: ${envPath}`);
    
    console.log('\n🧪 Test de la connexion Atlas...');
    
    // Test de connexion
    const { default: mongoose } = await import('mongoose');
    
    try {
      await mongoose.connect(atlasUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        // Note: bufferMaxEntries et bufferCommands sont dépréciés dans Mongoose 6+
      });
      
      console.log('✅ Connexion Atlas réussie !');
      console.log(`🌐 Host: ${mongoose.connection.host}`);
      console.log(`📊 Base de données: ${mongoose.connection.name}`);
      
      await mongoose.disconnect();
      
      console.log('\n🎯 Configuration terminée !');
      console.log('🚀 Vous pouvez maintenant:');
      console.log('  1. npm run test-atlas (pour vérifier)');
      console.log('  2. npm run import-atlas-nodejs (pour importer vos données)');
      
    } catch (error) {
      console.log(`❌ Erreur de connexion: ${error.message}`);
      
      if (error.message.includes('authentication')) {
        console.log('\n💡 Vérifiez vos identifiants:');
        console.log('  - Nom d\'utilisateur');
        console.log('  - Mot de passe');
        console.log('  - URL du cluster');
      }
      
      if (error.message.includes('network')) {
        console.log('\n💡 Vérifiez votre configuration réseau:');
        console.log('  - Ajoutez votre IP dans MongoDB Atlas Network Access');
        console.log('  - Ou utilisez 0.0.0.0/0 pour toutes les IPs');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
  } finally {
    rl.close();
  }
};

setupAtlas();
