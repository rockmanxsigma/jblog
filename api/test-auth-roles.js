import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

// Fonction pour tester la connexion d'un utilisateur
const testUserLogin = async (email, password, expectedRole) => {
  try {
    console.log(`\n🔐 Test de connexion pour ${email} (rôle attendu: ${expectedRole})`);
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Connexion réussie pour ${email}`);
      console.log(`👤 Rôle: ${data.user.role}`);
      console.log(`🔑 Token reçu: ${data.token ? 'Oui' : 'Non'}`);
      
      // Tester la récupération du profil
      const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      const profileData = await profileResponse.json();
      if (profileData.success) {
        console.log(`✅ Profil récupéré avec succès`);
        console.log(`📧 Email: ${profileData.user.email}`);
        console.log(`👤 Username: ${profileData.user.username}`);
        console.log(`🛡️  Rôle: ${profileData.user.role}`);
        console.log(`📝 Bio: ${profileData.user.profile?.bio || 'Aucune'}`);
      } else {
        console.log(`❌ Erreur lors de la récupération du profil: ${profileData.message}`);
      }
      
      return data.token;
    } else {
      console.log(`❌ Échec de la connexion: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erreur lors du test de connexion:`, error.message);
    return null;
  }
};

// Fonction pour tester les permissions d'un utilisateur
const testUserPermissions = async (token, role) => {
  try {
    console.log(`\n🔍 Test des permissions pour le rôle ${role}`);
    
    // Test de récupération des posts (lecture publique)
    const postsResponse = await fetch(`${API_BASE}/posts`);
    const postsData = await postsResponse.json();
    
    if (postsResponse.ok) {
      console.log(`✅ Lecture des posts: OK (${postsData.data?.length || 0} posts trouvés)`);
    } else {
      console.log(`❌ Lecture des posts: Échec - ${postsData.message}`);
    }
    
    // Test des permissions spécifiques selon le rôle
    if (role === 'admin' || role === 'publisher') {
      console.log(`🔒 Test des permissions de publication pour ${role}`);
      // Ici on pourrait tester la création de posts si l'endpoint existe
    }
    
    if (role === 'admin' || role === 'publisher' || role === 'moderator') {
      console.log(`🔒 Test des permissions de modération pour ${role}`);
      // Ici on pourrait tester la modération si l'endpoint existe
    }
    
    if (role === 'admin' || role === 'publisher' || role === 'moderator' || role === 'user') {
      console.log(`🔒 Test des permissions de base pour ${role}`);
      // Ici on pourrait tester les likes et commentaires si l'endpoint existe
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors du test des permissions:`, error.message);
  }
};

// Fonction principale de test
const main = async () => {
  console.log('🧪 Test de l\'API d\'authentification et des rôles\n');
  
  // Test de la route de base
  try {
    const baseResponse = await fetch(API_BASE);
    const baseData = await baseResponse.json();
    console.log('🌐 Test de la route de base:');
    console.log(`✅ API accessible: ${baseData.message}`);
    console.log(`📊 Version: ${baseData.version}`);
  } catch (error) {
    console.log('❌ API non accessible:', error.message);
    return;
  }
  
  // Test des utilisateurs
  const users = [
    { email: 'admin@jgazette.com', password: 'admin123', role: 'admin' },
    { email: 'publisher@jgazette.com', password: 'publisher123', role: 'publisher' },
    { email: 'moderator@jgazette.com', password: 'moderator123', role: 'moderator' },
    { email: 'user@jgazette.com', password: 'user123', role: 'user' }
  ];
  
  for (const user of users) {
    const token = await testUserLogin(user.email, user.password, user.role);
    if (token) {
      await testUserPermissions(token, user.role);
    }
  }
  
  console.log('\n🎉 Tests terminés !');
};

// Exécuter les tests
main().catch(console.error);
