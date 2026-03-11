# AUDIT FRONTEND — Données CRV reçues vs affichées

**Date** : 2026-03-11
**Branche** : mission/frontend-alignment
**Type** : Audit uniquement — aucune modification de code
**Périmètre** : API → Store → Composants → Template

---

## 1. Résumé exécutif

Le frontend **ne perd aucune donnée au niveau transport** (API → Store). Toutes les données renvoyées par le backend sont stockées intégralement dans le crvStore via assignation directe.

**En revanche, 6 champs reçus et stockés ne sont JAMAIS affichés dans l'interface.**

| Catégorie | Verdict |
|-----------|---------|
| Service API (api.js) | ✅ Aucune perte — pass-through |
| Store Pinia (crvStore.js) | ✅ Aucune perte — assignation directe |
| Composants Vue | ⚠️ **6 champs non affichés** |
| Transformations (map/filter) | ✅ Aucune suppression de données |

---

## 2. Données reçues de l'API

L'endpoint `GET /api/crv/:id` renvoie un objet complet :

```
{
  crv: {
    numeroCRV, vol, agent, statut, completude,
    horaire: {
      heureArriveePrevue,     ← REÇU
      heureDepartPrevue,      ← REÇU
      heureArriveeReelle,
      heureDepartReelle
    },
    personnelAffecte, engins, services, archivage, historique
  },
  phases: [{
    statut, heureDebutReelle, heureFinReelle,
    heureDebutPrevue,          ← REÇU
    heureFinPrevue,            ← REÇU
    dureeStandardMinutes,      ← REÇU
    ecartMinutes,              ← REÇU
    phase: { libelle, dureePrevue, seuilSLA, prerequis }
  }],
  charges: [...],
  evenements: [...],
  observations: [...]
}
```

---

## 3. Données affichées par composant

### CRVHeader.vue ✅ COMPLET
| Champ | Affiché |
|-------|---------|
| numeroVol | ✅ |
| compagnieAerienne | ✅ |
| codeIATA | ✅ |
| dateVol | ✅ |
| aeroportOrigine | ✅ |
| aeroportDestination | ✅ |
| vol.avion.immatriculation | ✅ |
| vol.avion.typeAvion | ✅ |
| poste | ✅ |

### CRVPhases.vue ⚠️ INCOMPLET
| Champ | Affiché |
|-------|---------|
| phase.libelle | ✅ |
| statut | ✅ |
| heureDebutReelle | ✅ |
| heureFinReelle | ✅ |
| dureeReelleMinutes | ✅ (calculé localement) |
| phase.dureePrevue | ✅ (utilisé pour SLA) |
| phase.seuilSLA | ✅ |
| remarques | ✅ |
| motifNonRealisation | ✅ |
| **heureDebutPrevue** | ❌ **NON AFFICHÉ** |
| **heureFinPrevue** | ❌ **NON AFFICHÉ** |
| **dureeStandardMinutes** | ❌ **NON AFFICHÉ** |
| **ecartMinutes** | ❌ **NON AFFICHÉ** |

### CRVEngins.vue ✅ COMPLET
| Champ | Affiché |
|-------|---------|
| type | ✅ |
| immatriculation | ✅ |
| usage | ✅ |
| heureDebut | ✅ |
| heureFin | ✅ |
| remarques | ✅ |

### CRVPersonnes.vue ✅ COMPLET
| Champ | Affiché |
|-------|---------|
| nom, prenom | ✅ |
| fonction | ✅ |
| matricule | ✅ |
| telephone | ✅ |
| remarques | ✅ |

### CRVCharges.vue ✅ COMPLET
Tous les champs passagers, bagages, fret, DGR affichés.

### CRVEvenements.vue ✅ COMPLET
Tous les champs événements affichés.

### CRVValidation.vue ✅ COMPLET
Validateur, fonction, date, commentaires affichés.

---

## 4. Données PERDUES (reçues mais non affichées)

### 4.1 Horaires prévus du vol

| Champ | Stocké dans | Affiché dans | Verdict |
|-------|-------------|-------------|---------|
| `horaire.heureArriveePrevue` | `crvStore.currentCRV.horaire` | **Aucun composant** | ❌ PERDU |
| `horaire.heureDepartPrevue` | `crvStore.currentCRV.horaire` | **Aucun composant** | ❌ PERDU |

**Impact** : L'utilisateur ne voit pas les heures prévues du vol. Impossible de comparer prévu vs réel au niveau vol.

### 4.2 Horaires prévus des phases

| Champ | Stocké dans | Affiché dans | Verdict |
|-------|-------------|-------------|---------|
| `phase.heureDebutPrevue` | `crvStore.phases[]` | **Aucun composant** | ❌ PERDU |
| `phase.heureFinPrevue` | `crvStore.phases[]` | **Aucun composant** | ❌ PERDU |

**Impact** : L'utilisateur ne voit que les heures réelles d'exécution. Aucune comparaison prévu/réel possible au niveau phase.

### 4.3 Durée et écart des phases

| Champ | Stocké dans | Affiché dans | Verdict |
|-------|-------------|-------------|---------|
| `phase.dureeStandardMinutes` | `crvStore.phases[]` | **Aucun composant** | ❌ PERDU |
| `phase.ecartMinutes` | `crvStore.phases[]` | **Aucun composant** | ❌ PERDU |

**Note** : `phase.phase.dureePrevue` EST utilisé pour le calcul SLA, mais `dureeStandardMinutes` et `ecartMinutes` (qui sont des champs distincts) ne sont pas affichés.

### 4.4 Services

| Champ | Stocké dans | Affiché dans | Verdict |
|-------|-------------|-------------|---------|
| `services[]` | `crvStore.currentCRV.services` | **Aucun composant** | ❌ PERDU |

**Impact** : Si le backend envoie un tableau `services`, il est stocké mais aucun composant ne le lit ni ne l'affiche. Pas de composant `CRVServices.vue`.

---

## 5. Analyse des transformations

### 5.1 Couche API (api.js / apiWithMock.js)
- **Aucune transformation** — les appels renvoient `response.data` sans filtrage
- Pas de map/filter/reduce dans le service layer

### 5.2 Couche Store (crvStore.js)
```javascript
// loadCRV() — Assignation directe, aucun filtrage
this.currentCRV = result.crv || result
this.phases = result.phases || []
this.charges = result.charges || []
```
- **Aucune perte** — tous les champs de la réponse API survivent intacts

### 5.3 Filtrage dans les vues (CRVArrivee/Depart/TurnAround)
```javascript
// phasesNonTraitees — filtre les phases TERMINE et NON_REALISE
crvStore.phases.filter(p => {
  const estTraitee = statut === 'TERMINE' || statut === 'NON_REALISE'
  return !estTraitee
})
```
- **Impact** : Seules les phases non traitées sont affichées dans le stepper. Les phases terminées disparaissent de la vue active (intentionnel pour l'UX mais peut masquer l'historique).

### 5.4 Fallbacks dans CRVNouveau.vue
```javascript
compagnie: m.compagnie || m.codeCompagnie    // Chaîne de fallback
dateVol: m.dateMouvement || m.date || m.dateVol  // Triple fallback
```
- **Risque** : Si les deux champs sont falsy, la valeur devient `undefined` silencieusement.

---

## 6. Cartographie du flux de données

```
Backend API
    │
    ▼
api.js (pass-through)
    │
    ▼
crvStore.js (assignation directe)
    │
    ├── currentCRV.vol.avion.immatriculation  → CRVHeader ✅
    ├── currentCRV.vol.avion.typeAvion        → CRVHeader ✅
    ├── currentCRV.horaire.heureArriveePrevue → ❌ AUCUN COMPOSANT
    ├── currentCRV.horaire.heureDepartPrevue  → ❌ AUCUN COMPOSANT
    ├── currentCRV.services                   → ❌ AUCUN COMPOSANT
    │
    ├── phases[].heureDebutReelle             → CRVPhases ✅
    ├── phases[].heureFinReelle               → CRVPhases ✅
    ├── phases[].heureDebutPrevue             → ❌ AUCUN COMPOSANT
    ├── phases[].heureFinPrevue               → ❌ AUCUN COMPOSANT
    ├── phases[].dureeStandardMinutes         → ❌ AUCUN COMPOSANT
    ├── phases[].ecartMinutes                 → ❌ AUCUN COMPOSANT
    │
    ├── charges[]                             → CRVCharges ✅
    ├── engins[]                              → CRVEngins ✅
    ├── evenements[]                          → CRVEvenements ✅
    └── observations[]                        → (composant dédié) ✅
```

---

## 7. Conclusion

### Le problème n'est PAS une perte de données en transit

Le pipeline API → Store est fiable. Aucune donnée n'est supprimée pendant le transport.

### Le problème EST un défaut d'affichage

**7 données reçues du backend ne sont jamais rendues dans l'interface :**

1. **`horaire.heureArriveePrevue`** — Heure d'arrivée prévue du vol
2. **`horaire.heureDepartPrevue`** — Heure de départ prévue du vol
3. **`phase.heureDebutPrevue`** — Heure de début prévue de chaque phase
4. **`phase.heureFinPrevue`** — Heure de fin prévue de chaque phase
5. **`phase.dureeStandardMinutes`** — Durée standard de la phase
6. **`phase.ecartMinutes`** — Écart entre prévu et réel
7. **`services[]`** — Tableau des services (aucun composant dédié)

### Impact opérationnel

- **Pas de comparaison prévu/réel** : L'agent d'escale ne peut pas voir si une phase est en retard par rapport au planning
- **Pas de visibilité SLA** : L'écart en minutes existe en base mais n'est pas affiché (seul le calcul local via `dureePrevue` est utilisé)
- **Pas d'affichage services** : Si des services sont associés au CRV, ils sont invisibles

### Recommandations (pour mission future)

1. Ajouter l'affichage des heures prévues dans `CRVPhases.vue` (colonnes "Prévu" à côté de "Réel")
2. Afficher `ecartMinutes` comme indicateur de retard (badge rouge/vert)
3. Afficher `horaire.heureArriveePrevue` / `heureDepartPrevue` dans `CRVHeader.vue`
4. Clarifier si `services[]` est un concept distinct de `engins[]` et créer un composant si nécessaire
5. Standardiser les noms de champs date entre bulletin/programme/formulaire

---

*Audit réalisé par Claude Code — Mission audit uniquement, aucune modification de code.*
