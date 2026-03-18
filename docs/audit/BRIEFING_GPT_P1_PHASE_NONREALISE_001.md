# BRIEFING GPT — P1_PHASE_NONREALISE_001

## Ce que l'utilisateur subissait

Un agent d'escale remplissant un CRV ne pouvait pas marquer une phase comme "Non réalisée" avec un motif standard (METEO, EQUIPEMENT, PERSONNEL). Rien ne se passait : pas d'erreur visible, pas de sauvegarde, phase inchangée. Seul le motif AUTRE fonctionnait (car il forçait la saisie d'un détail).

Le parcours CRV était effectivement bloqué à l'étape 4 pour tout agent qui ne trouvait pas le contournement.

## Ce qui a été corrigé

Le store Pinia (`crvStore.marquerPhaseNonRealisee`) exigeait `detailMotif` pour tous les motifs. Le backend (`businessRules.middleware.js` L124-146) ne l'exige que pour `AUTRE`. Le frontend a été aligné sur la règle backend :

```javascript
// Avant : bloquait tous les motifs
if (!data.detailMotif || data.detailMotif.trim() === '') {

// Après : bloque uniquement AUTRE sans détail
if (data.motifNonRealisation === 'AUTRE' && (!data.detailMotif || data.detailMotif.trim() === '')) {
```

1 fichier, +5/-5 lignes. Build OK.

## Ce qu'il faut challenger

### 1. Origine du bug
La validation `detailMotif OBLIGATOIRE` dans le store a été introduite comme "CORRECTION CONFORMITÉ" référençant `DOCUMENTATION_FRONTEND_CRV.md`. Ce document était-il en décalage avec le backend, ou le store a-t-il été sur-validé sans vérifier la règle réelle ?

### 2. Erreurs silencieuses
Le composant `CRVPhases.vue` attrape les erreurs du store avec un `catch` qui log en console sans rien montrer à l'utilisateur. Ce pattern existe-t-il ailleurs dans les composants CRV ? Combien d'erreurs métier sont aujourd'hui avalées silencieusement ?

### 3. Autres validations store vs backend
Si le store avait une validation plus stricte que le backend sur les phases, y a-t-il d'autres fonctions du store (`ajouterPersonnel`, `mettreAJourCharges`, etc.) qui sur-valident et bloquent silencieusement des actions légitimes ?

### 4. Tests de non-régression
Il n'existe pas de tests unitaires frontend pour les stores Pinia. Ce bug aurait été détecté par un test `marquerPhaseNonRealisee({ motifNonRealisation: 'METEO' })`. Faut-il prioriser des tests store sur les flux critiques ?

## Ce qui reste ouvert

- Le pattern catch silencieux dans CRVPhases.vue (et potentiellement d'autres composants)
- L'audit des autres validations store vs backend pour détecter des sur-validations similaires
- L'absence de tests unitaires frontend sur les stores

## Verdict honnête

Bug bloquant corrigé. Désalignement frontend/backend prouvé par comparaison directe du code. Le fix est minimal et ciblé. Le risque résiduel est dans les erreurs silencieuses (pattern catch sans feedback) qui pourraient masquer d'autres problèmes similaires.
