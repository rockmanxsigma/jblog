import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  updateUser,
  banUser, 
  unbanUser, 
  deleteUser,
  getGlobalUserStats 
} from '../controllers/userManagementController.js';
import { authenticateToken } from '../middleware/auth.js';
import { canManageUsers } from '../middleware/permissions.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification et des permissions d'admin
router.use(authenticateToken);
router.use(canManageUsers);

// Obtenir tous les utilisateurs (avec pagination et filtres)
router.get('/', getAllUsers);

// Obtenir les statistiques globales des utilisateurs
router.get('/stats', getGlobalUserStats);

// Obtenir un utilisateur par ID
router.get('/:userId', getUserById);

// Mettre à jour le rôle d'un utilisateur
router.put('/:userId/role', updateUserRole);

// Mettre à jour un utilisateur (fonction générique)
router.put('/:userId', updateUser);

// Bannir un utilisateur
router.put('/:userId/ban', banUser);

// Réactiver un utilisateur banni
router.put('/:userId/unban', unbanUser);

// Supprimer un utilisateur
router.delete('/:userId', deleteUser);

export default router;
