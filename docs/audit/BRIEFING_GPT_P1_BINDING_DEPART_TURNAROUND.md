# Briefing GPT — P1_BINDING_DEPART_TURNAROUND

## Résumé exécutif
CRV Départ et TurnAround avaient 5 bugs DANGEREUX par rapport à Arrivée : pas de sauvegarde vol au step 1, et charges/événements invisibles (binding v-model sur composants sans modelValue).

## Ce qui a été fait
1. **Case 1 ajouté** : `saveCurrentStepData` sauvegarde maintenant les infos vol au step 1 (mapping champs agrégés → atomiques backend)
2. **CRVCharges** : `v-model` remplacé par `:charges="crvStore.charges"` + handler reload
3. **CRVEvenements** : `v-model` remplacé par `:evenements="crvStore.evenements"` + handler reload
4. **Bug corrigé en preuve** : `poste` → `posteStationnement` (save + pré-remplissage)

## Questions pour GPT
1. Le `route.split(' - ')` pour décomposer aéroports est fragile. Faut-il une mission dédiée pour harmoniser le format route Départ/TurnAround avec les champs atomiques Arrivée ?
2. Le pré-remplissage de certains champs reste incomplet malgré des données en store (bug pré-existant, double-mount ?). Priorité P2 ou P3 ?
3. Les handlers `handleChargeAdded` / `handleEvenementAdded` font un `crvStore.loadCRV()` complet. Est-ce acceptable ou faut-il un reload ciblé ?

## Fichiers modifiés
- `Front/src/views/CRV/CRVDepart.vue` (+38/-3)
- `Front/src/views/CRV/CRVTurnAround.vue` (+38/-3)

## Statut
FAIT ET BRANCHÉ — MERGEABLE
