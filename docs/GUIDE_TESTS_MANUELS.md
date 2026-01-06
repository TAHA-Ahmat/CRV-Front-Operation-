# Guide de Tests Manuels - Application CRV

## Introduction

Ce document décrit les processus de test par profil utilisateur pour valider l'application CRV (Compte Rendu de Vol). Chaque section correspond à un profil avec ses scénarios de test détaillés.

**Ordre de test recommandé:**
1. ADMIN (créer les utilisateurs d'abord)
2. AGENT_ESCALE (créer les CRV)
3. SUPERVISEUR (valider les CRV)
4. MANAGER (gérer les cas spéciaux)
5. QUALITE (auditer)

---

## 1. PROFIL ADMIN - Gestion des Utilisateurs

### 1.1 Données de Test

**Compte Admin:**
```
Email: admin@airport.sn
Mot de passe: Admin2024!
```

**Utilisateurs à créer:**
| Nom | Prénom | Email | Rôle | Matricule |
|-----|--------|-------|------|-----------|
| Diallo | Amadou | amadou.diallo@airport.sn | AGENT_ESCALE | AGT-001 |
| Faye | Mariama | mariama.faye@airport.sn | AGENT_ESCALE | AGT-002 |
| Sarr | Ousmane | ousmane.sarr@airport.sn | CHEF_EQUIPE | CHF-001 |
| Ndiaye | Fatou | fatou.ndiaye@airport.sn | SUPERVISEUR | SUP-001 |
| Diop | Moussa | moussa.diop@airport.sn | MANAGER | MGR-001 |
| Sow | Aissatou | aissatou.sow@airport.sn | QUALITE | QUA-001 |

---

### 1.2 Scénario: Connexion Admin

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Ouvrir l'application | Page de connexion affichée | ☐ |
| 2 | Saisir email: `admin@airport.sn` | Champ rempli | ☐ |
| 3 | Saisir mot de passe: `Admin2024!` | Champ rempli (masqué) | ☐ |
| 4 | Cliquer "Se connecter" | Redirection vers Dashboard Admin | ☐ |
| 5 | Vérifier le menu | Menu "Gestion Utilisateurs" visible | ☐ |
| 6 | Vérifier le header | Nom "Admin" affiché + rôle ADMIN | ☐ |

---

### 1.3 Scénario: Créer un Agent d'Escale

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Cliquer "Gestion Utilisateurs" | Liste des utilisateurs affichée | ☐ |
| 2 | Cliquer "Nouvel Utilisateur" | Formulaire de création ouvert | ☐ |
| 3 | Remplir: Nom = "Diallo" | Champ validé | ☐ |
| 4 | Remplir: Prénom = "Amadou" | Champ validé | ☐ |
| 5 | Remplir: Email = "amadou.diallo@airport.sn" | Format email validé | ☐ |
| 6 | Sélectionner: Fonction = "Agent d'Escale" | Option sélectionnée | ☐ |
| 7 | Remplir: Matricule = "AGT-001" | Champ validé | ☐ |
| 8 | Cliquer "Créer" | Message succès + mot de passe temporaire affiché | ☐ |
| 9 | Noter le mot de passe temporaire | Mot de passe noté pour tests suivants | ☐ |
| 10 | Vérifier la liste | Nouvel utilisateur dans la liste | ☐ |

**Répéter pour chaque utilisateur du tableau 1.1**

---

### 1.4 Scénario: Modifier un Utilisateur

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Dans la liste, trouver "Amadou Diallo" | Ligne trouvée | ☐ |
| 2 | Cliquer sur l'icône "Modifier" | Formulaire de modification ouvert | ☐ |
| 3 | Modifier: Matricule = "AGT-2024-001" | Champ modifié | ☐ |
| 4 | Cliquer "Enregistrer" | Message succès | ☐ |
| 5 | Vérifier la liste | Matricule mis à jour | ☐ |

---

### 1.5 Scénario: Désactiver/Réactiver un Utilisateur

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Trouver l'utilisateur "Test" (créer si besoin) | Ligne trouvée | ☐ |
| 2 | Cliquer "Désactiver" | Confirmation demandée | ☐ |
| 3 | Confirmer | Statut passe à "Inactif" | ☐ |
| 4 | Tenter connexion avec ce compte | Connexion refusée "Compte désactivé" | ☐ |
| 5 | Revenir en Admin, cliquer "Réactiver" | Statut passe à "Actif" | ☐ |
| 6 | Retenter connexion | Connexion réussie | ☐ |

---

### 1.6 Scénario: Recherche et Filtres

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Saisir "Diallo" dans recherche | Liste filtrée sur "Diallo" | ☐ |
| 2 | Effacer et sélectionner filtre "SUPERVISEUR" | Seuls les superviseurs affichés | ☐ |
| 3 | Sélectionner filtre "Actifs uniquement" | Utilisateurs inactifs masqués | ☐ |
| 4 | Cliquer "Réinitialiser filtres" | Tous les utilisateurs affichés | ☐ |

---

### 1.7 Vérifications Admin

| Vérification | Attendu | ✓ |
|--------------|---------|---|
| Admin ne voit PAS le menu "CRV" | Menu absent | ☐ |
| Admin ne peut PAS créer de CRV | Pas d'accès | ☐ |
| Admin voit les statistiques utilisateurs | Dashboard avec compteurs | ☐ |
| Admin peut exporter la liste | Bouton export fonctionnel | ☐ |

---

## 2. PROFIL AGENT D'ESCALE - Création CRV

### 2.1 Données de Test

**Compte Agent:**
```
Email: amadou.diallo@airport.sn
Mot de passe: [mot de passe temporaire ou changé]
```

**Vol de test ARRIVÉE:**
```
Numéro: AF123
Compagnie: Air France
Type: ARRIVÉE
Origine: Paris CDG
Destination: Dakar DSS
Avion: Boeing 737-800 (F-GZHA)
Heure prévue: 14:30
```

**Vol de test DÉPART:**
```
Numéro: SN205
Compagnie: Brussels Airlines
Type: DÉPART
Origine: Dakar DSS
Destination: Bruxelles BRU
Avion: Airbus A330-300 (OO-SFC)
Heure prévue: 23:45
```

**Vol de test TURN AROUND:**
```
Numéro: ET908
Compagnie: Ethiopian Airlines
Type: TURN_AROUND
Origine: Addis Abeba ADD
Escale: Dakar DSS
Destination: New York JFK
Avion: Boeing 787-8 (ET-AOP)
Arrivée: 08:30 | Départ: 11:00
```

---

### 2.2 Scénario: Première Connexion Agent

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Saisir email: `amadou.diallo@airport.sn` | Champ rempli | ☐ |
| 2 | Saisir mot de passe temporaire | Champ rempli | ☐ |
| 3 | Cliquer "Se connecter" | Redirection vers changement mot de passe | ☐ |
| 4 | Saisir nouveau mot de passe | Validation règles (8 car, maj, chiffre) | ☐ |
| 5 | Confirmer le mot de passe | Mots de passe identiques | ☐ |
| 6 | Valider | Redirection vers Dashboard Agent | ☐ |
| 7 | Vérifier le header | "Amadou Diallo - Agent d'Escale" | ☐ |

---

### 2.3 Scénario: CRV ARRIVÉE Complet (AF123)

#### Phase 1: Création du CRV

| Étape | Action | Résultat Attendu | Complétude | ✓ |
|-------|--------|------------------|------------|---|
| 1 | Cliquer "Nouveau CRV" | Formulaire de sélection vol | - | ☐ |
| 2 | Rechercher "AF123" | Vol AF123 trouvé | - | ☐ |
| 3 | Sélectionner le vol | Détails du vol affichés | - | ☐ |
| 4 | Vérifier type = ARRIVÉE | Type correct | - | ☐ |
| 5 | Cliquer "Créer CRV" | CRV créé, numéro affiché (ex: CRV-2024-0001) | **0%** | ☐ |
| 6 | Vérifier les phases | 5 phases listées (non démarrées) | 0% | ☐ |

#### Phase 2: Positionnement Passerelle

| Étape | Action | Résultat Attendu | Complétude | ✓ |
|-------|--------|------------------|------------|---|
| 1 | Trouver phase "Positionnement passerelle" | Phase visible, statut "Non démarré" | 0% | ☐ |
| 2 | Cliquer "Démarrer" | Heure début enregistrée, statut "En cours" | 5% | ☐ |
| 3 | Attendre (simuler travail) | Phase toujours "En cours" | 5% | ☐ |
| 4 | Cliquer "Terminer" | Heure fin enregistrée, durée calculée | **10%** | ☐ |
| 5 | Vérifier la barre de progression | 10% affiché | 10% | ☐ |

#### Phase 3: Calage Avion

| Étape | Action | Résultat Attendu | Complétude | ✓ |
|-------|--------|------------------|------------|---|
| 1 | Trouver phase "Calage avion" | Phase visible | 10% | ☐ |
| 2 | Démarrer la phase | Statut "En cours" | 12% | ☐ |
| 3 | Terminer la phase | Statut "Terminé" | **15%** | ☐ |

#### Phase 4: Débarquement Passagers

| Étape | Action | Résultat Attendu | Complétude | ✓ |
|-------|--------|------------------|------------|---|
| 1 | Trouver phase "Débarquement passagers" | Phase visible | 15% | ☐ |
| 2 | Démarrer la phase | Heure début = 14:36 | 18% | ☐ |
| 3 | Terminer la phase | Heure fin = 14:52, Durée = 16 min | **25%** | ☐ |

#### Phase 5: Déchargement Bagages

| Étape | Action | Résultat Attendu | Complétude | ✓ |
|-------|--------|------------------|------------|---|
| 1 | Démarrer "Déchargement bagages" | En cours | 30% | ☐ |
| 2 | Terminer la phase | Terminé, durée ~22 min | **40%** | ☐ |

#### Phase 6: Saisie Passagers

| Étape | Action | Résultat Attendu | Complétude | ✓ |
|-------|--------|------------------|------------|---|
| 1 | Cliquer "Ajouter Charge" | Formulaire charges ouvert | 40% | ☐ |
| 2 | Type = "PASSAGERS" | Sélectionné | 40% | ☐ |
| 3 | Sens = "DEBARQUEMENT" | Sélectionné | 40% | ☐ |
| 4 | Adultes = 145 | Saisi | 40% | ☐ |
| 5 | Enfants = 18 | Saisi | 40% | ☐ |
| 6 | Bébés = 5 | Saisi | 40% | ☐ |
| 7 | Vérifier Total = 168 | Calcul automatique | 40% | ☐ |
| 8 | Valider | Charge enregistrée | **55%** | ☐ |

#### Phase 7: Saisie Bagages

| Étape | Action | Résultat Attendu | Complétude | ✓ |
|-------|--------|------------------|------------|---|
| 1 | Ajouter Charge type "BAGAGES" | Formulaire ouvert | 55% | ☐ |
| 2 | Sens = "DEBARQUEMENT" | Sélectionné | 55% | ☐ |
| 3 | Bagages soute = 185 | Saisi | 55% | ☐ |
| 4 | Poids soute = 2775 kg | Saisi | 55% | ☐ |
| 5 | Bagages cabine = 10 | Saisi | 55% | ☐ |
| 6 | Valider | Charge enregistrée | **70%** | ☐ |

#### Phase 8: Fret (Non Applicable)

| Étape | Action | Résultat Attendu | Complétude | ✓ |
|-------|--------|------------------|------------|---|
| 1 | Trouver phase "Déchargement fret" | Phase visible | 70% | ☐ |
| 2 | Cliquer "Non Réalisé" ou "N/A" | Motif demandé | 70% | ☐ |
| 3 | Sélectionner "Pas de fret sur ce vol" | Motif enregistré | 70% | ☐ |
| 4 | Valider | Phase marquée "Non Réalisé" | **80%** | ☐ |
| 5 | **VÉRIFIER: Seuil 80% atteint** | Badge "Éligible validation" | 80% | ☐ |

#### Phase 9: Observation

| Étape | Action | Résultat Attendu | Complétude | ✓ |
|-------|--------|------------------|------------|---|
| 1 | Cliquer "Ajouter Observation" | Formulaire ouvert | 80% | ☐ |
| 2 | Catégorie = "GENERALE" | Sélectionné | 80% | ☐ |
| 3 | Texte = "Vol arrivé à l'heure. Débarquement et déchargement sans incident." | Saisi | 80% | ☐ |
| 4 | Valider | Observation enregistrée avec auteur + date | **90%** | ☐ |

#### Phase 10: Vérification Finale

| Vérification | Attendu | ✓ |
|--------------|---------|---|
| Complétude finale | 90% (≥ 80%) | ☐ |
| Statut CRV | "TERMINE" ou "EN_ATTENTE_VALIDATION" | ☐ |
| Badge "Éligible validation" | Visible | ☐ |
| Bouton "Valider" | **ABSENT** (agent ne peut pas valider) | ☐ |
| Récapitulatif phases | 5/5 traitées | ☐ |
| Récapitulatif charges | Passagers: 168, Bagages: 195 | ☐ |

---

### 2.4 Scénario: CRV DÉPART (SN205)

#### Résumé des Étapes

| Phase | Action | Complétude Cible | ✓ |
|-------|--------|------------------|---|
| 1 | Créer CRV DÉPART SN205 | 0% | ☐ |
| 2 | Phase "Préparation cabine" | 10% | ☐ |
| 3 | Phase "Embarquement passagers" (30 min) | 25% | ☐ |
| 4 | Phase "Chargement bagages" | 35% | ☐ |
| 5 | Phase "Chargement fret" | 45% | ☐ |
| 6 | Saisie Passagers embarqués (265) | 60% | ☐ |
| 7 | Saisie Bagages chargés (320) | 72% | ☐ |
| 8 | Saisie Fret (1200 kg) | **82%** (seuil atteint) | ☐ |
| 9 | Phase "Fermeture soutes" | 85% | ☐ |
| 10 | Phase "Push-back" | 88% | ☐ |
| 11 | Observation de clôture | **95%** | ☐ |

#### Charges à Saisir (DÉPART)

**Passagers EMBARQUEMENT:**
```
Adultes: 230
Enfants: 28
Bébés: 7
Total: 265
```

**Bagages EMBARQUEMENT:**
```
Soute: 295 pièces
Poids soute: 4720 kg
Cabine: 25 pièces
Total: 320
```

**Fret EMBARQUEMENT:**
```
Colis: 45
Poids: 1200 kg (1.2 tonnes)
```

---

### 2.5 Scénario: CRV TURN AROUND (ET908)

#### Particularité Turn Around
- Combine ARRIVÉE + ESCALE + DÉPART
- 12 phases au total
- Charges en DEBARQUEMENT et EMBARQUEMENT

#### Résumé des Étapes

| Groupe | Phase | Action | Complétude | ✓ |
|--------|-------|--------|------------|---|
| **ARRIVÉE** | 1 | Positionnement | 5% | ☐ |
| | 2 | Calage | 8% | ☐ |
| | 3 | Débarquement pax | 12% | ☐ |
| | 4 | Déchargement bagages | 18% | ☐ |
| | - | Saisie pax débarqués (180) | 25% | ☐ |
| | - | Saisie bagages déchargés (210) | **32%** | ☐ |
| **ESCALE** | 5 | Nettoyage cabine | 38% | ☐ |
| | 6 | Avitaillement carburant | 42% | ☐ |
| | 7 | Catering | 46% | ☐ |
| | 8 | Maintenance transit | **50%** | ☐ |
| **DÉPART** | 9 | Embarquement pax | 58% | ☐ |
| | 10 | Chargement bagages | 65% | ☐ |
| | - | Saisie pax embarqués (262) | 75% | ☐ |
| | - | Saisie bagages chargés (340) | **85%** | ☐ |
| | 11 | Fermeture soutes | 88% | ☐ |
| | 12 | Push-back | 90% | ☐ |
| | - | Observation | **95%** | ☐ |

---

### 2.6 Scénario: Ajout Événement Imprévu

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Pendant une phase, cliquer "Événement" | Formulaire événement | ☐ |
| 2 | Type = "INCIDENT" | Sélectionné | ☐ |
| 3 | Gravité = "MINEUR" | Sélectionné | ☐ |
| 4 | Description = "Passager avec problème de billet" | Saisi | ☐ |
| 5 | Valider | Événement horodaté enregistré | ☐ |
| 6 | Vérifier dans historique | Événement visible avec heure | ☐ |

---

### 2.7 Vérifications Agent

| Vérification | Attendu | ✓ |
|--------------|---------|---|
| Agent voit ses CRV uniquement | Liste filtrée | ☐ |
| Agent ne peut PAS valider | Bouton absent | ☐ |
| Agent ne peut PAS supprimer un CRV validé | Action bloquée | ☐ |
| Agent peut modifier un CRV en cours | Modification possible | ☐ |
| Agent ne voit PAS le menu "Utilisateurs" | Menu absent | ☐ |

---

## 3. PROFIL SUPERVISEUR - Validation CRV

### 3.1 Données de Test

**Compte Superviseur:**
```
Email: fatou.ndiaye@airport.sn
Mot de passe: [défini lors création]
```

**Prérequis:** Au moins 2 CRV créés par les agents avec complétude ≥ 80%

---

### 3.2 Scénario: Connexion Superviseur

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Se connecter avec compte superviseur | Dashboard Superviseur | ☐ |
| 2 | Vérifier le menu | "Validation CRV" visible | ☐ |
| 3 | Vérifier compteur | "X CRV en attente de validation" | ☐ |

---

### 3.3 Scénario: Consulter CRV en Attente

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Cliquer "Validation CRV" | Liste des CRV ≥ 80% | ☐ |
| 2 | Vérifier colonnes | Numéro, Vol, Agent, Complétude, Date | ☐ |
| 3 | Filtrer par date | Filtrage fonctionnel | ☐ |
| 4 | Filtrer par compagnie | Filtrage fonctionnel | ☐ |
| 5 | Trier par complétude | Tri fonctionnel | ☐ |

---

### 3.4 Scénario: Valider un CRV Complet

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Sélectionner CRV AF123 (90%) | Détails affichés | ☐ |
| 2 | Consulter récapitulatif phases | Toutes terminées/N/A | ☐ |
| 3 | Consulter charges | Passagers + Bagages renseignés | ☐ |
| 4 | Consulter observations | Au moins 1 observation | ☐ |
| 5 | Cliquer "Valider" | Confirmation demandée | ☐ |
| 6 | Ajouter commentaire (optionnel) | "RAS, validation OK" | ☐ |
| 7 | Confirmer validation | **Statut → VALIDE** | ☐ |
| 8 | Vérifier horodatage | Date + heure + nom validateur | ☐ |
| 9 | Retourner à la liste | CRV disparu de la liste "en attente" | ☐ |

---

### 3.5 Scénario: Rejeter un CRV Incomplet

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Trouver un CRV avec données manquantes | CRV identifié | ☐ |
| 2 | Consulter les lacunes | Identifier ce qui manque | ☐ |
| 3 | Cliquer "Rejeter" | Formulaire motif obligatoire | ☐ |
| 4 | Saisir motif = "Observation manquante" | Motif saisi | ☐ |
| 5 | Confirmer le rejet | **Statut → REJETE** | ☐ |
| 6 | Vérifier notification agent | Agent notifié (si système notif) | ☐ |
| 7 | Vérifier que l'agent peut corriger | CRV modifiable par agent | ☐ |

---

### 3.6 Scénario: Validation avec Demande de Correction

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Consulter un CRV | Détails affichés | ☐ |
| 2 | Identifier une erreur mineure | Ex: faute d'orthographe observation | ☐ |
| 3 | Cliquer "Demander correction" | Formulaire commentaire | ☐ |
| 4 | Saisir "Corriger orthographe observation" | Demande saisie | ☐ |
| 5 | Envoyer | Statut → "CORRECTION_DEMANDEE" | ☐ |
| 6 | CRV réapparaît chez l'agent | Agent peut modifier | ☐ |

---

### 3.7 Scénario: Supervision Équipe

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Accéder au tableau de bord | Dashboard superviseur | ☐ |
| 2 | Voir CRV par agent | Répartition visible | ☐ |
| 3 | Voir statistiques | Nb validés, rejetés, en attente | ☐ |
| 4 | Filtrer par agent | CRV d'un agent spécifique | ☐ |
| 5 | Exporter rapport | Export PDF/Excel | ☐ |

---

### 3.8 Vérifications Superviseur

| Vérification | Attendu | ✓ |
|--------------|---------|---|
| Superviseur voit CRV de tous les agents | Accès complet | ☐ |
| Superviseur ne peut PAS créer de CRV | Action bloquée | ☐ |
| Superviseur ne peut PAS modifier un CRV | Lecture seule | ☐ |
| Superviseur ne peut PAS déverrouiller | Action réservée Manager | ☐ |
| Superviseur peut valider/rejeter | Actions disponibles | ☐ |

---

## 4. PROFIL MANAGER - Déverrouillage et Correction

### 4.1 Données de Test

**Compte Manager:**
```
Email: moussa.diop@airport.sn
Mot de passe: [défini lors création]
```

**Prérequis:** Au moins 1 CRV validé à déverrouiller

---

### 4.2 Scénario: Connexion Manager

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Se connecter avec compte manager | Dashboard Manager | ☐ |
| 2 | Vérifier le menu | "Gestion CRV" + "Déverrouillage" visible | ☐ |
| 3 | Voir tous les CRV | Accès complet à tous les CRV | ☐ |

---

### 4.3 Scénario: Déverrouiller un CRV Validé

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Trouver CRV AF123 (statut VALIDE) | CRV trouvé | ☐ |
| 2 | Cliquer "Déverrouiller" | Formulaire motif obligatoire | ☐ |
| 3 | Saisir motif = "Erreur nombre passagers signalée par compagnie" | Motif saisi | ☐ |
| 4 | Confirmer | **Statut → DEVERROUILLE** | ☐ |
| 5 | Vérifier historique | Action tracée avec date/heure/utilisateur | ☐ |

---

### 4.4 Scénario: Corriger un CRV Déverrouillé

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Ouvrir CRV déverrouillé | Mode édition disponible | ☐ |
| 2 | Modifier charge passagers: 168 → 170 | Valeur modifiée | ☐ |
| 3 | Ajouter observation correction | "Correction passagers: 168→170 (erreur pointage)" | ☐ |
| 4 | Sauvegarder | Modifications enregistrées | ☐ |
| 5 | Vérifier historique modifications | Trace de la modification | ☐ |

---

### 4.5 Scénario: Reverrouiller après Correction

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Après corrections, cliquer "Reverrouiller" | Confirmation demandée | ☐ |
| 2 | Ajouter commentaire = "Corrections effectuées" | Commentaire saisi | ☐ |
| 3 | Confirmer | **Statut → VALIDE** (re-verrouillé) | ☐ |
| 4 | Vérifier que le CRV n'est plus modifiable | Lecture seule | ☐ |

---

### 4.6 Scénario: Annuler un CRV (Cas Extrême)

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Identifier CRV erroné (ex: mauvais vol) | CRV identifié | ☐ |
| 2 | Cliquer "Annuler CRV" | **Attention: Action irréversible** | ☐ |
| 3 | Saisir motif = "CRV créé sur mauvais vol" | Motif obligatoire | ☐ |
| 4 | Double confirmation | Demande de confirmation | ☐ |
| 5 | Valider | **Statut → ANNULE** | ☐ |
| 6 | Vérifier que CRV est visible mais non modifiable | Archivé | ☐ |

---

### 4.7 Scénario: Rapport d'Activité

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Accéder aux rapports | Interface rapports | ☐ |
| 2 | Sélectionner période (ex: semaine) | Dates sélectionnées | ☐ |
| 3 | Générer rapport | Rapport avec: nb CRV, temps moyen, incidents | ☐ |
| 4 | Voir détail par agent | Performance par agent | ☐ |
| 5 | Exporter rapport | Export PDF/Excel | ☐ |

---

### 4.8 Vérifications Manager

| Vérification | Attendu | ✓ |
|--------------|---------|---|
| Manager peut tout voir | Accès total lecture | ☐ |
| Manager peut déverrouiller/reverrouiller | Actions disponibles | ☐ |
| Manager peut modifier CRV déverrouillés | Édition possible | ☐ |
| Manager peut annuler un CRV | Action disponible | ☐ |
| Manager ne peut PAS supprimer définitivement | Pas de suppression physique | ☐ |
| Toutes actions tracées | Historique complet | ☐ |

---

## 5. PROFIL QUALITÉ - Audit et Lecture Seule

### 5.1 Données de Test

**Compte Qualité:**
```
Email: aissatou.sow@airport.sn
Mot de passe: [défini lors création]
```

---

### 5.2 Scénario: Connexion Qualité

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Se connecter avec compte qualité | Dashboard Qualité | ☐ |
| 2 | Vérifier le menu | "Consultation CRV" + "Rapports" | ☐ |
| 3 | Vérifier absence création | Pas de bouton "Nouveau CRV" | ☐ |

---

### 5.3 Scénario: Consultation Sans Modification

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Accéder à la liste des CRV | Tous les CRV visibles | ☐ |
| 2 | Ouvrir un CRV | Détails affichés en **lecture seule** | ☐ |
| 3 | Vérifier absence boutons action | Pas de "Modifier", "Valider", "Supprimer" | ☐ |
| 4 | Consulter phases | Visualisation OK, pas d'action | ☐ |
| 5 | Consulter charges | Visualisation OK, pas d'action | ☐ |
| 6 | Consulter observations | Visualisation OK, pas d'ajout | ☐ |
| 7 | Consulter historique | Toutes les actions visibles | ☐ |

---

### 5.4 Scénario: Recherche Avancée

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Rechercher par numéro CRV | Résultat trouvé | ☐ |
| 2 | Rechercher par numéro vol | Résultats trouvés | ☐ |
| 3 | Filtrer par compagnie | Filtrage OK | ☐ |
| 4 | Filtrer par période | Filtrage OK | ☐ |
| 5 | Filtrer par statut | Filtrage OK | ☐ |
| 6 | Filtrer par agent | Filtrage OK | ☐ |
| 7 | Combiner plusieurs filtres | Filtres cumulatifs | ☐ |
| 8 | Sauvegarder recherche (si disponible) | Recherche sauvegardée | ☐ |

---

### 5.5 Scénario: Export Données Audit

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Sélectionner période d'audit | Dates sélectionnées | ☐ |
| 2 | Choisir critères export | Options disponibles | ☐ |
| 3 | Exporter en Excel | Fichier Excel téléchargé | ☐ |
| 4 | Vérifier contenu | Toutes colonnes présentes | ☐ |
| 5 | Exporter en PDF | Fichier PDF téléchargé | ☐ |
| 6 | Vérifier mise en forme | Rapport lisible | ☐ |

---

### 5.6 Scénario: Statistiques Globales

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Accéder au dashboard statistiques | Graphiques affichés | ☐ |
| 2 | Voir nombre total CRV | Compteur visible | ☐ |
| 3 | Voir répartition par statut | Graphique camembert | ☐ |
| 4 | Voir évolution temporelle | Graphique courbe | ☐ |
| 5 | Voir temps moyen traitement | Indicateur visible | ☐ |
| 6 | Voir taux de validation | Pourcentage affiché | ☐ |
| 7 | Comparer périodes | Comparaison possible | ☐ |

---

### 5.7 Scénario: Audit Trail (Piste d'Audit)

| Étape | Action | Résultat Attendu | ✓ |
|-------|--------|------------------|---|
| 1 | Ouvrir un CRV spécifique | CRV ouvert | ☐ |
| 2 | Accéder à l'onglet "Historique" | Historique complet | ☐ |
| 3 | Voir création | Date, heure, utilisateur | ☐ |
| 4 | Voir chaque modification | Détail des changements | ☐ |
| 5 | Voir validation | Validateur, date, commentaire | ☐ |
| 6 | Voir déverrouillage (si applicable) | Motif, utilisateur | ☐ |
| 7 | Exporter historique | Export possible | ☐ |

---

### 5.8 Vérifications Qualité

| Vérification | Attendu | ✓ |
|--------------|---------|---|
| Qualité voit TOUS les CRV | Accès total lecture | ☐ |
| Qualité ne peut PAS créer | Action bloquée | ☐ |
| Qualité ne peut PAS modifier | Lecture seule | ☐ |
| Qualité ne peut PAS valider | Action bloquée | ☐ |
| Qualité ne peut PAS supprimer | Action bloquée | ☐ |
| Qualité peut exporter | Export disponible | ☐ |
| Qualité voit historique complet | Traçabilité totale | ☐ |

---

## 6. Tests Transversaux

### 6.1 Sécurité et Permissions

| Test | Action | Résultat Attendu | ✓ |
|------|--------|------------------|---|
| URL directe sans auth | Accéder à /crv/123 sans connexion | Redirection login | ☐ |
| Token expiré | Attendre expiration token | Déconnexion automatique | ☐ |
| Accès URL interdit | Agent accède /admin/users | Page 403 ou redirection | ☐ |
| Manipulation API | Appel API sans permission | Erreur 403 | ☐ |

---

### 6.2 Ergonomie et UX

| Test | Action | Résultat Attendu | ✓ |
|------|--------|------------------|---|
| Responsive mobile | Ouvrir sur mobile | Interface adaptée | ☐ |
| Responsive tablette | Ouvrir sur tablette | Interface adaptée | ☐ |
| Navigation clavier | Tab + Enter | Navigation possible | ☐ |
| Messages erreur | Saisie invalide | Message clair | ☐ |
| Messages succès | Action réussie | Confirmation visible | ☐ |
| Chargement | Action longue | Indicateur de chargement | ☐ |

---

### 6.3 Performance

| Test | Action | Résultat Attendu | ✓ |
|------|--------|------------------|---|
| Chargement liste 100 CRV | Afficher liste | < 3 secondes | ☐ |
| Recherche | Rechercher "AF" | < 1 seconde | ☐ |
| Création CRV | Créer un CRV | < 2 secondes | ☐ |
| Validation | Valider un CRV | < 1 seconde | ☐ |

---

### 6.4 Données

| Test | Action | Résultat Attendu | ✓ |
|------|--------|------------------|---|
| Données vides | Nouveau compte sans CRV | Message "Aucun CRV" | ☐ |
| Données volumineuses | Liste > 1000 CRV | Pagination fonctionnelle | ☐ |
| Caractères spéciaux | Observation avec accents | Enregistrement OK | ☐ |
| Valeurs limites | Passagers = 0 | Accepté ou message erreur | ☐ |
| Valeurs négatives | Bagages = -1 | Rejeté avec message | ☐ |

---

## 7. Checklist Finale de Validation

### Par Profil

| Profil | Connexion | Actions Métier | Permissions | Export | ✓ |
|--------|-----------|----------------|-------------|--------|---|
| ADMIN | ☐ | ☐ | ☐ | ☐ | ☐ |
| AGENT_ESCALE | ☐ | ☐ | ☐ | ☐ | ☐ |
| SUPERVISEUR | ☐ | ☐ | ☐ | ☐ | ☐ |
| MANAGER | ☐ | ☐ | ☐ | ☐ | ☐ |
| QUALITE | ☐ | ☐ | ☐ | ☐ | ☐ |

### Par Fonctionnalité

| Fonctionnalité | Testé | Validé | Commentaire |
|----------------|-------|--------|-------------|
| Authentification | ☐ | ☐ | |
| Création CRV | ☐ | ☐ | |
| Gestion Phases | ☐ | ☐ | |
| Gestion Charges | ☐ | ☐ | |
| Gestion Événements | ☐ | ☐ | |
| Gestion Observations | ☐ | ☐ | |
| Validation CRV | ☐ | ☐ | |
| Déverrouillage | ☐ | ☐ | |
| Gestion Utilisateurs | ☐ | ☐ | |
| Recherche/Filtres | ☐ | ☐ | |
| Export | ☐ | ☐ | |
| Rapports | ☐ | ☐ | |

---

## 8. Notes et Observations

### Bugs Identifiés

| # | Description | Gravité | Statut |
|---|-------------|---------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### Améliorations Suggérées

| # | Description | Priorité |
|---|-------------|----------|
| 1 | | |
| 2 | | |
| 3 | | |

### Signature Validation

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Testeur | | | |
| Chef de Projet | | | |
| Client | | | |

---

*Document généré le: [DATE]*
*Version: 1.0*
*Application: CRV - Compte Rendu de Vol*
