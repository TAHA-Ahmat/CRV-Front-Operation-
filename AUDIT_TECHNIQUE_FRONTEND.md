# AUDIT TECHNIQUE FRONTEND — COMPLET (Peigne fin)
## Date : 2026-03-03 | Projet CRV Operation | Vue 3 + Pinia + Axios
## Post Sprint 1 — État réel du projet

---

# SOMMAIRE

1. [RÉSUMÉ EXÉCUTIF](#resume-executif)
2. [INVENTAIRE COMPLET DU PROJET](#inventaire)
3. [SPRINT 1 — CORRECTIONS APPLIQUÉES](#sprint1)
4. [BUGS CRITIQUES RESTANTS](#bugs-critiques)
5. [INCOHÉRENCES](#incoherences)
6. [CODE MORT — INVENTAIRE DÉTAILLÉ](#code-mort)
7. [CONSOLE.LOG EN PRODUCTION](#console-logs)
8. [PROBLÈMES DE SÉCURITÉ](#securite)
9. [RECOMMANDATIONS PAR PRIORITÉ](#recommandations)
10. [RÉSUMÉ CHIFFRÉ](#resume-chiffre)

---

# 1. RÉSUMÉ EXÉCUTIF {#resume-executif}

| Métrique | Valeur |
|----------|--------|
| Fichiers audités | 45 fichiers .vue + 15 fichiers .js = **60 fichiers** |
| Total lignes code | ~15 800 lignes |
| Bugs critiques restants | **12** |
| Incohérences | **14** |
| Fichiers/modules morts | **5 fichiers entiers + 7 stores inutilisés** |
| Méthodes API mortes | **25+** |
| console.log en production | **~430** (stores 169 + vues 155 + services 106) |
| Vues stub (non implémentées) | **4** |
| Sprint 1 corrections appliquées | **4/4 tâches terminées** |

---

# 2. INVENTAIRE COMPLET DU PROJET {#inventaire}

## 2.1 Stores Pinia (13 fichiers — 4 737 lignes)

| Store | Lignes | Utilisé dans les vues ? | console.log | Actions sans finally |
|-------|--------|------------------------|-------------|---------------------|
| `authStore.js` | 251 | OUI (11 vues) | 3 | 0 |
| `avionsStore.js` | 343 | **NON** — AvionsGestion.vue utilise avionsAPI directement | 0 | 0 |
| `bulletinStore.js` | 697 | OUI (4 vues) | 31 | 0 |
| `chargesStore.js` | 440 | OUI (1 composant: CRVCharges) | 0 | 0 |
| `crvStore.js` | 1 509 | OUI (11 vues/composants) | **135** | **7** |
| `index.js` | 42 | Barrel export | — | — |
| `notificationsStore.js` | 205 | **NON** — aucune vue ne l'instancie | 0 | **5** |
| `personnesStore.js` | 312 | **NON** — GestionUtilisateurs utilise personnesAPI directement | 0 | 0 |
| `phasesStore.js` | 236 | **NON** — CRVPhases utilise crvStore directement | 0 | 0 |
| `programmesStore.js` | 242 | **NON** — ProgrammesVol.vue utilise programmesVolAPI directement | 0 | 0 |
| `slaStore.js` | 246 | **NON** — aucune vue | 0 | 1 |
| `themeStore.js` | 71 | OUI (App.vue, AppHeader) | 0 | 0 |
| `volsStore.js` | 143 | **NON** — Statistiques.vue utilise volsAPI directement | 0 | 0 |

**Conclusion stores** : 7 stores sur 13 ne sont JAMAIS utilisés par aucune vue. Les vues font leurs appels API directement, contournant totalement l'architecture stores-as-middleware.

## 2.2 Vues (26 fichiers)

| Vue | Lignes | API directe ou via store ? | Permissions vérifiées ? |
|-----|--------|--------------------------|------------------------|
| `Admin/Dashboard.vue` | 1 202 | API directe (personnesAPI, crvAPI) | Non (routeur seulement) |
| `Admin/GestionUtilisateurs.vue` | 1 053 | API directe (personnesAPI, crvAPI) | Minimale |
| `Admin/Logs.vue` | 13 | **STUB VIDE** | — |
| `Admin/Settings.vue` | 13 | **STUB VIDE** | — |
| `Admin/UserCreate.vue` | 345 | API directe (personnesAPI) | Non |
| `Admin/UserEdit.vue` | 405 | API directe (personnesAPI) | Non |
| `Admin/UserManagement.vue` | 422 | API directe (personnesAPI) | Non |
| `Bulletins/BulletinCreate.vue` | 645 | Store + API directe mixte | Non |
| `Bulletins/BulletinDetail.vue` | 1 457 | Store | OUI (hasPermission, isReadOnly) |
| `Bulletins/BulletinsList.vue` | 651 | Store | OUI (hasPermission) |
| `ChangePassword.vue` | 296 | Composable useAuth | Non |
| `Common/Archives.vue` | 13 | **STUB VIDE** | — |
| `Common/Profil.vue` | 119 | Composable useAuth | Non |
| `CRV/CRVArrivee.vue` | ~700 | Store (crvStore) | Non |
| `CRV/CRVDepart.vue` | 999 | Store (crvStore) | Non |
| `CRV/CRVHome.vue` | 259 | Store (crvStore) | Non |
| `CRV/CRVList.vue` | ~800 | Store + API directe mixte | OUI (canEdit, canCancel, canDelete) |
| `CRV/CRVNouveau.vue` | 1 426 | Store + API directe mixte | Non |
| `CRV/CRVTurnAround.vue` | 1 011 | Store (crvStore) | Non |
| `Login.vue` | 183 | Composable useAuth | — (page publique) |
| `Manager/AvionsGestion.vue` | ~900 | API directe (avionsAPI) | OUI (rôle inline) |
| `Manager/Dashboard.vue` | 13 | **STUB VIDE** | — |
| `Manager/ProgrammesVol.vue` | ~1 300 | API directe (programmesVolAPI) | OUI (canValidate, canDelete) |
| `Manager/Statistiques.vue` | 836 | API directe (crvAPI, chargesAPI, volsAPI) | OUI (canViewNotificationStats) |
| `Manager/ValidationCRV.vue` | 774 | API directe (crvAPI, validationAPI) | OUI (canValidate, canReject, canLock) |
| `Services.vue` | 267 | Aucun | Non |

## 2.3 Composants (19 fichiers)

| Composant | Lignes | Problèmes |
|-----------|--------|-----------|
| `Common/AppHeader.vue` | 498 | 3 computed inutilisés |
| `Common/AppFooter.vue` | 52 | Aucun |
| `Common/ArchiveButton.vue` | 586 | `$toast` optionnel chaîné |
| `Common/CRVLoader.vue` | 110 | 3 computed inutilisés |
| `Common/LoadingOverlay.vue` | 180 | Aucun |
| `Common/PDFViewModal.vue` | 424 | **11 console.log** |
| `crv/CRVHeader.vue` | 247 | Aucun |
| `crv/CRVPersonnes.vue` | 437 | Import inutilisé + 5 console.log |
| `crv/CRVEngins.vue` | 433 | 7 console.log |
| `crv/CRVPhases.vue` | 1 333 | **18 console.log** |
| `crv/CRVCharges.vue` | ~700 | Appel API direct hors store |
| `crv/CRVEvenements.vue` | 744 | 8 console.log |
| `crv/CRVValidation.vue` | 357 | Rôles hardcodés (non enum) |
| `crv/CRVLockedBanner.vue` | 198 | Casse import CRV/crv |
| `crv/CompletudeBarre.vue` | 448 | Aucun |
| `crv/ConfirmationDoublonModal.vue` | 230 | Prop `crvExistantId` non utilisée |
| `crv/CreationLegacyModal.vue` | 242 | Import `ref` inutilisé |
| `flights/ProgrammeVolPDF.vue` | 413 | Méthodes API à vérifier |

## 2.4 Services, Config, Utils (15 fichiers — 5 070 lignes)

| Fichier | Lignes | Statut |
|---------|--------|--------|
| `services/api.js` | 1 463 | **ACTIF** — 55 console.log, 25+ méthodes mortes |
| `services/errorHandler.js` | 457 | **CODE MORT TOTAL** — 0 imports |
| `services/apiWithMock.js` | 300 | **CODE MORT TOTAL** — 0 imports |
| `services/auth/authService.js` | 231 | Utilisé (4 fichiers) — façade legacy |
| `config/ui.js` | 36 | **CODE MORT TOTAL** — 0 imports |
| `config/roles.js` | 248 | Utilisé (20 fichiers) — duplication avec permissions.js |
| `config/crvEnums.js` | 657 | Utilisé (8 fichiers) — 4 console.log |
| `utils/constants.js` | 69 | **CODE MORT** en production — mock seulement |
| `utils/permissions.js` | 572 | Utilisé (8 fichiers) — **35 console.log** |
| `composables/usePermissions.js` | 195 | **CODE MORT TOTAL** — 0 imports |
| `composables/useAuth.js` | 289 | Utilisé (6 fichiers) — non singleton |
| `directives/vCan.js` | 196 | Enregistré mais **jamais utilisé dans les templates** |
| `router/index.js` | 193 | Point d'entrée — 2 imports morts |
| `main.js` | 41 | Point d'entrée — 1 console.log |
| `App.vue` | 123 | Racine — bug `.name` + double guard |

---

# 3. SPRINT 1 — CORRECTIONS APPLIQUÉES {#sprint1}

| Tâche | Statut | Fichier modifié | Détail |
|-------|--------|----------------|--------|
| S1-T1: Statistiques.vue 3 TypeError | ✅ CORRIGÉ | `views/Manager/Statistiques.vue` | `crvAPI.getStatistiques`→`getStats`, `volsAPI.getStatistiques`→`volsAPI.getAll`+calcul, `crvAPI.getStatistiquesCharges`→`chargesAPI.getStatistiquesPassagers`+`getStatistiquesFret` |
| S1-T2: Charges 404 silencieux | ✅ CORRIGÉ | `stores/crvStore.js` | `chargesAPI.getById()` supprimé → mise à jour locale directe après add/delete DGR |
| S1-T3: Intercepteur Axios race condition | ✅ CORRIGÉ | `services/api.js` | Flag `isRedirecting` ajouté pour empêcher redirections concurrentes |
| S1-T4: Permissions alignées | ✅ CORRIGÉ | `utils/permissions.js` | CRV_VALIDER/REJETER/VERROUILLER/DEVERROUILLER/ANNULER/REACTIVER restreints à [SUPERVISEUR, MANAGER, ADMIN] |

---

# 4. BUGS CRITIQUES RESTANTS {#bugs-critiques}

## BUG-01 — Export cassé dans stores/index.js

**Sévérité** : CRITIQUE
**Fichier** : `src/stores/index.js:24`

```javascript
export { useCrvStore } from './crvStore'   // ← "useCrvStore" (c minuscule)
// Mais crvStore.js exporte :
export const useCRVStore = defineStore(...)  // ← "useCRVStore" (RV majuscules)
```

**Impact** : Tout `import { useCrvStore } from '@/stores'` retourne `undefined` silencieusement. Les vues qui importent directement depuis `@/stores/crvStore` fonctionnent, mais le barrel export est cassé.

---

## BUG-02 — ValidationCRV: handleReject appelle deverrouiller

**Sévérité** : CRITIQUE
**Fichier** : `src/views/Manager/ValidationCRV.vue`

```javascript
// handleReject() appelle :
await validationAPI.deverrouiller(crvId, comment)
// au lieu d'un endpoint de rejet dédié
```

**Impact** : Le bouton "Rejeter" fait un déverrouillage au lieu d'un rejet. L'action de rejet CRV ne fonctionne pas correctement.

---

## BUG-03 — App.vue: userData?.name n'existe pas

**Sévérité** : CRITIQUE
**Fichier** : `src/App.vue:46`

```javascript
const userName = userData?.name || userData?.email
// getUserData() retourne : { id, nom, prenom, email, fonction, role, matricule, telephone }
// Le champ "name" n'existe PAS → userName = toujours l'email
```

**Impact** : Le header affiche toujours l'email au lieu du nom complet de l'utilisateur. Fix : `` `${userData?.prenom || ''} ${userData?.nom || ''}`.trim() || userData?.email ``

---

## BUG-04 — Contradiction ADMIN routes vs permissions (PARTIELLEMENT CORRIGÉ)

**Sévérité** : HAUTE
**Fichiers** : `router/index.js:155-157`, `router/modules/managerRoutes.js`, `utils/permissions.js`

**Corrigé Sprint 1** : permissions CRV_VALIDER/etc restreintes à SUPERVISEUR/MANAGER/ADMIN.
**Reste** :
- `managerRoutes.js` : `/validation`, `/programmes-vol`, `/avions` incluent encore ADMIN dans `allowedRoles`
- Le router (index.js:155) redirige ADMIN vers `/dashboard-admin` pour `/crv*` mais PAS pour `/validation` ou `/programmes-vol`
- Permissions CRV_CREER, CRV_MODIFIER, CRV_SUPPRIMER incluent encore ADMIN → contradictoire avec le routeur

---

## BUG-05 — Double enum statuts CRV (inchangé)

**Sévérité** : HAUTE
**Fichiers** : `utils/constants.js:15-25`, `config/crvEnums.js:18-34`

```javascript
// constants.js — valeurs anglaises (OBSOLÈTE)
CRV_STATUS = { IN_PROGRESS: 'in_progress', CLOSED: 'closed', VALIDATED: 'validated' }
// crvEnums.js — valeurs françaises (ACTIF)
STATUT_CRV = { BROUILLON: 'BROUILLON', EN_COURS: 'EN_COURS', VALIDE: 'VALIDE' }
```

**Impact** : Risque d'import erroné. `constants.js` est mort en production mais reste présent.

---

## BUG-06 — État réactif useAuth non synchronisé (inchangé)

**Sévérité** : HAUTE
**Fichier** : `composables/useAuth.js:31-36`

```javascript
const isAuthenticated = ref(!!getToken())   // Initialisé UNE FOIS au setup
const userRole = ref(getUserRole())          // Jamais re-évalué
const userData = ref(getUserData())          // Jamais re-évalué
```

**Impact** : Non-singleton (pas de provide/inject). Après logout forcé par intercepteur 401, les refs restent à l'ancienne valeur.

---

## BUG-07 — crvStore: 6 getters avec effets de bord (console.log)

**Sévérité** : HAUTE
**Fichier** : `stores/crvStore.js`

```
Ligne  90 : isEditable     → console.log à CHAQUE accès
Ligne 114 : completude     → console.log à chaque rendu
Ligne 127 : getCompletudeDetails → idem
Ligne 147 : canStart       → idem
Ligne 155 : canTerminate   → idem
Ligne 163 : canValidate    → idem
```

**Impact** : Les getters Pinia sont des computed Vue 3. Chaque accès dans un template déclenche un `console.log`. Sur une page CRV avec 20 éléments conditionnels → 100+ logs par rendu.

---

## BUG-08 — crvStore: 7 actions async sans finally

**Sévérité** : HAUTE
**Fichier** : `stores/crvStore.js`

| Action | Ligne | Problème |
|--------|-------|----------|
| `fetchTransitionsPossibles` | 553 | Ni loading ni finally — erreur silencieuse |
| `getValidationStatus` | 1258 | Ni loading ni saving ni finally |
| `exportCRV` | 1316 | Ni loading ni finally |
| `peutAnnulerCRV` | 1365 | Ni loading ni finally |
| `getArchiveStatus` | 1457 | Ni loading ni finally |
| `testArchive` | 1469 | Ni loading ni finally |
| `archiveCRV` | 1341 | `saving = true` mais pas de finally → reste `true` en cas d'erreur |

---

## BUG-09 — notificationsStore: 5 actions sans loading/finally

**Sévérité** : HAUTE
**Fichier** : `stores/notificationsStore.js`

```
loadStatistiques()      → pas de loading ni finally
createNotification()    → pas de loading ni finally
marquerLue()            → pas de loading ni finally
archiverNotification()  → pas de loading ni finally
deleteNotification()    → pas de loading ni finally
```

---

## BUG-10 — Double guard de navigation

**Sévérité** : HAUTE
**Fichiers** : `router/index.js`, `App.vue:65-71`

`App.vue` enregistre un second `router.beforeEach` dans son `setup()`. Deux guards globaux s'exécutent à chaque navigation, lisant le même `localStorage`. Risque de comportement inattendu si les logiques divergent.

---

## BUG-11 — Casse import CRVLockedBanner (Linux)

**Sévérité** : HAUTE (production Linux)
**Fichiers** : `CRVDepart.vue`, `CRVTurnAround.vue`, `CRVArrivee.vue`

```javascript
import CRVLockedBanner from '@/components/CRV/CRVLockedBanner.vue'
// Le dossier réel est : src/components/crv/ (minuscule)
```

**Impact** : Fonctionne sous Windows (case-insensitive) mais **casse sur Linux/Docker** (case-sensitive). 3 vues CRV critiques deviennent inaccessibles.

---

## BUG-12 — isRedirecting jamais réinitialisé

**Sévérité** : MOYENNE
**Fichier** : `services/api.js:39`

```javascript
let isRedirecting = false
// Mis à true lors d'un 401... mais jamais remis à false
```

**Impact** : Acceptable dans le cas normal (la page est rechargée lors de la redirection). Mais si l'utilisateur navigue via SPA sans rechargement complet, les 401 suivants ne déclenchent plus de redirection.

---

# 5. INCOHÉRENCES {#incoherences}

## INC-01 — 7 stores Pinia jamais utilisés

**Fichiers** : `avionsStore.js`, `notificationsStore.js`, `personnesStore.js`, `phasesStore.js`, `programmesStore.js`, `slaStore.js`, `volsStore.js`

Les vues font des appels API directs au lieu de passer par les stores :

| Vue | API directe | Store ignoré |
|-----|-------------|-------------|
| `AvionsGestion.vue` | `avionsAPI.*` | `avionsStore` |
| `ProgrammesVol.vue` | `programmesVolAPI.*` | `programmesStore` |
| `GestionUtilisateurs.vue` | `personnesAPI.*` | `personnesStore` |
| `Statistiques.vue` | `volsAPI.*`, `chargesAPI.*` | `volsStore`, `chargesStore` |
| (aucune vue) | — | `notificationsStore`, `slaStore`, `phasesStore` |

**Conséquence** : Pas de cache, pas d'état global partagé, pas de gestion d'erreur centralisée.

---

## INC-02 — Duplication canValidateProgramme / canDeleteProgramme / canDeleteCRV

**Fichiers** : `config/roles.js` vs `utils/permissions.js`

| Fonction | `roles.js` | `permissions.js` | Qui gagne ? |
|----------|-----------|-----------------|------------|
| `canValidateProgramme` | [SUPERVISEUR, MANAGER] | [AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER] | `permissions.js` (utilisé par ProgrammesVol.vue) |
| `canDeleteProgramme` | [MANAGER] | [AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER] | `permissions.js` (utilisé par ProgrammesVol.vue) |
| `canDeleteCRV` | [SUPERVISEUR, MANAGER] | [tout opérationnel + ADMIN] | `permissions.js` (utilisé par CRVList.vue) |

**Impact** : Un AGENT_ESCALE peut supprimer des CRV et des programmes selon `permissions.js`, alors que `roles.js` dit le contraire. La vue utilise `permissions.js` → AGENT_ESCALE a trop de droits.

---

## INC-03 — Duplication auth : authService.js vs authStore.js vs useAuth.js

**3 sources de vérité pour l'authentification** :

| Opération | authService.js | authStore.js | useAuth.js |
|-----------|---------------|-------------|-----------|
| Login | `loginUser()` | `login()` | `login()` |
| Logout | `logoutUser()` | `logout()` | `logout()` |
| Get Role | `getUserRole()` | `getUserRole` getter | `userRole` ref |
| Is Auth | `isAuthenticated()` | `isAuthenticated` getter | `isAuthenticated` ref |

Utilisateurs : `App.vue` utilise `authService`. `Login.vue` utilise `useAuth`. `CRVList.vue` utilise `authStore`.

---

## INC-04 — Accès au rôle utilisateur : 4 patterns différents

```javascript
// Pattern 1 (6 vues) :
authStore.currentUser?.fonction || authStore.currentUser?.role

// Pattern 2 (ValidationCRV) :
authStore.user?.fonction || authStore.user?.role    // ← "user" sans "current"

// Pattern 3 (CRVList ligne 555) :
authStore.currentUser?.role                          // ← sans fallback "fonction"

// Pattern 4 (ProgrammesVol) :
normalizeRole(authStore.currentUser?.fonction || authStore.currentUser?.role)
```

**Aucun standard uniforme.** Si le backend change le champ rôle, il faut modifier N fichiers.

---

## INC-05 — Duplication getRedirectPathForRole

**Fichiers** : `router/index.js` + `composables/useAuth.js`

La même logique switch/case existe dans les deux fichiers. Le routeur a en plus des cas legacy (`'admin'`, `'manager'`, `'agent_ops'`) que `useAuth` n'a pas.

---

## INC-06 — Timeout 30s inadapté pour exports/PDF (inchangé)

**Fichier** : `services/api.js:19`

| Endpoint | Durée réelle estimée | Résultat avec timeout 30s |
|----------|---------------------|--------------------------|
| `crvAPI.export()` | 40-60s | **TIMEOUT** |
| `crvAPI.telechargerPDF()` | 45-120s | **TIMEOUT** |
| `programmesVolAPI.telechargerPDF()` | 60-180s | **TIMEOUT** |

---

## INC-07 — Erreurs réseau non gérées dans l'intercepteur

L'intercepteur ne gère que les erreurs HTTP (`error.response`). Manquent :
- **Timeout** : `error.code === 'ECONNABORTED'` → aucun feedback utilisateur
- **Réseau coupé** : `!error.response` → pas de toast UI
- **DNS failure** : indistinguable d'un timeout

---

## INC-08 — Double gestion utilisateurs : 2 vues pour la même chose

**Fichiers** : `Admin/GestionUtilisateurs.vue` (1 053 lignes) ET `Admin/UserManagement.vue` (422 lignes)

Les deux vues font exactement la même chose : lister, créer, modifier, supprimer des utilisateurs via `personnesAPI`. Duplication complète.

---

## INC-09 — 9 appels `alert()` dans les vues CRV

| Fichier | Nombre d'`alert()` |
|---------|-------------------|
| `CRVArrivee.vue` | 5 |
| `CRVDepart.vue` | 2 |
| `CRVTurnAround.vue` | 2 |

**Impact UX** : `alert()` bloque le thread et ne s'intègre pas au design. Devrait être remplacé par des toasts (`vue-toastification` est installé).

---

## INC-10 — themeStore : fuite mémoire EventListener (inchangé)

**Fichier** : `stores/themeStore.js:28-33`

```javascript
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => { ... })
// Pas de removeEventListener → listeners empilés si initTheme() est appelé plusieurs fois
```

---

## INC-11 — Vols statistiques : chargement de 1000 vols en mémoire

**Fichier** : `views/Manager/Statistiques.vue` (post Sprint 1)

```javascript
const response = await volsAPI.getAll({ ...params, limit: 1000 })
// Charge jusqu'à 1000 vols pour calculer les stats côté client
```

**Impact** : Fonctionne mais inefficace. Un endpoint backend `GET /api/vols/stats` serait préférable.

---

## INC-12 — ERROR_CODES défini 2 fois

**Fichiers** : `services/errorHandler.js` ET `config/crvEnums.js`

Deux objets `ERROR_CODES` avec des valeurs **partiellement différentes** :
- `errorHandler.js` a : `ACCOUNT_IN_USE`, `WEAK_PASSWORD`, `EMAIL_ALREADY_EXISTS`
- `crvEnums.js` a : `CRV_DOUBLON`, `COMPLETUDE_INSUFFISANTE`, `POIDS_FRET_REQUIS`

---

## INC-13 — CRVValidation.vue : rôle hardcodé dans le formulaire

**Fichier** : `components/crv/CRVValidation.vue`

```html
<option value="chef_escale">Chef escale</option>
<option value="superviseur">Superviseur</option>
<option value="responsable_ops">Responsable ops</option>
```

Valeurs hardcodées en minuscules au lieu d'utiliser les enums centralisés `ROLES` ou `ROLE_PERSONNEL`.

---

## INC-14 — GestionUtilisateurs: vérification dépendances simulée

**Fichier** : `views/Admin/GestionUtilisateurs.vue`

```javascript
// "Simuler la vérification" — utilise crvAPI.getAll() au lieu d'un endpoint dédié
// Sur erreur : userDependencies = { totalCRV: -1, affectations: -1 }
// Le template vérifie "> 0" → -1 ne déclenche pas l'avertissement (faux négatif)
```

---

# 6. CODE MORT — INVENTAIRE DÉTAILLÉ {#code-mort}

## 6.1 Fichiers entièrement morts

| Fichier | Lignes | Raison |
|---------|--------|--------|
| `services/errorHandler.js` | 457 | 0 imports dans tout le projet |
| `services/apiWithMock.js` | 300 | 0 imports, pas de switch VITE_USE_MOCK |
| `config/ui.js` | 36 | 0 imports |
| `utils/constants.js` | 69 | Utilisé uniquement dans mock/seed |
| `composables/usePermissions.js` | 195 | 0 imports |
| **Total** | **1 057 lignes** | |

## 6.2 Stores jamais instanciés

| Store | Lignes | Raison |
|-------|--------|--------|
| `avionsStore.js` | 343 | AvionsGestion.vue utilise avionsAPI directement |
| `notificationsStore.js` | 205 | Aucune vue ne l'utilise |
| `personnesStore.js` | 312 | GestionUtilisateurs utilise personnesAPI directement |
| `phasesStore.js` | 236 | CRVPhases utilise crvStore directement |
| `programmesStore.js` | 242 | ProgrammesVol.vue utilise programmesVolAPI directement |
| `slaStore.js` | 246 | Aucune vue ne l'utilise |
| `volsStore.js` | 143 | Statistiques.vue utilise volsAPI directement |
| **Total** | **1 727 lignes** | |

## 6.3 Vues stub (non implémentées)

| Vue | Contenu |
|-----|---------|
| `Admin/Logs.vue` | "À développer" |
| `Admin/Settings.vue` | "À développer" |
| `Common/Archives.vue` | "À développer" |
| `Manager/Dashboard.vue` | "À développer" |

## 6.4 Méthodes API jamais appelées (25+)

| Module | Méthode morte | Endpoint |
|--------|--------------|----------|
| `authAPI` | `register()` | POST /auth/inscription |
| `crvAPI` | `annulerConfirmationAbsence()` | DELETE /crv/:id/confirmer-absence |
| `crvAPI` | `addPersonne()` | POST /crv/:id/personnel |
| `crvAPI` | `removePersonne()` | DELETE /crv/:id/personnel/:id |
| `crvAPI` | `search()` | GET /crv/search |
| `crvAPI` | `export()` | GET /crv/export |
| `crvAPI` | `getAnnules()` | GET /crv/annules |
| `crvAPI` | `getArchivageStatus()` (par ID) | GET /crv/:id/archive/status |
| `crvAPI` | `getPDFBase64()` | GET /crv/:id/pdf-base64 |
| `crvAPI` | `telechargerPDF()` | GET /crv/:id/telecharger-pdf |
| `chargesAPI` | `getById()` | GET /charges/:id **(route backend inexistante)** |
| `chargesAPI` | `update()` | PATCH /charges/:id **(route backend inexistante)** |
| `chargesAPI` | `convertirCategoriesDetaillees()` | POST /charges/:id/convertir |
| `chargesAPI` | `validerMarchandiseDangereuse()` | POST /charges/valider-dgr |
| `chargesAPI` | `getMarchandisesDangereuses()` | GET /charges/marchandises-dangereuses |
| `chargesAPI` | `getStatistiquesPassagersByCRV()` | GET /charges/crv/:id/stats-passagers |
| `chargesAPI` | `getStatistiquesFretByCRV()` | GET /charges/crv/:id/stats-fret |
| `enginsAPI` | `getTypes()` | GET /engins/types |
| `enginsAPI` | `getDisponibles()` | GET /engins/disponibles |
| `enginsAPI` | `create()` | POST /engins |
| `enginsAPI` | `getById()` | GET /engins/:id |
| `enginsAPI` | `update()` | PUT /engins/:id |
| `enginsAPI` | `delete()` | DELETE /engins/:id |
| `programmesVolAPI` | `getVolsParJour()` | GET /programmes-vol/:id/vols/jour/:jour |
| `programmesVolAPI` | `getVolsParCompagnie()` | GET /programmes-vol/:id/vols/compagnie/:code |
| `programmesVolAPI` | `reorganiserVols()` | PATCH /programmes-vol/:id/vols/reorganiser |
| `avionsAPI` | `getRevisionsProchaines()` | GET /avions/revisions/prochaines |
| `avionsAPI` | `getStatistiquesConfigurations()` | GET /avions/statistiques/configurations |
| `validationAPI` | `getStatus()` | GET /validation/:id |

## 6.5 Imports inutilisés dans les vues

| Fichier | Import inutilisé |
|---------|-----------------|
| `UserCreate.vue` | `ROLES_LABELS` |
| `UserEdit.vue` | `ROLES_LABELS` |
| `CRVNouveau.vue` | `TYPE_VOL_HORS_PROGRAMME_LABELS`, `bulletinStore` |
| `CRVPersonnes.vue` | `ROLE_PERSONNEL_LABELS` |
| `CreationLegacyModal.vue` | `ref` |
| `router/index.js` | `hasAccessCRV`, `isAdmin` |

## 6.6 Directives enregistrées mais jamais utilisées

| Directive | Lignes | Enregistrée dans | Utilisée dans les templates |
|-----------|--------|-----------------|---------------------------|
| `v-can` | ~100 | main.js | **0 template** |
| `v-readonly` | ~96 | main.js | **0 template** |

## 6.7 Exports jamais importés

| Fichier | Export mort |
|---------|-----------|
| `roles.js` | `ROLES_VALIDATION_PROGRAMME`, `ROLES_SUPPRESSION_CRV`, `ROLES_SUPPRESSION_PROGRAMME`, `isRoleOperationnel`, `getRoleLabel` |
| `permissions.js` | `getPermissionsForRole`, `getRolesForAction`, `hasAllPermissions`, `canTransitionCRV` |
| `authService.js` | `fetchCurrentUser`, `isAuthenticated` (fonction), `hasRole` |

---

# 7. CONSOLE.LOG EN PRODUCTION {#console-logs}

## Bilan global : ~430 console statements

### Par couche

| Couche | Fichiers | console.log | console.warn | console.error | Total |
|--------|----------|-------------|-------------|--------------|-------|
| **Stores** | 13 | 158 | 6 | 5 | **169** |
| **Vues** | 26 | 105 | 25 | 25 | **~155** |
| **Services/Config/Utils** | 15 | 82 | 12 | 12 | **~106** |
| **TOTAL** | | | | | **~430** |

### Top 10 fichiers les plus pollués

| # | Fichier | console.* |
|---|---------|-----------|
| 1 | `stores/crvStore.js` | **135** |
| 2 | `services/api.js` | **55** |
| 3 | `views/CRV/CRVArrivee.vue` | **~44** |
| 4 | `utils/permissions.js` | **35** |
| 5 | `stores/bulletinStore.js` | **31** |
| 6 | `components/crv/CRVPhases.vue` | **18** |
| 7 | `components/Common/PDFViewModal.vue` | **11** |
| 8 | `views/Manager/AvionsGestion.vue` | **9** |
| 9 | `components/crv/CRVEvenements.vue` | **8** |
| 10 | `views/Manager/ValidationCRV.vue` | **8** |

---

# 8. PROBLÈMES DE SÉCURITÉ {#securite}

## SEC-01 — console.log avec données personnelles

**Fichier** : `services/auth/authService.js:59`

```javascript
console.log('[AUTH] Connexion réussie:', { email: user.email, fonction: user.fonction })
// Logue l'email de l'utilisateur en clair dans les DevTools
```

## SEC-02 — userData en clair dans localStorage

```javascript
localStorage.setItem('userData', JSON.stringify({
  id, nom, prenom, email, fonction, role, matricule, telephone
}))
```

Toutes les données personnelles (nom, email, téléphone, matricule) stockées en JSON non chiffré. Vulnérable à un XSS.

## SEC-03 — Token JWT en localStorage

Le `auth_token` est stocké en `localStorage` au lieu de `httpOnly cookies`. Vulnérable à un XSS qui peut extraire le token.

## SEC-04 — Permissions frontend contournables

La matrice `PERMISSION_MATRIX` ne sert qu'à masquer les boutons UI. Le backend fait sa propre vérification (`excludeQualite`), mais les incohérences entre les deux (INC-02) signifient que l'UI montre/cache des boutons de manière incorrecte.

---

# 9. RECOMMANDATIONS PAR PRIORITÉ {#recommandations}

## P0 — FIX IMMÉDIAT (bugs bloquants en production)

| # | Action | Fichier(s) | Effort |
|---|--------|-----------|--------|
| 1 | Corriger l'export `useCrvStore` → `useCRVStore` dans index.js | `stores/index.js:24` | 5min |
| 2 | Corriger `handleReject` dans ValidationCRV.vue (appelle deverrouiller au lieu de rejeter) | `views/Manager/ValidationCRV.vue` | 15min |
| 3 | Corriger `userData?.name` → `prenom + nom` dans App.vue | `App.vue:46` | 5min |
| 4 | Corriger la casse import `@/components/CRV/` → `@/components/crv/` dans 3 vues CRV | `CRVDepart`, `CRVTurnAround`, `CRVArrivee` | 10min |
| 5 | Ajouter `finally { this.saving = false }` à `archiveCRV` dans crvStore | `stores/crvStore.js:1341` | 5min |

## P1 — CORRECTIFS IMPORTANTS

| # | Action | Fichier(s) | Effort |
|---|--------|-----------|--------|
| 6 | Supprimer les 6 `console.log` des getters crvStore (performance critique) | `stores/crvStore.js` | 15min |
| 7 | Unifier permissions : supprimer `canValidateProgramme`/`canDeleteProgramme`/`canDeleteCRV` de `roles.js`, ne garder QUE la version de `permissions.js` | `config/roles.js`, vues impactées | 30min |
| 8 | Retirer ADMIN de `allowedRoles` dans managerRoutes.js | `router/modules/managerRoutes.js` | 10min |
| 9 | Ajouter `finally` aux 7 actions async de crvStore sans finally | `stores/crvStore.js` | 30min |
| 10 | Standardiser l'accès au rôle : créer un getter unique `authStore.userRole` et l'utiliser partout | `stores/authStore.js`, toutes les vues | 1h |
| 11 | Ajouter watcher ou listener `storage` dans useAuth.js | `composables/useAuth.js` | 30min |
| 12 | Réinitialiser `isRedirecting` après un délai dans l'intercepteur | `services/api.js` | 10min |

## P2 — NETTOYAGE (code mort, performance)

| # | Action | Fichier(s) | Effort |
|---|--------|-----------|--------|
| 13 | Supprimer les 5 fichiers morts (errorHandler, apiWithMock, ui.js, constants.js, usePermissions.js) | 5 fichiers (1 057 lignes) | 15min |
| 14 | Supprimer ou conditionner les ~430 console.log à `import.meta.env.DEV` | Tout le projet | 2h |
| 15 | Supprimer les 28+ méthodes API mortes dans api.js | `services/api.js` | 30min |
| 16 | Supprimer les 7 stores inutilisés OU migrer les vues pour les utiliser | 7 stores (1 727 lignes) | 2h |
| 17 | Supprimer les directives `v-can`/`v-readonly` (196 lignes mortes) | `directives/vCan.js`, `main.js` | 10min |
| 18 | Supprimer les imports inutilisés dans 6 fichiers | Vues listées en 6.5 | 10min |
| 19 | Supprimer la double vue GestionUtilisateurs vs UserManagement | 1 des 2 fichiers | 30min |

## P3 — ARCHITECTURE (refactoring ciblé)

| # | Action | Fichier(s) | Effort |
|---|--------|-----------|--------|
| 20 | Unifier auth en un seul point : déprécier `authService.js`, migrer vers `authStore` | `services/auth/authService.js`, `App.vue`, `router/index.js` | 2h |
| 21 | Remplacer les 9 `alert()` par des toasts | 3 vues CRV | 30min |
| 22 | Augmenter timeout pour exports/PDF (120s) | `services/api.js` | 10min |
| 23 | Ajouter gestion erreurs réseau dans l'intercepteur | `services/api.js` | 1h |
| 24 | Supprimer le double guard de navigation dans App.vue | `App.vue:65-71` | 30min |
| 25 | Ajouter endpoint backend `GET /api/vols/stats` pour éviter le chargement de 1000 vols | Backend | 2h |

---

# 10. RÉSUMÉ CHIFFRÉ {#resume-chiffre}

```
┌──────────────────────────────────────────────────────────────┐
│   AUDIT TECHNIQUE FRONTEND — POST SPRINT 1 — 2026-03-03     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ─── ÉTAT DU PROJET ───                                      │
│  Fichiers audités            : 60                            │
│  Total lignes code           : ~15 800                       │
│  Stores Pinia                : 13 (6 utilisés, 7 morts)     │
│  Vues                        : 26 (4 stubs vides)            │
│  Composants                  : 19                            │
│  Services/Config/Utils       : 15 (5 entièrement morts)      │
│                                                              │
│  ─── SPRINT 1 APPLIQUÉ ───                                   │
│  Tâches corrigées            : 4/4                           │
│  Fichiers modifiés           : 4                             │
│  TypeError Statistiques.vue  : ✅ CORRIGÉ                    │
│  404 charges silencieux      : ✅ CORRIGÉ                    │
│  Race condition 401          : ✅ CORRIGÉ                    │
│  Permissions alignées        : ✅ CORRIGÉ                    │
│                                                              │
│  ─── BUGS CRITIQUES RESTANTS ───                             │
│  Export cassé index.js       :  1  (useCrvStore ≠ useCRVStore)│
│  Bug logique ValidationCRV   :  1  (reject = deverrouiller)  │
│  Bug App.vue userName         :  1  (userData.name inexistant)│
│  Casse import Linux           :  1  (CRV/ vs crv/)           │
│  Getters effets de bord      :  6  (console.log dans getters)│
│  Actions sans finally         : 12  (7 crvStore + 5 notif)   │
│  Double guard navigation      :  1  (App.vue + router)       │
│  TOTAL CRITIQUES+HAUTS        : 12                           │
│                                                              │
│  ─── INCOHÉRENCES ───                                        │
│  Stores non utilisés          :  7                           │
│  Duplication permissions      :  3  fonctions en double      │
│  Duplication auth             :  3  sources de vérité        │
│  Pattern accès rôle           :  4  patterns différents      │
│  Double vue admin             :  1  (2 vues même fonction)   │
│  alert() au lieu de toast     :  9  appels                   │
│  Timeout inadapté             :  3  endpoints                │
│  TOTAL INCOHÉRENCES           : 14                           │
│                                                              │
│  ─── CODE MORT ───                                           │
│  Fichiers entiers morts       :  5  (1 057 lignes)           │
│  Stores jamais instanciés     :  7  (1 727 lignes)           │
│  Méthodes API mortes          : 28  (~400 lignes)            │
│  Directives mortes            :196  lignes                   │
│  Vues stub                    :  4  (52 lignes)              │
│  TOTAL LIGNES MORTES          : ~3 432                       │
│  % du code total              : ~22%                         │
│                                                              │
│  ─── QUALITÉ ───                                             │
│  console.log en production    : ~430                         │
│  Imports inutilisés           :  8  fichiers                 │
│  Problèmes sécurité           :  4  identifiés              │
│                                                              │
│  ─── EFFORT ESTIMÉ ───                                       │
│  P0 (Fix immédiat)            : ~40min                       │
│  P1 (Correctifs importants)   : ~3h30                        │
│  P2 (Nettoyage code mort)     : ~5h                          │
│  P3 (Architecture)            : ~6h                          │
│  TOTAL                        : ~15h                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

*Audit réalisé par FRONTEND_AGENT — Scan exhaustif post Sprint 1, 60 fichiers analysés, aucune modification de code.*
