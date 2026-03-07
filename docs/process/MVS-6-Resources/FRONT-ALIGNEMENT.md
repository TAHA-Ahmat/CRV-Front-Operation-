# FRONT-ALIGNEMENT - MVS-6-Resources

## Date d'audit : 2026-01-10
## Reference normative : docs/process/MVS-6-Resources/05-process-metier.md

---

## PROCESS 1 : CREATION ENGIN DANS LE PARC

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/engins |
| Roles autorises | MANAGER, ADMIN |
| Champs requis | numeroEngin, typeEngin |
| Contrainte | Unicite numeroEngin |
| Statut initial | DISPONIBLE |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | enginsAPI.create() |
| Vue | Interface admin | Formulaire creation |
| Permissions | MANAGER, ADMIN | Verifie |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Reserve MANAGER/ADMIN | Route protegee |
| Numero engin unique | Message erreur si duplicat |
| Statut initial DISPONIBLE | **NON AFFICHE** |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Renseigner numero engin | Input obligatoire |
| Selectionner type engin | Select avec 15 options |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Creer engin si non MANAGER/ADMIN | Route protegee |
| Creer engin avec numero existant | Erreur 400 |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| Uppercase automatique | NON |
| Verification duplicat | OUI (erreur) |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Normalisation uppercase | NON | Informatif |

---

## PROCESS 2 : AFFECTATION ENGINS A UN CRV

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | PUT /api/crv/:id/engins |
| Roles interdits | QUALITE |
| Body | engins: [{ type, immatriculation, heureDebut, heureFin, usage }] |
| Comportement | Remplacement complet (delete all + create new) |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | enginsAPI.updateCRVEngins() |
| Store | src/stores/crvStore.js | updateEngins() |
| Vue | src/components/crv/CRVEngins.vue | Formulaire complet |
| Enum | src/config/crvEnums.js | TYPE_ENGIN (15 types), USAGE_ENGIN |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| 15 types d'engins disponibles | Select avec options |
| Heures debut/fin optionnelles | Inputs time |
| Usage a selectionner | Select usage |
| QUALITE ne peut pas modifier | Formulaire disabled |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Selectionner type engin | Select obligatoire |
| Renseigner immatriculation | Input |
| Definir heures si necessaire | Inputs time |
| Selectionner usage | Select |
| Cliquer enregistrer | Bouton save |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Modifier si QUALITE | Formulaire disabled |
| Modifier si CRV verrouille | Formulaire disabled |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| Remplacement complet (delete all + create) | **NON** |
| Creation auto engins inexistants | **NON** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Comportement remplacement | NON | Utilisateur pourrait penser additif |
| Creation automatique | NON | Informatif |

---

## PROCESS 3 : AJOUT UNITAIRE ENGIN A CRV

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/crv/:id/engins |
| Roles interdits | QUALITE |
| Prerequis | CRV non verrouille |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | enginsAPI.addToCRV() |
| Vue | CRVEngins.vue | Bouton "+ Ajouter un engin" |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Ajout d'un engin a la fois | Bouton visible |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Cliquer "+ Ajouter un engin" | Bouton action |
| Renseigner les informations | Formulaire |

### E. Manques frontend identifies

Aucun manque critique.

---

## PROCESS 4 : RETRAIT ENGIN D'UN CRV

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | DELETE /api/crv/:id/engins/:affectationId |
| Roles interdits | QUALITE |
| Prerequis | CRV non verrouille |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | enginsAPI.removeFromCRV() |
| Vue | CRVEngins.vue | Bouton "Supprimer" par engin |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Suppression immediate | Bouton visible |
| CRV doit etre non verrouille | Formulaire disabled si verrouille |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Cliquer Supprimer | Bouton par engin |

### E. Manques frontend identifies

Aucun manque critique.

---

## PROCESS 5 : SUPPRESSION ENGIN DU PARC

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | DELETE /api/engins/:id |
| Roles autorises | ADMIN uniquement |
| Contrainte | Aucune affectation existante |
| Erreur | 400 ENGIN_EN_UTILISATION si affectations |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | enginsAPI.delete() |
| Vue | Interface admin | Bouton supprimer |
| Permissions | ADMIN | Verifie |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Reserve ADMIN | Route protegee |
| Impossible si affectations existent | Message erreur |
| Suppression definitive | **Confirmation a verifier** |

| Ce que l'utilisateur ADMIN NE PEUT PAS faire | Comportement |
|----------------------------------------------|--------------|
| Supprimer engin en utilisation | Erreur 400 ENGIN_EN_UTILISATION |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| Verification affectations | OUI (erreur) |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Confirmation suppression | A verifier | Risque suppression accidentelle |

---

## PROCESS 6 : CONSULTATION REFERENTIEL ENGINS

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Routes | GET /api/engins, GET /api/engins/:id |
| | GET /api/engins/disponibles, GET /api/engins/types |
| Roles | Tous |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | enginsAPI.getAll(), getDisponibles(), getTypes() |
| Vue | CRVEngins.vue | Select options |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Engins disponibles | Liste dans select |
| Types d'engins | Options dans select |

### E. Manques frontend identifies

Aucun manque critique.

---

## SYNTHESE MVS-6-Resources

### Tableau recapitulatif

| Process | Statut | Contrat utilisateur respecte |
|---------|--------|------------------------------|
| Creation engin parc | ✅ ALIGNE | OUI |
| Affectation engins CRV | ✅ ALIGNE | PARTIEL - remplacement masque |
| Ajout unitaire | ✅ ALIGNE | OUI |
| Retrait engin CRV | ✅ ALIGNE | OUI |
| Suppression engin parc | ✅ ALIGNE | OUI |
| Consultation referentiel | ✅ ALIGNE | OUI |

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
| MINEURE | Affectation | Comportement remplacement non explicite |
| MINEURE | Creation | Normalisation uppercase non affichee |

### Contrat utilisateur global MVS-6

**Question cle : L'utilisateur sait-il ce qu'il doit faire et ne peut pas faire ?**

| Aspect | Reponse |
|--------|---------|
| Affecter engins a CRV | OUI |
| Ajouter engin au parc | OUI (MANAGER/ADMIN) |
| Supprimer engin du parc | OUI (ADMIN) |
| Retirer engin de CRV | OUI |
| Comportement sauvegarde | **PARTIEL** - remplacement non explicite |
