# FRONT-CORRECTIONS - MVS-10-Validation

## Date de correction : 2026-01-10
## Reference : FRONT-ALIGNEMENT.md (audit du 2026-01-10)
## Norme backend : docs/process/MVS-10-Validation/

---

## ⚠️ ALERTE CRITIQUE

**ValidationCRV.vue est un STUB complet.**

L'ensemble du workflow de validation documente dans MVS-10 n'a PAS d'interface utilisateur fonctionnelle. Les routes API existent mais ne sont pas exploitees.

**Impact** : Aucun CRV ne peut etre valide ou verrouille en production.

---

## 1. SYNTHESE DES ECARTS A CORRIGER

| Source | Valeur |
|--------|--------|
| Ecarts totaux identifies | 5 |
| Ecarts CRITIQUES | 4 |
| Ecarts HAUTS | 1 |
| Taux alignement | **0%** |

---

## 2. TABLEAU DE CORRESPONDANCE AUDIT → CORRECTION

| # | Ecart (depuis FRONT-ALIGNEMENT) | Process | Gravite | Fichiers backend de reference |
|---|--------------------------------|---------|---------|-------------------------------|
| 1 | UI validation stub | Obtenir validation | **CRITIQUE** | 04-routes.md |
| 2 | UI valider CRV stub + permissions divergentes | Valider CRV | **CRITIQUE** | 04-routes.md, 05-process-metier.md |
| 3 | Process rejet non implemente | Rejeter CRV | **CRITIQUE** | 04-routes.md |
| 4 | UI verrouiller stub + permissions divergentes | Verrouiller CRV | **CRITIQUE** | 04-routes.md, 05-process-metier.md |
| 5 | UI deverrouiller stub + permissions divergentes | Deverrouiller CRV | HAUTE | 04-routes.md, 05-process-metier.md |

---

## 3. TRAITEMENT DETAILLE DE CHAQUE ECART

---

### ECART #1 : UI validation stub (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "ValidationCRV.vue (stub) - Vue : Absente"

La page de validation est un stub "A developper".

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "GET /api/validation/:id" |

**Regle metier exacte** :
```
Route : GET /api/validation/:id
Acces : Tous authentifies
Retour : Statut validation du CRV, historique actions
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **BLOQUANT** - Workflow CRV incomplet |
| Qualite | Aucun CRV validable |
| Securite | Aucun verrouillage possible |
| Audit | **NON CONFORME** |
| Image | Application inutilisable en production |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Liste des CRV en attente de validation (statut TERMINE) |
| Ce que l'UI DOIT bloquer | Acces selon role (voir permissions) |
| Ce que l'UI DOIT expliquer | Statut actuel, actions disponibles |
| Ce qui DOIT rester silencieux | OK |

**Composants requis** :
1. Liste CRV filtree par statut TERMINE
2. Detail CRV avec resume
3. Boutons d'action selon statut et role

---

### ECART #2 : Valider CRV stub + permissions divergentes (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** :
- "Vue : ValidationCRV.vue (stub)"
- "Permissions doc : QUALITE, ADMIN / Permissions front : tous sauf QUALITE"

L'interface est absente ET les permissions frontend sont inversees.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/validation/:id/valider" |
| 05-process-metier.md | "Roles : QUALITE, ADMIN" |

**Regle metier exacte** :
```
Route : POST /api/validation/:id/valider
Roles documentation : QUALITE, ADMIN uniquement
Roles permissions.js : AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER (INVERSE!)

Prerequis : completude >= 80%
Transition : TERMINE -> VALIDE
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **BLOQUANT** - Validation impossible |
| Qualite | Workflow bloque |
| Securite | **CRITIQUE** - Permissions incorrectes = acces non autorises |
| Audit | **NON CONFORME** - Separation des fonctions violee |
| Image | Risque legal/reglementaire |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton "Valider" pour QUALITE/ADMIN sur CRV TERMINE |
| Ce que l'UI DOIT bloquer | Validation si completude < 80% |
| Ce que l'UI DOIT expliquer | "Ce CRV sera marque comme valide et pret pour verrouillage" |
| Ce qui DOIT rester silencieux | OK |

**CORRECTION PERMISSIONS OBLIGATOIRE** :
```javascript
// permissions.js - A CORRIGER
CRV_VALIDER: ['QUALITE', 'ADMIN']  // au lieu de tous sauf QUALITE
```

---

### ECART #3 : Process rejet non implemente (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Route : Non trouve dans api.js - Verdict : ABSENT"

Le process de rejet n'est pas implemente du tout.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/validation/:id/rejeter" |
| 05-process-metier.md | "Roles : QUALITE, ADMIN - Commentaires obligatoires" |

**Regle metier exacte** :
```
Route : POST /api/validation/:id/rejeter
Roles : QUALITE, ADMIN
Body : { commentaires } (obligatoire)
Effet : CRV retourne a EN_COURS pour correction
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **BLOQUANT** - CRV non conforme ne peuvent pas etre rejetes |
| Qualite | Pas de boucle de correction |
| Securite | Aucun |
| Audit | **NON CONFORME** |
| Image | Workflow incomplet |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton "Rejeter" pour QUALITE/ADMIN sur CRV TERMINE |
| Ce que l'UI DOIT bloquer | Rejet sans commentaire |
| Ce que l'UI DOIT expliquer | "Raison du rejet (obligatoire) - Le CRV retournera en cours pour correction" |
| Ce qui DOIT rester silencieux | OK |

**A AJOUTER dans api.js** :
```javascript
rejeter: (id, commentaires) => api.post(`/validation/${id}/rejeter`, { commentaires })
```

---

### ECART #4 : Verrouiller CRV stub + permissions divergentes (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** :
- "Vue : ValidationCRV.vue (stub)"
- "Permissions doc : QUALITE, ADMIN / Permissions front : SUPERVISEUR, MANAGER"

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/validation/:id/verrouiller" |
| 05-process-metier.md | "Roles : QUALITE, ADMIN - Prerequis : statut == VALIDE" |

**Regle metier exacte** :
```
Route : POST /api/validation/:id/verrouiller
Roles documentation : QUALITE, ADMIN
Roles permissions.js : SUPERVISEUR, MANAGER (DIFFERENT!)

Prerequis : statut = VALIDE
Transition : VALIDE -> VERROUILLE
Effet : CRV definitif, aucune modification possible
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **BLOQUANT** - Verrouillage impossible |
| Qualite | CRV jamais finalises |
| Securite | **CRITIQUE** - Permissions incorrectes |
| Audit | **NON CONFORME** |
| Image | Risque legal |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton "Verrouiller" pour QUALITE/ADMIN sur CRV VALIDE |
| Ce que l'UI DOIT bloquer | Verrouillage si CRV non VALIDE |
| Ce que l'UI DOIT expliquer | "Le CRV sera definitif. Aucune modification possible." |
| Ce qui DOIT rester silencieux | OK |

**CORRECTION PERMISSIONS OBLIGATOIRE** :
```javascript
// permissions.js - A CORRIGER
CRV_VERROUILLER: ['QUALITE', 'ADMIN']  // au lieu de SUPERVISEUR, MANAGER
```

---

### ECART #5 : Deverrouiller CRV stub + permissions divergentes

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** :
- "Vue : ValidationCRV.vue (stub)"
- "Permissions doc : ADMIN uniquement / Permissions front : SUPERVISEUR, MANAGER"

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/validation/:id/deverrouiller" |
| 05-process-metier.md | "Roles : ADMIN uniquement - Raison obligatoire" |

**Regle metier exacte** :
```
Route : POST /api/validation/:id/deverrouiller
Roles documentation : ADMIN uniquement
Roles permissions.js : SUPERVISEUR, MANAGER (ELARGI!)

Body : { raison } (obligatoire)
Effet : CRV retourne a VALIDE
Cas exceptionnel : correction urgente
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Retour arriere impossible (correction urgente) |
| Qualite | Blocage en cas d'erreur |
| Securite | **CRITIQUE** - Permissions elargies = trop d'acces |
| Audit | Non conforme - operations sensibles elargies |
| Image | Risque modere |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton "Deverrouiller" pour ADMIN uniquement sur CRV VERROUILLE |
| Ce que l'UI DOIT bloquer | Deverrouillage sans raison |
| Ce que l'UI DOIT expliquer | "Operation exceptionnelle. Indiquez la raison." |
| Ce qui DOIT rester silencieux | OK |

**CORRECTION PERMISSIONS OBLIGATOIRE** :
```javascript
// permissions.js - A CORRIGER
CRV_DEVERROUILLER: ['ADMIN']  // au lieu de SUPERVISEUR, MANAGER
```

---

## 4. DIVERGENCES PERMISSIONS CRITIQUES

### Tableau comparatif

| Operation | Documentation MVS | permissions.js actuel | Correction requise |
|-----------|-------------------|----------------------|-------------------|
| CRV_VALIDER | QUALITE, ADMIN | AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER | **INVERSER** |
| CRV_VERROUILLER | QUALITE, ADMIN | SUPERVISEUR, MANAGER | **CORRIGER** |
| CRV_DEVERROUILLER | ADMIN uniquement | SUPERVISEUR, MANAGER | **RESTREINDRE** |

### Actions requises

1. **CLARIFIER** avec le product owner / backend :
   - La documentation est-elle a jour ?
   - Ou le frontend a-t-il des permissions incorrectes ?

2. **SI documentation correcte** : Corriger permissions.js
3. **SI frontend correct** : Mettre a jour documentation MVS

---

## 5. REGLES FRONTEND A RENDRE VISIBLES A L'UTILISATEUR

### Langage utilisateur recommande

| Contexte | Message a afficher |
|----------|-------------------|
| Page validation | "CRV en attente de validation" |
| Bouton Valider | "Approuver ce CRV (minimum 80% completude)" |
| Bouton Rejeter | "Renvoyer pour correction (commentaire obligatoire)" |
| Bouton Verrouiller | "Finaliser ce CRV (aucune modification possible apres)" |
| Bouton Deverrouiller | "Operation exceptionnelle : deverrouiller ce CRV" |
| Champ raison rejet | "Indiquez les elements a corriger" |
| Champ raison deverrouillage | "Justification pour l'audit" |

---

## 6. REGLES FRONTEND A VERROUILLER (PERMISSIONS / STATUTS)

### Matrice des permissions CORRIGEE (selon documentation)

| Action | AGENT | CHEF | SUPERVISEUR | MANAGER | QUALITE | ADMIN |
|--------|-------|------|-------------|---------|---------|-------|
| Voir validations | OUI | OUI | OUI | OUI | OUI | OUI |
| Valider CRV | NON | NON | NON | NON | **OUI** | **OUI** |
| Rejeter CRV | NON | NON | NON | NON | **OUI** | **OUI** |
| Verrouiller CRV | NON | NON | NON | NON | **OUI** | **OUI** |
| Deverrouiller CRV | NON | NON | NON | NON | NON | **OUI** |

### Workflow des statuts

```
TERMINE (completude >= 50%)
    |
    v
[QUALITE/ADMIN valide] ---> VALIDE
    |                           |
    |                           v
    +--[QUALITE/ADMIN rejette]  [QUALITE/ADMIN verrouille] ---> VERROUILLE
    |                                                              |
    v                                                              v
EN_COURS (retour correction)                                [ADMIN uniquement]
                                                                   |
                                                                   v
                                                              VALIDE (deverrouille)
```

---

## 7. POINTS DE VIGILANCE NON-REGRESSION

### Tests indispensables CRITIQUES

| Test | Priorite |
|------|----------|
| QUALITE peut valider CRV TERMINE | **CRITIQUE** |
| QUALITE peut rejeter CRV TERMINE | **CRITIQUE** |
| QUALITE peut verrouiller CRV VALIDE | **CRITIQUE** |
| ADMIN peut deverrouiller CRV VERROUILLE | **CRITIQUE** |
| Non-QUALITE ne peut PAS valider | **CRITIQUE** |
| Non-ADMIN ne peut PAS deverrouiller | **CRITIQUE** |
| Rejet sans commentaire bloque | HAUTE |
| Validation si completude < 80% bloque | HAUTE |

### Cas limites a tester

| Scenario | Resultat attendu |
|----------|------------------|
| AGENT tente valider | Bouton absent ou erreur 403 |
| SUPERVISEUR tente verrouiller | Bouton absent ou erreur 403 |
| Valider CRV a 79% | Erreur "Completude insuffisante" |
| Rejeter sans commentaire | Erreur validation |
| Deverrouiller par MANAGER | Erreur 403 |

---

## SYNTHESE MVS-10-Validation

### Ecarts traites

| # | Ecart | Gravite | Effort estime |
|---|-------|---------|---------------|
| 1 | UI validation stub | **CRITIQUE** | **Eleve** |
| 2 | Valider + permissions | **CRITIQUE** | Moyen |
| 3 | Rejeter absent | **CRITIQUE** | Moyen |
| 4 | Verrouiller + permissions | **CRITIQUE** | Moyen |
| 5 | Deverrouiller + permissions | HAUTE | Faible |

### Priorite de correction

1. **IMMEDIAT - BLOQUANT PRODUCTION** :
   - Creer page ValidationCRV.vue fonctionnelle
   - Implementer boutons Valider/Rejeter/Verrouiller
   - Corriger permissions.js selon documentation

2. **AVANT PRODUCTION** :
   - Ajouter route rejeter dans api.js
   - Implementer deverrouillage (ADMIN only)
   - Tests exhaustifs des permissions

### Effort total estime

| Composant | Effort |
|-----------|--------|
| Page ValidationCRV.vue complete | 2-3 jours |
| Correction permissions.js | 0.5 jour |
| Route rejet api.js | 0.5 jour |
| Tests | 1 jour |
| **Total** | **4-5 jours** |

---

**Document genere le 2026-01-10**
**Reference normative : MVS-10-Validation (01-06)**
**Source audit : FRONT-ALIGNEMENT.md**

---

## ⚠️ NOTE FINALE

Ce MVS est le plus critique de l'application CRV.

**Sans correction, aucun CRV ne pourra etre valide/verrouille en production.**

La divergence des permissions est particulierement preoccupante et doit etre clarifiee avec l'equipe backend avant toute correction.
