# Système de Rôles et Permissions - Blog API

## Vue d'ensemble

Le système de rôles et permissions de jBlog suit une hiérarchie ascendante où chaque niveau supérieur hérite des droits des niveaux inférieurs.

## Hiérarchie des Rôles

```
USER (utilisateur) ← MODERATOR (modérateur) ← PUBLISHER (éditeur) ← ADMIN (administrateur)
```

## Détail des Rôles

### 1. **USER** (utilisateur)
**Permissions de base :**
- ✅ Liker des posts (`like_post`)
- ✅ Liker des commentaires (`like_comment`)
- ✅ Créer des commentaires (`create_comment`)

**Limitations :**
- ❌ Pas de création/modification/suppression de posts
- ❌ Pas de modération de commentaires
- ❌ Pas de bannissement d'utilisateurs

### 2. **MODERATOR** (modérateur)
**Hérite des droits USER + :**
- ✅ Supprimer des commentaires (`delete_comment`)
- ✅ Bannir des utilisateurs (`ban_users`)

**Utilisation typique :**
- Modération de la communauté
- Gestion des commentaires inappropriés
- Bannissement temporaire d'utilisateurs problématiques

### 3. **PUBLISHER** (éditeur)
**Hérite des droits MODERATOR + :**
- ✅ Créer des posts (`create_post`)
- ✅ Modifier des posts (`edit_post`)
- ✅ Supprimer des posts (`delete_post`)

**Utilisation typique :**
- Création et gestion de contenu
- Modération de la communauté
- Gestion des utilisateurs problématiques

### 4. **ADMIN** (administrateur)
**Hérite de TOUS les droits + :**
- ✅ Gérer les utilisateurs (`manage_users`)
- ✅ Gérer les rôles (`manage_roles`)
- ✅ Gérer le système (`manage_system`)

**Utilisation typique :**
- Administration complète de la plateforme
- Gestion des rôles et permissions
- Configuration système

## Permissions Détaillées

### Permissions de Base
- `like_post` : Liker un article
- `like_comment` : Liker un commentaire
- `create_comment` : Créer un commentaire

### Permissions de Modération
- `delete_comment` : Supprimer un commentaire
- `ban_users` : Bannir des utilisateurs

### Permissions de Publication
- `create_post` : Créer un article
- `edit_post` : Modifier un article
- `delete_post` : Supprimer un article

### Permissions d'Administration
- `manage_users` : Gérer les utilisateurs
- `manage_roles` : Gérer les rôles
- `manage_system` : Gérer le système

## Utilisation dans le Code

### Vérification des Permissions
```javascript
// Dans un contrôleur
if (!req.user.canLikePost()) {
  return res.status(403).json({
    success: false,
    message: 'Permission insuffisante'
  });
}

// Ou avec le middleware
router.post('/posts/:id/like', canLikePost, likePost);
```

### Middlewares Disponibles
- `canLikePost` : Vérifie la permission de liker un post
- `canLikeComment` : Vérifie la permission de liker un commentaire
- `canCreateComment` : Vérifie la permission de créer un commentaire
- `canDeleteComment` : Vérifie la permission de supprimer un commentaire
- `canCreatePost` : Vérifie la permission de créer un post
- `canEditPost` : Vérifie la permission de modifier un post
- `canDeletePost` : Vérifie la permission de supprimer un post
- `canBanUsers` : Vérifie la permission de bannir des utilisateurs
- `requireAdmin` : Vérifie le rôle administrateur

## Exemples d'Utilisation

### Route pour Liker un Post
```javascript
router.post('/posts/:id/like', canLikePost, async (req, res) => {
  // Logique de like
});
```

### Route pour Créer un Commentaire
```javascript
router.post('/posts/:id/comments', canCreateComment, checkCommentRate, async (req, res) => {
  // Logique de création de commentaire
});
```

### Route pour Supprimer un Commentaire
```javascript
router.delete('/comments/:id', canDeleteComment, async (req, res) => {
  // Logique de suppression de commentaire
});
```

## Sécurité

- Toutes les permissions vérifient que l'utilisateur n'est pas banni
- Toutes les permissions vérifient que l'utilisateur est actif
- Les permissions sont vérifiées côté serveur ET côté client
- Les tokens JWT sont utilisés pour l'authentification
- Les mots de passe sont hachés avec bcrypt

## Évolution du Système

Ce système est conçu pour être extensible. Pour ajouter de nouvelles permissions :

1. Ajouter la permission dans `PERMISSIONS`
2. L'assigner aux rôles appropriés dans `ROLE_PERMISSIONS`
3. Créer la méthode correspondante dans le modèle User
4. Créer le middleware de vérification
5. L'utiliser dans les routes appropriées
