# FRONT-CORRECTIONS - MVS-6-Resources

## Date de correction : 2026-01-10
## Reference : FRONT-ALIGNEMENT.md (audit du 2026-01-10)
## Norme backend : docs/process/MVS-6-Resources/

---

## 1. SYNTHESE DES ECARTS A CORRIGER

| Source | Valeur |
|--------|--------|
| Ecarts totaux identifies | 2 |
| Ecarts CRITIQUES | 0 |
| Ecarts HAUTS | 0 |
| Ecarts MOYENS | 0 |
| Ecarts MINEURS | 2 |

**Note** : MVS-6 est aligne a 100%. Les ecarts identifies sont des ameliorations mineures.

---

## 2. TABLEAU DE CORRESPONDANCE AUDIT → CORRECTION

| # | Ecart (depuis FRONT-ALIGNEMENT) | Process | Gravite | Fichiers backend de reference |
|---|--------------------------------|---------|---------|-------------------------------|
| 1 | Comportement remplacement non explicite | Affectation engins | MINEURE | 05-process-metier.md |
| 2 | Normalisation uppercase non affichee | Creation engin | MINEURE | 02-services.md |

---

## 3. TRAITEMENT DETAILLE DE CHAQUE ECART

---

### ECART #1 : Comportement remplacement non explicite

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Comportement remplacement | NON | Utilisateur pourrait penser additif"

Lors de la sauvegarde des engins affectes, l'utilisateur ne sait pas que c'est un remplacement complet.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "PUT /api/crv/:id/engins - Comportement : Remplacement complet (delete all + create new)" |

**Regle metier exacte** :
```
Route PUT /api/crv/:id/engins :
1. Suppression de TOUS les engins existants du CRV
2. Creation des nouveaux engins fournis
Effet : Remplacement complet, pas d'ajout incremental
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur pourrait omettre un engin dans la liste |
| Qualite | Donnees perdues accidentellement |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Note : "La liste complete remplacera les engins existants" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | "Assurez-vous que tous les engins sont inclus avant d'enregistrer" |
| Ce qui DOIT rester silencieux | Mecanique delete all + create |

---

### ECART #2 : Normalisation uppercase non affichee

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Normalisation uppercase | NON | Informatif"

L'utilisateur ne sait pas que le numero d'engin est normalise en majuscules.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 02-services.md | "Uppercase automatique" |

**Regle metier exacte** :
```
A la creation d'un engin :
numeroEngin = numeroEngin.toUpperCase()
Exemple : "abc123" devient "ABC123"
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Aucun |
| Qualite | Mineure |
| Securite | Aucun |
| Audit | Aucun |
| Image | Aucune |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | CSS text-transform: uppercase sur l'input |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Optionnel |
| Ce qui DOIT rester silencieux | OK |

---

## 4. REGLES FRONTEND A RENDRE VISIBLES A L'UTILISATEUR

### Langage utilisateur recommande

| Contexte | Message a afficher |
|----------|-------------------|
| Formulaire engins | "Attention : cette liste remplacera completement les engins affectes" |
| Numero engin | Affichage automatique en majuscules |

---

## 5. REGLES FRONTEND A VERROUILLER (PERMISSIONS / STATUTS)

### Matrice des permissions engins

| Action | AGENT | CHEF | SUPERVISEUR | MANAGER | QUALITE | ADMIN |
|--------|-------|------|-------------|---------|---------|-------|
| Affecter engin CRV | OUI | OUI | OUI | OUI | **NON** | OUI |
| Creer engin parc | NON | NON | NON | **OUI** | NON | **OUI** |
| Supprimer engin parc | NON | NON | NON | NON | NON | **OUI** |

### Verifications par statut CRV

| Statut CRV | Modification engins |
|------------|---------------------|
| BROUILLON | OUI |
| EN_COURS | OUI |
| TERMINE | OUI |
| VALIDE | NON |
| VERROUILLE | **NON** |

---

## 6. POINTS DE VIGILANCE NON-REGRESSION

### Cas limites a tester

| Scenario | Resultat attendu |
|----------|------------------|
| Enregistrer liste vide | Suppression de tous les engins |
| Numero engin minuscules | Conversion en majuscules |
| QUALITE tente modifier engins | Formulaire disabled |
| CRV verrouille | Formulaire disabled |
| Supprimer engin en utilisation | Erreur 400 |

### Tests indispensables

| Test | Priorite |
|------|----------|
| Remplacement complet fonctionne | HAUTE |
| QUALITE bloque | HAUTE |
| CRV verrouille bloque | HAUTE |
| Uppercase automatique | BASSE |

---

## SYNTHESE MVS-6-Resources

### Ecarts traites

| # | Ecart | Gravite | Effort estime |
|---|-------|---------|---------------|
| 1 | Remplacement explicite | MINEURE | Faible |
| 2 | Uppercase | MINEURE | Faible |

### Priorite de correction

1. **OPTIONNEL** :
   - #1 Note comportement remplacement
   - #2 CSS uppercase

**Note** : MVS-6 est fonctionnel. Ces ameliorations sont optionnelles.

---

**Document genere le 2026-01-10**
**Reference normative : MVS-6-Resources (01-06)**
**Source audit : FRONT-ALIGNEMENT.md**
