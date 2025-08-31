import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// Obtenir tous les utilisateurs (avec pagination et filtres)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construire la requête
    const query = {};
    
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'banned') query.isBanned = true;
    if (status === 'inactive') query.isActive = false;
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour le rôle d'un utilisateur
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Vérifier que le rôle est valide
    if (!Object.values(User.ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    // Empêcher de changer le rôle d'un admin (sauf par un autre admin)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les administrateurs peuvent changer les rôles'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher de changer le rôle du dernier admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer le dernier administrateur'
        });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `Rôle de l'utilisateur mis à jour vers ${role}`,
      data: user.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Bannir un utilisateur
const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { duration, reason } = req.body;
    const moderatorId = req.user._id;

    // Vérifier que la durée est valide
    const validDurations = ['30min', '1h', '2h', '6h', '12h', '1d', '3d', '7d', '10d', '30d', 'permanent'];
    if (!validDurations.includes(duration)) {
      return res.status(400).json({
        success: false,
        message: 'Durée de bannissement invalide'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher de bannir un admin (sauf par un autre admin)
    if (user.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les administrateurs peuvent bannir d\'autres administrateurs'
      });
    }

    // Empêcher de se bannir soi-même
    if (user._id.toString() === moderatorId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas vous bannir vous-même'
      });
    }

    await user.ban(duration, reason, moderatorId);

    res.json({
      success: true,
      message: `Utilisateur banni pour ${duration}`,
      data: {
        userId: user._id,
        username: user.username,
        banInfo: user.banInfo
      }
    });

  } catch (error) {
    console.error('Erreur lors du bannissement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Débannir un utilisateur
const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.isBanned) {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur n\'est pas banni'
      });
    }

    await user.unban();

    res.json({
      success: true,
      message: 'Utilisateur débanni avec succès',
      data: {
        userId: user._id,
        username: user.username,
        banInfo: user.banInfo
      }
    });

  } catch (error) {
    console.error('Erreur lors du débannissement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Désactiver/activer un utilisateur
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'activate' ou 'deactivate'
    const adminId = req.user._id;

    if (!['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action invalide'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher de désactiver un admin (sauf par un autre admin)
    if (user.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les administrateurs peuvent désactiver d\'autres administrateurs'
      });
    }

    // Empêcher de se désactiver soi-même
    if (user._id.toString() === adminId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas vous désactiver vous-même'
      });
    }

    user.isActive = action === 'activate';
    await user.save();

    res.json({
      success: true,
      message: `Utilisateur ${action === 'activate' ? 'activé' : 'désactivé'} avec succès`,
      data: {
        userId: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir les statistiques d'un utilisateur
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('username stats');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Compter les commentaires et posts de l'utilisateur
    const commentsCount = await Comment.countDocuments({ author: userId });
    const postsCount = await Post.countDocuments({ author: userId });

    // Statistiques des likes reçus sur les commentaires
    const comments = await Comment.find({ author: userId });
    const totalLikes = comments.reduce((sum, comment) => sum + comment.likes.length, 0);
    const totalDislikes = comments.reduce((sum, comment) => sum + comment.dislikes.length, 0);

    const stats = {
      ...user.stats.toObject(),
      actualCommentsCount: commentsCount,
      actualPostsCount: postsCount,
      totalLikes,
      totalDislikes,
      averageLikesPerComment: commentsCount > 0 ? (totalLikes / commentsCount).toFixed(2) : 0
    };

    res.json({
      success: true,
      data: {
        username: user.username,
        stats
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir les utilisateurs bannis
const getBannedUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bannedUsers = await User.findBannedUsers()
      .select('-password')
      .populate('banInfo.bannedBy', 'username')
      .sort({ 'banInfo.bannedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ 'banInfo.isBanned': true });

    res.json({
      success: true,
      data: bannedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBannedUsers: total,
        hasNext: skip + bannedUsers.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs bannis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Nettoyer les bannissements expirés
const cleanupExpiredBans = async (req, res) => {
  try {
    const now = new Date();
    
    // Trouver tous les utilisateurs avec des bannissements expirés
    const expiredBans = await User.find({
      'banInfo.isBanned': true,
      'banInfo.bannedUntil': { $lt: now }
    });

    let cleanedCount = 0;
    for (const user of expiredBans) {
      await user.unban();
      cleanedCount++;
    }

    res.json({
      success: true,
      message: `${cleanedCount} bannissements expirés ont été nettoyés`,
      data: { cleanedCount }
    });

  } catch (error) {
    console.error('Erreur lors du nettoyage des bannissements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Fonctions utilitaires pour la validation
const validateUserExists = (user) => {
  if (!user) {
    return {
      isValid: false,
      status: 404,
      message: 'Utilisateur non trouvé'
    };
  }
  return { isValid: true };
};

const validateAdminPermissions = (user, currentUser) => {
  if (user.role === 'admin' && currentUser.role !== 'admin') {
    return {
      isValid: false,
      status: 403,
      message: 'Seuls les administrateurs peuvent modifier d\'autres administrateurs'
    };
  }
  return { isValid: true };
};

const validateSelfModification = (user, adminId, updates) => {
  const isSelfModification = user._id.toString() === adminId.toString();
  const restrictedFields = ['role', 'isActive', 'isBanned'];
  const hasRestrictedUpdates = restrictedFields.some(field => updates[field] !== undefined);
  
  if (isSelfModification && hasRestrictedUpdates) {
    return {
      isValid: false,
      status: 400,
      message: 'Vous ne pouvez pas modifier votre propre rôle ou statut'
    };
  }
  return { isValid: true };
};

const validateRole = (role) => {
  if (role && !Object.values(User.ROLES).includes(role)) {
    return {
      isValid: false,
      status: 400,
      message: 'Rôle invalide'
    };
  }
  return { isValid: true };
};

const validateLastAdmin = async (user, newRole) => {
  if (newRole && user.role === 'admin' && newRole !== 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return {
        isValid: false,
        status: 400,
        message: 'Impossible de supprimer le dernier administrateur'
      };
    }
  }
  return { isValid: true };
};

const validateEmailUniqueness = async (email, userId) => {
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return {
        isValid: false,
        status: 400,
        message: 'Cet email est déjà utilisé par un autre utilisateur'
      };
    }
  }
  return { isValid: true };
};

const validateUsernameUniqueness = async (username, userId) => {
  if (username) {
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      return {
        isValid: false,
        status: 400,
        message: 'Ce nom d\'utilisateur est déjà utilisé'
      };
    }
  }
  return { isValid: true };
};

const applyUserUpdates = async (user, updates, adminId) => {
  const { username, email, role, isActive, isBanned, profile } = updates;
  
  // Mise à jour des champs de base
  if (username !== undefined) user.username = username;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  
  // Gestion du bannissement
  if (isBanned !== undefined) {
    if (isBanned && !user.isBanned) {
      await user.ban('permanent', 'Banni par un administrateur', adminId);
    } else if (!isBanned && user.isBanned) {
      await user.unban();
    }
  }
  
  // Mise à jour du profil
  if (profile !== undefined) {
    user.profile = { ...user.profile, ...profile };
  }
  
  await user.save();
  return user;
};

// Mettre à jour un utilisateur (fonction générique)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const adminId = req.user._id;

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    
    // Validations en cascade
    const validations = [
      validateUserExists(user),
      validateAdminPermissions(user, req.user),
      validateSelfModification(user, adminId, updates),
      validateRole(updates.role),
      await validateLastAdmin(user, updates.role),
      await validateEmailUniqueness(updates.email, userId),
      await validateUsernameUniqueness(updates.username, userId)
    ];

    // Vérifier si toutes les validations sont passées
    for (const validation of validations) {
      if (!validation.isValid) {
        return res.status(validation.status).json({
          success: false,
          message: validation.message
        });
      }
    }

    // Appliquer les mises à jour
    const updatedUser = await applyUserUpdates(user, updates, adminId);

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher de supprimer un admin (sauf par un autre admin)
    if (user.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer un administrateur'
      });
    }

    // Empêcher de se supprimer soi-même
    if (user._id.toString() === adminId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir les statistiques globales des utilisateurs
const getGlobalUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true, isBanned: false });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    // Nouveaux utilisateurs (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersLast7Days = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Utilisateurs par rôle
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleStats = {
      user: 0,
      moderator: 0,
      publisher: 0,
      admin: 0
    };

    usersByRole.forEach(role => {
      roleStats[role._id] = role.count;
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        bannedUsers,
        newUsersLast7Days,
        usersByRole: roleStats
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUser,
  banUser,
  unbanUser,
  toggleUserStatus,
  getUserStats,
  getGlobalUserStats,
  getBannedUsers,
  cleanupExpiredBans,
  deleteUser
};
