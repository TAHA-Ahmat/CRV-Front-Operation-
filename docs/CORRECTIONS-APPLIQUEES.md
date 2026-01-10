# CORRECTIONS APPLIQUEES - FRONTEND CRV

## Date d'application : 2026-01-10
## Reference : FRONT-CORRECTIONS.md (MVS 1-10)
## Environnement : Vue 3 + Pinia + Composition API

---

## SYNTHESE GLOBALE

| MVS | Module | Ecarts corrigés | Fichiers modifiés |
|-----|--------|-----------------|-------------------|
| MVS-10 | Validation | 4 | permissions.js, ValidationCRV.vue |
| MVS-2 | CRV | 5 | CompletudeBarre.vue, crvStore.js, CRVList.vue |
| MVS-5 | Flights | 3 | ProgrammesVol.vue (nouveau), CRVHeader.vue, managerRoutes.js |
| MVS-8 | Referentials | 4 | AvionsGestion.vue (nouveau), managerRoutes.js |
| MVS-1 | Security | 3 | Login.vue, GestionUtilisateurs.vue (nouveau), adminRoutes.js |
| MVS-4 | Charges | 3 | CRVCharges.vue |
| MVS-7 | Notifications | 2 | Statistiques.vue (remplacé) |
| MVS-3 | Phases | 6 | CRVPhases.vue |
| MVS-6 | Resources | 2 | CRVEngins.vue |
| MVS-9 | Transversal | 2 | crvEnums.js, CRVPersonnes.vue, CRVEvenements.vue |

**Total : 34 écarts corrigés**

---

## DETAIL PAR MVS

### MVS-10 - Validation

#### Fichiers modifiés
- `src/utils/permissions.js`
- `src/views/Qualite/ValidationCRV.vue`

#### Corrections appliquées
1. **Seuil VALIDER 80%** : Ajout constante `SEUIL_VALIDATION = 80` et vérification dans workflow
2. **Matrice permissions QUALITE read-only** : Fonction `isReadOnly()` retourne true pour QUALITE
3. **Verrou admin visuel** : Badge "VERROUILLE PAR ADMIN" dans ValidationCRV.vue
4. **Bouton verrouiller conditionnel** : Masqué si CRV pas VALIDE ou déjà VERROUILLE

---

### MVS-2 - CRV

#### Fichiers modifiés
- `src/components/crv/CompletudeBarre.vue`
- `src/stores/crvStore.js`
- `src/views/CRV/CRVList.vue` (nouveau)

#### Corrections appliquées
1. **Seuil TERMINER 50%** : Affichage explicite "≥50% pour terminer"
2. **Bouton "Soumettre pour validation"** : Visible si complétude ≥50%
3. **Bouton "Valider ce CRV"** : Visible si complétude ≥80% et role QUALITE
4. **Colonne complétude dans liste** : Badge coloré selon seuils
5. **Filtres avancés** : Par statut, date, complétude

---

### MVS-5 - Flights (Extension 2)

#### Fichiers créés/modifiés
- `src/views/Manager/ProgrammesVol.vue` (NOUVEAU ~350 lignes)
- `src/components/crv/CRVHeader.vue`
- `src/router/modules/managerRoutes.js`

#### Corrections appliquées
1. **Page ProgrammesVol** : Gestion complète des programmes de vols
2. **Badge programme dans CRVHeader** : PROGRAMME / HORS PROGRAMME / NON AFFECTÉ
3. **Liaison vol-programme** : Select dropdown avec API
4. **Modal hors programme** : Motif + type (CHARTER, EXCEPTIONNEL, etc.)

---

### MVS-8 - Referentials (Extension 3)

#### Fichiers créés/modifiés
- `src/views/Manager/AvionsGestion.vue` (NOUVEAU ~600 lignes)
- `src/router/modules/managerRoutes.js`

#### Corrections appliquées
1. **Page AvionsGestion** : CRUD complet avec permissions par rôle
2. **Versioning automatique** : Modal versions avec historique
3. **Comparaison versions** : Affichage côte à côte avant/après
4. **Planification révisions** : Types A/B/C/D avec dates

---

### MVS-1 - Security

#### Fichiers créés/modifiés
- `src/views/Login.vue`
- `src/views/Admin/GestionUtilisateurs.vue` (NOUVEAU ~500 lignes)
- `src/router/modules/adminRoutes.js`

#### Corrections appliquées
1. **Durée session** : Information "Session active 3 heures" sur login
2. **Système fermé** : Message "Système fermé - Demandez un compte à l'admin"
3. **Vérification dépendances** : Avant suppression utilisateur, check CRV associés
4. **Matricule format** : Hint "PREFIX + XXXX" selon fonction

---

### MVS-4 - Charges

#### Fichiers modifiés
- `src/components/crv/CRVCharges.vue`

#### Corrections appliquées
1. **Section DGR** : Affichée si type fret = DANGEREUX
2. **Validation code ONU** : Regex `UN\d{4}` avec message erreur
3. **Groupe emballage** : Select I, II, III
4. **Bouton validation DGR** : Appel API avec résultat erreurs/warnings
5. **Impact complétude** : Banner informatif "30% du score"

---

### MVS-7 - Notifications

#### Fichiers modifiés
- `src/views/Manager/Statistiques.vue` (REMPLACE stub)

#### Corrections appliquées
1. **Dashboard complet** : Sections CRV, Vols, Charges
2. **Stats notifications** : Section MANAGER only avec compteurs par type

---

### MVS-3 - Phases

#### Fichiers modifiés
- `src/components/crv/CRVPhases.vue`

#### Corrections appliquées
1. **Affichage prérequis** : Liste des phases prérequises avec statut
2. **Blocage démarrage** : Bouton grisé si prérequis non satisfaits
3. **Tags type opération** : ARRIVEE / DEPART sur chaque phase
4. **Note reset heures** : "Les heures seront effacées" dans modal non réalisé
5. **Note impact complétude** : "Compte comme terminée pour la progression"
6. **Ecart SLA** : Affichage avec seuil de tolérance (vert/rouge)

---

### MVS-6 - Resources

#### Fichiers modifiés
- `src/components/crv/CRVEngins.vue`

#### Corrections appliquées
1. **Note remplacement** : Banner "Cette liste remplacera les engins existants"
2. **Uppercase immatriculation** : CSS `text-transform: uppercase` sur input

---

### MVS-9 - Transversal

#### Fichiers modifiés
- `src/config/crvEnums.js`
- `src/components/crv/CRVPersonnes.vue`
- `src/components/crv/CRVEvenements.vue`

#### Corrections appliquées
1. **Enum ROLE_PERSONNEL** : 8 rôles (CHEF_AVION, AGENT_TRAFIC, etc.) + AUTRE
2. **Descriptions rôles** : Tooltip informatif pour chaque rôle
3. **Enum TYPE_EVENEMENT étendu** : 14 types au lieu de 7
4. **Groupes événements** : RETARDS, INCIDENTS, CHANGEMENTS, AUTRES avec optgroup

---

## ENUMS ETENDUS (MVS-9)

### ROLE_PERSONNEL
```javascript
{
  CHEF_AVION: 'CHEF_AVION',
  AGENT_TRAFIC: 'AGENT_TRAFIC',
  AGENT_PISTE: 'AGENT_PISTE',
  AGENT_BAGAGES: 'AGENT_BAGAGES',
  AGENT_FRET: 'AGENT_FRET',
  SUPERVISEUR: 'SUPERVISEUR',
  COORDINATEUR: 'COORDINATEUR',
  AUTRE: 'AUTRE'
}
```

### TYPE_EVENEMENT (étendu)
```javascript
{
  // Retards
  RETARD_PASSAGERS, RETARD_BAGAGES, RETARD_FRET,
  RETARD_CARBURANT, RETARD_EQUIPAGE, RETARD_TECHNIQUE,
  RETARD_METEO, RETARD_ATC,
  // Incidents
  INCIDENT_SECURITE, INCIDENT_SURETE, INCIDENT_TECHNIQUE,
  // Changements
  CHANGEMENT_PORTE, CHANGEMENT_STAND,
  // Autre
  AUTRE
}
```

---

## FICHIERS CREES

| Fichier | Lignes | Description |
|---------|--------|-------------|
| ProgrammesVol.vue | ~350 | Gestion programmes de vols |
| AvionsGestion.vue | ~600 | Gestion avions avec versioning |
| GestionUtilisateurs.vue | ~500 | Gestion utilisateurs avec dépendances |
| CRVList.vue | ~400 | Liste CRV avec filtres avancés |

---

## CONSTANTES CRITIQUES

| Constante | Valeur | Fichier |
|-----------|--------|---------|
| SEUIL_TERMINER | 50% | crvEnums.js |
| SEUIL_VALIDER | 80% | crvEnums.js |
| SESSION_DUREE | 3 heures | Login.vue |
| CODE_ONU_REGEX | /^UN\d{4}$/ | CRVCharges.vue |

---

## TESTS RECOMMANDES

### Critiques (HAUTE priorité)
- [ ] Seuil 50% bloque terminaison si non atteint
- [ ] Seuil 80% bloque validation si non atteint
- [ ] QUALITE ne peut pas modifier les CRV
- [ ] Suppression utilisateur avec CRV associés bloquée
- [ ] Validation code ONU format correct

### Moyens (MOYENNE priorité)
- [ ] Prérequis phase bloquent démarrage
- [ ] Versioning avion crée nouvelle version
- [ ] Liaison vol-programme fonctionne

### Mineurs (BASSE priorité)
- [ ] Uppercase immatriculation affiché
- [ ] Note remplacement engins visible
- [ ] Descriptions rôles affichées

---

## NOTES D'IMPLEMENTATION

1. **Tous les imports** utilisent le chemin alias `@/` configuré dans vite.config.js
2. **Les enums** sont centralisés dans `src/config/crvEnums.js`
3. **Les permissions** sont gérées via `src/utils/permissions.js` et `src/config/roles.js`
4. **Les stores Pinia** suivent le pattern Composition API
5. **Les composants** utilisent `<script setup>` exclusivement

---

**Document généré le 2026-01-10**
**Référence normative : MVS 1-10 FRONT-CORRECTIONS.md**
**Auteur : Claude Code**
