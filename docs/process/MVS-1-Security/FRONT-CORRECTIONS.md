# FRONT-CORRECTIONS - MVS-1-Security

## Date de correction : 2026-01-10
## Reference : FRONT-ALIGNEMENT.md (audit du 2026-01-10)
## Norme backend : docs/process/MVS-1-Security/

---

## 1. SYNTHESE DES ECARTS A CORRIGER

| Source | Valeur |
|--------|--------|
| Ecarts totaux identifies | 5 |
| Ecarts CRITIQUES | 1 |
| Ecarts HAUTS | 1 |
| Ecarts MINEURS | 3 |

---

## 2. TABLEAU DE CORRESPONDANCE AUDIT → CORRECTION

| # | Ecart (depuis FRONT-ALIGNEMENT) | Process | Gravite | Fichiers backend de reference |
|---|--------------------------------|---------|---------|-------------------------------|
| 1 | Expiration token 3h non communiquee | Authentification | MINEURE | 02-services.md (generateToken), 05-process-metier.md |
| 2 | Statut SUSPENDU vs DESACTIVE non differencie | Authentification | MINEURE | 01-models.md (enum statut), 05-process-metier.md |
| 3 | Systeme ferme non explicite | Inscription | MINEURE | 04-routes.md (route absente) |
| 4 | Format matricule non affiche | Creation user ADMIN | MINEURE | 05-process-metier.md, 02-services.md |
| 5 | Dependances non verifiees avant suppression | Suppression user | **CRITIQUE** | 05-process-metier.md, 02-services.md |

---

## 3. TRAITEMENT DETAILLE DE CHAQUE ECART

---

### ECART #1 : Expiration token 3h non communiquee

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Expiration token 3h | NON | Utilisateur surpris par deconnexion"

L'utilisateur n'est pas informe que sa session expire automatiquement apres 3 heures d'inactivite. La deconnexion survient sans avertissement.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 02-services.md | `generateToken()` : "Expiration : 3h" |
| 05-process-metier.md | "Token JWT 3h" |

**Regle metier exacte** :
```
JWT signe avec expiration fixe de 3 heures
Aucun refresh token implemente
Deconnexion automatique a expiration
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Perte de donnees en cours de saisie si deconnexion pendant travail |
| Qualite | Experience utilisateur degradee, frustration |
| Securite | Aucun (comportement securise) |
| Audit | Conforme - pas de risque |
| Image | Perception d'instabilite de l'application |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Indicateur de temps restant de session OU avertissement 5 min avant expiration |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | "Votre session expire dans X minutes" |
| Ce qui DOIT rester silencieux | Le mecanisme technique JWT |

---

### ECART #2 : Statut SUSPENDU vs DESACTIVE non differencie

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Statut compte SUSPENDU vs DESACTIVE | NON | Meme message generique"

L'utilisateur recoit le meme message "Compte inactif" quel que soit le statut reel de son compte (SUSPENDU, INACTIF, etc.).

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 01-models.md | Enum statut: ACTIF, ABSENT, CONGE, INACTIF |
| 05-process-metier.md | "Si statut !== 'ACTIF': return 403" |
| 04-routes.md | Statuts autorises: ACTIF, ABSENT, CONGE, INACTIF |

**Regle metier exacte** :
```
Seul statut 'ACTIF' autorise la connexion
Tous les autres statuts retournent 403 "Compte inactif"
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Utilisateur ne sait pas s'il doit contacter admin ou attendre |
| Qualite | Support sollicite inutilement |
| Securite | Aucun risque (information non sensible) |
| Audit | Aucun risque |
| Image | Manque de professionnalisme |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Message adapte au statut : "Compte suspendu" / "Compte desactive" / "Compte en conge" |
| Ce que l'UI DOIT bloquer | Connexion (deja fait) |
| Ce que l'UI DOIT expliquer | "Contactez votre administrateur" pour INACTIF, "Votre compte sera reactif le XX" pour CONGE |
| Ce qui DOIT rester silencieux | Le statut exact n'est pas critique a exposer si le backend ne le renvoie pas |

**Note** : Necessite modification backend pour renvoyer le statut dans la reponse 403.

---

### ECART #3 : Systeme ferme non explicite

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Systeme ferme | NON explicite | Utilisateur pourrait chercher inscription"

Aucun message n'indique que l'inscription en self-service n'est pas disponible.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 04-routes.md | Route /register existe mais "ADMIN exclus de l'inscription publique" |
| 05-process-metier.md | Inscription = creation compte avec role limite |

**Regle metier exacte** :
```
L'inscription publique est reservee aux roles non-ADMIN
Le systeme est concu pour creation par ADMIN uniquement
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | Aucun blocage |
| Qualite | Utilisateur cherche un lien inexistant |
| Securite | Aucun risque |
| Audit | Aucun risque |
| Image | Confusion mineure |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Mention discrete sur page login : "Acces reserve au personnel autorise" |
| Ce que l'UI DOIT bloquer | Rien (deja pas de lien inscription) |
| Ce que l'UI DOIT expliquer | "Pour obtenir un acces, contactez votre responsable" |
| Ce qui DOIT rester silencieux | L'existence de la route /register |

---

### ECART #4 : Format matricule non affiche

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** : "Format matricule {PREFIX}{0001} | NON | Informatif seulement"

L'administrateur creant un utilisateur ne connait pas le format de generation automatique du matricule.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "Format: {PREFIX}{0001..9999}, PREFIX = fonction.substring(0,3).toUpperCase()" |
| 02-services.md | "Generation matricule si absent" |

**Regle metier exacte** :
```
Si matricule absent : auto-generation
PREFIX = 3 premieres lettres de la fonction en majuscules
SUFFIX = numero incrementiel sur 4 chiffres
Exemple : AGE0001 pour AGENT_ESCALE
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | ADMIN pourrait saisir un matricule au mauvais format |
| Qualite | Inconsistance des matricules |
| Securite | Aucun risque |
| Audit | Tracabilite potentiellement degradee |
| Image | Aucun impact externe |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Placeholder ou label : "Laisser vide pour generation automatique (ex: AGE0001)" |
| Ce que l'UI DOIT bloquer | Rien |
| Ce que l'UI DOIT expliquer | Format attendu si saisie manuelle |
| Ce qui DOIT rester silencieux | Logique d'incrementation interne |

---

### ECART #5 : Dependances non verifiees avant suppression (CRITIQUE)

#### A. Ecart identifie
**Source FRONT-ALIGNEMENT.md** :
- "Dependances non verifiees | NON | CRITIQUE - Admin pourrait supprimer utilisateur actif"
- "Risque donnees orphelines | NON | CRV.creePar pointerait vers ID inexistant"

L'administrateur peut supprimer un utilisateur meme si celui-ci est reference dans des CRV ou autres entites.

#### B. Justification backend

| Fichier | Reference exacte |
|---------|------------------|
| 05-process-metier.md | "AUCUNE verification de dependances : Un utilisateur peut etre supprime meme s'il est reference ailleurs (CRV.creePar, etc.)" |
| 02-services.md | `deletePersonne()` : "Suppression definitive" sans verification |

**Regle metier exacte** :
```
DELETE /api/personnes/:id
Seules verifications : existe + pas auto-suppression
AUCUNE verification : CRV.creePar, CRV.equipeCRV, affectations
Risque : integrite referentielle compromise
```

#### C. Risque si non corrige

| Domaine | Impact |
|---------|--------|
| Exploitation | **CRITIQUE** - CRV afficherait "Utilisateur inconnu" pour creePar |
| Qualite | Donnees corrompues, tracabilite perdue |
| Securite | Perte d'audit trail |
| Audit | **NON CONFORME** - Impossible de retracer qui a cree un CRV |
| Image | Dysfonctionnements visibles par les utilisateurs |

#### D. Exigence frontend (SANS CODER)

| Categorie | Exigence |
|-----------|----------|
| Ce que l'UI DOIT afficher | Avertissement AVANT suppression : "Cet utilisateur est reference dans X CRV. La suppression entrainera des donnees orphelines." |
| Ce que l'UI DOIT bloquer | **IDEALEMENT** : Bloquer suppression si dependances actives |
| Ce que l'UI DOIT expliquer | Liste des entites impactees (nombre de CRV, affectations) |
| Ce qui DOIT rester silencieux | Details techniques des relations en base |

**Recommandation forte** : Correction backend prioritaire pour ajouter verification dependances.

---

## 4. REGLES FRONTEND A RENDRE VISIBLES A L'UTILISATEUR

### Langage utilisateur recommande

| Contexte | Message a afficher |
|----------|-------------------|
| Page login | "Votre session est valide pendant 3 heures" |
| 5 min avant expiration | "Votre session expire dans 5 minutes. Enregistrez votre travail." |
| Compte inactif | "Votre compte est actuellement desactive. Contactez votre administrateur." |
| Page login (bas) | "Acces reserve au personnel SDTA. Pour obtenir un acces, contactez votre responsable." |
| Champ matricule (admin) | "Laisser vide pour generation automatique (format: XXX0000)" |
| Suppression utilisateur | "ATTENTION : Cet utilisateur a cree X CRV. Ces CRV afficheront 'Utilisateur supprime' apres cette action." |

---

## 5. REGLES FRONTEND A VERROUILLER (PERMISSIONS / STATUTS)

### Matrice des permissions

| Action | Qui peut | Quand | Conditions |
|--------|----------|-------|------------|
| Se connecter | Tous | Toujours | statut === 'ACTIF' |
| Changer son MDP | Tous authentifies | Toujours | Token valide |
| Creer utilisateur | ADMIN | Toujours | Token valide + role ADMIN |
| Modifier utilisateur | ADMIN | Toujours | Token valide + role ADMIN |
| Supprimer utilisateur | ADMIN | Toujours | Token valide + role ADMIN + pas soi-meme |

### Verifications frontend requises

| Verification | Implementation |
|--------------|----------------|
| Bouton "Supprimer" sur son propre profil | Masquer ou desactiver |
| Acces page gestion utilisateurs | Guard route meta: requireRole: 'ADMIN' |
| Formulaire creation user | Valider password >= 6 caracteres |

---

## 6. POINTS DE VIGILANCE NON-REGRESSION

### Cas limites a tester

| Scenario | Resultat attendu |
|----------|------------------|
| Connexion avec compte INACTIF | Erreur 403 + message clair |
| Connexion avec compte CONGE | Erreur 403 + message clair |
| Token expire pendant saisie | Redirection login + message explicatif |
| ADMIN tente se supprimer | Blocage (bouton desactive ou erreur) |
| Suppression user avec CRV associes | Avertissement dependances (si implemente) |
| Creation user sans matricule | Generation automatique visible |
| Creation user avec email existant | Erreur 400 claire |

### Tests indispensables

| Test | Priorite |
|------|----------|
| Intercepteur 401 redirige vers login | HAUTE |
| Timer session avertit avant expiration | MOYENNE |
| Guard ADMIN bloque acces non-ADMIN | CRITIQUE |
| Suppression avec dependances affiche warning | CRITIQUE |
| Validation password 6 caracteres | HAUTE |

### Effets de bord potentiels

| Modification | Effet de bord possible |
|--------------|----------------------|
| Ajout timer session | Performance (setInterval) |
| Appel API verification dependances | Latence avant modal suppression |
| Messages statut differencies | Necessite modification backend |

---

## SYNTHESE MVS-1-Security

### Ecarts traites

| # | Ecart | Gravite | Effort estime |
|---|-------|---------|---------------|
| 1 | Expiration token | MINEURE | Faible |
| 2 | Statuts differencies | MINEURE | Moyen (backend requis) |
| 3 | Systeme ferme | MINEURE | Faible |
| 4 | Format matricule | MINEURE | Faible |
| 5 | Dependances suppression | **CRITIQUE** | Eleve (backend requis) |

### Priorite de correction

1. **IMMEDIAT** : Ecart #5 - Verification dependances (risque integrite)
2. **COURT TERME** : Ecart #1 - Timer session (UX)
3. **MOYEN TERME** : Ecarts #2, #3, #4 (ameliorations UX)

---

**Document genere le 2026-01-10**
**Reference normative : MVS-1-Security (01-06)**
**Source audit : FRONT-ALIGNEMENT.md**
