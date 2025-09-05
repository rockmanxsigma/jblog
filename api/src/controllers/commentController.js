import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

// Récupérer tous les commentaires d'un post
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { sort = 'newest', page = 1, limit = 20 } = req.query;

    // Vérifier que le post existe
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    // Construire la requête
    const query = { 
      post: postId, 
      parentComment: null, // Seulement les commentaires parents
      isApproved: true 
    };

    // Options de tri
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'likes':
        sortOption = { 'likesCount': -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Récupérer les commentaires avec pagination
    const comments = await Comment.find(query)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate({
        path: 'replies',
        match: { isApproved: true },
        populate: [
          { path: 'author', select: 'username profile.firstName profile.lastName profile.avatar' },
          {
            path: 'replies',
            match: { isApproved: true },
            populate: { path: 'author', select: 'username profile.firstName profile.lastName profile.avatar' }
          }
        ]
      })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Compter le total de commentaires
    const totalComments = await Comment.countDocuments(query);

    res.json({
      success: true,
      message: 'Commentaires récupérés avec succès',
      data: comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / parseInt(limit)),
        totalComments,
        hasNext: skip + comments.length < totalComments,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Créer un nouveau commentaire
export const createComment = async (req, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;
    const userId = req.user._id;

    // Validation des données
    const validationError = validateCommentData(content);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Vérifier l'utilisateur et le cooldown
    const cooldownError = await checkUserCooldown(userId);
    if (cooldownError) {
      return res.status(429).json(cooldownError);
    }

    // Vérifier les références (post et commentaire parent)
    const referenceError = await validateReferences(postId, parentCommentId);
    if (referenceError) {
      return res.status(404).json(referenceError);
    }

    // Créer et sauvegarder le commentaire
    const newComment = await createAndSaveComment(content, userId, postId, parentCommentId);

    // Mettre à jour le commentaire parent si nécessaire
    if (parentCommentId) {
      await updateParentComment(parentCommentId, newComment._id);
    }

    // Récupérer le commentaire avec les données populées
    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      success: true,
      message: 'Commentaire créé et affiché avec succès',
      data: populatedComment
    });

  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Valide les données du commentaire
 */
const validateCommentData = (content) => {
  if (!content || !content.trim()) {
    return {
      success: false,
      message: 'Le contenu du commentaire est requis'
    };
  }

  if (content.length > 1000) {
    return {
      success: false,
      message: 'Le commentaire ne peut pas dépasser 1000 caractères'
    };
  }

  return null;
};

/**
 * Vérifie le cooldown de l'utilisateur
 */
const checkUserCooldown = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return {
      success: false,
      message: 'Utilisateur non trouvé'
    };
  }

  const timeLimitMinutes = getTimeLimitByRole(user.role);
  const lastComment = await Comment.findOne({ author: userId })
    .sort({ createdAt: -1 })
    .limit(1);

  if (lastComment) {
    const timeSinceLastComment = Date.now() - new Date(lastComment.createdAt).getTime();
    const timeLimitMs = timeLimitMinutes * 60 * 1000;

    if (timeSinceLastComment < timeLimitMs) {
      const remainingSeconds = Math.ceil((timeLimitMs - timeSinceLastComment) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      
      return {
        success: false,
        message: `Veuillez attendre ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} avant de poster un nouveau commentaire`,
        remainingTime: remainingSeconds,
        timeLimit: timeLimitMinutes
      };
    }
  }

  return null;
};

/**
 * Obtient la limite de temps selon le rôle
 */
const getTimeLimitByRole = (role) => {
  const timeLimits = {
    user: 5,
    moderator: 2,
    publisher: 1,
    admin: 1
  };
  return timeLimits[role] || 5;
};

/**
 * Valide les références (post et commentaire parent)
 */
const validateReferences = async (postId, parentCommentId) => {
  const post = await Post.findById(postId);
  if (!post) {
    return {
      success: false,
      message: 'Post non trouvé'
    };
  }

  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return {
        success: false,
        message: 'Commentaire parent non trouvé'
      };
    }
  }

  return null;
};

/**
 * Crée et sauvegarde un nouveau commentaire
 */
const createAndSaveComment = async (content, userId, postId, parentCommentId) => {
  const newComment = new Comment({
    content: content.trim(),
    author: userId,
    post: postId,
    parentComment: parentCommentId || null
  });

  await newComment.save();
  return newComment;
};

/**
 * Met à jour le commentaire parent avec la nouvelle réponse
 */
const updateParentComment = async (parentCommentId, newCommentId) => {
  await Comment.findByIdAndUpdate(parentCommentId, {
    $push: { replies: newCommentId }
  });
};

// Mettre à jour un commentaire
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Validation des données
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu du commentaire est requis'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Le commentaire ne peut pas dépasser 1000 caractères'
      });
    }

    // Récupérer le commentaire
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    // Vérifier les permissions
    const user = await User.findById(userId);
    if (comment.author.toString() !== userId.toString() && 
        !['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de modifier ce commentaire'
      });
    }

    // Mettre à jour le commentaire
    comment.content = content.trim();
    comment.isEdited = true;
    await comment.save();

    // Récupérer le commentaire mis à jour avec les données populées
    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar');

    res.json({
      success: true,
      message: 'Commentaire mis à jour avec succès',
      data: updatedComment
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Supprimer un commentaire
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    // Récupérer le commentaire
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    // Vérifier les permissions
    const user = await User.findById(userId);
    if (comment.author.toString() !== userId.toString() && 
        !['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de supprimer ce commentaire'
      });
    }

    // Supprimer le commentaire et ses réponses
    await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentComment: commentId }
      ]
    });

    // Si c'était une réponse, la retirer du commentaire parent
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId }
      });
    }

    res.json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Vérifier le cooldown pour les commentaires
export const checkCommentCooldown = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Limite de temps entre commentaires selon le rôle
    let timeLimitMinutes;
    switch (user.role) {
      case 'user':
        timeLimitMinutes = 5; // 5 minutes pour les utilisateurs normaux
        break;
      case 'moderator':
        timeLimitMinutes = 2; // 2 minutes pour les modérateurs
        break;
      case 'publisher':
      case 'admin':
        timeLimitMinutes = 1; // 1 minute pour les publishers et admins
        break;
      default:
        timeLimitMinutes = 5; // Par défaut, 5 minutes
    }

    // Vérifier le dernier commentaire de l'utilisateur
    const lastComment = await Comment.findOne({ author: userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (lastComment) {
      const timeSinceLastComment = Date.now() - new Date(lastComment.createdAt).getTime();
      const timeLimitMs = timeLimitMinutes * 60 * 1000;

      if (timeSinceLastComment < timeLimitMs) {
        const remainingSeconds = Math.ceil((timeLimitMs - timeSinceLastComment) / 1000);
        const remainingMinutes = Math.ceil(remainingSeconds / 60);
        
        return res.json({
          success: true,
          canComment: false,
          remainingTime: remainingSeconds,
          remainingMinutes: remainingMinutes,
          timeLimit: timeLimitMinutes,
          lastCommentAt: lastComment.createdAt,
          message: `Veuillez attendre ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} avant de poster un nouveau commentaire`
        });
      }
    }

    // L'utilisateur peut commenter
    res.json({
      success: true,
      canComment: true,
      remainingTime: 0,
      remainingMinutes: 0,
      timeLimit: timeLimitMinutes,
      message: 'Vous pouvez poster un commentaire'
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du cooldown:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Like/unlike un commentaire
export const toggleLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Vérifier que le commentaire existe
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    // Vérifier que le commentaire est approuvé
    if (!comment.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'interagir avec un commentaire non approuvé'
      });
    }

    // Vérifier que l'utilisateur n'est pas banni
    const user = await User.findById(userId);
    if (user.isBannedCurrently()) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte est actuellement banni'
      });
    }

    // Basculer le like
    const wasLiked = comment.isLikedBy(userId);
    comment.toggleLike(userId);
    await comment.save();

    // Mettre à jour les statistiques de l'utilisateur
    if (wasLiked) {
      // Retirer le like
      user.stats.likesGiven = Math.max(0, user.stats.likesGiven - 1);
    } else {
      // Ajouter le like
      user.stats.likesGiven += 1;
    }
    await user.save();

    // Mettre à jour les statistiques de l'auteur du commentaire
    const commentAuthor = await User.findById(comment.author);
    if (commentAuthor) {
      if (wasLiked) {
        commentAuthor.stats.likesReceived = Math.max(0, commentAuthor.stats.likesReceived - 1);
      } else {
        commentAuthor.stats.likesReceived += 1;
      }
      await commentAuthor.save();
    }

    res.json({
      success: true,
      message: wasLiked ? 'Like retiré' : 'Commentaire liké',
      data: {
        isLiked: !wasLiked,
        likesCount: comment.likesCount
      }
    });

  } catch (error) {
    console.error('Erreur lors du toggle like du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la gestion du like'
    });
  }
};
