import express from 'express';
import { authenticateToken, requireModeratePermission } from '../middleware/auth.js';
import {
  getPendingComments,
  getReportedComments,
  approveComment,
  rejectComment,
  reportComment,
  resolveReport,
  getModerationStats
} from '../controllers/moderationController.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Routes pour les modérateurs et admins
router.get('/comments/pending', requireModeratePermission, getPendingComments);
router.get('/comments/reported', requireModeratePermission, getReportedComments);
router.get('/stats', requireModeratePermission, getModerationStats);

// Actions de modération
router.post('/comments/:commentId/approve', requireModeratePermission, approveComment);
router.post('/comments/:commentId/reject', requireModeratePermission, rejectComment);
router.post('/comments/:commentId/reports/:reportId/resolve', requireModeratePermission, resolveReport);

// Route pour signaler un commentaire (accessible à tous les utilisateurs connectés)
router.post('/comments/:commentId/report', reportComment);

export default router;
