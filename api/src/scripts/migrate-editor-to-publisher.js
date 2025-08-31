import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

async function migrateEditorToPublisher() {
  try {
    console.log('🔄 Début de la migration des rôles editor → publisher...');
    
    // Connexion à la base de données
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette';
    await mongoose.connect(mongoURI);
    console.log('✅ Connecté à MongoDB');
    
    // Rechercher tous les utilisateurs avec le rôle 'editor'
    const usersWithEditorRole = await User.find({ role: 'editor' });
    console.log(`📊 Trouvé ${usersWithEditorRole.length} utilisateur(s) avec le rôle 'editor'`);
    
    if (usersWithEditorRole.length === 0) {
      console.log('✅ Aucun utilisateur à migrer');
      return;
    }
    
    // Afficher les utilisateurs qui vont être migrés
    console.log('👥 Utilisateurs à migrer :');
    usersWithEditorRole.forEach(user => {
      console.log(`  - ${user.username} (${user.email})`);
    });
    
    // Mettre à jour tous les utilisateurs avec le rôle 'editor' vers 'publisher'
    const updateResult = await User.updateMany(
      { role: 'editor' },
      { role: 'publisher' }
    );
    
    console.log(`✅ Migration terminée : ${updateResult.modifiedCount} utilisateur(s) mis à jour`);
    
    // Vérifier que la migration s'est bien passée
    const remainingEditorUsers = await User.find({ role: 'editor' });
    console.log(`🔍 Vérification : ${remainingEditorUsers.length} utilisateur(s) avec le rôle 'editor' restant(s)`);
    
    if (remainingEditorUsers.length === 0) {
      console.log('🎉 Migration réussie ! Tous les rôles "editor" ont été changés en "publisher"');
    } else {
      console.log('⚠️  Attention : Il reste des utilisateurs avec le rôle "editor"');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    // Fermer la connexion
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter la migration
migrateEditorToPublisher();
