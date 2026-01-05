# AUDIT FINAL - PROCESSUS OPÉRATIONNEL CRV

**Version** : 1.0.0
**Date** : 2026-01-05
**Classification** : Documentation Processus - Usage Interne
**Destinataires** : Direction, Service Qualité, Auditeurs

---

## TABLE DES MATIÈRES

1. [Introduction - Logique générale du système](#1-introduction---logique-générale-du-système)
2. [Processus opérationnel complet](#2-processus-opérationnel-complet)
3. [Types de CRV existants](#3-types-de-crv-existants)
4. [Rôles et responsabilités réelles](#4-rôles-et-responsabilités-réelles)
5. [User stories métier](#5-user-stories-métier)
6. [Validation, verrouillage et annulation](#6-validation-verrouillage-et-annulation)
7. [SLA et indicateurs de performance](#7-sla-et-indicateurs-de-performance)

---

## 1. INTRODUCTION - LOGIQUE GÉNÉRALE DU SYSTÈME

### 1.1 Objectif du système CRV

Le **Compte Rendu de Vol (CRV)** est un système de traçabilité opérationnelle permettant de documenter l'ensemble des opérations d'assistance au sol pour chaque vol. Il constitue la source de vérité unique pour :

- **Traçabilité opérationnelle** : Enregistrement chronologique de toutes les phases d'assistance
- **Conformité réglementaire** : Documentation des opérations pour audits et certifications
- **Suivi qualité** : Identification des anomalies et événements
- **Analyse performance** : Mesure des temps d'exécution et indicateurs clés

### 1.2 Principe fondamental : Système fermé

Le système CRV fonctionne selon un modèle **fermé et contrôlé** :

| Caractéristique | Description |
|-----------------|-------------|
| Création de comptes | Uniquement par l'administrateur système |
| Attribution des rôles | Assignée par l'administrateur, non modifiable par l'utilisateur |
| Inscription publique | **Inexistante** - Aucun formulaire d'inscription |
| Réinitialisation mot de passe | Procédure manuelle via support |

### 1.3 Architecture fonctionnelle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTÈME CRV - VUE D'ENSEMBLE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   ARRIVÉE   │    │   DÉPART    │    │ TURN AROUND │         │
│  │     CRV     │    │     CRV     │    │     CRV     │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         └────────────┬─────┴──────────────────┘                 │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │   7 ÉTAPES    │                                  │
│              │   DE SAISIE   │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│         ┌────────────┼────────────┐                             │
│         │            │            │                             │
│    ┌────▼────┐  ┌────▼────┐  ┌───▼────┐                        │
│    │VALIDATION│  │VERROUIL.│  │ARCHIVAGE│                       │
│    │  (80%)   │  │         │  │         │                       │
│    └─────────┘  └─────────┘  └─────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Périmètre du système

Le système CRV couvre les domaines fonctionnels suivants :

| Domaine | Fonctionnalités |
|---------|-----------------|
| **Gestion des vols** | Création, modification, liaison programmes vol |
| **Opérations CRV** | Saisie des 7 étapes, gestion des phases |
| **Charges** | Passagers, bagages, fret, courrier, marchandises dangereuses |
| **Événements** | Incidents, retards, observations |
| **Programmes vol** | Création, validation, activation, suspension |
| **Configuration avions** | Gestion des versions de configuration |
| **Gestion utilisateurs** | Création, modification, désactivation (ADMIN uniquement) |
| **Statistiques** | Consultation des indicateurs de performance |

---

## 2. PROCESSUS OPÉRATIONNEL COMPLET

### 2.1 Vue d'ensemble du workflow

Le processus CRV suit un workflow linéaire en **7 étapes séquentielles** :

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      WORKFLOW CRV - 7 ÉTAPES                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐         │
│   │ 1 │───►│ 2 │───►│ 3 │───►│ 4 │───►│ 5 │───►│ 6 │───►│ 7 │         │
│   └───┘    └───┘    └───┘    └───┘    └───┘    └───┘    └───┘         │
│    │        │        │        │        │        │        │             │
│   Vol    Person.  Engins   Phases   Charges   Évén.   Valid.          │
│                                                                         │
│   ─────────────────────────────────────────────────────────────►       │
│                         PROGRESSION                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Description détaillée des étapes

#### ÉTAPE 1 : Informations du vol

**Objectif** : Identifier le vol de manière unique

| Champ | Description | Obligatoire |
|-------|-------------|-------------|
| Numéro de vol | Identifiant unique du vol (ex: AF1234) | Oui |
| Date | Date d'opération | Oui |
| Type d'appareil | Modèle de l'avion (ex: A320, B737) | Oui |
| Immatriculation | Numéro d'immatriculation de l'appareil | Oui |
| Route | Origine - Destination | Oui |
| Poste | Numéro de poste d'assistance | Oui |

#### ÉTAPE 2 : Personnel

**Objectif** : Documenter les ressources humaines mobilisées

- Liste des agents affectés à l'opération
- Fonction de chaque agent
- Horaires de présence

#### ÉTAPE 3 : Engins

**Objectif** : Tracer les équipements utilisés

- Identification des engins de piste
- Numéros d'immatriculation des véhicules
- État des équipements

#### ÉTAPE 4 : Phases

**Objectif** : Enregistrer l'exécution chronologique des opérations

Pour chaque phase, les informations suivantes sont saisies :

| Information | Description |
|-------------|-------------|
| Réalisée | Oui/Non |
| Heure de début | Timestamp de démarrage |
| Heure de fin | Timestamp de clôture |
| Observations | Remarques éventuelles |
| Raison non-réalisation | Si la phase n'est pas réalisée |

#### ÉTAPE 5 : Charges

**Objectif** : Documenter les charges transportées

| Catégorie | Données saisies |
|-----------|-----------------|
| Passagers | Adultes, enfants, bébés |
| Bagages | Nombre, poids total, bagages spéciaux |
| Fret | Nombre de colis, poids, présence de marchandises dangereuses |
| Courrier | Nombre de sacs, poids |

#### ÉTAPE 6 : Événements

**Objectif** : Signaler tout incident ou observation

- Retards et leurs causes
- Incidents techniques
- Observations diverses
- Demandes spéciales

#### ÉTAPE 7 : Validation

**Objectif** : Certifier et clôturer le CRV

| Élément | Description |
|---------|-------------|
| Validateur | Nom et fonction de la personne validant |
| Certification | Case à cocher certifiant l'exactitude des données |
| Commentaires | Remarques de clôture |
| Date de validation | Horodatage automatique |

### 2.3 États du CRV

Un CRV peut se trouver dans l'un des états suivants :

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  EN COURS    │────►│   CLÔTURÉ    │────►│   VALIDÉ     │
│  DE SAISIE   │     │              │     │  & VERROUILLÉ│
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    │
   Modifiable          Modifiable            Lecture
   Complétude <80%     Complétude ≥80%        seule
```

| État | Code | Description | Actions possibles |
|------|------|-------------|-------------------|
| En cours de saisie | `in_progress` | CRV en cours de création | Toutes modifications |
| Clôturé | `closed` | Complétude ≥ 80% atteinte | Modifications avant validation |
| Validé et verrouillé | `validated` | Certifié par un responsable | Lecture seule uniquement |

---

## 3. TYPES DE CRV EXISTANTS

### 3.1 Vue comparative

Le système gère **3 types de CRV** correspondant aux différents scénarios opérationnels :

| Type | Usage | Phases spécifiques |
|------|-------|-------------------|
| **CRV Arrivée** | Vol en arrivée uniquement | Déchargement, livraison bagages |
| **CRV Départ** | Vol en départ uniquement | Enregistrement, embarquement, repoussage |
| **CRV Turn Around** | Vol arrivée + départ (même appareil) | Toutes phases + transition |

### 3.2 CRV Arrivée

**Cas d'usage** : Un vol arrive à destination finale (pas de rotation prévue)

**Phases incluses** :
1. Calage avion
2. Déchargement bagages
3. Déchargement fret
4. Livraison bagages
5. Nettoyage cabine

**Phases exclues** :
- Enregistrement passagers
- Embarquement
- Repoussage

### 3.3 CRV Départ

**Cas d'usage** : Un vol part d'une origine (pas d'arrivée préalable)

**Phases incluses** :
1. Enregistrement passagers
2. Chargement bagages
3. Chargement fret
4. Embarquement passagers
5. Nettoyage cabine
6. Repoussage

**Phases exclues** :
- Déchargement bagages
- Livraison bagages
- Calage avion

### 3.4 CRV Turn Around

**Cas d'usage** : Un avion arrive puis repart (rotation complète)

**Phases incluses** - organisées en 3 blocs :

**Bloc Arrivée** :
- [Arrivée] Calage avion
- [Arrivée] Déchargement bagages
- [Arrivée] Déchargement fret
- [Arrivée] Livraison bagages

**Bloc Transition** :
- [Transition] Nettoyage cabine
- [Transition] Avitaillement
- [Transition] Contrôles techniques

**Bloc Départ** :
- [Départ] Enregistrement passagers
- [Départ] Chargement bagages
- [Départ] Chargement fret
- [Départ] Embarquement passagers
- [Départ] Repoussage

### 3.5 Matrice des phases par type

| Phase | Arrivée | Départ | Turn Around |
|-------|:-------:|:------:|:-----------:|
| Calage avion | X | - | X |
| Déchargement bagages | X | - | X |
| Déchargement fret | X | - | X |
| Livraison bagages | X | - | X |
| Nettoyage cabine | X | X | X |
| Avitaillement | - | - | X |
| Contrôles techniques | - | - | X |
| Enregistrement passagers | - | X | X |
| Chargement bagages | - | X | X |
| Chargement fret | - | X | X |
| Embarquement passagers | - | X | X |
| Repoussage | - | X | X |

---

## 4. RÔLES ET RESPONSABILITÉS RÉELLES

### 4.1 Hiérarchie des rôles

Le système définit **6 rôles** avec des responsabilités distinctes :

```
                    ┌─────────────────┐
                    │     ADMIN       │
                    │ (Hors périmètre │
                    │   opérationnel) │
                    └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PÉRIMÈTRE OPÉRATIONNEL CRV                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐                                               │
│   │   MANAGER   │ ◄─── Suppression programmes vol               │
│   └──────┬──────┘                                               │
│          │                                                      │
│   ┌──────▼──────┐                                               │
│   │ SUPERVISEUR │ ◄─── Validation programmes + Suppression CRV  │
│   └──────┬──────┘                                               │
│          │                                                      │
│   ┌──────▼──────┐                                               │
│   │CHEF D'ÉQUIPE│ ◄─── Opérations CRV standard                  │
│   └──────┬──────┘                                               │
│          │                                                      │
│   ┌──────▼──────┐                                               │
│   │AGENT ESCALE │ ◄─── Opérations CRV de base                   │
│   └─────────────┘                                               │
│                                                                 │
│   ┌─────────────┐                                               │
│   │   QUALITÉ   │ ◄─── Consultation uniquement (lecture seule)  │
│   └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Description détaillée des rôles

#### AGENT D'ESCALE (`AGENT_ESCALE`)

**Profil type** : Agent d'assistance au sol

**Responsabilités** :
- Création et modification des CRV
- Saisie des phases d'opération
- Ajout des charges (passagers, bagages, fret)
- Signalement des événements
- Gestion des vols

**Restrictions** :
- Ne peut pas supprimer de CRV
- Ne peut pas valider de programmes vol
- Ne peut pas gérer les utilisateurs

---

#### CHEF D'ÉQUIPE (`CHEF_EQUIPE`)

**Profil type** : Responsable d'équipe terrain

**Responsabilités** :
- Identiques à AGENT_ESCALE
- Supervision de l'équipe d'agents
- Coordination des opérations

**Restrictions** :
- Mêmes restrictions que AGENT_ESCALE

---

#### SUPERVISEUR (`SUPERVISEUR`)

**Profil type** : Responsable opérationnel

**Responsabilités** :
- Toutes les capacités de CHEF_EQUIPE
- **Suppression de CRV**
- **Validation des programmes vol**
- **Activation des programmes vol**

**Restrictions** :
- Ne peut pas supprimer de programmes vol
- Ne peut pas gérer les utilisateurs

---

#### MANAGER (`MANAGER`)

**Profil type** : Directeur des opérations

**Responsabilités** :
- Toutes les capacités de SUPERVISEUR
- **Suppression des programmes vol**
- Accès aux statistiques avancées

**Restrictions** :
- Ne peut pas gérer les utilisateurs

---

#### QUALITÉ (`QUALITE`)

**Profil type** : Auditeur qualité, contrôleur

**Responsabilités** :
- **Consultation de tous les CRV** (lecture seule)
- Consultation des statistiques
- Export des données
- Consultation des rapports

**Restrictions** :
- **Aucune modification possible**
- Ne peut pas créer de CRV
- Ne peut pas modifier de données
- Mode lecture seule strict

---

#### ADMINISTRATEUR (`ADMIN`)

**Profil type** : Administrateur système

**Responsabilités** :
- Création de comptes utilisateurs
- Modification des comptes
- Attribution des rôles
- Désactivation/réactivation des comptes
- Suppression des comptes (sous conditions)

**Restrictions** :
- **Aucun accès aux opérations CRV**
- Ne voit pas les CRV
- Ne voit pas les vols
- Périmètre strictement administratif

### 4.3 Matrice des permissions

| Action | Agent | Chef | Superviseur | Manager | Qualité | Admin |
|--------|:-----:|:----:|:-----------:|:-------:|:-------:|:-----:|
| **CRV** |
| Créer CRV | X | X | X | X | - | - |
| Modifier CRV | X | X | X | X | - | - |
| Lire CRV | X | X | X | X | X | - |
| Supprimer CRV | - | - | X | X | - | - |
| Archiver CRV | X | X | X | X | - | - |
| **Phases** |
| Démarrer phase | X | X | X | X | - | - |
| Terminer phase | X | X | X | X | - | - |
| Marquer non réalisée | X | X | X | X | - | - |
| **Programmes vol** |
| Créer programme | X | X | X | X | - | - |
| Modifier programme | X | X | X | X | - | - |
| Lire programme | X | X | X | X | X | - |
| Valider programme | - | - | X | X | - | - |
| Activer programme | - | - | X | X | - | - |
| Suspendre programme | X | X | X | X | - | - |
| Supprimer programme | - | - | - | X | - | - |
| **Utilisateurs** |
| Créer compte | - | - | - | - | - | X |
| Modifier compte | - | - | - | - | - | X |
| Désactiver compte | - | - | - | - | - | X |
| Supprimer compte | - | - | - | - | - | X |
| **Statistiques** |
| Consulter stats | X | X | X | X | X | - |

---

## 5. USER STORIES MÉTIER

### 5.1 Scénarios Agent d'escale

#### US-001 : Création d'un CRV Arrivée

**En tant qu'** Agent d'escale
**Je veux** créer un CRV pour un vol en arrivée
**Afin de** documenter les opérations d'assistance

**Critères d'acceptation** :
1. Je peux sélectionner le type "CRV Arrivée"
2. Je renseigne les informations du vol
3. Je saisis les phases réalisées avec leurs horaires
4. Je peux sauvegarder à tout moment
5. L'indicateur de complétude se met à jour en temps réel

---

#### US-002 : Saisie des charges passagers

**En tant qu'** Agent d'escale
**Je veux** renseigner le détail des passagers
**Afin de** tracer la charge transportée

**Critères d'acceptation** :
1. Je saisis le nombre d'adultes, enfants et bébés
2. Les totaux se calculent automatiquement
3. Je peux signaler des besoins médicaux spécifiques

---

#### US-003 : Signalement d'un retard

**En tant qu'** Agent d'escale
**Je veux** signaler un retard sur une phase
**Afin de** documenter l'incident

**Critères d'acceptation** :
1. Je peux créer un événement de type "Retard"
2. Je renseigne la cause du retard
3. Je précise l'impact sur le planning
4. L'événement est horodaté automatiquement

---

### 5.2 Scénarios Superviseur

#### US-010 : Validation d'un programme vol

**En tant que** Superviseur
**Je veux** valider un programme vol
**Afin de** l'activer pour les opérations

**Critères d'acceptation** :
1. Je vois la liste des programmes en attente
2. Je peux examiner le contenu du programme
3. Je peux valider ou rejeter avec commentaire
4. Une fois validé, le programme devient actif

---

#### US-011 : Suppression d'un CRV erroné

**En tant que** Superviseur
**Je veux** supprimer un CRV créé par erreur
**Afin de** corriger une erreur de saisie

**Critères d'acceptation** :
1. Je vois l'option de suppression
2. Une confirmation est demandée
3. La suppression est tracée dans les logs

---

### 5.3 Scénarios Qualité

#### US-020 : Consultation des CRV

**En tant que** Contrôleur qualité
**Je veux** consulter les CRV sans les modifier
**Afin de** effectuer mes contrôles

**Critères d'acceptation** :
1. Je vois tous les CRV en lecture seule
2. Les formulaires sont en mode "disabled"
3. Aucun bouton de modification n'apparaît
4. Un bandeau m'indique "Mode lecture seule"

---

#### US-021 : Export des statistiques

**En tant que** Contrôleur qualité
**Je veux** exporter les statistiques
**Afin de** produire mes rapports d'audit

**Critères d'acceptation** :
1. J'accède aux tableaux de bord statistiques
2. Je peux filtrer par période
3. Je peux exporter les données

---

### 5.4 Scénarios Administrateur

#### US-030 : Création d'un compte utilisateur

**En tant qu'** Administrateur
**Je veux** créer un nouveau compte
**Afin d'** attribuer l'accès à un collaborateur

**Critères d'acceptation** :
1. Je renseigne nom, prénom, email
2. Je sélectionne le rôle parmi les 6 disponibles
3. Je génère un mot de passe temporaire
4. Le compte est créé avec le flag "doitChangerMotDePasse"
5. Je communique les identifiants de manière sécurisée

---

#### US-031 : Désactivation d'un compte

**En tant qu'** Administrateur
**Je veux** désactiver un compte
**Afin de** bloquer l'accès d'un collaborateur parti

**Critères d'acceptation** :
1. Je sélectionne le compte à désactiver
2. Je peux saisir une raison
3. Le compte est marqué comme inactif
4. L'utilisateur ne peut plus se connecter
5. Les données historiques sont préservées

---

## 6. VALIDATION, VERROUILLAGE ET ANNULATION

### 6.1 Règle de complétude

Le système impose une **complétude minimale de 80%** avant validation :

```
┌────────────────────────────────────────────────────────────────────┐
│                    INDICATEUR DE COMPLÉTUDE                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   0%                    50%                    80%           100%  │
│   ├──────────────────────┼─────────────────────┼──────────────┤   │
│   │        ROUGE         │       ORANGE        │    VERT      │   │
│   │    (< 50%)           │    (50% - 79%)      │   (≥ 80%)    │   │
│   │                      │                     │              │   │
│   │   Validation         │   Validation        │  Validation  │   │
│   │   IMPOSSIBLE         │   IMPOSSIBLE        │  AUTORISÉE   │   │
│   │                      │                     │              │   │
│   └──────────────────────┴─────────────────────┴──────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 6.2 Processus de validation

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Complétude │────►│  Bouton     │────►│ Certification│────►│   CRV       │
│    ≥ 80%    │     │ "Valider"   │     │  par agent   │     │  VERROUILLÉ │
│             │     │  actif      │     │              │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Étapes de validation** :

1. **Vérification automatique** : Le système vérifie que la complétude atteint 80%
2. **Bouton actif** : Le bouton "Valider" devient cliquable
3. **Certification** : L'agent coche la case de certification
4. **Validation** : Le CRV passe en statut "Validé"
5. **Verrouillage** : Toute modification devient impossible

### 6.3 Effet du verrouillage

Une fois validé, le CRV devient **immuable** :

| Élément | Avant validation | Après validation |
|---------|------------------|------------------|
| Informations vol | Modifiable | Lecture seule |
| Personnel | Modifiable | Lecture seule |
| Engins | Modifiable | Lecture seule |
| Phases | Modifiable | Lecture seule |
| Charges | Modifiable | Lecture seule |
| Événements | Modifiable | Lecture seule |
| Statut | "En cours" | "Validé et verrouillé" |

### 6.4 Suppression et annulation

#### Conditions de suppression

La suppression d'un CRV n'est possible que par un **Superviseur ou Manager** et sous certaines conditions :

| Condition | Suppression possible |
|-----------|:--------------------:|
| CRV non validé | Oui |
| CRV validé | Non (verrouillé) |
| CRV archivé | Selon politique de rétention |

#### Procédure de suppression

1. Le Superviseur/Manager accède au CRV
2. Il clique sur "Supprimer"
3. Une confirmation est demandée
4. L'action est tracée dans les logs
5. Le CRV est supprimé de la base active

### 6.5 Changement de mot de passe obligatoire

Le système impose un changement de mot de passe dans les cas suivants :

| Déclencheur | Action |
|-------------|--------|
| Première connexion | Blocage de toute navigation jusqu'au changement |
| Réinitialisation par l'admin | Blocage de toute navigation jusqu'au changement |

**Comportement** :
- L'utilisateur est redirigé vers `/changer-mot-de-passe`
- Aucune autre page n'est accessible
- Le nouveau mot de passe doit respecter les critères de sécurité

---

## 7. SLA ET INDICATEURS DE PERFORMANCE

### 7.1 Indicateurs de qualité CRV

| Indicateur | Description | Cible |
|------------|-------------|-------|
| Taux de complétude | % moyen de remplissage des CRV | ≥ 95% |
| Taux de validation | % de CRV validés dans les délais | ≥ 90% |
| Délai de validation | Temps entre création et validation | < 4h |
| Taux d'événements | Nombre d'événements / CRV | Suivi |

### 7.2 Indicateurs opérationnels

| Indicateur | Description | Suivi |
|------------|-------------|-------|
| Retards signalés | Nombre de retards documentés | Mensuel |
| Causes de retards | Analyse des causes principales | Mensuel |
| Conformité phases | % phases réalisées vs planifiées | Hebdomadaire |

### 7.3 Indicateurs de sécurité

| Indicateur | Description | Cible |
|------------|-------------|-------|
| Comptes actifs | Nombre de comptes utilisateurs actifs | Suivi |
| Tentatives connexion | Échecs de connexion | < 5/jour/utilisateur |
| Changements de rôle | Modifications de permissions | Tracé |

### 7.4 Disponibilité système

| Service | Disponibilité cible |
|---------|---------------------|
| Application web | 99.5% |
| API Backend | 99.5% |
| Base de données | 99.9% |

### 7.5 Temps de réponse

| Action | Temps maximum |
|--------|---------------|
| Chargement page | 2 secondes |
| Sauvegarde CRV | 3 secondes |
| Validation CRV | 3 secondes |
| Export données | 10 secondes |

---

## ANNEXES

### A. Glossaire

| Terme | Définition |
|-------|------------|
| CRV | Compte Rendu de Vol - Document de traçabilité des opérations |
| Turn Around | Rotation complète d'un avion (arrivée + départ) |
| Phase | Étape opérationnelle d'assistance au sol |
| DGR | Dangerous Goods Regulations - Marchandises dangereuses |
| Complétude | Pourcentage de remplissage des champs obligatoires |

### B. Contacts support

| Type de demande | Contact |
|-----------------|---------|
| Mot de passe oublié | Support technique |
| Création de compte | Administrateur système |
| Problème technique | Support technique |
| Question métier | Chef d'équipe ou Superviseur |

### C. Historique des versions

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0.0 | 2026-01-05 | Version initiale |

---

**Document établi par** : Équipe projet CRV
**Validé par** : Direction des opérations
**Classification** : Usage interne
