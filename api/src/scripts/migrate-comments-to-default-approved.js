import mongoose from 'mongoose';
import { config } from 'dotenv';
import Comment from '../models/Comment.js';

// Charger les variables d'environnement
config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

// Migration des commentaires existants
const migrateComments = async () => {
  try {
    console.log('\n🔄 Migration des commentaires vers l\'approbation par défaut...');
    
    // Compter les commentaires non approuvés
    const unapprovedCount = await Comment.countDocuments({ isApproved: false });
    console.log(`📊 Commentaires non approuvés trouvés: ${unapprovedCount}`);
    
    if (unapprovedCount === 0) {
      console.log('✅ Aucun commentaire à migrer');
      return;
    }
    
    // Mettre à jour tous les commentaires non approuvés
    const result = await Comment.updateMany(
      { isApproved: false },
      { 
        $set: { 
          isApproved: true,
          approvedAt: new Date()
        },
        $unset: { approvedBy: "" } // Supprimer approvedBy s'il existe
      }
    );
    
    console.log(`✅ ${result.modifiedCount} commentaires migrés avec succès`);
    
    // Vérifier le résultat
    const remainingUnapproved = await Comment.countDocuments({ isApproved: false });
    console.log(`📊 Commentaires non approuvés restants: ${remainingUnapproved}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
};

// Fonction principale
const main = async () => {
  await connectDB();
  await migrateComments();
  
  console.log('\n🏁 Migration terminée');
  process.exit(0);
};

// Gestion des erreurs
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});

// Lancer la migration
main();
