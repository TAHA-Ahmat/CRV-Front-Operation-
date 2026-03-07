# FRONT-CORRECTIONS - MVS-9-Transversal

## Date de correction : 2026-01-10
## Reference : FRONT-ALIGNEMENT.md (audit du 2026-01-10)
## Norme backend : docs/process/MVS-9-Transversal/

---

## 1. SYNTHESE DES ECARTS A CORRIGER

| Source | Valeur |
|--------|--------|
| Ecarts totaux identifies | 2 |
| Ecarts CRITIQUES | 0 |
| Ecarts HAUTS | 0 |
| Ecarts MOYENS | 2 |

---

## 2. TABLEAU DE CORRESPONDANCE AUDIT → CORRECTION

| # | Ecart (depuis FRONT-ALIGNEMENT) | Process | Gravite | Fichiers backend de reference |
|---|--------------------------------|---------|---------|-------------------------------|
| 1 | Enum roles personnel simplifie | Affectation personnel | MOYENNE | 05-process-metier.md, 01-models.md |
| 2 | Enum types evenement simplifie | Declaration evenement | MOYENNE | 05-process-metier.md, 01-models.md |

---

## 3. TRAITEMENT DETAILLE DE CHAQUE ECART

---

### ECART #1 : Enum roles personnel simplifie

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Frontend utilise champ libre 'fonction' au lieu d'enum de roles"

Les roles documentes (CHEF_AVION, AGENT_TRAFIC, etc.) ne sont pas dans l'enum frontend.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "Roles : CHEF_AVION, AGENT_TRAFIC, AGENT_PISTE, AGENT_BAGAGES, AGENT_FRET, SUPERVISEUR, COORDINATEUR" |

**Regle metier exacte** :
```
Roles documentes MVS :
- CHEF_AVION
- AGENT_TRAFIC
- AGENT_PISTE
- AGENT_BAGAGES
- AGENT_FRET
- SUPERVISEUR
- COORDINATEUR

Frontend actuel : champ libre "fonction"
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Saisie libre = inconsistance |
| Qualite | Statistiques par role difficiles |
| Securite | Aucun |
| Audit | Tracabilite degradee |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Select avec les 7 roles + "Autre" |
| Ce que l'UI DOIT bloquer | Rien (champ libre si "Autre") |
| Ce que l'UI DOIT expliquer | Description de chaque role |
| Ce qui DOIT rester silencieux | OK |

**Note** : Verifier avec le backend si l'enum est implemente ou si champ libre accepte.

---

### ECART #2 : Enum types evenement simplifie

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Frontend simplifie les types (7 vs 14 documentes)"

L'enum frontend a moins de types que la documentation.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | 14 types : RETARD_PASSAGERS, RETARD_BAGAGES, RETARD_FRET, RETARD_CARBURANT, RETARD_EQUIPAGE, RETARD_TECHNIQUE, RETARD_METEO, RETARD_ATC, INCIDENT_SECURITE, INCIDENT_SURETE, INCIDENT_TECHNIQUE, CHANGEMENT_PORTE, CHANGEMENT_STAND, AUTRE |

**Frontend actuel** :
```
7 types : RETARD, TECHNIQUE, METEO, SECURITE, OPERATIONNEL, PASSAGERS, AUTRE
```

**Mapping implicite** :
```
Frontend RETARD -> MVS RETARD_* (5 types)
Frontend TECHNIQUE -> MVS RETARD_TECHNIQUE, INCIDENT_TECHNIQUE
Frontend METEO -> MVS RETARD_METEO
Frontend SECURITE -> MVS INCIDENT_SECURITE
Non mappes : RETARD_ATC, INCIDENT_SURETE, CHANGEMENT_PORTE, CHANGEMENT_STAND
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Certains types non selectionnables |
| Qualite | Statistiques moins precises |
| Securite | Aucun |
| Audit | Categorisation incomplete |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Types detailles OU groupes avec sous-types |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Chaque type et son usage |
| Ce qui DOIT rester silencieux | OK |

**Options** :
1. Etendre l'enum frontend aux 14 types
2. Garder les 7 types groupes avec sous-selection
3. Verifier avec backend quel enum est accepte

---

## 4. REGLES FRONTEND A RENDRE VISIBLES A L'UTILISATEUR

### Langage utilisateur recommande

| Contexte | Message a afficher |
|----------|-------------------|
| Role personnel | "Selectionnez le role de cette personne dans l'equipe" |
| Type evenement | "Categorisez l'evenement pour le suivi et les statistiques" |

---

## 5. REGLES FRONTEND A VERROUILLER (PERMISSIONS / STATUTS)

### Matrice des permissions

| Action | AGENT | CHEF | SUPERVISEUR | MANAGER | QUALITE | ADMIN |
|--------|-------|------|-------------|---------|---------|-------|
| Affecter personnel | OUI | OUI | OUI | OUI | **NON** | OUI |
| Declarer evenement | OUI | OUI | OUI | OUI | **NON** | OUI |

### Verifications par statut CRV

| Statut CRV | Modifications personnel/evenements |
|------------|-----------------------------------|
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
| Nouveau type evenement | Backend accepte les types frontend |
| Role personnalise | Champ libre si "Autre" |
| QUALITE tente modifier | Formulaire disabled |
| CRV verrouille | Formulaire disabled |

### Tests indispensables

| Test | Priorite |
|------|----------|
| Enum types evenement acceptes par backend | HAUTE |
| Enum roles personnel acceptes par backend | HAUTE |
| Calcul duree impact | HAUTE |
| Gravites correctes | HAUTE |

---

## SYNTHESE MVS-9-Transversal

### Ecarts traites

| # | Ecart | Gravite | Effort estime |
|---|-------|---------|---------------|
| 1 | Enum roles | MOYENNE | Faible |
| 2 | Enum types evenement | MOYENNE | Faible |

### Priorite de correction

1. **VERIFICATION PREALABLE** :
   - Confirmer avec backend les enums acceptes
   - Documenter le mapping frontend <-> backend

2. **SI NECESSAIRE** :
   - #1 Ajouter select roles avec 7 options + Autre
   - #2 Etendre types evenement ou ajouter sous-types

**Note** : La simplification frontend peut etre un choix UX valide. Verifier que le backend accepte les types simplifies.

---

**Document genere le 2026-01-10**
**Reference normative : MVS-9-Transversal (01-06)**
**Source audit : FRONT-ALIGNEMENT.md**
