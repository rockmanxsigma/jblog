import mongoose from 'mongoose';

/**
 * Configuration pour MongoDB Atlas
 * Remplace la configuration locale par défaut
 */
const connectToAtlas = async () => {
  try {
    // URI de connexion MongoDB Atlas
    const atlasUri = process.env.MONGODB_ATLAS_URI;
    
    if (!atlasUri) {
      throw new Error('MONGODB_ATLAS_URI n\'est pas définie dans les variables d\'environnement');
    }

    console.log('Tentative de connexion à MongoDB Atlas...');
    
    // Options de connexion optimisées pour Atlas
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintenir jusqu'à 10 connexions socket
      serverSelectionTimeoutMS: 5000, // Garder en vie 5 secondes
      socketTimeoutMS: 45000, // Fermer les sockets après 45 secondes d'inactivité
      // Note: bufferMaxEntries et bufferCommands sont dépréciés dans Mongoose 6+
    };

    const conn = await mongoose.connect(atlasUri, options);
    console.log(`✅ MongoDB Atlas connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

export default connectToAtlas;
