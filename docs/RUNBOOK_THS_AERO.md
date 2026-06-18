# RUNBOOK THS AÉRO — Guide Opérationnel CRV

## Avant de commencer

### Les comptes recette

Tu as reçu un login et un mot de passe. Tape-les exactement.

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Agent escale | `agent@crv.ths` | `THS2026!` |
| Chef d'équipe | `chef@crv.ths` | `THS2026!` |
| Superviseur | `superviseur2@crv.ths` | `THS2026Recette!` |
| Manager | `manager2@crv.ths` | `THS2026Recette!` |

### Accéder au système

1. Ouvre ton navigateur (téléphone ou tablette).
2. Va sur : `https://crv-front-operation.vercel.app`
3. Tu vois un écran blanc avec deux champs : email et mot de passe.
4. Tape ton email dans le premier champ.
5. **Tape ton mot de passe dans le deuxième champ.**
6. Si tu veux voir le mot de passe, clique l'icône œil à droite du champ. Clique encore pour le masquer.
7. Clique le bouton bleu **"Connexion"**.
8. **Attends 50 secondes sans recharger la page.** Le système peut être lent au premier démarrage. C'est normal.
9. Si ça ne marche pas après 60 secondes, attends 5 minutes et essaie à nouveau.

### La page d'accueil

Une fois connecté, tu vois un menu en haut avec des onglets.

- **CRV** : créer et lister les rapports de vol.
- **Personnel** : gérer les agents affectés.
- **Engins** : lister les avions.
- **Accueil** : page principale (pas utilisé).

> ⚠️ **IMPORTANT** : N'utilise que l'onglet **CRV**. Les autres sont pour l'administration.

---

## Créer un CRV

### Étape 0 : Choisir le type de vol

1. Clique l'onglet **CRV** en haut.
2. Tu vois trois boutons : **Départ**, **Arrivée**, **TurnAround**.
   - **Départ** : c'est un vol qui sort de l'aéroport.
   - **Arrivée** : c'est un vol qui entre dans l'aéroport.
   - **TurnAround** : l'avion débarque des passagers, puis redécolle (court séjour).
3. Clique celui qui correspond à ton vol.

### Étape 1 : Informations du vol

Tu arrives sur un écran avec des champs à remplir.

**Remplis obligatoirement :**
1. **Numéro du vol** : ex. `THS-TA-0001`. C'est marqué sur le tableau de bord.
2. **Type d'opération** : reste sur **Turn Around** (c'est le défaut).
3. **Compagnie aérienne** : reste sur **THS Aéro**.
4. **Code IATA** : reste sur **TH**.
5. **Date du vol** : clique le champ de date. Choisis la date du jour.

**Si c'est un vol hors programme** :
- Coche la case **"Hors programme"**.
- Tape la raison en bas (ex. "Vol cargo urgent").

Clique le bouton bleu **"Continuer"** en bas.

### Étapes 2–6 : Les phases opérationnelles

Tu arrives sur un écran avec 7 étapes. La première est déjà sélectionnée.

**Pour chaque étape :**

1. **Lis le titre** de l'étape (ex. "Arrivée avion").
2. **En bas, tu vois deux boutons :**
   - Bouton bleu **"Démarrer"** : tu es en train de faire cette phase.
   - Bouton rouge **"Non réalisée"** : tu as sauté cette phase.
3. **Clique "Démarrer"** quand tu commences la phase.
4. **Remplis les champs** (si des champs apparaissent).
5. **Clique "Terminer cette phase"** en bas quand c'est fini.

**Les 7 phases en ordre :**
1. Briefing équipes
2. Arrivée avion
3. Ouverture des soutes
4. Déchargement des bagages
5. Débarquement des passagers
6. Inspection pré-vol
7. Avitaillement carburant

> ⚠️ **CAS : Une phase est impossible** (panne moteur, etc.)
>
> Clique **"Non réalisée"**, puis :
> - Choisis le motif : **Panne**, **Retard**, **AUTRE**.
> - Si **AUTRE**, tape la raison dans la zone de texte.
> - Clique **"Valider"**.

**Une fois la phase 7 finie :**
- Clique le bouton bleu **"Continuer"** en bas à droite.
- Ou clique le cercle numéroté **7** pour passer à la validation.

### Étape 7 : Soumission

Tu arrives sur un écran **"Soumettre le CRV"**.

**Lis et accepte :**
- Le système te montre un résumé du CRV.
- Vérifie que tout est correct.
- Si c'est bon, clique le bouton bleu **"Soumettre"**.
- Le CRV est maintenant en attente de validation.

---

## Ma session expire

### Le problème

Après 30 minutes sans rien faire sur la tablette, l'application te dit :

> "Votre session a expiré. Veuillez vous reconnecter."

C'est normal. La sécurité l'impose.

### La solution

1. Clique n'importe quel bouton.
2. Tu es renvoyé à l'écran de connexion.
3. **Tape à nouveau ton login et mot de passe.**
4. **Attends 50 secondes.**
5. C'est reparti.

> ⚠️ **Les données que tu tapais sont perdues.** Recommence l'étape depuis le début.
>
> **Pour éviter ça :** termine une phase toutes les 20 minutes. Clique "Terminer cette phase" régulièrement pour sauvegarder.

---

## Cas d'erreur courants

### "Erreur réseau" ou "Impossible de charger"

1. **Vérifie le WiFi ou la 4G** sur la tablette.
2. **Attends 10 secondes.**
3. **Recharge la page** (bouton rond ↻ en haut du navigateur).
4. **Si ça continue, attends 5 minutes** (Render peut être en maintenance).

### "Le champ est vide" (message rouge sous un champ)

1. Le champ est obligatoire.
2. Tape quelque chose dedans.
3. Ex. : le champ **"Numéro du vol"** : tape `THS-TA-0001`.

### "Le bouton Continuer est grisé"

1. Tu n'as pas rempli un champ obligatoire.
2. Remonte dans l'écran et remplis tous les champs sans astérisque ✱.
3. Le bouton redevient bleu.

### "Attends 50 secondes" après connexion

C'est le premier démarrage. Le serveur se réveille.

1. **Ne recharge pas la page.**
2. **N'appuie pas sur le bouton plusieurs fois.**
3. Regarde ailleurs. Attends une minute.
4. La page se charge.

---

## Soumettre → Valider → Verrouiller

### Toi : Agent escale

1. Tu crées le CRV (7 phases).
2. Tu cliques **"Soumettre"**.
3. **C'est fait. Tu attends.**
4. Un superviseur validera plus tard.

### Superviseur

1. Tu vois un onglet **"CRV"** avec tous les rapports en attente.
2. Tu cliques le rapport.
3. Tu lis les 7 phases complètes.
4. Si tout est bon, tu cliques **"Valider"** en bas.
5. Le rapport passe en statut **"Validé"**.

### Manager

1. Tu vois les CRV en statut **"Validé"**.
2. Tu cliques le rapport.
3. Tu cliques **"Verrouiller"** en bas.
4. **Le CRV est maintenant immuable.** On ne peut plus le modifier.
5. Un PDF est généré automatiquement. (Tu ne le vois pas, ça se fait en arrière-plan.)

---

## Dépannage — Questions fréquentes

**Q : Où est mon CRV?**
A : Clique l'onglet **CRV**. Tu vois la liste. Chaque CRV a un numéro (ex. `CRV260617-0011`).

**Q : Je peux corriger une phase après l'avoir terminée?**
A : Non. Pas avant soumission. Une fois soumis, tu ne peux plus rien changer.

**Q : Quelle phase est obligatoire?**
A : Les 7 phases doivent être traitées. Soit tu les fais (**"Démarrer"**), soit tu les marques **"Non réalisée"**.

**Q : Ça affiche "Vous n'avez pas les permissions."**
A : Tu n'as pas les droits pour cette action.
- Agent : tu crées et soumets.
- Superviseur : tu valides.
- Manager : tu verrouilles.
Demande à ton chef si tu dois avoir un autre rôle.

**Q : Le clavier ne s'affiche pas sur la tablette.**
A : Appuie sur le champ de texte une fois de plus. Le clavier doit apparaître en bas.

**Q : Je vois le texte en tout petit. Comment agrandir?**
A : Sur tablette, tu peux :
1. Appuie avec deux doigts en bas de l'écran.
2. Écarte les doigts vers le haut (pincer-zoom).

---

## Contacts

**Problème avec le système (crash, erreur 500)?**
Envoie un email à : `support@crv-ths.local` avec :
- Ton nom et rôle
- Quelle heure
- Ce que tu faisais quand ça s'est cassé

**Problème avec les données (CRV manquant)?**
Appelle le chef d'équipe ou le superviseur.

---

## Résumé rapide — À taper sur ton téléphone

```
URL: https://crv-front-operation.vercel.app
Login: agent@crv.ths
Password: THS2026!
Attends 50 secondes après connexion.
Onglet CRV → Départ/Arrivée/TurnAround.
7 phases à faire → Soumettre.
Le superviseur valide.
Le manager verrouille.
C'est bon.
```
