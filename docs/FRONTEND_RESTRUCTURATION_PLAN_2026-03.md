# PLAN DE RESTRUCTURATION PARTIELLE — FRONTEND CRV OPERATION

**Version :** 1.0
**Date :** 2026-03-03
**Auteur :** Architecture Frontend
**Projet :** CRV Operation — Vue 3 + Pinia
**Objectif :** Stabilisation architecturale sans régression

---

## TABLE DES MATIÈRES

1. [État actuel](#1-état-actuel)
2. [Problèmes structuraux](#2-problèmes-structuraux)
3. [Cible architecturale](#3-cible-architecturale)
4. [Plan d'unification authentification](#4-plan-dunification-authentification)
5. [Matrice permissions finale](#5-matrice-permissions-finale)
6. [Plan stores](#6-plan-stores)
7. [Risques et régression](#7-risques-et-régression)
8. [Plan d'exécution](#8-plan-dexécution)
9. [Check-list de validation](#9-check-list-de-validation)
10. [Estimation temps](#10-estimation-temps)

---

## 1. ÉTAT ACTUEL

### 1.1 Architecture fichiers authentification

| Fichier | Chemin | Lignes | Rôle actuel |
|---------|--------|--------|-------------|
| `authService.js` | `src/services/auth/authService.js` | 232 | Façade legacy — accès direct API + localStorage |
| `authStore.js` | `src/stores/authStore.js` | 252 | Store Pinia — état réactif + actions |
| `useAuth.js` | `src/composables/useAuth.js` | 290 | Composable Vue — wrapper autour d'authService |
| `api.js` (intercepteur) | `src/services/api.js` | L.27-83 | Injection JWT + gestion 401/403 |

### 1.2 Architecture fichiers permissions

| Fichier | Chemin | Lignes | Rôle actuel |
|---------|--------|--------|-------------|
| `permissions.js` | `src/utils/permissions.js` | 573 | Matrice PERMISSION_MATRIX + fonctions métier |
| `roles.js` | `src/config/roles.js` | 249 | Constantes rôles + groupes + normalisation |
| `usePermissions.js` | `src/composables/usePermissions.js` | 196 | Composable réactif permissions |
| `vCan.js` | `src/directives/vCan.js` | 197 | Directives v-can et v-readonly (NON UTILISÉES) |

### 1.3 Inventaire stores Pinia

| Store | Fichier | Lignes | ID Pinia | Statut utilisation |
|-------|---------|--------|----------|-------------------|
| authStore | `stores/authStore.js` | 252 | `auth` | ACTIF — 12 imports |
| crvStore | `stores/crvStore.js` | 53 231 o. | `crv` | ACTIF — cœur métier |
| bulletinStore | `stores/bulletinStore.js` | 697 | `bulletin` | ACTIF — 4+ imports |
| chargesStore | `stores/chargesStore.js` | 441 | `charges` | PARTIEL — CRVCharges uniquement |
| phasesStore | `stores/phasesStore.js` | 237 | `phases` | ACTIF — CRVPhases |
| programmesStore | `stores/programmesStore.js` | 243 | `programmes` | ACTIF — ProgrammesVol |
| avionsStore | `stores/avionsStore.js` | 344 | `avions` | **JAMAIS UTILISÉ** |
| volsStore | `stores/volsStore.js` | 144 | `vols` | **CONTOURNÉ** |
| notificationsStore | `stores/notificationsStore.js` | 206 | `notifications` | MINIMAL — stats uniquement |
| slaStore | `stores/slaStore.js` | 247 | `sla` | **JAMAIS UTILISÉ** |
| personnesStore | `stores/personnesStore.js` | 313 | `personnes` | PARTIEL — Admin direct API |
| themeStore | `stores/themeStore.js` | 72 | `theme` | ACTIF — App.vue + Header |

### 1.4 Flux d'authentification actuel

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ÉTAT ACTUEL (3 SOURCES)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Login.vue ──→ useAuth().login() ──→ authService.loginUser()        │
│                                         ├─→ API POST /auth/connexion│
│                                         ├─→ localStorage.setItem()  │
│                                         └─→ return response         │
│                                                                      │
│  CRVNouveau.vue ──→ useAuthStore() ──→ authStore.login()            │
│                                         ├─→ API POST /auth/connexion│
│                                         ├─→ localStorage.setItem()  │
│                                         └─→ update state            │
│                                                                      │
│  router/index.js ──→ authService.getToken() ──→ localStorage direct │
│                  ──→ authService.getUserRole() ──→ localStorage      │
│                  ──→ authService.doitChangerMotDePasse() ──→ lS     │
│                                                                      │
│  api.js intercepteur ──→ localStorage.getItem('auth_token') direct  │
│                                                                      │
│  ChangePassword.vue ──→ localStorage.getItem('auth_token') direct   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. PROBLÈMES STRUCTURAUX

### 2.1 Authentification — Sources multiples de vérité

#### PROB-AUTH-01 : Triple couche auth sans hiérarchie claire

| Composant | Responsabilité déclarée | Responsabilité réelle | Problème |
|-----------|------------------------|----------------------|----------|
| `authService.js` | Façade API legacy | Gère localStorage + appels API + getters | Duplique authStore |
| `authStore.js` | Store Pinia principal | Gère localStorage + appels API + state | Duplique authService |
| `useAuth.js` | Composable Vue | Wrapper autour d'authService, pas d'authStore | **N'utilise PAS authStore** |

**Conséquence** : `useAuth()` et `useAuthStore()` sont deux chemins parallèles indépendants. Un login via `useAuth()` ne met PAS à jour `authStore`, et inversement.

#### PROB-AUTH-02 : Normalisation utilisateur dupliquée en 4 endroits

La construction de l'objet `userData` est identique dans :

| Fichier | Ligne | Fonction |
|---------|-------|----------|
| `authService.js` | L.42-53 | `loginUser()` |
| `authService.js` | L.134-143 | `fetchCurrentUser()` |
| `authStore.js` | L.94-103 | `login()` action |
| `authStore.js` | L.163-172 | `fetchUser()` action |

```javascript
// Ce bloc est copié/collé 4 fois :
const userData = {
  id: utilisateur.id || utilisateur._id,
  nom: utilisateur.nom,
  prenom: utilisateur.prenom,
  email: utilisateur.email,
  fonction: roleNormalise,
  role: roleNormalise,
  matricule: utilisateur.matricule,
  telephone: utilisateur.telephone
}
```

#### PROB-AUTH-03 : 25 accès localStorage répartis dans 5 fichiers

| Fichier | Nb accès | Opérations |
|---------|----------|------------|
| `authService.js` | 8 | getItem/setItem/removeItem |
| `authStore.js` | 10 | getItem/setItem/removeItem |
| `api.js` (intercepteur) | 5 | getItem/removeItem |
| `Login.vue` | 2 | removeItem |
| `ChangePassword.vue` | 1 | getItem |

**Risque** : Désynchronisation entre localStorage et state Pinia si un fichier met à jour sans l'autre.

#### PROB-AUTH-04 : Incohérence `isAuthenticated`

| Source | Vérification | Fichier:Ligne |
|--------|-------------|---------------|
| `authService.js` | `!!getToken()` | L.200-202 |
| `authStore.js` | `!!state.token && !!state.user` | L.30 |
| `useAuth.js` | `!!getToken()` | L.31 |
| `router/index.js` | `getToken()` (truthy) | L.93 |

**Problème** : `authStore` exige token ET user, les autres ne vérifient que le token. Si user est `null` mais token existe, le comportement diverge.

#### PROB-AUTH-05 : Logique logout dupliquée

| Fichier | Ligne | Actions |
|---------|-------|---------|
| `authService.js` | L.85-93 | try API → finally clear localStorage |
| `authStore.js` | L.136-146 | try API → finally clear localStorage + state |
| `useAuth.js` | L.139-158 | Appelle authService.logoutUser() + reset refs |
| `api.js` | L.49-57 | Sur 401 : clear localStorage + redirect |

#### PROB-AUTH-06 : `getRedirectPathForRole` dupliqué

| Fichier | Ligne | Particularité |
|---------|-------|---------------|
| `router/index.js` | L.169-191 | Inclut compatibilité anciens rôles ('admin', 'manager', 'agent_ops') |
| `useAuth.js` | L.199-211 | Version simplifiée sans compatibilité legacy |

### 2.2 Permissions — Doublons entre roles.js et permissions.js

#### PROB-PERM-01 : Fonctions dupliquées entre les deux fichiers

| Fonction | `roles.js` | `permissions.js` | Logique identique ? |
|----------|-----------|-------------------|---------------------|
| `canValidateProgramme(role)` | L.188-190 | L.363-367 | **NON** — roles.js vérifie `[SUPERVISEUR, MANAGER]`, permissions.js vérifie `PERMISSION_MATRIX[PROGRAMME_VALIDER]` qui inclut les 4 opérationnels |
| `canDeleteCRV(role)` | L.197-199 | L.341-345 | **NON** — roles.js vérifie `[SUPERVISEUR, MANAGER]`, permissions.js vérifie `PERMISSION_MATRIX[CRV_SUPPRIMER]` qui inclut les 5 (opérationnels + ADMIN) |
| `canDeleteProgramme(role)` | L.206-208 | L.374-378 | **NON** — roles.js vérifie `[MANAGER]`, permissions.js vérifie `PERMISSION_MATRIX[PROGRAMME_SUPPRIMER]` qui inclut les 4 opérationnels |
| `isReadOnly(role)` / `isReadOnlyRole(role)` | L.170-172 | L.385-389 | OUI — identique |
| `isAdmin(role)` / `isAdminRole(role)` | L.179-181 | L.463-467 | OUI — identique |

#### PROB-PERM-02 : Incohérence majeure entre groupes roles.js et PERMISSION_MATRIX

| Action | `roles.js` (groupes) | `permissions.js` (matrice) | Divergence |
|--------|---------------------|---------------------------|-----------|
| Suppression CRV | `ROLES_SUPPRESSION_CRV` = [SUPERVISEUR, MANAGER] | `CRV_SUPPRIMER` = [AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER, ADMIN] | **CRITIQUE** — La matrice autorise TOUS les opérationnels + ADMIN |
| Validation programme | `ROLES_VALIDATION_PROGRAMME` = [SUPERVISEUR, MANAGER] | `PROGRAMME_VALIDER` = [AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER] | **DIVERGENCE** — La matrice autorise aussi AGENT/CHEF |
| Suppression programme | `ROLES_SUPPRESSION_PROGRAMME` = [MANAGER] | `PROGRAMME_SUPPRIMER` = [AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER] | **CRITIQUE** — La matrice autorise TOUS les opérationnels |

**Impact** : Si un composant utilise `roles.canDeleteCRV()` vs `permissions.canDeleteCRV()`, le résultat diffère pour AGENT_ESCALE, CHEF_EQUIPE et ADMIN.

#### PROB-PERM-03 : Directives v-can et v-readonly — Code mort

| Directive | Fichier:Ligne | Lignes de code | Utilisation templates | Statut |
|-----------|--------------|----------------|----------------------|--------|
| `v-can` | `vCan.js` L.1-100 | 100 | **0 templates** | MORT |
| `v-readonly` | `vCan.js` L.101-197 | 96 | **0 templates** | MORT |

Enregistrées dans `main.js` mais jamais utilisées dans aucun template Vue.

#### PROB-PERM-04 : 35 console.log dans permissions.js

Toutes les fonctions de `permissions.js` contiennent des `console.log` de debug qui polluent la console en production :

- `hasPermission()` : L.214, L.223, L.228
- `hasAnyPermission()` : L.242, L.251
- `hasAllPermissions()` : L.264, L.273
- `getPermissionsForRole()` : L.285, L.293
- `getRolesForAction()` : L.305
- Toutes les fonctions métier : L.321, L.332, L.343, L.354, L.365, L.376, L.387, L.398, L.409, L.420, L.431, L.442, L.454, L.466, L.496, L.535, L.539, L.544

#### PROB-PERM-05 : ADMIN dans les permissions CRV — Incohérence doctrinale

| Constat | Détail |
|---------|--------|
| Doctrine router | ADMIN bloqué des routes `/crv/*` (router/index.js L.155-158) |
| Matrice permissions | `CRV_CREER`, `CRV_MODIFIER`, `CRV_SUPPRIMER`, etc. incluent ADMIN via `ROLES_OPERATIONNELS_ET_ADMIN` |
| `canTransitionCRV()` | L.534-546 : autorise ADMIN pour toutes les transitions |

**Problème** : Le router interdit l'accès ADMIN aux CRV, mais la matrice de permissions lui donne tous les droits CRV. Contradiction architecturale.

### 2.3 Stores — Contournements et code mort

#### PROB-STORE-01 : Stores jamais instanciés

| Store | Exporté dans index.js | Importé par un .vue | Verdict |
|-------|----------------------|---------------------|---------|
| `avionsStore` | OUI (L.33) | **NON** — 0 imports détectés | CODE MORT |
| `slaStore` | OUI (L.39) | **NON** — 0 imports détectés | CODE MORT |

#### PROB-STORE-02 : Stores contournés — Vues appelant l'API directement

| Vue | API importée directement | Store existant | Lignes |
|-----|-------------------------|----------------|--------|
| `Manager/Statistiques.vue` | `crvAPI, notificationsAPI, volsAPI, chargesAPI` | crvStore, notificationsStore, chargesStore | L.212, L.320-389 |
| `CRV/CRVNouveau.vue` | `programmesVolAPI, bulletinsAPI` | programmesStore, bulletinStore | L.363-364, L.481-607 |
| `Admin/Dashboard.vue` | `personnesAPI, crvAPI` | personnesStore, crvStore | L.269, L.335-485 |
| `Admin/GestionUtilisateurs.vue` | `personnesAPI` | personnesStore | L.239, L.288-391 |
| `Manager/ValidationCRV.vue` | `crvAPI, validationAPI` | crvStore | L.409, L.509-645 |
| `Manager/ProgrammesVol.vue` | `programmesVolAPI` | programmesStore | Direct API usage |
| `Manager/AvionsGestion.vue` | `avionsAPI` | avionsStore (NON UTILISÉ) | Direct API usage |

#### PROB-STORE-03 : Actions async sans `finally` (notificationsStore)

| Action | Ligne | Problème |
|--------|-------|----------|
| `loadCountNonLues()` | L.77-86 | try/catch sans finally — `loading` peut rester `true` |
| `loadStatistiques()` | L.111-120 | try/catch sans finally |
| `createNotification()` | L.126-136 | try/catch sans finally |
| `marquerLue()` | L.142-155 | try/catch sans finally |

#### PROB-STORE-04 : ~35 méthodes API potentiellement mortes

Voir section 6.3 pour la liste détaillée des fonctions API définies dans `api.js` mais jamais appelées.

### 2.4 Router — Doublons et legacy

#### PROB-ROUTER-01 : Guard double pour ADMIN/CRV

Le router vérifie l'accès ADMIN aux CRV en deux endroits :

1. **L.135-148** : Vérification `allowedRoles` (ADMIN pas dans la liste des routes CRV)
2. **L.155-159** : Vérification explicite `userRole === ROLES.ADMIN && to.path.startsWith('/crv')`

Le check n°2 est redondant si les routes CRV définissent correctement `allowedRoles` sans ADMIN.

#### PROB-ROUTER-02 : Compatibilité legacy dans `getRedirectPathForRole`

```javascript
// router/index.js L.182-187 — À SUPPRIMER
case 'admin':
  return '/dashboard-admin';
case 'manager':
  return '/dashboard-manager';
case 'agent_ops':
  return '/services';
```

Ces cas legacy ne sont jamais atteints car `normalizeRole()` convertit déjà les anciens noms. Code mort.

---

## 3. CIBLE ARCHITECTURALE

### 3.1 Authentification — Architecture cible

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE CIBLE                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Login.vue ──→ useAuth() ──→ useAuthStore().login()                 │
│                                  ├─→ authAPI.login()                │
│                                  ├─→ localStorage (via helpers)     │
│                                  └─→ state Pinia (source unique)    │
│                                                                      │
│  Tous les .vue ──→ useAuth() ──→ useAuthStore() (getters)           │
│                                                                      │
│  router/index.js ──→ useAuthStore() (getters réactifs)              │
│                                                                      │
│  api.js intercepteur ──→ useAuthStore().getToken (si possible)      │
│                          ou localStorage (fallback technique)        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Principes :**

1. `authStore` = **seule source de vérité** pour l'état d'authentification
2. `useAuth()` = composable Vue qui **délègue tout à authStore** (plus d'authService)
3. `authService` = **déprécié** puis supprimé
4. localStorage = géré **exclusivement** par authStore (persistance)
5. `normalizeUserData()` = **fonction utilitaire unique** pour la construction de l'objet user

### 3.2 Permissions — Architecture cible

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE CIBLE                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  roles.js (config)                                                   │
│    └─ ROLES, ROLES_LABELS, normalizeRole(), getRolesForSelect()     │
│    └─ PAS de fonctions canXxx() — supprimées                        │
│                                                                      │
│  permissions.js (utils)                                              │
│    └─ ACTIONS, PERMISSION_MATRIX                                     │
│    └─ hasPermission(), hasAnyPermission(), hasAllPermissions()       │
│    └─ Fonctions métier : canXxx() — SOURCE UNIQUE                   │
│    └─ console.log supprimés en production                            │
│                                                                      │
│  usePermissions() (composable)                                       │
│    └─ Wrapper réactif sur permissions.js                             │
│                                                                      │
│  vCan.js (directives)                                                │
│    └─ SUPPRIMÉ                                                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Principes :**

1. `permissions.js` = **seule source** pour toutes les vérifications de permissions
2. `roles.js` = **configuration pure** (constantes + normalisation, pas de logique métier)
3. Directives `v-can` / `v-readonly` = **supprimées** (code mort)
4. console.log = **supprimés** ou conditionnés à `import.meta.env.DEV`

### 3.3 Stores — Architecture cible

| Store | Décision | Justification |
|-------|----------|---------------|
| `authStore` | **GARDER** — Source unique auth | Pilier architecture |
| `crvStore` | **GARDER** — Forcer usage | Cœur métier |
| `bulletinStore` | **GARDER** — Forcer usage | Module bulletin actif |
| `chargesStore` | **GARDER** — Forcer usage | Sous-module CRV |
| `phasesStore` | **GARDER** — Forcer usage | Sous-module CRV |
| `programmesStore` | **GARDER** — Forcer usage | Module programmes |
| `avionsStore` | **SUPPRIMER** | Jamais instancié, API appelée directement |
| `volsStore` | **GARDER** — Réévaluer | Contourné mais utile potentiellement |
| `notificationsStore` | **GARDER** — Corriger | Bugs `finally` manquants |
| `slaStore` | **SUPPRIMER** | Jamais instancié, API sous-jacente non connectée |
| `personnesStore` | **GARDER** — Forcer usage | Module admin, contourné actuellement |
| `themeStore` | **GARDER** | Actif et stable |

---

## 4. PLAN D'UNIFICATION AUTHENTIFICATION

### Phase AUTH-1 : Créer `normalizeUserData()` (utilitaire partagé)

**Objectif** : Éliminer la quadruple duplication de la construction utilisateur.

**Fichier cible** : `src/config/roles.js` (ajout export)

```javascript
// À ajouter dans roles.js
export function normalizeUserData(utilisateur) {
  const roleNormalise = normalizeRole(utilisateur)
  return {
    id: utilisateur.id || utilisateur._id,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    email: utilisateur.email,
    fonction: roleNormalise,
    role: roleNormalise,
    matricule: utilisateur.matricule,
    telephone: utilisateur.telephone
  }
}
```

**Impacts** : 4 remplacements dans authService.js (L.42-53, L.134-143) et authStore.js (L.94-103, L.163-172)

### Phase AUTH-2 : Migrer authStore comme source unique

**Modifications authStore.js :**

1. Utiliser `normalizeUserData()` dans `login()` et `fetchUser()`
2. Ajouter un getter `getToken` qui lit directement depuis state (pas localStorage)
3. Unifier `isAuthenticated` : `!!state.token && !!state.user`

**Aucune modification dans :**
- `api.js` intercepteur : Garde la lecture localStorage car exécuté hors contexte Vue (pas d'accès au store Pinia facilement)

### Phase AUTH-3 : Migrer useAuth() vers authStore

**Fichier cible** : `src/composables/useAuth.js`

**Avant (actuel)** :
```javascript
import { loginUser, logoutUser, ... } from '@/services/auth/authService'
```

**Après (cible)** :
```javascript
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  // États réactifs — délégués au store
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const userRole = computed(() => authStore.getUserRole)
  const userData = computed(() => authStore.currentUser)
  // ... etc

  // Actions — délèguent au store
  const login = async (credentials) => {
    try {
      await authStore.login(credentials)
      // Gestion redirection...
    }
  }
}
```

**Impact** : useAuth() ne dépend plus d'authService.

### Phase AUTH-4 : Migrer router/index.js

**Fichier** : `src/router/index.js`

**Actuel (L.27)** :
```javascript
import { getToken, getUserRole, doitChangerMotDePasse } from '@/services/auth/authService'
```

**Cible** :
```javascript
import { useAuthStore } from '@/stores/authStore'
```

**Guard modifié** :
```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const token = authStore.getToken
  const userRole = authStore.getUserRole
  const mustChangePassword = authStore.mustChangePassword
  // ... reste identique
})
```

**Point d'attention** : Le store Pinia doit être initialisé avant le router. Vérifier l'ordre dans `main.js`.

### Phase AUTH-5 : Supprimer les legacy dans router

**Supprimer** dans `getRedirectPathForRole()` (L.182-187) :
```javascript
case 'admin':
case 'manager':
case 'agent_ops':
```

Ces cas sont morts — `normalizeRole()` les convertit avant d'arriver au router.

### Phase AUTH-6 : Déprécier authService.js

**Étape 1** : Ajouter un commentaire `@deprecated` en haut du fichier
**Étape 2** : Supprimer les imports d'authService dans :

| Fichier | Import actuel | Migration vers |
|---------|--------------|----------------|
| `App.vue` (L.27) | `getToken, getUserRole, getUserData, logoutUser` | `useAuthStore` |
| `router/index.js` (L.27) | `getToken, getUserRole, doitChangerMotDePasse` | `useAuthStore` |
| `useAuth.js` (L.12-20) | 8 fonctions | `useAuthStore` |
| `vCan.js` (L.16) | `getUserRole` | Fichier supprimé (voir Phase PERM-3) |

**Étape 3** : Supprimer `authService.js` une fois tous les imports migrés.

### Phase AUTH-7 : Nettoyer les accès localStorage directs

**Après migration, seuls les fichiers suivants accèdent à localStorage :**

| Fichier | Justification | Action |
|---------|--------------|--------|
| `authStore.js` | Persistance unique | GARDER |
| `api.js` intercepteur | Injection header hors contexte Vue | GARDER (contrainte technique) |
| `Login.vue` (L.123-124) | Nettoyage session expirée | MIGRER vers authStore.logout() |
| `ChangePassword.vue` (L.286) | Vérification auth | MIGRER vers useAuth() |

---

## 5. MATRICE PERMISSIONS FINALE

### 5.1 Corrections à appliquer dans PERMISSION_MATRIX

#### Incohérence ADMIN dans les CRV

**Décision recommandée** : Retirer ADMIN des permissions CRV opérationnelles.

**Justification** : Le router bloque déjà ADMIN des routes `/crv/*`. La matrice doit refléter la même doctrine.

**Modifications dans `permissions.js`** :

```javascript
// AVANT (L.112-118)
const ROLES_OPERATIONNELS_ET_ADMIN = [
  ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE,
  ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.ADMIN
]

// APRÈS — Renommer et retirer ADMIN pour les CRV
const ROLES_OPERATIONNELS = [
  ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE,
  ROLES.SUPERVISEUR, ROLES.MANAGER
]
```

**Actions CRV affectées** : `CRV_CREER`, `CRV_MODIFIER`, `CRV_SUPPRIMER`, `CRV_ARCHIVER`, `CRV_DEMARRER`, `CRV_TERMINER`

**Actions CRV restreintes (garder SUPERVISEUR/MANAGER seulement pour validation)** :
`CRV_VALIDER`, `CRV_REJETER`, `CRV_VERROUILLER`, `CRV_DEVERROUILLER`, `CRV_ANNULER`, `CRV_REACTIVER`

**ATTENTION** : Cette modification doit être validée avec le backend. Si le backend autorise réellement ADMIN sur les CRV via `excludeQualite`, alors c'est le router qui a tort. Nécessite clarification.

#### Alignement groupes roles.js avec permissions.js

**Option recommandée** : Supprimer les fonctions `canXxx()` de `roles.js` et ne garder que les groupes de rôles en constantes.

| Dans roles.js | Action |
|--------------|--------|
| `canValidateProgramme()` L.188-190 | SUPPRIMER — utiliser `permissions.canValidateProgramme()` |
| `canDeleteCRV()` L.197-199 | SUPPRIMER — utiliser `permissions.canDeleteCRV()` |
| `canDeleteProgramme()` L.206-208 | SUPPRIMER — utiliser `permissions.canDeleteProgramme()` |
| `ROLES_VALIDATION_PROGRAMME` L.51-54 | GARDER comme constante de configuration |
| `ROLES_SUPPRESSION_CRV` L.59-62 | GARDER comme constante de configuration |
| `ROLES_SUPPRESSION_PROGRAMME` L.67-69 | GARDER comme constante de configuration |

### 5.2 Matrice permissions finale recommandée

| Action | AGENT_ESCALE | CHEF_EQUIPE | SUPERVISEUR | MANAGER | QUALITE | ADMIN |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|
| **CRV** |
| CRV_CREER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌* |
| CRV_MODIFIER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌* |
| CRV_LIRE | ✅ | ✅ | ✅ | ✅ | ✅ | ❌* |
| CRV_SUPPRIMER | ❌ | ❌ | ✅ | ✅ | ❌ | ❌* |
| CRV_ARCHIVER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌* |
| CRV_DEMARRER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌* |
| CRV_TERMINER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌* |
| CRV_VALIDER | ❌ | ❌ | ✅ | ✅ | ❌ | ❌* |
| CRV_REJETER | ❌ | ❌ | ✅ | ✅ | ❌ | ❌* |
| CRV_VERROUILLER | ❌ | ❌ | ✅ | ✅ | ❌ | ❌* |
| CRV_DEVERROUILLER | ❌ | ❌ | ✅ | ✅ | ❌ | ❌* |
| CRV_ANNULER | ❌ | ❌ | ✅ | ✅ | ❌ | ❌* |
| CRV_REACTIVER | ❌ | ❌ | ✅ | ✅ | ❌ | ❌* |
| **Charges** |
| CHARGE_AJOUTER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| CHARGE_MODIFIER_CATEGORIES | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| CHARGE_MODIFIER_CLASSES | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| CHARGE_MODIFIER_BESOINS_MEDICAUX | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| CHARGE_AJOUTER_DGR | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Phases** |
| PHASE_DEMARRER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| PHASE_TERMINER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| PHASE_NON_REALISE | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| PHASE_MODIFIER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Vols** |
| VOL_CREER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| VOL_MODIFIER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| VOL_LIRE | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| VOL_LIER_PROGRAMME | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| VOL_MARQUER_HORS_PROGRAMME | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Programmes** |
| PROGRAMME_CREER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| PROGRAMME_MODIFIER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| PROGRAMME_LIRE | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| PROGRAMME_VALIDER | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| PROGRAMME_ACTIVER | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| PROGRAMME_SUSPENDRE | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| PROGRAMME_SUPPRIMER | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Avions** |
| AVION_MODIFIER_CONFIG | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| AVION_CREER_VERSION | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| AVION_LIRE_VERSIONS | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| AVION_RESTAURER_VERSION | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Statistiques** |
| STATS_LIRE | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Utilisateurs** |
| USER_CREER | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| USER_LIRE | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| USER_MODIFIER | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| USER_DESACTIVER | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| USER_REACTIVER | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| USER_SUPPRIMER | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| USER_CHANGER_ROLE | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Profil** |
| PROFIL_LIRE | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PROFIL_CHANGER_MDP | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bulletins** |
| BULLETIN_CREER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| BULLETIN_MODIFIER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| BULLETIN_LIRE | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| BULLETIN_SUPPRIMER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| BULLETIN_PUBLIER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| BULLETIN_ARCHIVER | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

> *❌\* = ADMIN bloqué au niveau router, pas uniquement permissions*

> **IMPORTANT** : La colonne ADMIN sur les CRV dépend de la clarification backend.
> Si le backend `excludeQualite` inclut effectivement ADMIN, alors les ❌* deviennent ✅
> mais le guard router doit être retiré. **À valider avec l'équipe backend.**

### 5.3 Suppressions dans roles.js

| Fonction | Ligne | Raison suppression |
|----------|-------|-------------------|
| `canValidateProgramme()` | L.188-190 | Doublon avec `permissions.canValidateProgramme()` — logique divergente |
| `canDeleteCRV()` | L.197-199 | Doublon avec `permissions.canDeleteCRV()` — logique divergente |
| `canDeleteProgramme()` | L.206-208 | Doublon avec `permissions.canDeleteProgramme()` — logique divergente |

**Les constantes de groupes** (`ROLES_VALIDATION_PROGRAMME`, `ROLES_SUPPRESSION_CRV`, `ROLES_SUPPRESSION_PROGRAMME`) sont **conservées** car elles documentent l'intention métier et sont utilisées dans les routes.

### 5.4 Nettoyage console.log dans permissions.js

**Action** : Remplacer tous les `console.log` par un wrapper conditionnel :

```javascript
const logPermission = import.meta.env.DEV
  ? (...args) => console.log(...args)
  : () => {}
```

Ou supprimer purement et simplement les 35 `console.log` de debug.

---

## 6. PLAN STORES

### 6.1 Stores à GARDER et forcer leur usage

#### authStore — Source unique auth
- **Décision** : GARDER — Devient la source unique
- **Actions requises** : Migration useAuth() et router (voir section 4)

#### crvStore — Cœur métier
- **Décision** : GARDER — Forcer usage dans ValidationCRV.vue et CRVList.vue
- **Actions requises** : Les vues qui appellent `crvAPI` directement doivent passer par le store

#### bulletinStore — Module bulletin
- **Décision** : GARDER — Forcer usage dans CRVNouveau.vue
- **Actions requises** : Migrer les appels directs `bulletinsAPI` dans CRVNouveau.vue

#### chargesStore — Sous-module CRV
- **Décision** : GARDER — Usage correct dans CRVCharges.vue
- **Actions requises** : Aucune

#### phasesStore — Sous-module CRV
- **Décision** : GARDER — Usage correct
- **Actions requises** : Aucune

#### programmesStore — Module programmes
- **Décision** : GARDER — Forcer usage dans ProgrammesVol.vue et CRVNouveau.vue
- **Actions requises** : Migrer les appels directs `programmesVolAPI`

#### volsStore — Module vols
- **Décision** : GARDER — Réévaluer
- **Justification** : Le store existe et les API sont définies. Certaines vues appellent `volsAPI` directement (Statistiques.vue). Le store pourrait centraliser la gestion des vols.
- **Actions requises** : Évaluer si les vues ont besoin d'état partagé pour les vols. Si oui, forcer le store. Si non, supprimer le store et garder les appels API directs.

#### notificationsStore — Module notifications
- **Décision** : GARDER — Corriger les bugs
- **Actions requises** :
  - Ajouter `finally { this.loading = false }` dans les 4 actions identifiées (PROB-STORE-03)
  - Forcer l'usage dans Statistiques.vue au lieu d'appels directs `notificationsAPI`

#### personnesStore — Module admin
- **Décision** : GARDER — Forcer usage
- **Actions requises** : Migrer `Admin/Dashboard.vue` et `Admin/GestionUtilisateurs.vue` pour utiliser le store

#### themeStore — UI
- **Décision** : GARDER
- **Actions requises** : Aucune — fonctionne correctement

### 6.2 Stores à SUPPRIMER

#### avionsStore — Jamais instancié

**Justification complète :**
- 0 imports dans des fichiers .vue
- `AvionsGestion.vue` appelle `avionsAPI` directement
- Le store définit 11 actions et 9 state properties qui ne servent à rien
- 344 lignes de code mort

**Plan de suppression :**
1. Supprimer `src/stores/avionsStore.js`
2. Supprimer l'export dans `src/stores/index.js` (L.33)
3. Vérifier qu'aucun test ne l'importe

#### slaStore — Jamais instancié

**Justification complète :**
- 0 imports dans des fichiers .vue
- Les API SLA (`slaAPI`) ne sont appelées nulle part dans l'application
- Le module SLA n'est pas encore connecté côté backend
- 247 lignes de code mort

**Plan de suppression :**
1. Supprimer `src/stores/slaStore.js`
2. Supprimer l'export dans `src/stores/index.js` (L.39)
3. Vérifier qu'aucun test ne l'importe
4. **NE PAS** supprimer `slaAPI` dans `api.js` — il sera utile quand le backend sera prêt

### 6.3 Méthodes API mortes dans api.js

| Module | Fonction | Ligne | Statut |
|--------|----------|-------|--------|
| `authAPI` | `register` | L.104 | MORT — inscription fermée |
| `phasesAPI` | `update` | L.536 | POTENTIELLEMENT MORT |
| `phasesAPI` | `getById` | L.542 | POTENTIELLEMENT MORT |
| `phasesAPI` | `updateManuel` | L.562 | POTENTIELLEMENT MORT |
| `volsAPI` | `getById` | L.594 | POTENTIELLEMENT MORT |
| `volsAPI` | `update` | L.600 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `valider` | L.646 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `activer` | L.653 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `suspendre` | L.660 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `getActif` | L.666 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `dupliquer` | L.672 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `getResumeById` | L.684 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `getVolsParCompagnie` | L.714 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `reorganiserVols` | L.735 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `getVol` | L.741 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `archiver` | L.787 | POTENTIELLEMENT MORT |
| `programmesVolAPI` | `getArchivageStatus` | L.797 | POTENTIELLEMENT MORT |
| `chargesAPI` | `update` | L.902 | POTENTIELLEMENT MORT |
| `chargesAPI` | `getMarchandisesDangereuses` | L.921 | POTENTIELLEMENT MORT |
| `notificationsAPI` | `create` | L.1059 | POTENTIELLEMENT MORT |
| `notificationsAPI` | `archiver` | L.1071 | POTENTIELLEMENT MORT |
| `notificationsAPI` | `delete` | L.1077 | POTENTIELLEMENT MORT |
| `slaAPI` | `updateConfiguration` | L.1103 | POTENTIELLEMENT MORT |
| `slaAPI` | `surveillerCRV` | L.1110 | POTENTIELLEMENT MORT |
| `slaAPI` | `surveillerPhases` | L.1117 | POTENTIELLEMENT MORT |
| `slaAPI` | `getPhaseSla` | L.1129 | POTENTIELLEMENT MORT |
| `validationAPI` | `verrouiller` | L.1156 | POTENTIELLEMENT MORT |
| `validationAPI` | `getStatus` | L.1178 | POTENTIELLEMENT MORT |
| `enginsAPI` | `getTypes` | L.1205 | POTENTIELLEMENT MORT |
| `enginsAPI` | `create` | L.1226 | POTENTIELLEMENT MORT |
| `enginsAPI` | `getById` | L.1235 | POTENTIELLEMENT MORT |
| `enginsAPI` | `update` | L.1244 | POTENTIELLEMENT MORT |
| `enginsAPI` | `delete` | L.1253 | POTENTIELLEMENT MORT |

**Recommandation** : Supprimer `authAPI.register` (certainement mort). Pour les autres, ajouter un commentaire `// TODO: Vérifier usage` et nettoyer progressivement après vérification backend.

---

## 7. RISQUES ET RÉGRESSION

### 7.1 Risques identifiés

| ID | Risque | Probabilité | Impact | Mitigation |
|----|--------|-------------|--------|------------|
| R1 | Login cassé après migration useAuth → authStore | ÉLEVÉ | CRITIQUE | Tester login/logout avec les 6 rôles avant merge |
| R2 | Router guard non fonctionnel si Pinia non initialisé | MOYEN | CRITIQUE | Vérifier ordre d'initialisation dans main.js |
| R3 | Permissions divergentes après suppression doublons roles.js | MOYEN | ÉLEVÉ | Comparer résultats avant/après pour chaque rôle |
| R4 | Intercepteur API 401 perd l'accès token | FAIBLE | CRITIQUE | L'intercepteur garde localStorage — pas de changement |
| R5 | Vue qui importe authService directement casse | MOYEN | MOYEN | Grep exhaustif avant suppression |
| R6 | Store supprimé importé dans un test | FAIBLE | FAIBLE | Grep dans /tests/ |
| R7 | ADMIN perd/gagne accès CRV involontairement | ÉLEVÉ | ÉLEVÉ | Clarifier doctrine backend AVANT modification |

### 7.2 Zones sensibles

| Zone | Fichiers | Raison |
|------|----------|--------|
| Login flow | `Login.vue`, `useAuth.js`, `authStore.js`, `router/index.js` | Chaîne complète d'authentification |
| Password change | `ChangePassword.vue`, `useAuth.js`, `authStore.js` | Flag `doitChangerMotDePasse` |
| Intercepteur API | `api.js` L.27-83 | Injection token, gestion 401/403 |
| Validation CRV | `ValidationCRV.vue`, `permissions.js` | Workflow métier critique |
| Admin users | `GestionUtilisateurs.vue`, `personnesAPI` | Gestion comptes |

### 7.3 Dépendances backend

| Décision frontend | Dépendance backend | Action requise |
|-------------------|-------------------|----------------|
| ADMIN dans permissions CRV | Middleware `excludeQualite` | **Clarifier** si ADMIN est inclus ou exclu |
| Suppression `authAPI.register` | Route POST `/auth/inscription` | Confirmer que l'inscription est fermée |
| Matrice `PROGRAMME_SUPPRIMER` | Middleware programme suppression | Vérifier qui peut réellement supprimer un programme |
| `CRV_SUPPRIMER` permissions | Middleware CRV suppression | Vérifier les rôles autorisés côté backend |

---

## 8. PLAN D'EXÉCUTION

### 8.1 Roadmap en phases

```
PHASE 0 — Préparation (pas de code modifié)
├── 0.1 Clarifier doctrine ADMIN/CRV avec backend
├── 0.2 Valider la matrice permissions avec l'équipe
└── 0.3 Snapshot des tests existants (baseline)

PHASE 1 — Fondations (modifications isolées, aucun impact)
├── 1.1 Ajouter normalizeUserData() dans roles.js
├── 1.2 Supprimer console.log dans permissions.js
├── 1.3 Supprimer directives v-can/v-readonly (vCan.js)
└── 1.4 Corriger finally manquants dans notificationsStore

PHASE 2 — Unification permissions (roles.js aligné)
├── 2.1 Supprimer canValidateProgramme() de roles.js
├── 2.2 Supprimer canDeleteCRV() de roles.js
├── 2.3 Supprimer canDeleteProgramme() de roles.js
├── 2.4 Migrer les imports dans les vues qui utilisent roles.canXxx()
└── 2.5 Corriger PERMISSION_MATRIX selon doctrine validée (Phase 0)

PHASE 3 — Unification auth (migration progressive)
├── 3.1 Migrer authStore pour utiliser normalizeUserData()
├── 3.2 Migrer useAuth() pour déléguer à authStore (plus d'authService)
├── 3.3 Migrer router/index.js pour utiliser authStore
├── 3.4 Migrer App.vue pour utiliser authStore
├── 3.5 Migrer Login.vue (supprimer localStorage direct)
├── 3.6 Migrer ChangePassword.vue (supprimer localStorage direct)
└── 3.7 Supprimer authService.js

PHASE 4 — Stores nettoyage
├── 4.1 Supprimer avionsStore.js
├── 4.2 Supprimer slaStore.js
├── 4.3 Mettre à jour stores/index.js
├── 4.4 Supprimer legacy dans router getRedirectPathForRole()
└── 4.5 Supprimer authAPI.register dans api.js

PHASE 5 — Validation complète
├── 5.1 Tests manuels : 6 rôles × login/logout
├── 5.2 Tests manuels : changement mot de passe forcé
├── 5.3 Tests manuels : permissions par rôle
├── 5.4 Tests manuels : navigation par rôle
├── 5.5 Tests unitaires existants
└── 5.6 Review finale
```

### 8.2 Liste des commits recommandés

| # | Commit | Phase | Fichiers |
|---|--------|-------|----------|
| 1 | `refactor(roles): ajouter normalizeUserData()` | 1.1 | `roles.js` |
| 2 | `chore(permissions): supprimer console.log debug` | 1.2 | `permissions.js` |
| 3 | `chore(directives): supprimer v-can et v-readonly inutilisées` | 1.3 | `vCan.js`, `main.js` |
| 4 | `fix(notifications): ajouter finally dans actions async` | 1.4 | `notificationsStore.js` |
| 5 | `refactor(permissions): supprimer doublons canXxx() de roles.js` | 2.1-2.4 | `roles.js`, vues impactées |
| 6 | `refactor(permissions): aligner PERMISSION_MATRIX doctrine backend` | 2.5 | `permissions.js` |
| 7 | `refactor(auth): migrer authStore avec normalizeUserData()` | 3.1 | `authStore.js` |
| 8 | `refactor(auth): migrer useAuth() vers authStore` | 3.2 | `useAuth.js` |
| 9 | `refactor(router): migrer guards vers authStore` | 3.3 | `router/index.js` |
| 10 | `refactor(auth): migrer App.vue et vues vers authStore` | 3.4-3.6 | `App.vue`, `Login.vue`, `ChangePassword.vue` |
| 11 | `chore(auth): supprimer authService.js legacy` | 3.7 | `authService.js` |
| 12 | `chore(stores): supprimer avionsStore et slaStore inutilisés` | 4.1-4.3 | `avionsStore.js`, `slaStore.js`, `index.js` |
| 13 | `chore(router): supprimer legacy role mapping` | 4.4 | `router/index.js` |
| 14 | `chore(api): supprimer authAPI.register mort` | 4.5 | `api.js` |

### 8.3 Points de rollback

| Après commit | Point de rollback | Commande |
|-------------|-------------------|----------|
| Commit 4 | Fin Phase 1 — Safe rollback total | `git revert HEAD~4..HEAD` |
| Commit 6 | Fin Phase 2 — Permissions stabilisées | `git revert HEAD~2..HEAD` |
| Commit 11 | Fin Phase 3 — Auth unifiée | `git revert HEAD~5..HEAD` |
| Commit 14 | Fin Phase 4 — Nettoyage complet | `git revert HEAD~3..HEAD` |

---

## 9. CHECK-LIST DE VALIDATION

### 9.1 Tests manuels obligatoires

#### Authentification (par rôle)

- [ ] **AGENT_ESCALE** : Login → Redirect `/services` → Accès CRV → Logout
- [ ] **CHEF_EQUIPE** : Login → Redirect `/services` → Accès CRV → Logout
- [ ] **SUPERVISEUR** : Login → Redirect `/services` → Accès CRV + Validation → Logout
- [ ] **MANAGER** : Login → Redirect `/dashboard-manager` → Accès CRV + Validation + Suppression → Logout
- [ ] **QUALITE** : Login → Redirect `/services` → Lecture seule CRV → Pas de bouton créer → Logout
- [ ] **ADMIN** : Login → Redirect `/dashboard-admin` → Accès users → Pas d'accès `/crv` → Logout

#### Changement mot de passe

- [ ] Login avec `doitChangerMotDePasse=true` → Redirect forcé `/changer-mot-de-passe`
- [ ] Impossible d'accéder à d'autres routes tant que MDP non changé
- [ ] Après changement → Redirect vers dashboard approprié
- [ ] Flag `doitChangerMotDePasse` mis à jour

#### Session

- [ ] Token expiré (401) → Redirect `/login?expired=true`
- [ ] Compte désactivé (403) → Redirect `/login?disabled=true`
- [ ] Rafraîchir page → Session maintenue
- [ ] Ouvrir nouvel onglet → Session partagée via localStorage

#### Permissions CRV

- [ ] QUALITE ne voit aucun bouton d'action dans les CRV
- [ ] AGENT_ESCALE peut créer un CRV mais pas valider/rejeter
- [ ] SUPERVISEUR peut valider, rejeter, verrouiller un CRV
- [ ] MANAGER peut supprimer un CRV
- [ ] MANAGER peut supprimer un programme vol

#### Navigation

- [ ] ADMIN accédant à `/crv/*` → Redirecté vers `/dashboard-admin`
- [ ] Utilisateur non connecté sur `/services` → Redirecté vers `/login?expired=true`
- [ ] Utilisateur connecté sur `/login` → Redirecté vers dashboard approprié
- [ ] Route inexistante → Redirecté vers `/login`

### 9.2 Tests unitaires à vérifier

- [ ] `tests/unit/utils/permissions.test.js` — Tous les tests passent
- [ ] `tests/unit/config/roles.test.js` — Tous les tests passent (adapter après suppression canXxx)
- [ ] `tests/unit/stores/*.test.js` — Tous les tests passent
- [ ] `tests/unit/services/api.test.js` — Tous les tests passent

### 9.3 Vérifications statiques

- [ ] Aucun import de `authService` restant (`grep -r "authService" src/`)
- [ ] Aucun import de `avionsStore` restant
- [ ] Aucun import de `slaStore` restant
- [ ] Aucun import de `vCan` ou `v-can` restant
- [ ] Aucun `localStorage` direct dans les .vue (sauf `api.js`)
- [ ] `npm run build` sans erreur
- [ ] `npm run lint` sans erreur

---

## 10. ESTIMATION TEMPS

| Phase | Description | Durée estimée | Complexité |
|-------|-------------|---------------|------------|
| Phase 0 | Préparation & validation doctrine | Variable | Dépend de l'équipe |
| Phase 1 | Fondations (modifications isolées) | 2-3h | FAIBLE |
| Phase 2 | Unification permissions | 2-3h | MOYENNE |
| Phase 3 | Unification auth | 4-6h | ÉLEVÉE |
| Phase 4 | Stores nettoyage | 1-2h | FAIBLE |
| Phase 5 | Validation complète | 3-4h | MOYENNE |
| **TOTAL** | | **12-18h** | |

### Facteurs de risque sur l'estimation

- **Si doctrine ADMIN/CRV non clarifiée** : +2-4h de discussion et ajustements
- **Si tests unitaires cassent** : +2-3h de correction par suite de tests
- **Si régression fonctionnelle détectée** : +2-4h par régression

---

## ANNEXES

### A. Inventaire complet des imports authService

| Fichier | Ligne | Fonctions importées |
|---------|-------|---------------------|
| `src/App.vue` | L.27 | `getToken, getUserRole, getUserData, logoutUser` |
| `src/router/index.js` | L.27 | `getToken, getUserRole, doitChangerMotDePasse` |
| `src/composables/useAuth.js` | L.12-20 | `loginUser, logoutUser, changerMotDePasse, getToken, getUserRole, getUserData, doitChangerMotDePasse` |
| `src/directives/vCan.js` | L.16 | `getUserRole` |

### B. Inventaire complet des imports useAuthStore

| Fichier | Utilisation |
|---------|-------------|
| `src/stores/index.js` | Export centralisé |
| `src/views/Services.vue` | Rôle utilisateur |
| `src/views/CRVNouveau.vue` | Rôle pour permissions |
| `src/views/CRVArrivee.vue` | Rôle pour permissions |
| `src/views/CRVDepart.vue` | Rôle pour permissions |
| `src/views/CRVTurnAround.vue` | Rôle pour permissions |
| `src/views/CRVList.vue` | Rôle pour permissions |
| `src/views/Manager/ValidationCRV.vue` | Rôle pour validation |
| `src/views/Manager/ProgrammesVol.vue` | Rôle pour permissions |
| `src/views/Manager/AvionsGestion.vue` | Rôle pour permissions |
| `src/views/Manager/Statistiques.vue` | Rôle pour stats |
| `src/views/Admin/GestionUtilisateurs.vue` | Rôle admin |

### C. Inventaire complet des imports useAuth

| Fichier | Utilisation |
|---------|-------------|
| `src/composables/usePermissions.js` | Rôle pour permissions |
| `src/views/Login.vue` | Login action |
| `src/views/ChangePassword.vue` | Update password |
| `src/views/Services.vue` | Info utilisateur |
| `src/views/CRVNouveau.vue` | Permissions |
| `src/views/CRVArrivee.vue` | Permissions |
| `src/views/CRVDepart.vue` | Permissions |
| `src/views/CRVTurnAround.vue` | Permissions |
| `src/views/CRVList.vue` | Permissions |
| `src/views/Bulletins/BulletinsList.vue` | Permissions |
| `src/views/Bulletins/BulletinDetail.vue` | Permissions |
| `src/views/Manager/ValidationCRV.vue` | Permissions |
| `src/views/Manager/ProgrammesVol.vue` | Permissions |
| `src/views/Manager/AvionsGestion.vue` | Permissions |
| `src/views/Manager/Statistiques.vue` | Permissions |
| `src/views/Admin/GestionUtilisateurs.vue` | Permissions |
| `src/views/Common/Profil.vue` | Info utilisateur |

---

**FIN DU DOCUMENT**

*Document prêt pour exécution. Aucune modification de code effectuée.*
*Toutes les lignes et fichiers référencés sont vérifiés au 2026-03-03.*
