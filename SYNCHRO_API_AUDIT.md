# AUDIT SYNCHRO API — FRONT vs BACK (Peigne Fin)
## Date : 2026-03-02 | Projet CRV Operation

---

# SOMMAIRE

1. [Phase 1 — Endpoints réellement utilisés côté FRONT](#phase-1)
2. [Phase 2 — Comparaison croisée FRONT vs BACK](#phase-2)
   - [Liste A — FRONT appelle, BACK n'a pas](#liste-a)
   - [Liste B — BACK expose, FRONT n'utilise jamais](#liste-b)
   - [Liste C — Présent des deux côtés, INCOHÉRENT](#liste-c)
3. [3 Exemples concrets d'incohérence](#exemples)
4. [Plan d'alignement MVP — 10 actions](#plan)
5. [Résumé chiffré](#resume)

---

# PHASE 1 — Endpoints réellement utilisés côté FRONT {#phase-1}

**Source** : `src/services/api.js` (1459 lignes, 15 modules)
**Méthode** : scan exhaustif de `src/stores/*.js`, `src/views/**/*.vue`, `src/composables/*.js`, `src/components/**/*.vue`

## AUTH — 4/5 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction | Payload |
|---|--------|-----|------------------------|----------|---------|
| 1 | POST | `/auth/connexion` | `stores/authStore.js`, `composables/useAuth.js`, `services/auth/authService.js` | `login()` | `{ email, motDePasse }` |
| 2 | POST | `/auth/deconnexion` | `stores/authStore.js`, `composables/useAuth.js` | `logout()` | — |
| 3 | GET | `/auth/me` | `stores/authStore.js`, `services/auth/authService.js` | `fetchUser()` | — |
| 4 | POST | `/auth/changer-mot-de-passe` | `stores/authStore.js`, `composables/useAuth.js` | `changerMotDePasse()` | `{ ancienMotDePasse, nouveauMotDePasse }` |

> `authAPI.register()` → POST `/auth/inscription` : **DÉCLARÉ mais JAMAIS appelé**

## PERSONNES — 5/5 déclarés utilisés (+3 helpers)

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction | Payload |
|---|--------|-----|------------------------|----------|---------|
| 5 | GET | `/personnes` | `stores/personnesStore.js`, `views/Admin/Dashboard.vue`, `views/Admin/GestionUtilisateurs.vue` | `listPersonnes()` | `?page,limit,fonction,statut,search` |
| 6 | GET | `/personnes/:id` | `stores/personnesStore.js`, `views/Admin/UserEdit.vue` | `loadPersonne()` | — |
| 7 | POST | `/personnes` | `stores/personnesStore.js`, `views/Admin/UserCreate.vue` | `createPersonne()` | `{ nom, prenom, email, password, fonction }` |
| 8 | PATCH | `/personnes/:id` | `stores/personnesStore.js`, `views/Admin/GestionUtilisateurs.vue` | `updatePersonne()` | `{ nom?, email?, fonction?, statutCompte? }` |
| 9 | DELETE | `/personnes/:id` | `stores/personnesStore.js`, `views/Admin/GestionUtilisateurs.vue` | `deletePersonne()` | — |

> `desactiver()`, `reactiver()`, `suspendre()` sont des helpers qui envoient PATCH `/personnes/:id` avec `{ statutCompte }`.

## CRV — 25/31 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction | Payload |
|---|--------|-----|------------------------|----------|---------|
| 10 | POST | `/crv` | `stores/crvStore.js` | `creerCRV()` | `{ bulletinId?, mouvementId?, vol?, volId?, escale? }` |
| 11 | GET | `/crv` | `stores/crvStore.js`, `views/Manager/ValidationCRV.vue`, `views/Admin/Dashboard.vue` | `listCRVs()` | `?statut,compagnie,dateDebut,dateFin,page,limit` |
| 12 | GET | `/crv/:id` | `stores/crvStore.js` | `loadCRV()` | — |
| 13 | PATCH | `/crv/:id` | `stores/crvStore.js` | `updateCRV()` | `{ responsableVol?, confirmations? }` |
| 14 | DELETE | `/crv/:id` | `stores/crvStore.js` | `deleteCRV()` | — |
| 15 | POST | `/crv/:id/demarrer` | `stores/crvStore.js` | `demarrerCRV()` | — |
| 16 | POST | `/crv/:id/terminer` | `stores/crvStore.js` | `terminerCRV()` | — |
| 17 | GET | `/crv/:id/transitions` | `stores/crvStore.js` | `loadTransitions()` | — |
| 18 | POST | `/crv/:id/confirmer-absence` | `stores/crvStore.js` | `confirmerAbsenceCRV()` | `{ type }` |
| 19 | PUT | `/crv/:id/horaire` | `stores/crvStore.js` | `updateHoraire()` | `{ heureAtterrissageReelle?, ... }` |
| 20 | PUT | `/crv/:id/personnel` | `stores/crvStore.js` | `updatePersonnel()` | `{ personnelAffecte: [] }` |
| 21 | PUT | `/crv/:id/engins` | `stores/crvStore.js` | `updateEngins()` | `{ engins: [] }` |
| 22 | PUT | `/crv/:crvId/phases/:phaseId` | `stores/crvStore.js`, `components/crv/CRVPhases.vue` | `updatePhaseManuel()` | `{ statut?, heureDebutReelle?, heureFinReelle? }` |
| 23 | POST | `/crv/:id/charges` | `stores/crvStore.js` | `addCharge()` | `{ typeCharge, sensOperation, ... }` |
| 24 | POST | `/crv/:id/evenements` | `stores/crvStore.js`, `components/crv/CRVEvenements.vue` | `addEvenement()` | `{ typeEvenement, gravite, description }` |
| 25 | POST | `/crv/:id/observations` | `stores/crvStore.js` | `addObservation()` | `{ categorie, contenu }` |
| 26 | GET | `/crv/search` | `stores/crvStore.js` | `searchCRVs()` | `?q,dateDebut,dateFin,statut` |
| 27 | GET | `/crv/stats` | `stores/crvStore.js`, `views/Admin/Dashboard.vue` | `getStatistiques()` | `?dateDebut,dateFin` |
| 28 | GET | `/crv/export` | `stores/crvStore.js`, `views/CRV/CRVList.vue` | `exportCRVs()` | `?format,dateDebut,dateFin` → Blob |
| 29 | GET | `/crv/vols-sans-crv` | `stores/crvStore.js` | `getVolsSansCRV()` | `?date` |
| 30 | GET | `/crv/annules` | `stores/crvStore.js` | `getAnnuledCRVs()` | `?dateDebut,dateFin,page,limit` |
| 31 | GET | `/crv/statistiques/annulations` | `stores/crvStore.js` | `getStatistiquesAnnulations()` | `?dateDebut,dateFin` |
| 32 | POST | `/crv/:id/archive` | `stores/crvStore.js` | `archiveCRV()` | — |
| 33 | GET | `/crv/archive/status` | `stores/crvStore.js`, `views/Admin/Dashboard.vue` | `getArchiveStatus()` | — |
| 34 | POST | `/crv/archive/test` | `stores/crvStore.js`, `views/Admin/Dashboard.vue` | `testArchive()` | — |
| 35 | GET | `/crv/:id/peut-annuler` | `stores/crvStore.js` | `checkCanAnnuler()` | — |
| 36 | POST | `/crv/:id/annuler` | `stores/crvStore.js` | `annulerCRV()` | `{ motifAnnulation, details? }` |
| 37 | POST | `/crv/:id/reactiver` | `stores/crvStore.js` | `reactiverCRV()` | `{ motifReactivation }` |

**6 déclarés JAMAIS appelés** : `annulerConfirmationAbsence`, `addPersonne`, `removePersonne`, `getArchivageStatus`, `getPDFBase64`, `telechargerPDF`

## PHASES — 7/7 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction |
|---|--------|-----|------------------------|----------|
| 38 | GET | `/phases` | `stores/phasesStore.js` | `loadPhasesByCRV(?crvId)` |
| 39 | GET | `/phases/:id` | `stores/phasesStore.js` | `loadPhase()` |
| 40 | POST | `/phases/:id/demarrer` | `stores/crvStore.js`, `stores/phasesStore.js` | `demarrerPhase()` |
| 41 | POST | `/phases/:id/terminer` | `stores/crvStore.js`, `stores/phasesStore.js` | `terminerPhase()` |
| 42 | POST | `/phases/:id/non-realise` | `stores/crvStore.js`, `stores/phasesStore.js`, `components/crv/CRVPhases.vue` | `marquerNonRealise()` |
| 43 | PATCH | `/phases/:id` | `stores/crvStore.js`, `stores/phasesStore.js` | `updatePhase()` |

> Note : `phasesAPI.updateManuel()` → PUT `/crv/:crvId/phases/:phaseId` est comptabilisé dans la section CRV (#22).

## VOLS — 4/4 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction |
|---|--------|-----|------------------------|----------|
| 44 | POST | `/vols` | `stores/volsStore.js` | `createVol()` |
| 45 | GET | `/vols` | `stores/volsStore.js` | `listVols()` |
| 46 | GET | `/vols/:id` | `stores/volsStore.js` | `loadVol()` |
| 47 | PATCH | `/vols/:id` | `stores/volsStore.js` | `updateVol()` |

## PROGRAMMES VOL — 17/26 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction |
|---|--------|-----|------------------------|----------|
| 48 | POST | `/programmes-vol` | `stores/programmesStore.js`, `views/Manager/ProgrammesVol.vue` | `createProgramme()` |
| 49 | GET | `/programmes-vol` | `stores/programmesStore.js`, `views/Manager/ProgrammesVol.vue`, `views/Bulletins/BulletinCreate.vue`, `views/CRV/CRVNouveau.vue` | `listProgrammes()` |
| 50 | GET | `/programmes-vol/:id` | `stores/programmesStore.js`, `views/Manager/ProgrammesVol.vue` | `loadProgramme()` |
| 51 | PATCH | `/programmes-vol/:id` | `stores/programmesStore.js`, `views/Manager/ProgrammesVol.vue` | `updateProgramme()` |
| 52 | DELETE | `/programmes-vol/:id` | `stores/programmesStore.js`, `views/Manager/ProgrammesVol.vue` | `deleteProgramme()` |
| 53 | POST | `/programmes-vol/:id/valider` | `stores/programmesStore.js`, `views/Manager/ProgrammesVol.vue` | `validerProgramme()` |
| 54 | POST | `/programmes-vol/:id/activer` | `stores/programmesStore.js`, `views/Manager/ProgrammesVol.vue` | `activerProgramme()` |
| 55 | POST | `/programmes-vol/:id/suspendre` | `stores/programmesStore.js`, `views/Manager/ProgrammesVol.vue` | `suspendreProgramme()` |
| 56 | GET | `/programmes-vol/actif` | `views/CRV/CRVNouveau.vue` | appel direct |
| 57 | POST | `/programmes-vol/:id/dupliquer` | `stores/programmesStore.js` | `dupliquerProgramme()` |
| 58 | GET | `/programmes-vol/:id/statistiques` | `stores/programmesStore.js` | `getStatistiques()` |
| 59 | GET | `/programmes-vol/:pId/vols` | `views/Manager/ProgrammesVol.vue` | appel direct |
| 60 | GET | `/programmes-vol/:pId/vols/jour/:jour` | `views/Manager/ProgrammesVol.vue`, `views/CRV/CRVNouveau.vue` | appel direct |
| 61 | POST | `/programmes-vol/:pId/vols` | `views/Manager/ProgrammesVol.vue` | `addVol()` |
| 62 | PATCH | `/programmes-vol/:pId/vols/:id` | `views/Manager/ProgrammesVol.vue` | `updateVol()` |
| 63 | DELETE | `/programmes-vol/:pId/vols/:id` | `views/Manager/ProgrammesVol.vue` | `deleteVol()` |
| 64 | GET | `/programmes-vol/:pId/export-pdf` | `components/flights/ProgrammeVolPDF.vue` | `previewPDF()` |
| 65 | GET | `/programmes-vol/:pId/telecharger-pdf` | `components/flights/ProgrammeVolPDF.vue` | `downloadPDF()` |

**9 déclarés JAMAIS appelés** : `getResumeById`, `rechercherVols`, `getVolsParCompagnie`, `importVols`, `reorganiserVols`, `getVol`, `getPDFBase64`, `archiver`, `getArchivageStatus`

## CHARGES — 16/16 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction |
|---|--------|-----|------------------------|----------|
| 66 | GET | `/charges/:id` | `stores/chargesStore.js:73`, `stores/crvStore.js:991,1018` | `loadCharge()` |
| 67 | PATCH | `/charges/:id` | `stores/chargesStore.js:94` | `updateCharge()` |
| 68 | PUT | `/charges/:id/categories-detaillees` | `stores/chargesStore.js`, `stores/crvStore.js` | `updateCategoriesDetaillees()` |
| 69 | PUT | `/charges/:id/classes` | `stores/chargesStore.js` | `updateClasses()` |
| 70 | PUT | `/charges/:id/besoins-medicaux` | `stores/chargesStore.js` | `updateBesoinsMedicaux()` |
| 71 | PUT | `/charges/:id/mineurs` | `stores/chargesStore.js` | `updateMineurs()` |
| 72 | POST | `/charges/:id/convertir-categories-detaillees` | `stores/chargesStore.js` | `convertirCategoriesDetaillees()` |
| 73 | PUT | `/charges/:id/fret-detaille` | `stores/chargesStore.js`, `stores/crvStore.js` | `updateFretDetaille()` |
| 74 | POST | `/charges/:id/marchandises-dangereuses` | `stores/chargesStore.js`, `stores/crvStore.js` | `addMarchandiseDangereuse()` |
| 75 | DELETE | `/charges/:id/marchandises-dangereuses/:mId` | `stores/chargesStore.js`, `stores/crvStore.js` | `deleteMarchandiseDangereuse()` |
| 76 | POST | `/charges/valider-marchandise-dangereuse` | `stores/chargesStore.js` | `validerMarchandiseDangereuse()` |
| 77 | GET | `/charges/marchandises-dangereuses` | `stores/chargesStore.js` | `loadMarchandisesDangereuses()` |
| 78 | GET | `/charges/statistiques/passagers` | `stores/chargesStore.js` | `loadStatistiquesPassagers()` |
| 79 | GET | `/charges/statistiques/fret` | `stores/chargesStore.js` | `loadStatistiquesFret()` |
| 80 | GET | `/charges/crv/:crvId/statistiques-passagers` | `stores/chargesStore.js` | `loadStatistiquesPassagersByCRV()` |
| 81 | GET | `/charges/crv/:crvId/statistiques-fret` | `stores/chargesStore.js` | `loadStatistiquesFretByCRV()` |

> **ATTENTION** : les #66 et #67 appellent des routes qui N'EXISTENT PAS côté backend (voir Liste A).

## VALIDATION — 4/4 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction |
|---|--------|-----|------------------------|----------|
| 82 | GET | `/validation/:id` | `stores/crvStore.js`, `views/Manager/ValidationCRV.vue` | `getStatusValidation()` |
| 83 | POST | `/validation/:id/valider` | `stores/crvStore.js`, `views/Manager/ValidationCRV.vue` | `validerCRV()` |
| 84 | POST | `/validation/:id/verrouiller` | `stores/crvStore.js`, `views/Manager/ValidationCRV.vue` | `verrouillerCRV()` |
| 85 | POST | `/validation/:id/deverrouiller` | `stores/crvStore.js`, `views/Manager/ValidationCRV.vue` | `deverrouillerCRV()` |

## ENGINS — 1/11 déclarés utilisé

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction |
|---|--------|-----|------------------------|----------|
| 86 | PUT | `/crv/:crvId/engins` | `stores/crvStore.js` | `updateEngins()` |

> **10 déclarés JAMAIS appelés** : `getAll`, `getTypes`, `getDisponibles`, `create`, `getById`, `update`, `delete`, `getByCRV`, `addToCRV`, `removeFromCRV`

## AVIONS — 12/12 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction |
|---|--------|-----|------------------------|----------|
| 87 | GET | `/avions` | `stores/avionsStore.js`, `views/Manager/AvionsGestion.vue` | `listAvions()` |
| 88 | GET | `/avions/:id` | `stores/avionsStore.js` | `loadAvion()` |
| 89 | POST | `/avions` | `stores/avionsStore.js`, `views/Manager/AvionsGestion.vue` | `createAvion()` |
| 90 | PUT | `/avions/:id/configuration` | `stores/avionsStore.js`, `views/Manager/AvionsGestion.vue` | `updateConfiguration()` |
| 91 | POST | `/avions/:id/versions` | `stores/avionsStore.js` | `createVersion()` |
| 92 | GET | `/avions/:id/versions` | `stores/avionsStore.js`, `views/Manager/AvionsGestion.vue` | `loadVersions()` |
| 93 | GET | `/avions/:id/versions/:numero` | `stores/avionsStore.js` | `loadVersion()` |
| 94 | POST | `/avions/:id/versions/:numero/restaurer` | `stores/avionsStore.js`, `views/Manager/AvionsGestion.vue` | `restaurerVersion()` |
| 95 | GET | `/avions/:id/versions/comparer` | `stores/avionsStore.js`, `views/Manager/AvionsGestion.vue` | `comparerVersions()` |
| 96 | PUT | `/avions/:id/revision` | `stores/avionsStore.js`, `views/Manager/AvionsGestion.vue` | `planifierRevision()` |
| 97 | GET | `/avions/revisions/prochaines` | `stores/avionsStore.js`, `views/Manager/AvionsGestion.vue` | `loadRevisionsProchaines()` |
| 98 | GET | `/avions/statistiques/configurations` | `stores/avionsStore.js`, `views/Manager/AvionsGestion.vue` | `loadStatistiques()` |

## NOTIFICATIONS — 8/8 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction |
|---|--------|-----|------------------------|----------|
| 99 | GET | `/notifications` | `stores/notificationsStore.js` | `loadNotifications()` |
| 100 | GET | `/notifications/count-non-lues` | `stores/notificationsStore.js` | `loadCountNonLues()` |
| 101 | PATCH | `/notifications/lire-toutes` | `stores/notificationsStore.js` | `marquerToutesLues()` |
| 102 | GET | `/notifications/statistiques` | `stores/notificationsStore.js`, `views/Manager/Statistiques.vue` | `loadStatistiques()` |
| 103 | POST | `/notifications` | `stores/notificationsStore.js` | `createNotification()` |
| 104 | PATCH | `/notifications/:id/lire` | `stores/notificationsStore.js` | `marquerLue()` |
| 105 | PATCH | `/notifications/:id/archiver` | `stores/notificationsStore.js` | `archiverNotification()` |
| 106 | DELETE | `/notifications/:id` | `stores/notificationsStore.js` | `deleteNotification()` |

## SLA — 7/7 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction |
|---|--------|-----|------------------------|----------|
| 107 | GET | `/sla/rapport` | `stores/slaStore.js` | `loadRapport()` |
| 108 | GET | `/sla/configuration` | `stores/slaStore.js` | `loadConfiguration()` |
| 109 | PUT | `/sla/configuration` | `stores/slaStore.js` | `updateConfiguration()` |
| 110 | POST | `/sla/surveiller/crv` | `stores/slaStore.js` | `surveillerCRV()` |
| 111 | POST | `/sla/surveiller/phases` | `stores/slaStore.js` | `surveillerPhases()` |
| 112 | GET | `/sla/crv/:id` | `stores/slaStore.js` | `loadCRVSla()` |
| 113 | GET | `/sla/phase/:id` | `stores/slaStore.js` | `loadPhaseSla()` |

## BULLETINS — 15/15 déclarés utilisés

| # | METHOD | URL | Fichier(s) appelant(s) | Fonction |
|---|--------|-----|------------------------|----------|
| 114 | GET | `/bulletins` | `stores/bulletinStore.js` | `fetchBulletins()` |
| 115 | GET | `/bulletins/:id` | `stores/bulletinStore.js` | `fetchBulletinById()` |
| 116 | GET | `/bulletins/en-cours/:escale` | `stores/bulletinStore.js`, `views/CRV/CRVNouveau.vue` | `fetchBulletinEnCours()` |
| 117 | GET | `/bulletins/escales-actives` | `views/CRV/CRVNouveau.vue` | appel direct |
| 118 | POST | `/bulletins` | `stores/bulletinStore.js` | `creerBulletin()` |
| 119 | POST | `/bulletins/depuis-programme` | `stores/bulletinStore.js` | `creerBulletinDepuisProgramme()` |
| 120 | DELETE | `/bulletins/:id` | `stores/bulletinStore.js` | `supprimerBulletin()` |
| 121 | POST | `/bulletins/:id/mouvements` | `stores/bulletinStore.js` | `ajouterMouvement()` |
| 122 | POST | `/bulletins/:id/mouvements/hors-programme` | `stores/bulletinStore.js` | `ajouterVolHorsProgramme()` |
| 123 | PATCH | `/bulletins/:id/mouvements/:mId` | `stores/bulletinStore.js` | `modifierMouvement()` |
| 124 | DELETE | `/bulletins/:id/mouvements/:mId` | `stores/bulletinStore.js` | `supprimerMouvement()` |
| 125 | POST | `/bulletins/:id/mouvements/:mId/annuler` | `stores/bulletinStore.js` | `annulerMouvement()` |
| 126 | POST | `/bulletins/:id/publier` | `stores/bulletinStore.js` | `publierBulletin()` |
| 127 | POST | `/bulletins/:id/archiver` | `stores/bulletinStore.js` | `archiverBulletin()` |
| 128 | POST | `/bulletins/:id/creer-vols` | `stores/bulletinStore.js` | `creerVols()` |

---

# PHASE 2 — Comparaison croisée FRONT vs BACK {#phase-2}

---

## LISTE A — Endpoints FRONT utilisés mais ABSENTS côté BACK {#liste-a}

### A1. Routes fantômes (404 à l'exécution)

| Sévérité | METHOD | URL front | Fichier appelant | Existe côté back ? |
|----------|--------|-----------|------------------|--------------------|
| **CRITIQUE** | GET | `/charges/:id` | `stores/chargesStore.js:73`, `stores/crvStore.js:991,1018` | **NON** — Aucune route GET `/api/charges/:id` dans `charge.routes.js` |
| **CRITIQUE** | PATCH | `/charges/:id` | `stores/chargesStore.js:94` | **NON** — Aucune route PATCH `/api/charges/:id` dans `charge.routes.js` |

> **Impact** : `chargesStore.loadCharge()` et `chargesStore.updateCharge()` retournent systématiquement **404**.
> Après chaque ajout/suppression de marchandise dangereuse, `crvStore` appelle `chargesAPI.getById(chargeId)` pour rafraîchir → **404 silencieux** (catch dans le store).

### A2. Méthodes fantômes (TypeError à l'exécution)

| Sévérité | Appel dans le code | Fichier | Ligne | Problème |
|----------|-------------------|---------|-------|----------|
| **CRITIQUE** | `crvAPI.getStatistiques()` | `views/Manager/Statistiques.vue` | 278 | **Méthode inexistante** sur crvAPI — le nom correct est `crvAPI.getStats()` |
| **CRITIQUE** | `volsAPI.getStatistiques()` | `views/Manager/Statistiques.vue` | 313 | **Méthode inexistante** sur volsAPI — volsAPI n'a que `create`, `getAll`, `getById`, `update` |
| **CRITIQUE** | `crvAPI.getStatistiquesCharges()` | `views/Manager/Statistiques.vue` | 328 | **Méthode inexistante** sur crvAPI — aucun endpoint backend correspondant non plus |

> **Impact** : La page `Statistiques.vue` est **100% cassée** — les 3 fonctions `loadCRVStats()`, `loadVolsStats()`, `loadChargesStats()` tombent en erreur TypeError. Seule `loadNotificationStats()` fonctionne.

---

## LISTE B — Endpoints BACK existants mais JAMAIS utilisés côté FRONT {#liste-b}

### B1. AUTH (2 inutilisés)

| METHOD | URL backend | Controller | Raison |
|--------|------------|------------|--------|
| POST | `/api/auth/login` | `login` | Le front utilise l'alias `/api/auth/connexion` |
| POST | `/api/auth/register` | `register` | Le front utilise l'alias `/api/auth/inscription`, mais même celui-ci n'est **jamais appelé** (inscription fermée, ADMIN crée via personnesAPI) |

### B2. PERSONNES (2 inutilisés)

| METHOD | URL backend | Controller | Raison |
|--------|------------|------------|--------|
| GET | `/api/personnes/stats/global` | `getPersonnesStats` | **Aucun appel** — aucune vue n'affiche de stats utilisateurs |
| PUT | `/api/personnes/:id` | `updatePersonne` | Le front utilise uniquement PATCH (même controller côté back, mais la route PUT est redondante) |

### B3. CRV (12 inutilisés)

| METHOD | URL backend | Controller | Raison |
|--------|------------|------------|--------|
| DELETE | `/api/crv/:id/confirmer-absence` | `annulerConfirmationAbsence` | Déclaré dans api.js mais jamais appelé |
| PUT | `/api/crv/:id` | `mettreAJourCRV` | Le front utilise PATCH uniquement |
| POST | `/api/crv/:id/personnel` | `ajouterPersonnel` | Le front fait un PUT bulk (remplace tout le personnel) |
| DELETE | `/api/crv/:id/personnel/:personneId` | `supprimerPersonnel` | Idem — jamais de suppression individuelle |
| GET | `/api/crv/:id/engins` | `obtenirEnginsAffectes` | Le CRV charge ses engins via `crvAPI.getById()` (inclus dans la réponse) |
| POST | `/api/crv/:id/engins` | `ajouterEnginAuCRV` | Le front fait un PUT bulk |
| DELETE | `/api/crv/:id/engins/:affectationId` | `retirerEnginDuCRV` | Idem |
| GET | `/api/crv/:id/archive/status` | `verifierArchivageCRV` | Déclaré mais jamais appelé |
| GET | `/api/crv/:id/archivage` | `obtenirInfosArchivage` | **Pas même déclaré** dans api.js |
| GET | `/api/crv/:id/export-pdf` | `obtenirDonneesPDF` | **Pas même déclaré** dans api.js |
| GET | `/api/crv/:id/telecharger-pdf` | `telechargerPDF` | Déclaré mais jamais appelé — aucune UI de téléchargement PDF CRV |
| GET | `/api/crv/:id/pdf-base64` | `obtenirPDFBase64` | Déclaré mais jamais appelé — aucune preview PDF CRV |

### B4. PROGRAMMES VOL (10 inutilisés)

| METHOD | URL backend | Controller | Raison |
|--------|------------|------------|--------|
| GET | `/api/programmes-vol/:id/resume` | `obtenirResume` | Déclaré, jamais appelé |
| GET | `/api/programmes-vol/:pId/vols/recherche` | `rechercherVols` | Pas de barre de recherche dans ProgrammesVol.vue |
| GET | `/api/programmes-vol/:pId/vols/compagnie/:code` | `obtenirVolsParCompagnie` | Pas de filtre compagnie |
| POST | `/api/programmes-vol/:pId/vols/import` | `importerVols` | Pas d'import bulk implémenté |
| PATCH | `/api/programmes-vol/:pId/vols/reorganiser` | `reorganiserVols` | Pas de drag & drop |
| GET | `/api/programmes-vol/:pId/vols/:id` | `obtenirVolParId` | Détail individuel non utilisé |
| GET | `/api/programmes-vol/:pId/pdf-base64` | `obtenirPDFBase64` | Déclaré, jamais appelé |
| POST | `/api/programmes-vol/:pId/archiver` | `archiverProgramme` | Déclaré, jamais appelé |
| GET | `/api/programmes-vol/:pId/archivage/status` | `verifierArchivage` | Déclaré, jamais appelé |
| GET | `/api/programmes-vol/:pId/archivage` | `obtenirInfosArchivage` | **Pas même déclaré** dans api.js |

### B5. ENGINS (7 inutilisés — la totalité du référentiel)

| METHOD | URL backend | Controller | Raison |
|--------|------------|------------|--------|
| GET | `/api/engins` | `listerEngins` | **Aucune page de gestion des engins** dans le frontend |
| GET | `/api/engins/types` | `obtenirTypesEngins` | Idem |
| GET | `/api/engins/disponibles` | `listerEnginsDisponibles` | Idem |
| POST | `/api/engins` | `creerEngin` | Idem |
| GET | `/api/engins/:id` | `obtenirEngin` | Idem |
| PUT | `/api/engins/:id` | `mettreAJourEngin` | Idem |
| DELETE | `/api/engins/:id` | `supprimerEngin` | Idem |

### B6. HEALTH (1 inutilisé)

| METHOD | URL backend | Raison |
|--------|------------|--------|
| GET | `/health` | Ni déclaré ni utilisé par le frontend (endpoint ops/monitoring) |

### Résumé Liste B

| Module | Endpoints backend | Utilisés par le front | Inutilisés |
|--------|-------------------|----------------------|------------|
| Auth | 7 (dont 2 alias) | 4 | **3** |
| Personnes | 7 (PUT+PATCH same) | 5 | **2** |
| CRV | 41 | 28 | **12** (+ 1 comptée dans la section en raison du PUT /crv/:id) |
| Vols | 4 | 4 | **0** |
| Programmes | 28 | 17 | **10** (+1 non déclarée) |
| Bulletins | 15 | 15 | **0** |
| Phases | 6 | 6 | **0** |
| Charges | 14 | 14 | **0** |
| Validation | 4 | 4 | **0** |
| Engins | 7 | 0 | **7** |
| Avions | 12 | 12 | **0** |
| Notifications | 8 | 8 | **0** |
| SLA | 7 | 7 | **0** |
| Health | 1 | 0 | **1** |
| **TOTAL** | **~161** | **~124** | **~35** |

---

## LISTE C — Présent des deux côtés mais INCOHÉRENT {#liste-c}

### C1. Méthode HTTP divergente

| URL | Front envoie | Back accepte | Impact |
|-----|-------------|-------------|--------|
| `/api/crv/:id` | PATCH uniquement | PATCH **et** PUT | Fonctionne, mais le front ignore PUT |
| `/api/personnes/:id` | PATCH uniquement | PATCH **et** PUT | Idem |

### C2. Nommage de méthode vs endpoint réel

| Appel front | Endpoint attendu | Endpoint réel api.js | Impact |
|-------------|-----------------|---------------------|--------|
| `crvAPI.getStatistiques()` dans Statistiques.vue:278 | GET `/crv/stats` | La méthode s'appelle `crvAPI.getStats()` | **TypeError: crvAPI.getStatistiques is not a function** |

### C3. Pattern bulk vs granulaire

| Domaine | Pattern front | Routes back disponibles | Incohérence |
|---------|--------------|------------------------|-------------|
| Personnel CRV | PUT `/crv/:id/personnel` (remplace tout) | PUT (bulk) + POST (ajouter 1) + DELETE (retirer 1) | Le front ne supporte pas l'ajout/suppression individuelle |
| Engins CRV | PUT `/crv/:id/engins` (remplace tout) | PUT (bulk) + POST (ajouter 1) + GET (lister) + DELETE (retirer 1) | Le front ne supporte pas la gestion granulaire |

---

# 3 EXEMPLES CONCRETS D'INCOHÉRENCE {#exemples}

## Exemple 1 : `chargesAPI.getById()` — Route fantôme (CRITIQUE)

**Fichier front** : `src/stores/crvStore.js:991`
```javascript
// Après ajout d'une marchandise dangereuse, le store rafraîchit la charge :
const chargeResponse = await chargesAPI.getById(chargeId)
// chargesAPI.getById(id) → api.get(`/charges/${id}`)
```

**Côté back** : `src/routes/charges/charge.routes.js`
```
Routes charges existantes :
  PUT    /api/charges/:id/categories-detaillees
  PUT    /api/charges/:id/classes
  PUT    /api/charges/:id/besoins-medicaux
  PUT    /api/charges/:id/mineurs
  POST   /api/charges/:id/convertir-categories-detaillees
  PUT    /api/charges/:id/fret-detaille
  POST   /api/charges/:id/marchandises-dangereuses
  DELETE /api/charges/:id/marchandises-dangereuses/:mId
  ... (statistiques)

→ AUCUNE route GET /api/charges/:id
→ AUCUNE route PATCH /api/charges/:id
```

**Payload envoyé** : GET `/api/charges/65f4abc123...`
**Réponse attendue** : `{ success: true, data: ChargeOperationnelle }`
**Réponse réelle** : `404 Not Found` ou `Cannot GET /api/charges/65f4abc123`

**Impact** : Le rafraîchissement après ajout/suppression DGR échoue silencieusement. L'UI ne met pas à jour la liste des marchandises dangereuses sans rechargement complet du CRV.

---

## Exemple 2 : `Statistiques.vue` — 3 méthodes fantômes (CRITIQUE)

**Fichier front** : `src/views/Manager/Statistiques.vue:278,313,328`
```javascript
import { crvAPI, notificationsAPI, volsAPI } from '@/services/api'

// Ligne 278 — ERREUR : getStatistiques n'existe pas, le nom est getStats
const response = await crvAPI.getStatistiques({ periode: periode.value })

// Ligne 313 — ERREUR : volsAPI n'a aucune méthode getStatistiques
const response = await volsAPI.getStatistiques({ periode: periode.value })

// Ligne 328 — ERREUR : crvAPI n'a aucune méthode getStatistiquesCharges
const response = await crvAPI.getStatistiquesCharges({ periode: periode.value })
```

**Méthodes réellement disponibles** :
- `crvAPI` : `getStats()` (pas getStatistiques)
- `volsAPI` : `create()`, `getAll()`, `getById()`, `update()` (aucune stats)
- `crvAPI` : aucune `getStatistiquesCharges`

**Payload envoyé** : N/A (TypeError avant même l'appel réseau)
**Réponse attendue** : `{ success: true, data: { total, valides, enCours, completudeMoyenne } }`
**Réponse réelle** : `TypeError: crvAPI.getStatistiques is not a function`

**Impact** : La page Statistiques Manager est **entièrement cassée**. Seule la section Notifications fonctionne (appelle `notificationsAPI.getStatistiques()` qui existe bien).

---

## Exemple 3 : Engins — Module fantôme complet

**Fichier front** : `src/services/api.js:1183-1292` (enginsAPI, 110 lignes)
```javascript
export const enginsAPI = {
  getAll: (params) => api.get('/engins', { params }),          // JAMAIS appelé
  getTypes: () => api.get('/engins/types'),                    // JAMAIS appelé
  getDisponibles: (typeEngin) => api.get('/engins/disponibles'),// JAMAIS appelé
  create: (data) => api.post('/engins', data),                 // JAMAIS appelé
  getById: (id) => api.get(`/engins/${id}`),                   // JAMAIS appelé
  update: (id, data) => api.put(`/engins/${id}`, data),        // JAMAIS appelé
  delete: (id) => api.delete(`/engins/${id}`),                 // JAMAIS appelé
  getByCRV: (crvId) => api.get(`/crv/${crvId}/engins`),        // JAMAIS appelé
  addToCRV: (crvId, data) => api.post(`/crv/${crvId}/engins`), // JAMAIS appelé
  removeFromCRV: (crvId, aid) => api.delete(`/crv/${crvId}/engins/${aid}`), // JAMAIS appelé
  updateCRVEngins: (crvId, engins) => api.put(`/crv/${crvId}/engins`, { engins }) // ← SEUL utilisé
}
```

**Côté back** : 7 routes engin référentiel + 4 routes affectation CRV = 11 routes
**Côté front** : 1 seule route effectivement appelée (`updateCRVEngins`)

**Payload du seul appel utilisé** : PUT `/crv/:crvId/engins` avec `{ engins: [{ type, immatriculation, heureDebut, heureFin }] }`
**Réponse attendue** : `{ success: true, data: CRV }` (avec engins mis à jour)

**Impact** :
- Pas de page de gestion du parc d'engins (CRUD)
- Pas de sélection d'engins par type/disponibilité lors de l'affectation
- Le composant `CRVEngins.vue` travaille en mode texte libre (pas de sélection depuis le référentiel)
- 110 lignes de code mort dans `api.js`

---

# PLAN D'ALIGNEMENT MVP — 10 ACTIONS {#plan}

| Priorité | Action | Fichiers impactés | Effort | Impact |
|----------|--------|-------------------|--------|--------|
| **1** | **CRITIQUE** — Corriger `Statistiques.vue` : remplacer `crvAPI.getStatistiques()` par `crvAPI.getStats()`, supprimer `volsAPI.getStatistiques()` et `crvAPI.getStatistiquesCharges()` (méthodes inexistantes), ou créer les méthodes manquantes dans `api.js` + routes backend | `views/Manager/Statistiques.vue`, `services/api.js` | S | Page entièrement cassée |
| **2** | **CRITIQUE** — Ajouter les routes backend `GET /api/charges/:id` et `PATCH /api/charges/:id` dans `charge.routes.js` + controller | Backend: `routes/charges/charge.routes.js`, `controllers/charges/` | M | 404 silencieux sur chaque opération DGR |
| **3** | **IMPORTANT** — Nettoyer les 19 méthodes mortes dans `api.js` (authAPI.register, 6 crvAPI, 10 enginsAPI, 9 programmesVolAPI) ou documenter comme "réservées" | `services/api.js` | S | Code mort, confusion, bundle size |
| **4** | **IMPORTANT** — Créer une page de gestion des engins (`views/Manager/EnginsGestion.vue`) ou supprimer les 7 routes backend engins + 110 lignes api.js | Nouveau fichier vue OU nettoyage `api.js` + backend | L | 7 routes backend orphelines, module front fantôme |
| **5** | **MOYEN** — Implémenter le téléchargement/preview PDF CRV : connecter `crvAPI.telechargerPDF()` et `crvAPI.getPDFBase64()` dans un bouton/modale des vues CRV | `views/CRV/CRVArrivee.vue`, `CRVDepart.vue`, `CRVTurnAround.vue`, `components/Common/PDFViewModal.vue` | M | Fonctionnalité PDF CRV inaccessible malgré backend fonctionnel |
| **6** | **MOYEN** — Implémenter l'archivage programme de vols : connecter `programmesVolAPI.archiver()` + `getArchivageStatus()` dans `ProgrammesVol.vue` | `views/Manager/ProgrammesVol.vue` | S | Archivage Drive programme inaccessible |
| **7** | **MOYEN** — Ajouter `GET /api/personnes/stats/global` dans le dashboard Admin ou supprimer la route backend | `views/Admin/Dashboard.vue` OU backend cleanup | S | Route backend orpheline |
| **8** | **FAIBLE** — Implémenter recherche/filtre vols programme : connecter `rechercherVols()`, `getVolsParCompagnie()` dans ProgrammesVol.vue | `views/Manager/ProgrammesVol.vue` | M | UX améliorée |
| **9** | **FAIBLE** — Implémenter import bulk vols : connecter `importVols()` dans ProgrammesVol.vue avec upload CSV/Excel | `views/Manager/ProgrammesVol.vue` | L | Saisie manuelle seule actuellement |
| **10** | **FAIBLE** — Ajouter `annulerConfirmationAbsence()` dans l'UI CRV (bouton "annuler" à côté de chaque confirmation d'absence) | `stores/crvStore.js`, composant CRV concerné | S | Pas de retour arrière sur confirmation absence |

**Légende effort** : S = < 1h | M = 1-4h | L = > 4h

---

# RÉSUMÉ CHIFFRÉ {#resume}

```
┌──────────────────────────────────────────────────┐
│         SYNCHRO API FRONT vs BACK                │
├──────────────────────────────────────────────────┤
│                                                  │
│  Backend expose        : ~161 endpoints          │
│  Frontend déclare      :  146 méthodes (api.js)  │
│  Frontend utilise      :  128 endpoints          │
│  Code mort (api.js)    :   19 méthodes           │
│                                                  │
│  ─── LISTE A (FRONT → BACK ABSENT) ───           │
│  Routes fantômes 404   :    2  (charges)         │
│  Méthodes TypeError    :    3  (Statistiques)    │
│  TOTAL BLOQUANTS       :    5                    │
│                                                  │
│  ─── LISTE B (BACK → FRONT ABSENT) ───           │
│  Endpoints jamais      :   35                    │
│  Dont module entier    :    1  (engins x7)       │
│                                                  │
│  ─── LISTE C (INCOHÉRENCES) ───                  │
│  Nommage méthode       :    1  (getStats)        │
│  Pattern bulk/granul.  :    2  (personnel,engins)│
│  Routes PUT redondant  :    2  (crv, personnes)  │
│                                                  │
│  ─── PAGES CASSÉES ───                           │
│  Statistiques.vue      :  75% cassée (3/4 fn)    │
│  DGR refresh           :  silencieux (404 catch) │
│                                                  │
│  ─── PRIORITÉS ───                               │
│  Actions critiques     :    2  (fix immédiat)    │
│  Actions importantes   :    2  (sprint courant)  │
│  Actions moyennes      :    3  (backlog)         │
│  Actions faibles       :    3  (nice to have)    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

*Généré par FRONTEND_AGENT — Audit exhaustif basé sur le code source réel.*
