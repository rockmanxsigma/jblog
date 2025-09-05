import Post from '../models/Post.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

// Récupérer tous les articles publiés
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Récupérer les posts depuis MongoDB Atlas
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Compter le total des posts
    const totalPosts = await Post.countDocuments({ status: 'published' });
    const totalPages = Math.ceil(totalPosts / limit);
    
    res.status(200).json({
      success: true,
      message: 'Articles récupérés avec succès',
      data: posts,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalPosts: totalPosts,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des articles',
      error: error.message
    });
  }
};

// Récupérer un article par ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id)
      .populate('author', 'username profile.firstName profile.lastName');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'article',
      error: error.message
    });
  }
};

// Récupérer un article par slug
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await Post.findOne({ slug, status: 'published' })
      .populate('author', 'username profile.firstName profile.lastName'); // Peupler les informations de l'auteur
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'article',
      error: error.message
    });
  }
};

// Créer un nouvel article
export const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, slug, tags, status, featuredImage } = req.body;
    
    // Validation des données requises
    if (!title || !content || !excerpt || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }
    
    // Vérifier si le slug existe déjà
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: 'Un article avec ce slug existe déjà'
      });
    }
    
    const post = new Post({
      title,
      content,
      excerpt,
      slug,
      author: req.user._id, // Utiliser l'ID de l'utilisateur connecté
      tags: tags || [],
      status: status || 'draft',
      featuredImage
    });
    
    await post.save();
    
    res.status(201).json({
      success: true,
      message: 'Article créé avec succès',
      data: post
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'article',
      error: error.message
    });
  }
};

// Mettre à jour un article
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Vérifier si l'article existe
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé'
      });
    }
    
    // Si le slug est modifié, vérifier qu'il n'existe pas déjà
    if (updateData.slug && updateData.slug !== existingPost.slug) {
      const slugExists = await Post.findOne({ slug: updateData.slug });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'Un article avec ce slug existe déjà'
        });
      }
    }
    
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Article mis à jour avec succès',
      data: updatedPost
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'article',
      error: error.message
    });
  }
};

// Supprimer un article
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé'
      });
    }

    // Supprimer l'image associée si elle existe
    if (post.featuredImage) {
      await deleteImageFile(post.featuredImage);
    }
    
    await Post.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Article supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'article',
      error: error.message
    });
  }
};

// Récupérer les articles par tag
export const getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const query = { 
      status: 'published',
      tags: { $in: [tag] }
    };
    
    const posts = await Post.find(query)
      .select('-content') // Exclure le contenu complet pour la liste
      .populate('author', 'username profile.firstName profile.lastName') // Peupler les informations de l'auteur
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Post.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des articles par tag',
      error: error.message
    });
  }
};

// Toggle like sur un post
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Vérifier que le post existe
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
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
    const wasLiked = post.isLikedBy(userId);
    post.toggleLike(userId);
    await post.save();

    // Mettre à jour les statistiques de l'utilisateur
    if (wasLiked) {
      // Retirer le like
      user.stats.likesGiven = Math.max(0, user.stats.likesGiven - 1);
    } else {
      // Ajouter le like
      user.stats.likesGiven += 1;
    }
    await user.save();

    // Mettre à jour les statistiques de l'auteur du post
    const postAuthor = await User.findById(post.author);
    if (postAuthor) {
      if (wasLiked) {
        postAuthor.stats.likesReceived = Math.max(0, postAuthor.stats.likesReceived - 1);
      } else {
        postAuthor.stats.likesReceived += 1;
      }
      await postAuthor.save();
    }

    res.json({
      success: true,
      message: wasLiked ? 'Like retiré' : 'Post liké',
      data: {
        isLiked: !wasLiked,
        likesCount: post.likesCount
      }
    });

  } catch (error) {
    console.error('Erreur lors du toggle like:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la gestion du like'
    });
  }
};

// Récupérer les posts de l'utilisateur connecté
export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer tous les posts de l'utilisateur (publiés et brouillons)
    const posts = await Post.find({ author: userId })
      .select('-content') // Exclure le contenu complet pour la liste
      .populate('author', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .exec();
    
    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des posts de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos articles'
    });
  }
};

// Supprimer l'image d'un post
export const removePostImage = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Vérifier que le post existe
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'auteur du post ou un admin
    if (post.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de modifier cet article'
      });
    }

    // Vérifier que le post a une image
    if (!post.featuredImage) {
      return res.status(400).json({
        success: false,
        message: 'Cet article n\'a pas d\'image à supprimer'
      });
    }

    // Extraire le nom du fichier de l'URL
    let filename = null;
    if (post.featuredImage.includes('/upload/image/')) {
      filename = post.featuredImage.split('/upload/image/')[1];
    } else if (post.featuredImage.includes('/images/')) {
      filename = post.featuredImage.split('/images/')[1];
    }

    if (filename) {
      // Supprimer le fichier du stockage
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join('uploads/images', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Fichier supprimé: ${filePath}`);
      }
    }

    // Mettre à jour le post en supprimant l'image
    post.featuredImage = undefined;
    await post.save();

    res.json({
      success: true,
      message: 'Image supprimée avec succès',
      data: {
        postId: post._id,
        featuredImage: null
      }
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'image'
    });
  }
};

// Fonction utilitaire pour supprimer un fichier image
const deleteImageFile = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Extraire le nom du fichier de l'URL
    const filename = imageUrl.split('/').pop();
    if (!filename) return;
    
    const filePath = path.join('uploads/images', filename);
    
    // Vérifier si le fichier existe et le supprimer
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Image supprimée: ${filename}`);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier image:', error);
  }
};

// Fonction utilitaire pour nettoyer les images orphelines
export const cleanupOrphanedImages = async (req, res) => {
  try {
    const uploadsDir = 'uploads/images';
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({
        success: true,
        message: 'Aucune image à nettoyer',
        deletedCount: 0
      });
    }
    
    // Récupérer tous les fichiers dans le dossier uploads
    const files = fs.readdirSync(uploadsDir);
    
    // Récupérer toutes les images utilisées dans les posts
    const posts = await Post.find({ featuredImage: { $exists: true, $ne: null } });
    const usedImages = posts.map(post => {
      if (post.featuredImage) {
        return post.featuredImage.split('/').pop();
      }
      return null;
    }).filter(Boolean);
    
    // Supprimer les fichiers orphelins
    let deletedCount = 0;
    for (const file of files) {
      if (!usedImages.includes(file)) {
        const filePath = path.join(uploadsDir, file);
        try {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Image orpheline supprimée: ${file}`);
        } catch (error) {
          console.error(`Erreur lors de la suppression de ${file}:`, error);
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Nettoyage terminé. ${deletedCount} image(s) orpheline(s) supprimée(s)`,
      deletedCount
    });
    
  } catch (error) {
    console.error('Erreur lors du nettoyage des images:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du nettoyage des images',
      error: error.message
    });
  }
};

