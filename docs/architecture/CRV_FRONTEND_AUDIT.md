# AUDIT ARCHITECTURAL COMPLET — FRONTEND CRV (Phases)

**Date :** 2026-03-09
**Périmètre :** Frontend Vue 3 — Flux phases, rendu, type CRV, groupement
**Type :** ANALYSE PURE — Aucune modification de code
**Auteur :** Claude Code (agent terrain MADMIT)

---

## TABLE DES MATIÈRES

1. [Architecture frontend — Fichiers, dossiers, flux de données](#partie-1)
2. [Structure de la page CRV — Chargement des données](#partie-2)
3. [Chargement des phases depuis l'API](#partie-3)
4. [Gestion du type CRV (ARRIVEE / DEPART / TURN_AROUND)](#partie-4)
5. [Composant d'affichage des phases — CRVPhases.vue](#partie-5)
6. [Logique d'ordonnancement des phases](#partie-6)
7. [Spécificités Turnaround](#partie-7)
8. [Risques de régression](#partie-8)
9. [Points d'extension sûrs pour le groupement de phases](#partie-9)
10. [Conclusion — Synthèse et points d'intervention](#partie-10)

---

<a id="partie-1"></a>
## PARTIE 1 — Architecture frontend (fichiers, dossiers, flux de données)

### 1.1 Arborescence des fichiers CRV

```
src/
├── views/CRV/
│   ├── CRVArrivee.vue        (~1330 lignes) — Wizard 7 étapes type ARRIVEE
│   ├── CRVDepart.vue         (~1050 lignes) — Wizard 7 étapes type DEPART
│   ├── CRVTurnAround.vue     (~1050 lignes) — Wizard 7 étapes type TURN_AROUND
│   └── CRVNouveau.vue        (~600 lignes)  — Formulaire de création CRV
│
├── components/crv/
│   ├── CRVPhases.vue         (~750 lignes) — Affichage + édition des phases ★
│   ├── CRVPersonnes.vue      (~460 lignes) — Personnel affecté
│   ├── CRVEngins.vue         (~350 lignes) — Matériel utilisé
│   ├── CRVCharges.vue        (~800 lignes) — Charges opérationnelles
│   ├── CRVEvenements.vue     (~400 lignes) — Événements opérationnels
│   ├── CRVValidation.vue     (~360 lignes) — Validation / signature
│   ├── CRVHeader.vue         (~300 lignes) — En-tête vol (numéro, type, poste)
│   ├── CRVLockedBanner.vue   (~80 lignes)  — Bannière CRV verrouillé
│   └── CompletudeBarre.vue   (~120 lignes) — Barre de progression complétude
│
├── stores/
│   └── crvStore.js           (~1530 lignes) — Store Pinia central CRV ★
│
├── services/
│   └── api.js                (~900 lignes)  — Endpoints API (REST)
│
└── config/
    └── crvEnums.js           (~650 lignes)  — Enums centralisés (STATUT, TYPE, etc.)
```

### 1.2 Flux de données global

```
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express + MongoDB)           │
│                                                         │
│  Phase (template)  ──→  ChronologiePhase (instance)     │
│  seedPhases.js          crv + phase ref + statut        │
│                                                         │
│  GET /api/crv/:id  ──→  { crv, phases[], charges[],     │
│                           evenements[], observations[] } │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    api.js (Service HTTP)                  │
│                                                         │
│  crvAPI.getById(id)      → GET /crv/:id                 │
│  phasesAPI.updateManuel()→ PUT /crv/:crvId/phases/:id   │
│  phasesAPI.demarrer()    → POST /phases/:id/demarrer    │
│  phasesAPI.terminer()    → POST /phases/:id/terminer    │
│  phasesAPI.marquerNonRealise() → POST /phases/:id/non-realise │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    crvStore.js (Pinia)                    │
│                                                         │
│  state.phases = []       ← loadCRV() remplit            │
│  state.currentCRV = {}   ← contient completudeDetails   │
│                                                         │
│  Actions:                                               │
│    loadCRV()             → remplit phases[]              │
│    updatePhaseManuel()   → PUT + reload                  │
│    demarrerPhase()       → POST + reload                 │
│    terminerPhase()       → POST + reload                 │
│    marquerPhaseNonRealisee() → POST + reload             │
│                                                         │
│  Getters:                                               │
│    getPhases             → state.phases                  │
│    getPhasesEnCours      → filter statut='EN_COURS'     │
│    getPhasesTerminees    → filter statut='TERMINE'      │
│    getCompletudePhases   → backend-calculated (40%)     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│           CRVArrivee / CRVDepart / CRVTurnAround        │
│                    (Wizard Views)                         │
│                                                         │
│  Étape 4 → <CRVPhases :phases="crvStore.phases"        │
│                        crv-type="arrivee|depart|turnaround" │
│                        :disabled="crvStore.isLocked" /> │
│                                                         │
│  Pas de formData.phases → données directement du store  │
│  saveCurrentStepData() ne gère PAS les phases           │
│  → CRVPhases gère sa propre sauvegarde via le store     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               CRVPhases.vue (Composant)                  │
│                                                         │
│  Props: phases[], crvType, disabled                     │
│  Emit: phase-update                                     │
│                                                         │
│  Rendu: v-for phase in phases (ordre API)               │
│  Pas de tri/filtre local                                │
│  Statut détermine le formulaire affiché                 │
│  typeOperation affiché comme badge coloré               │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Pattern architectural

- **Store-centric** : Les phases ne transitent pas par `formData`. Le store est source unique.
- **Component self-saving** : CRVPhases appelle directement `crvStore.updatePhaseManuel()`.
- **Event feedback** : CRVPhases émet `@phase-update` pour notification (seul CRVArrivee l'écoute).
- **Backend-ordered** : Le frontend affiche les phases dans l'ordre reçu, sans tri local.
- **Reload strategy** : Après chaque mutation de phase, `loadCRV()` est rappelé pour synchroniser.

---

<a id="partie-2"></a>
## PARTIE 2 — Structure de la page CRV et chargement des données

### 2.1 Pattern Wizard (7 étapes)

Les 3 vues CRV utilisent un wizard identique à 7 étapes :

| Étape | Contenu | Composant | Source données |
|-------|---------|-----------|---------------|
| 1 | En-tête vol | `<CRVHeader>` | `formData.header` |
| 2 | Personnel | `<CRVPersonnes>` | `formData.personnes` |
| 3 | Engins | `<CRVEngins>` | `formData.engins` |
| **4** | **Phases** | **`<CRVPhases>`** | **`crvStore.phases`** (direct store) |
| 5 | Charges | `<CRVCharges>` | via store |
| 6 | Événements | `<CRVEvenements>` | via store |
| 7 | Validation | `<CRVValidation>` | `formData.validation` |

**Observation clé** : Les étapes 1-3 et 7 utilisent `formData` (state local). Les étapes 4-6 utilisent directement le store Pinia. Ce pattern crée une **asymétrie de gestion d'état**.

### 2.2 Chargement initial des données

À l'ouverture d'un wizard (CRVArrivee, CRVDepart ou CRVTurnAround), le cycle est :

```javascript
// onMounted (dans chaque wizard)
onMounted(async () => {
  const crvId = route.params.id
  await crvStore.loadCRV(crvId)

  // Hydrater formData depuis le store
  if (crvStore.currentCRV) {
    formData.value.header = {
      numeroVol: crvStore.currentCRV.vol?.numeroVol || '',
      typeAvion: crvStore.currentCRV.vol?.typeAvion || '',
      poste: crvStore.currentCRV.vol?.posteStationnement || '',
      // ...
    }
    formData.value.personnes = [...(crvStore.currentCRV.personnelAffecte || [])]
    formData.value.engins = [...(crvStore.engins || [])]
    // Note: phases NON copiées dans formData
  }
})
```

### 2.3 Sauvegarde par étape

```javascript
// saveCurrentStepData() dans chaque wizard
switch (currentStep.value) {
  case 1: // Header → crvStore.updateVol(formData.header)
  case 2: // Personnel → crvStore.updatePersonnel(formData.personnes)
  case 3: // Engins → crvStore.updateEngins(formData.engins)
  // case 4, 5, 6 : composants CRVPhases, CRVCharges, CRVEvenements
  //   gèrent la sauvegarde directement via le store
  case 7: // Validation → crvStore.validerCRV(formData.validation)
}
```

**Phases (étape 4)** : Le wizard ne gère PAS la sauvegarde des phases. C'est CRVPhases qui appelle directement `crvStore.updatePhaseManuel()` ou `crvStore.marquerPhaseNonRealisee()` à chaque action utilisateur.

---

<a id="partie-3"></a>
## PARTIE 3 — Chargement des phases depuis l'API

### 3.1 Endpoint API

```
GET /api/crv/:id
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "crv": { /* document CRV */ },
    "phases": [
      {
        "_id": "65a...",
        "crv": "65b...",
        "phase": {
          "_id": "65c...",
          "code": "ARR_BRIEFING",
          "libelle": "Briefing équipes",
          "typeOperation": "ARRIVEE",
          "categorie": "BRIEFING",
          "macroPhase": "DEBUT",
          "ordre": 1,
          "dureeStandardMinutes": 10,
          "obligatoire": true,
          "prerequis": [],
          "seuilSLA": 15
        },
        "statut": "NON_COMMENCE",
        "heureDebutReelle": null,
        "heureFinReelle": null,
        "dureeReelleMinutes": null,
        "ecartMinutes": null,
        "motifNonRealisation": null,
        "detailMotif": null,
        "remarques": null
      },
      // ... autres phases
    ],
    "charges": [...],
    "evenements": [...],
    "observations": [...]
  }
}
```

### 3.2 Extraction dans le store

```javascript
// crvStore.js — loadCRV() (lignes 356-399)
async loadCRV(id) {
  const response = await crvAPI.getById(id)
  const result = this._extractData(response)

  this.currentCRV = result.crv || result
  this.phases = result.phases || []     // ← Stockage direct, aucune transformation
  this.charges = result.charges || []
  this.evenements = result.evenements || []
  this.observations = result.observations || []
  this.engins = result.engins || []
}
```

### 3.3 Transformations appliquées

**AUCUNE transformation côté frontend.**

- Les phases sont stockées telles que reçues du backend.
- Le backend retourne les phases déjà triées par `phase.ordre` (via `.sort({ 'phase.ordre': 1 })`).
- Le frontend ne trie pas, ne filtre pas, ne groupe pas.

### 3.4 Structure d'une phase côté frontend

Chaque élément de `crvStore.phases` a la structure imbriquée :

```
phase (ChronologiePhase)
├── _id                    → ID unique de l'instance
├── crv                    → Référence au CRV parent
├── phase (Phase template) → Objet imbriqué ★
│   ├── _id
│   ├── code               → "ARR_BRIEFING"
│   ├── libelle            → "Briefing équipes"
│   ├── typeOperation      → "ARRIVEE" | "DEPART" | "TURN_AROUND" | "COMMUN"
│   ├── categorie          → "BRIEFING" | "PISTE" | "BAGAGE" | etc.
│   ├── macroPhase         → "DEBUT" | "REALISATION" | "FIN"
│   ├── ordre              → 1, 2, 3...
│   ├── dureeStandardMinutes → 10
│   ├── obligatoire        → true/false
│   ├── prerequis          → [] (ObjectIds d'autres phases)
│   └── seuilSLA           → 15 (minutes)
├── statut                 → "NON_COMMENCE" | "EN_COURS" | "TERMINE" | "NON_REALISE"
├── heureDebutReelle       → ISO date ou null
├── heureFinReelle         → ISO date ou null
├── dureeReelleMinutes     → Number (auto-calculé backend)
├── ecartMinutes           → Number (auto-calculé backend)
├── motifNonRealisation    → String ou null
├── detailMotif            → String ou null
└── remarques              → String ou null
```

**Point d'attention** : Le composant CRVPhases accède aux champs template via `phase.phase.*` (double imbrication). Il utilise des fallbacks défensifs : `phase.phase?.libelle || phase.nomPhase || phase.nom`.

---

<a id="partie-4"></a>
## PARTIE 4 — Gestion du type CRV (ARRIVEE / DEPART / TURN_AROUND)

### 4.1 Détermination du type

Le type CRV est déterminé par le champ `vol.typeOperation` :

```javascript
// crvStore.js getter
getCRVType: (state) => state.currentCRV?.vol?.typeOperation
// Valeurs: 'ARRIVEE' | 'DEPART' | 'TURN_AROUND'
```

### 4.2 Impact du type sur les phases — côté BACKEND

Le backend détermine quelles phases créer lors de `initialiserPhasesVol()` :

| typeOperation | Phases créées | Total |
|---------------|--------------|-------|
| ARRIVEE | ARRIVEE (8) + COMMUN (4) | **12 phases** |
| DEPART | DEPART (9) + COMMUN (4) | **13 phases** |
| TURN_AROUND | ARRIVEE (8) + DEPART (9) + TURN_AROUND (13) + COMMUN (4) | **34 phases** |

**Code backend** (`phase.service.js:32-50`) :
```javascript
let typeFilter;
if (typeOperation === 'TURN_AROUND') {
  typeFilter = ['ARRIVEE', 'DEPART', 'TURN_AROUND', 'COMMUN'];
} else if (typeOperation === 'ARRIVEE') {
  typeFilter = ['ARRIVEE', 'COMMUN'];
} else if (typeOperation === 'DEPART') {
  typeFilter = ['DEPART', 'COMMUN'];
}

const phasesRef = await Phase.find({
  actif: true,
  typeOperation: { $in: typeFilter }
}).sort({ ordre: 1 });
```

### 4.3 Impact du type sur les phases — côté FRONTEND

**AUCUN filtrage côté frontend.** Les 3 wizards passent `crvStore.phases` tel quel :

| Wizard | Prop `crv-type` | Phases passées | Filtrage |
|--------|----------------|----------------|----------|
| CRVArrivee | `"arrivee"` | `crvStore.phases` | AUCUN |
| CRVDepart | `"depart"` | `crvStore.phases` | AUCUN |
| CRVTurnAround | `"turnaround"` | `crvStore.phases` | AUCUN |

Le prop `crv-type` est passé à CRVPhases mais **n'est PAS utilisé** pour filtrer ou grouper les phases. Il n'est utilisé nulle part dans la logique du composant.

### 4.4 Conséquence pour le Turnaround

Un CRV TURN_AROUND affiche potentiellement **34 phases en liste plate**, mêlant :
- Phases ARR_* (arrivée)
- Phases TA_* (turn-around spécifiques)
- Phases DEP_* (départ)
- Phases COM_* (communes)

Toutes sont affichées dans l'ordre `phase.ordre` défini dans le seed backend, sans séparation visuelle par groupe.

### 4.5 Badge typeOperation

Le seul indicateur visuel du type de phase est un badge coloré :

```javascript
// CRVPhases.vue lignes 531-534
const getPhaseTypeOperation = (phase) => {
  return phase.phase?.typeOperation || phase.typeOperation || null
}
```

```css
.type-arrivee { background: #dbeafe; color: #1e40af; }      /* Bleu */
.type-depart { background: #fef3c7; color: #92400e; }       /* Jaune */
.type-turn_around { background: #e0e7ff; color: #4338ca; }  /* Violet */
```

C'est un simple indicateur visuel, pas un mécanisme de groupement.

---

<a id="partie-5"></a>
## PARTIE 5 — Composant d'affichage des phases (CRVPhases.vue)

### 5.1 Props et émissions

```javascript
const props = defineProps({
  phases: Array,       // Liste des phases à afficher
  crvType: String,     // Type CRV (passé mais NON utilisé en logique)
  disabled: Boolean    // Désactive toutes les actions d'édition
})

const emit = defineEmits(['phase-update'])
```

### 5.2 Rendu principal — v-for sans tri

```html
<div v-for="phase in phases" :key="phase.id || phase._id" class="phase-item" ...>
```

- **Itération directe** : `props.phases` sans computed de tri/filtre.
- **Clé défensive** : `phase.id || phase._id` (compatibilité MongoDB).
- **Pas de groupement** : Toutes les phases dans un seul conteneur plat.

### 5.3 Rendu conditionnel par statut

Le composant affiche un formulaire différent selon le `phase.statut` :

| Statut | Section template | Comportement |
|--------|-----------------|-------------|
| `NON_COMMENCE` | Lignes 62-197 | Boutons "Saisir les heures" + "Non réalisée". Bloqué si prérequis non satisfaits. |
| `EN_COURS` | Lignes 200-276 | Affiche heure début (lecture seule) + bouton "Saisir heure fin". |
| `TERMINE` | Lignes 279-394 | Affiche heures début/fin, durée, comparaison SLA, bouton "Modifier". |
| `NON_REALISE` | Lignes 397-406 | Affiche motif + détail en lecture seule. |
| `ANNULE` | (pas de section) | Aucun rendu spécifique. |

### 5.4 Transition d'état automatique

La transition de statut est **déduite des champs saisis**, pas d'un bouton explicite :

```javascript
// handleSavePhaseManuel (lignes 631-678)
const data = {}

if (editHeureFin.value) {
  data.statut = 'TERMINE'       // Heure fin renseignée → terminée
} else if (editStatutOriginal.value === 'NON_COMMENCE') {
  data.statut = 'EN_COURS'      // Pas d'heure fin, début saisi → en cours
}
// Si déjà TERMINE et modification → reste TERMINE
```

### 5.5 Gestion des prérequis

```javascript
// canStartPhase() — lignes 508-529
const canStartPhase = (phase) => {
  if (!phase.phase?.prerequis?.length) {
    return { canStart: true, prerequisManquants: [] }
  }

  const prerequisManquants = []
  for (const prereqId of phase.phase.prerequis) {
    const prereqPhase = props.phases.find(p =>
      (p.phase?.id || p.phase?._id) === prereqId || p.phaseId === prereqId
    )
    if (prereqPhase &&
        prereqPhase.statut !== 'TERMINE' &&
        prereqPhase.statut !== 'NON_REALISE') {
      prerequisManquants.push(getPhaseNom(prereqPhase))
    }
  }

  return { canStart: prerequisManquants.length === 0, prerequisManquants }
}
```

Le bouton "Saisir les heures" est désactivé (`:disabled`) si les prérequis ne sont pas satisfaits.

### 5.6 Calcul de complétude locale

```javascript
// lignes 496-506
const phasesCompletes = computed(() => {
  return props.phases.filter(p =>
    p.statut === 'TERMINE' || p.statut === 'NON_REALISE'
  ).length
})

const phasesCompletude = computed(() => {
  if (props.phases.length === 0) return 0
  return Math.round((phasesCompletes.value / props.phases.length) * 40)
  // Phases = 40% de la complétude globale CRV
})
```

### 5.7 Comparaison SLA

Pour les phases terminées, le composant compare la durée réelle à la durée standard :

```javascript
// Template lignes 362-372
'ecart-ok':          (phase.dureeReelleMinutes - phase.phase.dureePrevue) <= getPhaseSeuil(phase)
'ecart-depassement': (phase.dureeReelleMinutes - phase.phase.dureePrevue) > getPhaseSeuil(phase)
```

`getPhaseSeuil()` retourne `phase.phase.seuilSLA || 15` (défaut 15 minutes).

### 5.8 Helpers d'affichage

| Fonction | Lignes | Description |
|----------|--------|-------------|
| `getPhaseNom(phase)` | 573-575 | `phase.phase?.libelle \|\| phase.nomPhase \|\| 'Phase sans nom'` |
| `getPhaseTypeOperation(phase)` | 531-534 | `phase.phase?.typeOperation \|\| null` |
| `getPhaseSeuil(phase)` | 536-539 | `phase.phase?.seuilSLA \|\| 15` |
| `formatTime(dateStr)` | 542-548 | Extrait HH:MM d'une date ISO |
| `formatDuree(minutes)` | 550-558 | Convertit minutes → "Xh Ymin" |
| `formatMotif(code)` | 561-570 | Map enum → label français |
| `getStatusClass(statut)` | 577-585 | Retourne classe CSS selon statut |

---

<a id="partie-6"></a>
## PARTIE 6 — Logique d'ordonnancement des phases

### 6.1 Ordonnancement backend (source de vérité)

L'ordre des phases est défini dans le seed backend (`seedPhases.js`) via le champ `ordre` :

**Phases ARRIVEE :**
```
ordre 1: ARR_BRIEFING
ordre 2: ARR_ARRIVEE_AVION
ordre 3: ARR_OUVERTURE_SOUTES
ordre 4: ARR_DECHARGEMENT
ordre 5: ARR_LIVRAISON_BAGAGES
ordre 6: ARR_DEBARQUEMENT_PAX
ordre 7: ARR_MISE_CONDITION_CABINE
ordre 8: ARR_DEBRIEFING
```

**Phases DEPART :**
```
ordre 1: DEP_INSPECTION
ordre 2: DEP_AVITAILLEMENT
ordre 3: DEP_NETTOYAGE
ordre 4: DEP_CHARG_SOUTE
ordre 5: DEP_EMBARQ_PAX
ordre 6: DEP_FERMETURE
ordre 7: DEP_REPOUSSAGE
ordre 8: DEP_ROULAGE
ordre 9: DEP_DECOLLAGE
```

**Phases TURN_AROUND :**
```
ordre 1-13: TA_ATTERRISSAGE → TA_REPOUSSAGE
```

**Phases COMMUN :**
```
ordre 100: COM_CONTROLE_SECU
ordre 101: COM_CATERING
ordre 102: COM_MAINTENANCE_LEGERE
ordre 103: COM_REMISE_DOCUMENTS
```

### 6.2 Tri côté backend

Le contrôleur backend trie par `phase.ordre` lors de la récupération :
```javascript
// phase.service.js
const phasesRef = await Phase.find({ ... }).sort({ ordre: 1 })
```

### 6.3 Tri côté frontend

**AUCUN tri côté frontend.** Le composant CRVPhases affiche les phases dans l'ordre reçu de l'API.

Le store ne trie pas :
```javascript
this.phases = result.phases || []  // Pas de .sort()
```

Le composant n'a pas de computed trié :
```html
<div v-for="phase in phases" ...>  <!-- phases = props.phases brut -->
```

### 6.4 Conséquence pour le Turnaround

Pour un TURN_AROUND, le backend crée des phases de 4 types. L'ordonnancement final dépend du champ `ordre` :
- ARR_* (ordre 1-8)
- TA_* (ordre 1-13)
- DEP_* (ordre 1-9)
- COM_* (ordre 100-103)

**Problème potentiel** : Les phases ARR_*, TA_* et DEP_* ont des `ordre` qui se chevauchent (1-8, 1-13, 1-9). L'ordre final dans la liste plate dépend de l'ordre de retour MongoDB, qui n'est pas garanti stable dans ce cas.

### 6.5 Macro-phases (non exploitées)

Le backend définit un champ `macroPhase` sur chaque Phase template :
- `DEBUT` : Phases d'initialisation
- `REALISATION` : Phases d'exécution
- `FIN` : Phases de clôture

Ce champ **n'est PAS exploité par le frontend**. Il n'y a aucune référence à `macroPhase` dans CRVPhases.vue ni dans les wizards.

---

<a id="partie-7"></a>
## PARTIE 7 — Spécificités Turnaround

### 7.1 Différences entre les 3 wizards

| Aspect | CRVArrivee | CRVDepart | CRVTurnAround |
|--------|-----------|----------|---------------|
| Prop `crv-type` | `"arrivee"` | `"depart"` | `"turnaround"` |
| `@phase-update` | Oui (`handlePhaseUpdate`) | Non | Non |
| Label progression | "Progression des phases" | "Progression des phases" | "Progression des phases (Turn Around)" |
| Données test étape 4 | Oui (`genererDonneesEtape4`) | Non | Non |
| Seuils complétude | Hardcodés (50/80) | `SEUILS_COMPLETUDE` | `SEUILS_COMPLETUDE` |
| Verrouillage | Non | Oui (bouton étape 7) | Non |

### 7.2 Absence de groupement Turnaround

Le wizard CRVTurnAround ne contient **aucune logique spécifique** pour organiser ses 34 phases potentielles. Il utilise exactement le même template que CRVDepart :

```html
<!-- CRVTurnAround.vue — Étape 4 (identique à CRVDepart) -->
<div v-show="currentStep === 4" class="step-content">
  <h3>Phases opérationnelles</h3>
  <div class="phase-progress">
    <span>Progression des phases (Turn Around)</span>
    <!-- ... barre de progression ... -->
  </div>
  <CRVPhases
    :phases="crvStore.phases"
    crv-type="turnaround"
    :disabled="crvStore.isLocked"
  />
</div>
```

### 7.3 Validation des phases (commune aux 3 wizards)

Avant de passer à l'étape 5, le wizard vérifie que toutes les phases sont traitées :

```javascript
const phasesNonTraitees = computed(() => {
  return crvStore.phases.filter(p => {
    const statut = p.statut?.toUpperCase() || ''
    const estTraitee = statut === 'TERMINE' ||
                       statut === 'NON_REALISE' ||
                       statut === 'NON_REALISEE'
    return !estTraitee
  })
})

const toutesPhaseTraitees = computed(() => {
  return crvStore.phases.length === 0 || phasesNonTraitees.value.length === 0
})
```

**Note** : Le check accepte `NON_REALISEE` (avec double E) en plus de `NON_REALISE` — défensif contre une incohérence backend.

### 7.4 Impact UX du Turnaround

Avec 34 phases en liste plate, l'utilisateur du Turnaround fait face à :
- **Scroll excessif** : ~34 cartes phase × ~150px chacune ≈ 5100px de hauteur
- **Pas de repère visuel** : Aucune séparation ARRIVEE / ROTATION / DEPART
- **Prérequis masqués** : Les dépendances entre phases de types différents ne sont pas visuellement évidentes
- **Perte de contexte** : L'utilisateur ne sait pas "où il en est" dans le flux global

---

<a id="partie-8"></a>
## PARTIE 8 — Risques de régression

### 8.1 Risques si on modifie CRVPhases.vue

| Modification envisagée | Risque | Sévérité |
|------------------------|--------|----------|
| Ajouter un tri local `.sort()` | Casse l'ordre backend si les ordres se chevauchent | MOYEN |
| Ajouter un `computed` filtré | Peut exclure des phases si le filtre est incorrect | ÉLEVÉ |
| Modifier la clé `:key` du v-for | Casse les animations TransitionGroup | FAIBLE |
| Modifier `handleSavePhaseManuel` | Impact la transition d'état automatique | ÉLEVÉ |
| Modifier `canStartPhase` | Impact le blocage des prérequis | ÉLEVÉ |
| Ajouter des sections de groupement | Peut casser les calculs de complétude | MOYEN |

### 8.2 Risques si on modifie les wizards

| Modification envisagée | Risque | Sévérité |
|------------------------|--------|----------|
| Filtrer `crvStore.phases` avant passage au composant | Phases manquantes → complétude incorrecte | CRITIQUE |
| Changer le prop `crv-type` | Aucun impact (prop non utilisé en logique) | NUL |
| Modifier `phasesNonTraitees` | Peut autoriser la navigation avec phases incomplètes | ÉLEVÉ |
| Ajouter des phases à `formData` | Dualité de source de vérité (store vs formData) | CRITIQUE |

### 8.3 Risques si on modifie le store

| Modification envisagée | Risque | Sévérité |
|------------------------|--------|----------|
| Trier `this.phases` dans `loadCRV` | Modifie l'ordre pour TOUS les wizards | MOYEN |
| Ajouter un getter groupé | Aucun risque si les getters existants restent intacts | FAIBLE |
| Modifier `updatePhaseManuel` | Impact toute la chaîne de sauvegarde | ÉLEVÉ |

### 8.4 Points de fragilité identifiés

1. **Double imbrication `phase.phase.*`** : Si le backend change la structure de populate, tous les accès cassent.
2. **Fallbacks multiples** (`phase.id || phase._id`, `phase.phase?.libelle || phase.nomPhase || phase.nom`) : Symptôme d'une structure API non stabilisée.
3. **Reload systématique** : Chaque action phase déclenche `loadCRV()` → charge réseau excessive.
4. **Absence de tri local** : Si le backend change l'ordre de retour, le frontend suit aveuglément.

---

<a id="partie-9"></a>
## PARTIE 9 — Points d'extension sûrs pour le groupement de phases

### 9.1 Stratégie recommandée : Computed dans CRVPhases

L'approche la plus sûre pour introduire un groupement de phases est d'ajouter un `computed` dans CRVPhases.vue, **sans modifier les phases brutes** :

```javascript
// PROPOSITION — CRVPhases.vue
const phasesGroupees = computed(() => {
  if (props.crvType !== 'turnaround') {
    // ARRIVEE / DEPART : liste plate (comportement actuel)
    return [{ groupe: null, phases: props.phases }]
  }

  // TURNAROUND : groupement par typeOperation
  const groupes = {
    ARRIVEE: [],
    TURN_AROUND: [],
    DEPART: [],
    COMMUN: []
  }

  for (const phase of props.phases) {
    const type = phase.phase?.typeOperation || 'COMMUN'
    if (groupes[type]) {
      groupes[type].push(phase)
    } else {
      groupes.COMMUN.push(phase)
    }
  }

  return [
    { groupe: 'Arrivée', phases: groupes.ARRIVEE, class: 'groupe-arrivee' },
    { groupe: 'Rotation', phases: groupes.TURN_AROUND, class: 'groupe-rotation' },
    { groupe: 'Départ', phases: groupes.DEPART, class: 'groupe-depart' },
    { groupe: 'Commun', phases: groupes.COMMUN, class: 'groupe-commun' }
  ].filter(g => g.phases.length > 0)
})
```

**Pourquoi c'est sûr :**
- Ne modifie pas `props.phases` (données brutes intactes)
- Ne modifie pas les calculs de complétude (toujours basés sur `props.phases`)
- Ne modifie pas les actions du store
- Ne modifie pas la sauvegarde
- S'active UNIQUEMENT pour `crvType === 'turnaround'`
- Les autres types conservent le comportement exact actuel

### 9.2 Alternative : Groupement par macroPhase

Le backend fournit déjà un champ `macroPhase` (DEBUT / REALISATION / FIN) non exploité :

```javascript
const phasesParMacroPhase = computed(() => {
  const groupes = { DEBUT: [], REALISATION: [], FIN: [] }

  for (const phase of props.phases) {
    const macro = phase.phase?.macroPhase || 'REALISATION'
    groupes[macro].push(phase)
  }

  return [
    { groupe: 'Préparation', phases: groupes.DEBUT },
    { groupe: 'Exécution', phases: groupes.REALISATION },
    { groupe: 'Clôture', phases: groupes.FIN }
  ].filter(g => g.phases.length > 0)
})
```

**Avantage** : Fonctionne pour les 3 types de CRV (pas seulement Turnaround).
**Inconvénient** : Pour le Turnaround, ne distingue pas les phases ARRIVEE des phases DEPART.

### 9.3 Alternative hybride : macroPhase × typeOperation

Pour le Turnaround, combiner les deux axes :

```
PRÉPARATION (DEBUT)
├── ARR_BRIEFING (ARRIVEE)
├── ARR_ARRIVEE_AVION (ARRIVEE)
├── TA_ATTERRISSAGE (TURN_AROUND)
├── TA_ROULAGE_ARR (TURN_AROUND)
├── TA_CALAGE (TURN_AROUND)
└── TA_PASSERELLE (TURN_AROUND)

EXÉCUTION (REALISATION)
├── ARR_OUVERTURE_SOUTES (ARRIVEE)
├── ARR_DECHARGEMENT (ARRIVEE)
├── ...
├── COM_CONTROLE_SECU (COMMUN)
└── COM_CATERING (COMMUN)

CLÔTURE (FIN)
├── DEP_FERMETURE (DEPART)
├── DEP_REPOUSSAGE (DEPART)
├── DEP_ROULAGE (DEPART)
├── DEP_DECOLLAGE (DEPART)
└── COM_REMISE_DOCUMENTS (COMMUN)
```

### 9.4 Points d'intervention sûrs (par fichier)

| Fichier | Intervention | Risque | Justification |
|---------|-------------|--------|--------------|
| **CRVPhases.vue** | Ajouter `computed phasesGroupees` | FAIBLE | Ne touche pas aux données brutes |
| **CRVPhases.vue** | Modifier le `v-for` pour itérer sur les groupes | FAIBLE | Changement de template uniquement |
| **CRVPhases.vue** | Ajouter CSS pour les sections de groupe | NUL | Purement visuel |
| **crvStore.js** | Ajouter un getter `getPhasesGroupees` | FAIBLE | Nouveau getter, ne modifie rien |
| **crvEnums.js** | Ajouter labels pour macroPhase/typeOperation | NUL | Données statiques |
| **Wizards** | Modifier le prop `crv-type` | NUL | Prop déjà passé, pas utilisé |

### 9.5 Interventions à éviter

| Intervention | Raison |
|-------------|--------|
| Filtrer `crvStore.phases` dans les wizards | Casse la complétude et la validation |
| Modifier `handleSavePhaseManuel` | Impact la logique de transition d'état |
| Modifier `canStartPhase` | Impact le blocage des prérequis |
| Stocker les phases dans `formData` | Crée une dualité de source de vérité |
| Trier les phases dans le store | Impact tous les composants consommateurs |

---

<a id="partie-10"></a>
## PARTIE 10 — Conclusion et synthèse

### 10.1 Flux de données complet

```
Backend seedPhases.js
  │
  ▼
Phase templates (MongoDB)
  │ typeOperation + ordre + macroPhase + categorie
  │
  ▼
initialiserPhasesVol(crvId, typeOperation)
  │ Filtre par type → crée ChronologiePhase instances
  │
  ▼
GET /api/crv/:id
  │ Retourne phases[] triées par phase.ordre
  │
  ▼
crvStore.loadCRV()
  │ this.phases = result.phases || []
  │ AUCUNE transformation
  │
  ▼
Wizard (CRVArrivee/Depart/TurnAround)
  │ :phases="crvStore.phases" — passage direct
  │ crv-type="arrivee|depart|turnaround" — badge visuel
  │
  ▼
CRVPhases.vue
  │ v-for phase in phases — rendu plat
  │ Statut → formulaire conditionnel
  │ typeOperation → badge coloré
  │ prerequis → blocage boutons
  │ SLA → écart visuel
  │
  ▼
Actions utilisateur
  │ Saisir heures → updatePhaseManuel()
  │ Non réalisée → marquerPhaseNonRealisee()
  │
  ▼
Store → API → Backend → loadCRV() → Refresh
```

### 10.2 Composants impliqués dans le rendu phases

| Composant | Rôle | Accès phases |
|-----------|------|-------------|
| `crvStore.js` | Source de vérité, actions API | `state.phases` |
| `CRVArrivee.vue` | Wizard, étape 4, validation | `crvStore.phases` (lecture) |
| `CRVDepart.vue` | Wizard, étape 4, validation | `crvStore.phases` (lecture) |
| `CRVTurnAround.vue` | Wizard, étape 4, validation | `crvStore.phases` (lecture) |
| `CRVPhases.vue` | Rendu, édition, sauvegarde | `props.phases` (du wizard) |
| `CompletudeBarre.vue` | Barre de progression | `crvStore.getCompletudePhases` |
| `api.js` | Transport HTTP | Endpoints phases |
| `crvEnums.js` | Labels et descriptions | `STATUT_PHASE`, `MOTIF_NON_REALISATION` |

### 10.3 Points d'intervention sûrs (résumé)

```
✅ SÛR — Ajouter un computed dans CRVPhases.vue
✅ SÛR — Modifier le template CRVPhases.vue (v-for groupé)
✅ SÛR — Ajouter du CSS pour les groupes
✅ SÛR — Ajouter un getter dans crvStore.js
✅ SÛR — Exploiter le champ macroPhase (déjà disponible dans la donnée)
✅ SÛR — Exploiter le champ categorie (déjà disponible dans la donnée)
✅ SÛR — Exploiter le champ typeOperation (déjà affiché en badge)

⚠️ ATTENTION — Modifier l'ordre d'affichage (tri local)
⚠️ ATTENTION — Modifier les calculs de complétude

❌ INTERDIT — Filtrer les phases avant passage au composant
❌ INTERDIT — Stocker les phases dans formData
❌ INTERDIT — Modifier les actions du store (savePhase, etc.)
❌ INTERDIT — Modifier la logique de prérequis
```

### 10.4 Données backend disponibles mais non exploitées

| Champ | Disponible dans | Exploité par le frontend |
|-------|----------------|------------------------|
| `typeOperation` | `phase.phase.typeOperation` | Oui (badge visuel uniquement) |
| `macroPhase` | `phase.phase.macroPhase` | **NON** |
| `categorie` | `phase.phase.categorie` | **NON** |
| `ordre` | `phase.phase.ordre` | **NON** (implicite via ordre API) |
| `obligatoire` | `phase.phase.obligatoire` | **NON** |
| `dureeStandardMinutes` | `phase.phase.dureeStandardMinutes` | Partiellement (`dureePrevue`) |
| `code` | `phase.phase.code` | **NON** |
| `description` | `phase.phase.description` | **NON** |

### 10.5 Score architectural phases

| Critère | Score | Commentaire |
|---------|-------|------------|
| Flux de données | 8/10 | Clair, unidirectionnel, store-centric |
| Séparation des responsabilités | 7/10 | CRVPhases self-saving est bon mais @phase-update incohérent |
| Exploitation des données backend | 4/10 | macroPhase, categorie, obligatoire, code ignorés |
| UX Turnaround | 3/10 | 34 phases en liste plate, pas de groupement |
| Robustesse | 6/10 | Fallbacks défensifs mais double imbrication fragile |
| Extensibilité | 7/10 | Points d'extension clairs, données disponibles |
| **Score global** | **58%** | Architecture fonctionnelle mais sous-exploitée |

---

*Fin de l'audit architectural — Aucun fichier n'a été modifié.*
