// Configuration temporaire pour l'API
// Les variables d'environnement sont définies par Docker Compose
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 5000;
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_tres_securise_ici_changez_le_en_production';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';
process.env.UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
