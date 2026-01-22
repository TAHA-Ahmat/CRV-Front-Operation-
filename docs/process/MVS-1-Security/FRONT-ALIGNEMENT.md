# FRONT-ALIGNEMENT - MVS-1-Security

## Date d'audit : 2026-01-10
## Reference normative : docs/process/MVS-1-Security/05-process-metier.md

---

## PROCESS 1 : AUTHENTIFICATION UTILISATEUR

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/auth/login |
| Champs requis | email, password |
| Conditions succes | Email existe, password correct, statut = ACTIF |
| Token | JWT 3h |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | authAPI.login() -> POST /auth/connexion |
| Store | src/stores/authStore.js | login() action |
| Vue | src/views/Login.vue | Formulaire email/password |
| Stockage token | localStorage | auth_token |
| Intercepteur 401 | src/services/api.js | Redirection /login |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Email et mot de passe obligatoires | Validation formulaire |
| Compte doit etre ACTIF pour se connecter | Message erreur 403 |
| Session expire apres 3h | Redirection automatique |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Saisir email valide | Input email required |
| Saisir mot de passe | Input password required |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Se connecter avec compte inactif | Erreur 403 "Compte inactif" |
| Se connecter avec mauvais identifiants | Erreur 401 generique |

| Regles backend silencieuses | Visible UI |
|-----------------------------|------------|
| Statut compte verifie | OUI - message erreur |
| Token expire 3h | NON - deconnexion silencieuse |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Expiration token 3h | NON | Utilisateur surpris par deconnexion |
| Statut compte SUSPENDU vs DESACTIVE | NON | Meme message generique |

---

## PROCESS 2 : INSCRIPTION UTILISATEUR

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/auth/register |
| Champs requis | nom, prenom, matricule, email, password, fonction |
| Contraintes | Email unique, matricule unique, password >= 6 |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | authAPI.register() |
| Store | Non utilise | Systeme ferme |
| Vue | ABSENTE | Pas de formulaire inscription |

### C. Statut d'alignement

⚠️ **PARTIEL** (volontaire - systeme ferme)

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Inscription interdite en self-service | Pas de lien visible |
| Compte cree par administrateur uniquement | - |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Creer son propre compte | Route /register absente |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Systeme ferme | NON explicite | Utilisateur pourrait chercher "inscription" |

**Acceptable** : Systeme volontairement ferme.

---

## PROCESS 3 : CHANGEMENT MOT DE PASSE

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/auth/changer-mot-de-passe |
| Champs requis | ancienMotDePasse, nouveauMotDePasse |
| Contraintes | Token valide, ancien MDP correct, nouveau >= 6 |
| Flag | doitChangerMotDePasse bloque navigation |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | authAPI.changerMotDePasse() |
| Store | src/stores/authStore.js | changerMotDePasse() |
| Vue | src/views/ChangePassword.vue | Formulaire |
| Guard | router/index.js | Blocage si doitChangerMotDePasse |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur DOIT savoir | Implementation UI |
|----------------------------------|-------------------|
| Mot de passe minimum 6 caracteres | Validation front |
| Ancien mot de passe requis | Champ obligatoire |
| Forcage au premier login possible | Redirection automatique |

| Ce que l'utilisateur DOIT faire | Affichage UI |
|---------------------------------|--------------|
| Saisir ancien MDP | Input required |
| Saisir nouveau MDP >= 6 car | Validation + message |
| Confirmer nouveau MDP | Input confirmation |

| Ce que l'utilisateur NE PEUT PAS faire | Comportement |
|----------------------------------------|--------------|
| Naviguer si doitChangerMotDePasse=true | Blocage router |
| Utiliser MDP < 6 caracteres | Erreur validation |

### E. Manques frontend identifies

Aucun manque identifie.

---

## PROCESS 4 : CREATION UTILISATEUR PAR ADMIN

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | POST /api/personnes |
| Role requis | ADMIN uniquement |
| Champs requis | nom, prenom, email, password, fonction |
| Generation | Matricule auto si absent |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | personnesAPI.create() |
| Store | Non | Appel direct API |
| Vue | src/views/Admin/UserManagement.vue | Formulaire creation |
| Route | src/router/modules/adminRoutes.js | meta: ADMIN only |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur ADMIN DOIT savoir | Implementation UI |
|----------------------------------------|-------------------|
| Matricule genere si non fourni | Label explicatif |
| Email doit etre unique | Erreur 400 |
| Password temporaire a changer | Info visuelle |

| Ce que l'utilisateur ADMIN DOIT faire | Affichage UI |
|---------------------------------------|--------------|
| Renseigner nom, prenom, email | Champs obligatoires |
| Choisir fonction/role | Select avec options |
| Definir mot de passe initial | Input password |

| Ce que l'utilisateur non-ADMIN NE PEUT PAS faire | Comportement |
|--------------------------------------------------|--------------|
| Acceder a la gestion utilisateurs | Route protegee, redirection |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Format matricule {PREFIX}{0001} | NON | Informatif seulement |

---

## PROCESS 5 : SUPPRESSION UTILISATEUR

### A. Reference normative

| Source | Valeur |
|--------|--------|
| Route backend | DELETE /api/personnes/:id |
| Role requis | ADMIN uniquement |
| Contraintes | Pas d'auto-suppression |
| ATTENTION | Aucune verification dependances |

### B. Implementation frontend actuelle

| Composant | Fichier | Implementation |
|-----------|---------|----------------|
| API | src/services/api.js | personnesAPI.delete() |
| Vue | src/views/Admin/UserManagement.vue | Bouton supprimer |
| Confirmation | Modal | Demande confirmation |

### C. Statut d'alignement

✅ **ALIGNE**

### D. Contrat utilisateur (CRITIQUE)

| Ce que l'utilisateur ADMIN DOIT savoir | Implementation UI |
|----------------------------------------|-------------------|
| Suppression DEFINITIVE | Modal confirmation |
| Impossible de se supprimer soi-meme | Erreur 400 |
| AUCUNE verification dependances | **NON AFFICHE** |

| Ce que l'utilisateur ADMIN NE PEUT PAS faire | Comportement |
|----------------------------------------------|--------------|
| Supprimer son propre compte | Bouton desactive ou erreur |

| Regles backend silencieuses CRITIQUES | Visible UI |
|---------------------------------------|------------|
| Utilisateur peut etre supprime meme s'il est reference dans des CRV | **NON** |
| Risque d'integrite referentielle | **NON** |

### E. Manques frontend identifies

| Regle | Affichee UI | Impact |
|-------|-------------|--------|
| Dependances non verifiees | **NON** | **CRITIQUE** - Admin pourrait supprimer utilisateur actif |
| Risque donnees orphelines | **NON** | CRV.creePar pointerait vers ID inexistant |

---

## SYNTHESE MVS-1-Security

### Tableau recapitulatif

| Process | Statut | Contrat utilisateur respecte |
|---------|--------|------------------------------|
| Authentification | ✅ ALIGNE | OUI |
| Inscription | ⚠️ PARTIEL | OUI (volontaire) |
| Changement MDP | ✅ ALIGNE | OUI |
| Creation user ADMIN | ✅ ALIGNE | OUI |
| Suppression user | ✅ ALIGNE | **NON** - risque dependances masque |

### Statistiques

| Metrique | Valeur |
|----------|--------|
| Process documentes | 5 |
| ALIGNE | 4 |
| PARTIEL | 1 |
| ABSENT | 0 |
| Taux alignement | **90%** |

### Points bloquants avant production

| Severite | Process | Probleme |
|----------|---------|----------|
| **CRITIQUE** | Suppression user | Dependances non verifiees - risque integrite |
| MINEURE | Authentification | Expiration token non communiquee |

### Contrat utilisateur global MVS-1

**Question cle : L'utilisateur sait-il ce qu'il doit faire et ne peut pas faire ?**

| Aspect | Reponse |
|--------|---------|
| Authentification | OUI |
| Gestion compte | OUI |
| Risques suppression | **NON** |
