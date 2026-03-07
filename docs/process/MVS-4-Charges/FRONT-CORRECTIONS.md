# FRONT-CORRECTIONS - MVS-4-Charges

## Date de correction : 2026-01-10
## Reference : FRONT-ALIGNEMENT.md (audit du 2026-01-10)
## Norme backend : docs/process/MVS-4-Charges/

---

## 1. SYNTHESE DES ECARTS A CORRIGER

| Source | Valeur |
|--------|--------|
| Ecarts totaux identifies | 8 |
| Ecarts CRITIQUES | 0 |
| Ecarts HAUTS | 3 |
| Ecarts MOYENS | 3 |
| Ecarts MINEURS | 2 |

---

## 2. TABLEAU DE CORRESPONDANCE AUDIT → CORRECTION

| # | Ecart (depuis FRONT-ALIGNEMENT) | Process | Gravite | Fichiers backend de reference |
|---|--------------------------------|---------|---------|-------------------------------|
| 1 | Impact completude non affiche | Ajout charge | HAUTE | MVS-2/02-services.md (calculerCompletude) |
| 2 | Doctrine VIDE != ZERO non explicite | Ajout charge | MOYENNE | 05-process-metier.md |
| 3 | Types COURRIER/MATERIEL absents | Ajout charge | MOYENNE | 04-routes.md, 01-models.md |
| 4 | Coherence total classes/passagers | Classes | MOYENNE | 05-process-metier.md |
| 5 | Implications besoins medicaux | Besoins medicaux | MINEURE | 05-process-metier.md |
| 6 | Format code ONU non indique | DGR | HAUTE | 05-process-metier.md |
| 7 | Groupe emballage non expose | DGR | HAUTE | 05-process-metier.md |
| 8 | Bouton validation DGR absent | Validation DGR | MOYENNE | 04-routes.md |

---

## 3. TRAITEMENT DETAILLE DE CHAQUE ECART

---

### ECART #1 : Impact completude non affiche

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Impact completude | NON | Utilisateur ne comprend pas progression"

L'utilisateur ne sait pas combien ajouter une charge impacte la completude du CRV.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| MVS-2/02-services.md | calculerCompletude : "Charges : 30% (20-30 selon nb types)" |

**Regle metier exacte** :
```
0 type charge : +0%
1 type charge : +20%
2 types charges : +25%
3+ types charges : +30%
Maximum atteignable par charges : 30%
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur ne sait pas comment atteindre 50% |
| Qualite | Motivation degradee |
| Securite | Aucun |
| Audit | UX opaque |
| Image | Application non intuitive |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Message : "Ajouter cette charge = +20% completude" avant ajout |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Tableau : 1 type=20%, 2 types=25%, 3+=30% |
| Ce qui DOIT rester silencieux | Formule exacte |

---

### ECART #2 : Doctrine VIDE != ZERO non explicite

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Doctrine VIDE != ZERO | NON explicite | Confusion entre absent et zero"

L'utilisateur ne sait pas la difference entre un champ vide (null) et zero (0).

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "Champs null par defaut (REGLE VIDE =/= ZERO)" |

**Regle metier exacte** :
```
null = non renseigne / inconnu
0 = explicitement zero
Impact : backend traite differemment pour rapports et statistiques
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Donnees incorrectes (0 involontaire) |
| Qualite | Statistiques biaisees |
| Securite | Aucun |
| Audit | Tracabilite degradee |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Placeholder : "Laisser vide si non applicable" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | "0 = zero explicite, vide = non renseigne" |
| Ce qui DOIT rester silencieux | Traitement interne null vs 0 |

---

### ECART #3 : Types COURRIER/MATERIEL absents

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Types COURRIER/MATERIEL | ABSENTS de l'enum | Fonctionnalites reduites"

L'enum frontend ne contient pas ces types.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "typeCharge in ['PASSAGERS', 'BAGAGES', 'FRET']" |

**Regle metier exacte** :
```
Backend accepte uniquement : PASSAGERS, BAGAGES, FRET
Types COURRIER et MATERIEL ne sont PAS dans le backend
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Aucun (conforme backend) |
| Qualite | Documentation frontend obsolete |
| Securite | Aucun |
| Audit | Aucun |
| Image | Aucun |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Uniquement PASSAGERS, BAGAGES, FRET |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Rien |
| Ce qui DOIT rester silencieux | OK |

**Note** : Ecart documentaire. Aucune action frontend requise - conforme backend.

---

### ECART #4 : Coherence total classes/passagers

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Coherence total classes/passagers | NON VERIFIE | Donnees potentiellement incoherentes"

Le total des classes n'est pas verifie par rapport au nombre de passagers.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | Classes : premiere, affaires, economique |

**Regle metier exacte** :
```
Somme(premiere + affaires + economique) DEVRAIT = passagersAdultes + passagersEnfants + ...
Backend ne valide pas cette coherence actuellement
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Donnees incoherentes acceptees |
| Qualite | Rapports faux |
| Securite | Aucun |
| Audit | Donnees non fiables |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Alerte si total classes != total passagers |
| Ce que l'UI DOIT bloquer | Rien (avertissement seulement) |
| Ce que l'UI DOIT expliquer | "Total classes (X) different du total passagers (Y)" |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #5 : Implications besoins medicaux

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Implications operationnelles | NON | Utilisateur ne sait pas les consequences"

L'utilisateur ne connait pas l'impact operationnel des besoins medicaux.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | Champs : oxygeneBord, brancardier, accompagnementMedical |

**Regle metier exacte** :
```
oxygeneBord : necessite equipement specifique
brancardier : personnel forme requis
accompagnementMedical : professionnel sante present
Impact : coordination avec services sol
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur coche sans comprendre impact |
| Qualite | Mineure |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Tooltip sur chaque option expliquant l'implication |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | "Oxygene a bord : equipement special a prevoir" |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #6 : Format code ONU non indique (DGR)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Format code ONU (UN + 4 chiffres) | NON | Erreur 400 surprise"

L'utilisateur ne connait pas le format attendu pour le code ONU.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "Valider code ONU (format UN suivi de 4 chiffres)" |

**Regle metier exacte** :
```
Format : UN suivi de 4 chiffres
Exemples valides : UN0001, UN1234, UN9999
Exemples invalides : 1234, UN123, ONU1234
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Erreurs 400 incomprehensibles |
| Qualite | Frustration, support sollicite |
| Securite | Aucun |
| Audit | Aucun |
| Image | Application mal concue |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Placeholder "UN0000" et label "Format: UN + 4 chiffres" |
| Ce que l'UI DOIT bloquer | Validation regex avant soumission |
| Ce que l'UI DOIT expliquer | Message erreur : "Format invalide. Exemple: UN1234" |
| Ce qui DOIT rester silencieux | Rien |

---

### ECART #7 : Groupe emballage non expose (DGR)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Groupe emballage | NON | Donnees incompletes"

Le champ groupe emballage n'est pas expose dans l'interface.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "Valider groupe emballage (I, II, III)" |

**Regle metier exacte** :
```
Groupe emballage : I, II, ou III
I = danger eleve
II = danger moyen
III = danger faible
Obligatoire pour certaines classes ONU
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Donnees DGR incompletes |
| Qualite | Non conforme reglementation IATA |
| Securite | **Potentiel** - information manquante pour manutention |
| Audit | Non conforme |
| Image | Serieuse pour DGR |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Select "Groupe emballage" avec options I, II, III |
| Ce que l'UI DOIT bloquer | Champ optionnel mais recommande |
| Ce que l'UI DOIT expliquer | "I=danger eleve, II=moyen, III=faible" |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #8 : Bouton validation DGR absent

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Bouton 'Valider avant ajout' | ABSENT | UX degradee, erreurs surprises"

L'API de validation existe mais n'est pas exposee.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /api/charges/valider-marchandise-dangereuse" |
| 05-process-metier.md | Retourne { valide, erreurs, avertissements } |

**Regle metier exacte** :
```
Route : POST /api/charges/valider-marchandise-dangereuse
Body : { codeONU, classeONU, quantite, groupeEmballage }
Retour : {
  valide: Boolean,
  erreurs: String[],
  avertissements: String[]
}
Permet validation avant ajout definitif
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Erreurs decouvertes seulement apres soumission |
| Qualite | UX degradee |
| Securite | Aucun (validation backend existe) |
| Audit | Aucun |
| Image | Application incomplete |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton "Verifier" a cote de "Ajouter" |
| Ce que l'UI DOIT bloquer | Rien (validation optionnelle) |
| Ce que l'UI DOIT expliquer | Afficher erreurs et avertissements retournes |
| Ce qui DOIT rester silencieux | OK |

---

## 4. REGLES FRONTEND A RENDRE VISIBLES A L'UTILISATEUR

### Langage utilisateur recommande

| Contexte | Message a afficher |
|----------|-------------------|
| Ajout charge | "Ajouter cette charge augmente la completude de +20%" |
| Champs vides | "Laisser vide si non applicable (different de 0)" |
| Classes passagers | "Attention : total classes (X) != total passagers (Y)" |
| Besoins medicaux | "Oxygene a bord necessiteera equipement special" |
| Code ONU | "Format: UN suivi de 4 chiffres (ex: UN1234)" |
| Groupe emballage | "I=danger eleve, II=moyen, III=faible" |
| Validation DGR | "Cliquez 'Verifier' pour valider la conformite avant ajout" |

---

## 5. REGLES FRONTEND A VERROUILLER (PERMISSIONS / STATUTS)

### Matrice des permissions charges

| Action | AGENT | CHEF | SUPERVISEUR | MANAGER | QUALITE | ADMIN |
|--------|-------|------|-------------|---------|---------|-------|
| Ajouter charge | OUI | OUI | OUI | OUI | **NON** | OUI |
| Modifier charge | OUI | OUI | OUI | OUI | **NON** | OUI |
| Supprimer charge | OUI | OUI | OUI | OUI | **NON** | OUI |
| Ajouter DGR | OUI | OUI | OUI | OUI | **NON** | OUI |

### Verifications par statut CRV

| Statut CRV | Ajout/Modif charges |
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
| Ajout charge avec champs vides | Accepte (null != 0) |
| Ajout charge avec 0 explicite | Accepte, stocke 0 |
| Code ONU invalide | Erreur validation frontend |
| DGR sur charge non-FRET | Section masquee |
| Validation DGR avec erreurs | Affichage erreurs |
| Validation DGR avec avertissements | Affichage avertissements |
| Total classes != passagers | Alerte non bloquante |

### Tests indispensables

| Test | Priorite |
|------|----------|
| Validation format code ONU (regex) | HAUTE |
| Affichage groupe emballage | HAUTE |
| Bouton "Verifier" DGR | MOYENNE |
| Impact completude affiche | MOYENNE |
| Alerte coherence classes | MOYENNE |
| QUALITE bloque sur charges | HAUTE |

### Effets de bord potentiels

| Modification | Effet de bord possible |
|--------------|----------------------|
| Validation code ONU | Blocage si format strict |
| Appel validation DGR | Latence reseau |
| Calcul coherence classes | Calcul temps reel |

---

## SYNTHESE MVS-4-Charges

### Ecarts traites

| # | Ecart | Gravite | Effort estime |
|---|-------|---------|---------------|
| 1 | Impact completude | HAUTE | Faible |
| 2 | Doctrine VIDE/ZERO | MOYENNE | Faible |
| 3 | Types manquants | MOYENNE | Aucun (conforme) |
| 4 | Coherence classes | MOYENNE | Moyen |
| 5 | Besoins medicaux | MINEURE | Faible |
| 6 | Format code ONU | HAUTE | Faible |
| 7 | Groupe emballage | HAUTE | Faible |
| 8 | Bouton validation DGR | MOYENNE | Moyen |

### Priorite de correction

1. **IMMEDIAT** (Conformite DGR) :
   - #6 Format code ONU visible
   - #7 Champ groupe emballage

2. **COURT TERME** (UX critique) :
   - #1 Impact completude
   - #8 Bouton validation DGR

3. **MOYEN TERME** (Ameliorations) :
   - #2 Doctrine VIDE/ZERO
   - #4 Coherence classes
   - #5 Tooltips besoins medicaux

4. **AUCUNE ACTION** :
   - #3 Types conformes au backend

---

**Document genere le 2026-01-10**
**Reference normative : MVS-4-Charges (01-06)**
**Source audit : FRONT-ALIGNEMENT.md**
