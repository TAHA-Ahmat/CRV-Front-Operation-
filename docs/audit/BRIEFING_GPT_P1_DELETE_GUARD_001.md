# BRIEFING GPT — P1_DELETE_GUARD_001

## Contexte
Sur la page "Mes CRV", le bouton "Supprimer" apparaissait sur les CRV au statut Terminé et Validé, alors que la règle métier interdit la suppression à partir de TERMINÉ.

## Ce qui a été fait
Correction de la fonction `canSupprimerCRV()` dans CRVList.vue pour bloquer le bouton Supprimer sur les statuts TERMINÉ, VALIDÉ et VERROUILLÉ. Seuls BROUILLON, EN_COURS et ANNULÉ autorisent la suppression.

## Résultat pour l'utilisateur
Le bouton "Supprimer" n'apparaît plus sur les CRV terminés, validés ou verrouillés. L'utilisateur ne voit que les actions pertinentes pour l'état de son CRV.

## Questions pour GPT

### 1. Backend protège-t-il aussi ?
Cette correction est côté interface. Le backend (route DELETE /api/crv/:id) bloque-t-il aussi la suppression pour les CRV ≥ TERMINÉ ? Si non, un appel API direct pourrait supprimer un CRV terminé. Faut-il auditer la route backend ?

### 2. CRV ANNULÉ
Un CRV annulé peut être supprimé (le bouton reste visible). Est-ce cohérent ? Un CRV annulé est un CRV qui a été actif puis retiré — sa suppression efface toute trace. Faut-il plutôt garder les CRV annulés comme historique et interdire aussi leur suppression ?

### 3. Prochaine priorité
Le backlog P0 contient toujours le VersionError 500 sur sauvegarde après création CRV. C'est zone rouge (crv.controller.js). Tous les P1 frontend sont maintenant corrigés. La prochaine mission devrait-elle être ce P0 (avec cérémonie structurelle), ou rester sur les P2 frontend ?

## Fichier modifié
- `Front/src/views/CRV/CRVList.vue` (+3/-2)
