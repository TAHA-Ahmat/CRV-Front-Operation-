# FRONT-CORRECTIONS - MVS-5-Flights

## Date de correction : 2026-01-10
## Reference : FRONT-ALIGNEMENT.md (audit du 2026-01-10)
## Norme backend : docs/process/MVS-5-Flights/

---

## 1. SYNTHESE DES ECARTS A CORRIGER

| Source | Valeur |
|--------|--------|
| Ecarts totaux identifies | 6 |
| Ecarts CRITIQUES | 1 |
| Ecarts HAUTS | 3 |
| Ecarts MOYENS | 2 |

---

## 2. TABLEAU DE CORRESPONDANCE AUDIT → CORRECTION

| # | Ecart (depuis FRONT-ALIGNEMENT) | Process | Gravite | Fichiers backend de reference |
|---|--------------------------------|---------|---------|-------------------------------|
| 1 | Statut initial PROGRAMME non affiche | Creation vol | MINEURE | 05-process-metier.md |
| 2 | Bouton suppression vol absent | Suppression vol | MOYENNE | 04-routes.md |
| 3 | Extension 2 sans UI (programmes vol) | Programmes vol | **CRITIQUE** | 04-routes.md, 05-process-metier.md |
| 4 | Interface validation programme absente | Validation programme | HAUTE | 04-routes.md |
| 5 | Interface liaison programme absente | Liaison programme | HAUTE | 04-routes.md |
| 6 | Interface hors programme absente | Hors programme | HAUTE | 04-routes.md |

---

## 3. TRAITEMENT DETAILLE DE CHAQUE ECART

---

### ECART #1 : Statut initial PROGRAMME non affiche

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Vol cree avec statut PROGRAMME | NON AFFICHE"

L'utilisateur ne sait pas que le vol est cree avec le statut PROGRAMME.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "Statut initial : PROGRAMME" |

**Regle metier exacte** :
```
A la creation d'un vol :
- statut = 'PROGRAMME' par defaut
- Transitions possibles : PROGRAMME -> CONFIRME -> EN_VOL -> TERMINE
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Information manquante mais non bloquante |
| Qualite | Mineure |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Badge "PROGRAMME" sur vol nouvellement cree |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Optionnel |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #2 : Bouton suppression vol absent

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Bouton suppression | ABSENT | Fonctionnalite inaccessible"

L'API de suppression existe mais n'est pas exposee.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "DELETE /api/vols/:id" |
| 05-process-metier.md | "Contrainte : Vol non lie a CRV" |

**Regle metier exacte** :
```
Route : DELETE /api/vols/:id
Condition : Vol ne doit pas etre lie a un CRV
Si lie : Erreur 400 "Vol associe a un CRV"
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Vols errones non supprimables |
| Qualite | Base polluee |
| Securite | Aucun |
| Audit | Donnees parasites |
| Image | Application incomplete |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton "Supprimer" sur vol non lie a CRV |
| Ce que l'UI DOIT bloquer | Suppression si vol lie a CRV |
| Ce que l'UI DOIT expliquer | "Ce vol est associe a un CRV et ne peut etre supprime" |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #3 : Extension 2 sans UI (Programmes vol) - CRITIQUE

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Interface programmes | ABSENTE | Extension 2 inaccessible"

L'API des programmes saisonniers existe mais aucune interface n'est disponible.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | Routes programmesVolAPI : create, getAll, getById, update, valider, activer, desactiver |
| 05-process-metier.md | Workflow BROUILLON -> VALIDE -> ACTIF |

**Regle metier exacte** :
```
Programmes saisonniers :
- Statuts : BROUILLON, VALIDE, ACTIF, INACTIF
- Champs : nomProgramme, compagnieAerienne, typeOperation, recurrence, detailsVol
- Roles validation : SUPERVISEUR, MANAGER
- Un programme ACTIF genere des vols automatiquement selon la recurrence
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **CRITIQUE** - Fonctionnalite metier majeure inaccessible |
| Qualite | Workflow manuel au lieu d'automatise |
| Securite | Aucun |
| Audit | Non conforme au cahier des charges |
| Image | Application incomplete |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Page complete de gestion des programmes saisonniers |
| Ce que l'UI DOIT bloquer | Creation/validation selon role |
| Ce que l'UI DOIT expliquer | Workflow BROUILLON -> VALIDE -> ACTIF |
| Ce qui DOIT rester silencieux | Logique de generation automatique |

**Composants requis :**
1. Liste des programmes avec filtres (statut, compagnie)
2. Formulaire creation/edition
3. Boutons valider/activer selon statut et role
4. Visualisation de la recurrence

---

### ECART #4 : Interface validation programme absente

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Interface validation programme | ABSENTE | Workflow incomplet"

Les routes de validation existent mais sans interface.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/programmes-vol/:id/valider, POST /api/programmes-vol/:id/activer" |
| 05-process-metier.md | Roles : SUPERVISEUR, MANAGER |

**Regle metier exacte** :
```
Validation : BROUILLON -> VALIDE (SUPERVISEUR, MANAGER)
Activation : VALIDE -> ACTIF (SUPERVISEUR, MANAGER)
Prerequis validation : programme complet (champs obligatoires remplis)
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Programmes jamais actives |
| Qualite | Workflow bloque |
| Securite | Aucun |
| Audit | Non conforme |
| Image | Application incomplete |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Boutons "Valider" et "Activer" selon statut |
| Ce que l'UI DOIT bloquer | Boutons selon role et statut |
| Ce que l'UI DOIT expliquer | Etat actuel et transitions possibles |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #5 : Interface liaison programme absente

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Interface liaison | ABSENTE | Fonctionnalite inaccessible"

L'API de liaison vol-programme existe mais sans interface.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/vols/:id/lier-programme" |
| 05-process-metier.md | "Prerequis : Programme actif, coherence compagnie/typeOperation" |

**Regle metier exacte** :
```
Route : POST /api/vols/:id/lier-programme
Body : { programmeId }
Conditions :
- Programme doit etre ACTIF
- Compagnie du vol = compagnie du programme
- Type operation coherent
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Vols non lies aux programmes |
| Qualite | Tracabilite degradee |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Select "Programme" dans formulaire vol |
| Ce que l'UI DOIT bloquer | Programmes inactifs ou incompatibles |
| Ce que l'UI DOIT expliquer | Filtrage automatique par compagnie |
| Ce qui DOIT rester silencieux | Logique de coherence |

---

### ECART #6 : Interface hors programme absente

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Interface hors programme | ABSENTE | Fonctionnalite inaccessible"

L'API de marquage hors programme existe mais sans interface.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/vols/:id/marquer-hors-programme" |
| 05-process-metier.md | "Types : CHARTER, VOL_FERRY, MEDICAL, TECHNIQUE, AUTRE" |

**Regle metier exacte** :
```
Route : POST /api/vols/:id/marquer-hors-programme
Body : { typeVolHorsProgramme, raisonHorsProgramme }
Types : CHARTER, VOL_FERRY, MEDICAL, TECHNIQUE, AUTRE
raisonHorsProgramme obligatoire
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Vols exceptionnels non categorises |
| Qualite | Statistiques incompletes |
| Securite | Aucun |
| Audit | Tracabilite degradee |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton/modal "Marquer hors programme" |
| Ce que l'UI DOIT bloquer | Soumission sans raison |
| Ce que l'UI DOIT expliquer | "Vol exceptionnel non prevu dans un programme saisonnier" |
| Ce qui DOIT rester silencieux | OK |

---

## 4. REGLES FRONTEND A RENDRE VISIBLES A L'UTILISATEUR

### Langage utilisateur recommande

| Contexte | Message a afficher |
|----------|-------------------|
| Nouveau vol | "Statut initial : PROGRAMME" |
| Suppression vol | "Vol associe a un CRV - suppression impossible" |
| Programme BROUILLON | "Ce programme est en brouillon. Validez-le pour l'activer." |
| Liaison programme | "Seuls les programmes actifs sont affichés" |
| Hors programme | "Ce vol est exceptionnel. Indiquez le type et la raison." |

---

## 5. REGLES FRONTEND A VERROUILLER (PERMISSIONS / STATUTS)

### Matrice des permissions vols

| Action | AGENT | CHEF | SUPERVISEUR | MANAGER | QUALITE | ADMIN |
|--------|-------|------|-------------|---------|---------|-------|
| Creer vol | OUI | OUI | OUI | OUI | **NON** | OUI |
| Modifier vol | OUI | OUI | OUI | OUI | **NON** | OUI |
| Supprimer vol | OUI | OUI | OUI | OUI | **NON** | OUI |
| Valider programme | NON | NON | **OUI** | **OUI** | NON | OUI |
| Activer programme | NON | NON | **OUI** | **OUI** | NON | OUI |

### Verifications suppression vol

| Condition | Suppression possible |
|-----------|---------------------|
| Vol sans CRV | OUI |
| Vol avec CRV | **NON** |

---

## 6. POINTS DE VIGILANCE NON-REGRESSION

### Cas limites a tester

| Scenario | Resultat attendu |
|----------|------------------|
| Supprimer vol sans CRV | Succes |
| Supprimer vol avec CRV | Erreur 400 + message |
| Valider programme incomplet | Erreur validation |
| Lier vol a programme inactif | Erreur 400 |
| Marquer hors programme sans raison | Erreur validation |

### Tests indispensables

| Test | Priorite |
|------|----------|
| CRUD programmes complet | **CRITIQUE** |
| Workflow validation/activation | **CRITIQUE** |
| Bouton suppression vol | HAUTE |
| Liaison vol-programme | HAUTE |
| Marquage hors programme | MOYENNE |

---

## SYNTHESE MVS-5-Flights

### Ecarts traites

| # | Ecart | Gravite | Effort estime |
|---|-------|---------|---------------|
| 1 | Statut PROGRAMME | MINEURE | Faible |
| 2 | Bouton suppression | MOYENNE | Faible |
| 3 | Extension 2 UI | **CRITIQUE** | **Eleve** |
| 4 | Validation programme | HAUTE | Moyen |
| 5 | Liaison programme | HAUTE | Moyen |
| 6 | Hors programme | HAUTE | Faible |

### Priorite de correction

1. **IMMEDIAT** (Blocage fonctionnel) :
   - #3 Interface complete programmes saisonniers
   - #4 Boutons validation/activation

2. **COURT TERME** :
   - #5 Liaison vol-programme
   - #2 Bouton suppression vol

3. **MOYEN TERME** :
   - #6 Marquage hors programme
   - #1 Badge statut initial

---

**Document genere le 2026-01-10**
**Reference normative : MVS-5-Flights (01-06)**
**Source audit : FRONT-ALIGNEMENT.md**
