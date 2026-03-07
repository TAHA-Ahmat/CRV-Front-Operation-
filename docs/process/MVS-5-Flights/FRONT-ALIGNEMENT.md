# FRONT-ALIGNEMENT - MVS-5-Flights

## Date d'audit : 2026-01-10
## Reference normative : docs/process/MVS-5-Flights/05-process-metier.md

---

## PROCESS 1 : CREATION VOL

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/vols |
| Roles interdits | QUALITE |
| Champs requis | numeroVol, typeOperation, compagnieAerienne, codeIATA, dateVol |
| Types | ARRIVEE, DEPART, TURN_AROUND |
| Statut initial | PROGRAMME |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | volsAPI.create() |
| Store | - | Appel direct API |
| Vue | Formulaire CRV | Champs vol |
| Permissions | permissions.js | VOL_CREER |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Champs obligatoires | Marquage * |
| 3 types operation | Select ARRIVEE/DEPART/TURN_AROUND |
| Vol cree avec statut PROGRAMME | **NON AFFICHE** |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Renseigner numero vol | Input obligatoire |
| Selectionner type operation | Select obligatoire |
| Renseigner compagnie | Input obligatoire |
| Selectionner date | Datepicker obligatoire |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Creer vol si QUALITE | Route protegee |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| Statut initial PROGRAMME | NON |
| Populate avion automatique | NON |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Statut initial | NON | Informatif seulement |

---

## PROCESS 2 : LECTURE/LISTE VOLS

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Routes | GET /api/vols, GET /api/vols/:id |
| Roles | Tous (incl QUALITE) |
| Filtres | dateDebut, dateFin, typeOperation, compagnie, page, limit |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | volsAPI.getAll(), volsAPI.getById() |
| Vue | Selection vol | Liste deroulante |
| Permissions | VOL_LIRE | Tous |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Filtres disponibles | Champs de recherche |
| Pagination | Controls pagination |

### E. Manques frontend identifies

Aucun manque critique.

---

## PROCESS 3 : MODIFICATION VOL

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | PATCH /api/vols/:id |
| Roles interdits | QUALITE |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | volsAPI.update() |
| Vue | Formulaire edition | Champs modifiables |
| Permissions | VOL_MODIFIER | Tous sauf QUALITE |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Champs modifiables | Formulaire edition |
| QUALITE ne peut pas modifier | Formulaire disabled |

### E. Manques frontend identifies

Aucun manque critique.

---

## PROCESS 4 : SUPPRESSION VOL

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | DELETE /api/vols/:id |
| Roles | Backend verifie |
| Contrainte | Vol non lie a CRV |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | volsAPI.delete() |
| Vue | Non expose | Bouton absent |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Suppression possible | **NON EXPOSE** |
| Contrainte vol non lie | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Bouton suppression | **ABSENT** | Fonctionnalite inaccessible |

---

## PROCESS 5 : CREATION PROGRAMME VOL (Extension 2)

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/programmes-vol |
| Roles interdits | QUALITE |
| Champs | nomProgramme, compagnieAerienne, typeOperation, recurrence, detailsVol |
| Statut initial | BROUILLON |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | programmesVolAPI.create() |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Programmes disponibles | **NON EXPOSE** |
| Workflow BROUILLON->VALIDE->ACTIF | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Interface programmes | **ABSENTE** | Extension 2 inaccessible |

---

## PROCESS 6 : VALIDATION/ACTIVATION PROGRAMME

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Routes | POST /api/programmes-vol/:id/valider |
|  | POST /api/programmes-vol/:id/activer |
| Roles autorises | SUPERVISEUR, MANAGER |
| Transition | BROUILLON -> VALIDE -> ACTIF |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | programmesVolAPI.valider(), activer() |
| Vue | **ABSENTE** | Aucune interface |
| Permissions | PROGRAMME_VALIDER, PROGRAMME_ACTIVER | SUPERVISEUR, MANAGER |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Reserve SUPERVISEUR/MANAGER | **NON EXPOSE** |
| Prerequis de completude | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Interface validation programme | **ABSENTE** | Workflow incomplet |

---

## PROCESS 7 : LIAISON VOL-PROGRAMME

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/vols/:id/lier-programme |
| Roles interdits | QUALITE |
| Prerequis | Programme actif, coherence compagnie/typeOperation |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | volsAPI.lierProgramme() |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Programme doit etre actif | **NON EXPOSE** |
| Coherence compagnie requise | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Interface liaison | **ABSENTE** | Fonctionnalite inaccessible |

---

## PROCESS 8 : MARQUAGE HORS PROGRAMME

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/vols/:id/marquer-hors-programme |
| Types | CHARTER, VOL_FERRY, MEDICAL, TECHNIQUE, AUTRE |
| Champs | typeVolHorsProgramme, raisonHorsProgramme |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | volsAPI.marquerHorsProgramme() |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Types hors programme | **NON EXPOSE** |
| Raison obligatoire | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Interface hors programme | **ABSENTE** | Fonctionnalite inaccessible |

---

## SYNTHESE MVS-5-Flights

### Tableau recapitulatif

| Process | Statut | Contrat utilisateur respecte |
|---------|--------|------------------------------|
| Creation vol | ✅ ALIGNE | OUI |
| Lecture/Liste vols | ✅ ALIGNE | OUI |
| Modification vol | ✅ ALIGNE | OUI |
| Suppression vol | ⚠️ PARTIEL | NON - bouton absent |
| Creation programme | ⚠️ PARTIEL | NON - interface absente |
| Validation programme | ⚠️ PARTIEL | NON - interface absente |
| Liaison programme | ⚠️ PARTIEL | NON - interface absente |
| Hors programme | ⚠️ PARTIEL | NON - interface absente |

### Statistiques

| Metrique | Valeur |
|----------|--------|
| Process documentes | 8 |
| ALIGNE | 3 |
| PARTIEL | 5 |
| ABSENT | 0 |
| Taux alignement | **38%** |

### Points bloquants avant production

| Severite | Process | Probleme |
|----------|---------|----------|
| **CRITIQUE** | Programmes vol | Extension 2 entierement sans UI |
| HAUTE | Liaison programme | Interface absente |
| HAUTE | Hors programme | Interface absente |
| MOYENNE | Suppression | Bouton absent |

### Contrat utilisateur global MVS-5

**Question cle : L'utilisateur sait-il ce qu'il doit faire et ne peut pas faire ?**

| Aspect | Reponse |
|--------|---------|
| Creer un vol | OUI |
| Modifier un vol | OUI |
| Supprimer un vol | **NON** |
| Gerer programmes saisonniers | **NON** |
| Lier vol a programme | **NON** |
| Marquer vol hors programme | **NON** |
