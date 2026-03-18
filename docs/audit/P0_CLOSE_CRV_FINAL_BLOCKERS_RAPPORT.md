## Mission : P0_CLOSE_CRV_FINAL_BLOCKERS
- Date : 2026-03-18
- Branche : mission/P0-CLOSE-CRV-FINAL-BLOCKERS (Back + Front)
- Périmètre : backend + frontend
- Domaine : cycle métier CRV complet
- Classe : PRODUIT
- Niveau cérémonie : standard
- Fichiers modifiés backend : crv.controller.js (⚠️ ZONE ROUGE), CRV.js, crv.service.js
- Fichiers modifiés frontend : CRVCharges.vue, CRVValidation.vue, CRVArrivee.vue, CRVDepart.vue, CRVTurnAround.vue
- Fichiers zone rouge touchés : OUI — crv.controller.js (2 lignes ciblées, justification ci-dessous)
- Lignes ajoutées/supprimées : ~+60 / -50
- Build avant/après : OK / OK
- Tests avant/après : N/A
- Impact comportemental : 3 bloqueurs P0 levés — cycle CRV bout-en-bout fonctionnel
- Rollback : git revert sur chaque branche

---

## Bloqueurs finaux identifiés

### BLOQUEUR 1 : `responsableVol` jamais renseigné

**Preuve AVANT** : CRV KP032 (TERMINÉ, 85%) → validation donne anomalie "Responsable du vol non défini" → statut reste TERMINÉ, validation EN_ATTENTE_CORRECTION.

**Cause racine** : Le champ `responsableVol` (ObjectId ref Personne) dans le modèle CRV n'était jamais rempli car :
- Aucun champ UI ne le propose
- La création CRV utilisait `responsableVolId || null`
- Le `demarrerCRV` ne le remplissait pas non plus

**Correction** (crv.controller.js — ZONE ROUGE) :
1. Ligne 303 : `responsableVolId || null` → `responsableVolId || req.user._id` (fallback au créateur)
2. Ligne 2219 : ajout `if (!crv.responsableVol) crv.responsableVol = req.user._id` dans `demarrerCRV` (rattrapage pour CRV existants)

**Preuve APRÈS** : CRV KP032 → validation donne anomalies = [], statut = VALIDÉ.

### BLOQUEUR 2 : Impossible de confirmer absence de charge

**Preuve AVANT** : CRV AF908 (0 charges, toutes phases OK) → complétude plafonne à 60% (30 phases + 0 charges + 20 événements + 10 observations). Seuil VALIDÉ = 80%. Impossible à atteindre.

**Cause racine triple** :
1. Le champ `confirmationAucuneCharge` avait été **supprimé du modèle Mongoose** (CRV.js)
2. Le calcul de complétude (crv.service.js) **ignorait** le flag même s'il existait
3. Le bouton UI "Confirmer aucune charge" avait été **supprimé** de CRVCharges.vue

**Correction** :
1. CRV.js : réajout du champ `confirmationAucuneCharge: { type: Boolean, default: false }`
2. crv.service.js : ajout condition `else if (crv.confirmationAucuneCharge)` → score 30%
3. CRVCharges.vue : ajout bouton "Confirmer : aucune charge pour ce vol" + handler + style

**Preuve APRÈS** : CRV KP039 → confirmer absence → complétude passe de 30% à 60%, puis avec phases terminées → 90%.

### PROBLÈME 3 : Soumission agent mélangée avec validation superviseur

**Preuve AVANT** : `handleValidation()` dans les 3 vues CRV tentait EN_COURS→TERMINÉ **puis** TERMINÉ→VALIDÉ en cascade. La route `/api/validation/:id/valider` exige `authorize('SUPERVISEUR', 'MANAGER')` → 403 pour un agent.

**Correction** (3 vues) : suppression du bloc "Étape 2" qui tentait `validateCRV()`. Le step 7 agent ne fait désormais **que** la terminaison (EN_COURS→TERMINÉ). Message post-soumission : "En attente de validation par un superviseur".

**Preuve APRÈS** : Agent soumet (TERMINÉ), superviseur valide séparément (VALIDÉ), superviseur verrouille (VERROUILLÉ). PDF OK. Cycle complet fonctionnel.

---

## Validation bout-en-bout

CRV KP039 (Départ) — cycle complet prouvé :

| Étape | Action | Résultat |
|-------|--------|----------|
| Phases | 9/9 terminées | ✅ 200 |
| Absence charge | confirmée | ✅ complétude 60→90% |
| Soumission agent | EN_COURS→TERMINÉ | ✅ 200, 90% |
| Validation superviseur | TERMINÉ→VALIDÉ | ✅ 200, anomalies=[] |
| PDF | pdf-base64 | ✅ 200, 58KB |
| Verrouillage | VALIDÉ→VERROUILLÉ | ✅ 200 |

---

## Zone rouge justification

`crv.controller.js` modifié — **2 changements ciblés** :
1. Ligne 303 : fallback `responsableVol` à `req.user._id` (1 mot changé)
2. Lignes 2219-2221 : rattrapage `responsableVol` dans `demarrerCRV` (3 lignes ajoutées)

Aucune modification de : validation.service.js, crvArchivage.service.js, businessRules.middleware.js, authStore.js, permissions.js, router/index.js, useAuth.js.

---

## Ce qui reste volontairement hors scope

- 226+ console.log par chargement (P2 HYGIÈNE)
- 4x requêtes réseau au save (P2 HYGIÈNE)
- Aéroport destination non prérempli (P2 UX)
- Archivage Google Drive non testé E2E (dépend config)
- Tests automatisés de non-régression (P2 TEST)
