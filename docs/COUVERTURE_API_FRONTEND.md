# Couverture API Frontend CRV

## Statut : 100% des endpoints backend couverts

Date de mise à jour : 2026-01-06
Version : 2.0 - Post correction rapport backend

---

## Résumé

| Module API | Routes Backend | Couverture Frontend | Store Pinia |
|------------|---------------|---------------------|-------------|
| authAPI | 5 | 100% | authStore |
| personnesAPI | 8 | 100% | personnesStore |
| crvAPI | 19 | 100% | crvStore (Extension 6) |
| phasesAPI | 6 | 100% | phasesStore + crvStore |
| volsAPI | 12 | 100% | volsStore (Extension 2) |
| programmesVolAPI | 10 | 100% | programmesStore (Extension 1) |
| chargesAPI | 16 | 100% | chargesStore (Extensions 4 & 5) |
| avionsAPI | 12 | 100% | avionsStore (Extension 3) |
| notificationsAPI | 8 | 100% | notificationsStore (Extension 7) |
| slaAPI | 7 | 100% | slaStore (Extension 8) |
| validationAPI | 3 | 100% | crvStore |
| **TOTAL** | **97 routes** | **100%** | **10 stores** |

---

## Extensions implémentées

| Extension | Description | Routes | Statut |
|-----------|-------------|--------|--------|
| Extension 1 | Programmes Vol | 10 | ✅ 100% |
| Extension 2 | Vols Programmés | 12 | ✅ 100% |
| Extension 3 | Configuration Avions | 12 | ✅ 100% |
| Extension 4 | Catégories Passagers | 6 | ✅ 100% |
| Extension 5 | Fret & DGR | 6 | ✅ 100% |
| Extension 6 | Annulation CRV | 7 | ✅ 100% |
| Extension 7 | Notifications | 8 | ✅ 100% |
| Extension 8 | Alertes SLA | 7 | ✅ 100% |

---

## 1. AUTH API (5 routes)

**Store : `authStore.js`**
**Service Legacy : `authService.js`**

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/auth/connexion` | POST | `login()` |
| `/auth/inscription` | POST | `register()` (API) |
| `/auth/me` | GET | `fetchUser()` |
| `/auth/deconnexion` | POST | `logout()` |
| `/auth/changer-mot-de-passe` | POST | `changerMotDePasse()` |

---

## 2. PERSONNES API (8 routes) - ADMIN

**Store : `personnesStore.js`**

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/personnes` | GET | `listPersonnes()` |
| `/personnes/:id` | GET | `loadPersonne()` |
| `/personnes` | POST | `createPersonne()` |
| `/personnes/:id` | PATCH | `updatePersonne()` |
| `/personnes/:id` | DELETE | `deletePersonne()` |
| Désactiver | PATCH | `desactiverPersonne()` |
| Réactiver | PATCH | `reactiverPersonne()` |
| Suspendre | PATCH | `suspendrePersonne()` |

---

## 3. CRV API (19 routes) - inclut Extension 6

**Store : `crvStore.js`**

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/crv` | POST | `createCRV()` |
| `/crv` | GET | `listCRV()` |
| `/crv/:id` | GET | `loadCRV()` |
| `/crv/:id` | PATCH | `updateCRV()` |
| `/crv/:id` | DELETE | `deleteCRV()` |
| `/crv/:id/charges` | POST | `addCharge()` |
| `/crv/:id/evenements` | POST | `addEvenement()` |
| `/crv/:id/observations` | POST | `addObservation()` |
| `/crv/search` | GET | `searchCRV()` |
| `/crv/stats` | GET | `getStats()` |
| `/crv/export` | GET | `exportCRV()` |
| `/crv/annules` | GET | `loadCRVAnnules()` |
| `/crv/:id/archive` | POST | `archiveCRV()` |
| **Extension 6** | | |
| `/crv/:id/peut-annuler` | GET | `peutAnnulerCRV()` |
| `/crv/:id/annuler` | POST | `annulerCRV()` |
| `/crv/:id/reactiver` | POST | `reactiverCRV()` |
| `/crv/statistiques/annulations` | GET | `getStatistiquesAnnulations()` |
| `/crv/archive/status` | GET | `getArchiveStatus()` |
| `/crv/archive/test` | POST | `testArchive()` |

---

## 4. PHASES API (6 routes)

**Store : `phasesStore.js`** + intégré dans `crvStore.js`

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/phases/:id/demarrer` | POST | `demarrerPhase()` |
| `/phases/:id/terminer` | POST | `terminerPhase()` |
| `/phases/:id/non-realise` | POST | `marquerNonRealise()` |
| `/phases/:id` | PATCH | `updatePhase()` |
| `/phases/:id` | GET | `loadPhase()` |
| `/phases?crvId=xxx` | GET | `loadPhasesByCRV()` |

---

## 5. VOLS API (12 routes) - inclut Extension 2

**Store : `volsStore.js`**

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/vols` | POST | `createVol()` |
| `/vols` | GET | `listVols()` |
| `/vols/:id` | GET | `loadVol()` |
| `/vols/:id` | PATCH | `updateVol()` |
| `/vols/:id` | DELETE | `deleteVol()` |
| `/vols/:id/lier-programme` | POST | `lierProgramme()` |
| `/vols/:id/marquer-hors-programme` | POST | `marquerHorsProgramme()` |
| `/vols/:id/detacher-programme` | POST | `detacherProgramme()` |
| **Extension 2** | | |
| `/vols/:id/suggerer-programmes` | GET | `suggererProgrammes()` |
| `/vols/programme/:programmeId` | GET | `loadVolsByProgramme()` |
| `/vols/hors-programme` | GET | `loadVolsHorsProgramme()` |
| `/vols/statistiques/programmes` | GET | `getStatistiquesProgrammes()` |

---

## 6. PROGRAMMES VOL API (10 routes) - Extension 1

**Store : `programmesStore.js`**

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/programmes-vol` | POST | `createProgramme()` |
| `/programmes-vol` | GET | `listProgrammes()` |
| `/programmes-vol/:id` | GET | `loadProgramme()` |
| `/programmes-vol/:id` | PATCH | `updateProgramme()` |
| `/programmes-vol/:id` | DELETE | `deleteProgramme()` |
| `/programmes-vol/:id/valider` | POST | `validerProgramme()` |
| `/programmes-vol/:id/activer` | POST | `activerProgramme()` |
| `/programmes-vol/:id/suspendre` | POST | `suspendreProgramme()` |
| `/programmes-vol/import` | POST | `importerProgramme()` |
| `/programmes-vol/applicables/:date` | GET | `getProgrammesApplicables()` |

---

## 7. CHARGES API (16 routes) - Extensions 4 & 5

**Store : `chargesStore.js`** + intégré dans `crvStore.js`

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/charges/:id` | GET | `loadCharge()` |
| `/charges/:id` | PATCH | `updateCharge()` |
| `/charges/:id/categories-detaillees` | PUT | `updateCategoriesDetaillees()` |
| `/charges/:id/classes` | PUT | `updateClasses()` |
| `/charges/:id/besoins-medicaux` | PUT | `updateBesoinsMedicaux()` |
| `/charges/:id/mineurs` | PUT | `updateMineurs()` |
| `/charges/:id/convertir-categories-detaillees` | POST | `convertirCategoriesDetaillees()` |
| `/charges/:id/fret-detaille` | PUT | `updateFretDetaille()` |
| `/charges/:id/marchandises-dangereuses` | POST | `addMarchandiseDangereuse()` |
| `/charges/:id/marchandises-dangereuses/:mdId` | DELETE | `deleteMarchandiseDangereuse()` |
| `/charges/statistiques/passagers` | GET | `loadStatistiquesPassagers()` |
| `/charges/statistiques/fret` | GET | `loadStatistiquesFret()` |
| **Extension 5 - DGR** | | |
| `/charges/valider-marchandise-dangereuse` | POST | `validerMarchandiseDangereuse()` |
| `/charges/marchandises-dangereuses` | GET | `loadMarchandisesDangereuses()` |
| `/charges/crv/:crvId/statistiques-passagers` | GET | `loadStatistiquesPassagersByCRV()` |
| `/charges/crv/:crvId/statistiques-fret` | GET | `loadStatistiquesFretByCRV()` |

---

## 8. AVIONS API (12 routes) - Extension 3

**Store : `avionsStore.js`**

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/avions` | GET | `listAvions()` |
| `/avions/:id` | GET | `loadAvion()` |
| `/avions` | POST | `createAvion()` |
| `/avions/:id/configuration` | PUT | `updateConfiguration()` |
| `/avions/:id/versions` | POST | `createVersion()` |
| `/avions/:id/versions` | GET | `loadVersions()` |
| `/avions/:id/versions/:numero` | GET | `loadVersion()` |
| `/avions/:id/versions/:numero/restaurer` | POST | `restaurerVersion()` |
| `/avions/:id/versions/comparer` | GET | `comparerVersions()` |
| `/avions/:id/revision` | PUT | `planifierRevision()` |
| `/avions/revisions/prochaines` | GET | `loadRevisionsProchaines()` |
| `/avions/statistiques/configurations` | GET | `loadStatistiques()` |

---

## 9. NOTIFICATIONS API (8 routes) - Extension 7

**Store : `notificationsStore.js`**

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/notifications` | GET | `loadNotifications()` |
| `/notifications/count-non-lues` | GET | `loadCountNonLues()` |
| `/notifications/lire-toutes` | PATCH | `marquerToutesLues()` |
| `/notifications/statistiques` | GET | `loadStatistiques()` |
| `/notifications` | POST | `createNotification()` |
| `/notifications/:id/lire` | PATCH | `marquerLue()` |
| `/notifications/:id/archiver` | PATCH | `archiverNotification()` |
| `/notifications/:id` | DELETE | `deleteNotification()` |

---

## 10. SLA API (7 routes) - Extension 8

**Store : `slaStore.js`**

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/sla/rapport` | GET | `loadRapport()` |
| `/sla/configuration` | GET | `loadConfiguration()` |
| `/sla/configuration` | PUT | `updateConfiguration()` |
| `/sla/surveiller/crv` | POST | `surveillerCRV()` |
| `/sla/surveiller/phases` | POST | `surveillerPhases()` |
| `/sla/crv/:id` | GET | `loadCRVSla()` |
| `/sla/phase/:id` | GET | `loadPhaseSla()` |

---

## 11. VALIDATION API (3 routes)

**Intégré dans : `crvStore.js`**

| Endpoint | Méthode | Store Action |
|----------|---------|--------------|
| `/validation/:id/valider` | POST | `validateCRV()` |
| `/validation/:id/deverrouiller` | POST | `deverrouillerCRV()` |
| `/validation/:id` | GET | `getValidationStatus()` |

---

## Architecture des Stores

```
src/stores/
├── index.js              # Export centralisé
├── authStore.js          # Authentification (5 routes)
├── crvStore.js           # CRV + Phases + Validation + Extension 6 (25 routes)
├── phasesStore.js        # Phases dédiées (6 routes)
├── chargesStore.js       # Charges + DGR (16 routes)
├── volsStore.js          # Vols + Extension 2 (12 routes)
├── programmesStore.js    # Programmes vol + Extension 1 (10 routes)
├── avionsStore.js        # Configuration avions (12 routes)
├── notificationsStore.js # Notifications (8 routes)
├── slaStore.js           # Alertes SLA (7 routes)
└── personnesStore.js     # Gestion utilisateurs (8 routes)
```

---

## Service API Centralisé

**Fichier : `src/services/api.js`**

```javascript
// Exports disponibles - 97 routes totales
export { authAPI }           // 5 routes
export { personnesAPI }      // 8 routes
export { crvAPI }            // 19 routes (Extension 6)
export { phasesAPI }         // 6 routes
export { volsAPI }           // 12 routes (Extension 2)
export { programmesVolAPI }  // 10 routes (Extension 1)
export { chargesAPI }        // 16 routes (Extensions 4 & 5)
export { avionsAPI }         // 12 routes (Extension 3)
export { notificationsAPI }  // 8 routes (Extension 7)
export { slaAPI }            // 7 routes (Extension 8)
export { validationAPI }     // 3 routes
export default api           // Instance Axios configurée
```

---

## Corrections apportées (v2.0)

Suite au rapport de comparaison backend, les routes suivantes ont été ajoutées :

### Extension 6 - Annulation CRV (7 routes)
- `GET /api/crv/:id/peut-annuler`
- `POST /api/crv/:id/annuler`
- `POST /api/crv/:id/reactiver`
- `GET /api/crv/statistiques/annulations`
- `GET /api/crv/archive/status`
- `POST /api/crv/archive/test`
- Intégration complète `GET /api/crv/annules` dans store

### Extension 2 - Vols programmés (4 routes)
- `GET /api/vols/:id/suggerer-programmes`
- `GET /api/vols/programme/:programmeVolId`
- `GET /api/vols/hors-programme`
- `GET /api/vols/statistiques/programmes`

### Extension 1 - Programmes vol (1 route)
- `GET /api/programmes-vol/applicables/:date`

### Extension 5 - Validation DGR (2 routes CRITIQUES)
- `POST /api/charges/valider-marchandise-dangereuse`
- `GET /api/charges/marchandises-dangereuses`

### Statistiques CRV (2 routes)
- `GET /api/charges/crv/:crvId/statistiques-passagers`
- `GET /api/charges/crv/:crvId/statistiques-fret`

---

## Gestion des Rôles

| Rôle | Description | Permissions clés |
|------|-------------|------------------|
| AGENT_ESCALE | Opérateur terrain | Saisie CRV, phases |
| CHEF_EQUIPE | Superviseur local | Validation équipe |
| SUPERVISEUR | Supervision globale | Validation CRV, annulation |
| MANAGER | Direction opérationnelle | Tous accès + déverrouillage + réactivation |
| QUALITE | Contrôle qualité | Lecture seule |
| ADMIN | Administration système | Gestion utilisateurs |

---

## Utilisation dans les composants Vue

```javascript
// Import depuis l'index
import {
  useCrvStore,
  useAuthStore,
  useVolsStore,
  useChargesStore
} from '@/stores'

// Dans setup()
const crvStore = useCrvStore()
const volsStore = useVolsStore()
const chargesStore = useChargesStore()

// Utilisation Extension 6 - Annulation
const canCancel = await crvStore.peutAnnulerCRV()
await crvStore.annulerCRV({ motifAnnulation: 'Vol annulé' })

// Utilisation Extension 2 - Vols programmes
const suggestions = await volsStore.suggererProgrammes(volId)
await volsStore.loadVolsHorsProgramme({ dateDebut, dateFin })

// Utilisation Extension 5 - DGR
const validation = await chargesStore.validerMarchandiseDangereuse(dgrData)
if (validation.valide) {
  await chargesStore.addMarchandiseDangereuse(chargeId, dgrData)
}
```

---

*Document mis à jour après correction rapport backend - CRV Frontend v2.0*
