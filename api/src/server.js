import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import postRoutes from './routes/postRoutes.js';
import authRoutes from './routes/authRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import moderationRoutes from './routes/moderationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userManagementRoutes from './routes/userManagementRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Configuration des variables d'environnement
dotenv.config();

// Charger la configuration temporaire si pas de .env
if (!process.env.MONGODB_URI) {
  import('../config.js');
}

// Connexion à la base de données
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:5000"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"]
    }
  }
}));

// Middleware CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));

// Middleware pour servir les images uploadées (supprimé - on utilise l'endpoint API)
// app.use('/uploads', express.static('uploads'));



// Route pour servir les images avec CORS explicite
app.get('/images/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = `uploads/images/${filename}`;
  
  // Headers CORS explicites
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Déterminer le type MIME
  const ext = filename.split('.').pop()?.toLowerCase();
  let mimeType = 'image/jpeg';
  if (ext === 'png') mimeType = 'image/png';
  else if (ext === 'gif') mimeType = 'image/gif';
  else if (ext === 'webp') mimeType = 'image/webp';
  
  res.setHeader('Content-Type', mimeType);
  res.sendFile(filePath, { root: '.' });
});

// Route pour le favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content pour le favicon
});

// Route de santé pour les health checks Docker
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API JGazette - Healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Route de base
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API JGazette Blog',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: '/auth/register',
        login: '/auth/login',
        profile: '/auth/profile',
        logout: '/auth/logout'
      },
      posts: {
        list: '/posts',
        bySlug: '/posts/slug/:slug',
        byTag: '/posts/tag/:tag',
        create: '/posts (POST)',
        update: '/posts/:id (PUT)',
        delete: '/posts/:id (DELETE)'
      },
      comments: {
        byPost: '/comments/post/:postId',
        create: '/comments (POST)',
        update: '/comments/:id (PUT)',
        delete: '/comments/:id (DELETE)',
        like: '/comments/like (POST)'
      },
      moderation: {
        pending: '/moderation/comments/pending',
        reported: '/moderation/comments/reported',
        approve: '/moderation/comments/:id/approve (POST)',
        reject: '/moderation/comments/:id/reject (POST)',
        report: '/moderation/comments/:id/report (POST)',
        resolveReport: '/moderation/comments/:id/reports/:reportId/resolve (POST)',
        stats: '/moderation/stats'
      },
      upload: {
        image: '/upload/image (POST)',
        deleteImage: '/upload/image/:filename (DELETE)'
      }
    }
  });
});

// Routes API
app.use('/auth', authRoutes);
app.use('/', postRoutes);
app.use('/comments', commentRoutes);
app.use('/moderation', moderationRoutes);
app.use('/upload', uploadRoutes);
app.use('/admin/users', userManagementRoutes);

// Middleware pour les routes non trouvées
app.use(notFound);

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📝 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu, arrêt gracieux du serveur');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT reçu, arrêt gracieux du serveur');
  process.exit(0);
});

