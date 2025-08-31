import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Configuration du serveur
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuration MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette',
  
  // Configuration CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200'
};

