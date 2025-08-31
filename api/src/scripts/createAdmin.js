import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Configuration des variables d'environnement
dotenv.config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jgazette');
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

// Créer un utilisateur admin
const createAdminUser = async () => {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@jgazette.com' });
    
    if (existingAdmin) {
      console.log('⚠️  L\'utilisateur admin existe déjà');
      return;
    }

    // Créer l'utilisateur admin
    const adminUser = new User({
      username: 'admin',
      email: 'admin@jgazette.com',
      password: 'admin123', // À changer en production
      firstName: 'Admin',
      lastName: 'JGazette',
      role: 'admin',
      bio: 'Administrateur principal du blog JGazette'
    });

    await adminUser.save();
    console.log('✅ Utilisateur admin créé avec succès');
    console.log('📧 Email: admin@jgazette.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('⚠️  IMPORTANT: Changez le mot de passe en production !');
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  }
};

// Créer des utilisateurs de test avec différents rôles
const createTestUsers = async () => {
  try {
    const testUsers = [
      {
        username: 'publisher',
        email: 'publisher@jgazette.com',
        password: 'publisher123',
        firstName: 'Publisher',
        lastName: 'Test',
        role: 'publisher',
        bio: 'Rédacteur de contenu - peut créer, modifier et supprimer des posts, modérer les commentaires et bannir des utilisateurs'
      },
      {
        username: 'moderator',
        email: 'moderator@jgazette.com',
        password: 'moderator123',
        firstName: 'Moderator',
        lastName: 'Test',
        role: 'moderator',
        bio: 'Modérateur de contenu - peut liker, commenter, supprimer des commentaires et bannir des utilisateurs'
      },
      {
        username: 'user',
        email: 'user@jgazette.com',
        password: 'user123',
        firstName: 'User',
        lastName: 'Test',
        role: 'user',
        bio: 'Utilisateur standard - peut liker des posts et commentaires, et créer des commentaires'
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Utilisateur ${userData.role} créé: ${userData.email}`);
      } else {
        console.log(`⚠️  Utilisateur ${userData.role} existe déjà: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs de test:', error);
  }
};

// Fonction principale
const main = async () => {
  await connectDB();
  await createAdminUser();
  await createTestUsers();
  
  console.log('\n🎉 Script terminé !');
  console.log('\n📋 Comptes de test créés:');
  console.log('👑 Admin: admin@jgazette.com / admin123');
  console.log('✍️  Publisher: publisher@jgazette.com / publisher123');
  console.log('🛡️  Moderator: moderator@jgazette.com / moderator123');
  console.log('👤 User: user@jgazette.com / user123');
  
  console.log('\n🔐 Permissions par rôle:');
  console.log('👤 USER: Likes + Commentaires');
  console.log('🛡️  MODERATOR: USER + Modération + Bannissement');
  console.log('✍️  PUBLISHER: MODERATOR + Gestion des Posts');
  console.log('👑 ADMIN: Tous les droits');
  
  process.exit(0);
};

main();
