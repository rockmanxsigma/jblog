import Comment from '../models/Comment.js';
import User from '../models/User.js';

// Récupérer les commentaires en attente d'approbation
export const getPendingComments = async (req, res) => {
  try {

    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'asc' } = req.query;
    
    const query = { isApproved: false };
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const comments = await Comment.find(query)
      .populate('author', 'username profile.firstName profile.lastName role')
      .populate('post', 'title slug')
      .populate('parentComment', 'content author')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires en attente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Récupérer les commentaires signalés
export const getReportedComments = async (req, res) => {
  try {

    const { page = 1, limit = 20, status = 'pending' } = req.query;
    
    // Rechercher les commentaires qui ont au moins un signalement avec le statut spécifié
    const query = {
      'reports': { $exists: true, $ne: [] },
      $or: [
        { 'reports.status': status },
        { 'reports.status': { $exists: true } }
      ]
    };

    const comments = await Comment.find(query)
      .populate('author', 'username profile.firstName profile.lastName role')
      .populate('post', 'title slug')
      .populate('parentComment', 'content author.username')
      .populate('reports.reportedBy', 'username profile.firstName profile.lastName')
      .sort({ 'reports.reportedAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Filtrer les commentaires pour ne garder que ceux avec des signalements du statut demandé
    const filteredComments = comments.filter(comment => 
      comment.reports && comment.reports.some(report => report.status === status)
    );

    const total = await Comment.countDocuments({
      'reports': { $exists: true, $ne: [] }
    });

    res.json({
      success: true,
      data: filteredComments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires signalés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Approuver un commentaire
export const approveComment = async (req, res) => {
  try {

    const { commentId } = req.params;
    const moderatorId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    if (comment.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Ce commentaire est déjà approuvé'
      });
    }

    // Approuver le commentaire
    comment.approve(moderatorId);
    await comment.save();

    // Mettre à jour les statistiques de l'utilisateur
    const user = await User.findById(comment.author);
    if (user) {
      user.stats.commentsApproved = (user.stats.commentsApproved || 0) + 1;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Commentaire approuvé avec succès',
      data: {
        commentId: comment._id,
        isApproved: comment.isApproved,
        approvedBy: comment.approvedBy,
        approvedAt: comment.approvedAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'approbation du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Rejeter un commentaire
export const rejectComment = async (req, res) => {
  try {

    const { commentId } = req.params;
    const { reason } = req.body;
    const moderatorId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Une raison de rejet est requise'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    // Rejeter le commentaire
    comment.reject(moderatorId, reason);
    await comment.save();

    // Mettre à jour les statistiques de l'utilisateur
    const user = await User.findById(comment.author);
    if (user) {
      user.stats.commentsRejected = (user.stats.commentsRejected || 0) + 1;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Commentaire rejeté avec succès',
      data: {
        commentId: comment._id,
        isApproved: comment.isApproved,
        rejectionReason: comment.rejectionReason
      }
    });

  } catch (error) {
    console.error('Erreur lors du rejet du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Signaler un commentaire
export const reportComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason, description } = req.body;
    const reporterId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Une raison de signalement est requise'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    // Vérifier que l'utilisateur ne signale pas son propre commentaire
    if (comment.author.toString() === reporterId) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas signaler votre propre commentaire'
      });
    }

    // Ajouter le signalement
    comment.addReport(reporterId, reason, description);
    await comment.save();

    res.json({
      success: true,
      message: 'Commentaire signalé avec succès',
      data: {
        commentId: comment._id,
        reportCount: comment.reports.length
      }
    });

  } catch (error) {
    console.error('Erreur lors du signalement du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Résoudre un signalement
export const resolveReport = async (req, res) => {
  try {

    const { commentId, reportId } = req.params;
    const { action } = req.body; // 'resolve' ou 'dismiss'
    const moderatorId = req.user.id;

    if (!['resolve', 'dismiss'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action invalide. Utilisez "resolve" ou "dismiss"'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    // Résoudre le signalement
    comment.resolveReport(reportId, moderatorId, action);
    await comment.save();

    res.json({
      success: true,
      message: `Signalement ${action === 'resolve' ? 'résolu' : 'rejeté'} avec succès`,
      data: {
        commentId: comment._id,
        reportId: reportId,
        action: action
      }
    });

  } catch (error) {
    console.error('Erreur lors de la résolution du signalement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Statistiques de modération
export const getModerationStats = async (req, res) => {
  try {

    const [
      pendingCount,
      reportedCount,
      approvedToday,
      rejectedToday
    ] = await Promise.all([
      Comment.countDocuments({ isApproved: false }),
      Comment.countDocuments({ 'reports.status': 'pending' }),
      Comment.countDocuments({
        isApproved: true,
        approvedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      Comment.countDocuments({
        'moderationHistory.action': 'rejected',
        'moderationHistory.timestamp': { $gte: new Date().setHours(0, 0, 0, 0) }
      })
    ]);

    res.json({
      success: true,
      data: {
        pendingCount,
        reportedCount,
        approvedToday,
        rejectedToday,
        totalModerated: approvedToday + rejectedToday
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
