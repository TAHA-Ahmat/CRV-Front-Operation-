# P1_DELETE_GUARD_001 — RAPPORT MISSION

## Mission : P1_DELETE_GUARD_001
- Date : 2026-03-17
- Branche : mission/P1-DELETE-GUARD-001 (Front)
- Périmètre : frontend
- Domaine : Liste CRV — actions disponibles selon statut
- Classe : PRODUIT (valeur observable pour l'utilisateur)
- Niveau cérémonie : standard
- Fichiers modifiés : 1 (CRVList.vue)
- Fichiers zone rouge touchés : NON
- Lignes ajoutées/supprimées : +3 / -2
- Build avant/après : OK/OK
- Tests avant/après : N/A (pas de tests unitaires frontend)
- Impact comportemental : Le bouton "Supprimer" disparaît dès que le CRV atteint le statut Terminé

---

## PROBLÈME UTILISATEUR CORRIGÉ

### L'utilisateur pouvait tenter de supprimer un CRV terminé

- **Étape utilisateur** : Consultation de la liste "Mes CRV"
- **Action utilisateur** : Regarde les actions disponibles pour un CRV au statut "Terminé"
- **Résultat attendu** : Le bouton "Supprimer" ne doit pas apparaître — la suppression est interdite une fois le CRV terminé
- **Résultat observé (avant correction)** : Le bouton "Supprimer" était affiché et cliquable sur les CRV Terminé et Validé
- **Impact utilisateur** : L'utilisateur pouvait tenter de supprimer un CRV terminé. Si le serveur bloquait, il recevait une erreur confuse. Si le serveur ne bloquait pas, des données opérationnelles validées pouvaient être détruites.
- **Gravité** : Élevée — violation d'une règle métier fondamentale

### Pourquoi c'est incohérent pour l'utilisateur
Un CRV terminé représente un travail achevé. Le proposer à la suppression contredit le statut affiché et sème le doute : "est-ce que mes données sont en sécurité ?". L'utilisateur ne devrait voir que les actions pertinentes pour l'état actuel du CRV.

### Où le bouton apparaissait
Page "Mes CRV" (`/crv/liste`), colonne Actions de chaque ligne du tableau. Le bouton "Supprimer" ouvre une modale de confirmation avec saisie de "SUPPRIMER".

### Dans quels statuts le bouton doit disparaître
| Statut | Supprimer visible ? | Raison |
|---|---|---|
| BROUILLON | Oui | CRV pas encore démarré |
| EN_COURS | Oui | CRV en rédaction |
| **TERMINÉ** | **Non** | Travail achevé, suppression interdite |
| **VALIDÉ** | **Non** | CRV validé par un superviseur |
| **VERROUILLÉ** | **Non** | CRV verrouillé, immutable |
| ANNULÉ | Oui | CRV annulé, nettoyage possible |

---

## CAUSE TECHNIQUE

La fonction `canSupprimerCRV()` dans CRVList.vue ne vérifiait que `crv.statut !== 'VERROUILLE'`. Les statuts TERMINÉ et VALIDÉ n'étaient pas bloqués.

```javascript
// AVANT
return crv.statut !== 'VERROUILLE'

// APRÈS
const statutsInterdits = ['TERMINE', 'VALIDE', 'VERROUILLE']
return !statutsInterdits.includes(crv.statut)
```

---

## VÉRIFICATION AVANT/APRÈS

### AVANT correction (12 CRV en base)
| Statut | Nombre | Supprimer visible |
|---|---|---|
| En cours | 4 | Oui (correct) |
| Terminé | 5 | **Oui (BUG)** |
| Verrouillé | 3 | Non (correct) |

### APRÈS correction
| Statut | Nombre | Supprimer visible |
|---|---|---|
| En cours | 4 | Oui (correct) |
| Terminé | 5 | **Non (corrigé)** |
| Verrouillé | 3 | Non (correct) |

---

## PREUVE

1. **Build** : `vite build` OK
2. **Test navigateur** : Page "Mes CRV" rechargée, vérification programmatique de chaque ligne — 0 CRV Terminé avec bouton Supprimer
3. **Aucune erreur console**

---

## Statut honnête final
**FAIT ET BRANCHÉ — MERGEABLE**

1 fichier, +3/-2 lignes, 0 zone rouge. Le bouton "Supprimer" est masqué pour tout CRV ≥ TERMINÉ, conformément à la règle métier.

**Note** : cette correction porte sur l'interface uniquement. Il faudrait vérifier que le backend bloque aussi la suppression côté API (route DELETE) pour les CRV ≥ TERMINÉ. Si ce n'est pas le cas, c'est une faille de sécurité à traiter en mission séparée (backend).
