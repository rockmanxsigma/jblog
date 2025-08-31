import express from 'express';
import { upload, uploadImage, deleteImage, serveImage } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Route pour uploader une image (protégée)
router.post('/image', authenticateToken, upload.single('image'), uploadImage);

// Route pour servir une image (publique avec CORS)
router.get('/image/:filename', serveImage);

// Route pour supprimer une image (protégée)
router.delete('/image/:filename', authenticateToken, deleteImage);

export default router;
