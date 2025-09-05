import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../src/models/Post.js';
import User from '../src/models/User.js';

dotenv.config();

const forceAtlasData = async () => {
  try {
    const atlasUri = process.env.MONGODB_ATLAS_URI;
    if (!atlasUri) {
      console.error('❌ Erreur: MONGODB_ATLAS_URI n\'est pas définie dans les variables d\'environnement.');
      return;
    }

    console.log('🔍 Connexion à MongoDB Atlas...');

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(atlasUri, options);
    console.log('✅ Connexion Atlas réussie !');
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`📊 Base de données: ${mongoose.connection.name}`);

    // Vérifier les posts actuels
    const currentPosts = await Post.find({});
    console.log(`\n📝 Posts actuels dans Atlas: ${currentPosts.length}`);
    
    if (currentPosts.length > 0) {
      console.log('   Titres des posts actuels:');
      currentPosts.forEach(post => {
        console.log(`   - ${post.title} (ID: ${post._id})`);
      });
    }

    // Vérifier si les posts ont des IDs simples (1, 2) ou des ObjectId
    const simpleIdPosts = currentPosts.filter(post => 
      post._id.toString().length < 10 || 
      post._id.toString() === '1' || 
      post._id.toString() === '2'
    );

    if (simpleIdPosts.length > 0) {
      console.log('\n⚠️  Détection de posts avec des IDs simples (probablement des données de test)');
      console.log('   Ces posts seront supprimés pour forcer l\'utilisation des vraies données Atlas');
      
      // Supprimer les posts avec des IDs simples
      await Post.deleteMany({ _id: { $in: simpleIdPosts.map(p => p._id) } });
      console.log(`🗑️  ${simpleIdPosts.length} posts avec IDs simples supprimés`);
    }

    // Vérifier les posts restants
    const remainingPosts = await Post.find({});
    console.log(`\n📝 Posts restants dans Atlas: ${remainingPosts.length}`);
    
    if (remainingPosts.length > 0) {
      console.log('   Titres des posts restants:');
      remainingPosts.forEach(post => {
        console.log(`   - ${post.title} (ID: ${post._id})`);
      });
    }

    // Si aucun post restant, créer des posts de test avec des ObjectId valides
    if (remainingPosts.length === 0) {
      console.log('\n📝 Aucun post restant, création de posts de test avec ObjectId valides...');
      
      // Récupérer l'utilisateur admin
      const adminUser = await User.findOne({ email: 'admin@jgazette.com' });
      if (!adminUser) {
        console.log('❌ Utilisateur admin non trouvé. Création d\'un utilisateur admin...');
        const newAdmin = new User({
          username: 'admin',
          email: 'admin@jgazette.com',
          password: 'admin123',
          role: 'ADMIN',
          profile: {
            firstName: 'Admin',
            lastName: 'User'
          }
        });
        await newAdmin.save();
        console.log('✅ Utilisateur admin créé');
      }

      // Créer des posts de test avec des ObjectId valides
      const testPosts = [
        {
          title: 'Introduction à JavaScript',
          excerpt: 'Découvrez les bases de JavaScript avec des exemples pratiques',
          content: 'JavaScript est un langage de programmation dynamique et orienté objet...',
          slug: 'introduction-javascript',
          tags: ['javascript', 'programming', 'web'],
          status: 'published',
          readTime: 5
        },
        {
          title: 'Les bases de Python',
          excerpt: 'Apprenez Python de zéro avec des exemples concrets',
          content: 'Python est un langage de programmation simple et puissant...',
          slug: 'bases-python',
          tags: ['python', 'programming', 'tutorial'],
          status: 'published',
          readTime: 7
        },
        {
          title: 'Guide CSS Avancé',
          excerpt: 'Maîtrisez les techniques CSS avancées pour créer des designs modernes',
          content: 'CSS3 offre de nombreuses possibilités pour créer des designs modernes...',
          slug: 'guide-css-avance',
          tags: ['css', 'design', 'web'],
          status: 'published',
          readTime: 10
        }
      ];

      const finalAdminUser = await User.findOne({ email: 'admin@jgazette.com' });
      
      for (const postData of testPosts) {
        const post = new Post({
          ...postData,
          author: finalAdminUser._id,
          publishedAt: new Date()
        });
        await post.save();
        console.log(`✅ Post créé: ${post.title} (ID: ${post._id})`);
      }
    }

    console.log('\n🎉 Script terminé !');
    console.log('📊 Vérification finale des posts:');
    const finalPosts = await Post.find({});
    console.log(`   Total: ${finalPosts.length} posts`);
    finalPosts.forEach(post => {
      console.log(`   - ${post.title} (ID: ${post._id})`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  }
};

forceAtlasData();
