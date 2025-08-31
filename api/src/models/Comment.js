import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Le contenu du commentaire est requis'],
    trim: true,
    maxlength: [1000, 'Le commentaire ne peut pas dépasser 1000 caractères']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'auteur du commentaire est requis']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Le post associé est requis']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Statut d'approbation
  isApproved: {
    type: Boolean,
    default: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  // Système de signalement
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'offensive', 'other'],
      required: true
    },
    description: {
      type: String,
      maxlength: [500, 'La description du signalement ne peut pas dépasser 500 caractères']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending'
    }
  }],
  // Métadonnées de modération
  moderationHistory: [{
    action: {
      type: String,
      enum: ['approved', 'rejected', 'edited', 'deleted', 'reported'],
      required: true
    },
    moderator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Raison de rejet si applicable
  rejectionReason: {
    type: String,
    maxlength: [200, 'La raison de rejet ne peut pas dépasser 200 caractères']
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

// Index pour la protection anti-spam (auteur + date)
commentSchema.index({ author: 1, createdAt: -1 });

// Index pour la modération
commentSchema.index({ isApproved: 1, createdAt: -1 });
commentSchema.index({ 'reports.status': 1, createdAt: -1 });

// Méthode virtuelle pour compter les likes
commentSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Méthode virtuelle pour compter les réponses
commentSchema.virtual('repliesCount').get(function() {
  return this.replies.length;
});

// Méthode virtuelle pour compter les signalements actifs
commentSchema.virtual('activeReportsCount').get(function() {
  return this.reports.filter(report => report.status === 'pending').length;
});

// Méthodes pour gérer les likes
commentSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

commentSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push(userId);
    return true;
  }
  return false;
};

commentSchema.methods.removeLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    return true;
  }
  return false;
};

commentSchema.methods.toggleLike = function(userId) {
  if (this.isLikedBy(userId)) {
    return this.removeLike(userId);
  } else {
    return this.addLike(userId);
  }
};

// Méthodes pour la modération
commentSchema.methods.approve = function(moderatorId) {
  this.isApproved = true;
  this.approvedBy = moderatorId;
  this.approvedAt = new Date();
  this.rejectionReason = null;
  
  // Ajouter à l'historique
  this.moderationHistory.push({
    action: 'approved',
    moderator: moderatorId,
    timestamp: new Date()
  });
  
  return this;
};

commentSchema.methods.reject = function(moderatorId, reason) {
  this.isApproved = false;
  this.rejectionReason = reason;
  
  // Ajouter à l'historique
  this.moderationHistory.push({
    action: 'rejected',
    moderator: moderatorId,
    reason: reason,
    timestamp: new Date()
  });
  
  return this;
};

commentSchema.methods.addReport = function(reportedBy, reason, description = '') {
  // Vérifier si l'utilisateur a déjà signalé ce commentaire
  const existingReport = this.reports.find(report => 
    report.reportedBy.toString() === reportedBy.toString()
  );
  
  if (existingReport) {
    // Mettre à jour le signalement existant
    existingReport.reason = reason;
    existingReport.description = description;
    existingReport.reportedAt = new Date();
    existingReport.status = 'pending';
  } else {
    // Ajouter un nouveau signalement
    this.reports.push({
      reportedBy,
      reason,
      description,
      reportedAt: new Date(),
      status: 'pending'
    });
  }
  
  return this;
};

commentSchema.methods.resolveReport = function(reportId, moderatorId, action) {
  const report = this.reports.id(reportId);
  if (report) {
    report.status = action === 'dismiss' ? 'dismissed' : 'resolved';
    
    // Ajouter à l'historique
    this.moderationHistory.push({
      action: 'reported',
      moderator: moderatorId,
      reason: `Signalement ${action === 'dismiss' ? 'rejeté' : 'résolu'}`,
      timestamp: new Date()
    });
  }
  
  return this;
};

// Méthode pour déterminer si l'approbation automatique est autorisée
commentSchema.methods.canAutoApprove = function() {
  // Cette méthode sera utilisée dans le contrôleur pour déterminer
  // si un commentaire peut être automatiquement approuvé
  return false; // Par défaut, tous les commentaires nécessitent une approbation
};

// S'assurer que les champs virtuels sont inclus dans la sérialisation JSON
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
