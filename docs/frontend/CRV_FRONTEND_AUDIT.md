# CRV FRONTEND — AUDIT COMPLET

> **Date** : 2026-03-09
> **Branche** : `mission/frontend-alignment`
> **Objectif** : Inventaire exhaustif du frontend avant alignement avec le backend certifie
> **Reference backend** : `CRV_API_CONTRACT.md` (88/88 tests PASS)

---

## 1. ARCHITECTURE FRONTEND

### Stack
- **Framework** : Vue 3 (Composition API + Options API)
- **State** : Pinia (16 stores)
- **Style** : Tailwind CSS
- **HTTP** : Axios (instance centralisee dans `services/api.js`)
- **Router** : Vue Router 4

### Structure fichiers CRV
```
src/
  config/
    crvEnums.js          ← enums frontend (source de verite UI)
    roles.js             ← 6 roles utilisateur
    ui.js                ← couleurs/classes (inutilise)
  services/
    api.js               ← service API centralise (16 groupes, ~150 routes)
    apiWithMock.js        ← mock API (desactive)
    errorHandler.js       ← gestion erreurs metier
    auth/authService.js   ← facade auth
  stores/
    crvStore.js           ← store principal CRV (1516 lignes)
    phasesStore.js        ← store phases (237 lignes)
    chargesStore.js       ← store charges (441 lignes)
    authStore.js          ← store auth (224 lignes) [ZONE ROUGE]
    + 12 autres stores
  components/crv/
    CompletudeBarre.vue   ← barre completude
    ConfirmationDoublonModal.vue
    CreationLegacyModal.vue
    CRVCharges.vue        ← formulaire charges
    CRVEngins.vue         ← formulaire engins
    CRVEvenements.vue     ← formulaire evenements
    CRVHeader.vue         ← entete vol
    CRVLockedBanner.vue   ← banniere verrouillage
    CRVPersonnes.vue      ← formulaire personnel
    CRVPhases.vue         ← formulaire phases (1333 lignes)
    CRVValidation.vue     ← formulaire validation
  views/CRV/
    CRVHome.vue           ← selection type CRV
    CRVNouveau.vue        ← creation CRV multi-mode
    CRVList.vue           ← dashboard liste CRV
    CRVArrivee.vue        ← formulaire arrivee 7 etapes
    CRVDepart.vue         ← formulaire depart 7 etapes
    CRVTurnAround.vue     ← formulaire turn-around 7 etapes
  composables/
    useAuth.js            ← wrapper reactif authStore [ZONE ROUGE]
    usePermissions.js     ← permissions template
  utils/
    constants.js          ← DEPRECATED (valeurs obsoletes)
    permissions.js        ← matrice permissions [ZONE ROUGE]
  router/
    index.js              ← routes principales [ZONE ROUGE]
```

---

## 2. ECARTS ENUMS FRONTEND vs BACKEND

### 2.1 TYPE_EVENEMENT — ECART CRITIQUE

| Frontend (crvEnums.js) — 14 types | Backend (API Contract) — 8 types |
|-----------------------------------|----------------------------------|
| RETARD_PASSAGERS | ❌ NON RECONNU |
| RETARD_BAGAGES | ❌ NON RECONNU |
| RETARD_FRET | ❌ NON RECONNU |
| RETARD_CARBURANT | ❌ NON RECONNU |
| RETARD_EQUIPAGE | ❌ NON RECONNU |
| RETARD_TECHNIQUE | ❌ NON RECONNU |
| RETARD_METEO | ❌ NON RECONNU |
| RETARD_ATC | ❌ NON RECONNU |
| INCIDENT_SECURITE | ✅ INCIDENT_SECURITE |
| INCIDENT_SURETE | ❌ NON RECONNU |
| INCIDENT_TECHNIQUE | ✅ INCIDENT_TECHNIQUE |
| CHANGEMENT_PORTE | ❌ NON RECONNU |
| CHANGEMENT_STAND | ❌ NON RECONNU |
| AUTRE | ✅ AUTRE |
| — | PANNE_EQUIPEMENT (manquant frontend) |
| — | ABSENCE_PERSONNEL (manquant frontend) |
| — | RETARD (manquant frontend) |
| — | PROBLEME_TECHNIQUE (manquant frontend) |
| — | METEO (manquant frontend) |

**Impact** : Le frontend envoie des types que le backend rejette avec 400. Les tests API prouvent que seuls 8 types sont acceptes.

**Action requise** : Aligner crvEnums.js TYPE_EVENEMENT sur les 8 types backend.

### 2.2 TYPE_ENGIN — ECART IMPORTANT

Le frontend utilise `TYPE_ENGIN` du modele CRV (15 valeurs MAJUSCULES) mais le backend PUT /crv/:id/engins attend des **cles lowercase** (10 valeurs).

| Frontend TYPE_ENGIN (15) | Backend accepte (10 cles) | Mapping |
|--------------------------|---------------------------|---------|
| TRACTEUR_PUSHBACK | `tracteur` | → TRACTEUR |
| PASSERELLE | `passerelle` | → STAIRS |
| TAPIS_BAGAGES | ❌ PAS DE MAPPING | — |
| GPU | `gpu` | → GPU |
| ASU | `asu` | → ASU |
| ESCALIER | ❌ PAS DE MAPPING | — |
| TRANSBORDEUR | ❌ PAS DE MAPPING | — |
| CAMION_AVITAILLEMENT | `camion_avitaillement` | → AUTRE |
| CAMION_VIDANGE | ❌ PAS DE MAPPING | — |
| CAMION_EAU | ❌ PAS DE MAPPING | — |
| ELEVATEUR | ❌ PAS DE MAPPING | — |
| CHARIOT_BAGAGES | `chariot_bagages` | → CHARIOT_BAGAGES |
| CONTENEUR_ULD | ❌ PAS DE MAPPING | — |
| DOLLY | ❌ PAS DE MAPPING | — |
| AUTRE | `autre` | → AUTRE |

**Impact** : 7 types du frontend n'ont pas de mapping backend → rejet 400 INVALID_TYPE_ENGIN.

**Action requise** : Le frontend doit envoyer les cles lowercase du typeEnginMap backend.

### 2.3 ROLE_PERSONNEL — CONFORME

| Frontend (11 roles) | Backend (11 fonctions) | Status |
|---------------------|----------------------|--------|
| CHEF_ESCALE | CHEF_ESCALE | ✅ |
| AGENT_TRAFIC | AGENT_TRAFIC | ✅ |
| AGENT_PISTE | AGENT_PISTE | ✅ |
| AGENT_PASSAGE | AGENT_PASSAGE | ✅ |
| MANUTENTIONNAIRE | MANUTENTIONNAIRE | ✅ |
| CHAUFFEUR | CHAUFFEUR | ✅ |
| AGENT_SECURITE | AGENT_SECURITE | ✅ |
| TECHNICIEN | TECHNICIEN | ✅ |
| SUPERVISEUR | SUPERVISEUR | ✅ |
| COORDINATEUR | COORDINATEUR | ✅ |
| AUTRE | AUTRE | ✅ |

### 2.4 STATUT_CRV — CONFORME

| Frontend | Backend | Status |
|----------|---------|--------|
| BROUILLON | BROUILLON | ✅ |
| EN_COURS | EN_COURS | ✅ |
| TERMINE | TERMINE | ✅ |
| VALIDE | VALIDE | ✅ |
| VERROUILLE | VERROUILLE | ✅ |
| ANNULE | ANNULE | ✅ |

### 2.5 Autres enums — CONFORMES
- `GRAVITE_EVENEMENT` (4 valeurs) : ✅ conforme
- `TYPE_CHARGE` (3 valeurs) : ✅ conforme
- `SENS_OPERATION` (2 valeurs) : ✅ conforme
- `TYPE_FRET` (6 valeurs) : ✅ conforme
- `CATEGORIE_OBSERVATION` (6 valeurs) : ✅ conforme
- `TYPE_OPERATION` (3 valeurs) : ✅ conforme
- `STATUT_PHASE` (5 valeurs) : ✅ conforme
- `MOTIF_NON_REALISATION` (5 valeurs) : ✅ conforme

---

## 3. LOGIQUE METIER FRONTEND (A SUPPRIMER OU REVOIR)

### 3.1 crvStore.js — Logique residuelle
| Localisation | Logique | Doit venir du backend |
|-------------|---------|----------------------|
| `isEditable` getter | Calcule si CRV modifiable | OUI — backend renvoie 403 |
| `canStart` getter | Verifie transition BROUILLON→EN_COURS | OUI — `GET /crv/:id/transitions` |
| `canTerminate` getter | Verifie transition EN_COURS→TERMINE | OUI — transitions backend |
| `canValidate` getter | Verifie transition TERMINE→VALIDE | OUI — transitions backend |
| `_checkEditable()` | Throw si CRV non modifiable | TOLERE — protection UX avant appel |
| `SEUILS_COMPLETUDE` | 50% et 80% hardcodes | Backend les calcule |

**Verdict** : La plupart de ces getters sont des **helpers UX** qui lisent le statut backend. Ils ne calculent rien. `_checkEditable()` est une garde UX acceptable.

### 3.2 CompletudeBarre.vue — Poids hardcodes
- Phases: 40%, Charges: 30%, Evenements: 20%, Observations: 10%
- Ces poids sont des constantes d'affichage UI, pas de la logique metier
- La completude reelle vient du backend

**Verdict** : ACCEPTABLE (affichage seulement)

### 3.3 CRVPhases.vue — Ordre phases hardcode
- `phasesStore.getProchainePhase` utilise un ordre fixe
- Cet ordre devrait venir du backend (champ `ordre` de ChronologiePhase)

**Verdict** : A REVOIR — utiliser l'ordre retourne par le backend

### 3.4 CRVValidation.vue — Fonctions hardcodees
- Options fonction: `chef_escale`, `superviseur`, `responsable_ops`
- Devrait utiliser l'enum ROLE_PERSONNEL ou venir du backend

**Verdict** : A CORRIGER

### 3.5 bulletinStore.js — Enums locaux
- STATUT_BULLETIN, ORIGINE_MOUVEMENT, STATUT_MOUVEMENT definis localement
- Pas dans crvEnums.js

**Verdict** : ACCEPTABLE — domaine bulletin separe du CRV

---

## 4. CODE MORT ET LEGACY

### 4.1 utils/constants.js — DEPRECATED
```javascript
CRV_TYPES = { ARRIVEE, DEPART, TURNAROUND }  // OBSOLETE
CRV_STATUS = { IN_PROGRESS, CLOSED, VALIDATED }  // NE CORRESPOND PAS AU BACKEND
USER_ROLES = { AGENT: 'agent_ops' }  // OBSOLETE
```
**Importe par** : uniquement `mockApi.js` et `seed/crv.js`
**Action** : SUPPRIMER

### 4.2 data/seed/crv.js — Statuts fantomes
```javascript
STATUTS_CRV = { ..., EN_ATTENTE_VALIDATION, REJETE, DEVERROUILLE }
```
3 statuts qui n'existent PAS dans le backend.
**Action** : CORRIGER ou SUPPRIMER

### 4.3 services/apiWithMock.js — Mock desactive
- `VITE_USE_MOCK=false` dans .env
- Utilise les constantes obsoletes
**Action** : SUPPRIMER si plus necessaire

### 4.4 config/ui.js — Inutilise
- Non importe par aucun fichier
**Action** : SUPPRIMER

---

## 5. SERVICE API — ETAT ACTUEL

### 5.1 Centralisation
Le service `api.js` est **deja centralise** avec 16 groupes d'API.
Aucun composant n'appelle axios directement.

### 5.2 Groupes API CRV
| Groupe | Routes | Status |
|--------|--------|--------|
| `authAPI` | 5 | ✅ Conforme |
| `crvAPI` | 26 | ⚠️ Certaines routes a verifier |
| `phasesAPI` | 6 | ✅ Conforme |
| `validationAPI` | 4 | ✅ Conforme |
| `enginsAPI` | 13 | ✅ Conforme |
| `chargesAPI` | 16 | ✅ Conforme |
| `volsAPI` | 4 | ✅ Conforme |

### 5.3 Ecarts routes frontend vs backend
| Route frontend | Route backend | Ecart |
|---------------|---------------|-------|
| POST `/auth/connexion` | POST `/auth/login` | ⚠️ NOM DIFFERENT |
| POST `/auth/inscription` | POST `/auth/register` | ⚠️ NOM DIFFERENT |
| POST `/auth/deconnexion` | — | ⚠️ Pas de route backend |

**Note** : Les routes auth utilisent des noms francais cote frontend mais le backend utilise des noms anglais. Verifier si le backend a des aliases.

---

## 6. PERMISSIONS — ETAT ACTUEL

### 6.1 Architecture
```
permissions.js (matrice) → useAuth.js (composable) → composants
                        → usePermissions.js (composable) → templates
```

### 6.2 Conformite avec backend
| Permission | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| ADMIN pas d'acces CRV | ✅ Bloque dans router | ✅ Bloque par middleware | ✅ |
| QUALITE lecture seule | ✅ isReadOnly | ✅ 403 en ecriture | ✅ |
| Validation SUP+MGR | ✅ canValidateCRV | ✅ authorize middleware | ✅ |

---

## 7. FORMULAIRES CRV — ETAT ACTUEL

### 7.1 Structure 7 etapes
Les 3 vues (CRVArrivee, CRVDepart, CRVTurnAround) utilisent la meme structure :
1. Informations vol (CRVHeader)
2. Personnel (CRVPersonnes)
3. Engins (CRVEngins)
4. Phases (CRVPhases)
5. Charges (CRVCharges)
6. Evenements (CRVEvenements)
7. Validation (CRVValidation)

### 7.2 Problemes identifies
| Composant | Probleme | Severite |
|-----------|----------|----------|
| CRVEngins | Envoie TYPE_ENGIN (MAJUSCULE) au lieu de cles lowercase | CRITIQUE |
| CRVEvenements | Envoie TYPE_EVENEMENT frontend (14 types) au backend (8 types) | CRITIQUE |
| CRVEvenements | Map `heureEvenement` → `dateHeureDebut` (ok mais fragile) | MINEURE |
| CRVValidation | Fonctions hardcodees (pas d'enum) | MOYENNE |
| CRVPhases | Ordre phases hardcode au lieu de lire backend | MOYENNE |

---

## 8. RESUME DES ECARTS

### CRITIQUES (bloquent le fonctionnement)
1. **TYPE_EVENEMENT** : 14 types frontend vs 8 types backend → rejet 400
2. **TYPE_ENGIN mapping** : Frontend envoie MAJUSCULE, backend attend lowercase

### IMPORTANTS (degradent l'experience)
3. **CRVValidation** : fonctions hardcodees
4. **Phase order** : hardcode dans phasesStore
5. **constants.js** : fichier obsolete encore present
6. **seed/crv.js** : 3 statuts fantomes

### MINEURS (nettoyage)
7. **config/ui.js** : inutilise
8. **apiWithMock.js** : desactive mais encore present
9. **Console.log** excessifs dans crvStore, enums, components

### DEJA CONFORMES
- STATUT_CRV (6 valeurs) ✅
- ROLE_PERSONNEL (11 valeurs) ✅
- GRAVITE_EVENEMENT (4 valeurs) ✅
- TYPE_CHARGE / SENS_OPERATION / TYPE_FRET ✅
- CATEGORIE_OBSERVATION ✅
- Service API centralise ✅
- Completude backend = source de verite ✅
- Permissions matrice ✅
- Architecture auth ✅
