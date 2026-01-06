# CRV - Compte Rendu de Vol (Frontend)

Application frontend pour la gestion des Comptes Rendus de Vol dans un contexte opérationnel aéronautique (handling).

## Stack Technique

- **Vue.js 3** - Framework JavaScript progressif
- **Vue Router** - Routing officiel pour Vue.js
- **Pinia** - State management pour Vue 3
- **Axios** - Client HTTP pour les appels API
- **Vite** - Build tool et serveur de développement

## Architecture

```
frontend/
├── src/
│   ├── main.js                 # Point d'entrée de l'application
│   ├── App.vue                 # Composant racine
│   ├── router/
│   │   └── index.js           # Configuration des routes
│   ├── stores/
│   │   ├── authStore.js       # Gestion de l'authentification
│   │   └── crvStore.js        # Gestion des CRV
│   ├── views/
│   │   ├── Login.vue          # Page de connexion
│   │   ├── Services.vue       # Page d'accueil des services
│   │   └── CRV/
│   │       ├── CRVHome.vue       # Sélection du type de CRV
│   │       ├── CRVArrivee.vue    # CRV Arrivée
│   │       ├── CRVDepart.vue     # CRV Départ
│   │       └── CRVTurnAround.vue # CRV Turn Around
│   ├── components/
│   │   └── crv/
│   │       ├── CRVHeader.vue      # Informations du vol
│   │       ├── CRVPersonnes.vue   # Personnel
│   │       ├── CRVEngins.vue      # Engins utilisés
│   │       ├── CRVPhases.vue      # Phases opérationnelles
│   │       ├── CRVCharges.vue     # Charges (passagers, bagages, fret)
│   │       ├── CRVEvenements.vue  # Événements et incidents
│   │       └── CRVValidation.vue  # Validation finale
│   └── services/
│       └── api.js             # Configuration Axios et API endpoints
├── public/                     # Ressources statiques
├── index.html                  # Template HTML principal
├── vite.config.js             # Configuration Vite
└── package.json               # Dépendances et scripts
```

## Types de CRV

### 1. CRV Arrivée
Opérations d'arrivée uniquement :
- Calage avion
- Déchargement bagages
- Déchargement fret
- Livraison bagages
- Nettoyage cabine

**Pas d'enregistrement, pas d'embarquement**

### 2. CRV Départ
Opérations de départ uniquement :
- Enregistrement passagers
- Chargement bagages
- Chargement fret
- Embarquement passagers
- Nettoyage cabine
- Repoussage

**Pas de déchargement, pas de livraison bagages**

### 3. CRV Turn Around
Opérations complètes (arrivée + départ) :
- **Arrivée** : Calage, déchargement, livraison bagages
- **Transition** : Nettoyage, avitaillement, contrôles techniques
- **Départ** : Enregistrement, chargement, embarquement, repoussage

## Installation

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn

### Étapes

1. Cloner le repository :
```bash
git clone <repository-url>
cd Front
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
```
Puis modifier `.env` avec l'URL de votre API backend.

4. Lancer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualise le build de production

## Déploiement sur Vercel

1. Connecter votre repository GitHub à Vercel
2. Configurer les variables d'environnement dans Vercel :
   - `VITE_API_URL` : URL de votre API backend
3. Déployer automatiquement à chaque push

## Logique Métier

### Saisie Progressive
- Pas de page "tout-en-un"
- Chaque section correspond à un moment réel de l'opération
- Les données sont saisies au fur et à mesure

### Règles Importantes
- **Zéro ≠ champ vide** : Une valeur de 0 doit être explicitement saisie
- **Activités non réalisées** : Doivent être marquées explicitement avec une raison
- **Pas de calculs manuels** : Les durées sont calculées automatiquement à partir des heures
- **Données structurées** : Pas de champs texte libre pour les données structurantes

### Workflow de Validation
1. Saisie de toutes les sections
2. Vérification des données
3. Certification par le validateur
4. Validation finale du CRV

## API Endpoints Utilisés

```javascript
// Authentication
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

// CRV
GET    /api/crv              // Liste des CRV
GET    /api/crv/:id          // Détails d'un CRV
POST   /api/crv              // Créer un CRV
PUT    /api/crv/:id/personnes
PUT    /api/crv/:id/engins
PUT    /api/crv/:id/phases
PUT    /api/crv/:id/charges
PUT    /api/crv/:id/evenements
POST   /api/crv/:id/validate // Valider le CRV
DELETE /api/crv/:id
```

## Contribution

Ce projet respecte strictement les spécifications métier du handling aéroportuaire. Toute modification doit être validée par les équipes opérationnelles.

## Licence

Propriétaire - Tous droits réservés
