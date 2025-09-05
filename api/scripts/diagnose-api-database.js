import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../src/models/Post.js';
import User from '../src/models/User.js';

dotenv.config();

const diagnoseApiDatabase = async () => {
  try {
    console.log('🔍 Diagnostic de la base de données API...');
    
    // Vérifier les variables d'environnement
    console.log('\n📋 Variables d\'environnement:');
    console.log(`   MONGODB_ATLAS_URI: ${process.env.MONGODB_ATLAS_URI ? '✅ Définie' : '❌ Non définie'}`);
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Définie' : '❌ Non définie'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Non définie'}`);
    
    // Déterminer quelle URI utiliser
    const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette';
    console.log(`\n🔗 URI utilisée: ${mongoUri.substring(0, 50)}...`);
    
    // Connexion à la base de données
    console.log('\n📡 Connexion à la base de données...');
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoUri, options);
    console.log('✅ Connexion réussie !');
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`📊 Base de données: ${mongoose.connection.name}`);
    
    // Vérifier les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📋 Collections trouvées (${collections.length}):`);
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents`);
    }
    
    // Vérifier les posts
    const posts = await Post.find({});
    console.log(`\n📝 Posts trouvés: ${posts.length}`);
    
    if (posts.length > 0) {
      console.log('   Détails des posts:');
      posts.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title}`);
        console.log(`      ID: ${post._id}`);
        console.log(`      Slug: ${post.slug}`);
        console.log(`      Status: ${post.status}`);
        console.log(`      Created: ${post.createdAt}`);
        console.log('');
      });
      
      // Vérifier les types d'ID
      const simpleIds = posts.filter(post => 
        post._id.toString().length < 10 || 
        post._id.toString() === '1' || 
        post._id.toString() === '2'
      );
      
      if (simpleIds.length > 0) {
        console.log('⚠️  Détection de posts avec des IDs simples (probablement des données de test)');
        console.log(`   ${simpleIds.length} posts avec des IDs simples trouvés`);
        simpleIds.forEach(post => {
          console.log(`   - ${post.title} (ID: ${post._id})`);
        });
      } else {
        console.log('✅ Tous les posts ont des ObjectId valides');
      }
    }
    
    // Vérifier les utilisateurs
    const users = await User.find({});
    console.log(`\n👥 Utilisateurs trouvés: ${users.length}`);
    
    if (users.length > 0) {
      console.log('   Détails des utilisateurs:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (${user.email})`);
        console.log(`      ID: ${user._id}`);
        console.log(`      Role: ${user.role}`);
        console.log('');
      });
    }
    
    // Vérifier la cohérence des données
    console.log('\n🔍 Vérification de la cohérence des données...');
    
    // Vérifier si les posts ont des auteurs valides
    const postsWithInvalidAuthors = posts.filter(post => {
      if (!post.author) return true;
      const authorId = post.author.toString();
      return authorId === '1' || authorId === '2' || authorId.length < 10;
    });
    
    if (postsWithInvalidAuthors.length > 0) {
      console.log('⚠️  Posts avec des auteurs invalides trouvés:');
      postsWithInvalidAuthors.forEach(post => {
        console.log(`   - ${post.title} (Auteur ID: ${post.author})`);
      });
    } else {
      console.log('✅ Tous les posts ont des auteurs valides');
    }
    
    // Vérifier si les posts correspondent aux données Atlas
    const atlasTitles = [
      'Introduction à JavaScript',
      'Les bases de Python', 
      'Guide CSS Avancé',
      'Développement Web avec React',
      'API REST avec Node.js et Express',
      'Babel tower'
    ];
    
    const currentTitles = posts.map(post => post.title);
    const missingTitles = atlasTitles.filter(title => !currentTitles.includes(title));
    const extraTitles = currentTitles.filter(title => !atlasTitles.includes(title));
    
    if (missingTitles.length > 0) {
      console.log('⚠️  Posts Atlas manquants:');
      missingTitles.forEach(title => {
        console.log(`   - ${title}`);
      });
    }
    
    if (extraTitles.length > 0) {
      console.log('⚠️  Posts supplémentaires (non Atlas):');
      extraTitles.forEach(title => {
        console.log(`   - ${title}`);
      });
    }
    
    if (missingTitles.length === 0 && extraTitles.length === 0) {
      console.log('✅ Les posts correspondent exactement aux données Atlas');
    }
    
    console.log('\n🎉 Diagnostic terminé !');
    
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    process.exit(1);
  }
};

diagnoseApiDatabase();
