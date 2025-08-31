import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware pour vérifier le token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte utilisateur désactivé'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été banni. Vous ne pouvez plus accéder à cette application.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification',
      error: error.message
    });
  }
};

// Middleware pour vérifier les permissions spécifiques
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      });
    }

    next();
  };
};

// Middleware pour vérifier le rôle admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  if (!req.user.isAdmin()) {
    return res.status(403).json({
      success: false,
      message: 'Accès administrateur requis'
    });
  }

  next();
};

// Middleware pour vérifier les permissions de publication
export const requirePublishPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  if (!req.user.canPublish()) {
    return res.status(403).json({
      success: false,
      message: 'Permissions de publication requises'
    });
  }

  next();
};

// Middleware pour vérifier les permissions de modération
export const requireModeratePermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  if (!req.user.canModerate()) {
    return res.status(403).json({
      success: false,
      message: 'Permissions de modération requises'
    });
  }

  next();
};

// Middleware optionnel pour récupérer l'utilisateur si connecté
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive && !user.isBanned) {
        req.user = user;
      }
    } catch (error) {
      // Token invalide ou expiré - on continue sans utilisateur
      console.debug('Token invalide dans optionalAuth:', error.message);
    }
  }
  
  next();
};

// Fonction utilitaire pour vérifier les permissions
export const hasPermission = (user, permission) => {
  if (!user) return false;
  return user.hasPermission ? user.hasPermission(permission) : false;
};
