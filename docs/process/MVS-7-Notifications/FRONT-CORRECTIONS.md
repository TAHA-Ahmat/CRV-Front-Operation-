# FRONT-CORRECTIONS - MVS-7-Notifications

## Date de correction : 2026-01-10
## Reference : FRONT-ALIGNEMENT.md (audit du 2026-01-10)
## Norme backend : docs/process/MVS-7-Notifications/

---

## 1. SYNTHESE DES ECARTS A CORRIGER

| Source | Valeur |
|--------|--------|
| Ecarts totaux identifies | 3 |
| Ecarts CRITIQUES | 0 |
| Ecarts HAUTS | 0 |
| Ecarts MOYENS | 3 |

---

## 2. TABLEAU DE CORRESPONDANCE AUDIT → CORRECTION

| # | Ecart (depuis FRONT-ALIGNEMENT) | Process | Gravite | Fichiers backend de reference |
|---|--------------------------------|---------|---------|-------------------------------|
| 1 | Confirmation suppression absente | Suppression | MOYENNE | 05-process-metier.md |
| 2 | Types ERROR/SUCCESS/ALERTE_SLA manquants | Creation MANAGER | MOYENNE | 01-models.md, 04-routes.md |
| 3 | Vue statistiques non identifiee | Statistiques | MOYENNE | 04-routes.md |

---

## 3. TRAITEMENT DETAILLE DE CHAQUE ECART

---

### ECART #1 : Confirmation suppression absente

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Confirmation suppression | A verifier | Risque perte donnee"

La suppression d'une notification pourrait ne pas avoir de confirmation.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "DELETE /api/notifications/:id - Effet : Suppression definitive" |

**Regle metier exacte** :
```
Suppression definitive et irreversible
Compteur ajuste automatiquement si notification non lue
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Suppression accidentelle |
| Qualite | Perte d'information |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Modal confirmation : "Supprimer cette notification ?" |
| Ce que l'UI DOIT bloquer | Suppression sans confirmation |
| Ce que l'UI DOIT expliquer | "Cette action est irreversible" |
| Ce qui DOIT rester silencieux | OK |

---

### ECART #2 : Types ERROR/SUCCESS/ALERTE_SLA manquants

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Types ERROR/SUCCESS/ALERTE_SLA | ABSENTS | Fonctionnalites reduites"

L'enum frontend ne contient pas tous les types de notification documentes.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "Types : INFO, WARNING, URGENT, SYSTEME" |
| 01-models.md | Types enum dans modele Notification |

**Regle metier exacte** :
```
Types backend acceptes : INFO, WARNING, URGENT, SYSTEME
Types documentes non implementes : ERROR, SUCCESS, ALERTE_SLA
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Types de notification limites |
| Qualite | Fonctionnalites reduites pour MANAGER |
| Securite | Aucun |
| Audit | Aucun |
| Image | Mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Verifier enum backend et synchroniser |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Rien |
| Ce qui DOIT rester silencieux | OK |

**Note** : Verifier avec le backend si ERROR/SUCCESS/ALERTE_SLA doivent etre ajoutes au modele.

---

### ECART #3 : Vue statistiques non identifiee

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Vue statistiques | NON IDENTIFIEE | Fonctionnalite inaccessible"

L'API de statistiques existe mais l'interface n'est pas clairement identifiee.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | "GET /api/notifications/statistiques - Roles : MANAGER" |

**Regle metier exacte** :
```
Route : GET /api/notifications/statistiques
Roles : MANAGER uniquement
Retour : agregations par type, par lu/non-lu, par periode
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | MANAGER ne peut pas voir les statistiques |
| Qualite | Fonctionnalite absente |
| Securite | Aucun |
| Audit | Aucun |
| Image | Application incomplete |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Dashboard statistiques notifications pour MANAGER |
| Ce que l'UI DOIT bloquer | Acces si non MANAGER |
| Ce que l'UI DOIT expliquer | Graphiques/tableaux par type et periode |
| Ce qui DOIT rester silencieux | OK |

---

## 4. REGLES FRONTEND A RENDRE VISIBLES A L'UTILISATEUR

### Langage utilisateur recommande

| Contexte | Message a afficher |
|----------|-------------------|
| Suppression notification | "Supprimer cette notification ? Cette action est irreversible." |
| Section statistiques | "Statistiques des notifications" (MANAGER uniquement) |

---

## 5. REGLES FRONTEND A VERROUILLER (PERMISSIONS / STATUTS)

### Matrice des permissions notifications

| Action | AGENT | CHEF | SUPERVISEUR | MANAGER | QUALITE | ADMIN |
|--------|-------|------|-------------|---------|---------|-------|
| Consulter ses notifications | OUI | OUI | OUI | OUI | OUI | OUI |
| Marquer lue | OUI | OUI | OUI | OUI | OUI | OUI |
| Archiver | OUI | OUI | OUI | OUI | OUI | OUI |
| Supprimer | OUI | OUI | OUI | OUI | OUI | OUI |
| Creer notification | NON | NON | NON | **OUI** | NON | OUI |
| Voir statistiques | NON | NON | NON | **OUI** | NON | OUI |

---

## 6. POINTS DE VIGILANCE NON-REGRESSION

### Cas limites a tester

| Scenario | Resultat attendu |
|----------|------------------|
| Supprimer notification non lue | Compteur decremente |
| MANAGER cree notification | Succes |
| Non-MANAGER tente creer | Erreur 403 |
| Acces statistiques non-MANAGER | Erreur 403 |

### Tests indispensables

| Test | Priorite |
|------|----------|
| Modal confirmation suppression | MOYENNE |
| Permission creation MANAGER | HAUTE |
| Permission statistiques MANAGER | HAUTE |
| Enum types complet | MOYENNE |

---

## SYNTHESE MVS-7-Notifications

### Ecarts traites

| # | Ecart | Gravite | Effort estime |
|---|-------|---------|---------------|
| 1 | Confirmation suppression | MOYENNE | Faible |
| 2 | Types manquants | MOYENNE | Faible (sync enum) |
| 3 | Vue statistiques | MOYENNE | Moyen |

### Priorite de correction

1. **COURT TERME** :
   - #3 Dashboard statistiques MANAGER
   - #1 Modal confirmation suppression

2. **MOYEN TERME** :
   - #2 Synchronisation enum types

---

**Document genere le 2026-01-10**
**Reference normative : MVS-7-Notifications (01-06)**
**Source audit : FRONT-ALIGNEMENT.md**
