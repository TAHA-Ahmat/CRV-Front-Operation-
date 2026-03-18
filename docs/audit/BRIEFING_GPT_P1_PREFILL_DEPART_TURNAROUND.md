# Briefing GPT — P1_PREFILL_DEPART_TURNAROUND

## Résumé exécutif
Départ et TurnAround affichaient 1/7 champs bulletin malgré des données complètes en base. Cause : noms de champs formData incompatibles avec CRVHeader. Corrigé. Arrivée : fix mineur posteStationnement.

## Ce qui a été fait
1. **formData.header réaligné** : `date→dateVol`, `typeAppareil→typeAvion`, `route→aeroportOrigine+aeroportDestination`, ajout `compagnieAerienne+codeIATA`
2. **Pré-remplissage** : mapping direct depuis vol (plus de `join(' - ')` ni `split(' - ')`)
3. **Save step 1** : envoi direct des 9 champs atomiques vers le backend
4. **Arrivée** : `vol.poste→vol.posteStationnement` + ajout posteStationnement au save

## Preuves
- DÉPART KP039 : 7/7 champs bulletin affichés (avant : 1/7)
- TURNAROUND AF908 : 7/7 champs bulletin affichés (avant : 1/7)
- ARRIVÉE KP032 : posteStationnement "A7" affiché (avant : toujours vide)

## Questions pour GPT
1. Les champs `immatriculation` et `posteStationnement` ne sont pas dans le bulletin — c'est attendu (info connue le jour de l'opération). Faut-il documenter ça dans l'aide en ligne ?
2. Le flux bulletin → CRV est maintenant couvert. Prochaine priorité ?

## Fichiers modifiés
- `Front/src/views/CRV/CRVDepart.vue` (+18/-12)
- `Front/src/views/CRV/CRVTurnAround.vue` (+19/-13)
- `Front/src/views/CRV/CRVArrivee.vue` (+5/-2)

## Statut
FAIT ET BRANCHÉ — MERGEABLE
