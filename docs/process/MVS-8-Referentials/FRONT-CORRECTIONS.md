# FRONT-CORRECTIONS - MVS-8-Referentials

## Date de correction : 2026-01-10
## Reference : FRONT-ALIGNEMENT.md (audit du 2026-01-10)
## Norme backend : docs/process/MVS-8-Referentials/

---

## 1. SYNTHESE DES ECARTS A CORRIGER

| Source | Valeur |
|--------|--------|
| Ecarts totaux identifies | 9 |
| Ecarts CRITIQUES | 2 |
| Ecarts HAUTS | 4 |
| Ecarts MOYENS | 3 |

---

## 2. TABLEAU DE CORRESPONDANCE AUDIT → CORRECTION

| # | Ecart (depuis FRONT-ALIGNEMENT) | Process | Gravite | Fichiers backend de reference |
|---|--------------------------------|---------|---------|-------------------------------|
| 1 | Interface creation avion non identifiee | Creation avion | MOYENNE | 04-routes.md |
| 2 | Interface configuration absente | Modification config | **CRITIQUE** | 04-routes.md, 05-process-metier.md |
| 3 | Interface versioning absente | Creation version | **CRITIQUE** | 04-routes.md, 05-process-metier.md |
| 4 | Liste versions absente | Liste versions | HAUTE | 04-routes.md |
| 5 | Bouton restauration absent | Restauration | HAUTE | 04-routes.md |
| 6 | Interface comparaison absente | Comparaison | HAUTE | 04-routes.md |
| 7 | Interface planification revision absente | Planification | HAUTE | 04-routes.md, 05-process-metier.md |
| 8 | Dashboard revisions absente | Revisions prochaines | MOYENNE | 04-routes.md |
| 9 | Dashboard statistiques absent | Statistiques config | MOYENNE | 04-routes.md |

---

## 3. TRAITEMENT DETAILLE DE CHAQUE ECART

---

### ECART #1 : Interface creation avion non identifiee

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Interface creation avion | NON CLAIREMENT IDENTIFIEE | UX degradee"

L'interface de creation d'avion n'est pas clairement identifiee dans l'application.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/avions - Roles : MANAGER, ADMIN" |
| 05-process-metier.md | "Champs requis : immatriculation, compagnie" |

**Regle metier exacte** :
```
Route : POST /api/avions
Roles : MANAGER, ADMIN
Champs obligatoires : immatriculation, compagnie
Contrainte : immatriculation unique
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | MANAGER/ADMIN ne trouvent pas ou creer un avion |
| Qualite | UX degradee |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton "Ajouter avion" visible pour MANAGER/ADMIN |
| Ce que l'UI DOIT bloquer | Creation si immatriculation existe |
| Ce que l'UI DOIT expliquer | Champs obligatoires marques |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #2 : Interface configuration absente (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Interface configuration | ABSENTE | Extension 3 inaccessible"

L'API de configuration avion existe mais aucune interface n'est disponible.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "PUT /api/avions/:id/configuration - Roles : SUPERVISEUR, MANAGER" |
| 05-process-metier.md | "Effet : Nouvelle version creee automatiquement" |

**Regle metier exacte** :
```
Route : PUT /api/avions/:id/configuration
Roles : SUPERVISEUR, MANAGER
Effet :
- Configuration modifiee
- Nouvelle version creee automatiquement (versioning)
Body : { sieges, configuration_cabine, equipements, ... }
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **CRITIQUE** - Configuration avions non modifiable |
| Qualite | Extension 3 non utilisable |
| Securite | Aucun |
| Audit | Non conforme cahier des charges |
| Image | Application incomplete |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Onglet/page "Configuration" dans detail avion |
| Ce que l'UI DOIT bloquer | Modification si role non autorise |
| Ce que l'UI DOIT expliquer | "Une nouvelle version sera creee automatiquement" |
| Ce qui DOIT rester silencieux | Mecanique de versioning |

---

### ECART #3 : Interface versioning absente (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Interface versioning | ABSENTE | Fonctionnalite inaccessible"

L'API de versioning existe mais sans interface.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/avions/:id/versions - Roles : SUPERVISEUR, MANAGER" |
| 05-process-metier.md | "Body : description, configuration" |

**Regle metier exacte** :
```
Route : POST /api/avions/:id/versions
Roles : SUPERVISEUR, MANAGER
Body : { description, configuration }
Effet : Nouvelle version avec numero incremente
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **CRITIQUE** - Pas d'historique des configurations |
| Qualite | Tracabilite absente |
| Securite | Audit impossible |
| Audit | Non conforme |
| Image | Application incomplete |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Section "Versions" avec historique |
| Ce que l'UI DOIT bloquer | Creation version si non autorise |
| Ce que l'UI DOIT expliquer | Description optionnelle pour la version |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #4 : Liste versions absente

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Liste versions | ABSENTE | Historique inaccessible"

L'historique des versions n'est pas affiche.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "GET /api/avions/:id/versions - Roles : Tous" |

**Regle metier exacte** :
```
Route : GET /api/avions/:id/versions
Acces : Tous les utilisateurs authentifies
Retour : Liste des versions triees par date desc
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Pas de visibilite sur l'historique |
| Qualite | Tracabilite degradee |
| Securite | Aucun |
| Audit | Historique inaccessible |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Liste des versions avec date et description |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Numero version, date, auteur |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #5 : Bouton restauration absent

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Bouton restauration | ABSENT | Fonctionnalite inaccessible"

L'API de restauration existe mais sans bouton.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/avions/:id/versions/:numero/restaurer - Roles : SUPERVISEUR, MANAGER" |

**Regle metier exacte** :
```
Route : POST /api/avions/:id/versions/:numero/restaurer
Roles : SUPERVISEUR, MANAGER
Effet : Configuration restauree depuis version selectionnee
Nouvelle version creee avec la configuration restauree
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Retour arriere impossible |
| Qualite | Pas de rollback |
| Securite | Aucun |
| Audit | Aucun |
| Image | Fonctionnalite incomplete |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton "Restaurer" par version |
| Ce que l'UI DOIT bloquer | Restauration si non autorise |
| Ce que l'UI DOIT expliquer | "Ceci creera une nouvelle version avec l'ancienne configuration" |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #6 : Interface comparaison absente

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Interface comparaison | ABSENTE | Fonctionnalite inaccessible"

L'API de comparaison existe mais sans interface.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "GET /api/avions/:id/versions/comparer - Params : v1, v2" |

**Regle metier exacte** :
```
Route : GET /api/avions/:id/versions/comparer?v1=X&v2=Y
Acces : Tous
Retour : Differences entre les deux versions
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Pas de diff visible |
| Qualite | Analyse des changements difficile |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Selecteurs v1/v2 + affichage diff |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Differences colorees (ajout/modif/suppression) |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #7 : Interface planification revision absente

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Interface planification | ABSENTE | Fonctionnalite inaccessible"

L'API de planification des revisions existe mais sans interface.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "PUT /api/avions/:id/revision - Roles : SUPERVISEUR, MANAGER" |
| 05-process-metier.md | "Types : A, B, C, D" |

**Regle metier exacte** :
```
Route : PUT /api/avions/:id/revision
Roles : SUPERVISEUR, MANAGER
Types revision :
- A : check legere (quotidienne)
- B : check intermediaire (hebdomadaire)
- C : maintenance lourde (annuelle)
- D : grande visite (pluriannuelle)
Body : { typeRevision, dateRevision }
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Planification maintenance impossible |
| Qualite | Suivi maintenance absent |
| Securite | **Potentiel** - maintenance non tracee |
| Audit | Non conforme aviation |
| Image | Serieuse |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Formulaire planification avec type et date |
| Ce que l'UI DOIT bloquer | Planification si non autorise |
| Ce que l'UI DOIT expliquer | "Type A/B/C/D et leurs frequences" |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #8 : Dashboard revisions absente

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Dashboard revisions | ABSENT | Alertes non visibles"

Les revisions prochaines ne sont pas affichees.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "GET /api/avions/revisions/prochaines" |

**Regle metier exacte** :
```
Route : GET /api/avions/revisions/prochaines
Acces : Tous
Retour : Liste des revisions a venir avec delais
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Revisions oubliees |
| Qualite | Maintenance reactive au lieu de proactive |
| Securite | **Potentiel** |
| Audit | Non conforme |
| Image | Serieuse |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Widget/page "Revisions prochaines" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Delai avant revision, type, avion |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #9 : Dashboard statistiques absent

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Dashboard statistiques | ABSENT | Reporting inaccessible"

Les statistiques configurations ne sont pas affichees.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "GET /api/avions/statistiques/configurations - Roles : MANAGER" |

**Regle metier exacte** :
```
Route : GET /api/avions/statistiques/configurations
Roles : MANAGER
Retour : agregations par compagnie, par type avion
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Pas de vision globale flotte |
| Qualite | Reporting absent |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Dashboard statistiques pour MANAGER |
| Ce que l'UI DOIT bloquer | Acces si non MANAGER |
| Ce que l'UI DOIT expliquer | Graphiques par compagnie, type |
| Ce qui DOIT rester silencieux | OK |

---

## 4. REGLES FRONTEND A RENDRE VISIBLES A L'UTILISATEUR

### Langage utilisateur recommande

| Contexte | Message a afficher |
|----------|-------------------|
| Modification config | "Une nouvelle version sera creee automatiquement" |
| Restauration version | "La configuration sera restauree. Une nouvelle version sera creee." |
| Planification revision | "Type A: check quotidienne, B: hebdo, C: annuelle, D: grande visite" |
| Revisions prochaines | "X avions en attente de revision dans les 30 jours" |

---

## 5. REGLES FRONTEND A VERROUILLER (PERMISSIONS / STATUTS)

### Matrice des permissions avions

| Action | AGENT | CHEF | SUPERVISEUR | MANAGER | QUALITE | ADMIN |
|--------|-------|------|-------------|---------|---------|-------|
| Consulter avions | OUI | OUI | OUI | OUI | OUI | OUI |
| Creer avion | NON | NON | NON | **OUI** | NON | **OUI** |
| Modifier config | NON | NON | **OUI** | **OUI** | NON | OUI |
| Creer version | NON | NON | **OUI** | **OUI** | NON | OUI |
| Restaurer version | NON | NON | **OUI** | **OUI** | NON | OUI |
| Planifier revision | NON | NON | **OUI** | **OUI** | NON | OUI |
| Voir statistiques | NON | NON | NON | **OUI** | NON | OUI |

---

## 6. POINTS DE VIGILANCE NON-REGRESSION

### Tests indispensables

| Test | Priorite |
|------|----------|
| CRUD configuration complet | **CRITIQUE** |
| Creation version automatique | **CRITIQUE** |
| Liste versions triee | HAUTE |
| Restauration version | HAUTE |
| Comparaison diff | HAUTE |
| Planification revision | HAUTE |
| Dashboard revisions | HAUTE |

---

## SYNTHESE MVS-8-Referentials

### Ecarts traites

| # | Ecart | Gravite | Effort estime |
|---|-------|---------|---------------|
| 1 | Creation avion | MOYENNE | Faible |
| 2 | Interface config | **CRITIQUE** | Moyen |
| 3 | Interface versioning | **CRITIQUE** | Moyen |
| 4 | Liste versions | HAUTE | Faible |
| 5 | Restauration | HAUTE | Faible |
| 6 | Comparaison | HAUTE | Moyen |
| 7 | Planification revision | HAUTE | Moyen |
| 8 | Dashboard revisions | MOYENNE | Moyen |
| 9 | Dashboard stats | MOYENNE | Moyen |

### Priorite de correction

1. **IMMEDIAT** (Extension 3 bloquee) :
   - #2 Interface configuration
   - #3 Interface versioning
   - #4 Liste versions

2. **COURT TERME** :
   - #5 Restauration version
   - #7 Planification revision
   - #8 Dashboard revisions

3. **MOYEN TERME** :
   - #6 Comparaison versions
   - #9 Dashboard statistiques
   - #1 Creation avion

---

**Document genere le 2026-01-10**
**Reference normative : MVS-8-Referentials (01-06)**
**Source audit : FRONT-ALIGNEMENT.md**
