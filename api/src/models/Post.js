import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  content: {
    type: String,
    required: [true, 'Le contenu est requis'],
    minlength: [10, 'Le contenu doit contenir au moins 10 caractères']
  },
  excerpt: {
    type: String,
    required: [true, 'L\'extrait est requis'],
    maxlength: [300, 'L\'extrait ne peut pas dépasser 300 caractères']
  },
  slug: {
    type: String,
    required: [true, 'Le slug est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'auteur est requis']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  featuredImage: {
    type: String,
    trim: true
  },
  readTime: {
    type: Number,
    min: [1, 'Le temps de lecture doit être d\'au moins 1 minute']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ likesCount: -1 });

// Méthode pour calculer le temps de lecture
postSchema.methods.calculateReadTime = function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(' ').length;
  this.readTime = Math.ceil(wordCount / wordsPerMinute);
  return this.readTime;
};

// Méthode pour vérifier si un utilisateur a liké le post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

// Méthode pour ajouter un like
postSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
    return true;
  }
  return false;
};

// Méthode pour retirer un like
postSchema.methods.removeLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likesCount = this.likes.length;
    return true;
  }
  return false;
};

// Méthode pour basculer un like (ajouter ou retirer)
postSchema.methods.toggleLike = function(userId) {
  if (this.isLikedBy(userId)) {
    return this.removeLike(userId);
  } else {
    return this.addLike(userId);
  }
};

// Middleware pre-save pour calculer automatiquement le temps de lecture
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.calculateReadTime();
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;

