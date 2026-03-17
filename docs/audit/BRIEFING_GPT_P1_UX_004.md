# BRIEFING ARBITRAGE — P1_UX_004

## Résumé court
Audit complet de la navigation wizard CRV (7 étapes × 3 vues). Un bug bloquant identifié : `isValidated` jamais initialisé depuis l'état du CRV → sur un CRV déjà validé/verrouillé, l'étape 7 n'affiche pas le bouton "Terminer", l'utilisateur est bloqué. Fix : 3 lignes ajoutées dans `onMounted` de chaque vue.

## Ce qui a réellement été audité
- `nextStep()` / `prevStep()` : limites, validation, sauvegarde
- `saveCurrentStepData()` : switch/case complet, gestion d'erreurs
- Step 4 (Phases) : guard bloquant si phases non traitées — correct
- Step 7 (Validation) : condition `isValidated` pour Retour/Terminer — **BUG**
- CRV lock : masquage boutons "Continuer" — correct
- URL sync : absent (step position perdue au refresh) — LOW, hors scope
- Progress dots : non cliquables — by design

## Bug retenu
`isValidated` initialisé à `false`, jamais mis à jour depuis le statut du CRV chargé. Seul `handleValidation()` (clic Valider) le passe à `true`. Résultat : ouvrir un CRV VALIDE/VERROUILLE → step 7 montre uniquement "Retour".

## Ce qui peut être trompeur
1. **CRVDepart avait un workaround partiel** — `v-if="!isValidated && crvStatus !== 'VALIDE'"` gérait VALIDE mais PAS VERROUILLE. Le fix unifie le comportement via l'init dans onMounted.
2. **Le lien "← Retour" en header permet de quitter** — mais ce n'est pas intuitif depuis l'étape 7 du wizard. L'utilisateur s'attend à un bouton "Terminer".
3. **5 autres anomalies de navigation détectées** — toutes LOW ou MEDIUM, aucune bloquante. Documentées dans le rapport.

## Points à challenger
1. Faut-il aussi gérer le statut ANNULE ? Actuellement non — un CRV annulé ne devrait pas être rouvert dans le wizard.
2. Le workaround template de CRVDepart (`&& crvStatus !== 'VALIDE'`) est maintenant redondant avec le fix. Faut-il le nettoyer ? Le fix est suffisant, le nettoyage est optionnel (mission mécanique).
3. `saveCurrentStepData()` qui ne bloque pas la navigation en cas d'erreur — faut-il en faire une mission séparée ?

## Proposition de verdict
**MERGEABLE** — Fix minimal, 3 fichiers, 15 lignes ajoutées, zéro régression, zéro zone rouge.
