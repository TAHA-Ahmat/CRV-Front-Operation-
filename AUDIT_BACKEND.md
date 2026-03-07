# AUDIT BACKEND EXHAUSTIF — CRV OPERATION
## Mode "Peigne Fin" — Date : 2026-03-02

---

# PART 1/4 : Arborescence, Démarrage, Config, Table des Routes

---

## 1. ARBORESCENCE `src/`

```
src/
├── server.js                                    # Point d'entrée principal
├── app.js                                       # Configuration Express + montage routes
│
├── config/
│   ├── env.js                                   # Variables d'environnement
│   ├── db.js                                    # Connexion MongoDB
│   ├── documents.config.js                      # Config PDF/archivage par type document
│   └── json/                                    # Credentials Google Drive (service account)
│
├── models/
│   ├── bulletin/
│   │   └── BulletinMouvement.js                 # Prévisions 3-4 jours (769 lignes)
│   ├── charges/
│   │   └── ChargeOperationnelle.js              # Passagers/Bagages/Fret (678 lignes)
│   ├── crv/
│   │   ├── CRV.js                               # Modèle principal CRV (310 lignes)
│   │   ├── Observation.js                       # Observations CRV
│   │   └── HistoriqueModification.js            # Audit trail modifications
│   ├── flights/
│   │   ├── Vol.js                               # Vol opérationnel (114 lignes)
│   │   ├── ProgrammeVol.js                      # Conteneur programme 6 mois (419 lignes)
│   │   ├── ProgrammeVolSaisonnier.js            # Lignes programme saisonnier (882 lignes)
│   │   └── VolProgramme.js                      # Vols dans un programme (499 lignes)
│   ├── notifications/
│   │   └── Notification.js                      # Notifications in-app (138 lignes)
│   ├── phases/
│   │   ├── Phase.js                             # Définition phases opérationnelles
│   │   ├── ChronologiePhase.js                  # Exécution phases dans un CRV
│   │   └── Horaire.js                           # Horaires prévu/réel
│   ├── referentials/
│   │   └── Avion.js                             # Configuration aéronefs (226 lignes)
│   ├── resources/
│   │   ├── Engin.js                             # Matériel au sol
│   │   └── AffectationEnginVol.js               # Affectation engin → vol
│   ├── security/
│   │   ├── Personne.js                          # Utilisateurs (87 lignes)
│   │   └── UserActivityLog.js                   # Audit trail global (203 lignes)
│   ├── transversal/
│   │   ├── AffectationPersonneVol.js            # Affectation personnel → vol
│   │   └── EvenementOperationnel.js             # Événements/incidents
│   └── validation/
│       └── ValidationCRV.js                     # Validation + verrouillage CRV
│
├── controllers/
│   ├── bulletin/
│   │   └── bulletinMouvement.controller.js      # 15 fonctions
│   ├── charges/
│   │   ├── passager.controller.js               # 7 fonctions
│   │   └── fret.controller.js                   # 7 fonctions
│   ├── crv/
│   │   ├── crv.controller.js                    # 21 fonctions (plus gros controller)
│   │   ├── annulation.controller.js             # 5 fonctions
│   │   └── crvArchivage.controller.js           # 8 fonctions
│   ├── flights/
│   │   ├── vol.controller.js                    # 4 fonctions
│   │   ├── programmeVol.controller.js           # 12 fonctions
│   │   └── volProgramme.controller.js           # 16 fonctions
│   ├── notifications/
│   │   ├── notification.controller.js           # 8 fonctions
│   │   └── alerteSLA.controller.js              # 7 fonctions
│   ├── phases/
│   │   └── phase.controller.js                  # 7 fonctions
│   ├── referentials/
│   │   └── avionConfiguration.controller.js     # 12 fonctions
│   ├── resources/
│   │   └── engin.controller.js                  # 11 fonctions
│   ├── security/
│   │   ├── auth.controller.js                   # 4 fonctions
│   │   └── personne.controller.js               # 6 fonctions
│   └── validation/
│       └── validation.controller.js             # 4 fonctions
│
├── services/
│   ├── crv/
│   │   ├── crv.service.js                       # Complétude, SLA, numérotation
│   │   ├── annulation.service.js                # Annulation/réactivation
│   │   └── crvArchivageService.js               # Archivage Google Drive CRV
│   ├── documents/
│   │   ├── base/
│   │   │   ├── DocumentGenerator.js             # Classe abstraite PDF (pdfmake)
│   │   │   └── DocumentArchiver.js              # Archiveur universel Drive
│   │   ├── crv/
│   │   │   ├── CrvGenerator.js                  # Générateur PDF CRV
│   │   │   └── crvArchivage.service.js          # Service archivage CRV
│   │   ├── bulletin/
│   │   │   ├── BulletinMouvementGenerator.js    # Générateur PDF bulletin
│   │   │   └── bulletinArchivage.service.js     # Service archivage bulletin
│   │   └── programmeVol/
│   │       └── ProgrammeVolGenerator.js         # Générateur PDF programme
│   ├── integrations/
│   │   ├── googleDriveService.js                # API Google Drive
│   │   └── pdfService.js                        # Utilitaire PDF legacy
│   ├── notifications/
│   │   ├── notification.service.js              # Email + in-app
│   │   └── alerteSLA.service.js                 # Alertes SLA proactives
│   └── statistiques/
│       └── statistiques.service.js              # Stats bulletin vs CRV
│
├── middlewares/
│   ├── auth.middleware.js                       # protect, authorize, excludeQualite
│   ├── validation.middleware.js                 # express-validator
│   ├── businessRules.middleware.js              # Règles métier CRV
│   ├── auditRequest.middleware.js               # Init audit (début requête)
│   ├── auditLog.middleware.js                   # Audit CRV (HistoriqueModification)
│   ├── auditFinalize.middleware.js              # Audit global (UserActivityLog)
│   ├── error.middleware.js                      # Gestion erreurs centralisée
│   └── Auth/                                    # (vide)
│
├── utils/
│   ├── seedPhases.js                            # Seed phases opérationnelles
│   ├── seedAdmin.js                             # Seed utilisateur admin
│   ├── seedProgrammeVols.js                     # Seed programme de vols
│   └── generateProgrammeVols.js                 # Génération programme test
│
└── assets/
    └── fonts/                                   # Polices pour pdfmake (DejaVuSans)
```

**Total : 127 fichiers JS | 21 modèles | 17 controllers (125+ fonctions) | 13 fichiers routes**

---

## 1b. DÉMARRAGE SERVEUR

### Fichier : `src/server.js` (45 lignes)

Flux exact :
1. `import app from './app.js'` — Charge l'app Express configurée
2. `import { config } from './config/env.js'` — Charge les variables d'env
3. `import { connectDB } from './config/db.js'` — Charge le connecteur MongoDB
4. `await connectDB()` — Connexion MongoDB (Atlas ou local)
5. `app.listen(config.port)` — Démarre le serveur HTTP
6. Handlers `SIGTERM` et `SIGINT` pour arrêt propre

### Fichier : `src/app.js` (100 lignes)

Ordre exact du middleware pipeline :
```
1. helmet()                           # Headers sécurité
2. cors({ origin, credentials })      # CORS
3. morgan('dev')                      # Logs HTTP (dev only)
4. express.json()                     # Parse JSON body
5. express.urlencoded({ extended })   # Parse URL-encoded
6. auditRequestMiddleware             # Init audit (requestId, timing)
7. rateLimit (200 req/min)            # Rate limiting sur /api/
8. === MONTAGE DES 13 ROUTES ===
9. auditFinalizeMiddleware            # Écriture UserActivityLog
10. notFound                          # 404 handler
11. errorHandler                      # Erreur globale
```

Montage des routes (dans l'ordre de `app.js`) :

| Ligne | Base Path | Fichier Route |
|-------|-----------|---------------|
| 72 | `/api/auth` | `routes/security/auth.routes.js` |
| 73 | `/api/personnes` | `routes/security/personne.routes.js` |
| 74 | `/api/crv` | `routes/crv/crv.routes.js` |
| 75 | `/api/vols` | `routes/flights/vol.routes.js` |
| 76 | `/api/phases` | `routes/phases/phase.routes.js` |
| 77 | `/api/validation` | `routes/validation/validation.routes.js` |
| 79 | `/api/programmes-vol` | `routes/flights/programmeVol.routes.js` |
| 82 | `/api/bulletins` | `routes/bulletin/bulletinMouvement.routes.js` |
| 84 | `/api/avions` | `routes/referentials/avion.routes.js` |
| 86 | `/api/charges` | `routes/charges/charge.routes.js` |
| 88 | `/api/engins` | `routes/resources/engin.routes.js` |
| 90 | `/api/notifications` | `routes/notifications/notification.routes.js` |
| 92 | `/api/sla` | `routes/notifications/alerteSLA.routes.js` |

---

## 2. CONFIG / VARIABLES D'ENVIRONNEMENT

### Fichier : `src/config/env.js` (18 lignes)

| Variable ENV | Nom config | Default | Où utilisée |
|---|---|---|---|
| `PORT` | `config.port` | `3000` | `server.js:9` |
| `NODE_ENV` | `config.nodeEnv` | `'development'` | `app.js:45` (morgan), `error.middleware.js` (stack trace) |
| `MONGO_URI` | `config.mongoUri` | `'mongodb://localhost:27017/crv'` | `db.js:6` |
| `JWT_SECRET` | `config.jwtSecret` | `'your-secret-key-change-in-production'` | `auth.middleware.js:26`, `auth.controller.js` |
| `JWT_EXPIRATION` | `config.jwtExpiration` | `'24h'` | `auth.controller.js` (jwt.sign) |
| `CORS_ORIGIN` | `config.corsOrigin` | `'*'` | `app.js:41` |
| `RATE_LIMIT_WINDOW_MS` | `config.rateLimitWindowMs` | `60000` (1 min) | `app.js:56` |
| `RATE_LIMIT_MAX_REQUESTS` | `config.rateLimitMaxRequests` | `200` | `app.js:57` |
| `GOOGLE_DRIVE_CREDENTIALS_PATH` | `config.googleDriveCredentialsPath` | `'./config/archivagebonsdecommande.json'` | `googleDriveService.js` |
| `GOOGLE_DRIVE_FOLDER_ID` | `config.googleDriveFolderId` | `''` | `googleDriveService.js` |

### Variables lues directement par `notification.service.js` (pas dans `env.js`)

| Variable ENV | Usage |
|---|---|
| `SMTP_HOST` | Serveur SMTP (nodemailer) |
| `SMTP_PORT` | Port SMTP |
| `SMTP_USER` | User SMTP |
| `SMTP_PASS` | Password SMTP |
| `FRONTEND_URL` | Liens dans les emails |

---

## 3. TABLE EXHAUSTIVE DES ROUTES API

### 3a. AUTH (`/api/auth`) — `src/routes/security/auth.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| POST | `/api/auth/login` | `login` | Non | - | email, password | Connexion |
| POST | `/api/auth/register` | `register` | Non | - | nom, prenom, matricule, email, password, fonction | Inscription (ADMIN exclu) |
| GET | `/api/auth/me` | `getMe` | Oui | Tous | - | Profil connecté |
| POST | `/api/auth/changer-mot-de-passe` | `changerMotDePasse` | Oui | Tous | ancienMotDePasse, nouveauMotDePasse | Changer mdp |
| POST | `/api/auth/connexion` | `login` (alias) | Non | - | email, motDePasse/password | Alias login |
| POST | `/api/auth/inscription` | `register` (alias) | Non | - | Idem register | Alias register |
| POST | `/api/auth/deconnexion` | inline | Non | - | - | Logout (client-side) |

### 3b. PERSONNES (`/api/personnes`) — `src/routes/security/personne.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| GET | `/api/personnes` | `getAllPersonnes` | Oui | Tous | - | Liste utilisateurs |
| GET | `/api/personnes/stats/global` | `getPersonnesStats` | Oui | Tous | - | Stats utilisateurs |
| GET | `/api/personnes/:id` | `getPersonneById` | Oui | Tous | - | Détail utilisateur |
| POST | `/api/personnes` | `createPersonne` | Oui | **ADMIN** | nom, prenom, email, password, fonction | Créer utilisateur |
| PUT | `/api/personnes/:id` | `updatePersonne` | Oui | **ADMIN** | email?, password?, fonction?, statut? | Modifier utilisateur |
| PATCH | `/api/personnes/:id` | `updatePersonne` | Oui | **ADMIN** | Idem PUT | Modifier utilisateur |
| DELETE | `/api/personnes/:id` | `deletePersonne` | Oui | **ADMIN** | - | Supprimer utilisateur |

### 3c. CRV (`/api/crv`) — `src/routes/crv/crv.routes.js` (392 lignes)

| Method | Path | Controller | Auth | Rôle | Validation | Middleware métier | Description |
|--------|------|-----------|------|------|-----------|-------------------|-------------|
| POST | `/api/crv` | `creerCRV` | Oui | !QUALITE | bulletinId?, mouvementId?, vol?, volId?, escale?, forceDoublon? | verifierPhasesAutoriseesCreationCRV, auditLog(CREATION) | Créer CRV (3 paths) |
| GET | `/api/crv` | `listerCRVs` | Oui | Tous | - | - | Liste CRVs |
| GET | `/api/crv/search` | `rechercherCRV` | Oui | Tous | - | - | Recherche avancée |
| GET | `/api/crv/stats` | `obtenirStatsCRV` | Oui | Tous | - | - | Statistiques KPI |
| GET | `/api/crv/export` | `exporterCRVExcel` | Oui | Tous | - | - | Export Excel |
| GET | `/api/crv/vols-sans-crv` | `obtenirVolsSansCRV` | Oui | Tous | - | - | Vols sans CRV du jour |
| GET | `/api/crv/annules` | `obtenirCRVAnnules` | Oui | Tous | - | - | CRVs annulés |
| GET | `/api/crv/statistiques/annulations` | `obtenirStatistiquesAnnulations` | Oui | !QUALITE | - | - | Stats annulations |
| GET | `/api/crv/:id` | `obtenirCRV` | Oui | Tous | - | - | Détail CRV complet |
| DELETE | `/api/crv/:id` | `supprimerCRV` | Oui | !QUALITE | - | auditLog(SUPPRESSION) | Supprimer CRV |
| GET | `/api/crv/:id/transitions` | `obtenirTransitionsPossibles` | Oui | Tous | - | - | Transitions possibles |
| POST | `/api/crv/:id/demarrer` | `demarrerCRV` | Oui | !QUALITE | - | auditLog(MISE_A_JOUR) | BROUILLON→EN_COURS |
| POST | `/api/crv/:id/terminer` | `terminerCRV` | Oui | !QUALITE | - | auditLog(MISE_A_JOUR) | EN_COURS→TERMINE |
| POST | `/api/crv/:id/confirmer-absence` | `confirmerAbsence` | Oui | !QUALITE | type | verifierCRVNonVerrouille, auditLog | Confirmer absence données |
| DELETE | `/api/crv/:id/confirmer-absence` | `annulerConfirmationAbsence` | Oui | !QUALITE | type | verifierCRVNonVerrouille, auditLog | Annuler confirmation |
| PATCH | `/api/crv/:id` | `mettreAJourCRV` | Oui | !QUALITE | - | verifierCRVNonVerrouille, auditLog | Modifier CRV |
| PUT | `/api/crv/:id` | `mettreAJourCRV` | Oui | !QUALITE | - | verifierCRVNonVerrouille, auditLog | Modifier CRV (alias) |
| POST | `/api/crv/:id/charges` | `ajouterCharge` | Oui | !QUALITE | typeCharge, sensOperation | verifierCRVNonVerrouille, validerCoherenceCharges, auditLog | Ajouter charge |
| POST | `/api/crv/:id/evenements` | `ajouterEvenement` | Oui | !QUALITE | typeEvenement, gravite, description | verifierCRVNonVerrouille, auditLog | Ajouter événement |
| POST | `/api/crv/:id/observations` | `ajouterObservation` | Oui | !QUALITE | categorie, contenu | verifierCRVNonVerrouille, auditLog | Ajouter observation |
| PUT | `/api/crv/:id/personnel` | `mettreAJourPersonnel` | Oui | !QUALITE | personnelAffecte[] | verifierCRVNonVerrouille, auditLog | Remplacer personnel |
| POST | `/api/crv/:id/personnel` | `ajouterPersonnel` | Oui | !QUALITE | nom, prenom, fonction | verifierCRVNonVerrouille, auditLog | Ajouter personnel |
| DELETE | `/api/crv/:id/personnel/:personneId` | `supprimerPersonnel` | Oui | !QUALITE | - | verifierCRVNonVerrouille, auditLog | Retirer personnel |
| GET | `/api/crv/:id/engins` | `obtenirEnginsAffectes` | Oui | Tous | - | - | Engins affectés |
| PUT | `/api/crv/:id/engins` | `mettreAJourEnginsAffectes` | Oui | !QUALITE | engins[] | verifierCRVNonVerrouille, auditLog | Remplacer engins |
| POST | `/api/crv/:id/engins` | `ajouterEnginAuCRV` | Oui | !QUALITE | enginId, usage | verifierCRVNonVerrouille, auditLog | Ajouter engin |
| DELETE | `/api/crv/:id/engins/:affectationId` | `retirerEnginDuCRV` | Oui | !QUALITE | - | verifierCRVNonVerrouille, auditLog | Retirer engin |
| PUT | `/api/crv/:crvId/phases/:phaseId` | `mettreAJourPhaseCRV` | Oui | !QUALITE | - | auditLog | Modifier phase CRV |
| PUT | `/api/crv/:id/horaire` | `mettreAJourHoraire` | Oui | !QUALITE | - | verifierCRVNonVerrouille, auditLog | Modifier horaires |
| GET | `/api/crv/archive/status` | `getArchivageStatus` | **Non** | - | - | - | Statut service archivage |
| POST | `/api/crv/archive/test` | `testerArchivage` | Oui | !QUALITE | - | - | Test archivage |
| POST | `/api/crv/:id/archive` | `archiverCRV` | Oui | !QUALITE | - | - | Archiver PDF Drive |
| GET | `/api/crv/:id/archive/status` | `verifierArchivageCRV` | Oui | Tous | - | - | Vérifier archivabilité |
| GET | `/api/crv/:id/archivage` | `obtenirInfosArchivage` | Oui | Tous | - | - | Infos archivage |
| GET | `/api/crv/:id/export-pdf` | `obtenirDonneesPDF` | Oui | Tous | - | - | Données PDF (JSON) |
| GET | `/api/crv/:id/telecharger-pdf` | `telechargerPDF` | Oui | Tous | - | - | Télécharger PDF |
| GET | `/api/crv/:id/pdf-base64` | `obtenirPDFBase64` | Oui | Tous | - | - | PDF en base64 |
| GET | `/api/crv/:id/peut-annuler` | `verifierPeutAnnuler` | Oui | Tous | - | - | Peut annuler ? |
| POST | `/api/crv/:id/annuler` | `annulerCRV` | Oui | !QUALITE | - | auditLog | Annuler CRV |
| POST | `/api/crv/:id/reactiver` | `reactiverCRV` | Oui | !QUALITE | - | auditLog | Réactiver CRV |

### 3d. VOLS (`/api/vols`) — `src/routes/flights/vol.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| POST | `/api/vols` | `creerVol` | Oui | !QUALITE | numeroVol, typeOperation, compagnieAerienne, codeIATA, dateVol | Créer vol opérationnel |
| GET | `/api/vols` | `listerVols` | Oui | Tous | - | Liste vols |
| GET | `/api/vols/:id` | `obtenirVol` | Oui | Tous | - | Détail vol |
| PATCH | `/api/vols/:id` | `mettreAJourVol` | Oui | !QUALITE | - | Modifier vol |

### 3e. PROGRAMMES VOL (`/api/programmes-vol`) — `src/routes/flights/programmeVol.routes.js` (274 lignes)

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| POST | `/api/programmes-vol` | `creerProgramme` | Oui | !QUALITE | - | Créer programme |
| GET | `/api/programmes-vol` | `obtenirProgrammes` | Oui | Tous | - | Liste programmes |
| GET | `/api/programmes-vol/actif` | `obtenirProgrammeActif` | Oui | Tous | - | Programme actif |
| GET | `/api/programmes-vol/:id` | `obtenirProgrammeParId` | Oui | Tous | - | Détail programme |
| PATCH | `/api/programmes-vol/:id` | `mettreAJourProgramme` | Oui | !QUALITE | - | Modifier programme |
| DELETE | `/api/programmes-vol/:id` | `supprimerProgramme` | Oui | OPS only | - | Supprimer programme |
| POST | `/api/programmes-vol/:id/valider` | `validerProgramme` | Oui | OPS only | - | BROUILLON→VALIDE |
| POST | `/api/programmes-vol/:id/activer` | `activerProgramme` | Oui | OPS only | - | VALIDE→ACTIF |
| POST | `/api/programmes-vol/:id/suspendre` | `suspendreProgramme` | Oui | OPS only | - | ACTIF→SUSPENDU |
| POST | `/api/programmes-vol/:id/dupliquer` | `dupliquerProgramme` | Oui | !QUALITE | - | Dupliquer programme |
| GET | `/api/programmes-vol/:id/statistiques` | `obtenirStatistiques` | Oui | Tous | - | Stats programme |
| GET | `/api/programmes-vol/:id/resume` | `obtenirResume` | Oui | Tous | - | Résumé programme |
| POST | `/api/programmes-vol/:pId/vols` | `ajouterVol` | Oui | !QUALITE | - | Ajouter vol au programme |
| GET | `/api/programmes-vol/:pId/vols` | `obtenirVols` | Oui | Tous | - | Vols du programme |
| GET | `/api/programmes-vol/:pId/vols/jour/:jour` | `obtenirVolsParJour` | Oui | Tous | - | Vols par jour (0-6) |
| GET | `/api/programmes-vol/:pId/vols/recherche` | `rechercherVols` | Oui | Tous | - | Recherche vols |
| GET | `/api/programmes-vol/:pId/vols/compagnie/:code` | `obtenirVolsParCompagnie` | Oui | Tous | - | Vols par compagnie |
| POST | `/api/programmes-vol/:pId/vols/import` | `importerVols` | Oui | !QUALITE | - | Import bulk vols |
| PATCH | `/api/programmes-vol/:pId/vols/reorganiser` | `reorganiserVols` | Oui | !QUALITE | - | Réordonner vols |
| GET | `/api/programmes-vol/:pId/vols/:id` | `obtenirVolParId` | Oui | Tous | - | Détail vol programme |
| PATCH | `/api/programmes-vol/:pId/vols/:id` | `modifierVol` | Oui | !QUALITE | - | Modifier vol |
| DELETE | `/api/programmes-vol/:pId/vols/:id` | `supprimerVol` | Oui | OPS only | - | Supprimer vol |
| GET | `/api/programmes-vol/:pId/export-pdf` | `obtenirDonneesPDF` | Oui | Tous | - | Données PDF |
| POST | `/api/programmes-vol/:pId/archiver` | `archiverProgramme` | Oui | !QUALITE | - | Archiver Drive |
| GET | `/api/programmes-vol/:pId/archivage/status` | `verifierArchivage` | Oui | Tous | - | Statut archivage |
| GET | `/api/programmes-vol/:pId/archivage` | `obtenirInfosArchivage` | Oui | Tous | - | Infos archivage |
| GET | `/api/programmes-vol/:pId/telecharger-pdf` | `telechargerPDF` | Oui | Tous | - | Télécharger PDF |
| GET | `/api/programmes-vol/:pId/pdf-base64` | `obtenirPDFBase64` | Oui | Tous | - | PDF base64 |

### 3f. BULLETINS (`/api/bulletins`) — `src/routes/bulletin/bulletinMouvement.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| POST | `/api/bulletins` | `creerBulletin` | Oui | !QUALITE | - | Créer bulletin vide |
| POST | `/api/bulletins/depuis-programme` | `creerBulletinDepuisProgramme` | Oui | !QUALITE | - | Créer depuis programme |
| GET | `/api/bulletins` | `listerBulletins` | Oui | Tous | - | Liste bulletins |
| GET | `/api/bulletins/en-cours/:escale` | `obtenirBulletinEnCours` | Oui | Tous | - | Bulletin actif escale |
| GET | `/api/bulletins/escales-actives` | `getEscalesActives` | Oui | Tous | - | Escales avec bulletin |
| GET | `/api/bulletins/:id` | `obtenirBulletinParId` | Oui | Tous | - | Détail bulletin |
| DELETE | `/api/bulletins/:id` | `supprimerBulletin` | Oui | OPS only | - | Supprimer (BROUILLON) |
| POST | `/api/bulletins/:id/mouvements` | `ajouterMouvement` | Oui | !QUALITE | - | Ajouter mouvement |
| POST | `/api/bulletins/:id/mouvements/hors-programme` | `ajouterVolHorsProgramme` | Oui | !QUALITE | - | Mouvement hors programme |
| PATCH | `/api/bulletins/:id/mouvements/:mId` | `modifierMouvement` | Oui | !QUALITE | - | Modifier mouvement |
| DELETE | `/api/bulletins/:id/mouvements/:mId` | `supprimerMouvement` | Oui | !QUALITE | - | Supprimer mouvement |
| POST | `/api/bulletins/:id/mouvements/:mId/annuler` | `annulerMouvement` | Oui | !QUALITE | - | Annuler mouvement |
| POST | `/api/bulletins/:id/publier` | `publierBulletin` | Oui | !QUALITE | - | BROUILLON→PUBLIE |
| POST | `/api/bulletins/:id/archiver` | `archiverBulletin` | Oui | !QUALITE | - | PUBLIE→ARCHIVE |
| POST | `/api/bulletins/:id/creer-vols` | `creerVolsDepuisBulletin` | Oui | !QUALITE | - | Créer vols réels |

### 3g. PHASES (`/api/phases`) — `src/routes/phases/phase.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Middleware métier | Description |
|--------|------|-----------|------|------|-----------|-------------------|-------------|
| GET | `/api/phases` | `listerPhases` | Oui | Tous | - | - | Phases d'un CRV (?crvId=) |
| GET | `/api/phases/:id` | `obtenirPhase` | Oui | Tous | - | - | Détail phase |
| POST | `/api/phases/:id/demarrer` | `demarrerPhaseController` | Oui | !QUALITE | - | verifierCoherencePhaseTypeOperation, auditLog | Démarrer phase |
| POST | `/api/phases/:id/terminer` | `terminerPhaseController` | Oui | !QUALITE | - | verifierCoherencePhaseTypeOperation, auditLog | Terminer phase |
| POST | `/api/phases/:id/non-realise` | `marquerPhaseNonRealisee` | Oui | !QUALITE | motifNonRealisation, detailMotif | verifierCoherence, verifierJustification, auditLog | Phase non réalisée |
| PATCH | `/api/phases/:id` | `mettreAJourPhase` | Oui | !QUALITE | - | verifierCoherencePhaseTypeOperation, auditLog | Modifier phase |

### 3h. CHARGES (`/api/charges`) — `src/routes/charges/charge.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| PUT | `/api/charges/:id/categories-detaillees` | `mettreAJourCategoriesDetaillees` | Oui | !QUALITE | - | MaJ catégories passagers |
| PUT | `/api/charges/:id/classes` | `mettreAJourClassePassagers` | Oui | !QUALITE | - | MaJ classes passagers |
| PUT | `/api/charges/:id/besoins-medicaux` | `mettreAJourBesoinsMedicaux` | Oui | !QUALITE | - | MaJ besoins médicaux |
| PUT | `/api/charges/:id/mineurs` | `mettreAJourMineurs` | Oui | !QUALITE | - | MaJ infos mineurs |
| POST | `/api/charges/:id/convertir-categories-detaillees` | `convertirVersCategoriesDetaillees` | Oui | !QUALITE | - | Convertir basique→détaillé |
| GET | `/api/charges/statistiques/passagers` | `obtenirStatistiquesGlobalesPassagers` | Oui | Tous | - | Stats passagers globales |
| GET | `/api/charges/crv/:crvId/statistiques-passagers` | `obtenirStatistiquesPassagersCRV` | Oui | Tous | - | Stats passagers CRV |
| PUT | `/api/charges/:id/fret-detaille` | `mettreAJourFretDetaille` | Oui | !QUALITE | - | MaJ fret détaillé |
| POST | `/api/charges/:id/marchandises-dangereuses` | `ajouterMarchandiseDangereuse` | Oui | !QUALITE | - | Ajouter DGR |
| DELETE | `/api/charges/:id/marchandises-dangereuses/:mId` | `retirerMarchandiseDangereuse` | Oui | !QUALITE | - | Retirer DGR |
| POST | `/api/charges/valider-marchandise-dangereuse` | `validerMarchandiseDangereuse` | Oui | Tous | - | Valider DGR |
| GET | `/api/charges/marchandises-dangereuses` | `obtenirChargesAvecMarchandisesDangereuses` | Oui | Tous | - | Charges avec DGR |
| GET | `/api/charges/crv/:crvId/statistiques-fret` | `obtenirStatistiquesFretCRV` | Oui | Tous | - | Stats fret CRV |
| GET | `/api/charges/statistiques/fret` | `obtenirStatistiquesGlobalesFret` | Oui | Tous | - | Stats fret globales |

### 3i. VALIDATION (`/api/validation`) — `src/routes/validation/validation.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| GET | `/api/validation/:id` | `obtenirValidation` | Oui | Tous | - | Info validation CRV |
| POST | `/api/validation/:id/valider` | `validerCRVController` | Oui | !QUALITE | - | TERMINE→VALIDE→VERROUILLE |
| POST | `/api/validation/:id/verrouiller` | `verrouillerCRVController` | Oui | !QUALITE | - | VALIDE→VERROUILLE |
| POST | `/api/validation/:id/deverrouiller` | `deverrouillerCRVController` | Oui | !QUALITE | raison (body) | VERROUILLE→EN_COURS |

### 3j. ENGINS (`/api/engins`) — `src/routes/resources/engin.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| GET | `/api/engins/types` | `obtenirTypesEngins` | Oui | Tous | - | Types d'engins |
| GET | `/api/engins/disponibles` | `listerEnginsDisponibles` | Oui | Tous | - | Engins disponibles |
| GET | `/api/engins` | `listerEngins` | Oui | Tous | - | Liste engins |
| POST | `/api/engins` | `creerEngin` | Oui | **MANAGER, ADMIN** | numeroEngin, typeEngin | Créer engin |
| GET | `/api/engins/:id` | `obtenirEngin` | Oui | Tous | - | Détail engin |
| PUT | `/api/engins/:id` | `mettreAJourEngin` | Oui | **MANAGER, ADMIN** | - | Modifier engin |
| DELETE | `/api/engins/:id` | `supprimerEngin` | Oui | **ADMIN** | - | Supprimer engin |

### 3k. AVIONS (`/api/avions`) — `src/routes/referentials/avion.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| GET | `/api/avions/revisions/prochaines` | `obtenirAvionsRevisionProchaine` | Oui | Tous | - | Révisions à venir |
| GET | `/api/avions/statistiques/configurations` | `obtenirStatistiquesConfigurations` | Oui | Tous | - | Stats configs |
| GET | `/api/avions` | `listerAvions` | Oui | Tous | - | Liste avions |
| POST | `/api/avions` | `creerAvion` | Oui | !QUALITE | - | Créer avion |
| GET | `/api/avions/:id` | `obtenirAvion` | Oui | Tous | - | Détail avion |
| PUT | `/api/avions/:id/configuration` | `mettreAJourConfiguration` | Oui | !QUALITE | - | MaJ configuration |
| GET | `/api/avions/:id/versions/comparer` | `comparerVersions` | Oui | Tous | - | Comparer versions |
| POST | `/api/avions/:id/versions` | `creerNouvelleVersion` | Oui | !QUALITE | - | Nouvelle version |
| GET | `/api/avions/:id/versions` | `obtenirHistoriqueVersions` | Oui | Tous | - | Historique versions |
| GET | `/api/avions/:id/versions/:numVer` | `obtenirVersionSpecifique` | Oui | Tous | - | Version spécifique |
| POST | `/api/avions/:id/versions/:numVer/restaurer` | `restaurerVersion` | Oui | !QUALITE | - | Restaurer version |
| PUT | `/api/avions/:id/revision` | `mettreAJourRevision` | Oui | !QUALITE | - | MaJ révision |

### 3l. NOTIFICATIONS (`/api/notifications`) — `src/routes/notifications/notification.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| GET | `/api/notifications/count-non-lues` | `compterNonLues` | Oui | Tous | - | Compteur non lues |
| PATCH | `/api/notifications/lire-toutes` | `marquerToutesCommeLues` | Oui | Tous | - | Tout marquer lu |
| GET | `/api/notifications/statistiques` | `obtenirStatistiques` | Oui | Tous | - | Stats notifications |
| GET | `/api/notifications` | `obtenirMesNotifications` | Oui | Tous | - | Mes notifications |
| POST | `/api/notifications` | `creerNotification` | Oui | **MANAGER** | - | Créer notification |
| PATCH | `/api/notifications/:id/lire` | `marquerCommeLue` | Oui | Tous | - | Marquer lue |
| PATCH | `/api/notifications/:id/archiver` | `archiverNotification` | Oui | Tous | - | Archiver |
| DELETE | `/api/notifications/:id` | `supprimerNotification` | Oui | Tous | - | Supprimer |

### 3m. SLA (`/api/sla`) — `src/routes/notifications/alerteSLA.routes.js`

| Method | Path | Controller | Auth | Rôle | Validation | Description |
|--------|------|-----------|------|------|-----------|-------------|
| GET | `/api/sla/rapport` | `obtenirRapportSLA` | Oui | **MANAGER** | - | Rapport SLA complet |
| GET | `/api/sla/configuration` | `obtenirConfiguration` | Oui | Tous | - | Config SLA actuelle |
| PUT | `/api/sla/configuration` | `configurerSLA` | Oui | **MANAGER** | - | Configurer SLA |
| POST | `/api/sla/surveiller/crv` | `surveillerCRV` | Oui | **MANAGER** | - | Surveiller CRVs |
| POST | `/api/sla/surveiller/phases` | `surveillerPhases` | Oui | **MANAGER** | - | Surveiller phases |
| GET | `/api/sla/crv/:id` | `verifierSLACRV` | Oui | Tous | - | SLA d'un CRV |
| GET | `/api/sla/phase/:id` | `verifierSLAPhase` | Oui | Tous | - | SLA d'une phase |

### 3n. HEALTH CHECK (inline dans `app.js`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Non | Statut API |

**TOTAL : ~140 endpoints**

---

# PART 2/4 : Exemples JSON par Domaine + Modèles Mongoose

---

## 4. EXEMPLES JSON PAR DOMAINE

### 4a. AUTH

**POST `/api/auth/login`**
```json
// REQUEST
{ "email": "agent@ths.td", "password": "MonPass123" }

// RESPONSE 200
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "nom": "MAHAMAT",
    "prenom": "Ali",
    "email": "agent@ths.td",
    "fonction": "AGENT_ESCALE",
    "matricule": "THS-001"
  }
}

// RESPONSE 401
{
  "success": false,
  "message": "Email ou mot de passe incorrect"
}
```

**POST `/api/auth/register`**
```json
// REQUEST
{
  "nom": "OUMAR", "prenom": "Fatima", "matricule": "THS-042",
  "email": "fatima@ths.td", "password": "SecurePass1",
  "fonction": "CHEF_EQUIPE"
}

// RESPONSE 201
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "nom": "OUMAR",
    "prenom": "Fatima",
    "email": "fatima@ths.td",
    "fonction": "CHEF_EQUIPE",
    "matricule": "THS-042"
  }
}

// RESPONSE 400 (doublon)
{ "success": false, "message": "Cet email est déjà utilisé" }
```

### 4b. CRV

**POST `/api/crv`** (Path 1 : depuis bulletin)
```json
// REQUEST
{
  "bulletinId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "mouvementId": "65f1a2b3c4d5e6f7a8b9c0d2",
  "escale": "NDJ",
  "responsableVolId": "65f1a2b3c4d5e6f7a8b9c0d3"
}

// RESPONSE 201
{
  "success": true,
  "data": {
    "_id": "65f2...",
    "numeroCRV": "CRV260302-0001",
    "vol": {
      "numeroVol": "ET939",
      "typeOperation": "TURN_AROUND",
      "dateVol": "2026-03-02T00:00:00.000Z"
    },
    "escale": "NDJ",
    "statut": "BROUILLON",
    "completude": 0,
    "creePar": { "nom": "MAHAMAT", "prenom": "Ali" },
    "personnelAffecte": [],
    "materielUtilise": []
  }
}

// RESPONSE 409 (doublon)
{
  "success": false,
  "message": "Un CRV existe déjà pour ce vol à cette escale",
  "code": "CRV_DOUBLON",
  "existingCRV": {
    "_id": "65f1...",
    "numeroCRV": "CRV260302-0001",
    "statut": "EN_COURS"
  }
}
```

**POST `/api/crv/:id/demarrer`**
```json
// RESPONSE 200
{
  "success": true,
  "message": "CRV démarré avec succès",
  "data": { "_id": "65f2...", "statut": "EN_COURS", "completude": 5 }
}

// RESPONSE 400
{
  "success": false,
  "message": "Transition impossible: le CRV est déjà en cours"
}
```

**POST `/api/crv/:id/terminer`**
```json
// REQUEST (confirmations explicites requises si données absentes)
{
  "confirmations": {
    "pasDeCharge": true,
    "pasDEvenement": true
  }
}

// RESPONSE 200
{
  "success": true,
  "message": "CRV terminé avec succès",
  "data": { "_id": "65f2...", "statut": "TERMINE", "completude": 85 }
}

// RESPONSE 400
{
  "success": false,
  "message": "Complétude insuffisante (32%). Minimum requis: 50%",
  "completude": 32,
  "phasesObligatoiresManquantes": ["CALAGE_ARRET", "DEBARQUEMENT_PASSAGERS"]
}
```

### 4c. VOLS

**POST `/api/vols`**
```json
// REQUEST
{
  "numeroVol": "ET939",
  "typeOperation": "TURN_AROUND",
  "compagnieAerienne": "Ethiopian Airlines",
  "codeIATA": "ET",
  "aeroportOrigine": "ADD",
  "aeroportDestination": "ADD",
  "dateVol": "2026-03-02"
}

// RESPONSE 201
{
  "success": true,
  "data": {
    "_id": "65f3...",
    "numeroVol": "ET939",
    "typeOperation": "TURN_AROUND",
    "compagnieAerienne": "Ethiopian Airlines",
    "codeIATA": "ET",
    "dateVol": "2026-03-02T00:00:00.000Z",
    "statut": "PROGRAMME",
    "horsProgramme": false
  }
}
```

### 4d. CHARGES

**POST `/api/crv/:id/charges`**
```json
// REQUEST
{
  "typeCharge": "PASSAGERS",
  "sensOperation": "DEBARQUEMENT",
  "passagersAdultes": 120,
  "passagersEnfants": 15,
  "passagersPMR": 3,
  "passagersTransit": 0
}

// RESPONSE 201
{
  "success": true,
  "data": {
    "_id": "65f4...",
    "crv": "65f2...",
    "typeCharge": "PASSAGERS",
    "sensOperation": "DEBARQUEMENT",
    "passagersAdultes": 120,
    "passagersEnfants": 15,
    "passagersPMR": 3,
    "passagersTransit": 0,
    "totalPassagers": 138
  }
}

// RESPONSE 400
{
  "success": false,
  "message": "INTERDIT : Pour les passagers, vous devez saisir explicitement les valeurs (même si zéro)",
  "code": "VALEURS_EXPLICITES_REQUISES",
  "details": "Distinguez \"0 passagers\" (saisi) de \"non renseigné\" (absent)"
}
```

### 4e. PHASES

**POST `/api/phases/:id/demarrer`**
```json
// RESPONSE 200
{
  "success": true,
  "data": {
    "_id": "65f5...",
    "phase": { "code": "CALAGE_ARRET", "libelle": "Calage/Arrêt" },
    "statut": "EN_COURS",
    "heureDebutReelle": "2026-03-02T14:05:00.000Z"
  }
}

// RESPONSE 400 (incohérence type)
{
  "success": false,
  "message": "INTERDIT : Cette phase est de type DEPART et ne peut être utilisée sur un vol de type ARRIVEE",
  "code": "INCOHERENCE_TYPE_OPERATION",
  "details": {
    "phaseType": "DEPART",
    "volType": "ARRIVEE",
    "phaseLibelle": "Push-back"
  }
}
```

### 4f. BULLETINS

**POST `/api/bulletins/depuis-programme`**
```json
// REQUEST
{
  "escale": "NDJ",
  "dateDebut": "2026-03-02",
  "dateFin": "2026-03-05",
  "programmeId": "65f0..."
}

// RESPONSE 201
{
  "success": true,
  "message": "Bulletin créé avec 12 mouvements depuis le programme",
  "data": {
    "_id": "65f6...",
    "numeroBulletin": "BM-NDJ-20260302",
    "escale": "NDJ",
    "dateDebut": "2026-03-02",
    "dateFin": "2026-03-05",
    "statut": "BROUILLON",
    "nombreMouvements": 12,
    "mouvements": ["..."]
  }
}

// RESPONSE 409
{
  "success": false,
  "message": "Un bulletin existe déjà pour cette escale et cette période"
}
```

### 4g. SLA

**GET `/api/sla/crv/:id`**
```json
// RESPONSE 200
{
  "success": true,
  "data": {
    "crvId": "65f2...",
    "statut": "EN_COURS",
    "sla": {
      "BROUILLON_TO_EN_COURS": {
        "limite": 24,
        "ecoule": 2.5,
        "restant": 21.5,
        "pourcentage": 10,
        "niveau": "OK"
      },
      "EN_COURS_TO_TERMINE": {
        "limite": 48,
        "ecoule": 0.5,
        "restant": 47.5,
        "pourcentage": 1,
        "niveau": "OK"
      },
      "GLOBAL": {
        "limite": 168,
        "ecoule": 3,
        "restant": 165,
        "pourcentage": 2,
        "niveau": "OK"
      }
    }
  }
}
```

### 4h. NOTIFICATIONS

**GET `/api/notifications`**
```json
// RESPONSE 200
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65f7...",
      "type": "ALERTE_SLA",
      "titre": "SLA Warning - CRV260302-0001",
      "message": "Le CRV est en cours depuis 20h (seuil: 24h)",
      "lu": false,
      "priorite": "HAUTE",
      "source": "ALERTE_SLA",
      "createdAt": "2026-03-02T18:30:00.000Z"
    }
  ]
}

// RESPONSE 500
{
  "success": false,
  "message": "Erreur serveur"
}
```

---

## 5. MODÈLES MONGOOSE (exhaustif)

### 5a. CRV — `src/models/crv/CRV.js` (310 lignes)

| Champ | Type | Required | Default | Enum/Ref | Index |
|-------|------|----------|---------|----------|-------|
| `numeroCRV` | String | Oui | - | - | **unique** |
| `vol` | ObjectId | Oui | - | ref: Vol | Oui |
| `escale` | String | Oui | - | 3-4 chars | Oui |
| `horaire` | ObjectId | Non | - | ref: Horaire | - |
| `statut` | String | - | BROUILLON | BROUILLON, EN_COURS, TERMINE, VALIDE, VERROUILLE, ANNULE | Oui |
| `dateCreation` | Date | - | Date.now | - | Oui (desc) |
| `creePar` | ObjectId | Oui | - | ref: Personne | - |
| `responsableVol` | ObjectId | Non | - | ref: Personne | - |
| `completude` | Number | - | 0 | 0-100 | - |
| `verrouillePar` | ObjectId | Non | - | ref: Personne | - |
| `dateVerrouillage` | Date | Non | - | - | - |
| `derniereModification` | Date | - | Date.now | - | - |
| `modifiePar` | ObjectId | Non | - | ref: Personne | - |
| `personnelAffecte` | [Embedded] | - | [] | nom, prenom, fonction (enum 10 valeurs), matricule, telephone, remarques | - |
| `materielUtilise` | [Embedded] | - | [] | typeEngin (enum 12 valeurs), identifiant, heures, operateur, phaseConcernee, remarques | - |
| `annulation` | Embedded | - | - | dateAnnulation, annulePar, raisonAnnulation, commentaireAnnulation, ancienStatut | - |
| `bulletinMouvementReference` | ObjectId | Non | null | ref: BulletinMouvement | - |
| `crvDoublon` | Boolean | - | false | - | - |
| `archivage` | Embedded | - | - | driveFileId, driveWebViewLink, filename, folderPath, size, archivedAt, archivedBy, version | - |

**Index composé unique** : `{ vol: 1, escale: 1 }` (un seul CRV par vol+escale)

**Hook pre('save')** : Log changement d'état + maj `derniereModification`

### 5b. Vol — `src/models/flights/Vol.js` (114 lignes)

| Champ | Type | Required | Default | Enum/Ref |
|-------|------|----------|---------|----------|
| `numeroVol` | String | Oui | - | - |
| `typeOperation` | String | Non | null | ARRIVEE, DEPART, TURN_AROUND |
| `compagnieAerienne` | String | Oui | - | - |
| `codeIATA` | String | Oui | - | 2 chars |
| `aeroportOrigine` | String | Non | - | - |
| `aeroportDestination` | String | Non | - | - |
| `dateVol` | Date | Oui | - | - |
| `statut` | String | Non | PROGRAMME | PROGRAMME, EN_COURS, TERMINE, ANNULE, RETARDE |
| `avion` | ObjectId | Non | - | ref: Avion |
| `horsProgramme` | Boolean | - | false | - |
| `programmeVolReference` | ObjectId | Non | null | ref: ProgrammeVolSaisonnier |
| `raisonHorsProgramme` | String | Non | null | - |
| `typeVolHorsProgramme` | String | Non | null | CHARTER, MEDICAL, TECHNIQUE, COMMERCIAL, CARGO, AUTRE |
| `bulletinMouvementReference` | ObjectId | Non | null | ref: BulletinMouvement |

**Index** : `{ numeroVol: 1, dateVol: 1 }`, `{ statut: 1 }`

### 5c. Phase — `src/models/phases/Phase.js`

| Champ | Type | Required | Default | Enum |
|-------|------|----------|---------|------|
| `code` | String | Oui | - | **unique**, uppercase |
| `libelle` | String | Oui | - | - |
| `typeOperation` | String | Oui | - | ARRIVEE, DEPART, TURN_AROUND, COMMUN |
| `categorie` | String | Oui | - | PISTE, PASSAGERS, FRET, BAGAGE, TECHNIQUE, AVITAILLEMENT, NETTOYAGE, SECURITE, BRIEFING |
| `macroPhase` | String | Oui | - | DEBUT, REALISATION, FIN |
| `ordre` | Number | Oui | - | - |
| `dureeStandardMinutes` | Number | Oui | - | - |
| `obligatoire` | Boolean | - | true | - |
| `description` | String | Non | - | - |
| `prerequis` | [ObjectId] | - | - | ref: Phase |
| `actif` | Boolean | - | true | - |

### 5d. ChronologiePhase — `src/models/phases/ChronologiePhase.js`

| Champ | Type | Default | Enum/Ref |
|-------|------|---------|----------|
| `crv` | ObjectId | Required | ref: CRV |
| `phase` | ObjectId | Required | ref: Phase |
| `heureDebutPrevue/Reelle` | Date | - | - |
| `heureFinPrevue/Reelle` | Date | - | - |
| `dureeReelleMinutes` | Number | - | Calculé pre-save |
| `ecartMinutes` | Number | - | Calculé pre-save |
| `statut` | String | NON_COMMENCE | NON_COMMENCE, EN_COURS, TERMINE, NON_REALISE, ANNULE |
| `motifNonRealisation` | String | - | NON_NECESSAIRE, EQUIPEMENT_INDISPONIBLE, PERSONNEL_ABSENT, CONDITIONS_METEO, AUTRE |
| `detailMotif` | String | - | - |
| `responsable` | ObjectId | - | ref: Personne |

**Hook pre('save')** : Calcul `dureeReelleMinutes` et `ecartMinutes`, reset si NON_REALISE

### 5e. Horaire — `src/models/phases/Horaire.js`

20 champs Date (10 paires prévu/réel) : atterrissage, arrivée au parc, départ du parc, décollage, ouverture/fermeture parking, remise documents, livraison bagages + 3 champs écart calculés.

**Hook pre('save')** : Calcul écarts horaires automatiques.

### 5f. BulletinMouvement — `src/models/bulletin/BulletinMouvement.js` (769 lignes)

Champs principaux : `numeroBulletin` (unique, format BM-ESCALE-YYYYMMDD), `escale`, `dateDebut/Fin`, `semaine`, `annee`, `statut` (BROUILLON/PUBLIE/ARCHIVE), `mouvements[]` (embedded array de 15+ champs chacun), statistiques calculées, archivage Drive.

**Hook pre('save')** : Validation dates, calcul semaine/année, mise à jour stats, auto-archive si passé.

### 5g. ChargeOperationnelle — `src/models/charges/ChargeOperationnelle.js` (678 lignes)

Le plus gros modèle en termes de champs. Inclut :
- Passagers basiques (4 champs, distinction null vs 0)
- Catégories détaillées (14 sous-catégories passagers)
- Classes (première, affaires, éco)
- Besoins médicaux, mineurs
- Bagages (soute, cabine, poids)
- Fret basique + fret détaillé (catégories, DGR, logistique, douanes, conditions transport)

**Virtuals** : `totalPassagers`, `totalBagages`, `fretSaisi`, `totalPassagersDetailles`, `totalPMRDetailles`, `totalParClasse`

### 5h. Personne — `src/models/security/Personne.js`

| Champ | Type | Enum | Unique |
|-------|------|------|--------|
| `nom`, `prenom` | String | - | - |
| `matricule` | String | - | **Oui** |
| `email` | String | - | **Oui** (lowercase) |
| `password` | String (select: false) | - | - |
| `fonction` | String | AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER, QUALITE, ADMIN | - |
| `specialites` | [String] | PISTE, PASSAGERS, FRET, BAGAGE, AVITAILLEMENT, NETTOYAGE, MAINTENANCE | - |
| `statut` | String | ACTIF, ABSENT, CONGE, INACTIF | - |
| `statutCompte` | String | EN_ATTENTE, VALIDE, SUSPENDU, DESACTIVE | - |

**Hook pre('save')** : Hash password bcrypt (12 rounds)

**Method** : `comparePassword(candidate)` — Compare bcrypt

### 5i. UserActivityLog — `src/models/security/UserActivityLog.js` (203 lignes)

Structure hiérarchique :
```json
{
  "utilisateurId": "ObjectId (Personne)",
  "action": "string",
  "details": "string",
  "date": "Date",
  "type": "auth | action | system | business",
  "userSnapshot": { "username": "string", "role": "string" },
  "request": {
    "id": "string",
    "method": "GET/POST/...",
    "path": "/api/...",
    "query": {},
    "statusCode": 200,
    "latencyMs": 45
  },
  "client": { "ip": "string", "userAgent": "string" },
  "context": {
    "entityType": "string",
    "entityId": "Mixed",
    "refs": { "crvId": "ObjectId", "missionId": "ObjectId", "volId": "ObjectId", "aeronefId": "ObjectId" }
  },
  "meta": "Mixed"
}
```

**6 static methods** : `write()`, `logAuthSuccess()`, `logAuthFailure()`, `logLogout()`, `logAction()`, `logSystem()`

**5 index composés** pour requêtes performantes

### 5j. Notification — `src/models/notifications/Notification.js` (138 lignes)

Champs : destinataire, type (INFO/WARNING/ERROR/SUCCESS/ALERTE_SLA), titre, message, lu, priorité (BASSE/NORMALE/HAUTE/URGENTE), canaux (email/sms/push/inApp), source, expiration.

**Virtual** : `estExpiree`

**Methods** : `marquerCommeLue()`, `archiver()`

### 5k. ValidationCRV — `src/models/validation/ValidationCRV.js`

Champs : crv (unique), validePar, statut (VALIDE/INVALIDE/EN_ATTENTE_CORRECTION), scoreCompletude, conformiteSLA, ecartsSLA[], anomaliesDetectees[], verrouille, dateVerrouillage.

### 5l. EvenementOperationnel — `src/models/transversal/EvenementOperationnel.js`

Champs : crv, typeEvenement (7 types), gravite (4 niveaux : MINEURE, MODEREE, MAJEURE, CRITIQUE), durée impact, actions correctives, statut (OUVERT/EN_COURS/RESOLU/CLOTURE).

**Hook pre('save')** : Calcul `dureeImpactMinutes`

### 5m. Observation — `src/models/crv/Observation.js`

Champs : crv, auteur, categorie (GENERALE/TECHNIQUE/OPERATIONNELLE/SECURITE/QUALITE/SLA), contenu, visibilite (INTERNE/COMPAGNIE/PUBLIQUE).

### 5n. HistoriqueModification — `src/models/crv/HistoriqueModification.js`

Champs : crv, modifiePar, typeModification (CREATION/MISE_A_JOUR/SUPPRESSION/VALIDATION/ANNULATION), champModifie, ancienne/nouvelleValeur, raisonModification, IP, userAgent.

### 5o. Avion — `src/models/referentials/Avion.js` (226 lignes)

Champs : immatriculation (unique), typeAvion, compagnie, capacités, configuration (sièges/équipements/moteurs/caractéristiques techniques), historiqueVersions[], derniereRevision.

### 5p. ProgrammeVol — `src/models/flights/ProgrammeVol.js` (419 lignes)

Champs : nom (unique), dateDebut/Fin, statut (BROUILLON/VALIDE/ACTIF/SUSPENDU/TERMINE), validation, nombreVols, compagnies[], archivage Drive.

**Virtuals** : `dureeJours`, `enCours`, `estTermine`, `isArchived`

**Methods** : `peutEtreModifie()`, `peutEtreValide()`, `peutEtreActive()`, `updateArchivage()`

**Statics** : `getProgrammeActif()`, `getProgrammesEnCours()`

### 5q. ProgrammeVolSaisonnier — `src/models/flights/ProgrammeVolSaisonnier.js` (882 lignes)

Le plus gros fichier modèle (100+ champs). Inclut : identification vol, routage, horaires, récurrence, catégorisation, statut, validation.

**Virtuals** : `joursLibelle`, `estQuotidien`

**Methods** : `opereLeJour()`, `estActifPourDate()`, `toLignePDF()`

**Statics** : `getVolsParJour()`, `getVolsPourDate()`, `getStatistiquesSaison()`

### 5r. VolProgramme — `src/models/flights/VolProgramme.js` (499 lignes)

Vols individuels dans un programme. Auto-calcul typeOperation et codeCompagnie en pre-save. Hooks post-save/delete pour mise à jour du parent ProgrammeVol.

### 5s. Engin — `src/models/resources/Engin.js`

Champs : numeroEngin (unique), typeEngin (8 types), marque, modele, statut (DISPONIBLE/EN_SERVICE/MAINTENANCE/PANNE/HORS_SERVICE).

### 5t. AffectationEnginVol — `src/models/resources/AffectationEnginVol.js`

Champs : vol, engin, heureDebut, heureFin, usage (7 types), statut (AFFECTE/EN_COURS/TERMINE/PANNE).

### 5u. AffectationPersonneVol — `src/models/transversal/AffectationPersonneVol.js`

Champs : vol, personne, role (5 types), heureDebut, heureFin, statut, remarques.

---

# PART 3/4 : Workflows Métier Bout-en-Bout + Audit Trail

---

## 6. WORKFLOWS MÉTIER (BOUT EN BOUT)

### 6A. Cycle de vie complet d'un CRV

```
BROUILLON → EN_COURS → TERMINE → VALIDE → VERROUILLE
                                              ↓ (déverrouiller)
                                           EN_COURS
     ↑
  ANNULE ← (annuler depuis n'importe quel statut sauf VERROUILLE)
     ↓
  REACTIVER → restaure ancienStatut
```

#### Étape 1 : Création CRV (`POST /api/crv`)

Fichiers traversés :
1. `src/routes/crv/crv.routes.js:63` — Validation express-validator (3 paths possibles)
2. `src/middlewares/auth.middleware.js` — `protect` (JWT) + `excludeQualite`
3. `src/middlewares/businessRules.middleware.js:165` — `verifierPhasesAutoriseesCreationCRV` (vérifie Vol si volId fourni)
4. `src/middlewares/auditLog.middleware.js` — `auditLog('CREATION')` (wraps res.send)
5. `src/controllers/crv/crv.controller.js` — `creerCRV()`
   - Détecte le path (bulletin, vol hors-programme, volId, legacy)
   - Appelle `crv.service.js:detecterDoublonCRV()` — Vérification doublon
   - Appelle `crv.service.js:creerVolDepuisMouvement()` — Si path bulletin
   - Crée le Vol (`models/flights/Vol.js`)
   - Appelle `crv.service.js:genererNumeroCRV()` — Format CRVYYMMDDxxxx
   - Crée l'Horaire (`models/phases/Horaire.js`)
   - Crée le CRV (`models/crv/CRV.js`) — statut=BROUILLON, completude=0
   - Crée les ChronologiePhase pour chaque Phase applicable au typeOperation
6. `src/models/crv/CRV.js` — Hook pre('save') : log + derniereModification
7. Retour : CRV populé avec vol, creePar, responsableVol

#### Étape 2 : Démarrer (`POST /api/crv/:id/demarrer`)

Fichiers :
1. `routes/crv/crv.routes.js:153` → `protect`, `excludeQualite`, `auditLog('MISE_A_JOUR')`
2. `controllers/crv/crv.controller.js` → `demarrerCRV()`
   - Vérifie statut === BROUILLON
   - Change statut → EN_COURS
   - Met à jour completude via `crv.service.js:calculerCompletude()`
   - Démarre les phases DEBUT (heureDebutReelle = now)

#### Étape 3 : Saisie données (multiple endpoints)

- `POST /api/crv/:id/charges` → Ajout passagers/bagages/fret
- `PUT /api/crv/:id/horaire` → Saisie horaires réels
- `PUT /api/crv/:crvId/phases/:phaseId` → Avancement phases
- `POST /api/crv/:id/evenements` → Incidents éventuels
- `POST /api/crv/:id/observations` → Observations
- `POST /api/crv/:id/personnel` → Personnel affecté
- `POST /api/crv/:id/engins` → Matériel utilisé

Chaque endpoint passe par : `verifierCRVNonVerrouille` + `auditLog('MISE_A_JOUR')`

#### Étape 4 : Terminer (`POST /api/crv/:id/terminer`)

Fichiers :
1. `controllers/crv/crv.controller.js` → `terminerCRV()`
   - Vérifie statut === EN_COURS
   - Calcule `completude` via `crv.service.js:calculerCompletude()`
   - **Bloque si completude < 50%** — Retourne phases obligatoires manquantes
   - Vérifie phases obligatoires (toutes TERMINE ou NON_REALISE avec justification)
   - Vérifie confirmations explicites si données absentes (charges, événements, observations)
   - Change statut → TERMINE
   - Termine les phases FIN restantes

#### Étape 5 : Valider (`POST /api/validation/:id/valider`)

Fichiers :
1. `routes/validation/validation.routes.js:26` → `protect`, `excludeQualite`, `auditLog('VALIDATION')`
2. `controllers/validation/validation.controller.js` → `validerCRVController()`
   - Appelle `crv.service.js:verifierConformiteSLA()` — Vérifie écarts SLA
   - Crée ValidationCRV avec scoreCompletude, conformiteSLA, ecartsSLA[]
   - Change CRV statut → VALIDE
   - **Auto-verrouille** : Change immédiatement statut → VERROUILLE (par défaut)
   - Envoie notification email via `notification.service.js:notifierValidationCRV()`

#### Étape 6 : Déverrouiller (si nécessaire) (`POST /api/validation/:id/deverrouiller`)

Fichiers :
1. `controllers/validation/validation.controller.js` → `deverrouillerCRVController()`
   - **Exige** `body.raison` (obligatoire)
   - Change statut VERROUILLE → EN_COURS
   - Log la raison du déverrouillage

---

### 6B. Génération PDF + Archivage Google Drive

**Endpoint** : `POST /api/crv/:id/archive`

Fichiers traversés :
1. `src/routes/crv/crv.routes.js:333` → `protect`, `excludeQualite`
2. `src/controllers/crv/crvArchivage.controller.js` → `archiverCRV()`
   - Charge le CRV avec populate (vol, creePar, responsableVol)
   - Vérifie statut !== ANNULE
3. `src/services/documents/crv/crvArchivage.service.js` → `archiverCRV(crvId, userId)`
   - Vérifie le service Drive est opérationnel via `checkArchiveStatus()`
   - Appelle `canArchiveCRVById(crvId)` — Vérifie archivabilité
4. `src/services/documents/crv/CrvGenerator.js` → `generateBuffer(crvId)`
   - `fetchData(crvId)` — Charge CRV + Vol + Personnel + Matériel
   - `buildDocumentDefinition(crv, data)` — Construit le docDefinition pdfmake
   - Utilise `src/services/documents/base/DocumentGenerator.js` — Classe abstraite avec pdfmake/PdfPrinter
   - Polices depuis `src/assets/fonts/` (DejaVuSans pour Unicode)
   - Retourne `Buffer` PDF
5. `src/services/documents/base/DocumentArchiver.js` → `archiveDocument()`
   - Calcule le chemin dossier via `src/config/documents.config.js`:
     ```
     CRV/{Année}/{Mois}/{CodeCompagnie}/
     Ex: CRV/2026/03-Mars/ET/
     ```
   - Calcule le nom fichier :
     ```
     CRV_{NumVol}_{Date}.pdf
     Ex: CRV_ET939_2026-03-02.pdf
     ```
6. `src/services/integrations/googleDriveService.js` → Upload vers Google Drive
   - `ensureFolder(parentId, 'CRV')` — Crée dossier racine si absent
   - `ensureFolder(crvFolderId, '2026')` — Sous-dossier année
   - `ensureFolder(yearFolderId, '03-Mars')` — Sous-dossier mois
   - `ensureFolder(monthFolderId, 'ET')` — Sous-dossier compagnie
   - `uploadFileToDriveAdvanced(filename, buffer, { mimeType, parents })` — Upload PDF
   - Set permission `{ type: 'anyone', role: 'reader' }` — Lien public
   - **Retry** : 3 tentatives, backoff exponentiel (300ms → 600ms → 1200ms)
7. Retour au service → Met à jour le CRV avec :
   ```javascript
   crv.archivage = {
     driveFileId: "1x2y3z...",          // ID fichier Google Drive
     driveWebViewLink: "https://drive.google.com/file/d/1x2y3z.../view",
     filename: "CRV_ET939_2026-03-02.pdf",
     folderPath: ["CRV", "2026", "03-Mars", "ET"],
     size: 45230,                        // Taille en bytes
     archivedAt: "2026-03-02T16:30:00Z",
     archivedBy: "65f1a2b3...",          // ObjectId Personne
     version: 1                          // Incrémenté si re-archivage
   };
   ```
8. `UserActivityLog.logAction()` — Enregistre l'action d'archivage dans l'audit

---

## 7. AUDIT TRAIL / LOGS

### 7a. Système double audit

Le backend possède **2 systèmes d'audit distincts** :

| Système | Collection MongoDB | Scope | Fichier modèle | Fichier middleware |
|---------|-------------------|-------|-----------------|-------------------|
| **HistoriqueModification** | `historiquemodifications` | CRV uniquement | `models/crv/HistoriqueModification.js` | `middlewares/auditLog.middleware.js` |
| **UserActivityLog** | `useractivitylogs` | Global (toutes actions) | `models/security/UserActivityLog.js` | `middlewares/auditFinalize.middleware.js` |

### 7b. HistoriqueModification (Audit CRV)

**Déclenchement** : Middleware `auditLog(typeModification)` appliqué sur les routes CRV qui modifient des données.

**Champs enregistrés** :
```json
{
  "crv": "ObjectId",
  "modifiePar": "ObjectId (Personne)",
  "dateModification": "Date",
  "typeModification": "CREATION | MISE_A_JOUR | SUPPRESSION | VALIDATION | ANNULATION",
  "champModifie": "string (nom du champ ou path)",
  "ancienneValeur": "Mixed",
  "nouvelleValeur": "Mixed",
  "raisonModification": "string",
  "adresseIP": "string",
  "userAgent": "string"
}
```

**Index** : `{ crv: 1, dateModification: -1 }`, `{ modifiePar: 1 }`, `{ typeModification: 1 }`

**Fonctionnement** (`auditLog.middleware.js`) :
- Wrappe `res.send()` pour intercepter la réponse
- S'exécute uniquement si : `crvId` trouvé + `req.user` présent + status 2xx-3xx
- Extrait `crvId` de : `req.crvId`, `req.params.id`, `req.body.crvId`, `req.crv._id`, `req.chronoPhase.crv`
- Écrit **async** sans bloquer la réponse
- **Silencieux** en cas d'erreur (console.error mais ne casse pas le flux)

**Endpoint de consultation** : Pas d'endpoint dédié. L'historique est lisible via les données du CRV dans `obtenirCRV()` ou directement en base.

### 7c. UserActivityLog (Audit global)

**Déclenchement** : Middleware `auditFinalize` en fin de pipeline + appels explicites depuis les controllers via `res.locals.audit`.

**Champs enregistrés** :
```json
{
  "utilisateurId": "ObjectId (Personne)",
  "action": "string (login_success, login_failure, logout, crv_created, crv_archived, etc.)",
  "details": "string",
  "date": "Date",
  "type": "auth | action | system | business",
  "userSnapshot": { "username": "string", "role": "string" },
  "request": {
    "id": "string",
    "method": "GET/POST/...",
    "path": "/api/...",
    "query": {},
    "statusCode": 200,
    "latencyMs": 45
  },
  "client": { "ip": "192.168.1.1", "userAgent": "Mozilla/5.0..." },
  "context": {
    "entityType": "CRV",
    "entityId": "ObjectId",
    "refs": { "crvId": "...", "volId": "..." }
  },
  "meta": "Mixed (données additionnelles)"
}
```

**5 index composés** pour performances :
- `{ utilisateurId: 1, createdAt: -1 }`
- `{ action: 1, createdAt: -1 }`
- `{ type: 1, createdAt: -1 }`
- `{ 'context.entityType': 1, 'context.entityId': 1, createdAt: -1 }`
- `{ 'request.id': 1 }`

**6 static methods** pour écriture structurée :
- `UserActivityLog.write(entry)` — Écriture centralisée avec filtre anti-secrets
- `UserActivityLog.logAuthSuccess(user, reqInfo)` — Login réussi
- `UserActivityLog.logAuthFailure(username, reqInfo, reason)` — Login échoué
- `UserActivityLog.logLogout(user, reqInfo)` — Déconnexion
- `UserActivityLog.logAction(user, action, context, meta, reqInfo)` — Action utilisateur
- `UserActivityLog.logSystem(action, meta)` — Événement système

**Endpoint de consultation** : **AUCUN endpoint API dédié.** Les logs sont consultables uniquement en base MongoDB directement.

### 7d. Flux d'audit complet (pour une requête type)

```
1. auditRequestMiddleware
   → Génère requestId
   → Capture IP, user-agent, timing
   → Écrit dans res.locals.auditBase

2. auth.middleware (protect)
   → Valide JWT
   → Met req.user
   → Enrichit res.locals.auditBase avec utilisateurId

3. Controller
   → Exécute la logique métier
   → [Optionnel] Pose res.locals.audit = { action, type, context, meta }

4. auditLog middleware (CRV uniquement)
   → Intercepte res.send()
   → Écrit HistoriqueModification en base

5. auditFinalizeMiddleware (sur event 'finish')
   → Si res.locals.audit est défini → écrit UserActivityLog
   → Enrichit userSnapshot si manquant (lookup Personne en DB)
   → Silencieux si pas d'audit explicite
```

---

# PART 4/4 : État d'Avancement, Risques et Actions Prioritaires

---

## 8. ÉTAT D'AVANCEMENT

### Modules OK (fonctionnels et complets)

| Module | Status | Fichiers | Commentaire |
|--------|--------|----------|-------------|
| **Auth JWT** | OK | auth.controller.js, auth.middleware.js, Personne.js | Login, register, JWT, RBAC 6 rôles |
| **CRV CRUD** | OK | crv.controller.js, CRV.js, crv.routes.js (392 lignes) | 21 fonctions, 3 paths de création |
| **Workflow CRV** | OK | crv.controller.js, crv.service.js | BROUILLON→EN_COURS→TERMINE→VALIDE→VERROUILLE + annulation |
| **Phases opérationnelles** | OK | phase.controller.js, ChronologiePhase.js, Phase.js | Cohérence type opération, justification non-réalisation |
| **Horaires** | OK | Horaire.js | 10 paires prévu/réel, calcul écarts automatique |
| **Charges passagers** | OK | ChargeOperationnelle.js, passager.controller.js | Distinction null vs 0, catégories détaillées |
| **Charges fret** | OK | ChargeOperationnelle.js, fret.controller.js | DGR (marchandises dangereuses), douanes, conditions transport |
| **Programmes de vol** | OK | ProgrammeVol.js, VolProgramme.js, programmeVol.controller.js | Workflow BROUILLON→VALIDE→ACTIF, duplication |
| **Bulletins mouvement** | OK | BulletinMouvement.js, bulletinMouvement.controller.js | Création depuis programme, publication, mouvements HP |
| **PDF génération** | OK | DocumentGenerator.js, CrvGenerator.js, BulletinMouvementGenerator.js, ProgrammeVolGenerator.js | 3 types de PDF (CRV, Bulletin, Programme) |
| **Archivage Google Drive** | OK | DocumentArchiver.js, googleDriveService.js | Upload, dossiers auto, retry, partage public |
| **Notifications in-app** | OK | notification.controller.js, notification.service.js, Notification.js | CRUD, lu/archivé, expiration, stats |
| **SLA proactif** | OK | alerteSLA.controller.js, alerteSLA.service.js | Seuils CRV (24h/48h/72h), alertes WARNING/CRITICAL |
| **Audit trail** | OK | auditLog.middleware.js, auditFinalize.middleware.js, UserActivityLog.js, HistoriqueModification.js | Double système (CRV + global) |
| **Engins/matériel** | OK | engin.controller.js, Engin.js, AffectationEnginVol.js | CRUD + affectation au CRV |
| **Avions/config** | OK | avionConfiguration.controller.js, Avion.js | Versions, comparaison, révisions |
| **Gestion personnes** | OK | personne.controller.js, Personne.js | CRUD admin, stats |

### Modules partiels

| Module | Status | Manque |
|--------|--------|-------|
| **Email notifications** | Partiel | Config SMTP optionnelle, fallback mode test. Pas de vérification que les emails arrivent vraiment |
| **Export Excel** | Partiel | Endpoint existe (`GET /api/crv/export`) mais dépend de exceljs — pas de tests |
| **Statistiques avancées** | Partiel | `statistiques.service.js` existe mais pas d'endpoint dédié exposé dans les routes |
| **Validation des comptes** | Partiel | `statutCompte` (EN_ATTENTE/VALIDE/SUSPENDU/DESACTIVE) existe dans le modèle mais le register met directement `VALIDE` — pas de workflow d'approbation |

### Modules absents

| Module | Impact |
|--------|--------|
| **Tests automatisés** | `"test": "echo \"Error: no test specified\" && exit 1"` — **AUCUN test** |
| **Dockerfile / Docker Compose** | Aucune conteneurisation |
| **CI/CD** | Aucun pipeline |
| **Swagger / OpenAPI** | Aucune doc API auto-générée |
| **Endpoint consultation audit logs** | UserActivityLog n'a pas d'endpoint API — consultable uniquement en base |
| **Endpoint consultation historique CRV** | HistoriqueModification n'a pas d'endpoint dédié |
| **Pagination audit logs** | Pas de pagination pour les logs |
| **Rate limiting granulaire** | Un seul limiter global (200/min) — pas de limiter par endpoint sensible |
| **Refresh token** | JWT simple, pas de refresh token — expiration = re-login |
| **CRON / Scheduler** | SLA monitoring est manuel (`POST /api/sla/surveiller/crv`) — pas de surveillance automatique |
| **WebSocket / SSE** | Pas de temps réel — polling uniquement |

---

## TOP 10 RISQUES

| # | Risque | Sévérité | Fichier(s) concerné(s) | Détail |
|---|--------|----------|----------------------|--------|
| **R1** | **JWT Secret en dur par défaut** | **CRITIQUE** | `src/config/env.js:9` | Default = `'your-secret-key-change-in-production'`. Si `.env` manque en prod → tokens forgés par n'importe qui |
| **R2** | **CORS origin `*` par défaut** | **HAUTE** | `src/config/env.js:11` | Default = `'*'`. N'importe quel domaine peut appeler l'API en prod si `.env` manque |
| **R3** | **Aucun test automatisé** | **HAUTE** | `package.json` | 0 test unitaire, 0 test intégration, 0 test e2e. Toute régression passe inaperçue |
| **R4** | **Register ouvert sans protection** | **HAUTE** | `src/routes/security/auth.routes.js:16` | `POST /api/auth/register` n'a **aucun auth** — n'importe qui peut créer des comptes (sauf ADMIN). Pas de captcha ni rate limit spécifique |
| **R5** | **Audit log silencieux en cas d'échec** | **MOYENNE** | `src/middlewares/auditLog.middleware.js:30` | Si l'écriture en base échoue → `console.error` et c'est tout. Perte silencieuse de traçabilité |
| **R6** | **Route `/api/crv/archive/status` sans auth** | **MOYENNE** | `src/routes/crv/crv.routes.js:325` | `getArchivageStatus` n'a **aucun middleware protect** — endpoint public exposant l'état du service |
| **R7** | **Pas de pagination sur certains endpoints** | **MOYENNE** | `charge.routes.js`, `phase.routes.js` | Les endpoints charges et phases n'ont pas de pagination — risque de réponses énormes |
| **R8** | **Console.log verbose en production** | **BASSE** | `src/middlewares/auditFinalize.middleware.js` | Nombreux `console.log` de debug (emoji, traces détaillées) — pollution des logs en prod |
| **R9** | **Google Drive partage public automatique** | **MOYENNE** | `src/services/integrations/googleDriveService.js` | Tous les fichiers archivés sont mis en `anyone + reader` — les CRV avec données passagers sont accessibles via le lien |
| **R10** | **Pas de validation d'entrée sur plusieurs endpoints** | **MOYENNE** | `charge.routes.js`, `bulletin/bulletinMouvement.routes.js`, `avion.routes.js` | Plusieurs routes POST/PUT n'ont aucune validation express-validator (bulletins, avions, charges détaillées) |

---

## TOP 10 ACTIONS PRIORITAIRES (ordre strict)

| # | Action | Priorité | Effort | Fichiers à modifier |
|---|--------|----------|--------|-------------------|
| **A1** | **Supprimer le JWT secret par défaut** — Faire crasher le serveur si `JWT_SECRET` n'est pas défini en env | P0 - Critique | 15 min | `src/config/env.js` — Ajouter `if (!process.env.JWT_SECRET) throw new Error(...)` |
| **A2** | **Protéger `POST /api/auth/register`** — Ajouter rate limit spécifique (ex: 5/heure par IP) ou exiger un token d'invitation | P0 - Critique | 1h | `src/routes/security/auth.routes.js` — Ajouter rate limiter dédié ou middleware d'invitation |
| **A3** | **Ajouter `protect` sur `GET /api/crv/archive/status`** | P0 - Critique | 5 min | `src/routes/crv/crv.routes.js:325` — Ajouter `protect` au middleware chain |
| **A4** | **Forcer CORS origin en production** — Refuser `*` si `NODE_ENV=production` | P1 - Haute | 15 min | `src/config/env.js` + `src/app.js` — Validation au démarrage |
| **A5** | **Ajouter un framework de tests** — Jest ou Vitest + premiers tests critiques (auth, CRV workflow) | P1 - Haute | 2-3 jours | Nouveau `tests/`, `package.json` (jest/vitest), minimum 20 tests |
| **A6** | **Créer endpoint consultation audit logs** — `GET /api/audit/logs` avec filtres et pagination | P1 - Haute | 4h | Nouveau controller + route dans `routes/security/`, query sur UserActivityLog |
| **A7** | **Ajouter validation express-validator manquante** — Bulletins, avions, charges détaillées | P2 - Moyenne | 3h | `bulletin/bulletinMouvement.routes.js`, `referentials/avion.routes.js`, `charges/charge.routes.js` |
| **A8** | **Supprimer les `console.log` de debug** — Remplacer par un logger structuré (winston/pino) | P2 - Moyenne | 4h | `auditFinalize.middleware.js` + tous les services avec `console.log` emoji |
| **A9** | **Revoir le partage Google Drive** — Passer de `anyone+reader` à un partage restreint ou supprimer le partage public | P2 - Moyenne | 2h | `src/services/integrations/googleDriveService.js`, `src/services/documents/base/DocumentArchiver.js` |
| **A10** | **Ajouter un scheduler pour SLA** — Remplacer le monitoring manuel par un CRON (node-cron) qui vérifie les SLA toutes les 15min | P2 - Moyenne | 3h | Nouveau `src/services/scheduler.js`, dépendance `node-cron` |

---

## SYNTHÈSE FINALE

### (A) Ce qui est SUR

- **Stack** : Node.js/Express + MongoDB/Mongoose, pure JS ES6 modules, 127 fichiers
- **~140 endpoints** couvrant 13 domaines fonctionnels
- **21 modèles Mongoose** avec relations, hooks, virtuals, static methods
- **Workflow CRV complet** : BROUILLON→EN_COURS→TERMINE→VALIDE→VERROUILLE + annulation/réactivation
- **Hiérarchie Programme (6mo) → Bulletin (3-4j) → Vol → CRV** implémentée bout-en-bout
- **Double système d'audit** : HistoriqueModification (CRV) + UserActivityLog (global)
- **3 générateurs PDF** (CRV, Bulletin, Programme) + archivage Google Drive
- **RBAC 6 rôles** avec exclusion QUALITE des écritures

### (B) Ce qui est à VÉRIFIER

- Credentials `.env` en production (MongoDB Atlas, Google Drive, SMTP)
- Est-ce que le register ouvert est voulu ? (inscription libre sans validation)
- Est-ce que le partage Google Drive public est une exigence métier ?
- L'endpoint `/api/crv/archive/status` sans auth est-il intentionnel ?
- Le `statutCompte` (EN_ATTENTE, VALIDE, SUSPENDU, DESACTIVE) est dans le modèle mais le register bypass (met directement VALIDE) — workflow d'approbation prévu ?

### (C) Prochaines actions

1. **Immédiat (jour 1)** : Corriger R1 (JWT secret), R4 (register ouvert), R6 (archive/status sans auth)
2. **Court terme (semaine 1)** : CORS production, framework tests, endpoint audit logs
3. **Moyen terme (semaine 2-3)** : Validation manquante, logger structuré, partage Drive, scheduler SLA

---

> **Rapport généré le 2026-03-02 — 140 endpoints documentés, 21 modèles audités, 10 risques identifiés, 10 actions priorisées.**
