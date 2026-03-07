# CHANGELOG — Adaptation Frontend au Contrat API CRV v2

**Date** : 2026-01-31
**Branche** : `master`
**Scope** : Mise en conformite du frontend avec le contrat API CRV Backend v2 (creation CRV)

---

## TABLE DES MATIERES

1. [Resume des changements](#1-resume-des-changements)
2. [Inventaire des fichiers](#2-inventaire-des-fichiers)
3. [Detail par fichier](#3-detail-par-fichier)
4. [Matrice de conformite contrat v2](#4-matrice-de-conformite-contrat-v2)
5. [Verification des payloads par PATH](#5-verification-des-payloads-par-path)
6. [Gestion des doublons (409)](#6-gestion-des-doublons-409)
7. [Alignement des enums](#7-alignement-des-enums)
8. [Preuve de non-regression](#8-preuve-de-non-regression)
9. [Points d'attention](#9-points-dattention)

---

## 1. Resume des changements

| # | Etape | Statut |
|---|-------|--------|
| 1 | Alignement enums `crvEnums.js` | FAIT |
| 2 | Ajout endpoint `volsSansCrv` dans `api.js` | FAIT |
| 3 | Store CRV : gestion 409 doublon | FAIT |
| 4 | Composant `ConfirmationDoublonModal.vue` | FAIT |
| 5 | Composant `CreationLegacyModal.vue` | FAIT |
| 6 | Refonte `CRVNouveau.vue` : separation stricte des PATHs | FAIT |
| 7 | Source donnees `vols-sans-crv` (store + api prets) | FAIT |
| 8 | Verification non-regression + build | FAIT |

---

## 2. Inventaire des fichiers

### Fichiers modifies (4)

| Fichier | Lignes ajoutees | Lignes supprimees | Nature |
|---------|:---:|:---:|--------|
| `src/config/crvEnums.js` | +68 | -15 | Enums realignes |
| `src/services/api.js` | +19 | -4 | Endpoint + JSDoc |
| `src/stores/crvStore.js` | +57 | 0 | Gestion 409 + actions |
| `src/views/CRV/CRVNouveau.vue` | +330 | -83 | Refonte creation |

### Fichiers crees (2)

| Fichier | Lignes | Nature |
|---------|:---:|--------|
| `src/components/crv/ConfirmationDoublonModal.vue` | 168 | Modale doublon 2 etapes |
| `src/components/crv/CreationLegacyModal.vue` | 167 | Modale PATH LEGACY |

### Fichiers NON modifies (preuve de non-regression)

| Categorie | Fichiers | Impacte ? |
|-----------|----------|:---------:|
| Vues CRV edition | `CRVArrivee.vue`, `CRVDepart.vue`, `CRVTurnAround.vue` | NON |
| Vue CRV liste | `CRVList.vue`, `CRVHome.vue` | NON |
| Vue validation | `ValidationCRV.vue` | NON |
| Vues Admin | `GestionUtilisateurs.vue`, `UserCreate.vue`, `UserEdit.vue`, `Dashboard.vue`, `AdminLogs.vue`, `AdminSettings.vue` | NON |
| Vues Manager | `ProgrammesVol.vue`, `Statistiques.vue`, `AvionsGestion.vue` | NON |
| Vues Bulletins | `BulletinsList.vue`, `BulletinCreate.vue`, `BulletinDetail.vue` | NON |
| Vues Common | `Archives.vue`, `Profil.vue`, `Login.vue`, `ChangePassword.vue`, `Services.vue` | NON |
| Composants CRV | `CRVHeader.vue`, `CRVPhases.vue`, `CRVCharges.vue`, `CRVEvenements.vue`, `CRVPersonnes.vue`, `CRVEngins.vue`, `CRVValidation.vue`, `CRVLockedBanner.vue`, `CompletudeBarre.vue` | NON |
| Composants Common | `AppHeader.vue`, `AppFooter.vue` | NON |
| Stores | `authStore.js`, `bulletinStore.js`, `volsStore.js`, `programmesStore.js`, `avionsStore.js`, `personnesStore.js`, `chargesStore.js`, `phasesStore.js`, `notificationsStore.js`, `slaStore.js`, `themeStore.js` | NON |
| Router | `index.js`, `adminRoutes.js`, `agentRoutes.js`, `managerRoutes.js`, `bulletinRoutes.js`, `commonRoutes.js` | NON |
| Permissions | `permissions.js`, `usePermissions.js`, `useAuth.js`, `vCan.js` | NON |
| Config | `roles.js`, `ui.js` | NON |

---

## 3. Detail par fichier

### 3.1 `src/config/crvEnums.js`

#### CATEGORIE_PHASE — ajout `BRIEFING`

```diff
  NETTOYAGE: 'NETTOYAGE',
- SECURITE: 'SECURITE'
+ SECURITE: 'SECURITE',
+ BRIEFING: 'BRIEFING'
```

**Justification contrat v2** : Section 8 — Phase.categorie inclut `BRIEFING`.

#### ROLE_PERSONNEL — realignement 8 → 11 valeurs

| Avant (8 valeurs) | Apres (11 valeurs) | Contrat v2 Section 13 |
|---|---|---|
| `CHEF_AVION` | `CHEF_ESCALE` | Chef d'escale |
| `AGENT_TRAFIC` | `AGENT_TRAFIC` | Agent de trafic |
| `AGENT_PISTE` | `AGENT_PISTE` | Agent de piste |
| `AGENT_BAGAGES` | ~~supprime~~ | — |
| `AGENT_FRET` | ~~supprime~~ | — |
| — | `AGENT_PASSAGE` | Agent de passage |
| — | `MANUTENTIONNAIRE` | Manutentionnaire |
| — | `CHAUFFEUR` | Chauffeur |
| — | `AGENT_SECURITE` | Agent de securite |
| — | `TECHNICIEN` | Technicien |
| `SUPERVISEUR` | `SUPERVISEUR` | Superviseur |
| `COORDINATEUR` | `COORDINATEUR` | Coordinateur |
| `AUTRE` | `AUTRE` | Autre |

**Verification** : grep `CHEF_AVION|AGENT_BAGAGES|AGENT_FRET` dans `src/` = **0 occurrence**. Aucune reference residuelle.

#### TYPE_ENGIN — renommage `NACELLE_ELEVATRICE` → `ELEVATEUR`

```diff
- NACELLE_ELEVATRICE: 'NACELLE_ELEVATRICE',
+ ELEVATEUR: 'ELEVATEUR',
```

**Justification contrat v2** : Section 14 — Types engin CRV liste `ELEVATEUR`.
**Verification** : grep `NACELLE_ELEVATRICE` dans `src/` = **0 occurrence**.

#### TYPE_VOL_HORS_PROGRAMME — nouvel enum

```javascript
export const TYPE_VOL_HORS_PROGRAMME = Object.freeze({
  CHARTER: 'CHARTER',
  MEDICAL: 'MEDICAL',
  TECHNIQUE: 'TECHNIQUE',
  COMMERCIAL: 'COMMERCIAL',
  CARGO: 'CARGO',
  AUTRE: 'AUTRE'
})
```

**Justification contrat v2** : Section 1 PATH 2 — `vol.typeVolHorsProgramme` obligatoire, valeurs listees.

#### ERROR_CODES — ajout `CRV_DOUBLON`

```diff
 export const ERROR_CODES = Object.freeze({
+  CRV_DOUBLON: 'CRV_DOUBLON',
   CRV_VERROUILLE: 'CRV_VERROUILLE',
```

**Justification contrat v2** : Section 22 — Code HTTP 409, code metier `CRV_DOUBLON`.

---

### 3.2 `src/services/api.js`

#### JSDoc `create()` mis a jour

```diff
-   * Body: { volId?, type?, date?, responsableVolId? }
+   * 4 chemins exclusifs determines par le body :
+   *   PATH 1 : { bulletinId, mouvementId, escale?, responsableVolId? }
+   *   PATH 2 : { vol: { ... }, escale?, responsableVolId? }
+   *   PATH 3 : { volId, escale?, responsableVolId? }
+   *   PATH LEGACY : { type, date?, escale? }
```

#### Ajout `volsSansCrv`

```javascript
volsSansCrv: (date) => {
  return api.get('/crv/vols-sans-crv', { params: { date } })
}
```

**Justification contrat v2** : Section 2 — `GET /api/crv/vols-sans-crv?date=YYYY-MM-DD`.

---

### 3.3 `src/stores/crvStore.js`

#### `createCRV()` — gestion 409 CRV_DOUBLON

Ajout dans le `catch` :

```javascript
if (error.response?.status === 409 && error.response?.data?.code === ERROR_CODES.CRV_DOUBLON) {
  return {
    doublon: true,
    crvExistantId: error.response.data.crvExistantId,
    numeroCRV: error.response.data.numeroCRV,
    message: error.response.data.message,
    originalPayload: data
  }
}
```

**Comportement** : au lieu de `throw`, retourne un objet `{ doublon: true }` que le composant detecte pour ouvrir la modale.

**Contrat v2 respecte** :
- Detecte `status === 409` ET `code === 'CRV_DOUBLON'` (section Doublons)
- Remonte `crvExistantId` et `numeroCRV` (champs du contrat)
- Conserve `originalPayload` pour le retry

#### `createCRVForceDoublon()` — nouvelle action

```javascript
async createCRVForceDoublon(originalPayload) {
  const payload = {
    ...originalPayload,
    forceDoublon: true,
    confirmationLevel: 2
  }
  return this.createCRV(payload)
}
```

**Contrat v2 respecte** :
- `forceDoublon: true` + `confirmationLevel: 2` (section Doublons — regle front)
- `confirmationLevel` n'est envoye QUE si `forceDoublon` est `true`
- Reutilise `createCRV()` — pas de duplication de logique

#### `fetchVolsSansCrv()` — nouvelle action

```javascript
async fetchVolsSansCrv(date) {
  const response = await crvAPI.volsSansCrv(date)
  return Array.isArray(result) ? result : result?.data || []
}
```

---

### 3.4 `src/components/crv/ConfirmationDoublonModal.vue` (nouveau)

**UX 2 etapes conformes au contrat v2** :

| Etape | Message | Action |
|-------|---------|--------|
| 1 | "Un CRV existe deja pour ce vol. Voulez-vous continuer ?" | Active `forceDoublon: true` |
| 2 | "Confirmez-vous la creation d'un doublon ? Cette action est tracee." | Ajoute `confirmationLevel: 2` |

**Props** : `visible`, `crvExistantId`, `numeroCRV`
**Emits** : `confirm`, `cancel`
**Reset** : step revient a 1 quand la modale se referme/reouvre.

---

### 3.5 `src/components/crv/CreationLegacyModal.vue` (nouveau)

**Formulaire PATH LEGACY strictement conforme** :

| Champ UI | Champ envoye | Obligatoire (contrat) | Default (contrat) |
|----------|-------------|:---:|---|
| Select type | `type` | non | `depart` |
| Date picker | `date` | non | aujourd'hui |
| Input escale | `escale` | non | `TLS` |

**Ce qui n'est PAS dans la modale** (conformite) :
- Aucun champ numero de vol
- Aucun champ compagnie
- Aucune valeur pre-remplie de vol
- Avertissement visuel : "Les donnees vol seront generees automatiquement par le backend"

**Payload emis** : `{ type, date?, escale? }` — strictement 3 champs max.

---

### 3.6 `src/views/CRV/CRVNouveau.vue` — Refonte

#### A. Separation stricte des PATHs

##### AVANT (payload mixte non conforme)

```javascript
// createCRVFromVol — AVANT
crvStore.createCRV({
  volId: vol.id || vol._id,        // toujours envoye
  type: vol.typeOperation?.toLowerCase(),  // toujours envoye
  mouvementId: vol.mouvementId,     // parfois undefined
  bulletinId: vol.bulletinId,       // parfois undefined
  programmeId: vol.programmeId      // parfois envoye — NON RECONNU par v2
})
```

**Problemes** :
- `volId` envoye meme en PATH 1 (bulletin) — le contrat ne l'attend pas
- `type` envoye en PATH 1 — le contrat le deduit du mouvement
- `programmeId` envoye — le contrat ne le reconnait pas
- Pas de separation : memes champs pour bulletin et programme

##### APRES (payloads separes conformes)

```javascript
// PATH 1 — Bulletin
if (vol.bulletinId && vol.mouvementId) {
  payload = {
    bulletinId: vol.bulletinId,
    mouvementId: vol.mouvementId
  }
  if (vol.escale) payload.escale = vol.escale
}

// PATH 3 — Vol existant
else {
  payload = {
    volId: vol.volId || vol.id || vol._id
  }
  if (vol.escale) payload.escale = vol.escale
}
```

**Corrections appliquees** :
- PATH 1 : uniquement `bulletinId` + `mouvementId` (+ `escale` optionnel)
- PATH 3 : uniquement `volId` (+ `escale` optionnel)
- `type` supprime (deduit par le backend)
- `programmeId` supprime (non reconnu)
- `loadProgrammeVols()` mappe desormais `volId: v._id` au lieu de `programmeId: programme._id`

#### B. Formulaire hors programme — avant / apres

##### AVANT (champs a plat, non conformes)

```javascript
crvStore.createCRV({
  type: horsProgForm.type.toLowerCase(),
  date: new Date(horsProgForm.dateVol).toISOString(),
  numeroVol: horsProgForm.numeroVol || undefined,
  compagnie: horsProgForm.compagnie || undefined,
  escale: horsProgForm.escale || undefined,
  horseProgramme: true,
  raisonHorsProgramme: horsProgForm.raison === 'AUTRE'
    ? horsProgForm.raisonAutre : horsProgForm.raison
})
```

**Problemes** :
- Champs a plat au lieu de `vol: { ... }`
- `compagnie` au lieu de `compagnieAerienne`
- `codeIATA` absent
- `typeVolHorsProgramme` absent
- `aeroportOrigine`/`aeroportDestination` absents
- `horseProgramme: true` parasite (le backend deduit via le path)
- `raisonHorsProgramme` = select a valeurs fixes au lieu de texte libre
- Validation `!horsProgForm.type || !horsProgForm.dateVol` insuffisante

##### APRES (objet `vol` encapsule, conforme)

```javascript
const volData = {
  numeroVol: horsProgForm.numeroVol,
  compagnieAerienne: horsProgForm.compagnieAerienne,
  codeIATA: horsProgForm.codeIATA,
  dateVol: new Date(horsProgForm.dateVol).toISOString(),
  typeOperation: horsProgForm.typeOperation,
  typeVolHorsProgramme: horsProgForm.typeVolHorsProgramme,
  raisonHorsProgramme: horsProgForm.raisonHorsProgramme
}
// Aeroports conditionnels
if (typeOperation === 'ARRIVEE' || typeOperation === 'TURN_AROUND') {
  volData.aeroportOrigine = horsProgForm.aeroportOrigine
}
if (typeOperation === 'DEPART' || typeOperation === 'TURN_AROUND') {
  volData.aeroportDestination = horsProgForm.aeroportDestination
}
const payload = { vol: volData }
if (horsProgForm.escale) payload.escale = horsProgForm.escale
```

**Corrections appliquees** :
- Encapsulation dans `vol: { ... }`
- Nommage exact : `compagnieAerienne`, `codeIATA`, `typeOperation`, `typeVolHorsProgramme`
- `raisonHorsProgramme` = textarea libre
- Aeroports conditionnels selon `typeOperation`
- `horseProgramme: true` supprime
- Validation complete avec `isHorsProgValid` computed

#### C. Champs du formulaire hors programme — avant / apres

| Champ UI | AVANT | APRES | Contrat v2 |
|----------|-------|-------|------------|
| Type operation | `horsProgForm.type` (select) | `horsProgForm.typeOperation` (boutons) | `vol.typeOperation` **obligatoire** |
| Numero vol | `horsProgForm.numeroVol` | `horsProgForm.numeroVol` | `vol.numeroVol` **obligatoire** |
| Compagnie | `horsProgForm.compagnie` (label "Code IATA") | `horsProgForm.compagnieAerienne` | `vol.compagnieAerienne` **obligatoire** |
| Code IATA | **ABSENT** | `horsProgForm.codeIATA` (input 2 car) | `vol.codeIATA` **obligatoire** |
| Date vol | `horsProgForm.dateVol` | `horsProgForm.dateVol` | `vol.dateVol` **obligatoire** |
| Aeroport origine | **ABSENT** | `horsProgForm.aeroportOrigine` (conditionnel) | `vol.aeroportOrigine` **conditionnel** |
| Aeroport destination | **ABSENT** | `horsProgForm.aeroportDestination` (conditionnel) | `vol.aeroportDestination` **conditionnel** |
| Type vol HP | **ABSENT** | `horsProgForm.typeVolHorsProgramme` (select 6 val.) | `vol.typeVolHorsProgramme` **obligatoire** |
| Raison HP | `horsProgForm.raison` (select 5 val.) + `raisonAutre` | `horsProgForm.raisonHorsProgramme` (textarea) | `vol.raisonHorsProgramme` **obligatoire** texte libre |
| Escale | `horsProgForm.escale` | `horsProgForm.escale` | `escale` optionnel, default TLS |
| `horseProgramme` | envoye `true` | **SUPPRIME** | non attendu |

#### D. Gestion doublon integree

```javascript
const handleCreateResult = (result, typeOperation) => {
  if (result && result.doublon) {
    // Ouvre ConfirmationDoublonModal
    doublonInfo.crvExistantId = result.crvExistantId
    doublonInfo.numeroCRV = result.numeroCRV
    doublonInfo.originalPayload = result.originalPayload
    showDoublonModal.value = true
    return
  }
  redirectToCRV(typeOperation, result)
}
```

**Flux complet** :
1. `createCRV(payload)` → backend repond 409
2. Store retourne `{ doublon: true, crvExistantId, numeroCRV, originalPayload }`
3. `handleCreateResult` detecte `.doublon` → ouvre `ConfirmationDoublonModal`
4. Utilisateur confirme (2 etapes) → `onDoublonConfirm()`
5. `crvStore.createCRVForceDoublon(originalPayload)` → envoie `forceDoublon: true, confirmationLevel: 2`
6. Backend cree le CRV doublon → redirect

---

## 4. Matrice de conformite contrat v2

### 4.1 Endpoints

| Endpoint contrat v2 | Methode | Implemente dans `api.js` | Utilise par |
|---------------------|---------|:---:|---|
| `POST /api/crv` | POST | `crvAPI.create(data)` (existait) | `crvStore.createCRV()` |
| `GET /api/crv/vols-sans-crv?date=` | GET | `crvAPI.volsSansCrv(date)` (**NOUVEAU**) | `crvStore.fetchVolsSansCrv()` |
| `GET /api/crv/:id` | GET | `crvAPI.getById(id)` (existait) | `crvStore.loadCRV()` |
| `GET /api/crv` | GET | `crvAPI.getAll(params)` (existait) | `crvStore.fetchCRVList()` |
| `PATCH /api/crv/:id` | PATCH | `crvAPI.update(id, data)` (existait) | `crvStore.updateCRV()` |
| `POST /api/crv/:id/demarrer` | POST | `crvAPI.demarrer(id)` (existait) | `crvStore.demarrerCRV()` |
| `POST /api/crv/:id/terminer` | POST | `crvAPI.terminer(id)` (existait) | `crvStore.terminerCRV()` |

### 4.2 Codes erreur

| Code contrat v2 | HTTP | Gere par le front ? | Comment |
|-----------------|:---:|:---:|---------|
| `CRV_DOUBLON` | 409 | **OUI** | `crvStore.createCRV()` catch + modale |
| `CRV_VERROUILLE` | 403 | OUI | `CRVLockedBanner.vue` (existait) |
| Token expire | 401 | OUI | Intercepteur Axios (existait) |
| QUALITE write | 403 | OUI | `excludeQualite` middleware (existait) |

### 4.3 Permissions creation CRV

| Role | Peut creer CRV (contrat) | Route `/crv/nouveau` accessible (front) |
|------|:---:|:---:|
| AGENT_ESCALE | oui | oui (`allowedRoles` dans `agentRoutes.js`) |
| CHEF_EQUIPE | oui | oui |
| SUPERVISEUR | oui | oui |
| MANAGER | oui | oui |
| QUALITE | **NON** | **NON** (exclu des `allowedRoles`) |
| ADMIN | oui | **NON** (exclu des `allowedRoles`) |

> Note : Le contrat v2 autorise ADMIN a creer des CRV. La route front l'exclut (comportement preexistant, non modifie). A evaluer si besoin.

---

## 5. Verification des payloads par PATH

### PATH 1 — Depuis Bulletin de Mouvement

| Champ | Contrat v2 | Envoye par le front | Conforme |
|-------|-----------|:---:|:---:|
| `bulletinId` | obligatoire | oui | OK |
| `mouvementId` | obligatoire | oui | OK |
| `escale` | optionnel | oui (si present) | OK |
| `responsableVolId` | optionnel | non envoye | OK |
| ~~`volId`~~ | non attendu | **plus envoye** | OK |
| ~~`type`~~ | non attendu | **plus envoye** | OK |
| ~~`programmeId`~~ | non attendu | **plus envoye** | OK |

### PATH 2 — Vol hors programme

| Champ | Contrat v2 | Envoye par le front | Conforme |
|-------|-----------|:---:|:---:|
| `vol.numeroVol` | obligatoire | oui | OK |
| `vol.compagnieAerienne` | obligatoire | oui | OK |
| `vol.codeIATA` | obligatoire | oui (maxlength=2) | OK |
| `vol.dateVol` | obligatoire | oui (ISO 8601) | OK |
| `vol.typeOperation` | obligatoire | oui (ARRIVEE/DEPART/TURN_AROUND) | OK |
| `vol.typeVolHorsProgramme` | obligatoire | oui (6 valeurs enum) | OK |
| `vol.raisonHorsProgramme` | obligatoire | oui (textarea libre) | OK |
| `vol.aeroportOrigine` | conditionnel (ARRIVEE/TA) | oui (conditionnel) | OK |
| `vol.aeroportDestination` | conditionnel (DEPART/TA) | oui (conditionnel) | OK |
| `vol.avion` | optionnel | non envoye | OK |
| `escale` | optionnel | oui (si present) | OK |
| `responsableVolId` | optionnel | non envoye | OK |
| ~~champs a plat~~ | non attendu | **plus envoye** | OK |
| ~~`horseProgramme: true`~~ | non attendu | **plus envoye** | OK |

### PATH 3 — Vol existant (backward compat)

| Champ | Contrat v2 | Envoye par le front | Conforme |
|-------|-----------|:---:|:---:|
| `volId` | obligatoire | oui | OK |
| `escale` | optionnel | oui (si present) | OK |
| `responsableVolId` | optionnel | non envoye | OK |
| ~~`type`~~ | non attendu | **plus envoye** | OK |
| ~~`programmeId`~~ | non attendu | **plus envoye** | OK |

### PATH LEGACY — Creation exceptionnelle

| Champ | Contrat v2 | Envoye par le front | Conforme |
|-------|-----------|:---:|:---:|
| `type` | optionnel (default `depart`) | oui | OK |
| `date` | optionnel (default aujourd'hui) | oui (si renseigne) | OK |
| `escale` | optionnel (default `TLS`) | oui (si renseigne) | OK |
| Valeurs vol (numero, compagnie...) | **jamais envoye** (100% backend) | **jamais envoye** | OK |

---

## 6. Gestion des doublons (409)

### Flux conforme au contrat v2

```
1. POST /api/crv → { bulletinId, mouvementId }
2. Backend detecte doublon → 409 { code: "CRV_DOUBLON", crvExistantId, numeroCRV }
3. crvStore.createCRV() catch 409 → return { doublon: true, originalPayload }
4. CRVNouveau.handleCreateResult() → ouvre ConfirmationDoublonModal
5. Utilisateur — Etape 1 : "Voulez-vous continuer ?" → clic Continuer
6. Utilisateur — Etape 2 : "Confirmez-vous ? Action tracee." → clic Confirmer
7. onDoublonConfirm() → crvStore.createCRVForceDoublon(originalPayload)
8. POST /api/crv → { ...originalPayload, forceDoublon: true, confirmationLevel: 2 }
9. Backend cree CRV doublon → 201 { crvDoublon: true }
10. Redirect vers page CRV
```

### Regles du contrat v2 respectees

| Regle | Respectee | Implementation |
|-------|:---------:|---------------|
| Pas de `forceDoublon` si pas de doublon detecte | OUI | Jamais envoye en premiere requete |
| `confirmationLevel` uniquement si `forceDoublon: true` | OUI | Les deux sont ajoutes ensemble dans `createCRVForceDoublon()` |
| `confirmationLevel = 2` (pas 1) | OUI | Hardcode a 2 |
| UX 2 etapes (avertissement + confirmation) | OUI | ConfirmationDoublonModal step 1 → step 2 |
| Affichage `numeroCRV` existant | OUI | Prop `numeroCRV` affichee dans la modale |

---

## 7. Alignement des enums

### Comparaison exhaustive front vs contrat v2

| Enum | Contrat v2 | Front apres | Ecart |
|------|-----------|-------------|:---:|
| `CRV.statut` | BROUILLON, EN_COURS, TERMINE, VALIDE, VERROUILLE, ANNULE | identique | 0 |
| `Vol.statut` | PROGRAMME, EN_COURS, TERMINE, ANNULE, RETARDE | identique | 0 |
| `Vol.typeOperation` | ARRIVEE, DEPART, TURN_AROUND | identique | 0 |
| `Vol.typeVolHP` | CHARTER, MEDICAL, TECHNIQUE, COMMERCIAL, CARGO, AUTRE | identique (**NOUVEAU**) | 0 |
| `Phase.categorie` | PISTE, PASSAGERS, FRET, BAGAGE, TECHNIQUE, AVITAILLEMENT, NETTOYAGE, SECURITE, BRIEFING | identique (**+BRIEFING**) | 0 |
| `Phase.macroPhase` | DEBUT, REALISATION, FIN | identique | 0 |
| `ChronoPhase.statut` | NON_COMMENCE, EN_COURS, TERMINE, NON_REALISE, ANNULE | identique | 0 |
| `ChronoPhase.motif` | NON_NECESSAIRE, EQUIPEMENT_INDISPONIBLE, PERSONNEL_ABSENT, CONDITIONS_METEO, AUTRE | identique | 0 |
| `Charge.typeCharge` | PASSAGERS, BAGAGES, FRET | identique | 0 |
| `Charge.sensOperation` | EMBARQUEMENT, DEBARQUEMENT | identique | 0 |
| `Charge.typeFret` | GENERAL, STANDARD, PERISSABLE, DANGEREUX, ANIMAUX, AUTRE | identique | 0 |
| `Evt.typeEvenement` | PANNE_EQUIPEMENT, ABSENCE_PERSONNEL, RETARD, INCIDENT_SECURITE, PROBLEME_TECHNIQUE, METEO, AUTRE (7) | 14 types detailles (RETARD_PASSAGERS, etc.) | **ECART** — voir note |
| `Evt.gravite` | MINEURE, MODEREE, MAJEURE, CRITIQUE | identique | 0 |
| `Evt.statut` | OUVERT, EN_COURS, RESOLU, CLOTURE | identique | 0 |
| `Obs.categorie` | GENERALE, TECHNIQUE, OPERATIONNELLE, SECURITE, QUALITE, SLA | identique | 0 |
| `Obs.visibilite` | INTERNE, COMPAGNIE, PUBLIQUE | identique | 0 |
| `Personnel.fonction` | CHEF_ESCALE, AGENT_TRAFIC, AGENT_PISTE, AGENT_PASSAGE, MANUTENTIONNAIRE, CHAUFFEUR, AGENT_SECURITE, TECHNICIEN, SUPERVISEUR, COORDINATEUR, AUTRE (11) | identique (**REALIGNE**) | 0 |
| `Materiel.typeEngin` | ...ELEVATEUR... (15) | identique (**RENOMME**) | 0 |
| `Engin.usage` | TRACTAGE, BAGAGES, FRET, ALIMENTATION_ELECTRIQUE, CLIMATISATION, PASSERELLE, CHARGEMENT | identique | 0 |
| `ERROR_CODES` | CRV_DOUBLON, CRV_VERROUILLE, ... | identique (**+CRV_DOUBLON**) | 0 |

> **Note TYPE_EVENEMENT** : Le front a 14 types detailles (RETARD_PASSAGERS, RETARD_BAGAGES, etc.) vs 7 types simples dans le contrat v2 (RETARD, PANNE_EQUIPEMENT, etc.). Cet ecart **preexistait** et n'a pas ete modifie. Il concerne les vues d'edition CRV (CRVEvenements.vue), pas la creation. A clarifier avec le backend — si le backend accepte les 14 types, aucun changement necessaire.

---

## 8. Preuve de non-regression

### 8.1 Build

```
$ npx vite build
✓ built in 10.21s
```

**Resultat** : Build reussi, 0 erreur, 0 warning.

### 8.2 Fichiers modifies — perimetre strict

```
$ git diff --name-only
src/config/crvEnums.js
src/services/api.js
src/stores/crvStore.js
src/views/CRV/CRVNouveau.vue

$ git status --short -u (nouveaux fichiers)
?? src/components/crv/ConfirmationDoublonModal.vue
?? src/components/crv/CreationLegacyModal.vue
```

**Aucun autre fichier modifie.**

### 8.3 Aucune reference residuelle aux anciens enums

```
$ grep -r "NACELLE_ELEVATRICE|CHEF_AVION|AGENT_BAGAGES|AGENT_FRET" src/
→ 0 resultats
```

### 8.4 Aucune reference residuelle aux anciens champs

```
$ grep -r "horseProgramme|programmeId" src/views/CRV/CRVNouveau.vue
→ 0 resultats
```

### 8.5 Ce qui n'a PAS change

| Fonctionnalite | Fichiers concernes | Impacte |
|----------------|-------------------|:---:|
| Login / Logout / Auth | `Login.vue`, `authStore.js`, `authService.js` | NON |
| Edition CRV (arrivee/depart/turnaround) | `CRVArrivee.vue`, `CRVDepart.vue`, `CRVTurnAround.vue` | NON |
| Phases CRV | `CRVPhases.vue`, `phasesStore.js` | NON |
| Charges CRV | `CRVCharges.vue`, `chargesStore.js` | NON |
| Evenements CRV | `CRVEvenements.vue` | NON |
| Observations CRV | (inline dans vues CRV) | NON |
| Validation / Verrouillage | `ValidationCRV.vue`, `CRVValidation.vue` | NON |
| Annulation CRV | (dans crvStore.js actions existantes) | NON |
| Liste CRV | `CRVList.vue` | NON |
| Archivage / PDF | (dans crvStore.js actions existantes) | NON |
| Gestion utilisateurs | `GestionUtilisateurs.vue`, `personnesStore.js` | NON |
| Bulletins de mouvement | `BulletinsList.vue`, `BulletinCreate.vue`, `BulletinDetail.vue` | NON |
| Programmes de vol | `ProgrammesVol.vue`, `programmesStore.js` | NON |
| Avions | `AvionsGestion.vue`, `avionsStore.js` | NON |
| Notifications | `notificationsStore.js` | NON |
| Dark mode | `themeStore.js` | NON |
| Routing / Guards | `router/index.js`, modules | NON |
| Permissions | `permissions.js`, `usePermissions.js`, `vCan.js` | NON |

---

## 9. Points d'attention

### 9.1 A verifier avec le backend

| Point | Detail | Risque |
|-------|--------|--------|
| TYPE_EVENEMENT (14 vs 7) | Le front envoie des types detailles (RETARD_PASSAGERS) alors que le contrat liste 7 types simples (RETARD). Si le backend rejette les types detailles, les vues d'edition CRV seront impactees. | Moyen — hors scope creation CRV |
| ADMIN et creation CRV | Le contrat v2 autorise ADMIN a creer des CRV. Le front exclut ADMIN de la route `/crv/nouveau`. Comportement preexistant non modifie. | Faible — choix delibere |
| `responsableVolId` | Le contrat l'accepte en optionnel sur les 3 PATHs. Le front ne l'envoie pas. Pas de champ UI pour le selectionner a la creation. | Nul — optionnel |

### 9.2 Etape 7 (vols-sans-crv) — prete mais non activee

L'endpoint `crvAPI.volsSansCrv(date)` et l'action `crvStore.fetchVolsSansCrv(date)` sont implementes et disponibles. Le mode "planifie" conserve les sources bulletin/programme actuelles pour les deux tabs. L'integration comme source unique peut etre activee ulterieurement en remplacant `loadBulletinMouvements()` par `fetchVolsSansCrv()`.

### 9.3 Propriete `numeroCRV` dans la modale doublon

La prop s'appelle `numeroCRV` dans le composant. Vue 3 la convertit automatiquement en kebab-case `numero-c-r-v` dans le template parent. C'est le comportement standard Vue — pas d'anomalie.
