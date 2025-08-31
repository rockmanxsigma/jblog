import User from '../models/User.js';

// Middleware pour vérifier si l'utilisateur a une permission spécifique
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      // Vérifier si l'utilisateur est banni
      if (req.user.isBanned) {
        return res.status(403).json({
          success: false,
          message: 'Votre compte a été banni'
        });
      }

      // Vérifier si l'utilisateur est actif
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Votre compte est désactivé'
        });
      }

      // Vérifier la permission
      if (!req.user.hasPermission(permission)) {
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes'
        });
      }

      next();
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

// Middleware pour vérifier si l'utilisateur peut créer des posts
const canCreatePost = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!req.user.canCreatePost()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de créer des articles'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions de création:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut modifier un post
const canEditPost = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!req.user.canEditPost()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de modifier des articles'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions de modification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut supprimer un post
const canDeletePost = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!req.user.canDeletePost()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de supprimer des articles'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions de suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut modérer les commentaires
const canModerateComments = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!req.user.canModerateComments()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de modérer les commentaires'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions de modération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut bannir d'autres utilisateurs
const canBanUsers = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!req.user.canBanUsers()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de bannir des utilisateurs'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions de bannissement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès administrateur requis'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des droits admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut accéder à une ressource
const canAccessResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      // Les admins ont accès à tout
      if (req.user.role === 'admin') {
        return next();
      }

      // Les modérateurs ont accès à la plupart des ressources
      if (req.user.role === 'moderator') {
        return next();
      }

      // Les éditeurs ont accès aux posts
      if (req.user.role === 'editor' && resourceType === 'post') {
        return next();
      }

      // Les utilisateurs normaux ont un accès limité
      if (req.user.role === 'user' && resourceType === 'comment') {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette ressource'
      });

    } catch (error) {
      console.error('Erreur lors de la vérification d\'accès à la ressource:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

// Middleware pour vérifier le taux de commentaires (anti-spam)
const checkCommentRate = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    // Vérifier le nombre de commentaires dans la dernière heure
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const Comment = (await import('../models/Comment.js')).default;
    
    const recentComments = await Comment.countDocuments({
      author: req.user._id,
      createdAt: { $gte: oneHourAgo }
    });

    // Limite : 5 commentaires par heure
    if (recentComments >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Trop de commentaires. Veuillez attendre avant de poster un nouveau commentaire.'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification du taux de commentaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut liker un post
const canLikePost = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!req.user.canLikePost()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de liker des articles'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions de like post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut liker un commentaire
const canLikeComment = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!req.user.canLikeComment()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de liker des commentaires'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions de like commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut créer un commentaire
const canCreateComment = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!req.user.canCreateComment()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de créer des commentaires'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions de création de commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut supprimer un commentaire
const canDeleteComment = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!req.user.canDeleteComment()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de supprimer des commentaires'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions de suppression de commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut gérer les utilisateurs (admin uniquement)
const canManageUsers = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès administrateur requis pour la gestion des utilisateurs'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions de gestion des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export {
  requirePermission,
  canCreatePost,
  canEditPost,
  canDeletePost,
  canModerateComments,
  canBanUsers,
  requireAdmin,
  canAccessResource,
  checkCommentRate,
  canLikePost,
  canLikeComment,
  canCreateComment,
  canDeleteComment,
  canManageUsers
};
