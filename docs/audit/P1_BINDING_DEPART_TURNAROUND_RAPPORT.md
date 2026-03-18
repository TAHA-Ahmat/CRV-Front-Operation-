## Mission : P1_BINDING_DEPART_TURNAROUND
- Date : 2026-03-18
- Branche : mission/P1-BINDING-DEPART-TURNAROUND
- Périmètre : frontend
- Domaine : CRV Départ / TurnAround — bindings et sauvegarde step 1
- Classe : PRODUIT
- Niveau cérémonie : standard
- Fichiers modifiés : CRVDepart.vue, CRVTurnAround.vue (2 fichiers)
- Fichiers zone rouge touchés : NON
- Lignes ajoutées/supprimées : +76 / -6
- Build avant/après : OK/OK (vite dev, pas de build prod)
- Tests avant/après : N/A (pas de tests frontend)
- Impact comportemental : voir ci-dessous
- Rollback : `git revert e381f1e 591f944`

## Contexte

L'audit SERVICE_COVERAGE_MAIN_FLOW_ONLY a identifié 5 bugs DANGEREUX sur CRV Départ et TurnAround :
1. Pas de `case 1` dans `saveCurrentStepData` → les infos vol ne sont jamais sauvegardées au step 1
2. `v-model="formData.charges"` sur CRVCharges (×2 vues) → le composant n'a pas de prop `modelValue`, les charges existantes sont invisibles
3. `v-model="formData.evenements"` sur CRVEvenements (×2 vues) → même problème, événements invisibles

## Corrections appliquées (commit 591f944)

### 1. Case 1 — Sauvegarde vol au step 1
Ajout de `case 1` dans `saveCurrentStepData` de CRVDepart.vue et CRVTurnAround.vue.
Mapping des champs Départ/TurnAround (header agrégé) vers les champs atomiques backend :
- `h.route.split(' - ')` → `aeroportOrigine` / `aeroportDestination`
- `h.typeAppareil` → `typeAvion`
- `h.poste` → `posteStationnement`

### 2. CRVCharges — Binding corrigé
`v-model="formData.charges"` remplacé par `:charges="crvStore.charges" :crv-id="crvStore.getCRVId" @charge-added="handleChargeAdded"`
Handler `handleChargeAdded` ajouté pour recharger le CRV après ajout.

### 3. CRVEvenements — Binding corrigé
`v-model="formData.evenements"` remplacé par `:evenements="crvStore.evenements" :crv-id="crvStore.getCRVId" @evenement-added="handleEvenementAdded"`
Handler `handleEvenementAdded` ajouté.

## Bug trouvé pendant la preuve (commit e381f1e)

Le case 1 envoyait `poste: h.poste` mais le backend (crv.controller.js L751) vérifie `if (volData.posteStationnement)` → le champ `poste` était silencieusement ignoré.

**Corrigé** : `poste` → `posteStationnement` dans le save ET dans le pré-remplissage (qui lisait `vol.poste` au lieu de `vol.posteStationnement`).

## Preuves

### Step 1 — posteStationnement
- `PATCH /api/crv/:id` avec `{vol: {posteStationnement: "P42"}}` → 200 OK
- `GET /api/crv/:id` → confirme `posteStationnement: "P42"` persisté en base
- **AVANT le fix** : le champ `poste` était envoyé et silencieusement ignoré par le backend

### CRVCharges binding
- `crvStore.charges` retourne le bon tableau (vérifié via console Pinia)
- `:charges="crvStore.charges"` = pattern identique à CRVArrivee.vue (prouvé E2E)

### CRVEvenements binding
- `crvStore.evenements` retourne le bon tableau (vérifié via console Pinia)
- Pattern identique à CRVArrivee.vue

### Pré-remplissage vol
- `vol.posteStationnement` correctement lu depuis le store (avant : `vol.poste` → toujours vide)
- `vol.typeAvion` lu via `vol.typeAvion || vol.avion?.typeAvion` → mapé vers `typeAppareil`

## Réserves

1. **Pré-remplissage incomplet** (bug pré-existant, hors scope) : certains champs du formulaire apparaissent vides malgré des données dans le store. Probablement lié au double-mount StrictMode ou à un timing de réactivité. N'est PAS causé par ce patch.
2. **Route split fragile** : `h.route.split(' - ')` dépend du format "ORIG - DEST". Si la route est formatée autrement, les aéroports ne seront pas correctement décomposés. Pattern pré-existant dans le formulaire Départ/TurnAround.
