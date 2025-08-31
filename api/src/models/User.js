import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Définition des rôles et permissions
const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator', 
  PUBLISHER: 'publisher',
  ADMIN: 'admin'
};

const PERMISSIONS = {
  // Permissions de base (utilisateurs)
  LIKE_POST: 'like_post',
  LIKE_COMMENT: 'like_comment',
  CREATE_COMMENT: 'create_comment',
  
  // Permissions de modération
  DELETE_COMMENT: 'delete_comment',
  MODERATE_COMMENTS: 'moderate_comments',
  BAN_USERS: 'ban_users',
  
  // Permissions de publication
  CREATE_POST: 'create_post',
  EDIT_POST: 'edit_post',
  DELETE_POST: 'delete_post',
  
  // Permissions d'administration
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_SYSTEM: 'manage_system'
};

// Mapping des rôles vers les permissions (hiérarchie ascendante)
const ROLE_PERMISSIONS = {
  [ROLES.USER]: [
    PERMISSIONS.LIKE_POST,
    PERMISSIONS.LIKE_COMMENT,
    PERMISSIONS.CREATE_COMMENT
  ],
  
  [ROLES.MODERATOR]: [
    // Droits des utilisateurs +
    PERMISSIONS.LIKE_POST,
    PERMISSIONS.LIKE_COMMENT,
    PERMISSIONS.CREATE_COMMENT,
    
    // Droits de modération
    PERMISSIONS.DELETE_COMMENT,
    PERMISSIONS.MODERATE_COMMENTS,
    PERMISSIONS.BAN_USERS
  ],
  
  [ROLES.PUBLISHER]: [
    // Droits des modérateurs +
    PERMISSIONS.LIKE_POST,
    PERMISSIONS.LIKE_COMMENT,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.DELETE_COMMENT,
    PERMISSIONS.MODERATE_COMMENTS,
    PERMISSIONS.BAN_USERS,
    
    // Droits de publication
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST,
    PERMISSIONS.DELETE_POST
  ],
  
  [ROLES.ADMIN]: [
    // Tous les droits
    ...Object.values(PERMISSIONS)
  ]
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banInfo: {
    isBanned: { type: Boolean, default: false },
    reason: { type: String },
    bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bannedAt: { type: Date },
    bannedUntil: { type: Date },
    duration: { type: String } // '30min', '2h', '10d', 'permanent'
  },
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    avatar: { type: String },
    website: { type: String },
    location: { type: String }
  },
  stats: {
    postsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    likesGiven: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'fr' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'banInfo.isBanned': 1, 'banInfo.bannedUntil': 1 });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Méthodes d'instance
userSchema.methods.hasPermission = function(permission) {
  if (this.role === ROLES.ADMIN) return true;
  return ROLE_PERMISSIONS[this.role]?.includes(permission) || false;
};

// Permissions de base (utilisateurs)
userSchema.methods.canLikePost = function() {
  return this.hasPermission(PERMISSIONS.LIKE_POST) && !this.isBanned && this.isActive;
};

userSchema.methods.canLikeComment = function() {
  return this.hasPermission(PERMISSIONS.LIKE_COMMENT) && !this.isBanned && this.isActive;
};

userSchema.methods.canCreateComment = function() {
  return this.hasPermission(PERMISSIONS.CREATE_COMMENT) && !this.isBanned && this.isActive;
};

// Permissions de modération
userSchema.methods.canDeleteComment = function() {
  return this.hasPermission(PERMISSIONS.DELETE_COMMENT) && !this.isBanned && this.isActive;
};

userSchema.methods.canBanUsers = function() {
  return this.hasPermission(PERMISSIONS.BAN_USERS) && !this.isBanned && this.isActive;
};

userSchema.methods.canModerate = function() {
  return this.hasPermission(PERMISSIONS.MODERATE_COMMENTS) && !this.isBanned && this.isActive;
};

// Permissions de publication
userSchema.methods.canCreatePost = function() {
  return this.hasPermission(PERMISSIONS.CREATE_POST) && !this.isBanned && this.isActive;
};

userSchema.methods.canEditPost = function() {
  return this.hasPermission(PERMISSIONS.EDIT_POST) && !this.isBanned && this.isActive;
};

userSchema.methods.canDeletePost = function() {
  return this.hasPermission(PERMISSIONS.DELETE_POST) && !this.isBanned && this.isActive;
};

// Méthode de convenance pour les permissions de publication
userSchema.methods.canPublish = function() {
  return this.hasPermission(PERMISSIONS.CREATE_POST) && !this.isBanned && this.isActive;
};

// Permissions d'administration
userSchema.methods.canManageUsers = function() {
  return this.hasPermission(PERMISSIONS.MANAGE_USERS) && !this.isBanned && this.isActive;
};

userSchema.methods.canManageRoles = function() {
  return this.hasPermission(PERMISSIONS.MANAGE_ROLES) && !this.isBanned && this.isActive;
};

userSchema.methods.canManageSystem = function() {
  return this.hasPermission(PERMISSIONS.MANAGE_SYSTEM) && !this.isBanned && this.isActive;
};

userSchema.methods.isBannedCurrently = function() {
  if (!this.banInfo.isBanned) return false;
  if (!this.banInfo.bannedUntil) return true; // Bannissement permanent
  return new Date() < this.banInfo.bannedUntil;
};

userSchema.methods.ban = function(duration, reason, bannedBy) {
  this.banInfo = {
    isBanned: true,
    reason,
    bannedBy,
    bannedAt: new Date(),
    duration,
    bannedUntil: this.calculateBanEndDate(duration)
  };
  this.isBanned = true;
  return this.save();
};

userSchema.methods.unban = function() {
  this.banInfo = {
    isBanned: false,
    reason: null,
    bannedBy: null,
    bannedAt: null,
    bannedUntil: null,
    duration: null
  };
  this.isBanned = false;
  return this.save();
};

userSchema.methods.calculateBanEndDate = function(duration) {
  if (duration === 'permanent') return null;
  
  const now = new Date();
  const [value, unit] = duration.match(/(\d+)([mhd])/).slice(1);
  const numValue = parseInt(value);
  
  switch (unit) {
    case 'm': return new Date(now.getTime() + numValue * 60 * 1000); // minutes
    case 'h': return new Date(now.getTime() + numValue * 60 * 60 * 1000); // heures
    case 'd': return new Date(now.getTime() + numValue * 24 * 60 * 60 * 1000); // jours
    default: return new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes par défaut
  }
};

// Méthodes statiques
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

userSchema.statics.findBannedUsers = function() {
  return this.find({ 'banInfo.isBanned': true });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true, isBanned: false });
};

// Middleware pre-save
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  
  // Vérifier si le bannissement a expiré
  if (this.banInfo.isBanned && this.banInfo.bannedUntil && new Date() >= this.banInfo.bannedUntil) {
    this.unban();
  }
  
  this.updatedAt = new Date();
  next();
});

// Méthode de comparaison de mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir un objet sécurisé (sans mot de passe)
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Méthode pour obtenir un objet public (informations limitées)
userSchema.methods.toPublicObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.email;
  delete userObject.banInfo;
  delete userObject.preferences;
  return userObject;
};

// Export des constantes
userSchema.statics.ROLES = ROLES;
userSchema.statics.PERMISSIONS = PERMISSIONS;
userSchema.statics.ROLE_PERMISSIONS = ROLE_PERMISSIONS;

const User = mongoose.model('User', userSchema);

export default User;
