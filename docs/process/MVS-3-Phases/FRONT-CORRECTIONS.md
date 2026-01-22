# FRONT-CORRECTIONS - MVS-3-Phases

## Date de correction : 2026-01-10
## Reference : FRONT-ALIGNEMENT.md (audit du 2026-01-10)
## Norme backend : docs/process/MVS-3-Phases/

---

## 1. SYNTHESE DES ECARTS A CORRIGER

| Source | Valeur |
|--------|--------|
| Ecarts totaux identifies | 6 |
| Ecarts CRITIQUES | 0 |
| Ecarts HAUTS | 0 |
| Ecarts MOYENS | 2 |
| Ecarts MINEURS | 4 |

**Note** : MVS-3 est aligne a 100%. Les ecarts identifies sont des ameliorations UX, non des blocages.

---

## 2. TABLEAU DE CORRESPONDANCE AUDIT → CORRECTION

| # | Ecart (depuis FRONT-ALIGNEMENT) | Process | Gravite | Fichiers backend de reference |
|---|--------------------------------|---------|---------|-------------------------------|
| 1 | Prerequis de phase non affiches | Demarrage | MOYENNE | 02-services.md (verifierPrerequisPhase) |
| 2 | Coherence type operation masquee | Demarrage | MINEURE | 05-process-metier.md |
| 3 | Impact completude non explicite | Terminaison | MOYENNE | 02-services.md, MVS-2 (calculerCompletude) |
| 4 | Reset heures non indique | Marquage non realise | MINEURE | 05-process-metier.md |
| 5 | Impact completude non indique | Marquage non realise | MINEURE | 05-process-metier.md |
| 6 | Seuils SLA non communiques | Calcul ecarts | MINEURE | 02-services.md |

---

## 3. TRAITEMENT DETAILLE DE CHAQUE ECART

---

### ECART #1 : Prerequis de phase non affiches

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Prerequis de phase | NON | Echec surprise si prerequis non satisfait"

L'utilisateur peut tenter de demarrer une phase sans savoir que des prerequis existent.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 02-services.md | `verifierPrerequisPhase(chronoPhaseId)` : "Pour chaque prerequis, verifier qu'il est TERMINE ou NON_REALISE" |
| 05-process-metier.md | "verifierPrerequisPhase() - Si echec: throw Error('Prerequis non satisfaits')" |

**Regle metier exacte** :
```
Avant demarrage d'une phase :
1. Charger la phase avec ses prerequis (Phase.prerequis[])
2. Verifier que chaque prerequis est TERMINE ou NON_REALISE
3. Si non : erreur 400 "Prerequis non satisfaits"
Retour : { valide: Boolean, prerequisManquants: Array }
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Echec inattendu lors du demarrage |
| Qualite | Frustration utilisateur, support sollicite |
| Securite | Aucun |
| Audit | Aucun |
| Image | Application peu intuitive |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Liste des prerequis pour chaque phase, avec statut (OK / manquant) |
| Ce que l'UI DOIT bloquer | Bouton "Demarrer" grise si prerequis manquants |
| Ce que l'UI DOIT expliquer | "Cette phase necessite : [Phase X] terminee" |
| Ce qui DOIT rester silencieux | Logique interne de verification |

---

### ECART #2 : Coherence type operation masquee

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Coherence type operation | NON | Phases inadaptees possibles"

L'utilisateur ne sait pas quelles phases correspondent a quel type d'operation.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | Middleware `verifierCoherencePhaseTypeOperation` |
| 02-services.md | "Le type d'operation n'est PAS filtre a la creation. Il sera deduit des phases utilisees." |

**Regle metier exacte** :
```
Phases ARRIVEE : debarquement, accueil passagers, etc.
Phases DEPART : embarquement, preparation cabine, etc.
Phases TURN_AROUND : les deux categories
Type deduit automatiquement selon phases utilisees
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Confusion possible sur les phases a remplir |
| Qualite | Phases inutiles renseignees |
| Securite | Aucun |
| Audit | Aucun |
| Image | UX legèrement confuse |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Groupement visuel des phases par type (ARRIVEE / DEPART) |
| Ce que l'UI DOIT bloquer | Rien (toutes phases accessibles) |
| Ce que l'UI DOIT expliquer | Tag "ARRIVEE" / "DEPART" sur chaque phase |
| Ce qui DOIT rester silencieux | Logique de deduction du type |

---

### ECART #3 : Impact completude non explicite (Terminaison)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Impact sur completude CRV | NON explicite | Utilisateur ne comprend pas progression"

L'utilisateur ne voit pas l'impact de terminer une phase sur la completude du CRV.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "crv.service::calculerCompletude(crvId)" appele apres terminaison |
| MVS-2/02-services.md | "Phases : 40% (pro-rata des phases terminees/non-realisees)" |

**Regle metier exacte** :
```
Score phases = (phases terminees ou non-realisees / total phases) * 40
Exemple : 5 phases sur 10 terminees = 20% de completude
Terminer une phase = recalcul immediat de la completude
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur ne comprend pas comment progresser |
| Qualite | Motivation utilisateur degradee |
| Securite | Aucun |
| Audit | Aucun |
| Image | UX opaque |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Compteur "X/Y phases terminees = Z% completude" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | "Terminer cette phase ajoutera +X% a la completude" |
| Ce qui DOIT rester silencieux | Formule exacte de calcul |

---

### ECART #4 : Reset heures non indique (Marquage non realise)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Reset des heures | NON | Informatif seulement"

L'utilisateur ne sait pas que marquer une phase non realisee remet les heures a null.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | Hook pre-save : "Reset heureDebutReelle = null, heureFinReelle = null, dureeReelleMinutes = null" |

**Regle metier exacte** :
```
Marquage NON_REALISE :
- heureDebutReelle = null
- heureFinReelle = null
- dureeReelleMinutes = null
- Motif et detail conserves
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur pourrait etre surpris de voir les heures disparaitre |
| Qualite | Mineure |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Note dans modal : "Les heures saisies seront effacees" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Comportement attendu |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #5 : Impact completude non indique (Marquage non realise)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Impact completude | NON | Utilisateur ne sait pas l'effet"

L'utilisateur ne sait pas que marquer une phase non realisee compte comme phase completee pour la completude.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | calculerCompletude appele apres marquage |
| MVS-2/02-services.md | "phases terminees/non-realisees" - les deux comptent |

**Regle metier exacte** :
```
Pour le calcul de completude :
- Phase TERMINE = compte comme faite
- Phase NON_REALISE = compte comme faite (avec justification)
- Seules les phases NON_COMMENCE ou EN_COURS sont "non faites"
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur pourrait hesiter a marquer non realise |
| Qualite | Mineure |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Note : "Une phase non realisee compte comme completee dans la progression" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Que la completude augmentera |
| Ce qui DOIT rester silencieux | Formule de calcul |

---

### ECART #6 : Seuils SLA non communiques

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Seuils SLA | NON | Utilisateur ne connait pas les limites"

L'utilisateur voit les ecarts mais ne connait pas les seuils consideres comme depassements.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 02-services.md | "Seuils : Backend configurable" |
| 05-process-metier.md | "Rouge si depassement" |

**Regle metier exacte** :
```
Ecart = dureeReelle - dureePrevue
Seuil alerte : configurable par phase/compagnie
Rouge : si ecart > seuil
Vert : si ecart <= seuil
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur ne sait pas quand un ecart est critique |
| Qualite | Manque de contexte |
| Securite | Aucun |
| Audit | Information utile pour analyse |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Seuil de tolerance affiché : "Tolerance: 15 min" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | "Ecart > 15 min = depassement SLA" |
| Ce qui DOIT rester silencieux | Configuration backend des seuils |

---

## 4. REGLES FRONTEND A RENDRE VISIBLES A L'UTILISATEUR

### Langage utilisateur recommande

| Contexte | Message a afficher |
|----------|-------------------|
| Phase avec prerequis | "Prerequis : [Phase X] doit etre terminee avant de commencer" |
| Bouton demarrer bloque | "Terminez d'abord la phase [X]" |
| Terminaison phase | "Phase terminee - Completude +X%" |
| Marquage non realise | "Les heures seront effacees. Cette phase comptera comme terminee." |
| Ecart SLA rouge | "Depassement de X minutes (tolerance: 15 min)" |
| Progression phases | "5/10 phases terminees = 20% completude phases" |

---

## 5. REGLES FRONTEND A VERROUILLER (PERMISSIONS / STATUTS)

### Matrice des permissions phases

| Action | AGENT | CHEF | SUPERVISEUR | MANAGER | QUALITE | ADMIN |
|--------|-------|------|-------------|---------|---------|-------|
| Demarrer phase | OUI | OUI | OUI | OUI | **NON** | OUI |
| Terminer phase | OUI | OUI | OUI | OUI | **NON** | OUI |
| Marquer non realise | OUI | OUI | OUI | OUI | **NON** | OUI |
| Modifier phase | OUI | OUI | OUI | OUI | **NON** | OUI |

### Verifications par statut phase

| Statut phase | Demarrer | Terminer | Marquer NR |
|--------------|----------|----------|------------|
| NON_COMMENCE | **OUI** (si prerequis OK) | NON | OUI |
| EN_COURS | NON | **OUI** | OUI |
| TERMINE | NON | NON | OUI |
| NON_REALISE | NON | NON | NON (deja fait) |

### Verifications CRV

| Statut CRV | Modifications phases |
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
| Demarrer phase avec prerequis manquant | Erreur 400 + message explicatif |
| Terminer phase NON_COMMENCE | Impossible (bouton masque) |
| Marquer non realisee phase TERMINE | Possible (reset heures) |
| QUALITE tente modifier phase | Formulaire disabled |
| Modifier phase sur CRV VERROUILLE | Formulaire disabled |

### Tests indispensables

| Test | Priorite |
|------|----------|
| Affichage prerequis par phase | MOYENNE |
| Bouton demarrer grise si prerequis manquants | MOYENNE |
| Compteur phases terminees visible | MOYENNE |
| Couleur ecart SLA correcte | HAUTE |
| QUALITE bloque sur toutes modifications | HAUTE |
| CRV verrouille = phases read-only | HAUTE |

### Effets de bord potentiels

| Modification | Effet de bord possible |
|--------------|----------------------|
| Affichage prerequis | Appel API supplementaire pour charger les relations |
| Compteur temps reel | Recalcul a chaque modification de phase |
| Seuils SLA | Necessite endpoint pour recuperer configuration |

---

## SYNTHESE MVS-3-Phases

### Ecarts traites

| # | Ecart | Gravite | Effort estime |
|---|-------|---------|---------------|
| 1 | Prerequis affiches | MOYENNE | Moyen |
| 2 | Coherence type operation | MINEURE | Faible |
| 3 | Impact completude (terminer) | MOYENNE | Faible |
| 4 | Reset heures (non realise) | MINEURE | Faible |
| 5 | Impact completude (non realise) | MINEURE | Faible |
| 6 | Seuils SLA | MINEURE | Faible |

### Priorite de correction

1. **COURT TERME** (Ameliorations UX prioritaires) :
   - #1 Affichage prerequis
   - #3 Impact completude visible

2. **MOYEN TERME** (Ameliorations UX secondaires) :
   - #6 Seuils SLA visibles
   - #2 Tags type operation

3. **OPTIONNEL** (Informations secondaires) :
   - #4 Reset heures
   - #5 Impact non realise

---

**Document genere le 2026-01-10**
**Reference normative : MVS-3-Phases (01-06)**
**Source audit : FRONT-ALIGNEMENT.md**
