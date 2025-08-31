import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/images';
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtre pour les types de fichiers
const fileFilter = (req, file, cb) => {
  // Vérifier le type MIME
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers image sont autorisés'), false);
  }
};

// Configuration de multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter
});

// Endpoint pour uploader une image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier n\'a été fourni'
      });
    }

    // Construire l'URL de l'image
    const imageUrl = `/uploads/images/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploadée avec succès',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de l\'image',
      error: error.message
    });
  }
};

// Endpoint pour servir une image avec CORS
export const serveImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads/images', filename);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image non trouvée'
      });
    }
    
    // Déterminer le type MIME
    const ext = path.extname(filename).toLowerCase();
    let mimeType = 'image/jpeg'; // par défaut
    
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.webp') mimeType = 'image/webp';
    
    // Définir le type de contenu
    res.setHeader('Content-Type', mimeType);
    
    // Servir le fichier (la configuration CORS globale s'occupe du reste)
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Erreur lors du service de l\'image:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du service de l\'image',
      error: error.message
    });
  }
};

// Endpoint pour supprimer une image
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads/images', filename);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }
    
    // Supprimer le fichier
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      success: true,
      message: 'Image supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'image',
      error: error.message
    });
  }
};
