# AUDIT UX/UI COMPLET — CRV THS AÉRO
**Date** : 18/06/2026  
**Auditeur** : Claude (analyse live + code source)  
**Périmètre** : crv-front-operation.vercel.app — tous les écrans, rôle AGENT_ESCALE  
**Contexte terrain** : tarmac aéroport, soleil direct, tablette/téléphone, debout en mouvement, formation minimale

---

## GRILLE DE SÉVÉRITÉ

| Code | Niveau | Définition terrain |
|------|--------|--------------------|
| P0 | BLOQUANT | L'agent ne peut pas accomplir sa tâche. Livraison impossible. |
| P1 | MAJEUR | Erreur fréquente probable, perte de temps significative. |
| P2 | MINEUR | Gêne réelle mais contournable. |
| P3 | COSMÉTIQUE | Incohérence visuelle ou textuelle sans impact opérationnel. |

---

## ÉCRAN 1 — LOGIN

### Ce qui est bien
- Fond sombre par défaut : lisible en extérieur (bon contraste)
- Formulaire centré, champs larges
- Message "La session reste active 3 heures" : rassure l'agent
- Mode sombre préservé après connexion (thème persistant)
- iOS : `font-size: 16px` sur form-input → pas de zoom automatique (bien codé)

### Problèmes détectés

| ID | Sévérité | Problème | Impact terrain |
|----|----------|----------|----------------|
| UX-L01 | P1 | **Aucun indicateur de chargement visible** lors du clic "Se connecter". Render Free peut mettre 50s (cold start). L'agent recliquer, pense que ça ne marche pas. | Double soumission, frustration |
| UX-L02 | P2 | **"Contactez le support"** n'est pas un lien cliquable. Sur tarmac, l'agent ne sait pas qui appeler ni comment. | Blocage si mot de passe oublié |
| UX-L03 | P2 | **Pas de "show password"** (œil). Sur mobile avec gants, saisir un mot de passe complexe invisible est risqué. | Erreurs de saisie, verrouillage compte |
| UX-L04 | P3 | **"CONNEXION UTILISATEUR" en majuscules** avec `tracking-wider`. Sur mobile c'est lisible mais peu accueillant. | Mineur |
| UX-L05 | P3 | **© 2025** dans le footer. On est en 2026. | Crédibilité |

### Recommandations P0/P1
1. **UX-L01** : Désactiver le bouton + afficher spinner dès le clic. Texte → "Connexion en cours…" jusqu'à redirect.
2. **UX-L03** : Ajouter `<button>` œil sur le champ mot de passe pour toggle `type="text"`.

---

## ÉCRAN 2 — DASHBOARD AGENT (Services)

### Ce qui est bien
- 4 tuiles claires avec icônes et descriptions
- "Nouveau CRV" en bleu mis en avant (priorité correcte)
- Responsive : navigation hamburger sur mobile (code vérifié dans AppHeader.vue)

### Problèmes détectés

| ID | Sévérité | Problème | Impact terrain |
|----|----------|----------|----------------|
| UX-D01 | P2 | **Titre de page absent** au-dessus des tuiles. "Accédez rapidement à vos services" commence sans H1 visible. La page se coupe en haut. | Désorienté si arrivée directe |
| UX-D02 | P2 | **Disposition asymétrique** : 3 tuiles en rangée 1, 1 tuile seule en rangée 2 ("Programmes"). L'agent croit que c'est cassé. | Confusion visuelle |
| UX-D03 | P2 | **"Bulletins" et "Programmes"** — utilité floue pour un agent de tarmac. Aucun contenu visible dedans lors de l'audit. | Encombrement cognitif |
| UX-D04 | P2 | **Hamburger menu** : sur mobile, le menu hamburger ouvre une liste verticale qui pousse tout le contenu. Pas de geste swipe pour fermer. | Maladroit sur téléphone debout |
| UX-D05 | P3 | **Badge rôle** ("Agent d'escale") en gris clair sur fond sombre. En plein soleil, contrasté mais petit. | Lisibilité limite |

### Recommandations P1/P2
1. **UX-D02** : Mettre les 4 tuiles en 2x2 grid sur mobile/tablette (pas 3+1).
2. **UX-D04** : Fermer le menu au swipe vers le haut ou au clic en dehors (déjà partiellement codé, vérifier).

---

## ÉCRAN 3 — NOUVEAU CRV (Sélection vol)

### Ce qui est bien
- Deux grandes tuiles "Vol Planifié" / "Vol Hors Programme" : choix clair
- Filtres date/escale/type automatiquement présents

### Problèmes détectés

| ID | Sévérité | Problème | Impact terrain |
|----|----------|----------|----------------|
| UX-N01 | P1 | **"Aucune escale" dans le dropdown** après chargement. L'agent ne comprend pas pourquoi aucun vol n'apparaît. Aucun message d'aide. | Blocage — l'agent appelle le chef |
| UX-N02 | P1 | **Pas de résultats affichés** après "Rechercher" sans vol configuré. La liste en dessous est vide sans message "Aucun vol pour cette date". | Confusion — l'agent pense que le logiciel est cassé |
| UX-N03 | P2 | **Fautes d'accentuation** : "Selectionner" → "Sélectionner", "Type d'operation" → "Type d'opération". | Crédibilité produit |
| UX-N04 | P2 | **Le workflow Hors Programme** n'a pas été audité mais est critique pour les charters/déroutements. À tester séparément. | Risque non évalué |
| UX-N05 | P3 | **Bouton "Rechercher"** positionné à droite seul. Sur mobile 375px il dépasse du cadre si les filtres sont sur une ligne. | Layout mobile |

### Recommandations
1. **UX-N01** : Si aucune escale disponible → message "Aucun vol trouvé pour cette date. Essayez une autre date ou créez un vol hors programme."
2. **UX-N02** : État vide explicite avec CTA vers "Vol Hors Programme".

---

## ÉCRAN 4 — LISTE MES CRV

### Ce qui est bien
- Tableau dense mais lisible en desktop
- Barre de complétude colorée (rouge/vert) : lisible visuellement
- SLA avec badge vert "37h" clairement visible
- Bouton "Voir" pour les CRV verrouillés (distinction lecture/écriture)

### Problèmes détectés

| ID | Sévérité | Problème | Impact terrain |
|----|----------|----------|----------------|
| UX-CL01 | P0 | **Tableau non responsive**. Sur 375px ou tablette portrait, les colonnes (N° CRV, VOL, TYPE, STATUT, COMPLÉTUDE, SLA, CRÉE PAR, DATE, ARCHIVAGE, ACTIONS) débordent horizontalement. L'agent doit scroller horizontalement pour voir "Modifier". Inacceptable sur tarmac. | Bloquant sur mobile |
| UX-CL02 | P1 | **Bouton "Supprimer"** en rouge visible même pour des CRV EN_COURS. Un agent peut supprimer un CRV actif par erreur (gros doigt). Pas de confirmation visible dans le code. | Perte de données |
| UX-CL03 | P1 | **Colonnes redondantes** pour l'agent terrain : "CRÉE PAR" (toujours lui-même), "ARCHIVAGE" (inutile en cours de vol). Trop d'information, masque l'essentiel. | Surcharge cognitive |
| UX-CL04 | P2 | **Filtre "Urgences SLA uniquement"** sans explication. L'agent ne sait pas ce que ça fait. | Feature cachée |
| UX-CL05 | P2 | **Pagination absente** ou non visible. Si 50 CRV, l'agent doit scroller infiniment. | Performance UX |
| UX-CL06 | P3 | **"CRV Verrouille"** dans le banner du détail sans accent → "CRV Verrouillé". | Faute typo |

### Recommandations P0/P1
1. **UX-CL01 CRITIQUE** : Convertir le tableau en **cartes empilées** sur mobile (< 768px). Chaque carte montre : N° CRV, Vol, Statut, Complétude, SLA, bouton Modifier. Les colonnes secondaires collapsées.
2. **UX-CL02** : Ajouter modal de confirmation avant suppression. Ou masquer Supprimer pour les CRV EN_COURS.

---

## ÉCRAN 5 — CRV DÉTAIL (7 étapes)

### Ce qui est bien
- Bandeau rouge "CRV Verrouillé" très visible : l'agent sait qu'il ne peut pas modifier
- Barre de complétude à 90% avec "CRV prêt pour soumission" en vert
- Navigation numérotée 1→7 en haut (Informations vol → Soumission)
- Bandeau SLA temps réel intégré dans la page

### Problèmes détectés

#### Navigation étapes

| ID | Sévérité | Problème | Impact terrain |
|----|----------|----------|----------------|
| UX-CRV01 | P1 | **Navigation étapes invisible** sur mobile. Sur 375px, les 7 cercles numérotés (1-7 avec labels) débordent horizontalement et se chevauchent. L'agent ne peut pas naviguer entre étapes. | Bloquant mobile |
| UX-CRV02 | P1 | **Pas de bouton "Étape suivante" / "Étape précédente"** visible en bas du formulaire. L'agent doit revenir en haut pour cliquer sur les cercles. Sur tablette tenue à la main, c'est pénible. | Friction majeure |
| UX-CRV03 | P2 | **La navbar principale disparaît** sur la page CRV (header custom avec juste Retour + email + Déconnexion). L'agent ne peut plus naviguer vers "Mes CRV" sans faire Retour. | Navigation cassée |

#### Formulaire étape 1 (Informations vol)

| ID | Sévérité | Problème | Impact terrain |
|----|----------|----------|----------------|
| UX-CRV04 | P2 | **"Type avion" et "Immatriculation avion"** affichés vides (placeholder uniquement) même sur un CRV VERROUILLÉ à 90%. Données non saisies ou non affichées. | Information manquante |
| UX-CRV05 | P2 | **"Horaires prévus"** section visible mais totalement vide. Soit les données sont là et non affichées, soit le champ n'est pas rempli. | Confusion |
| UX-CRV06 | P2 | **Grille 4 colonnes** sur desktop. Sur tablette portrait (768px) les 4 colonnes se compressent → texte illisible. | Layout tablette |

#### Onboarding Modal

| ID | Sévérité | Problème | Impact terrain |
|----|----------|----------|----------------|
| UX-CRV07 | P2 | **L'onboarding SLA s'ouvre à chaque visite** si "Ne plus afficher" n'a pas été cliqué. Sur tarmac, l'agent ouvre un CRV en urgence et doit d'abord fermer le tutoriel. | Friction urgence |
| UX-CRV08 | P2 | **"Suivant →" cliqué rapidement** fait défiler les slides mais le fond page scroll aussi. Modal et page interfèrent. | Bug UX |

#### SLA Banner

| ID | Sévérité | Problème | Impact terrain |
|----|----------|----------|----------------|
| UX-CRV09 | P2 | **"Aucune phase SLA"** affiché même sur un CRV VERROUILLÉ avec 34 phases. Soit le contrat SLA n'est pas lié, soit l'affichage est buggé pour les CRV verrouillés. | Donnée incorrecte |
| UX-CRV10 | P3 | **"Contrat : TH"** — trop cryptique pour un agent de tarmac. "Contrat THS Aéro" serait plus clair. | Lisibilité |

---

## ÉCRAN 6 — FOOTER & TRANSVERSAL

| ID | Sévérité | Problème | Impact terrain |
|----|----------|----------|----------------|
| UX-G01 | P3 | **"© 2025"** dans AppFooter.vue ligne 5. Hardcodé. En 2026, c'est faux. | Crédibilité |
| UX-G02 | P2 | **Mode jour/nuit** : le bouton est présent dans la nav desktop. Sur mobile, il est absent du menu hamburger. L'agent sur téléphone ne peut pas changer le mode. | Manque mobile |
| UX-G03 | P2 | **Pas de mode PWA / App mobile**. L'app n'est pas installable sur l'écran d'accueil du téléphone. L'agent doit ouvrir un navigateur. Sur tarmac c'est une friction majeure. | Workflow terrain |
| UX-G04 | P1 | **Pas de gestion hors connexion** visible. Si le 4G coupe sur le tarmac, l'agent perd ses saisies. Aucun message "Mode hors ligne" ou cache local apparent. | Perte données |
| UX-G05 | P2 | **Render Free tier** : cold start 50s. L'agent ouvre l'app, entre ses credentials, attend 50s sans feedback. Combine avec UX-L01 = très mauvaise première impression. | Abandon |

---

## THÈME JOUR — PROBLÈMES SPÉCIFIQUES

Le thème jour (fond blanc) n'a pas été audité visuellement mais des risques sont identifiés depuis le code :
- `bg-red-50 border border-red-200 text-red-800` pour les erreurs : peut manquer de contraste en extérieur
- Les badges rôle (`bg-gray-100 text-gray-800`) en mode jour sur fond blanc : contraste insuffisant

---

## TABLEAU DE BORD PARETO — TOP 10 FIXES

| Priorité | ID | Fix | Effort | Impact |
|----------|----|-----|--------|--------|
| 1 | UX-CL01 | Tableau CRV → cartes mobile | Élevé | P0 mobile |
| 2 | UX-L01 | Spinner + désactiver bouton login | Faible | P1 tous |
| 3 | UX-CRV01 | Nav étapes → scroll horizontal ou dropdown mobile | Moyen | P1 mobile |
| 4 | UX-CL02 | Confirmation avant suppression CRV | Faible | P1 sécurité |
| 5 | UX-CRV02 | Boutons Prev/Next en bas de chaque étape | Moyen | P1 ergonomie |
| 6 | UX-N01 | Message état vide "Aucun vol" avec CTA | Faible | P1 découverte |
| 7 | UX-G04 | Message hors ligne + sauvegarde locale draft | Élevé | P1 terrain |
| 8 | UX-L03 | Toggle show/hide mot de passe | Faible | P2 mobile |
| 9 | UX-G02 | Bouton thème dans menu mobile | Faible | P2 mobile |
| 10 | UX-G01 | Mettre © 2026 | Trivial | P3 |

---

## CE QUI RESTE À AUDITER

- [ ] Étapes 2-7 du CRV (Personnel, Engins, Phases, Charges, Événements, Soumission)
- [ ] Flow Superviseur (validation)
- [ ] Flow Manager (verrouillage)
- [ ] Export PDF — temps de génération, lisibilité du PDF
- [ ] Mode nuit vs jour : contraste exact sur toutes les pages
- [ ] Vol Hors Programme (charter, déroutement)
- [ ] Dashboard Chef d'équipe
- [ ] OPS Control Center (Superviseur/Manager)
- [ ] Test sur device physique (tablette Android/iOS réelle)

---

## VERDICT

**Niveau actuel** : App fonctionnelle en desktop. **Problèmes critiques sur mobile/tablette** (UX-CL01, UX-CRV01).

**Ce qui bloque la livraison terrain** :
1. La liste CRV est inutilisable sur téléphone (scroll horizontal dans un tableau trop large)
2. La navigation en 7 étapes dans le CRV est inutilisable sur mobile
3. Pas de gestion hors connexion

**Prochaine action unique** : Corriger UX-CL01 (liste CRV → cartes responsive mobile) — c'est l'écran que l'agent ouvre 10x par jour.
