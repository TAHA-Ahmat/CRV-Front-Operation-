# FRONT-ALIGNEMENT - MVS-4-Charges

## Date d'audit : 2026-01-10
## Reference normative : docs/process/MVS-4-Charges/05-process-metier.md

---

## PROCESS 1 : AJOUT CHARGE OPERATIONNELLE

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/crv/:id/charges |
| Roles interdits | QUALITE |
| Types | PASSAGERS, BAGAGES, FRET |
| Sens | EMBARQUEMENT, DEBARQUEMENT |
| Doctrine | Champs null par defaut (VIDE != ZERO) |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | crvAPI.addCharge() |
| Store | src/stores/crvStore.js | addCharge() |
| Vue | src/components/crv/CRVCharges.vue | Formulaire complet |
| Enum | src/config/crvEnums.js | TYPE_CHARGE, SENS_OPERATION |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| 3 types de charge disponibles | Select avec 3 options |
| Sens embarquement/debarquement | Select |
| Champs conditionnels par type | Formulaire adaptatif |
| QUALITE ne peut pas ajouter | Section disabled |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Selectionner type charge | Select obligatoire |
| Selectionner sens operation | Select obligatoire |
| Renseigner donnees specifiques | Champs conditionnels |
| Cliquer "Ajouter la charge" | Bouton action |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Ajouter sans type/sens | Bouton disabled |
| Ajouter si QUALITE | Section cachee |
| Ajouter si CRV verrouille | Formulaire disabled |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| PASSAGERS requiert passagersAdultes | **PARTIEL** - champ marque * |
| BAGAGES requiert nombreBagagesSoute | **PARTIEL** - champ marque * |
| FRET requiert nombreFret | **PARTIEL** - champ marque * |
| Impact completude +30% max | **NON** |
| Doctrine VIDE != ZERO | **NON explicite** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Impact completude | **NON** | Utilisateur ne comprend pas progression |
| Doctrine VIDE != ZERO | **NON** | Confusion entre absent et zero |
| Types COURRIER/MATERIEL | ABSENTS de l'enum | Fonctionnalites reduites |

---

## PROCESS 2 : MODIFICATION CATEGORIES DETAILLEES (Extension 4)

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | PUT /api/charges/:id/categories-detaillees |
| Roles interdits | QUALITE |
| Categories | bebes, enfants, adolescents, adultes, seniors, PMR, transit, VIP, equipage, deportes |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | chargesAPI.updateCategoriesDetaillees() |
| Vue | CRVCharges.vue | Formulaire dans section PASSAGERS |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Categories detaillees disponibles | Formulaire affiche |
| 13 categories possibles | Champs numeriques |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Renseigner les categories pertinentes | Inputs numeriques |
| Enregistrer | Bouton save |

### E. Manques frontend identifies

Aucun manque critique.

---

## PROCESS 3 : MODIFICATION CLASSES PASSAGERS

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | PUT /api/charges/:id/classes |
| Roles interdits | QUALITE |
| Classes | premiere, affaires, economique |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | chargesAPI.updateClasses() |
| Vue | CRVCharges.vue | Formulaire classes |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| 3 classes disponibles | Champs numeriques |
| Total doit correspondre aux passagers | **NON VERIFIE** |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Renseigner nombre par classe | Inputs |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Coherence total classes/passagers | NON | Donnees potentiellement incoherentes |

---

## PROCESS 4 : MODIFICATION BESOINS MEDICAUX

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | PUT /api/charges/:id/besoins-medicaux |
| Champs | oxygeneBord, brancardier, accompagnementMedical |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | chargesAPI.updateBesoinsMedicaux() |
| Vue | CRVCharges.vue | Checkboxes |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Besoins medicaux optionnels | Checkboxes |
| Impact operationnel | **NON EXPLICITE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Implications operationnelles | NON | Utilisateur ne sait pas les consequences |

---

## PROCESS 5 : AJOUT MARCHANDISE DANGEREUSE (Extension 5)

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/charges/:id/marchandises-dangereuses |
| Roles interdits | QUALITE |
| Prerequis | typeCharge = FRET |
| Champs requis | codeONU, classeONU, designationOfficielle |
| Classes ONU | 1 a 9 |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | chargesAPI.addMarchandiseDangereuse() |
| Vue | CRVCharges.vue | Section DGR dans FRET |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Reserve aux charges FRET | Section visible si FRET |
| Code ONU format UN+4 chiffres | **NON EXPLICITE** |
| Classe ONU 1 a 9 | Select avec options |
| Designation obligatoire | Champ requis |
| Reglementation IATA | **NON** |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Renseigner code ONU | Input |
| Selectionner classe ONU | Select |
| Renseigner designation | Input |
| Ajouter | Bouton |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Ajouter DGR sans code ONU | Erreur validation |
| Ajouter DGR sur charge non-FRET | Section masquee |

| Regles backend silencieuses CRITIQUES | Visible UI |
|---------------------------------------|------------|
| Format code ONU (UN + 4 chiffres) | **NON** |
| Groupe emballage (I, II, III) | **NON** |
| Validation reglementaire | **NON** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Validation format code ONU | **NON** | Erreur 400 surprise |
| Groupe emballage | **NON** | Donnees incompletes |
| Avertissements reglementaires | **NON** | Risque conformite |

---

## PROCESS 6 : VALIDATION MARCHANDISE DANGEREUSE

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/charges/valider-marchandise-dangereuse |
| Retour | { valide, erreurs, avertissements } |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | chargesAPI.validerMarchandiseDangereuse() |
| Vue | Non expose | Pas de bouton "Valider avant ajout" |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Validation pre-ajout possible | **NON EXPOSE** |
| Erreurs vs avertissements | **NON** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Bouton "Valider avant ajout" | **ABSENT** | UX degradee, erreurs surprises |

---

## PROCESS 7 : STATISTIQUES CHARGES

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Routes | GET /api/charges/statistiques/passagers |
|  | GET /api/charges/statistiques/fret |
|  | GET /api/charges/crv/:crvId/statistiques-passagers |
|  | GET /api/charges/crv/:crvId/statistiques-fret |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | chargesAPI.getStatistiques*() |
| Vue | Dashboard | Affichage statistiques |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Statistiques disponibles | Affichees dans dashboard |

### E. Manques frontend identifies

Aucun manque critique.

---

## SYNTHESE MVS-4-Charges

### Tableau recapitulatif

| Process | Statut | Contrat utilisateur respecte |
|---------|--------|------------------------------|
| Ajout charge | ✅ ALIGNE | PARTIEL - validations masquees |
| Categories detaillees | ✅ ALIGNE | OUI |
| Classes passagers | ✅ ALIGNE | OUI |
| Besoins medicaux | ✅ ALIGNE | OUI |
| Ajout DGR | ✅ ALIGNE | NON - validations masquees |
| Validation DGR | ⚠️ PARTIEL | NON - non expose |
| Statistiques | ✅ ALIGNE | OUI |

### Statistiques

| Metrique | Valeur |
|----------|--------|
| Process documentes | 7 |
| ALIGNE | 6 |
| PARTIEL | 1 |
| ABSENT | 0 |
| Taux alignement | **86%** |

### Points bloquants avant production

| Severite | Process | Probleme |
|----------|---------|----------|
| HAUTE | Ajout charge | Types COURRIER/MATERIEL manquants |
| HAUTE | DGR | Validations non affichees |
| MOYENNE | Validation DGR | Non expose dans UI |

### Contrat utilisateur global MVS-4

**Question cle : L'utilisateur sait-il ce qu'il doit faire et ne peut pas faire ?**

| Aspect | Reponse |
|--------|---------|
| Ajouter charge basique | OUI |
| Utiliser categories detaillees | OUI |
| Ajouter marchandise dangereuse | **PARTIEL** |
| Valider DGR avant ajout | **NON** |
| Impact sur completude | **NON** |
