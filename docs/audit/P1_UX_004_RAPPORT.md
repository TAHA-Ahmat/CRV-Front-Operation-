# P1_UX_004 — RAPPORT MISSION

## Objectif
Auditer la navigation du wizard CRV pour identifier des comportements bloquants ou incohérents, et corriger le bug prioritaire.

## Diagnostic initial — Audit complet de la navigation

| Aspect | CRVDepart | CRVTurnAround | CRVArrivee | Bug ? |
|---|---|---|---|---|
| nextStep() boundary (< 7) | OK | OK | OK | Non |
| prevStep() boundary (> 1) | OK | OK | OK | Non |
| Step 4 validation (phases) | Bloque si non traitées | Idem | Idem | Non |
| CRV lock → hide "Continuer" | OK | OK | OK | Non |
| saveCurrentStepData case 1 | Absent (P1_UX_002) | Absent (P1_UX_002) | OK | Déjà couvert |
| saveCurrentStepData case 2-3 | OK | OK | OK | Non |
| Steps 4-6 (composants auto-save) | OK | OK | OK | Non |
| **Step 7 isValidated init** | **Partiel** | **ABSENT** | **ABSENT** | **OUI** |
| URL sync (step position) | Absent | Absent | Absent | P2 (UX, pas bloquant) |
| prevStep() ne save pas | OK (formData local) | OK | OK | Non (pas de perte) |

## Bug prioritaire retenu

**`isValidated` jamais initialisé depuis l'état du CRV → Step 7 "Terminer" absent sur CRV déjà validés**

### Scénario de reproduction
1. Un CRV est en statut VALIDE ou VERROUILLE (déjà validé dans une session précédente)
2. L'utilisateur ouvre ce CRV → le wizard charge, `isValidated = ref(false)`
3. L'utilisateur navigue jusqu'à l'étape 7 (Validation)
4. **Attendu** : Bouton "Terminer" visible pour quitter le wizard
5. **Réel** : Seul le bouton "Retour" apparaît → l'utilisateur ne peut pas quitter le wizard depuis l'étape 7

### Cause racine
`isValidated` est initialisé à `false` et uniquement mis à `true` dans `handleValidation()` (clic "Valider" dans la session courante). Aucune initialisation depuis `crvStore.currentCRV.statut` au chargement.

### Impact par vue
| Vue | Condition step 7 | VALIDE | VERROUILLE |
|---|---|---|---|
| CRVDepart | `!isValidated && crvStatus !== 'VALIDE'` | OK (workaround template) | **BLOQUÉ** |
| CRVTurnAround | `!isValidated` | **BLOQUÉ** | **BLOQUÉ** |
| CRVArrivee | `!isValidated` | **BLOQUÉ** | **BLOQUÉ** |

### Contournement existant
Le lien "← Retour" en haut de page (`goBack()`) permet de quitter, mais il n'est pas intuitif depuis l'étape 7.

## Fichiers modifiés
| Fichier | Lignes modifiées | Raison |
|---|---|---|
| `src/views/CRV/CRVDepart.vue` | +5 (init isValidated) | Ajout init `isValidated = true` si statut VALIDE/VERROUILLE dans onMounted |
| `src/views/CRV/CRVTurnAround.vue` | +5 (init isValidated) | Idem |
| `src/views/CRV/CRVArrivee.vue` | +5 (init isValidated) | Idem |

**Fichiers zone rouge touchés : NON**

## Patch appliqué
Ajout dans `onMounted` de chaque vue, après le chargement du CRV et avant le log "Initialisation terminée" :
```javascript
// Si le CRV est déjà validé/verrouillé, marquer comme validé pour afficher "Terminer" à l'étape 7
if (['VALIDE', 'VERROUILLE'].includes(crvStore.currentCRV?.statut)) {
  isValidated.value = true
}
```

## Preuve de correction
```
=== AVANT (code original) ===
CRV VERROUILLE ouvert → isValidated = false
Step 7 template : v-if="!isValidated" → true → affiche "Retour" uniquement
Utilisateur bloqué (pas de "Terminer")

=== APRÈS (fix appliqué) ===
CRV VERROUILLE ouvert → onMounted détecte statut VERROUILLE → isValidated = true
Step 7 template : v-if="!isValidated" → false → v-else → affiche "Terminer"
Utilisateur peut quitter le wizard normalement

=== CRV EN_COURS (non-régression) ===
CRV EN_COURS ouvert → statut pas dans ['VALIDE','VERROUILLE'] → isValidated = false
Step 7 : "Retour" affiché + formulaire validation → comportement normal
```

## Validation minimale exécutée
| Test | Résultat |
|---|---|
| Build frontend (`npm run build`) | PASS |
| Zone rouge | AUCUN fichier touché |
| Surface : 3 fichiers, 15 insertions | Minimal |
| CRV VERROUILLE existant en base (CRV260311-0012) | Confirmé disponible pour test |
| Logique isValidated vérifiée par lecture de code | Correct |

## Autres anomalies de navigation détectées (hors scope)

| # | Anomalie | Gravité | Décision |
|---|---|---|---|
| 1 | `prevStep()` ne sauvegarde pas les données de l'étape courante | LOW | formData local, pas de perte |
| 2 | `saveCurrentStepData()` catch les erreurs → navigation avance même si save échoue | MEDIUM | Bug réel mais impact limité (alert affiché) |
| 3 | Step position pas synchronisé avec URL → refresh perd la position | LOW | UX, pas bloquant |
| 4 | Progress dots non cliquables → navigation séquentielle uniquement | LOW | By design |
| 5 | btn-disabled sur step 4 est CSS-only, pas `:disabled` → cliquable visuellement | LOW | Bloké dans JS, acceptable |

## Hors scope
- Correction des anomalies LOW listées ci-dessus
- Refactor du pattern de navigation (extraction composable)
- Auto-save sur navigation arrière
- URL sync pour step position

## Risques restants
- Aucun risque identifié. Le fix est un ajout conditionnel dans onMounted, ne modifie aucun flux existant. Les CRV non-validés ne sont pas impactés (la condition `includes` ne matche pas).

## Statut honnête final
**FAIT ET BRANCHÉ — MERGEABLE**

Branche : `mission/P1-UX-004` (Front)
Rollback : `git revert <hash>`
