import connectDB from '../config/database.js';
import Post from '../models/Post.js';

// Connexion à la base de données
connectDB();

async function migrateImageUrls() {
  try {
    console.log('🔄 Début de la migration des URLs d\'images...');
    
    // Trouver tous les posts avec des images
    const posts = await Post.find({ featuredImage: { $exists: true, $ne: null } });
    console.log(`📝 ${posts.length} posts trouvés avec des images`);
    
    let updatedCount = 0;
    
    for (const post of posts) {
      if (post.featuredImage && post.featuredImage.includes('/uploads/images/')) {
        // Extraire le nom du fichier
        const filename = post.featuredImage.split('/uploads/images/')[1];
        
        // Construire la nouvelle URL
        const newUrl = `http://localhost:5000/upload/image/${filename}`;
        
        // Mettre à jour le post
        await Post.findByIdAndUpdate(post._id, {
          featuredImage: newUrl
        });
        
        console.log(`✅ Post "${post.title}" mis à jour : ${post.featuredImage} → ${newUrl}`);
        updatedCount++;
      }
    }
    
    console.log(`🎉 Migration terminée ! ${updatedCount} posts mis à jour`);
    
    // Afficher un exemple de post mis à jour
    const samplePost = await Post.findOne({ featuredImage: { $regex: /\/upload\/image\// } });
    if (samplePost) {
      console.log(`📸 Exemple de post mis à jour : ${samplePost.featuredImage}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    process.exit(0);
  }
}

// Exécuter la migration
migrateImageUrls();
