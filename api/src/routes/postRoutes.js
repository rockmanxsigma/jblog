import express from 'express';
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getPostsByTag,
  toggleLike,
  getMyPosts,
  removePostImage,
  cleanupOrphanedImages
} from '../controllers/postController.js';
import { 
  authenticateToken, 
  requirePublishPermission, 
  requireModeratePermission,
  requireAdmin 
} from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.get('/posts', getAllPosts);

// Routes spécifiques AVANT la route générique /posts/:id
router.get('/posts/my', authenticateToken, getMyPosts);
router.get('/posts/slug/:slug', getPostBySlug);
router.get('/posts/tag/:tag', getPostsByTag);

// Route générique par ID en DERNIER pour éviter les conflits
router.get('/posts/:id', getPostById);

// Routes protégées - Publication
router.post('/posts', authenticateToken, requirePublishPermission, createPost);
router.put('/posts/:id', authenticateToken, requirePublishPermission, updatePost);

// Routes protégées - Suppression (admin et modérateur)
router.delete('/posts/:id', authenticateToken, requireModeratePermission, deletePost);

// Route protégée - Like (utilisateurs authentifiés)
router.post('/posts/:postId/like', authenticateToken, toggleLike);

// Route protégée - Suppression d'image
router.delete('/posts/:postId/image', authenticateToken, removePostImage);

// Route protégée - Nettoyage des images orphelines (admin seulement)
router.post('/posts/cleanup-images', authenticateToken, requireAdmin, cleanupOrphanedImages);

export default router;

