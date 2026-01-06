# ANALYSE AMÉLIORATIVE - CONFORMITÉ FRONTEND / BACKEND API

**Version** : 1.0.0
**Date** : 2026-01-06
**Source** : API_COMPLETE_FRONTEND.md (107K+ lignes)

---

## RÉSUMÉ EXÉCUTIF

| Catégorie | Routes Backend | Implémentées Frontend | Taux | Statut |
|-----------|----------------|----------------------|------|--------|
| Authentification | 3 | 3 | 100% | ✅ Conforme |
| CRV | 11 | 5 | 45% | ⚠️ Partiel |
| Phases | 4 | 0 | 0% | ❌ Manquant |
| Vols | 7 | 0 | 0% | ❌ Manquant |
| Programmes Vol | 9 | 0 | 0% | ❌ Manquant |
| Charges | 12 | 1 | 8% | ❌ Manquant |
| Avions | 9 | 0 | 0% | ❌ Manquant |
| Notifications | 8 | 0 | 0% | ❌ Manquant |
| Alertes SLA | 7 | 0 | 0% | ❌ Manquant |
| Validation CRV | 3 | 1 | 33% | ⚠️ Partiel |
| Personnes | 5 | 7 | 100% | ✅ Conforme |
| **TOTAL** | **78** | **17** | **22%** | ❌ |

---

## 1. AUTHENTIFICATION (3/3 - ✅ CONFORME)

### Routes Backend Documentées

| Route | Méthode | Frontend | Statut |
|-------|---------|----------|--------|
| `/api/auth/login` | POST | `authAPI.login()` → `/auth/connexion` | ✅ |
| `/api/auth/register` | POST | Non utilisé (système fermé) | ✅ N/A |
| `/api/auth/me` | GET | `authAPI.me()` → `/auth/profil` | ⚠️ |

### Analyse Détaillée

#### ✅ Login - CONFORME
```javascript
// Frontend (api.js:80-83)
login: (credentials) => api.post('/auth/connexion', {
  email: credentials.email,
  motDePasse: credentials.mot_de_passe || credentials.motDePasse
})

// Backend attend (API_COMPLETE_FRONTEND.md)
POST /api/auth/login
Body: { email, password }
```

**Écart identifié** : Le frontend envoie `motDePasse`, le backend attend `password`.

**Recommandation** : Vérifier si le backend accepte les deux formats ou standardiser.

#### ✅ Logout - CONFORME
```javascript
// Frontend (authService.js:134)
await securedApiClient.post('/deconnexion')

// Backend attend
POST /api/auth/deconnexion (non documenté explicitement)
```

#### ⚠️ GET /me - ENDPOINT DIFFÉRENT
```javascript
// Frontend utilise
GET /auth/profil

// Backend documente
GET /api/auth/me
```

**Recommandation** : Aligner l'endpoint ou vérifier que `/auth/profil` existe.

### Réponse Backend Login - Bien Consommée

```json
// Backend retourne
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "...",
    "fonction": "AGENT_ESCALE",
    "matricule": "AG001",
    "statut": "ACTIF",
    "statutCompte": "VALIDE",
    "specialites": ["PISTE", "PASSAGERS"]
  }
}
```

```javascript
// Frontend consomme correctement (authService.js:85-101)
const userData = {
  id: utilisateur.id,
  nom: utilisateur.nom,
  prenom: utilisateur.prenom,
  email: utilisateur.email,
  fonction: roleNormalise,
  role: roleNormalise,
  doitChangerMotDePasse: data.doitChangerMotDePasse
};
```

**Champs NON consommés** :
- `matricule` ❌
- `statut` ❌
- `statutCompte` ❌
- `specialites` ❌
- `telephone` ❌
- `dateEmbauche` ❌

---

## 2. CRV - COMPTES RENDUS DE VOL (5/11 - ⚠️ PARTIEL)

### Routes Backend vs Frontend

| Route Backend | Frontend | Statut |
|---------------|----------|--------|
| `POST /api/crv` | `crvAPI.create()` | ✅ |
| `GET /api/crv` | `crvAPI.getAll()` | ✅ |
| `GET /api/crv/:id` | `crvAPI.getById()` | ✅ |
| `PATCH /api/crv/:id` | Non implémenté | ❌ |
| `POST /api/crv/:id/charges` | `crvAPI.updateCharges()` → PUT | ⚠️ Méthode différente |
| `POST /api/crv/:id/evenements` | `crvAPI.updateEvenements()` → PUT | ⚠️ Méthode différente |
| `POST /api/crv/:id/observations` | Non implémenté | ❌ |
| `GET /api/crv/search` | Non implémenté | ❌ |
| `GET /api/crv/stats` | Non implémenté | ❌ |
| `GET /api/crv/export` | Non implémenté | ❌ |
| `GET /api/crv/annules` | Non implémenté | ❌ |

### Endpoints Frontend NON CONFORMES

```javascript
// Frontend utilise (api.js:115-119)
updatePersonnes: (id, data) => api.put(`/crv/${id}/personnes`, data)
updateEngins: (id, data) => api.put(`/crv/${id}/engins`, data)
updatePhases: (id, data) => api.put(`/crv/${id}/phases`, data)
updateCharges: (id, data) => api.put(`/crv/${id}/charges`, data)
updateEvenements: (id, data) => api.put(`/crv/${id}/evenements`, data)
```

**Problème** : Ces endpoints `PUT /crv/:id/personnes`, `/engins`, `/phases` ne sont **PAS documentés** dans l'API backend.

### Réponse Backend GET /crv/:id - Partiellement Consommée

```json
// Backend retourne
{
  "success": true,
  "crv": {
    "_id": "...",
    "numeroCRV": "CRV-20260105-0001",
    "vol": { ... },
    "statut": "EN_COURS",
    "completude": 45,
    "creePar": { ... },
    "responsableVol": { ... },
    "dateCreation": "...",
    "derniereModification": "...",
    "archivage": { ... },
    "annulation": { ... }
  },
  "phases": [ ... ],
  "charges": [ ... ],
  "evenements": [ ... ],
  "observations": [ ... ]
}
```

**Champs NON exploités par le frontend** :
- `archivage` (driveFileId, driveWebViewLink, archivedAt, archivedBy) ❌
- `annulation` (dateAnnulation, annulePar, raisonAnnulation, commentaireAnnulation, ancienStatut) ❌
- `observations` ❌

### Routes Manquantes à Implémenter

```javascript
// À ajouter dans api.js
export const crvAPI = {
  // Existants...

  // MANQUANTS
  update: (id, data) => api.patch(`/crv/${id}`, data),
  addObservation: (id, data) => api.post(`/crv/${id}/observations`, data),
  search: (params) => api.get('/crv/search', { params }),
  getStats: (params) => api.get('/crv/stats', { params }),
  export: (params) => api.get('/crv/export', { params, responseType: 'blob' }),
  getAnnules: (params) => api.get('/crv/annules', { params })
}
```

---

## 3. PHASES (0/4 - ❌ MANQUANT)

### Routes Backend NON Implémentées

| Route | Description | Priorité |
|-------|-------------|----------|
| `POST /api/phases/:id/demarrer` | Démarrer une phase | P0 |
| `POST /api/phases/:id/terminer` | Terminer une phase | P0 |
| `POST /api/phases/:id/non-realise` | Marquer phase non réalisée | P0 |
| `PATCH /api/phases/:id` | Modifier une phase | P1 |

### Implémentation Requise

```javascript
// À ajouter dans api.js
export const phasesAPI = {
  demarrer: (id) => api.post(`/phases/${id}/demarrer`),
  terminer: (id) => api.post(`/phases/${id}/terminer`),
  marquerNonRealise: (id, data) => api.post(`/phases/${id}/non-realise`, data),
  update: (id, data) => api.patch(`/phases/${id}`, data)
}
```

### Body Requis pour Non-Réalisé

```json
{
  "motifNonRealisation": "NON_NECESSAIRE | EQUIPEMENT_INDISPONIBLE | PERSONNEL_ABSENT | CONDITIONS_METEO | AUTRE",
  "detailMotif": "Texte explicatif si motif = AUTRE"
}
```

### Réponse Backend Phase

```json
{
  "success": true,
  "message": "Phase démarrée avec succès",
  "phase": {
    "_id": "...",
    "crv": "...",
    "nom": "Accueil avion",
    "typePhase": "ACCUEIL_AVION",
    "ordre": 1,
    "statut": "EN_COURS",
    "obligatoire": true,
    "dateDebut": "2026-01-05T14:30:00.000Z",
    "personnelAffecte": [],
    "equipementsUtilises": []
  }
}
```

---

## 4. VOLS (0/7 - ❌ MANQUANT)

### Routes Backend NON Implémentées

| Route | Description | Priorité |
|-------|-------------|----------|
| `POST /api/vols` | Créer un vol | P0 |
| `GET /api/vols` | Lister les vols | P0 |
| `GET /api/vols/:id` | Obtenir un vol | P0 |
| `PATCH /api/vols/:id` | Modifier un vol | P1 |
| `POST /api/vols/:id/lier-programme` | Lier à un programme | P1 |
| `POST /api/vols/:id/marquer-hors-programme` | Marquer hors programme | P2 |
| `POST /api/vols/:id/detacher-programme` | Détacher d'un programme | P2 |

### Implémentation Requise

```javascript
// À ajouter dans api.js
export const volsAPI = {
  getAll: (params) => api.get('/vols', { params }),
  getById: (id) => api.get(`/vols/${id}`),
  create: (data) => api.post('/vols', data),
  update: (id, data) => api.patch(`/vols/${id}`, data),
  lierProgramme: (id, programmeId) => api.post(`/vols/${id}/lier-programme`, { programmeId }),
  marquerHorsProgramme: (id, data) => api.post(`/vols/${id}/marquer-hors-programme`, data),
  detacherProgramme: (id) => api.post(`/vols/${id}/detacher-programme`)
}
```

### Structure Vol Backend

```json
{
  "numeroVol": "AF1234",
  "typeOperation": "ARRIVEE | DEPART | TURN_AROUND",
  "compagnieAerienne": "Air France",
  "codeIATA": "AF",
  "dateVol": "2026-01-06T10:30:00.000Z",
  "avion": "ObjectId",
  "programmation": {
    "estProgramme": false,
    "programmeVolId": null,
    "typeVolHorsProgramme": "CHARTER | VOL_FERRY | MEDICAL | TECHNIQUE | AUTRE",
    "raisonHorsProgramme": "..."
  }
}
```

---

## 5. PROGRAMMES VOL (0/9 - ❌ MANQUANT)

### Routes Backend NON Implémentées

| Route | Description | Rôles |
|-------|-------------|-------|
| `POST /api/programmes-vol` | Créer programme | Tous sauf ADMIN |
| `GET /api/programmes-vol` | Lister programmes | Tous sauf ADMIN |
| `GET /api/programmes-vol/:id` | Obtenir programme | Tous sauf ADMIN |
| `PATCH /api/programmes-vol/:id` | Modifier programme | Tous sauf ADMIN |
| `DELETE /api/programmes-vol/:id` | Supprimer programme | MANAGER |
| `POST /api/programmes-vol/:id/valider` | Valider programme | SUPERVISEUR, MANAGER |
| `POST /api/programmes-vol/:id/activer` | Activer programme | SUPERVISEUR, MANAGER |
| `POST /api/programmes-vol/:id/suspendre` | Suspendre programme | Tous sauf ADMIN |
| `POST /api/programmes-vol/import` | Import Excel | Tous sauf ADMIN |

### Implémentation Requise

```javascript
// À ajouter dans api.js
export const programmesVolAPI = {
  getAll: (params) => api.get('/programmes-vol', { params }),
  getById: (id) => api.get(`/programmes-vol/${id}`),
  create: (data) => api.post('/programmes-vol', data),
  update: (id, data) => api.patch(`/programmes-vol/${id}`, data),
  delete: (id) => api.delete(`/programmes-vol/${id}`),
  valider: (id) => api.post(`/programmes-vol/${id}/valider`),
  activer: (id) => api.post(`/programmes-vol/${id}/activer`),
  suspendre: (id, raison) => api.post(`/programmes-vol/${id}/suspendre`, { raison }),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/programmes-vol/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
}
```

---

## 6. CHARGES (1/12 - ❌ MANQUANT)

### Routes Backend Avancées NON Implémentées

| Route | Description | Priorité |
|-------|-------------|----------|
| `PUT /api/charges/:id/categories-detaillees` | Catégories passagers | P0 |
| `PUT /api/charges/:id/classes` | Classes (1ère, affaires, éco) | P1 |
| `PUT /api/charges/:id/besoins-medicaux` | Besoins médicaux | P1 |
| `PUT /api/charges/:id/mineurs` | Mineurs non accompagnés | P1 |
| `POST /api/charges/:id/convertir-categories-detaillees` | Conversion données | P2 |
| `PUT /api/charges/:id/fret-detaille` | Fret détaillé | P1 |
| `POST /api/charges/:id/marchandises-dangereuses` | Ajouter DGR | P0 |
| `DELETE /api/charges/:id/marchandises-dangereuses/:mdId` | Supprimer DGR | P1 |
| `GET /api/charges/statistiques/passagers` | Stats passagers | P2 |
| `GET /api/charges/statistiques/fret` | Stats fret | P2 |

### Structure Catégories Détaillées Passagers

```json
{
  "categoriesDetaillees": {
    "bebes": 2,
    "enfants": 10,
    "adolescents": 5,
    "adultes": 120,
    "seniors": 18,
    "pmrFauteuilRoulant": 3,
    "pmrMarcheAssistee": 2,
    "pmrAutre": 1,
    "transitDirect": 15,
    "transitAvecChangement": 8,
    "vip": 2,
    "equipage": 10,
    "deportes": 0
  }
}
```

### Structure Fret Détaillé

```json
{
  "fretDetaille": {
    "categoriesFret": {
      "general": { "poids": 500, "volume": 10 },
      "perissable": { "poids": 100, "volume": 5, "temperature": "-18°C" },
      "fragile": { "poids": 50, "volume": 2 },
      "valeurElevee": { "poids": 20, "volume": 1 },
      "volumineux": { "poids": 200, "volume": 15 },
      "animal": { "poids": 30, "volume": 2, "espece": "Chiens" }
    },
    "marchandisesDangereuses": [
      {
        "codeONU": "UN1234",
        "classeONU": "3",
        "designationOfficielle": "Liquide inflammable",
        "quantite": 100,
        "unite": "kg",
        "groupeEmballage": "II",
        "instructions": "Conserver à l'écart des sources de chaleur"
      }
    ],
    "logistique": {
      "nombreColis": 45,
      "nombrePalettes": 3,
      "numeroLTA": "123-45678901",
      "numeroAWB": "180-12345678"
    },
    "douanes": {
      "declarationDouane": "EX123456",
      "valeurDeclaree": 50000,
      "devise": "EUR"
    },
    "conditionsTransport": {
      "temperatureMin": -20,
      "temperatureMax": 5,
      "humidite": 60,
      "instructionsSpeciales": "Ne pas gerber"
    }
  }
}
```

### Implémentation Requise

```javascript
// À ajouter dans api.js
export const chargesAPI = {
  updateCategoriesDetaillees: (id, data) => api.put(`/charges/${id}/categories-detaillees`, data),
  updateClasses: (id, data) => api.put(`/charges/${id}/classes`, data),
  updateBesoinsMedicaux: (id, data) => api.put(`/charges/${id}/besoins-medicaux`, data),
  updateMineurs: (id, data) => api.put(`/charges/${id}/mineurs`, data),
  convertirCategoriesDetaillees: (id) => api.post(`/charges/${id}/convertir-categories-detaillees`),
  updateFretDetaille: (id, data) => api.put(`/charges/${id}/fret-detaille`, data),
  addMarchandiseDangereuse: (id, data) => api.post(`/charges/${id}/marchandises-dangereuses`, data),
  deleteMarchandiseDangereuse: (id, mdId) => api.delete(`/charges/${id}/marchandises-dangereuses/${mdId}`),
  getStatistiquesPassagers: (params) => api.get('/charges/statistiques/passagers', { params }),
  getStatistiquesFret: (params) => api.get('/charges/statistiques/fret', { params })
}
```

---

## 7. AVIONS - CONFIGURATION (0/9 - ❌ MANQUANT)

### Routes Backend NON Implémentées

| Route | Description |
|-------|-------------|
| `PUT /api/avions/:id/configuration` | Configurer un avion |
| `POST /api/avions/:id/versions` | Créer une version de config |
| `GET /api/avions/:id/versions` | Lister les versions |
| `GET /api/avions/:id/versions/:numero` | Obtenir une version |
| `POST /api/avions/:id/versions/:numero/restaurer` | Restaurer une version |
| `GET /api/avions/:id/versions/comparer` | Comparer deux versions |
| `PUT /api/avions/:id/revision` | Planifier une révision |
| `GET /api/avions/revisions/prochaines` | Révisions à venir |
| `GET /api/avions/statistiques/configurations` | Statistiques configs |

### Implémentation Requise

```javascript
// À ajouter dans api.js
export const avionsAPI = {
  updateConfiguration: (id, data) => api.put(`/avions/${id}/configuration`, data),
  createVersion: (id, data) => api.post(`/avions/${id}/versions`, data),
  getVersions: (id) => api.get(`/avions/${id}/versions`),
  getVersion: (id, numero) => api.get(`/avions/${id}/versions/${numero}`),
  restaurerVersion: (id, numero) => api.post(`/avions/${id}/versions/${numero}/restaurer`),
  comparerVersions: (id, v1, v2) => api.get(`/avions/${id}/versions/comparer`, { params: { v1, v2 } }),
  planifierRevision: (id, data) => api.put(`/avions/${id}/revision`, data),
  getRevisionsProchaines: () => api.get('/avions/revisions/prochaines'),
  getStatistiquesConfigurations: () => api.get('/avions/statistiques/configurations')
}
```

---

## 8. NOTIFICATIONS (0/8 - ❌ MANQUANT)

### Routes Backend NON Implémentées

| Route | Description | Rôles |
|-------|-------------|-------|
| `GET /api/notifications` | Mes notifications | Tous |
| `GET /api/notifications/count-non-lues` | Compteur non lues | Tous |
| `PATCH /api/notifications/lire-toutes` | Marquer toutes lues | Tous |
| `GET /api/notifications/statistiques` | Statistiques | Tous |
| `POST /api/notifications` | Créer notification | MANAGER |
| `PATCH /api/notifications/:id/lire` | Marquer lue | Tous |
| `PATCH /api/notifications/:id/archiver` | Archiver | Tous |
| `DELETE /api/notifications/:id` | Supprimer | Tous |

### Implémentation Requise

```javascript
// À ajouter dans api.js
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getCountNonLues: () => api.get('/notifications/count-non-lues'),
  marquerToutesLues: () => api.patch('/notifications/lire-toutes'),
  getStatistiques: () => api.get('/notifications/statistiques'),
  create: (data) => api.post('/notifications', data), // MANAGER uniquement
  marquerLue: (id) => api.patch(`/notifications/${id}/lire`),
  archiver: (id) => api.patch(`/notifications/${id}/archiver`),
  delete: (id) => api.delete(`/notifications/${id}`)
}
```

### Structure Notification

```json
{
  "_id": "...",
  "destinataire": "ObjectId",
  "type": "INFO | WARNING | URGENT | SYSTEME",
  "titre": "Titre de la notification",
  "message": "Message détaillé",
  "lu": false,
  "dateLecture": null,
  "reference": {
    "type": "CRV | VOL | PHASE | PROGRAMME",
    "id": "ObjectId"
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## 9. ALERTES SLA (0/7 - ❌ MANQUANT)

### Routes Backend NON Implémentées

| Route | Description | Rôles |
|-------|-------------|-------|
| `GET /api/sla/rapport` | Rapport SLA global | MANAGER |
| `GET /api/sla/configuration` | Config SLA actuelle | Tous |
| `PUT /api/sla/configuration` | Modifier config SLA | MANAGER |
| `POST /api/sla/surveiller/crv` | Surveiller CRV | MANAGER |
| `POST /api/sla/surveiller/phases` | Surveiller phases | MANAGER |
| `GET /api/sla/crv/:id` | SLA d'un CRV | Tous |
| `GET /api/sla/phase/:id` | SLA d'une phase | Tous |

### Implémentation Requise

```javascript
// À ajouter dans api.js
export const slaAPI = {
  getRapport: (params) => api.get('/sla/rapport', { params }), // MANAGER
  getConfiguration: () => api.get('/sla/configuration'),
  updateConfiguration: (data) => api.put('/sla/configuration', data), // MANAGER
  surveillerCRV: (crvId) => api.post('/sla/surveiller/crv', { crvId }), // MANAGER
  surveillerPhases: (phaseIds) => api.post('/sla/surveiller/phases', { phaseIds }), // MANAGER
  getCRVSla: (id) => api.get(`/sla/crv/${id}`),
  getPhaseSla: (id) => api.get(`/sla/phase/${id}`)
}
```

---

## 10. VALIDATION CRV (1/3 - ⚠️ PARTIEL)

### Routes Backend vs Frontend

| Route Backend | Frontend | Statut |
|---------------|----------|--------|
| `POST /api/validation/:id/valider` | `crvAPI.validate()` → `/crv/:id/validate` | ⚠️ Endpoint différent |
| `POST /api/validation/:id/deverrouiller` | Non implémenté | ❌ |
| `GET /api/validation/:id` | Non implémenté | ❌ |

### Implémentation Requise

```javascript
// À corriger/ajouter dans api.js
export const validationAPI = {
  // Endpoint CORRECT (selon backend)
  valider: (id) => api.post(`/validation/${id}/valider`),
  deverrouiller: (id, raison) => api.post(`/validation/${id}/deverrouiller`, { raison }),
  getStatus: (id) => api.get(`/validation/${id}`)
}

// CORRECTION dans crvAPI
export const crvAPI = {
  // ...
  validate: (id) => api.post(`/validation/${id}/valider`), // CORRECTION
}
```

---

## 11. PERSONNES - GESTION UTILISATEURS (7/5 - ✅ CONFORME+)

### Routes Frontend vs Backend

| Route | Frontend | Backend | Statut |
|-------|----------|---------|--------|
| `GET /api/personnes` | `personnesAPI.getAll()` | ✅ | ✅ |
| `GET /api/personnes/:id` | `personnesAPI.getById()` | ✅ | ✅ |
| `POST /api/personnes` | `personnesAPI.create()` | ✅ | ✅ |
| `PATCH /api/personnes/:id` | `personnesAPI.update()` | ✅ | ✅ |
| `DELETE /api/personnes/:id` | `personnesAPI.delete()` | ✅ | ✅ |
| N/A | `personnesAPI.desactiver()` | Raccourci PATCH | ✅ |
| N/A | `personnesAPI.reactiver()` | Raccourci PATCH | ✅ |

**Verdict** : L'API Personnes est **entièrement conforme** et même enrichie avec des helpers.

---

## 12. MIDDLEWARES ET CODES D'ERREUR

### Codes d'Erreur Bien Gérés

| Code Backend | Frontend errorHandler.js | Statut |
|--------------|-------------------------|--------|
| `QUALITE_READ_ONLY` | ✅ Géré | ✅ |
| `ADMIN_ONLY` | ✅ Géré | ✅ |
| `INSUFFICIENT_PERMISSIONS` | ✅ Géré | ✅ |
| `ACCOUNT_DISABLED` | ✅ Géré | ✅ |
| `TOKEN_EXPIRED` | ✅ Géré | ✅ |
| `TOKEN_INVALID` | ✅ Géré | ✅ |
| `CRV_VERROUILLE` | ✅ Géré | ✅ |
| `INCOHERENCE_TYPE_OPERATION` | ✅ Géré | ✅ |
| `ACCOUNT_IN_USE` | ✅ Géré | ✅ |
| `EMAIL_ALREADY_EXISTS` | ✅ Géré | ✅ |

**Verdict** : La gestion des erreurs est **excellente**.

---

## PLAN D'ACTION RECOMMANDÉ

### Phase 1 - CRITIQUE (P0)

| Action | Fichier | Priorité |
|--------|---------|----------|
| Ajouter `phasesAPI` | `api.js` | P0 |
| Ajouter `volsAPI` (CRUD) | `api.js` | P0 |
| Corriger endpoint validation | `api.js` | P0 |
| Ajouter charges DGR | `api.js` | P0 |

### Phase 2 - IMPORTANT (P1)

| Action | Fichier | Priorité |
|--------|---------|----------|
| Ajouter `programmesVolAPI` | `api.js` | P1 |
| Ajouter catégories détaillées passagers | `api.js` | P1 |
| Ajouter fret détaillé | `api.js` | P1 |

### Phase 3 - AMÉLIORATION (P2)

| Action | Fichier | Priorité |
|--------|---------|----------|
| Ajouter `notificationsAPI` | `api.js` | P2 |
| Ajouter `slaAPI` | `api.js` | P2 |
| Ajouter `avionsAPI` | `api.js` | P2 |
| Ajouter search/stats/export CRV | `api.js` | P2 |

---

## CONCLUSION

Le frontend actuel n'exploite que **22% des capacités du backend**.

**Points forts** :
- Authentification correctement implémentée
- Gestion des erreurs exhaustive
- API Personnes complète
- Gestion des rôles et permissions

**Points faibles** :
- API Phases totalement manquante (critique pour le workflow CRV)
- API Vols manquante (impossible de créer des vols)
- API Programmes Vol manquante
- Fonctionnalités avancées (notifications, SLA, stats) non exploitées
- Endpoints CRV partiellement incorrects

**Recommandation** : Prioriser la Phase 1 (P0) pour avoir un système fonctionnel complet.
