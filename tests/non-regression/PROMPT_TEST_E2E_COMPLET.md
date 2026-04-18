# PROMPT DE TEST END-TO-END — CRV Wizard + SLA + Phases

**Objectif** : Tester de bout en bout que chaque donnée affichée, saisie, envoyée, stockée et restituée est correcte. Couvre les 3 types CRV (Arrivee, Depart, TurnAround), les 7 etapes du wizard, la configuration SLA manager, les alertes et le countdown temps reel.

**Methode** : Pour chaque verification, noter OK ou KO + capture/detail.

---

## PARTIE A — PARCOURS MANAGER (Config SLA)

### A1. Connexion Manager
- [ ] Se connecter avec un compte MANAGER
- [ ] Verifier : redirection vers `/dashboard-manager`
- [ ] Verifier : menu contient "Dashboard", "Stats", "A valider", "SLA Configuration"

### A2. Page SLAConfiguration (`/sla-configuration`)
- [ ] Ouvrir la page
- [ ] Verifier : section "SLA Standard" affiche 4 cartes (Brouillon→En cours: 24h, En cours→Termine: 48h, Termine→Valide: 72h, Global: 168h)
- [ ] Verifier : tableau des compagnies visible (peut etre vide)

### A3. Creer une config compagnie
- [ ] Cliquer "+ Ajouter une compagnie"
- [ ] Remplir : Code IATA = `3O`, Nom = `Air Senegal`, Actif = oui

#### A3.1 Onglet CRV
- [ ] Saisir : Brouillon→En cours = 12h
- [ ] Verifier : hint affiche "12h"
- [ ] Laisser les autres vides
- [ ] Verifier : hint affiche "herite"

#### A3.2 Onglet Enregistrement
- [ ] Saisir : Ouverture comptoir = 120
- [ ] Verifier : hint affiche "120 min avant STD"
- [ ] Saisir : Fermeture comptoir = 45
- [ ] Verifier : hint affiche "45 min avant STD"

#### A3.3 Onglet Bagages
- [ ] Saisir : Premier bagage = 25
- [ ] Verifier : hint affiche "25 min apres calage"
- [ ] Saisir : Dernier bagage = 40
- [ ] Verifier : hint affiche "40 min apres calage"

#### A3.4 Onglet Embarquement
- [ ] Saisir : Debut embarquement = 40
- [ ] Verifier : hint affiche "40 min avant ETD"
- [ ] Saisir : Fermeture porte = 15
- [ ] Verifier : hint affiche "15 min avant ETD"

#### A3.5 Onglet Rampe
- [ ] Saisir : Turnaround = 60
- [ ] Verifier : hint affiche "60 min cale-a-cale"

#### A3.6 Onglet Messages
- [ ] Laisser tout vide (herite)

#### A3.7 Onglet Phases (durees)
- [ ] Verifier : la liste contient DEP_CHECKIN, DEP_BOARDING, TA_CHECKIN, TA_BOARDING (nouvelles phases)
- [ ] Verifier : DEP_EMBARQUEMENT n'est PLUS dans la liste
- [ ] Saisir : DEP_BOARDING = 30
- [ ] Verifier : hint affiche "30 min max"

#### A3.8 Onglet Planning (offsets temporels)
- [ ] Verifier : l'onglet "Planning" existe
- [ ] Verifier : la liste contient ARR_BRIEFING, DEP_INSPECTION, DEP_AVITAILLEMENT, etc.
- [ ] Saisir : DEP_INSPECTION = 180
- [ ] Verifier : hint affiche "180 min avant ETD"
- [ ] Laisser les autres vides

#### A3.9 Sauvegarde
- [ ] Cliquer "Creer"
- [ ] Verifier : pas d'erreur
- [ ] Verifier : la compagnie 3O apparait dans le tableau
- [ ] Verifier : badges "configure" sur les colonnes Enregistrement, Bagages, Embarquement, Rampe

#### A3.10 Verification API
- **Endpoint** : `GET /api/sla/compagnies/3O`
- [ ] Verifier reponse contient :
  - `checkin.ouverture = 120`
  - `checkin.fermeture = 45`
  - `boarding.debut = 40`
  - `boarding.fermetureGate = 15`
  - `bagages.premierBagage = 25`
  - `bagages.dernierBagage = 40`
  - `ramp.turnaround = 60`
  - `phaseDurees.DEP_BOARDING = 30`
  - `phaseOffsets.DEP_INSPECTION = 180`

#### A3.11 Reouverture
- [ ] Cliquer "Modifier" sur 3O
- [ ] Verifier : tous les champs saisis sont restitues correctement
- [ ] Verifier : les champs vides affichent "herite"

---

## PARTIE B — PARCOURS AGENT : CRV ARRIVEE

### B0. Prerequis
- [ ] Un bulletin de mouvement existe pour aujourd'hui avec un vol ARRIVEE (compagnie 3O)
- [ ] Se connecter avec un compte AGENT_ESCALE

### B1. Creation CRV
- [ ] Aller sur `/crv/nouveau`
- [ ] Choisir "Vol Planifie"
- [ ] Filtrer : date = aujourd'hui, type = Arrivee
- [ ] Selectionner le vol 3O
- [ ] Cliquer "Creer le CRV"
- [ ] Verifier : redirection vers `/crv/arrivee?id=xxx`

#### Verification API creation
- **Endpoint appele** : `POST /api/crv`
- [ ] Verifier : CRV cree avec statut BROUILLON
- [ ] Verifier : Horaire cree avec heureAtterrisagePrevue (depuis bulletin)
- [ ] Verifier : Phases initialisees (ARR_* + COM_*)
- [ ] Verifier : PAS de phases DEP_CHECKIN, DEP_BOARDING (c'est une arrivee)

### B2. Step 1 — Informations vol
**Ce qu'on DOIT voir :**
- [ ] Numero vol, Compagnie, Code IATA, Date, Origine, Destination, Type avion, Immatriculation, Poste
- [ ] Section "Horaires prevus" : Atterrissage prevu = HH:MM (depuis bulletin)
- [ ] Si decollage prevu existe (cas rare pour arrivee) : affiche aussi

**Ce qu'on NE DOIT PAS voir :**
- [ ] PAS de section Boarding
- [ ] PAS de section Check-in

**Navigation :**
- [ ] Cliquer "Continuer"
- [ ] Verifier : passage a Step 2 sans blocage

#### Verification tracabilite Step 1
| Champ affiche | Source store | Source API | Source modele |
|---|---|---|---|
| Numero vol | `crvStore.currentCRV.vol.numeroVol` | `GET /api/crv/:id` → `vol.numeroVol` | `Vol.numeroVol` |
| Atterrissage prevu | `crvStore.currentCRV.horaire.heureAtterrisagePrevue` | `GET /api/crv/:id` → `horaire.heureAtterrisagePrevue` | `Horaire.heureAtterrisagePrevue` ← `BulletinMouvement.mouvements[].heureArriveePrevue` |

### B3. Step 2 — Personnel
- [ ] Ajouter une personne : Nom=Diallo, Prenom=Amadou, Fonction=CHEF_ESCALE
- [ ] Cocher "Responsable du vol"
- [ ] Cliquer "Continuer"

#### Verification
- **Endpoint** : `PUT /api/crv/:id/personnel` (appele au changement d'etape)
- [ ] Verifier : personnel sauvegarde dans CRV.personnelAffecte[]
- [ ] Revenir Step 2 : les donnees sont toujours la

### B4. Step 3 — Engins
- [ ] Ajouter un engin : Type=TRACTEUR_PUSHBACK, Immatriculation=TRC-001
- [ ] NE PAS renseigner les heures
- [ ] Cliquer "Continuer"

#### Verification
- **Endpoint** : `PUT /api/crv/:id/engins` (appele au changement d'etape)
- [ ] Verifier : engin sauvegarde dans CRV.materielUtilise[]
- [ ] Verifier : heureDebutUtilisation et heureFinUtilisation sont null (pas d'erreur)

### B5. Step 4 — Phases
**Ce qu'on DOIT voir :**
- [ ] Phases ARR_* : Briefing, Arrivee avion, Ouverture soutes, Dechargement, Livraison bagages, Debarquement passagers
- [ ] Phases COM_* : Controle securite, Remise documents
- [ ] Optionnelles : Mise en condition cabine, Debriefing, Catering, Maintenance
- [ ] Barre de progression : "0/X traitees"
- [ ] Message informatif : "X phase(s) restante(s) non traitees" (PAS bloquant)

**Ce qu'on NE DOIT PAS voir :**
- [ ] PAS de phases DEP_CHECKIN, DEP_BOARDING, TA_*

**SLA Countdown :**
- [ ] Chaque phase affiche un SLACountdown
- [ ] Phases NON_COMMENCE avec offsetMinutesDefaut : countdown vers heureDebutPrevue
- [ ] Phases NON_COMMENCE sans offset : affiche duree attendue (ex: "10min durée attendue")
- [ ] Couleur = gris/pending pour les phases non commencees loin de l'echeance

**Navigation :**
- [ ] Cliquer "Continuer" SANS traiter aucune phase
- [ ] Verifier : passage a Step 5 SANS blocage (gate supprime)

**Traiter une phase :**
- [ ] Cliquer "Saisir les heures" sur ARR_BRIEFING
- [ ] Saisir heure debut = maintenant
- [ ] NE PAS saisir heure fin
- [ ] Enregistrer
- [ ] Verifier : phase passe en EN_COURS
- [ ] Verifier : SLACountdown affiche chrono en temps reel (ex: "2/10min en cours")
- [ ] Verifier : le timer se met a jour chaque seconde

#### Verification API
- **Endpoint** : `PUT /api/crv/:crvId/phases/:phaseId`
- [ ] Verifier : ChronologiePhase.statut = EN_COURS, heureDebutReelle = renseigne

### B6. Step 5 — Charges
- [ ] Ajouter : PASSAGERS DEBARQUEMENT, adultes=120
- [ ] Verifier : sauvegarde immediate (pas d'attente changement etape)
- [ ] Ajouter : BAGAGES DEBARQUEMENT, soute=95, poids=1230
- [ ] Verifier : sauvegarde immediate
- [ ] Essayer : BAGAGES sans poids → doit etre rejete ("poids doit etre renseigne")

**Sens operation :**
- [ ] Verifier : le dropdown propose EMBARQUEMENT et DEBARQUEMENT (les deux)
- [ ] Verifier : on PEUT ajouter EMBARQUEMENT sur une arrivee (pas de restriction front/back)

#### Verification API
- **Endpoint** : `POST /api/crv/:id/charges`
- [ ] Verifier : ChargeOperationnelle creee avec crv, typeCharge, sensOperation
- [ ] Verifier : doublon (meme type+sens) rejete avec 409

### B7. Step 6 — Evenements
- [ ] Ajouter : type=PANNE_EQUIPEMENT, gravite=MODEREE, description="Tapis bagages bloque"
- [ ] Verifier : sauvegarde immediate

### B8. Step 7 — Soumission
- [ ] Renseigner : validateur, fonction=CHEF_ESCALE, cocher certification
- [ ] Soumettre
- [ ] Verifier : CRV passe en statut TERMINE (ou reste EN_COURS si completude < 50%)

---

## PARTIE C — PARCOURS AGENT : CRV DEPART

### C1. Creation
- [ ] Creer un CRV DEPART pour un vol 3O (compagnie avec SLA configure en Partie A)

### C2. Step 1 — Informations vol
**Ce qu'on DOIT voir :**
- [ ] Memes champs identite vol que l'arrivee
- [ ] Section "Horaires prevus" : Decollage prevu = HH:MM
- [ ] Si atterrissage prevu existe : affiche aussi

**Ce qu'on NE DOIT PAS voir :**
- [ ] PAS de section Boarding (retire de Step 1)
- [ ] PAS de section Check-in (retire de Step 1)

### C3. Step 4 — Phases (CLE DU TEST)
**Ce qu'on DOIT voir :**
- [ ] Phases DEP_* : Inspection, Avitaillement, Nettoyage, **DEP_CHECKIN** (Enregistrement passagers), Chargement soute, **DEP_BOARDING** (Embarquement & gate), Fermeture, Repoussage, Roulage, Decollage
- [ ] Phases COM_* : Controle securite, Remise documents

**Phases DEADLINE (DEP_CHECKIN et DEP_BOARDING) :**
- [ ] DEP_CHECKIN affiche : heureDebutPrevue = ETD - 120 min (config 3O)
- [ ] DEP_CHECKIN affiche : heureFinPrevue = ETD - 45 min (config 3O)
- [ ] DEP_BOARDING affiche : heureDebutPrevue = ETD - 40 min (config 3O)
- [ ] DEP_BOARDING affiche : heureFinPrevue = ETD - 15 min (config 3O)

**SLA Countdown sur phases DEADLINE :**
- [ ] DEP_CHECKIN (NON_COMMENCE) : countdown vers heureDebutPrevue
  - Ex si ETD=14h00 et il est 11h30 : "30m00s avant ouverture" (vert)
  - Si il est 11h55 : "5m00s ouverture imminente" (orange)
  - Si il est 12h05 : "+5m00s retard ouverture" (rouge pulsant)
- [ ] DEP_BOARDING (NON_COMMENCE) : countdown vers heureDebutPrevue
  - Ex si ETD=14h00 : "Xm avant ouverture" basé sur ETD - 40 min = 13h20

**SLA Countdown sur phases DUREE :**
- [ ] DEP_INSPECTION (NON_COMMENCE) : affiche "15min duree attendue" (gris)
- [ ] DEP_INSPECTION (EN_COURS) : chrono "3/15min en cours" (vert)
- [ ] DEP_INSPECTION si depasse : "18/15min duree depassee" (rouge)

**Demarrer DEP_CHECKIN :**
- [ ] Saisir heure debut
- [ ] Verifier : phase EN_COURS
- [ ] Verifier : countdown bascule vers heureFinPrevue ("Xm avant fermeture")
- [ ] Verifier API : `POST /api/phases/:id/demarrer`

**Terminer DEP_CHECKIN :**
- [ ] Saisir heure fin
- [ ] Verifier : phase TERMINE
- [ ] Verifier : countdown disparait (phase terminee)

#### Verification SYNC Horaire (CRITIQUE)
Quand DEP_CHECKIN demarre :
- [ ] Verifier : `Horaire.ouvertureComptoirAt` = heureDebutReelle de la phase
Quand DEP_CHECKIN termine :
- [ ] Verifier : `Horaire.fermetureComptoirAt` = heureFinReelle de la phase
Quand DEP_BOARDING demarre :
- [ ] Verifier : `Horaire.debutBoardingAt` = heureDebutReelle de la phase
Quand DEP_BOARDING termine :
- [ ] Verifier : `Horaire.fermetureGateAt` = heureFinReelle de la phase

**Endpoint** : `GET /api/crv/:id` → verifier horaire contient les timestamps synchronises

### C4. Steps 2-3, 5-7
- [ ] Verifier : identiques a l'arrivee (memes champs, memes actions)
- [ ] Charges : verifier que EMBARQUEMENT et DEBARQUEMENT sont possibles

---

## PARTIE D — PARCOURS AGENT : CRV TURN_AROUND

### D1. Creation
- [ ] Creer un CRV TURN_AROUND pour un vol 3O

### D2. Step 1 — Informations vol
**Ce qu'on DOIT voir :**
- [ ] Identite vol (memes champs)
- [ ] Section "Horaires prevus" : **Atterrissage prevu ET Decollage prevu** (les deux)

**Ce qu'on NE DOIT PAS voir :**
- [ ] PAS de section Boarding
- [ ] PAS de section Check-in

### D3. Step 4 — Phases
**Ce qu'on DOIT voir :**
- [ ] Phases TA_* : Atterrissage, Roulage, Calage, Passerelle, Debarquement, Dechargement, Livraison bagages, Nettoyage, Avitaillement, **TA_CHECKIN**, Chargement soute, **TA_BOARDING**, Fermeture, Repoussage
- [ ] Phases ARR_* et DEP_* (le TA charge tout)
- [ ] Phases COM_*

**Phases DEADLINE sur TA :**
- [ ] TA_CHECKIN : meme comportement que DEP_CHECKIN (heures calculees depuis ETD)
- [ ] TA_BOARDING : meme comportement que DEP_BOARDING

**Sync Horaire TA :**
- [ ] TA_CHECKIN demarre → `Horaire.ouvertureComptoirAt` synchronise
- [ ] TA_BOARDING termine → `Horaire.fermetureGateAt` synchronise

---

## PARTIE E — ALERTES ET NOTIFICATIONS

### E1. SLA Countdown temps reel
- [ ] Ouvrir un CRV Depart dont le vol est dans ~1h
- [ ] Observer Step 4 : les phases DEADLINE montrent un countdown actif
- [ ] Attendre 10 secondes : verifier que le timer change (se met a jour chaque seconde)
- [ ] Quand le countdown passe en warning (jaune) : verifier visuellement
- [ ] Quand le countdown passe en critical (orange) : verifier visuellement
- [ ] Quand le countdown atteint 0 et depasse : verifier rouge pulsant + texte "retard"

### E2. Notifications in-app
- [ ] Quand un SLA est depasse (cron 5min) : verifier notification dans la cloche
- [ ] Cliquer la notification : verifier le lien amene au CRV concerne

### E3. Emails proactifs
- [ ] Quand SLA atteint CRITICAL ou EXCEEDED : verifier qu'un email est envoye
- [ ] Destinataire : le createur du CRV (Personne.email)
- [ ] Si pas de provider email configure : verifier log console "[SLA][EMAIL] Envoi email echoue (non-bloquant)"

### E4. Vols sans CRV
- [ ] Avoir un vol dans le bulletin du jour, dans les 3 prochaines heures, SANS CRV cree
- [ ] Attendre le cron (15min) ou forcer manuellement
- [ ] Verifier : notification envoyee aux SUPERVISEUR et MANAGER
- [ ] Titre : "Vol XXX sans CRV"
- [ ] Message : contient le numero de vol et le type d'operation

---

## PARTIE F — PROTECTION API (ARRIVEE)

### F1. Endpoint boarding sur ARRIVEE
- [ ] Tenter : `PUT /api/crv/:arriveeId/horodatages-boarding` avec body `{ debutBoardingAt: "2026-03-25T10:00:00Z" }`
- [ ] Verifier : reponse 400 "Operations boarding non applicables a un CRV Arrivee"

### F2. Endpoint check-in sur ARRIVEE
- [ ] Tenter : `PUT /api/crv/:arriveeId/horodatages-checkin` avec body `{ ouvertureComptoirAt: "2026-03-25T08:00:00Z" }`
- [ ] Verifier : reponse 400 "Operations check-in non applicables a un CRV Arrivee"

### F3. Endpoint boarding sur DEPART (positif)
- [ ] Tenter : `PUT /api/crv/:departId/horodatages-boarding` avec body valide
- [ ] Verifier : reponse 200 success

---

## PARTIE G — TRACABILITE BOUT EN BOUT (Exemple : Boarding Depart)

Suivre UNE donnee de bout en bout : **debutBoardingAt**

| Etape | Quoi verifier | Comment |
|---|---|---|
| 1. Manager config | `boarding.debut = 40` | GET /api/sla/compagnies/3O |
| 2. CRV creation | Horaire cree, debutBoardingAt = null | GET /api/crv/:id → horaire |
| 3. Phase init | DEP_BOARDING.heureDebutPrevue = ETD - 40min | GET /api/phases?crvId=xxx → trouver DEP_BOARDING |
| 4. Frontend affiche | SLACountdown montre countdown vers heureDebutPrevue | Observer Step 4 |
| 5. Agent demarre phase | Click "Saisir les heures", heure debut = 13h25 | Observer UI |
| 6. API appel | PUT /api/crv/:id/phases/:phaseId avec heureDebutReelle | Inspecter Network |
| 7. Sync Horaire | Horaire.debutBoardingAt = 13h25 | GET /api/crv/:id → horaire.debutBoardingAt |
| 8. SLACountdown MAJ | Countdown bascule vers heureFinPrevue | Observer UI |
| 9. Agent termine phase | Heure fin = 13h42 | Observer UI |
| 10. Sync Horaire | Horaire.fermetureGateAt = 13h42 | GET /api/crv/:id → horaire.fermetureGateAt |
| 11. SLA calcul | Boarding SLA OK ou depasse selon ecart | Observer indicateur SLA |
| 12. Si depasse | Notification in-app + email | Verifier cloche + boite mail |

---

## PARTIE H — CAS LIMITES

### H1. CRV sans bulletin (hors programme)
- [ ] Creer un CRV DEPART hors programme (pas de bulletin)
- [ ] Verifier : Horaire cree avec heureDecollagePrevue = null
- [ ] Verifier : phases DEADLINE (DEP_CHECKIN, DEP_BOARDING) n'ont PAS de heureDebutPrevue (pas d'ETD)
- [ ] Verifier : SLACountdown affiche rien (pas de deadline calculable)

### H2. Phase non commencee mais deadline depassee
- [ ] Avoir un CRV Depart avec ETD dans le passe
- [ ] Ouvrir Step 4
- [ ] Verifier : DEP_CHECKIN affiche "+Xm retard ouverture" en rouge pulsant
- [ ] Verifier : DEP_BOARDING affiche "+Xm retard ouverture" en rouge pulsant

### H3. Navigation libre entre etapes
- [ ] Ouvrir Step 1 → aller Step 4 → revenir Step 2 → aller Step 7
- [ ] Verifier : aucun blocage a aucune etape
- [ ] Verifier : les donnees saisies sont conservees a chaque retour

### H4. CRV verrouille
- [ ] Ouvrir un CRV VERROUILLE
- [ ] Verifier : tous les champs sont en lecture seule
- [ ] Verifier : les boutons d'action sont caches
- [ ] Verifier : le SLACountdown n'apparait PAS (phase terminee)

### H5. Role QUALITE
- [ ] Se connecter en QUALITE
- [ ] Ouvrir un CRV
- [ ] Verifier : mode lecture seule, pas de bouton "Nouveau CRV"
- [ ] Verifier : banniere rouge "Mode lecture seule"

---

## RESUME DES VERIFICATIONS PAR TYPE

| Verification | Arrivee | Depart | TurnAround |
|---|---|---|---|
| Horaires prevus Step 1 | Atterrissage | Atterrissage + Decollage | Atterrissage + Decollage |
| Boarding dans Step 1 | NON | NON | NON |
| Check-in dans Step 1 | NON | NON | NON |
| Phase DEP_CHECKIN | NON | OUI | OUI (TA_CHECKIN) |
| Phase DEP_BOARDING | NON | OUI | OUI (TA_BOARDING) |
| SLA Countdown DEADLINE | NON | OUI (checkin+boarding) | OUI (checkin+boarding) |
| SLA Countdown DUREE | OUI (toutes phases) | OUI (toutes phases) | OUI (toutes phases) |
| Sync Horaire | NON | OUI | OUI |
| Gate Step 4 | Libre | Libre | Libre |
| Navigation Steps | Libre | Libre | Libre |
| Charges EMBARQ+DEBARQ | Les deux | Les deux | Les deux |

---

## COMMANDE SEED REQUISE AVANT TEST

```bash
cd Back && node src/utils/seedPhases.js --force-reset
```

Sans cette commande, les nouvelles phases (DEP_CHECKIN, DEP_BOARDING, TA_CHECKIN, TA_BOARDING) n'existent pas en base et les tests echoueront.
