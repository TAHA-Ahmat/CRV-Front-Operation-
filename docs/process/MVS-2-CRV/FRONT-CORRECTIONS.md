# FRONT-CORRECTIONS - MVS-2-CRV

## Date de correction : 2026-01-10
## Reference : FRONT-ALIGNEMENT.md (audit du 2026-01-10)
## Norme backend : docs/process/MVS-2-CRV/

---

## 1. SYNTHESE DES ECARTS A CORRIGER

| Source | Valeur |
|--------|--------|
| Ecarts totaux identifies | 13 |
| Ecarts CRITIQUES | 5 |
| Ecarts HAUTS | 5 |
| Ecarts MOYENS | 3 |

---

## 2. TABLEAU DE CORRESPONDANCE AUDIT → CORRECTION

| # | Ecart (depuis FRONT-ALIGNEMENT) | Process | Gravite | Fichiers backend de reference |
|---|--------------------------------|---------|---------|-------------------------------|
| 1 | Type operation non deduit du vol | Creation CRV | HAUTE | 02-services.md (deduireTypeOperation) |
| 2 | Format numeroCRV non affiche | Creation CRV | MINEURE | 02-services.md (genererNumeroCRV) |
| 3 | Phases creees auto non indiquees | Creation CRV | MOYENNE | 05-process-metier.md |
| 4 | Seuil 50% completude non explicite | Cycle de vie | **CRITIQUE** | 02-services.md, 05-process-metier.md |
| 5 | Bouton annulation CRV absent | Cycle de vie | **CRITIQUE** | 04-routes.md, 02-services.md |
| 6 | Workflow validation QUALITE stub | Cycle de vie | **CRITIQUE** | 05-process-metier.md (MVS-10) |
| 7 | Transitions possibles partielles | Cycle de vie | HAUTE | 04-routes.md, 05-process-metier.md |
| 8 | Validations champs par type charge | Ajout charge | HAUTE | 04-routes.md (middleware validate) |
| 9 | Impact completude non affiche | Ajout charge | HAUTE | 02-services.md (calculerCompletude) |
| 10 | Types charge incomplets | Ajout charge | MOYENNE | 01-models.md (enum typeCharge) |
| 11 | Bouton suppression CRV absent | Suppression | **CRITIQUE** | 04-routes.md (DELETE /:id) |
| 12 | Avertissement cascade absent | Suppression | HAUTE | 05-process-metier.md |
| 13 | Ponderation completude masquee | Calcul completude | **CRITIQUE** | 02-services.md (calculerCompletude) |

---

## 3. TRAITEMENT DETAILLE DE CHAQUE ECART

---

### ECART #1 : Type operation non deduit du vol

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Type operation devrait etre deduit du vol | NON - selection explicite | Incoherence possible vol ARRIVEE / CRV DEPART"

L'utilisateur peut selectionner manuellement un type operation different de celui du vol, creant une incoherence.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 02-services.md | `deduireTypeOperation(crvId)` : "Le type d'operation n'est JAMAIS choisi a l'avance, il est DEDUIT automatiquement" |
| 05-process-metier.md | "typeOperation selon type CRV" |

**Regle metier exacte** :
```
ARRIVEE : phases arrivee utilisees, horaires arrivee, charges DEBARQUEMENT
DEPART : phases depart utilisees, horaires depart, charges EMBARQUEMENT
TURN_AROUND : indicateurs arrivee + depart presents
Deduction automatique basee sur les donnees saisies
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **CRITIQUE** - Vol ARRIVEE avec CRV DEPART = donnees incoherentes |
| Qualite | Rapports faux, statistiques biaisees |
| Securite | Aucun |
| Audit | Non conforme au cahier des charges |
| Image | Perte de confiance dans les donnees |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Type operation DEDUIT automatiquement (lecture seule) avec explication |
| Ce que l'UI DOIT bloquer | Selection manuelle du type si vol existant |
| Ce que l'UI DOIT expliquer | "Type determine automatiquement selon les donnees saisies (phases, horaires, charges)" |
| Ce qui DOIT rester silencieux | Algorithme de deduction interne |

---

### ECART #2 : Format numeroCRV non affiche

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Format numeroCRV | NON | Informatif"

L'utilisateur ne voit pas le format de generation du numero CRV.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 02-services.md | `genererNumeroCRV()` : "Format: CRV{YY}{MM}{DD}-{NNNN}" |
| 05-process-metier.md | "Generation numeroCRV auto" |

**Regle metier exacte** :
```
Format : CRV{YY}{MM}{DD}-{NNNN}
Exemple : CRV260110-0001 (1er CRV du 10/01/2026)
Sequence 4 chiffres incrementale par jour
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Aucun blocage |
| Qualite | Utilisateur curieux |
| Securite | Aucun |
| Audit | Information utile pour tracabilite |
| Image | Mineur |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Numero CRV genere visible apres creation (deja fait) |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Tooltip : "Numero genere automatiquement au format CRV + date + sequence" |
| Ce qui DOIT rester silencieux | OK tel quel |

---

### ECART #3 : Phases creees automatiquement non indiquees

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Phases creees automatiquement | NON | Utilisateur surpris"

L'utilisateur ne sait pas que les phases sont initialisees automatiquement a la creation.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "initialiserPhasesVol(crvId, typeOperation) - Creation ChronologiePhase pour chaque phase du referentiel" |

**Regle metier exacte** :
```
A la creation du CRV :
- Horaire vide cree automatiquement
- Phases initialisees selon type operation (referentiel)
- Toutes les phases en statut 'NON_COMMENCE'
- Completude initiale = 30% (evenements + observations)
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur surpris de voir phases pre-remplies |
| Qualite | Questions inutiles au support |
| Securite | Aucun |
| Audit | Aucun |
| Image | UX degradee |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Message post-creation : "CRV cree avec phases standard initialisees" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | "Les phases obligatoires ont ete ajoutees automatiquement selon le type de vol" |
| Ce qui DOIT rester silencieux | Logique de selection des phases |

---

### ECART #4 : Seuil 50% completude non explicite (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Seuil 50% completude | NON explicite | Utilisateur tente terminer et echoue"

L'utilisateur ne sait pas qu'il doit atteindre 50% de completude pour terminer un CRV.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "EN_COURS -> TERMINE | POST /:id/terminer | completude >= 50%" |
| 02-services.md | Transition bloquee si completude < 50% |

**Regle metier exacte** :
```
Transition EN_COURS -> TERMINE
Condition : CRV.completude >= 50
Sinon : Erreur 400
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **CRITIQUE** - Echecs terminer en boucle, frustration |
| Qualite | Support submerge de tickets |
| Securite | Aucun |
| Audit | Blocage workflow |
| Image | Perception d'application buguee |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Seuil 50% visible pres de la barre de progression |
| Ce que l'UI DOIT bloquer | Bouton "Terminer" grise si < 50% avec tooltip explicatif |
| Ce que l'UI DOIT expliquer | "Minimum 50% requis pour terminer" + detail manquant |
| Ce qui DOIT rester silencieux | Rien - seuil doit etre totalement explicite |

---

### ECART #5 : Bouton annulation CRV absent (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Bouton annulation CRV | ABSENT | Fonctionnalite inaccessible"

L'API d'annulation existe mais aucun bouton ne permet d'y acceder.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "POST /:id/annuler | annulerCRV | Annuler CRV" |
| 02-services.md | `annulerCRV(crvId, detailsAnnulation, userId)` |
| 04-routes.md | "GET /:id/peut-annuler | verifierPeutAnnuler" |

**Regle metier exacte** :
```
Route : POST /api/crv/:id/annuler
Body : { raisonAnnulation, commentaireAnnulation }
Conditions :
- CRV pas deja annule
- CRV pas VERROUILLE
Resultat : statut -> ANNULE, sauvegarde ancien statut
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **CRITIQUE** - CRV errones non annulables |
| Qualite | Donnees polluees par CRV invalides |
| Securite | Aucun |
| Audit | Non conforme - fonctionnalite prevue absente |
| Image | Application incomplete |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton "Annuler CRV" visible pour SUPERVISEUR/MANAGER |
| Ce que l'UI DOIT bloquer | Bouton grise si CRV VERROUILLE ou deja ANNULE |
| Ce que l'UI DOIT expliquer | Modal avec raison obligatoire + commentaire optionnel |
| Ce qui DOIT rester silencieux | Ancien statut sauvegarde (visible pour reactivation) |

---

### ECART #6 : Workflow validation QUALITE stub (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Workflow validation QUALITE | STUB | Process MVS-10 non fonctionnel"

ValidationCRV.vue est un stub, le workflow de validation n'est pas implemente.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "TERMINE -> VALIDE (validation MVS-10)" |
| MVS-10 | Routes POST /:id/valider, POST /:id/verrouiller |

**Regle metier exacte** :
```
Workflow MVS-10 :
- TERMINE -> VALIDE : POST /api/crv/:id/valider (QUALITE, ADMIN)
- VALIDE -> VERROUILLE : POST /api/crv/:id/verrouiller (QUALITE, ADMIN)
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **CRITIQUE** - Aucun CRV ne peut etre valide/verrouille |
| Qualite | Workflow incomplet, CRV restent TERMINE indefiniment |
| Securite | Aucun verrouillage = modifications possibles indefiniment |
| Audit | **NON CONFORME** - Absence de validation formelle |
| Image | Application inutilisable pour la production |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Interface de validation complete (liste CRV TERMINE, boutons valider/rejeter) |
| Ce que l'UI DOIT bloquer | Validation si role != QUALITE/ADMIN |
| Ce que l'UI DOIT expliquer | Raison rejet obligatoire, criteres de validation |
| Ce qui DOIT rester silencieux | Logique interne de verification |

**Note** : Correction majeure - voir MVS-10-Validation pour details complets.

---

### ECART #7 : Transitions possibles partielles

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Transitions possibles | PARTIELLES | Utilisateur ne sait pas quoi faire"

L'utilisateur ne voit pas toutes les transitions disponibles depuis l'etat actuel.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "GET /:id/transitions | obtenirTransitionsPossibles" |
| 05-process-metier.md | Machine a etats complete |

**Regle metier exacte** :
```
Transitions selon statut :
- BROUILLON : demarrer
- EN_COURS : terminer, annuler
- TERMINE : valider, annuler, retour EN_COURS
- VALIDE : verrouiller
- VERROUILLE : (aucune)
- ANNULE : reactiver
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur bloque, ne sait pas comment avancer |
| Qualite | Support inutile |
| Securite | Aucun |
| Audit | UX non conforme |
| Image | Application peu intuitive |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Toutes les actions possibles selon statut actuel |
| Ce que l'UI DOIT bloquer | Actions non disponibles (grisees avec explication) |
| Ce que l'UI DOIT expliquer | Pour chaque action : prerequis et effet |
| Ce qui DOIT rester silencieux | Details techniques des routes |

---

### ECART #8 : Validations champs par type charge

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Validation champs obligatoires par type | NON | Erreurs 400 surprises"

Les validations specifiques par type de charge ne sont pas visibles avant soumission.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | Middleware `validerCoherenceCharges` |
| 05-process-metier.md | "PASSAGERS requiert passagersAdultes, BAGAGES requiert poids si nombre > 0" |

**Regle metier exacte** :
```
PASSAGERS : passagersAdultes obligatoire (nombre)
BAGAGES : poids obligatoire si nombre > 0
FRET : nombreFret obligatoire
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Erreurs 400 incomprehensibles |
| Qualite | Frustration, abandon de saisie |
| Securite | Aucun |
| Audit | Aucun |
| Image | Application mal concue |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Champs obligatoires marques * selon type selectionne |
| Ce que l'UI DOIT bloquer | Soumission si champs requis manquants |
| Ce que l'UI DOIT expliquer | "Pour PASSAGERS, indiquez le nombre d'adultes" |
| Ce qui DOIT rester silencieux | Rien |

---

### ECART #9 : Impact completude non affiche

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Impact completude | NON | Utilisateur ne comprend pas progression"

L'utilisateur ne sait pas combien ajouter une charge impacte la completude.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 02-services.md | `calculerCompletude()` : "Charges : 30% (20-30 selon nb types)" |

**Regle metier exacte** :
```
0 type charge : +0%
1 type charge : +20%
2 types charges : +25%
3+ types charges : +30%
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur ne sait pas comment progresser |
| Qualite | Saisie incomplete |
| Securite | Aucun |
| Audit | Aucun |
| Image | UX opaque |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Impact prevu avant ajout : "+20% completude" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | "Ajouter des charges augmente la completude jusqu'a +30%" |
| Ce qui DOIT rester silencieux | Formule exacte de calcul |

---

### ECART #10 : Types charge incomplets

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Types COURRIER/MATERIEL (doc) | ABSENTS | Enum incomplet"

L'enum frontend ne contient pas tous les types documentes.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "typeCharge in ['PASSAGERS', 'BAGAGES', 'FRET']" |

**Regle metier exacte** :
```
Backend accepte uniquement : PASSAGERS, BAGAGES, FRET
Les types COURRIER, MATERIEL ne sont PAS dans le backend actuel
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Aucun - enum backend fait foi |
| Qualite | Documentation frontend obsolete |
| Securite | Aucun |
| Audit | Aucun |
| Image | Aucun |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | PASSAGERS, BAGAGES, FRET uniquement (conforme backend) |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Rien |
| Ce qui DOIT rester silencieux | OK |

**Note** : Ecart documentaire, pas de correction frontend necessaire.

---

### ECART #11 : Bouton suppression CRV absent (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Bouton suppression | ABSENT | Fonctionnalite inaccessible"

L'API DELETE existe mais aucun bouton ne permet d'y acceder.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "DELETE /:id | supprimerCRV | protect, authorize('SUPERVISEUR', 'MANAGER')" |
| 05-process-metier.md | Suppression en cascade (phases, charges, evenements, observations, horaire) |

**Regle metier exacte** :
```
Route : DELETE /api/crv/:id
Roles : SUPERVISEUR, MANAGER uniquement
Condition : statut !== 'VERROUILLE'
Effet : Suppression CRV + toutes donnees associees
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **CRITIQUE** - CRV errones non supprimables |
| Qualite | Base polluee |
| Securite | Aucun |
| Audit | Non conforme |
| Image | Application incomplete |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Bouton "Supprimer" visible pour SUPERVISEUR/MANAGER |
| Ce que l'UI DOIT bloquer | Suppression si VERROUILLE |
| Ce que l'UI DOIT expliquer | Modal : "Suppression definitive de toutes les donnees (phases, charges, evenements, observations)" |
| Ce qui DOIT rester silencieux | Details techniques cascade |

---

### ECART #12 : Avertissement cascade absent

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Avertissement cascade | ABSENT | Utilisateur ne sait pas impact"

L'utilisateur ne sait pas que supprimer un CRV supprime aussi toutes les donnees associees.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | Cascade : ChronologiePhase, ChargeOperationnelle, EvenementOperationnel, Observation, Horaire |

**Regle metier exacte** :
```
Suppression CRV entraine :
- ChronologiePhase.deleteMany({ crv })
- ChargeOperationnelle.deleteMany({ crv })
- EvenementOperationnel.deleteMany({ crv })
- Observation.deleteMany({ crv })
- Horaire.findByIdAndDelete()
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Perte donnees non anticipee |
| Qualite | Regrets utilisateur |
| Securite | Aucun |
| Audit | Donnees perdues sans trace |
| Image | Application dangereuse |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Nombre de sous-entites impactees dans modal confirmation |
| Ce que l'UI DOIT bloquer | Confirmation requise avec checkbox "Je comprends" |
| Ce que l'UI DOIT expliquer | "X phases, Y charges, Z evenements seront supprimes definitivement" |
| Ce qui DOIT rester silencieux | Rien - transparence totale |

---

### ECART #13 : Ponderation completude masquee (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Detail ponderation | NON | Utilisateur ne sait pas comment progresser"

L'utilisateur ne connait pas la repartition de la completude.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 02-services.md | `calculerCompletude()` : Phases 40%, Charges 30%, Evenements 20%, Observations 10% |
| 05-process-metier.md | Ponderation officielle identique |

**Regle metier exacte** :
```
Completude = scorePhases + scoreCharges + 20 + 10

Phases (40%) : (terminees / total) * 40
Charges (30%) : 0-30 selon nombre types saisis
Evenements (20%) : TOUJOURS 20 (absence = nominal)
Observations (10%) : TOUJOURS 10 (absence = RAS)

Completude initiale = 30% (evenements + observations automatiques)
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **CRITIQUE** - Utilisateur ne comprend pas progression |
| Qualite | Tentatives aveugles, support submerge |
| Securite | Aucun |
| Audit | UX non conforme |
| Image | Application opaque |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Detail par composant : "Phases: 25/40%, Charges: 20/30%, Evenements: 20%, Observations: 10%" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Tooltip sur barre : "Remplissez les phases pour gagner jusqu'a 40%" |
| Ce qui DOIT rester silencieux | Bonus automatiques evenements/observations peuvent etre mentionnes discretement |

---

## 4. REGLES FRONTEND A RENDRE VISIBLES A L'UTILISATEUR

### Langage utilisateur recommande

| Contexte | Message a afficher |
|----------|-------------------|
| Barre completude | "Completude: 45% - Minimum 50% requis pour terminer" |
| Detail completude | "Phases: X/40% - Charges: Y/30% - Bonus auto: 30%" |
| Bouton Terminer grise | "Atteignez 50% de completude pour terminer le CRV" |
| Ajout charge | "Ajouter cette charge = +20% completude" |
| Suppression CRV | "ATTENTION: Suppression definitive de toutes les donnees associees" |
| Annulation CRV | "Le CRV sera marque comme annule. Vous pourrez le reactiver si necessaire." |
| Creation CRV | "Phases standard initialisees automatiquement" |
| Type operation | "Type determine automatiquement selon vos saisies" |

---

## 5. REGLES FRONTEND A VERROUILLER (PERMISSIONS / STATUTS)

### Matrice des permissions CRV

| Action | AGENT | CHEF | SUPERVISEUR | MANAGER | QUALITE | ADMIN |
|--------|-------|------|-------------|---------|---------|-------|
| Creer CRV | OUI | OUI | OUI | OUI | **NON** | OUI |
| Modifier CRV | OUI | OUI | OUI | OUI | **NON** | OUI |
| Supprimer CRV | NON | NON | **OUI** | **OUI** | NON | OUI |
| Annuler CRV | NON | NON | **OUI** | **OUI** | NON | OUI |
| Valider CRV | NON | NON | NON | NON | **OUI** | **OUI** |
| Verrouiller CRV | NON | NON | NON | NON | **OUI** | **OUI** |

### Verifications par statut

| Statut CRV | Modifications | Suppression | Annulation |
|------------|---------------|-------------|------------|
| BROUILLON | OUI | OUI | OUI |
| EN_COURS | OUI | OUI | OUI |
| TERMINE | OUI | OUI | OUI |
| VALIDE | NON | NON | NON |
| VERROUILLE | **NON** | **NON** | **NON** |
| ANNULE | NON | NON | Reactiver uniquement |

---

## 6. POINTS DE VIGILANCE NON-REGRESSION

### Cas limites a tester

| Scenario | Resultat attendu |
|----------|------------------|
| Terminer CRV a 49% | Bouton grise + message explicatif |
| Terminer CRV a 50% | Succes |
| Supprimer CRV VERROUILLE | Erreur 403 + message |
| Annuler CRV deja annule | Erreur 400 + message |
| QUALITE tente creer CRV | Erreur 403 + redirection |
| Ajouter charge sans type | Validation front bloquante |
| Ajouter PASSAGERS sans adultes | Erreur 400 ou validation front |

### Tests indispensables

| Test | Priorite |
|------|----------|
| Affichage seuil 50% pres de la barre | **CRITIQUE** |
| Bouton Annuler visible pour SUPERVISEUR/MANAGER | **CRITIQUE** |
| Bouton Supprimer visible pour SUPERVISEUR/MANAGER | **CRITIQUE** |
| Detail ponderation dans tooltip/panel | **CRITIQUE** |
| Validations charges par type avant soumission | HAUTE |
| Modal confirmation suppression avec cascade | HAUTE |
| Type operation en lecture seule | HAUTE |

### Effets de bord potentiels

| Modification | Effet de bord possible |
|--------------|----------------------|
| Ajout bouton annulation | Necessite modal avec raison |
| Ajout bouton suppression | Necessite verification cascade avant affichage |
| Detail ponderation | Appels API supplementaires ou calcul local |
| Blocage Terminer | Calcul completude temps reel |

---

## SYNTHESE MVS-2-CRV

### Ecarts traites

| # | Ecart | Gravite | Effort estime |
|---|-------|---------|---------------|
| 1 | Type operation | HAUTE | Moyen |
| 2 | Format numeroCRV | MINEURE | Faible |
| 3 | Phases auto | MOYENNE | Faible |
| 4 | Seuil 50% | **CRITIQUE** | Faible |
| 5 | Bouton annulation | **CRITIQUE** | Moyen |
| 6 | Workflow validation | **CRITIQUE** | **Eleve** (MVS-10) |
| 7 | Transitions | HAUTE | Moyen |
| 8 | Validations charges | HAUTE | Moyen |
| 9 | Impact completude | HAUTE | Faible |
| 10 | Types charge | MINEURE | Aucun |
| 11 | Bouton suppression | **CRITIQUE** | Moyen |
| 12 | Avertissement cascade | HAUTE | Faible |
| 13 | Ponderation | **CRITIQUE** | Faible |

### Priorite de correction

1. **IMMEDIAT** (Bloque production) :
   - #4 Seuil 50% visible
   - #5 Bouton annulation
   - #11 Bouton suppression
   - #13 Ponderation visible

2. **COURT TERME** (Workflow complet) :
   - #6 Validation QUALITE (MVS-10)
   - #7 Transitions completes
   - #8 Validations charges

3. **MOYEN TERME** (Ameliorations UX) :
   - #1 Type operation lecture seule
   - #9 Impact completude
   - #12 Avertissement cascade

4. **OPTIONNEL** :
   - #2 Format numeroCRV
   - #3 Phases auto
   - #10 Types charge (aucune action)

---

**Document genere le 2026-01-10**
**Reference normative : MVS-2-CRV (01-06)**
**Source audit : FRONT-ALIGNEMENT.md**
