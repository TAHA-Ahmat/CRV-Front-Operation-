# FRONT-ALIGNEMENT - MVS-3-Phases

## Date d'audit : 2026-01-10
## Reference normative : docs/process/MVS-3-Phases/05-process-metier.md

---

## PROCESS 1 : DEMARRAGE PHASE

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/phases/:id/demarrer |
| Roles interdits | QUALITE (excludeQualite middleware) |
| Prerequis | verifierPrerequisPhase(), statut = NON_COMMENCE |
| Transition | NON_COMMENCE -> EN_COURS |
| Effet | heureDebutReelle = maintenant |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | phasesAPI.demarrer() |
| Store | src/stores/crvStore.js | demarrerPhase() |
| Vue | src/components/crv/CRVPhases.vue | Bouton "Saisir les heures" |
| Permissions | canEdit(role) | QUALITE = disabled |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Phase doit etre NON_COMMENCE | Bouton visible si NON_COMMENCE |
| QUALITE ne peut pas demarrer | Formulaire disabled |
| Heure debut enregistree automatiquement | **PARTIEL** - saisie manuelle |
| CRV doit etre non verrouille | Formulaire disabled si verrouille |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Saisir heure de debut | Input time obligatoire |
| Cliquer "Enregistrer (En cours)" | Bouton action |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Demarrer si prerequis non satisfaits | Erreur backend 400 |
| Demarrer phase deja en cours | Bouton masque |
| Demarrer si QUALITE | Formulaire disabled |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| verifierPrerequisPhase() | **NON** |
| verifierCoherencePhaseTypeOperation | **NON** |
| responsable = userId automatique | NON |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Prerequis de phase | **NON** | Echec surprise si prerequis non satisfait |
| Coherence type operation | **NON** | Phases inadaptees possibles |

---

## PROCESS 2 : TERMINAISON PHASE

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/phases/:id/terminer |
| Roles interdits | QUALITE |
| Prerequis | statut = EN_COURS |
| Transition | EN_COURS -> TERMINE |
| Effets | heureFinReelle, dureeReelleMinutes, ecartMinutes calcules |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | phasesAPI.terminer() |
| Store | src/stores/crvStore.js | terminerPhase() |
| Vue | CRVPhases.vue | Bouton "Terminer la phase" |
| Affichage duree | Calcul backend | Affiche dans carte phase |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Phase doit etre EN_COURS | Bouton visible si EN_COURS |
| Duree calculee automatiquement | Affiche apres enregistrement |
| Ecart SLA affiche | Couleur selon depassement |
| QUALITE ne peut pas terminer | Formulaire disabled |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Saisir heure de fin | Input time obligatoire |
| Cliquer "Terminer la phase" | Bouton action |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Terminer phase non demarree | Bouton masque |
| Terminer si QUALITE | Formulaire disabled |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| Calcul dureeReelleMinutes | OUI (affiche) |
| Calcul ecartMinutes | OUI (affiche) |
| Recalcul completude CRV | **NON explicite** |
| +40% completude prorata phases | **NON** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Impact sur completude CRV | **NON explicite** | Utilisateur ne comprend pas progression |

---

## PROCESS 3 : MARQUAGE NON REALISE

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/phases/:id/non-realise |
| Roles interdits | QUALITE |
| Body | motifNonRealisation, detailMotif |
| Transition | * -> NON_REALISE |
| Contrainte | detailMotif requis si motif = AUTRE |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | phasesAPI.marquerNonRealise() |
| Store | src/stores/crvStore.js | marquerPhaseNonRealisee() |
| Vue | CRVPhases.vue | Bouton "Non realisee" + formulaire |
| Validation | canSubmitNonRealise computed | detailMotif requis si AUTRE |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Motif obligatoire | Select avec options |
| Detail obligatoire si AUTRE | Message explicite + champ required |
| 5 motifs disponibles | NON_NECESSAIRE, EQUIPEMENT_INDISPONIBLE, PERSONNEL_ABSENT, CONDITIONS_METEO, AUTRE |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Selectionner motif | Select obligatoire |
| Renseigner detail si AUTRE | Textarea avec asterisque |
| Confirmer | Bouton "Confirmer non realisee" |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Valider sans motif | Bouton disabled |
| Valider motif AUTRE sans detail | Bouton disabled + message |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| Reset heures a null | **NON** |
| Recalcul completude | **NON** |
| verifierJustificationNonRealisation | OUI (validation frontend) |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Reset des heures | NON | Informatif seulement |
| Impact completude | NON | Utilisateur ne sait pas l'effet |

---

## PROCESS 4 : MODIFICATION PHASE

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | PATCH /api/phases/:id |
| Roles interdits | QUALITE |
| Champs | personnelAffecte, equipementsUtilises, dureePrevue, remarques |
| Contrainte | CRV non verrouille |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | phasesAPI.update() |
| Store | src/stores/crvStore.js | updatePhase() |
| Vue | CRVPhases.vue | Formulaire edition |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Champs optionnels modifiables | Formulaire |
| CRV doit etre non verrouille | Formulaire disabled si verrouille |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Modifier champs souhaites | Inputs |
| Enregistrer | Bouton save |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Modifier si CRV verrouille | Formulaire disabled |
| Modifier si QUALITE | Formulaire disabled |

### E. Manques frontend identifies

Aucun manque critique.

---

## PROCESS 5 : SAISIE MANUELLE HORAIRES

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | PUT /api/crv/:crvId/phases/:phaseId |
| Roles interdits | QUALITE |
| Champs | heureDebutReelle, heureFinReelle, statut, remarques |
| Format | HH:mm |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | phasesAPI.updateManuel() |
| Vue | CRVPhases.vue | Inputs time |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Format HH:mm | Input type="time" |
| Modification directe possible | Champs editables |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Saisir heures au format HH:mm | Input time |
| Enregistrer | Bouton action |

### E. Manques frontend identifies

Aucun manque critique.

---

## PROCESS 6 : CALCUL ECARTS SLA

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Calcul | Backend (dureeReelle - dureePrevue) |
| Seuils | Backend configurable |
| Couleur | Rouge si depassement |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| Calcul | Backend | Delegue |
| Affichage | CRVPhases.vue | ecartMinutes affiche |
| Couleur | CSS conditionnel | Rouge/vert selon ecart |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Ecart calcule automatiquement | Affiche dans carte |
| Couleur indique depassement | CSS rouge/vert |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| Seuils SLA configurables | **NON** |
| Formule calcul ecart | **NON** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Seuils SLA | NON | Utilisateur ne connait pas les limites |

---

## SYNTHESE MVS-3-Phases

### Tableau recapitulatif

| Process | Statut | Contrat utilisateur respecte |
|---------|--------|------------------------------|
| Demarrage phase | ✅ ALIGNE | PARTIEL - prerequis masques |
| Terminaison phase | ✅ ALIGNE | PARTIEL - impact completude masque |
| Marquage non realise | ✅ ALIGNE | OUI |
| Modification phase | ✅ ALIGNE | OUI |
| Saisie manuelle | ✅ ALIGNE | OUI |
| Calcul ecarts SLA | ✅ ALIGNE | PARTIEL - seuils masques |

### Statistiques

| Metrique | Valeur |
|----------|--------|
| Process documentes | 6 |
| ALIGNE | 6 |
| PARTIEL | 0 |
| ABSENT | 0 |
| Taux alignement | **100%** |

### Points d'attention (non bloquants)

| Severite | Process | Probleme |
|----------|---------|----------|
| MINEURE | Demarrer | Prerequis phase non affiches |
| MINEURE | Terminer | Impact completude non explicite |
| MINEURE | SLA | Seuils non communiques |

### Contrat utilisateur global MVS-3

**Question cle : L'utilisateur sait-il ce qu'il doit faire et ne peut pas faire ?**

| Aspect | Reponse |
|--------|---------|
| Demarrer une phase | OUI |
| Terminer une phase | OUI |
| Marquer non realisee | OUI |
| Impact sur progression CRV | **PARTIEL** |
| Prerequis de phase | **NON** |
| Seuils SLA | **NON** |
