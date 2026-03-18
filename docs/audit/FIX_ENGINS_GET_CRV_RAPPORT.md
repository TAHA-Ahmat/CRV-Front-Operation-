## Mission : FIX_ENGINS_GET_CRV
- Date : 2026-03-18
- Branche backend : mission/FIX-ENGINS-GET-CRV
- Branche frontend : mission/P1-BINDING-DEPART-TURNAROUND
- Périmètre : backend + frontend
- Domaine : engins CRV — flux save/reload
- Classe : PRODUIT
- Niveau cérémonie : structurelle (zone rouge touchée)
- Fichiers modifiés :
  - Back: crv.controller.js (⚠️ ZONE ROUGE)
  - Front: crvStore.js, CRVArrivee.vue, CRVDepart.vue, CRVTurnAround.vue
- Fichiers zone rouge touchés : OUI — crv.controller.js (fix ciblé, 9 lignes)
- Lignes ajoutées/supprimées : Back +9/-2, Front +28/-6
- Build avant/après : OK/OK
- Tests avant/après : N/A
- Impact comportemental : les engins sont maintenant visibles au reload
- Rollback : `git revert 9a78581` (back), `git revert 90bda43` (front)

## Cause racine

Deux systèmes d'engins déconnectés :
- **POST /crv/:id/engins** crée des `AffectationEnginVol` sur le **Vol**
- **GET /crv/:id** retournait `crv.materielUtilise` (subdocument embarqué du CRV, jamais alimenté)

Résultat : fausse réussite — l'utilisateur ajoute un engin, le POST retourne success, mais au reload le GET retourne `engins: []`.

## Corrections

### Backend — crv.controller.js (zone rouge)
1. Import `AffectationEnginVol` ajouté
2. Dans `obtenirCRV` : remplacé `crv.materielUtilise || []` par `AffectationEnginVol.find({ vol: volId }).populate('engin').sort({ heureDebut: 1 })`

### Frontend — crvStore.js
3. `loadCRV` : ajouté `this.engins = result.engins || []` (manquait)

### Frontend — 3 vues CRV
4. Mapping AffectationEnginVol → format CRVEngins :
   - `engin.typeEngin` (UPPERCASE) → `type` (lowercase)
   - `engin.numeroEngin` → `immatriculation`
   - `heureDebut` (Date ISO) → format HH:mm
   - `usage`, `remarques` passés tels quels

## Preuve

CRV Départ KP039 — étape 3 Engins :
- Engin AVT-006 ajouté via POST → success ✓
- Reload page → engin #1 affiché :
  - Type : Autre ✓
  - Immatriculation : AVT-006 ✓
  - Statut d'usage : Tractage ✓
  - Heure de début : 06:03 AM ✓
- Screenshot capturé comme preuve
