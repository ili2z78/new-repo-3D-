# 🎮 Projet Labyrinthe 3D - Répartition des Tâches

Ce document présente la répartition du travail pour l'équipe de 4 étudiants. Chaque membre est responsable d'une partie spécifique du code et de sa présentation.

---

## 👨‍💻 Ilian : Entités Joueurs & Contrôles (`Player.js`)
**Responsabilités :**
- Modélisation 3D procédurale des personnages (Robot, Spike, Orb).
- Système de contrôles : Mode Solo (ZQSD + Flèches) vs Mode Multi (Séparation des touches).
- Physique de déplacement et gestion des collisions avec glissement.
- Animations de flottement (`bobbing`) et effets visuels des avatars.

**Points clés pour l'oral :**
- *"J'ai conçu les avatars en utilisant uniquement des primitives mathématiques pour éviter les fichiers externes lourds."*
- *"La gestion des collisions permet un mouvement fluide : le joueur glisse contre les murs au lieu d'être bloqué net."*

---

## 👨‍💻 Hasham : Moteur de Jeu & Split-Screen (`Game.js` - Partie 1)
**Responsabilités :**
- Initialisation de la scène THREE.js et du moteur de rendu (Renderer).
- Gestion du **Split-Screen** : Utilisation de `setViewport` et `setScissor` pour diviser l'écran.
- Boucle d'animation principale (`animate`) et mise à jour de la logique de jeu.
- Gestion de l'état du jeu (Démarrage, Reset, Fin de partie).

**Points clés pour l'oral :**
- *"Mon rôle a été de structurer le moteur de rendu pour supporter le jeu à deux en local sur un seul écran."*
- *"J'ai optimisé la boucle d'animation pour garantir 60 FPS, même avec deux caméras rendues simultanément."*

---

## 👨‍💻 Lam : Systèmes de Caméras & Interface (`Game.js` - Partie 2)
**Responsabilités :**
- Système de caméras dynamiques : Basculement entre 1ère personne, 3ème personne et Vue de dessus.
- Logique de masquage du joueur en vue 1ère personne (pour ne pas voir l'intérieur de sa propre tête).
- Interface Utilisateur (UI) : Chronomètre, menus de sélection et écrans de victoire.
- Gestion des événements fenêtres (Resize, Keydown).

**Points clés pour l'oral :**
- *"J'ai implémenté trois modes de vue différents pour varier le gameplay, dont une vue 'Hacker' de dessus."*
- *"J'ai géré l'UI pour qu'elle soit immersive et réactive, avec un système de chronomètre précis pour le speedrun."*

---

## 👨‍💻 Mory : Génération du Labyrinthe & Environnement (`Labyrinth.js` + Assets)
**Responsabilités :**
- Algorithme de génération procédurale (Recursive Backtracking).
- Création des textures procédurales (Canvas) pour le sol, les murs et le plafond.
- Éclairage et Effets : Lumières directionnelles, ombres portées et système de brouillard (`Fog`).
- Éléments du décor : Bornes de départ/arrivée et faisceaux lumineux néons.

**Points clés pour l'oral :**
- *"Le labyrinthe est généré différemment à chaque partie grâce à un algorithme récursif, garantissant un chemin unique."*
- *"Toutes les textures sont générées par code (CanvasTexture), ce qui permet d'avoir un style néon cyberpunk sans aucune image externe."*

---

## 🚀 Installation
1. `npm install`
2. `npm run dev`
