# FRONT-ALIGNEMENT - MVS-8-Referentials

## Date d'audit : 2026-01-10
## Reference normative : docs/process/MVS-8-Referentials/05-process-metier.md

---

## PROCESS 1 : LISTE AVIONS

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | GET /api/avions |
| Roles | Tous |
| Filtres | page, limit, compagnie |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.getAll() |
| Vue | Selection avion | Liste deroulante |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Avions disponibles | Liste dans select |
| Filtres possibles | Champs recherche |

### E. Manques frontend identifies

Aucun manque critique.

---

## PROCESS 2 : LECTURE AVION

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | GET /api/avions/:id |
| Roles | Tous |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.getById() |
| Vue | Detail avion | Affichage informations |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Details avion disponibles | Affichage dans CRV |

### E. Manques frontend identifies

Aucun manque critique.

---

## PROCESS 3 : CREATION AVION

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/avions |
| Roles autorises | MANAGER, ADMIN |
| Champs requis | immatriculation, compagnie |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.create() |
| Vue | Interface admin | Non clairement identifiee |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur MANAGER/ADMIN DOIT savoir | Implementation UI |
|------------------------------------------------|-------------------|
| Reserve MANAGER/ADMIN | Route protegee |
| Champs obligatoires | **NON CLAIREMENT EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Interface creation avion | **NON CLAIREMENT IDENTIFIEE** | UX degradee |

---

## PROCESS 4 : MODIFICATION CONFIGURATION (Extension 3)

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | PUT /api/avions/:id/configuration |
| Roles autorises | SUPERVISEUR, MANAGER |
| Effet | Nouvelle version creee automatiquement |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.updateConfiguration() |
| Permissions | AVION_MODIFIER_CONFIG | SUPERVISEUR, MANAGER |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Configuration modifiable | **NON EXPOSE** |
| Versioning automatique | **NON EXPOSE** |
| Reserve SUPERVISEUR/MANAGER | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Interface configuration | **ABSENTE** | Extension 3 inaccessible |

---

## PROCESS 5 : CREATION VERSION (Extension 3)

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/avions/:id/versions |
| Roles autorises | SUPERVISEUR, MANAGER |
| Body | description, configuration |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.createVersion() |
| Permissions | AVION_CREER_VERSION | SUPERVISEUR, MANAGER |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Versioning disponible | **NON EXPOSE** |
| Description optionnelle | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Interface versioning | **ABSENTE** | Fonctionnalite inaccessible |

---

## PROCESS 6 : LISTE VERSIONS

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | GET /api/avions/:id/versions |
| Roles | Tous |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.getVersions() |
| Permissions | AVION_LIRE_VERSIONS | Tous |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Historique versions disponible | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Liste versions | **ABSENTE** | Historique inaccessible |

---

## PROCESS 7 : RESTAURATION VERSION

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/avions/:id/versions/:numero/restaurer |
| Roles autorises | SUPERVISEUR, MANAGER |
| Effet | Configuration restauree depuis version |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.restaurerVersion() |
| Permissions | AVION_RESTAURER_VERSION | SUPERVISEUR, MANAGER |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Restauration possible | **NON EXPOSE** |
| Reserve SUPERVISEUR/MANAGER | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Bouton restauration | **ABSENT** | Fonctionnalite inaccessible |

---

## PROCESS 8 : COMPARAISON VERSIONS

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | GET /api/avions/:id/versions/comparer |
| Params | v1, v2 |
| Roles | Tous |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.comparerVersions() |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Comparaison possible | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Interface comparaison | **ABSENTE** | Fonctionnalite inaccessible |

---

## PROCESS 9 : PLANIFICATION REVISION

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | PUT /api/avions/:id/revision |
| Roles autorises | SUPERVISEUR, MANAGER |
| Types | A, B, C, D |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.planifierRevision() |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Planification revision possible | **NON EXPOSE** |
| 4 types de revision | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Interface planification | **ABSENTE** | Fonctionnalite inaccessible |

---

## PROCESS 10 : REVISIONS PROCHAINES

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | GET /api/avions/revisions/prochaines |
| Roles | Tous |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.getRevisionsProchaines() |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Alertes revisions prochaines | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Dashboard revisions | **ABSENT** | Alertes non visibles |

---

## PROCESS 11 : STATISTIQUES CONFIGURATIONS

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | GET /api/avions/statistiques/configurations |
| Roles | MANAGER |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | avionsAPI.getStatistiquesConfigurations() |
| Vue | **ABSENTE** | Aucune interface |

### C. Statut d'alignement

⚠️ **PARTIEL**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur MANAGER DOIT savoir | Implementation UI |
|------------------------------------------|-------------------|
| Statistiques disponibles | **NON EXPOSE** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Dashboard statistiques | **ABSENT** | Reporting inaccessible |

---

## SYNTHESE MVS-8-Referentials

### Tableau recapitulatif

| Process | Statut | Contrat utilisateur respecte |
|---------|--------|------------------------------|
| Liste avions | ✅ ALIGNE | OUI |
| Lecture avion | ✅ ALIGNE | OUI |
| Creation avion | ⚠️ PARTIEL | NON - interface non identifiee |
| Modification config | ⚠️ PARTIEL | NON - interface absente |
| Creation version | ⚠️ PARTIEL | NON - interface absente |
| Liste versions | ⚠️ PARTIEL | NON - interface absente |
| Restauration version | ⚠️ PARTIEL | NON - interface absente |
| Comparaison versions | ⚠️ PARTIEL | NON - interface absente |
| Planification revision | ⚠️ PARTIEL | NON - interface absente |
| Revisions prochaines | ⚠️ PARTIEL | NON - interface absente |
| Statistiques config | ⚠️ PARTIEL | NON - interface absente |

### Statistiques

| Metrique | Valeur |
|----------|--------|
| Process documentes | 11 |
| ALIGNE | 2 |
| PARTIEL | 9 |
| ABSENT | 0 |
| Taux alignement | **18%** |

### Points bloquants avant production

| Severite | Process | Probleme |
|----------|---------|----------|
| **CRITIQUE** | Extension 3 | Versioning entierement sans UI |
| **CRITIQUE** | Revisions | Planification non accessible |
| HAUTE | Configuration | Interface absente |
| HAUTE | Statistiques | Dashboard absent |

### Contrat utilisateur global MVS-8

**Question cle : L'utilisateur sait-il ce qu'il doit faire et ne peut pas faire ?**

| Aspect | Reponse |
|--------|---------|
| Consulter avions | OUI |
| Creer avion | **PARTIEL** |
| Modifier configuration | **NON** |
| Gerer versions | **NON** |
| Planifier revisions | **NON** |
| Voir statistiques | **NON** |
