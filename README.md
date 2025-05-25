# Vitrine Photo Portfolio

Une galerie photo pour présenter mon travail construite avec Next.js 15 et TypeScript.

## 🚀 Stack Technique

### Framework & Core
- **Next.js 15** - Framework React avec Server Components et App Router
- **React 19** - Bibliothèque UI avec Hooks et Server Components
- **TypeScript** - Typage statique pour plus de robustesse

### Styling & Animations
- **TailwindCSS** - Utilitaires CSS pour un styling flexible
- **Framer Motion** - Animations fluides et interactions avancées

### Performance & Optimisation
- **Sharp** - Traitement et optimisation des images
- **Plaiceholder** - Génération de placeholders flous pour le chargement progressif
- **React Masonry CSS** - Layout masonry responsive pour la galerie

### Qualité & Développement
- **ESLint** - Linting du code
- **Next.js Dev Server** - Serveur de développement avec Hot Reloading

## 🛠️ Installation

```bash
# Cloner le repo
git clone [votre-repo]

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## 📸 Fonctionnalités

- Navigation fluide entre les collections de photos
- Optimisation automatique des images
- Interface inspirée des terminaux Unix
- Chargement progressif des images
- Layout responsive (mobile, tablette, desktop)
- Animation de chargement type "skeleton"
- Vue détaillée des photos en plein écran

## 📦 Structure du Projet

```
src/

## 🚀 Déploiement

Le site est automatiquement déployé sur GitHub Pages à chaque push sur la branche main. Le workflow de déploiement :

1. Build le projet en statique avec Next.js
2. Déploie les fichiers générés sur GitHub Pages
3. Le site est accessible à [votre-username].github.io/oscar-portfolio

Pour déployer manuellement :

```bash
# Build le projet
npm run build

# Les fichiers statiques seront générés dans le dossier 'out'
```

## 🔧 Configuration

Le site est configuré pour un déploiement statique avec :
- Export statique Next.js
- Images non optimisées au runtime (pré-optimisées)
- Base path configuré pour GitHub Pages
├── app/              # Routes et pages Next.js
├── components/       # Composants React réutilisables
├── utils/           # Utilitaires et fonctions helpers
└── types/           # Types TypeScript
public/
├── photos/          # Photos originales
└── optimized/       # Photos optimisées (généré)
```