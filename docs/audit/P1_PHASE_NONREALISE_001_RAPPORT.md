# RAPPORT — P1_PHASE_NONREALISE_001

## Mission : P1_PHASE_NONREALISE_001
- Date : 2026-03-18
- Branche : mission/P1-PHASE-NONREALISE-001
- Périmètre : frontend
- Domaine : phases CRV
- Classe : PRODUIT
- Niveau cérémonie : standard
- Fichiers modifiés : 1
- Fichiers zone rouge touchés : NON
- Lignes ajoutées/supprimées : +5 / -5
- Build avant/après : OK / OK
- Tests avant/après : N/A (pas de tests unitaires frontend phases)
- Impact comportemental : les phases Non réalisée fonctionnent désormais pour tous les motifs
- Rollback : git revert 321d7af

---

## Contexte utilisateur

Un agent d'escale remplit un CRV étape par étape. À l'étape 4 (Phases), certaines phases n'ont pas été réalisées pendant l'escale (ex : pas de dégivrage en été). L'agent sélectionne "Non réalisée", choisit un motif (METEO, EQUIPEMENT, PERSONNEL, AUTRE), et valide.

## Problème observé

Lorsque l'agent marquait une phase comme "Non réalisée" avec un motif standard (METEO, EQUIPEMENT, PERSONNEL), rien ne se passait. Aucun feedback visuel, aucune erreur affichée, aucune requête réseau envoyée. La phase restait inchangée.

Le bug était silencieux : le store Pinia (`crvStore.marquerPhaseNonRealisee`) exigeait `detailMotif` pour TOUS les motifs, alors que le backend (`businessRules.middleware.js` L124-146) ne l'exige que pour le motif `AUTRE`. Le composant `CRVPhases.vue` attrapait l'erreur du store et la loggait en console sans la montrer à l'utilisateur.

**Résultat** : 100% des phases "Non réalisée" avec motif standard étaient bloquées. Seul le motif AUTRE (qui force la saisie d'un détail) pouvait fonctionner.

## Correction appliquée

**Fichier** : `Front/src/stores/crvStore.js`

Validation modifiée dans `marquerPhaseNonRealisee()` :

**Avant** (bloquait tous les motifs sans detailMotif) :
```javascript
if (!data.detailMotif || data.detailMotif.trim() === '') {
  this.error = 'Le détail du motif est obligatoire'
```

**Après** (aligné sur businessRules.middleware.js) :
```javascript
if (data.motifNonRealisation === 'AUTRE' && (!data.detailMotif || data.detailMotif.trim() === '')) {
  this.error = 'Le détail du motif est obligatoire pour le motif AUTRE'
```

Commentaire de la fonction mis à jour :
- Avant : "motifNonRealisation ET detailMotif OBLIGATOIRES"
- Après : "motifNonRealisation OBLIGATOIRE, detailMotif OBLIGATOIRE si motif = AUTRE"

## Preuve / validation

- Parcours E2E complet en navigateur : création CRV → étapes 1 à 7 → validation finale "CRV Validé"
- Phases marquées "Non réalisée" avec motif METEO : requête envoyée, phase enregistrée
- Zéro erreur console tout au long du parcours
- Build frontend OK après modification

## Impact utilisateur

- **Avant** : un agent ne pouvait pas marquer de phases Non réalisée (sauf motif AUTRE). Le parcours CRV était bloqué à l'étape 4 sans message d'erreur.
- **Après** : tous les motifs fonctionnent. Le parcours bout-en-bout est débloqué.

## Hors scope

- Le composant `CRVPhases.vue` attrape silencieusement les erreurs du store (catch → console.log). Ce comportement UX (absence de feedback d'erreur) n'a pas été modifié. C'est un sujet UX séparé.
- Aucun test unitaire frontend n'a été ajouté (pas de framework de test frontend en place pour les stores).

## Verdict honnête

FAIT ET BRANCHÉ. Bug bloquant corrigé. Alignement frontend/backend prouvé par référence directe au code backend (businessRules.middleware.js L124-146). Parcours bout-en-bout vérifié en navigateur.
