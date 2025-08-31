# Changements de Modération des Commentaires

## Vue d'ensemble
Les commentaires sont maintenant **affichés par défaut** et **modérés à posteriori** au lieu d'être approuvés avant publication.

## Changements Effectués

### 1. Modèle Comment (`api/src/models/Comment.js`)
- **Avant**: `isApproved: { default: false }`
- **Après**: `isApproved: { default: true }`

### 2. Contrôleur Comment (`api/src/controllers/commentController.js`)
- **Supprimé**: Logique d'auto-approbation basée sur le rôle utilisateur
- **Supprimé**: Vérification du nombre de commentaires approuvés
- **Simplifié**: Création directe de commentaires avec `isApproved: true` par défaut
- **Supprimé**: Ajout automatique dans `moderationHistory`

### 3. Nouveau Comportement
- Tous les nouveaux commentaires sont **immédiatement visibles**
- La modération se fait **après publication**
- Les modérateurs peuvent toujours **rejeter** des commentaires inappropriés
- Les utilisateurs peuvent **signaler** des commentaires problématiques

## Scripts de Migration

### Test de Vérification
```bash
node test-comment-default-approval.js
```
Vérifie que les nouveaux commentaires sont créés avec `isApproved: true` par défaut.

### Migration des Données Existantes
```bash
node src/scripts/migrate-comments-to-default-approved.js
```
Met à jour tous les commentaires existants avec `isApproved: false` vers `isApproved: true`.

## Impact sur le Frontend

### Composants Affectés
- **Moderation Dashboard**: Affiche maintenant les commentaires signalés plutôt que en attente
- **Pending Comments**: Peut être vide ou afficher des commentaires signalés
- **Reported Comments**: Devient plus important pour la modération

### Logique de Modération
- **Avant**: Approuver → Afficher
- **Après**: Afficher → Modérer si nécessaire

## Avantages du Nouveau Système

1. **Meilleure Expérience Utilisateur**: Les commentaires apparaissent immédiatement
2. **Modération Réactive**: Réponse aux problèmes réels plutôt qu'anticipation
3. **Réduction de la Charge**: Plus besoin d'approuver chaque commentaire
4. **Transparence**: Les utilisateurs voient leurs commentaires publiés instantanément

## Considérations de Sécurité

- Les modérateurs peuvent toujours **supprimer** des commentaires inappropriés
- Le système de **signalement** permet aux utilisateurs de signaler les abus
- L'**historique de modération** est conservé pour traçabilité
- Les **rôles et permissions** restent inchangés

## Tests Recommandés

1. Créer un commentaire en tant qu'utilisateur normal
2. Vérifier qu'il apparaît immédiatement
3. Tester le signalement d'un commentaire
4. Vérifier que les modérateurs peuvent toujours rejeter/supprimer
5. Tester la migration des données existantes
