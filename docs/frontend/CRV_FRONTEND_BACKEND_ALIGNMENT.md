# CRV FRONTEND — ALIGNEMENT BACKEND CERTIFIÉ

> **Date** : 2026-03-09
> **Branche** : `mission/frontend-alignment`
> **Référence backend** : `CRV_API_CONTRACT.md` (88/88 tests PASS)
> **Règle** : Le frontend s'adapte au backend. Jamais l'inverse.

---

## 1. CORRECTIONS APPLIQUÉES

### 1.1 TYPE_EVENEMENT — CRITIQUE ✅ CORRIGÉ

**Avant** : 14 types frontend (RETARD_PASSAGERS, RETARD_BAGAGES, etc.)
**Après** : 8 types alignés sur `EvenementOperationnel.js` backend

```
PANNE_EQUIPEMENT, ABSENCE_PERSONNEL, RETARD,
INCIDENT_SECURITE, INCIDENT_TECHNIQUE, PROBLEME_TECHNIQUE,
METEO, AUTRE
```

**Fichier** : `src/config/crvEnums.js`
**Impact** : Le backend ne rejettera plus les événements avec 400 INVALID_TYPE

### 1.2 TYPE_ENGIN — CRITIQUE ✅ CORRIGÉ

**Avant** : 15 types MAJUSCULES (TRACTEUR_PUSHBACK, TAPIS_BAGAGES, etc.)
**Après** : 10 clés lowercase alignées sur `engin.controller.js` typeEnginMap

```
tracteur, chariot_bagages, chariot_fret, camion_fret,
passerelle, gpu, asu, camion_avitaillement, convoyeur, autre
```

**Fichier** : `src/config/crvEnums.js`
**Impact** : Le backend ne rejettera plus les engins avec 400 INVALID_TYPE_ENGIN

### 1.3 CRVEngins.vue — BUG ✅ CORRIGÉ

**Bug** : `USAGE_ENGIN.EN_SERVICE` référencé mais n'existe pas dans l'enum
**Fix** : Valeur par défaut `''` — sélection obligatoire par l'utilisateur

### 1.4 CRVValidation.vue — MOYENNE ✅ CORRIGÉ

**Avant** : 3 fonctions hardcodées (chef_escale, superviseur, responsable_ops)
**Après** : Utilise `ROLE_PERSONNEL` + `ROLE_PERSONNEL_LABELS` de crvEnums.js

### 1.5 Code mort — NETTOYÉ ✅

| Fichier | Lignes | Raison suppression |
|---------|--------|--------------------|
| `utils/constants.js` | 69 | Orphelin, statuts obsolètes |
| `config/ui.js` | 36 | Jamais importé |

---

## 2. ÉTAT DES ENUMS APRÈS ALIGNEMENT

| Enum | Frontend | Backend | Status |
|------|----------|---------|--------|
| STATUT_CRV | 6 valeurs | 6 valeurs | ✅ CONFORME |
| STATUT_PHASE | 5 valeurs | 5 valeurs | ✅ CONFORME |
| TYPE_EVENEMENT | 8 valeurs | 8 valeurs | ✅ ALIGNÉ |
| GRAVITE_EVENEMENT | 4 valeurs | 4 valeurs | ✅ CONFORME |
| TYPE_ENGIN | 10 clés lowercase | 10 clés typeEnginMap | ✅ ALIGNÉ |
| ROLE_PERSONNEL | 11 valeurs | 11 valeurs | ✅ CONFORME |
| TYPE_CHARGE | 3 valeurs | 3 valeurs | ✅ CONFORME |
| SENS_OPERATION | 2 valeurs | 2 valeurs | ✅ CONFORME |
| TYPE_FRET | 6 valeurs | 6 valeurs | ✅ CONFORME |
| CATEGORIE_OBSERVATION | 6 valeurs | 6 valeurs | ✅ CONFORME |
| TYPE_OPERATION | 3 valeurs | 3 valeurs | ✅ CONFORME |
| MOTIF_NON_REALISATION | 5 valeurs | 5 valeurs | ✅ CONFORME |

**Résultat : 12/12 enums alignés.**

---

## 3. SERVICE API — CENTRALISATION

Le service `src/services/api.js` est **déjà centralisé** :
- 16 groupes d'API (~150 routes)
- Aucun composant n'appelle axios directement
- Intercepteur JWT en place
- Gestion erreurs métier via errorHandler.js

### Routes auth — Confirmé compatible
| Frontend | Backend | Status |
|----------|---------|--------|
| POST `/auth/connexion` | Alias → `/auth/login` | ✅ Alias backend |
| POST `/auth/inscription` | Alias → `/auth/register` | ✅ Alias backend |
| POST `/auth/deconnexion` | Simple 200 response | ✅ OK |

---

## 4. FICHIERS MODIFIÉS

| Fichier | Action | Lignes |
|---------|--------|--------|
| `src/config/crvEnums.js` | MODIFIÉ (TYPE_EVENEMENT + TYPE_ENGIN) | -71 / +47 |
| `src/components/crv/CRVEngins.vue` | MODIFIÉ (commentaire + default) | -5 / +5 |
| `src/components/crv/CRVValidation.vue` | MODIFIÉ (fonctions enum) | -3 / +11 |
| `src/utils/constants.js` | SUPPRIMÉ | -69 |
| `src/config/ui.js` | SUPPRIMÉ | -36 |

**Total** : 5 fichiers, -184 / +63 lignes
**Build** : ✅ 184 modules, 0 erreurs

---

## 5. CE QUI RESTE À FAIRE (HORS SCOPE CETTE MISSION)

1. **apiWithMock.js + data/seed/crv.js** : Suppression reportée (mode mock potentiellement utile pour tests)
2. **CRVPhases.vue** : Ordre phases hardcodé (devrait lire backend)
3. **Console.log excessifs** : Nettoyage mécanique à planifier
4. **Tests automatisés frontend** : Vitest à installer
