import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Post from '../src/models/Post.js';
import Comment from '../src/models/Comment.js';

dotenv.config();

const checkAtlasData = async () => {
  try {
    const atlasUri = process.env.MONGODB_ATLAS_URI;
    if (!atlasUri) {
      console.error('❌ Erreur: MONGODB_ATLAS_URI n\'est pas définie dans les variables d\'environnement.');
      return;
    }

    console.log('🔍 Vérification des données MongoDB Atlas...');
    console.log('📡 Connexion à MongoDB Atlas...');

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

    // Vérifier les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📋 Collections trouvées (${collections.length}):`);
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }

    // Vérifier les modèles Mongoose
    console.log('\n🧪 Vérification des modèles Mongoose:');
    
    const users = await User.find({});
    console.log(`👥 Utilisateurs: ${users.length}`);
    if (users.length > 0) {
      console.log('   Exemples:');
      users.slice(0, 3).forEach(user => {
        console.log(`   - ${user.username} (${user.email})`);
      });
    }

    const posts = await Post.find({});
    console.log(`📝 Articles: ${posts.length}`);
    if (posts.length > 0) {
      console.log('   Exemples:');
      posts.slice(0, 3).forEach(post => {
        console.log(`   - ${post.title} (${post.status})`);
      });
    }

    const comments = await Comment.find({});
    console.log(`💬 Commentaires: ${comments.length}`);
    if (comments.length > 0) {
      console.log('   Exemples:');
      comments.slice(0, 3).forEach(comment => {
        console.log(`   - ${comment.content.substring(0, 50)}...`);
      });
    }

    console.log('\n🔌 Informations de connexion:');
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Port: ${mongoose.connection.port}`);
    console.log(`État: Connecté`);

    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  }
};

checkAtlasData();
