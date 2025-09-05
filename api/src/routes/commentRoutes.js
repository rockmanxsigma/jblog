import express from 'express';
import { 
  getCommentsByPost, 
  createComment, 
  updateComment, 
  deleteComment, 
  toggleLike,
  checkCommentCooldown
} from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Récupérer les commentaires d'un post (public)
router.get('/post/:postId', getCommentsByPost);

// Vérifier le cooldown pour les commentaires (authentification requise)
router.get('/cooldown', authenticateToken, checkCommentCooldown);

// Créer un commentaire (authentification requise)
router.post('/', authenticateToken, createComment);

// Mettre à jour un commentaire (authentification requise)
router.put('/:commentId', authenticateToken, updateComment);

// Supprimer un commentaire (authentification requise)
router.delete('/:commentId', authenticateToken, deleteComment);

// Like/unlike un commentaire (authentification requise)
router.post('/:commentId/like', authenticateToken, toggleLike);

export default router;
