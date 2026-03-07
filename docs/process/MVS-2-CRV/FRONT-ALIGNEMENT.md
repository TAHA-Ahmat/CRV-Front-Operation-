# FRONT-ALIGNEMENT - MVS-2-CRV

## Date d'audit : 2026-01-10
## Reference normative : docs/process/MVS-2-CRV/05-process-metier.md

---

## PROCESS 1 : CREATION CRV

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/crv |
| Roles interdits | QUALITE (403) |
| Champs | volId optionnel, type, date |
| Statut initial | BROUILLON |
| Entites creees | CRV + Horaire + ChronologiePhase[] |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | crvAPI.create() |
| Store | src/stores/crvStore.js | createCRV() |
| Vue | src/views/CRV/CRVNouveau.vue | Formulaire |
| Route | src/router/modules/agentRoutes.js | allowedRoles excl QUALITE |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| CRV demarre en statut BROUILLON | Affiche dans header |
| Horaire et phases crees automatiquement | **NON AFFICHE** |
| Vol peut etre cree automatiquement si absent | **NON AFFICHE** |
| QUALITE ne peut pas creer | Bouton masque/route protegee |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Selectionner un vol OU laisser creation auto | Select vol |
| Choisir type operation | Select type (divergence) |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Creer CRV si role QUALITE | 403 + message |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| Generation numeroCRV auto (CRV{YY}{MM}{DD}-{NNNN}) | NON |
| Type operation deduit du vol | **NON** - utilisateur selectionne |
| Phases initialisees automatiquement | NON |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Type operation devrait etre deduit du vol | **NON** - selection explicite | Incoherence possible vol ARRIVEE / CRV DEPART |
| Format numeroCRV | NON | Informatif |
| Phases creees automatiquement | NON | Utilisateur surpris |

---

## PROCESS 2 : CYCLE DE VIE CRV (Machine a etats)

### A. Reference normative

| Transition | Route | Condition |
|------------|-------|-----------|
| BROUILLON -> EN_COURS | POST /:id/demarrer | - |
| EN_COURS -> TERMINE | POST /:id/terminer | completude >= 50% |
| TERMINE -> VALIDE | (MVS-10) | - |
| VALIDE -> VERROUILLE | (MVS-10) | - |
| * -> ANNULE | POST /:id/annuler | non verrouille |

### B. Implementation frontend actuelle

| Transition | Composant | Implementation |
|------------|-----------|----------------|
| Demarrer | CRVArrivee/Depart | Bouton "Demarrer" |
| Terminer | Step 7 vues CRV | Bouton "Terminer" |
| Valider | ValidationCRV.vue | **STUB** |
| Verrouiller | ValidationCRV.vue | **STUB** |
| Annuler | Non expose | API existe, pas de bouton |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Statut actuel du CRV | Affiche dans header |
| Transitions possibles | **PARTIELLEMENT** - pas toutes |
| Seuil 50% pour terminer | **NON AFFICHE CLAIREMENT** |
| CRV verrouille = lecture seule | Formulaires desactives |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Demarrer avant de modifier | Bouton visible |
| Atteindre 50% completude pour terminer | Barre progression |
| Faire valider par QUALITE | **NON - workflow absent** |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Terminer si completude < 50% | Erreur backend |
| Modifier CRV verrouille | Formulaires read-only |
| Annuler CRV verrouille | Erreur |

| Regles backend silencieuses CRITIQUES | Visible UI |
|---------------------------------------|------------|
| Seuil exact 50% pour terminer | **NON explicite** |
| Annulation possible par SUPERVISEUR/MANAGER | **NON - bouton absent** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Seuil 50% completude | NON explicite | Utilisateur tente terminer et echoue |
| Bouton annulation CRV | ABSENT | Fonctionnalite inaccessible |
| Workflow validation QUALITE | STUB | Process MVS-10 non fonctionnel |
| Transitions possibles | PARTIELLES | Utilisateur ne sait pas quoi faire |

---

## PROCESS 3 : AJOUT CHARGE OPERATIONNELLE

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/crv/:id/charges |
| Types | PASSAGERS, BAGAGES, FRET |
| Sens | EMBARQUEMENT, DEBARQUEMENT |
| Impact | Recalcul completude (+30%) |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | crvAPI.addCharge() |
| Vue | src/components/crv/CRVCharges.vue | Formulaire |
| Enum | src/utils/crvEnums.js | TYPE_CHARGE, SENS_OPERATION |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| 3 types de charge disponibles | Select avec 3 options |
| Sens embarquement/debarquement | Select |
| Impact sur completude | **NON AFFICHE** |
| CRV non verrouille requis | Formulaire desactive si verrouille |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Selectionner type charge | Select obligatoire |
| Selectionner sens operation | Select obligatoire |
| Renseigner donnees selon type | Champs conditionnels |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| PASSAGERS requiert passagersAdultes | **NON** - erreur surprise |
| BAGAGES requiert poids si nombre > 0 | **NON** - erreur surprise |
| Ajout charge = +30% completude max | **NON** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Validation champs obligatoires par type | NON | Erreurs 400 surprises |
| Impact completude | NON | Utilisateur ne comprend pas progression |
| Types COURRIER/MATERIEL (doc) | ABSENTS | Enum incomplet |

---

## PROCESS 4 : SUPPRESSION CRV

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | DELETE /api/crv/:id |
| Roles autorises | SUPERVISEUR, MANAGER |
| Contraintes | statut !== VERROUILLE |
| Cascade | Phases, Charges, Evenements, Observations, Horaire |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | crvAPI.delete() |
| Store | src/stores/crvStore.js | deleteCRV() |
| Vue | Non expose clairement | Pas de bouton visible |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Suppression DEFINITIVE | **NON AFFICHE** - pas de bouton |
| Suppression en cascade | **NON AFFICHE** |
| CRV verrouille non supprimable | - |
| Reserve SUPERVISEUR/MANAGER | - |

| Ce que l'utilisateur SUPERVISEUR/MANAGER NE PEUT PAS faire | Comportement |
|------------------------------------------------------------|--------------|
| Supprimer CRV verrouille | 403 CRV_VERROUILLE |

| Regles backend silencieuses CRITIQUES | Visible UI |
|---------------------------------------|------------|
| Suppression cascade toutes donnees | **NON** |
| Restriction role | **NON** - bouton absent |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Bouton suppression | **ABSENT** | Fonctionnalite inaccessible |
| Avertissement cascade | **ABSENT** | Utilisateur ne sait pas impact |
| Restriction roles | **ABSENT** | - |

---

## PROCESS 5 : CALCUL COMPLETUDE

### A. Reference normative

| Composant | Poids |
|-----------|-------|
| Phases | 40% (pro-rata terminees) |
| Charges | 30% (20-30 selon nb types) |
| Evenements | 20% (toujours attribue) |
| Observations | 10% (toujours attribue) |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| Affichage | CRVHeader.vue | Barre progression |
| Calcul | Backend | Delegue |
| Seuil | Backend | Non affiche |

### C. Statut d'alignement

✅ **ALIGNE** (delegue backend)

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Pourcentage actuel | OUI - barre progression |
| Ponderation des composants | **NON AFFICHE** |
| Seuil 50% pour terminer | **NON AFFICHE** |
| Evenements/Observations = bonus auto | **NON AFFICHE** |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Remplir phases pour gagner 40% | **NON explicite** |
| Ajouter charges pour gagner 30% | **NON explicite** |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| 20% evenements auto (absence = nominal) | **NON** |
| 10% observations auto (absence = RAS) | **NON** |
| Doctrine VIDE != ZERO | **NON** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Detail ponderation | NON | Utilisateur ne sait pas comment progresser |
| Bonus auto evenements/observations | NON | Confusion sur la progression |
| Seuil blocage 50% | NON explicite | Echec terminaison surprise |

---

## SYNTHESE MVS-2-CRV

### Tableau recapitulatif

| Process | Statut | Contrat utilisateur respecte |
|---------|--------|------------------------------|
| Creation CRV | ⚠️ PARTIEL | NON - type operation mal gere |
| Cycle de vie | ⚠️ PARTIEL | NON - seuils non affiches |
| Ajout charge | ⚠️ PARTIEL | NON - validations masquees |
| Suppression CRV | ⚠️ PARTIEL | NON - bouton absent |
| Calcul completude | ✅ ALIGNE | NON - ponderation masquee |

### Statistiques

| Metrique | Valeur |
|----------|--------|
| Process documentes | 5 |
| ALIGNE | 1 |
| PARTIEL | 4 |
| ABSENT | 0 |
| Taux alignement | **20%** |

### Points bloquants avant production

| Severite | Process | Probleme |
|----------|---------|----------|
| **CRITIQUE** | Cycle de vie | Seuil 50% non communique |
| **CRITIQUE** | Cycle de vie | Bouton annulation absent |
| **CRITIQUE** | Suppression | Fonctionnalite inaccessible |
| HAUTE | Creation | Type operation divergent |
| HAUTE | Charges | Validations non affichees |
| HAUTE | Completude | Ponderation non expliquee |

### Contrat utilisateur global MVS-2

**Question cle : L'utilisateur sait-il ce qu'il doit faire et ne peut pas faire ?**

| Aspect | Reponse |
|--------|---------|
| Comment progresser dans completude | **NON** |
| Seuil pour terminer | **NON** |
| Comment annuler un CRV | **NON** |
| Validations requises | **NON** |
| Impact de ses actions | **NON** |
