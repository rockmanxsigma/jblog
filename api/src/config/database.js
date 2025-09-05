import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Priorité : MongoDB Atlas par défaut, fallback vers local
    const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette';
    
    console.log('Tentative de connexion à MongoDB...');
    console.log('Type de connexion:', process.env.MONGODB_ATLAS_URI ? 'Atlas (Cloud)' : 'Local');
    
    // Options de connexion
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Options supplémentaires pour Atlas
    if (process.env.MONGODB_ATLAS_URI) {
      options.maxPoolSize = 10;
      options.serverSelectionTimeoutMS = 5000;
      options.socketTimeoutMS = 45000;
      // Note: bufferMaxEntries et bufferCommands sont dépréciés dans Mongoose 6+
    }

    const conn = await mongoose.connect(mongoUri, options);
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;

