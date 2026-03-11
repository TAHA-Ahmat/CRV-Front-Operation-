# RAPPORT ALIGNEMENT FRONTEND — MISSION 031

**Date** : 2026-03-10
**Branche** : `mission/frontend-alignment`
**Perimetre** : Frontend uniquement
**Niveau ceremonie** : Standard (pas de zone rouge touchee)

---

## RESUME EXECUTIF

- **7 corrections appliquees** dans 8 fichiers
- **0 fichier zone rouge** touche (authStore, permissions, router, useAuth)
- **Build Vite OK** (4.62s, 0 erreur, 0 warning)
- **13 fichiers modifies** au total sur la branche (dont 5 pre-existants)
- **Principe respecte** : le frontend s'adapte au backend, jamais l'inverse

---

## CORRECTIONS APPLIQUEES

### 1. phasesStore.js — Enum TERMINEE → TERMINE (BUG CRITIQUE)

| Avant | Apres |
|-------|-------|
| `p.statut === 'TERMINEE'` | `p.statut === 'TERMINE'` |

- **Impact** : `getPhasesTerminees`, `getProgression`, `terminerPhase` action
- **3 occurrences** corrigees (lignes 31, 39, 144)
- **Consequence avant fix** : le getter ne matchait AUCUNE phase terminee, la progression restait a 0%

### 2. CRVPersonnes.vue — role → fonction (ALIGNEMENT API)

| Avant | Apres |
|-------|-------|
| `v-model="personne.role"` | `v-model="personne.fonction"` |
| `personne.role === 'AUTRE'` | `personne.fonction === 'AUTRE'` |
| `roleDescriptions[personne.role]` | `roleDescriptions[personne.fonction]` |
| `addPersonne: { role: '' }` | `addPersonne: { fonction: '' }` |

- **Backend attend** : champ `fonction` dans le schema personnel
- **Le middleware** `mapRoleToFonction` du backend acceptait `role` comme fallback, mais le frontend doit envoyer le bon nom de champ

### 3. api.js — baseURL fallback 5000 → 4000

| Avant | Apres |
|-------|-------|
| `'http://localhost:5000/api'` | `'http://localhost:4000/api'` |

- **2 occurrences** (ligne 15 et ligne ~1602)
- Le `.env` avait deja le bon port 4000, mais le fallback par defaut etait faux
- **Impact** : si `.env` absent, le frontend pointait vers un serveur inexistant

### 4. api.js — Ajout methode `rejeter` dans validationAPI

```javascript
// NOUVEAU — POST /api/validation/:id/rejeter
rejeter: (id, raison) => api.post(`/validation/${id}/rejeter`, { raison })
```

- **Route backend existante** : `POST /api/validation/:id/rejeter`
- **Controller** : `rejeterCRVController` (TERMINE → EN_COURS)
- **Manquait dans** : le service API frontend

### 5. apiWithMock.js — Ajout verrouiller + rejeter

- **verrouiller** manquait completement du mock
- **rejeter** manquait completement du mock
- Les deux methodes ont ete ajoutees pour parite avec `api.js`

### 6. ValidationCRV.vue — handleReject utilise maintenant rejeter

| Avant | Apres |
|-------|-------|
| `validationAPI.deverrouiller(crvId, comment)` | `validationAPI.rejeter(crvId, comment)` |

- **Semantique** : `deverrouiller` = VERROUILLE → EN_COURS (operation admin)
- **Semantique** : `rejeter` = TERMINE → EN_COURS (rejet validation)
- **Avant** : le rejet appelait le mauvais endpoint, qui echouait car le CRV n'etait pas VERROUILLE

### 7. NON_REALISEE cleanup — 4 occurrences dans 3 fichiers

| Fichier | Avant | Apres |
|---------|-------|-------|
| CRVArrivee.vue (×2) | `\|\| statut === 'NON_REALISEE'` | supprime |
| CRVDepart.vue | `\|\| statut === 'NON_REALISEE'` | supprime |
| CRVTurnAround.vue | `\|\| statut === 'NON_REALISEE'` | supprime |

- **Backend** : utilise exclusivement `NON_REALISE` (sans E final)
- **Les variantes** `NON_REALISEE` ne correspondaient a rien cote backend
- **Le frontend** les avait en fallback defensif — desormais aligne strict

---

## FICHIERS MODIFIES (cette mission)

| # | Fichier | Lignes | Justification |
|---|---------|--------|---------------|
| 1 | `src/stores/phasesStore.js` | 3 | TERMINEE → TERMINE (3 occurrences) |
| 2 | `src/components/crv/CRVPersonnes.vue` | ~8 | role → fonction (4 occurrences) |
| 3 | `src/services/api.js` | ~15 | baseURL 4000 + methode rejeter |
| 4 | `src/services/apiWithMock.js` | +6 | verrouiller + rejeter mock |
| 5 | `src/views/Manager/ValidationCRV.vue` | 2 | deverrouiller → rejeter |
| 6 | `src/views/CRV/CRVArrivee.vue` | -2 | NON_REALISEE supprime |
| 7 | `src/views/CRV/CRVDepart.vue` | -1 | NON_REALISEE supprime |
| 8 | `src/views/CRV/CRVTurnAround.vue` | -1 | NON_REALISEE supprime |

---

## CONTRAT API ALIGNE

### Enums backend → frontend (CONFIRME)

| Enum | Valeurs | Source frontend |
|------|---------|----------------|
| STATUT_CRV | BROUILLON, EN_COURS, TERMINE, VALIDE, VERROUILLE, ANNULE | crvEnums.js ✅ |
| STATUT_PHASE | NON_COMMENCE, EN_COURS, TERMINE, NON_REALISE | crvEnums.js ✅, phasesStore ✅ (fixe) |
| TYPE_OPERATION | ARRIVEE, DEPART, TURN_AROUND | crvEnums.js ✅ |
| ROLE_PERSONNEL | CHEF_ESCALE, AGENT_TRAFIC, AGENT_PISTE, etc. (11) | crvEnums.js ✅ |
| TYPE_EVENEMENT | INCIDENT_TECHNIQUE, INCIDENT_SECURITE, etc. | crvEnums.js ✅ |

### Routes validation (5 routes)

| Route | Methode | Frontend | Mock |
|-------|---------|----------|------|
| `/validation/:id/valider` | POST | ✅ valider() | ✅ |
| `/validation/:id/verrouiller` | POST | ✅ verrouiller() | ✅ (ajoute) |
| `/validation/:id/rejeter` | POST | ✅ rejeter() (ajoute) | ✅ (ajoute) |
| `/validation/:id/deverrouiller` | POST | ✅ deverrouiller() | ✅ |
| `/validation/:id` | GET | ✅ getStatus() | ✅ |

### Champs personnel

| Champ | Backend | Frontend (avant) | Frontend (apres) |
|-------|---------|------------------|------------------|
| Nom champ role | `fonction` | `role` | `fonction` ✅ |
| Fallback backend | middleware `mapRoleToFonction` | - | plus necessaire |

---

## VERIFICATION BUILD

```
✓ built in 4.62s
Erreurs compilation : 0
Warnings : 0
```

## VERIFICATION NAVIGATEUR

- ✅ Login superviseur@crv.test
- ✅ Page /crv/nouveau — mode Bulletin + Programme fonctionnels
- ✅ Page /crv/liste — affichage types (Arrivee, Turn Around), statuts, completude
- ✅ API backend confirme: typeOperation, compagnieAerienne, phases.statut corrects
- ✅ Console : 0 erreur liee aux corrections (seules erreurs pre-existantes: chargement escales)
- ✅ Endpoint rejeter backend confirme fonctionnel (400 correct quand statut != TERMINE)

## ZONE ROUGE

```
git diff --name-only | grep -E "(authStore|permissions|router/index|useAuth)"
→ Aucun match. Zone rouge intacte. ✅
```

---

## BUGS FRONTEND RESTANTS (hors perimetre)

| Bug | Description | Priorite |
|-----|-------------|----------|
| Escales loading | Erreur chargement escales dans CRVNouveau (probablement endpoint manquant) | P2 |
| CRV detail navigation | Click sur ligne CRV liste ne navigue pas vers detail | P2 |
| Manager validation access | Route /manager/validation non accessible au superviseur (normal si permissions) | Info |

---

## ROLLBACK

```bash
# Rollback complet
git checkout mission/backend-certification -- Front/

# Rollback par fichier
git checkout HEAD~1 -- src/stores/phasesStore.js
git checkout HEAD~1 -- src/components/crv/CRVPersonnes.vue
git checkout HEAD~1 -- src/services/api.js
git checkout HEAD~1 -- src/services/apiWithMock.js
git checkout HEAD~1 -- src/views/Manager/ValidationCRV.vue
```
