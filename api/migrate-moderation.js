import mongoose from 'mongoose';
import '../config.js';

// Connexion à la base de données
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette');
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
}

// Migration simple pour ajouter les champs de modération
async function migrateModeration() {
  try {
    console.log('🚀 Début de la migration de la modération...');
    
    // Récupérer le modèle Comment
    const Comment = mongoose.model('Comment');
    
    // Mettre à jour tous les commentaires existants
    const updateResult = await Comment.updateMany(
      { isApproved: { $exists: false } },
      { 
        $set: { 
          isApproved: true,
          approvedAt: new Date()
        }
      }
    );
    
    console.log(`✅ ${updateResult.modifiedCount} commentaires mis à jour`);
    console.log('🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Exécuter la migration
connectDB().then(migrateModeration);
