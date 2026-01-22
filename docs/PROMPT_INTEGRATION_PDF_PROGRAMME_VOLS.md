# PROMPT FRONTEND : Integration Generation PDF Programme de Vols

## CONTEXTE

Le backend dispose maintenant d'une fonctionnalite complete de generation PDF pour les programmes de vols au format aeronautique officiel (A4 paysage). Cette fonctionnalite permet aux utilisateurs de :

1. Previsualiser le PDF avant telechargement
2. Telecharger le PDF directement
3. Afficher le PDF dans un modal

**NON-REGRESSION** : Cette integration utilise les composants existants (`PDFViewModal.vue`) et les patterns etablis dans le projet.

---

## NOUVEAUX ENDPOINTS BACKEND

### 1. Apercu JSON (pour affichage frontend)
```
GET /api/programmes-vol/:programmeId/export-pdf
```
**Response:**
```json
{
  "success": true,
  "data": {
    "programme": {
      "id": "6965fc1071bf4fc9b9470036",
      "nom": "HIVER_2025_2026",
      "edition": "N°01/17-dec.-25",
      "dateDebut": "2025-10-26T00:00:00.000Z",
      "dateFin": "2026-03-28T00:00:00.000Z",
      "statut": "ACTIF",
      "nombreVols": 23,
      "compagnies": ["ET", "AF", "TK", "MS"]
    },
    "volsParJour": {
      "LUNDI": [
        {
          "numeroVol": "ET939",
          "typeAvion": "B737-800",
          "version": "16C135Y",
          "provenance": "ADD",
          "arrivee": "09H15",
          "destination": "ADD",
          "depart": "10H25",
          "observations": "Du 26 Oct. 25 au 28 Mars 26",
          "isCargo": false,
          "isNightStop": false
        }
      ],
      "MARDI": [...],
      "MERCREDI": [...],
      "JEUDI": [...],
      "VENDREDI": [...],
      "SAMEDI": [...],
      "DIMANCHE": [...]
    },
    "config": {
      "responsable": "ELHADJ M. SEIDNA",
      "telephone": "(+235) 66 23 51 18"
    }
  }
}
```

### 2. Telechargement PDF Direct
```
GET /api/programmes-vol/:programmeId/telecharger-pdf
```
**Response:** `application/pdf` (fichier binaire)
**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="PROGRAMME_VOLS_HIVER_2025_2026.pdf"`

### 3. PDF en Base64 (pour preview inline)
```
GET /api/programmes-vol/:programmeId/pdf-base64
```
**Response:**
```json
{
  "success": true,
  "data": {
    "base64": "JVBERi0xLjQKJeLjz9MK...",
    "mimeType": "application/pdf"
  }
}
```

---

## MISE A JOUR API SERVICE

### Fichier: `src/services/api.js`

Ajouter ces methodes dans `programmesVolAPI` (vers ligne 809):

```javascript
// ============================================
// GENERATION PDF - NOUVEAUX ENDPOINTS
// ============================================

/**
 * Obtenir l'apercu des donnees pour le PDF
 * GET /api/programmes-vol/:programmeId/export-pdf
 * @returns {Object} Donnees structurees pour affichage
 */
exportPDF: (programmeId) => api.get(`/programmes-vol/${programmeId}/export-pdf`),

/**
 * Telecharger le PDF du programme de vols
 * GET /api/programmes-vol/:programmeId/telecharger-pdf
 * @returns {Blob} Fichier PDF
 */
telechargerPDF: (programmeId) => api.get(`/programmes-vol/${programmeId}/telecharger-pdf`, {
  responseType: 'blob'
}),

/**
 * Obtenir le PDF en base64 (pour preview dans modal)
 * GET /api/programmes-vol/:programmeId/pdf-base64
 * @returns {Object} { base64: string, mimeType: string }
 */
getPDFBase64: (programmeId) => api.get(`/programmes-vol/${programmeId}/pdf-base64`),
```

---

## COMPOSANT VUE : ProgrammeVolPDF.vue

### Fichier: `src/components/flights/ProgrammeVolPDF.vue`

```vue
<template>
  <div class="programme-vol-pdf">
    <!-- Bouton de generation PDF -->
    <div class="pdf-actions">
      <button
        @click="previewPDF"
        :disabled="loading"
        class="btn-preview"
        title="Previsualiser le PDF"
      >
        <i class="fas fa-eye mr-2"></i>
        Previsualiser
      </button>

      <button
        @click="downloadPDF"
        :disabled="loading"
        class="btn-download"
        title="Telecharger le PDF"
      >
        <i class="fas fa-download mr-2"></i>
        Telecharger PDF
      </button>
    </div>

    <!-- Apercu des donnees (optionnel) -->
    <div v-if="showPreviewData && previewData" class="preview-data">
      <h4 class="preview-title">
        <i class="fas fa-plane mr-2"></i>
        {{ previewData.programme.nom }}
      </h4>
      <div class="preview-stats">
        <span class="stat">
          <i class="fas fa-calendar"></i>
          {{ formatDate(previewData.programme.dateDebut) }} - {{ formatDate(previewData.programme.dateFin) }}
        </span>
        <span class="stat">
          <i class="fas fa-plane-departure"></i>
          {{ previewData.programme.nombreVols }} vols
        </span>
        <span class="stat">
          <i class="fas fa-building"></i>
          {{ previewData.programme.compagnies.join(', ') }}
        </span>
      </div>

      <!-- Resume par jour -->
      <div class="jours-resume">
        <div
          v-for="(vols, jour) in previewData.volsParJour"
          :key="jour"
          class="jour-item"
          :class="{ 'has-vols': vols.length > 0 }"
        >
          <span class="jour-nom">{{ jour.slice(0, 3) }}</span>
          <span class="jour-count">{{ vols.length }}</span>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <LoadingOverlay
      :visible="loading"
      :message="loadingMessage"
    />

    <!-- Modal PDF -->
    <PDFViewModal
      :visible="showPDFModal"
      :pdfUrl="pdfBlobUrl"
      :title="`Programme ${programmeNom}`"
      @close="closePDFModal"
      @download="downloadPDF"
    />
  </div>
</template>

<script>
import { programmesVolAPI } from '@/services/api'
import PDFViewModal from '@/components/Common/PDFViewModal.vue'
import LoadingOverlay from '@/components/Common/LoadingOverlay.vue'

export default {
  name: 'ProgrammeVolPDF',

  components: {
    PDFViewModal,
    LoadingOverlay
  },

  props: {
    programmeId: {
      type: String,
      required: true
    },
    programmeNom: {
      type: String,
      default: 'Programme de Vols'
    },
    showPreviewData: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      loading: false,
      loadingMessage: '',
      previewData: null,
      showPDFModal: false,
      pdfBlobUrl: null
    }
  },

  mounted() {
    if (this.showPreviewData) {
      this.loadPreviewData()
    }
  },

  beforeUnmount() {
    // Nettoyer les blob URLs
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl)
    }
  },

  methods: {
    /**
     * Charger les donnees d'apercu
     */
    async loadPreviewData() {
      try {
        this.loading = true
        this.loadingMessage = 'Chargement des donnees...'

        const response = await programmesVolAPI.exportPDF(this.programmeId)
        this.previewData = response.data.data

      } catch (error) {
        console.error('[ProgrammeVolPDF] Erreur chargement apercu:', error)
        this.$toast?.error('Erreur lors du chargement des donnees')
      } finally {
        this.loading = false
      }
    },

    /**
     * Previsualiser le PDF dans un modal
     */
    async previewPDF() {
      try {
        this.loading = true
        this.loadingMessage = 'Generation du PDF...'

        // Methode 1: Utiliser base64
        const response = await programmesVolAPI.getPDFBase64(this.programmeId)
        const { base64, mimeType } = response.data.data

        // Convertir base64 en blob URL
        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mimeType })

        // Revoquer l'ancienne URL si existante
        if (this.pdfBlobUrl) {
          URL.revokeObjectURL(this.pdfBlobUrl)
        }

        this.pdfBlobUrl = URL.createObjectURL(blob)
        this.showPDFModal = true

      } catch (error) {
        console.error('[ProgrammeVolPDF] Erreur preview:', error)
        this.$toast?.error('Erreur lors de la generation du PDF')
      } finally {
        this.loading = false
      }
    },

    /**
     * Telecharger le PDF directement
     */
    async downloadPDF() {
      try {
        this.loading = true
        this.loadingMessage = 'Telechargement en cours...'

        const response = await programmesVolAPI.telechargerPDF(this.programmeId)

        // Creer un lien de telechargement
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `PROGRAMME_VOLS_${this.programmeNom.replace(/\s+/g, '_')}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)

        this.$toast?.success('PDF telecharge avec succes')

      } catch (error) {
        console.error('[ProgrammeVolPDF] Erreur telechargement:', error)
        this.$toast?.error('Erreur lors du telechargement')
      } finally {
        this.loading = false
      }
    },

    /**
     * Fermer le modal PDF
     */
    closePDFModal() {
      this.showPDFModal = false
    },

    /**
     * Formater une date
     */
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.programme-vol-pdf {
  position: relative;
}

.pdf-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.btn-preview,
.btn-download {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview {
  background-color: #374151;
  color: #e5e7eb;
  border: 1px solid #4b5563;
}

.btn-preview:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-download {
  background-color: #2563eb;
  color: white;
  border: none;
}

.btn-download:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-preview:disabled,
.btn-download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Preview data */
.preview-data {
  background-color: #1f2937;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
}

.preview-title {
  color: #60a5fa;
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
}

.preview-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.stat i {
  color: #6b7280;
}

/* Jours resume */
.jours-resume {
  display: flex;
  gap: 0.5rem;
}

.jour-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: #374151;
  min-width: 50px;
}

.jour-item.has-vols {
  background-color: #1e40af;
}

.jour-nom {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
}

.jour-item.has-vols .jour-nom {
  color: #93c5fd;
}

.jour-count {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e5e7eb;
}

/* Responsive */
@media (max-width: 640px) {
  .pdf-actions {
    flex-direction: column;
  }

  .jours-resume {
    flex-wrap: wrap;
  }
}
</style>
```

---

## INTEGRATION DANS LA VUE EXISTANTE

### Option A: Page liste des programmes

Dans `src/views/Flights/ProgrammesVol.vue` (ou equivalent), ajouter le bouton PDF:

```vue
<template>
  <!-- ... code existant ... -->

  <!-- Dans chaque carte/ligne de programme -->
  <div class="programme-actions">
    <!-- Boutons existants -->
    <button @click="editProgramme(programme)">Modifier</button>

    <!-- NOUVEAU: Bouton PDF -->
    <button
      @click="openPDFModal(programme)"
      class="btn-pdf"
      title="Generer PDF"
    >
      <i class="fas fa-file-pdf"></i>
      PDF
    </button>
  </div>

  <!-- NOUVEAU: Composant PDF -->
  <ProgrammeVolPDF
    v-if="selectedProgrammeForPDF"
    :programme-id="selectedProgrammeForPDF._id"
    :programme-nom="selectedProgrammeForPDF.nom"
    :show-preview-data="true"
  />
</template>

<script>
import ProgrammeVolPDF from '@/components/flights/ProgrammeVolPDF.vue'

export default {
  components: {
    ProgrammeVolPDF
  },

  data() {
    return {
      selectedProgrammeForPDF: null
    }
  },

  methods: {
    openPDFModal(programme) {
      this.selectedProgrammeForPDF = programme
    }
  }
}
</script>
```

### Option B: Page detail d'un programme

Dans la page de detail d'un programme specifique:

```vue
<template>
  <div class="programme-detail">
    <header class="programme-header">
      <h1>{{ programme.nom }}</h1>

      <!-- Actions PDF -->
      <div class="header-actions">
        <ProgrammeVolPDF
          :programme-id="programme._id"
          :programme-nom="programme.nom"
        />
      </div>
    </header>

    <!-- ... reste du contenu ... -->
  </div>
</template>
```

---

## WORKFLOW UX

### Scenario 1: Telechargement rapide
1. Utilisateur clique sur "Telecharger PDF"
2. Loading spinner s'affiche
3. PDF se telecharge automatiquement
4. Toast de confirmation

### Scenario 2: Preview avant telechargement
1. Utilisateur clique sur "Previsualiser"
2. Loading spinner s'affiche
3. Modal `PDFViewModal` s'ouvre avec le PDF
4. Utilisateur peut:
   - Passer en plein ecran
   - Telecharger depuis le modal
   - Fermer le modal

### Scenario 3: Affichage apercu + actions
1. Composant charge les donnees d'apercu automatiquement
2. Affiche resume: nom, dates, nombre vols, compagnies
3. Affiche vols par jour (badges colores)
4. Boutons Preview/Download disponibles

---

## TESTS A EFFECTUER

### Tests unitaires
```javascript
// tests/components/ProgrammeVolPDF.spec.js

import { mount } from '@vue/test-utils'
import ProgrammeVolPDF from '@/components/flights/ProgrammeVolPDF.vue'

describe('ProgrammeVolPDF', () => {
  it('affiche les boutons preview et download', () => {
    const wrapper = mount(ProgrammeVolPDF, {
      props: {
        programmeId: '123',
        programmeNom: 'TEST'
      }
    })

    expect(wrapper.find('.btn-preview').exists()).toBe(true)
    expect(wrapper.find('.btn-download').exists()).toBe(true)
  })

  it('desactive les boutons pendant le loading', async () => {
    const wrapper = mount(ProgrammeVolPDF, {
      props: { programmeId: '123' }
    })

    await wrapper.setData({ loading: true })

    expect(wrapper.find('.btn-preview').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.btn-download').attributes('disabled')).toBeDefined()
  })
})
```

### Tests manuels
1. [ ] Verifier que le bouton PDF apparait sur chaque programme
2. [ ] Tester le telechargement - fichier PDF valide
3. [ ] Tester la preview - modal s'ouvre correctement
4. [ ] Tester le plein ecran dans le modal
5. [ ] Verifier le contenu du PDF (structure, donnees, mise en page)
6. [ ] Tester sur mobile (responsive)
7. [ ] Tester avec un programme sans vols
8. [ ] Tester avec un programme avec beaucoup de vols

---

## CHECKLIST NON-REGRESSION

- [ ] Les routes existantes de `programmesVolAPI` fonctionnent toujours
- [ ] Le composant `PDFViewModal` n'est pas modifie
- [ ] Les styles existants ne sont pas impactes
- [ ] La navigation entre pages fonctionne
- [ ] Les autres fonctionnalites CRV ne sont pas impactees
- [ ] Les permissions/roles sont respectes

---

## DONNEES DE TEST

Programme disponible en base:
- **ID**: `6965fc1071bf4fc9b9470036`
- **Nom**: `HIVER_2024_2025`
- **Vols**: 20

Pour tester:
```javascript
// Dans la console navigateur
import { programmesVolAPI } from '@/services/api'

// Test apercu
const apercu = await programmesVolAPI.exportPDF('6965fc1071bf4fc9b9470036')
console.log(apercu.data)

// Test base64
const pdf = await programmesVolAPI.getPDFBase64('6965fc1071bf4fc9b9470036')
console.log(pdf.data.data.base64.substring(0, 50) + '...')
```

---

## RESUME

| Element | Action | Priorite |
|---------|--------|----------|
| `api.js` | Ajouter 3 methodes PDF | HAUTE |
| `ProgrammeVolPDF.vue` | Creer composant | HAUTE |
| Vue liste programmes | Integrer bouton PDF | MOYENNE |
| Vue detail programme | Integrer composant | MOYENNE |
| Tests | Ecrire tests unitaires | BASSE |

**Temps estime**: 2-4h pour integration complete

**Contact Backend**: Les endpoints sont operationnels et testes. PDF genere en ~600ms.
