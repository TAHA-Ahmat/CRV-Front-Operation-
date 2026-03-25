# BACKLOG — Vision SLA, Phases Boarding/Check-in, Countdown

**Date** : 2026-03-25
**Branche** : mission/DASHBOARD-OPERATIONNEL
**Statut** : PREPARÉ MAIS NON BRANCHÉ (analyse complète, code non démarré)
**Classe** : PRODUIT

---

## Contexte

L'audit du wizard CRV a révélé que boarding et check-in sont actuellement des timestamps Horaire affichés dans Step 1 (Informations vol). Décision : ils doivent devenir des **phases à part entière** dans Step 4, avec SLA, countdown, et alertes.

La logique SLA doit être pilotée par le manager (page SLAConfiguration existante), pas par le dev.

---

## Palier 2 — Phases Boarding/Check-in (mission dédiée)

### Nouvelles phases à créer dans seedPhases.js

| Code | Libelle | typeOperation | Catégorie | Ordre | slaMode |
|---|---|---|---|---|---|
| DEP_CHECKIN | Enregistrement passagers | DEPART | PASSAGERS | 4 | DEADLINE |
| DEP_BOARDING | Embarquement & Gate | DEPART | PASSAGERS | 6 | DEADLINE |
| TA_CHECKIN | Enregistrement passagers | TURN_AROUND | PASSAGERS | 10 | DEADLINE |
| TA_BOARDING | Embarquement & Gate | TURN_AROUND | PASSAGERS | 12 | DEADLINE |

### Distinction DUREE vs DEADLINE

**Phases classiques (slaMode=DUREE)** : SLA = durée max une fois commencée.
- Référence = début de la phase elle-même.
- Exemple : "Nettoyage max 30 min"

**Phases boarding/checkin (slaMode=DEADLINE)** : SLA = heure fixe relative à ETD/STD.
- Référence = heure de décollage prévue (ETD/STD).
- Exemple : "Comptoir ouvre 120 min AVANT ETD"
- heureDebutPrevue et heureFinPrevue calculées à l'init du CRV.

### Référence temporelle par domaine SLA

| Domaine | Événement de référence | Direction |
|---|---|---|
| Enregistrement (check-in) | STD (décollage prévu) | AVANT |
| Embarquement (boarding) | ETD (décollage prévu) | AVANT |
| Bagages | Calage (chocks on) | APRÈS |
| GPU | Calage | APRÈS |
| Turnaround | Calé-à-calé | DURÉE |
| Phases classiques | Début de phase | DURÉE |
| CRV transitions | Date de transition | DURÉE |

### Modifications backend requises

1. Ajouter `slaMode` (DUREE|DEADLINE) et `referenceTemporelle` (ETA|ETD|CALAGE) sur le modèle Phase
2. Dans `initialiserPhasesVol()` : calculer heureDebutPrevue/heureFinPrevue pour les phases DEADLINE
3. Synchroniser heures phase → Horaire (debutBoardingAt ↔ phase.heureDebutReelle)
4. Validation typeOperation sur endpoints horodatages-boarding/checkin (ARRIVEE = interdit)

### Modifications frontend requises

1. Retirer sections Boarding/Check-in de Step 1 (CRVDepart + CRVTurnAround)
2. Ces phases apparaissent naturellement dans Step 4 (CRVPhases)
3. Adapter CRVPhases.vue pour gérer slaMode=DEADLINE (affichage countdown)
4. L'ancien DEP_EMBARQ_PAX est remplacé par DEP_BOARDING (même activité, enrichie)

### Ce que le manager contrôle (déjà en place)

- Onglet "Enregistrement" : ouverture (min avant STD), fermeture (min avant STD)
- Onglet "Embarquement" : début (min avant ETD), fermeture gate (min avant ETD)
- Onglet "Phases" : durée max par phase code
- Héritage : null = standard global, valeur = override compagnie

---

## Palier 3 — Countdown + Alertes (mission dédiée)

### Frontend

- Composant `SLACountdown.vue` : timer réactif (setInterval 1s)
- Deux modes :
  - DUREE : chrono depuis le début de la phase
  - DEADLINE : countdown vers heureDebutPrevue (puis heureFinPrevue)
- Couleurs dynamiques : vert (OK) → jaune (WARNING 75%) → orange (CRITICAL 90%) → rouge (EXCEEDED 100%+)
- Intégration dans CRVPhases.vue : chaque phase affiche son countdown

### Backend

- Réduire intervalle cron alerteSLA de 30min à 5min
- Ajouter envoi d'email dans alerteSLA.service.js (actuellement notification in-app seulement)
- Détecter CRV non créés : croiser vols du bulletin jour avec CRV existants

### Scénario type

Vol ETD=10h00. Phase DEP_BOARDING (SLA: début 40 min avant = 09h20).
- 09h00 : countdown affiche "Début dans 20 min" (vert)
- 09h15 : "Début dans 5 min" (jaune WARNING)
- 09h18 : "Début dans 2 min" (orange CRITICAL)
- 09h20 : phase non commencée → "Retard" (rouge EXCEEDED)
- 09h20 : email envoyé au superviseur + chef d'équipe
- Si personne n'a ouvert le CRV → alerte proactive

---

## Palier 4 — Positionnement temporel de toutes les phases (mission dédiée)

### Concept

Chaque phase reçoit un **offset** par rapport à un événement de référence (ETA, ETD, calage).
Le système calcule automatiquement le "planning théorique" d'un vol.

### Exemple vol Départ ETD=10h00

```
07h00  DEP_INSPECTION       (ETD - 180 min)
07h15  DEP_AVITAILLEMENT    (ETD - 165 min)
07h30  DEP_NETTOYAGE        (ETD - 150 min)
08h00  DEP_CHECKIN           (ETD - 120 min) ← SLA config
08h30  DEP_CHARG_SOUTE      (ETD - 90 min)
09h20  DEP_BOARDING          (ETD - 40 min) ← SLA config
09h45  DEP_FERMETURE        (ETD - 15 min)
09h50  DEP_REPOUSSAGE       (ETD - 10 min)
10h00  DEP_DECOLLAGE        (ETD)
```

### Modifications requises

1. Étendre SLAConfig ou Phase : offset par phase (minutes avant/après référence)
2. UI manager : configurer le positionnement temporel
3. Calcul automatique à l'init du CRV

### Priorité

Palier 4 est optionnel à court terme. Les paliers 2 et 3 suffisent pour le MVP opérationnel.

---

## Fichiers impactés (vue d'ensemble)

### Backend
- `models/phases/Phase.js` (ajout slaMode, referenceTemporelle)
- `utils/seedPhases.js` (nouvelles phases)
- `services/phases/phase.service.js` (calcul heureDebutPrevue/heureFinPrevue)
- `controllers/crv/boardingHorodatages.controller.js` (garde typeOperation)
- `controllers/crv/checkinHorodatages.controller.js` (garde typeOperation)
- `services/notifications/alerteSLA.service.js` (cron 5min, emails)

### Frontend
- `views/CRV/CRVDepart.vue` (retirer boarding/checkin de Step 1)
- `views/CRV/CRVTurnAround.vue` (retirer boarding/checkin de Step 1)
- `components/crv/CRVPhases.vue` (countdown, slaMode DEADLINE)
- `composables/useSLA.js` (adapter calculs)
- Nouveau : `components/crv/SLACountdown.vue`
