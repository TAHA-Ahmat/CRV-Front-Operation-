# FRONT-ALIGNEMENT - MVS-9-Transversal

## Date d'audit : 2026-01-10
## Reference : docs/process/MVS-9-Transversal/05-process-metier.md

---

## ANALYSE PROCESS PAR PROCESS

### PROCESS 1 : AFFECTATION PERSONNEL VOL

| Critere | Attendu MVS | Frontend | Alignement |
|---------|-------------|----------|------------|
| Route | PUT /api/crv/:id/personnel | crvAPI.updatePersonnel() | ALIGNE |
| Store | - | crvStore (via CRV) | ALIGNE |
| Vue | - | CRVPersonnes.vue | ALIGNE |
| Champs | nom, prenom, fonction, matricule, telephone, remarques | Formulaire | ALIGNE |

**Roles documentes vs implementes :**

| Role MVS | Frontend (crvEnums) | Alignement |
|----------|---------------------|------------|
| CHEF_AVION | Non trouve | ABSENT |
| AGENT_TRAFIC | Non trouve | ABSENT |
| AGENT_PISTE | Non trouve | ABSENT |
| AGENT_BAGAGES | Non trouve | ABSENT |
| AGENT_FRET | Non trouve | ABSENT |
| SUPERVISEUR | Non trouve | ABSENT |
| COORDINATEUR | Non trouve | ABSENT |

**Ecart identifie :**
- Type : PARTIEL
- Nature : Enum
- Detail : Frontend utilise champ libre "fonction" au lieu d'enum de roles

**Verdict : PARTIEL**

---

### PROCESS 2 : AJOUT PERSONNE

| Critere | Attendu MVS | Frontend | Alignement |
|---------|-------------|----------|------------|
| Route | POST /api/crv/:id/personnel | crvAPI.addPersonne() | ALIGNE |
| Store | - | Non (appel direct) | ALIGNE |
| Vue | - | CRVPersonnes.vue | ALIGNE |
| Validation | Backend | Delegue backend | ALIGNE |

**Verdict : ALIGNE**

---

### PROCESS 3 : SUPPRESSION PERSONNE

| Critere | Attendu MVS | Frontend | Alignement |
|---------|-------------|----------|------------|
| Route | DELETE /api/crv/:id/personnel/:personneId | crvAPI.removePersonne() | ALIGNE |
| Store | - | Non (appel direct) | ALIGNE |
| Vue | - | Bouton supprimer | ALIGNE |

**Verdict : ALIGNE**

---

### PROCESS 4 : DECLARATION EVENEMENT OPERATIONNEL

| Critere | Attendu MVS | Frontend | Alignement |
|---------|-------------|----------|------------|
| Route | POST /api/crv/:id/evenements | crvAPI.addEvenement() | ALIGNE |
| Store | - | Non (appel direct) | ALIGNE |
| Vue | - | CRVEvenements.vue | ALIGNE |
| Champs | typeEvenement, gravite, description, heureDebut, heureFin | Formulaire | ALIGNE |

**Types evenement documentes vs implementes :**

| Type MVS | Frontend (crvEnums) | Alignement |
|----------|---------------------|------------|
| RETARD_PASSAGERS | RETARD | PARTIEL |
| RETARD_BAGAGES | RETARD | PARTIEL |
| RETARD_FRET | RETARD | PARTIEL |
| RETARD_CARBURANT | RETARD | PARTIEL |
| RETARD_EQUIPAGE | RETARD | PARTIEL |
| RETARD_TECHNIQUE | TECHNIQUE | PARTIEL |
| RETARD_METEO | METEO | PARTIEL |
| RETARD_ATC | Non trouve | ABSENT |
| INCIDENT_SECURITE | SECURITE | ALIGNE |
| INCIDENT_SURETE | Non trouve | ABSENT |
| INCIDENT_TECHNIQUE | TECHNIQUE | ALIGNE |
| CHANGEMENT_PORTE | Non trouve | ABSENT |
| CHANGEMENT_STAND | Non trouve | ABSENT |
| AUTRE | AUTRE | ALIGNE |

**Frontend implemente :**
- RETARD (generalise)
- TECHNIQUE
- METEO
- SECURITE
- OPERATIONNEL
- PASSAGERS
- AUTRE

**Ecart identifie :**
- Type : PARTIEL
- Nature : Enum
- Detail : Frontend simplifie les types (7 vs 14 documentes)

**Verdict : PARTIEL**

---

### PROCESS 5 : GRAVITE EVENEMENT

| Critere | Attendu MVS | Frontend | Alignement |
|---------|-------------|----------|------------|

**Niveaux gravite documentes vs implementes :**

| Gravite MVS | Frontend (crvEnums) | Alignement |
|-------------|---------------------|------------|
| MINEURE | MINEURE | ALIGNE |
| MODEREE | MODEREE | ALIGNE |
| MAJEURE | MAJEURE | ALIGNE |
| CRITIQUE | CRITIQUE | ALIGNE |

**Verdict : ALIGNE**

---

### PROCESS 6 : CALCUL DUREE IMPACT

| Critere | Attendu MVS | Frontend | Alignement |
|---------|-------------|----------|------------|
| Calcul | Backend hook pre-save | Delegue backend | ALIGNE |
| Affichage | - | dureeImpactMinutes affiche | ALIGNE |

**Verdict : ALIGNE** (delegue backend)

---

## SYNTHESE MVS-9-Transversal

| Process | Alignement | Ecart principal |
|---------|------------|-----------------|
| Affectation personnel | PARTIEL | Champ libre vs enum roles |
| Ajout personne | ALIGNE | - |
| Suppression personne | ALIGNE | - |
| Declaration evenement | PARTIEL | Types simplifies (7 vs 14) |
| Gravite evenement | ALIGNE | - |
| Calcul duree impact | ALIGNE | - |

### Statistiques

| Metrique | Valeur |
|----------|--------|
| Process documentes | 6 |
| ALIGNE | 4 |
| PARTIEL | 2 |
| ABSENT | 0 |
| Taux alignement | 67% |

### Nature des ecarts

| Type | Composant | Detail |
|------|-----------|--------|
| Enum | Roles personnel | Champ libre vs enum 7 roles |
| Enum | Types evenement | 7 types vs 14 documentes |

### Mapping types evenement

| Frontend | MVS correspondants |
|----------|-------------------|
| RETARD | RETARD_PASSAGERS, RETARD_BAGAGES, RETARD_FRET, RETARD_CARBURANT, RETARD_EQUIPAGE |
| TECHNIQUE | RETARD_TECHNIQUE, INCIDENT_TECHNIQUE |
| METEO | RETARD_METEO |
| SECURITE | INCIDENT_SECURITE |
| OPERATIONNEL | (nouveau) |
| PASSAGERS | (nouveau) |
| AUTRE | AUTRE |

### Non mappes MVS -> Frontend

- RETARD_ATC
- INCIDENT_SURETE
- CHANGEMENT_PORTE
- CHANGEMENT_STAND
