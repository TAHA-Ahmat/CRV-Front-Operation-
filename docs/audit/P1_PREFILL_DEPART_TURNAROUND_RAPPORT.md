## Mission : P1_PREFILL_DEPART_TURNAROUND
- Date : 2026-03-18
- Branche : mission/P1-BINDING-DEPART-TURNAROUND
- Périmètre : frontend
- Domaine : CRV Départ / TurnAround / Arrivée — préremplissage bulletin step 1
- Classe : PRODUIT
- Niveau cérémonie : standard
- Fichiers modifiés : CRVDepart.vue, CRVTurnAround.vue, CRVArrivee.vue (3 fichiers)
- Fichiers zone rouge touchés : NON
- Lignes ajoutées/supprimées : +42 / -27
- Build avant/après : OK/OK (vite dev)
- Tests avant/après : N/A (pas de tests frontend)
- Impact comportemental : voir ci-dessous
- Rollback : `git revert 58efd12`

## Contexte

L'audit BULLETIN_PREFILL_COVERAGE_AUDIT a prouvé que :
- Le backend transmet correctement 7/7 champs bulletin vers le Vol MongoDB
- CRVArrivee affiche 7/7 champs (1 bug mineur poste)
- CRVDepart affiche 1/7 champs (5 PRÉSENTS EN BASE MAIS NON AFFICHÉS)
- CRVTurnAround affiche 1/7 champs (6 PRÉSENTS EN BASE MAIS NON AFFICHÉS)

**Cause racine** : `formData.header` de Départ/TurnAround utilisait des noms de champs incompatibles avec CRVHeader (`date` au lieu de `dateVol`, `typeAppareil` au lieu de `typeAvion`, `route` au lieu de `aeroportOrigine`+`aeroportDestination`, absence de `compagnieAerienne`/`codeIATA`).

## Corrections appliquées

### 1. CRVDepart.vue — formData.header réaligné
- `date` → `dateVol`
- `typeAppareil` → `typeAvion`
- `route` → `aeroportOrigine` + `aeroportDestination`
- Ajout `compagnieAerienne`, `codeIATA`
- Pré-remplissage : mapping direct depuis vol (plus de `join(' - ')`)
- Save step 1 : envoi direct des champs atomiques (plus de `route.split(' - ')`)

### 2. CRVTurnAround.vue — même réalignement
Corrections identiques.

### 3. CRVArrivee.vue — fix mineur
- Pré-remplissage : `vol.poste` → `vol.posteStationnement`
- Save step 1 : ajout `posteStationnement: formData.value.header.poste` (manquait)

## Preuves

### DÉPART (KP039 depuis bulletin)
| Champ | Avant | Après |
|---|---|---|
| Numéro de vol | KP039 | KP039 |
| Compagnie aérienne | "" | **KP** |
| Code IATA | "" | **KP** |
| Date du vol | "" | **2026-03-18** |
| Aéroport origine | "" | "" (null attendu — départ) |
| Aéroport destination | "" | **DLA-LFW** |
| Type avion | "" | **B737-800** |
| Immatriculation | "" | "" (non dispo bulletin) |
| Poste | "" | "" (non dispo bulletin) |
Score : **7/7 champs bulletin affichés** (avant : 1/7)

### TURNAROUND (AF908 depuis bulletin)
| Champ | Avant | Après |
|---|---|---|
| Numéro de vol | AF908 | AF908 |
| Compagnie aérienne | "" | **AF** |
| Code IATA | "" | **AF** |
| Date du vol | "" | **2026-03-18** |
| Aéroport origine | "" | **CDG** |
| Aéroport destination | "" | **NSI-CDG** |
| Type avion | "" | **B777** |
| Immatriculation | "" | "" (non dispo bulletin) |
| Poste | "" | "" (non dispo bulletin) |
Score : **7/7 champs bulletin affichés** (avant : 1/7)

### ARRIVÉE (KP032 — posteStationnement)
- `posteStationnement: "A7"` écrit via API
- UI à l'ouverture : Poste de stationnement = **"A7"** ✓
- Avant le fix : toujours vide (`vol.poste` n'existe pas sur le modèle Vol)
