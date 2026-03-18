## Mission : SAFE_MERGE_AND_PREPARE_SOUMISSION_NO_REGRESSION
- Date : 2026-03-18
- Branche : mission/RENAME-VALIDATION-TO-SOUMISSION (rename) + merges sur main
- Périmètre : frontend (rename) + backend (merge)
- Domaine : gouvernance merge + UX terminologie
- Classe : HYGIÈNE (merge) + COSMÉTIQUE (rename)
- Niveau cérémonie : structurelle (zone rouge backend reviewée)
- Fichiers modifiés :
  - Merge Front : 5 src (crvStore.js, CRVArrivee, CRVDepart, CRVList, CRVTurnAround)
  - Merge Back : 8 src (crv.controller.js [zone rouge], 5 controllers, CRVEvent.js, crv.routes.js)
  - Rename : 7 src (CRVValidation, CRVCompletude, CRVWizard, CRVWizardSteps, CRVArrivee, CRVDepart, CRVTurnAround)
- Fichiers zone rouge touchés : OUI — crv.controller.js (merge back, 2 fix ciblés reviewés)
- Lignes ajoutées/supprimées :
  - Merge Front : +941/-35
  - Merge Back : +3107/-62
  - Rename : +270/-20 (dont 250 lignes = 3 fichiers ajoutés pour la première fois)
- Build avant/après : OK/OK (chaque volet)
- Tests avant/après : N/A (pas de suite de tests automatisés)
- Impact comportemental : Labels UX étape 7 changés, aucun impact logique
- Rollback : git revert [hash] sur chaque commit de merge

---

## Volet 1 — Merge Front

| Étape | Résultat |
|---|---|
| Build avant | ✅ OK (4.57s) |
| Zone rouge | ✅ AUCUNE |
| Merge sans conflit | ✅ OK |
| Build après | ✅ OK (4.45s) |
| Liste CRV | ✅ PROUVÉ (statuts, complétude, suppression cachée ≥ TERMINÉ) |
| CRV Arrivée KP032 — step 1 + 7 étapes | ✅ PROUVÉ |
| CRV Départ KP039 — prefill + engins | ✅ PROUVÉ (KP039, B737-800, AVT-006) |
| CRV TurnAround AF908 — prefill | ✅ PROUVÉ (AF908, CDG, B777) |

**Verdict : PROUVÉ**

## Volet 2 — Review zone rouge Back

| Changement | Analyse | Verdict |
|---|---|---|
| Import AffectationEnginVol + query dans obtenirCRV | Remplace crv.materielUtilise (vide) par query AffectationEnginVol. Impact uniquement GET /crv/:id. | ✅ SAFE |
| Personnel findByIdAndUpdate atomique (3 fonctions) | Élimine VersionError 500 en concurrence. Perte mineure : 404 sur suppression personne inexistante (acceptable, $pull idempotent). | ✅ SAFE avec réserve mineure |
| Extraction controllers (5 fichiers) | Mêmes fonctions, mêmes noms, mêmes routes. Réorganisation pure. | ✅ SAFE |
| CRVEvent modèle + 2 endpoints GET | Ajout pur, lecture seule. | ✅ SAFE |

**Verdict : REVIEW OK AVEC RÉSERVE MINEURE**

## Volet 3 — Merge Back

| Étape | Résultat |
|---|---|
| Merge sans conflit | ✅ OK |
| Backend restart | ✅ OK |
| GET /crv/:id engins (fix principal) | ✅ PROUVÉ (1 engin AVT-006) |
| GET /crv/:id données complètes | ✅ PROUVÉ (phases 10, charges 2, événements 1) |
| Transitions EN_COURS/TERMINÉ | ✅ PROUVÉ |
| PDF base64 | ✅ PROUVÉ (62kb) |
| UI engins post-reload | ✅ PROUVÉ |

**Verdict : PROUVÉ**

## Volet 4 — Cadrage rename

Confirmation :
- ✅ Le backend continue à gérer VALIDE / VERROUILLE
- ✅ La "Soumission" côté agent ne remplace pas la validation métier serveur
- ✅ Les API /validation/:id/valider restent identiques
- ✅ Les statuts machine ne changent pas

## Volet 5 — Exécution rename

| Label | Avant | Après |
|---|---|---|
| Étape 7 wizard | Validation | **Soumission** |
| Titre section | Validation du CRV | **Soumission du CRV** |
| Bouton | Valider le CRV | **Soumettre le CRV** |
| Loading | Validation en cours... | **Soumission en cours...** |
| Post-action | CRV Validé | **CRV Soumis** |
| Champ nom | Nom du validateur | **Soumis par** |
| Info | Validé par: | **Soumis par :** |
| Info | Date de validation: | **Date de soumission :** |
| Complétude OK | CRV prêt pour validation | **CRV prêt pour soumission** |
| Complétude KO | requis pour la validation | **requis pour la soumission** |
| Warning | ...certifier les informations | **...certifier les informations avant soumission** |

**Non touché (volontairement) :**
- Nom fichier CRVValidation.vue (risque imports)
- Variables internes (isValidated, handleValidation, validateur, stepValidationError)
- crvStore.validateCRV() (interne store)
- Vue Manager ValidationCRV.vue (validation superviseur = mot correct)
- Tout le backend
- Machine à états

**Verdict : PROUVÉ — Build OK + UI vérifiée visuellement**

---

## Réserves

1. **Perte 404 suppression personne inexistante** (merge back) — $pull atomique ne distingue pas "trouvé et supprimé" de "pas trouvé". Impact quasi-nul en pratique.
2. **Pas de tests automatisés** — validation manuelle uniquement via API + UI. Suite de tests à créer dans une future mission TEST.

## Ce qui reste ouvert

1. Les variables internes (isValidated, handleValidation, etc.) pourront être renommées dans une future mission COSMÉTIQUE si souhaité — 0 urgence, 0 impact UX.
2. La vue Manager ValidationCRV.vue utilise "Validation" dans son sens correct (validation superviseur) — ne doit PAS être renommée.
3. Les branches mergées (`mission/P1-BINDING-DEPART-TURNAROUND` front, `mission/FIX-ENGINS-GET-CRV` back) peuvent être supprimées par décision humaine.
