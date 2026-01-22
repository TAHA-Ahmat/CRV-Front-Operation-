# RECONCILIATION API FRONTEND-BACKEND

**Date**: 2026-01-09
**Couverture actuelle**: 88%

---

## RESUME EXECUTIF

Le frontend est prêt pour 88% des routes. Les 12% restants nécessitent des ajouts côté backend.

---

## 1. ACTIONS BACKEND REQUISES

### Permission Validation CRV - CLARIFICATION

**Décision**: Tous les profils peuvent valider un CRV (sauf QUALITE qui est en lecture seule).

| Rôle | Peut valider |
|------|--------------|
| AGENT_ESCALE | OUI |
| CHEF_EQUIPE | OUI |
| SUPERVISEUR | OUI |
| MANAGER | OUI |
| QUALITE | NON (lecture seule) |

Le backend actuel avec `excludeQualite` est **CORRECT**.

---

### CRITIQUE - Fonctionnalités bloquées

#### 1. Changement de mot de passe
**Route manquante**: `POST /api/auth/changer-mot-de-passe`

**Body attendu**:
```json
{
  "ancienMotDePasse": "string",
  "nouveauMotDePasse": "string"
}
```

**Réponse attendue**:
```json
{
  "message": "Mot de passe modifié avec succès"
}
```

---

#### 2. Routes Phases (lecture)
**Routes manquantes**:
- `GET /api/phases/:id`
- `GET /api/phases?crvId=xxx`

**Note**: Le frontend peut contourner via `GET /api/crv/:id` qui retourne les phases, mais c'est sous-optimal.

**Implémentation suggérée**:
```javascript
// GET /api/phases/:id
router.get('/:id', protect, async (req, res) => {
  const phase = await Phase.findById(req.params.id)
  res.json({ phase })
})

// GET /api/phases
router.get('/', protect, async (req, res) => {
  const { crvId } = req.query
  const phases = await Phase.find({ crv: crvId })
  res.json({ phases })
})
```

---

#### 3. Routes Avions CRUD
**Routes manquantes**:
- `GET /api/avions` - Lister
- `GET /api/avions/:id` - Obtenir
- `POST /api/avions` - Créer

**Body création attendu**:
```json
{
  "immatriculation": "string",
  "typeAvion": "string",
  "compagnie": "string?",
  "configuration": "object?"
}
```

---

### HAUTE PRIORITE

#### 4. Suppression CRV
**Route manquante**: `DELETE /api/crv/:id`

**Règles**:
- Rôles autorisés: SUPERVISEUR, MANAGER
- CRV verrouillé: refuser avec code `CRV_VERROUILLE`

---

#### 5. Routes Charges (lecture/modification)
**Routes manquantes**:
- `GET /api/charges/:id`
- `PATCH /api/charges/:id`

**Contournement frontend actuel**: Recharger tout le CRV via `GET /api/crv/:id` après modification.

---

#### 6. Suppression Vol
**Route manquante**: `DELETE /api/vols/:id`

---

## 2. ADAPTATIONS FRONTEND

### Routes à NE PAS utiliser (en attendant backend)

| Route | Fichier Frontend | Contournement |
|-------|------------------|---------------|
| `GET /api/phases/:id` | `phasesAPI.getById()` | Utiliser les phases depuis `crvStore.phases` |
| `GET /api/phases?crvId` | `phasesAPI.getByCRV()` | Utiliser `crvAPI.getById()` puis extraire `.phases` |
| `GET /api/charges/:id` | `chargesAPI.getById()` | Utiliser les charges depuis `crvStore.charges` |
| `GET /api/avions` | `avionsAPI.getAll()` | Désactiver la fonctionnalité temporairement |
| `DELETE /api/crv/:id` | `crvAPI.delete()` | Masquer le bouton suppression |

### Routes qui fonctionnent correctement

| Service | Routes OK | Couverture |
|---------|-----------|------------|
| Auth | connexion, me, deconnexion | 80% |
| CRV | create, getAll, getById, update, workflow complet | 96% |
| Phases | demarrer, terminer, non-realise, update, updateManuel | 71% |
| Charges | categories-detaillees, classes, fret-detaille, DGR | 88% |
| Validation | valider, verrouiller, deverrouiller, getStatus | 100% |
| Engins | CRUD + affectation CRV | 92% |
| Vols | create, getAll, getById, update, programmes | 92% |
| Programmes Vol | CRUD complet + import | 100% |
| Personnes | CRUD complet | 100% |
| Notifications | CRUD complet | 100% |
| SLA | Complet | 100% |

---

## 3. WORKAROUNDS TEMPORAIRES FRONTEND

### Désactiver changement mot de passe
```javascript
// Dans le composant Profil.vue ou Settings.vue
const canChangePassword = false // En attendant backend

// OU afficher message
const changePassword = async () => {
  toast.warning('Fonctionnalité temporairement indisponible. Contactez l\'administrateur.')
}
```

### Contourner phases individuelles
Le store utilise déjà correctement les phases du CRV:
```javascript
// Dans crvStore.js - déjà implémenté
async loadCRV(id) {
  const response = await crvAPI.getById(id)
  this.phases = result.phases || []  // ✅ Phases chargées avec le CRV
}
```

### Masquer suppression CRV/Vol
```javascript
// Dans permissions.js ou composant
const canDeleteCRV = false // Temporairement désactivé

// Dans le template
<button v-if="canDeleteCRV" @click="deleteCRV">Supprimer</button>
```

---

## 4. CHECKLIST VALIDATION FINALE

### Backend doit implémenter:
- [ ] `POST /api/auth/changer-mot-de-passe`
- [ ] `GET /api/phases/:id`
- [ ] `GET /api/phases`
- [ ] `GET /api/avions`
- [ ] `GET /api/avions/:id`
- [ ] `POST /api/avions`
- [ ] `DELETE /api/crv/:id`
- [ ] `GET /api/charges/:id`
- [ ] `PATCH /api/charges/:id`
- [ ] `DELETE /api/vols/:id`

**Note**: Validation CRV - Tous les profils peuvent valider (sauf QUALITE). Backend OK.

### Frontend doit adapter:
- [ ] Désactiver bouton "Changer mot de passe" temporairement
- [ ] Désactiver gestion avions temporairement
- [ ] Masquer bouton suppression CRV/Vol temporairement
- [ ] S'assurer que les phases sont toujours chargées via CRV

---

## 5. PRIORISATION IMPLEMENTATION

### Sprint 1 (Critique - Core)
1. `POST /api/auth/changer-mot-de-passe`
2. `DELETE /api/crv/:id`

### Sprint 2 (Fonctionnalités)
4. `GET /api/phases/:id`
5. `GET /api/phases`
6. `GET /api/charges/:id`
7. `PATCH /api/charges/:id`

### Sprint 3 (Complétude)
8. Routes avions CRUD
9. `DELETE /api/vols/:id`

---

**FIN DU DOCUMENT DE RECONCILIATION**
