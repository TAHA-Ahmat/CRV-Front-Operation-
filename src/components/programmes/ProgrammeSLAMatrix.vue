<template>
  <div class="programme-sla-matrix">
    <div class="sla-matrix-header">
      <h3 class="sla-matrix-title">SLA applicables</h3>
      <p class="sla-matrix-sub">
        Grille prévisionnelle : SLA qui seront appliqués aux CRV générés pour ce programme.
      </p>
      <div v-if="loading" class="sla-matrix-loading">Chargement…</div>
      <div v-else-if="error" class="sla-matrix-error">{{ error }}</div>
    </div>

    <div v-if="!loading && rows.length === 0 && !error" class="sla-matrix-empty">
      Aucune compagnie dans ce programme.
    </div>

    <div v-else-if="!loading && rows.length > 0" class="sla-matrix-table-wrap">
      <table class="sla-matrix-table">
        <thead>
          <tr>
            <th>Compagnie</th>
            <th>Check-in</th>
            <th>Briefing</th>
            <th>Boarding</th>
            <th>Bagages</th>
            <th>Ramp</th>
            <th>Messages</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.codeIATA">
            <td class="cell-cie">
              <span class="cie-iata">{{ row.codeIATA }}</span>
              <span class="cie-nom">{{ row.nom }}</span>
              <span v-if="row.source === 'standard'" class="cie-badge cie-badge-standard">Standard</span>
              <span v-else class="cie-badge cie-badge-contrat">Contrat</span>
            </td>
            <td class="cell-sla">
              <div class="sla-line">Ouv. : <strong>{{ row.checkin.ouverture }}min</strong></div>
              <div class="sla-line">Ferm. : <strong>{{ row.checkin.fermeture }}min</strong></div>
            </td>
            <td class="cell-sla">
              <template v-if="row.briefing && (row.briefing.duree != null)">
                <div class="sla-line">Durée : <strong>{{ row.briefing.duree }}min</strong></div>
              </template>
              <template v-else>
                <div class="sla-line muted">Standard</div>
              </template>
            </td>
            <td class="cell-sla">
              <div class="sla-line">Début : <strong>-{{ row.boarding.debut }}min ETD</strong></div>
              <div class="sla-line">Gate : <strong>-{{ row.boarding.fermetureGate }}min ETD</strong></div>
            </td>
            <td class="cell-sla">
              <div class="sla-line">1er bag. : <strong>{{ row.bagages.premierBagage }}min</strong></div>
              <div class="sla-line">Dern. bag. : <strong>{{ row.bagages.dernierBagage }}min</strong></div>
            </td>
            <td class="cell-sla">
              <template v-if="row.ramp.turnaroundNarrow != null || row.ramp.turnaroundWide != null">
                <div v-if="row.ramp.turnaroundNarrow != null" class="sla-line">
                  Narrow : <strong>{{ row.ramp.turnaroundNarrow }}min</strong>
                </div>
                <div v-if="row.ramp.turnaroundWide != null" class="sla-line">
                  Wide : <strong>{{ row.ramp.turnaroundWide }}min</strong>
                </div>
                <div v-if="row.ramp.turnaround != null && row.ramp.turnaroundNarrow == null && row.ramp.turnaroundWide == null" class="sla-line">
                  T.A. : <strong>{{ row.ramp.turnaround }}min</strong>
                </div>
              </template>
              <template v-else-if="row.ramp.turnaround != null">
                <div class="sla-line">T.A. : <strong>{{ row.ramp.turnaround }}min</strong></div>
              </template>
              <template v-else>
                <div class="sla-line muted">Standard</div>
              </template>
            </td>
            <td class="cell-sla">
              <div v-if="row.messages && row.messages.count > 0" class="sla-line">
                {{ row.messages.count }} flux configurés
              </div>
              <div v-else class="sla-line muted">Standard</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
/**
 * ProgrammeSLAMatrix — Grille SLA prévisionnelle pour un programme de vols.
 *
 * Pour chaque compagnie présente dans le programme, affiche les SLA
 * qui seront appliqués aux CRV générés (lecture seule).
 * Fallback "Standard" si pas de config compagnie.
 *
 * Props :
 * - compagnies : string[] de codes IATA (ex: ['AF', 'RK'])
 *
 * Utilise :
 * - GET /api/sla/configuration (defaults)
 * - GET /api/sla/compagnies (liste complète)
 * Batchés en un seul appel chacun au load (pas de N+1).
 */
import { ref, watch, onMounted } from 'vue'
import { slaAPI } from '@/services/api'

const props = defineProps({
  compagnies: { type: Array, default: () => [] }
})

const rows = ref([])
const loading = ref(false)
const error = ref('')

// Defaults front (miroir useSLA)
const DEFAULTS = {
  checkin: { ouverture: 120, fermeture: 45 },
  boarding: { debut: 40, fermetureGate: 15 },
  bagages: { premierBagage: 25, dernierBagage: 40 },
  ramp: { turnaround: 60 }
}

async function loadMatrix() {
  if (!props.compagnies || props.compagnies.length === 0) {
    rows.value = []
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [configRes, compRes] = await Promise.all([
      slaAPI.getConfiguration(),
      slaAPI.getCompagnies()
    ])

    const defaults = configRes?.data?.data?.defaults || {}
    const compagniesCfg = compRes?.data?.data || []
    const map = new Map()
    for (const c of compagniesCfg) {
      if (c.codeIATA) map.set(c.codeIATA.toUpperCase(), c)
    }

    const list = [...new Set(props.compagnies.map(c => (c || '').toUpperCase()))]
      .filter(Boolean)
    rows.value = list.map(iata => buildRow(iata, map.get(iata), defaults))
  } catch (err) {
    console.warn('[ProgrammeSLAMatrix] erreur chargement SLA:', err.message)
    error.value = 'Impossible de charger la grille SLA.'
    // Tomber en fallback complet
    rows.value = [...new Set(props.compagnies.map(c => (c || '').toUpperCase()))]
      .filter(Boolean)
      .map(iata => buildRow(iata, null, {}))
  } finally {
    loading.value = false
  }
}

function buildRow(iata, cfg, defaults) {
  const hasContrat = !!cfg
  const nom = cfg?.compagnieNom || iata
  const checkinDef = defaults?.checkin || DEFAULTS.checkin
  const boardingDef = defaults?.boarding || DEFAULTS.boarding
  const bagagesDef = defaults?.bagages || DEFAULTS.bagages
  const rampDef = defaults?.ramp || DEFAULTS.ramp

  // messages count (flux SLAConfig.messages si présent)
  let messagesCount = 0
  if (cfg?.messages) {
    // peut être un objet ou un Map ; compter les entrées non vides
    try {
      if (cfg.messages instanceof Map) {
        messagesCount = cfg.messages.size
      } else if (typeof cfg.messages === 'object') {
        messagesCount = Object.keys(cfg.messages).length
      }
    } catch { /* ignore */ }
  }

  // briefing duree : cfg.briefing?.duree ou fallback defaults
  const briefingDuree = cfg?.briefing?.duree ?? defaults?.briefing?.duree ?? null

  return {
    codeIATA: iata,
    nom,
    source: hasContrat ? 'contrat' : 'standard',
    checkin: {
      ouverture: cfg?.checkin?.ouverture ?? checkinDef.ouverture,
      fermeture: cfg?.checkin?.fermeture ?? checkinDef.fermeture
    },
    briefing: { duree: briefingDuree },
    boarding: {
      debut: cfg?.boarding?.debut ?? boardingDef.debut,
      fermetureGate: cfg?.boarding?.fermetureGate ?? boardingDef.fermetureGate
    },
    bagages: {
      premierBagage: cfg?.bagages?.premierBagage ?? bagagesDef.premierBagage,
      dernierBagage: cfg?.bagages?.dernierBagage ?? bagagesDef.dernierBagage
    },
    ramp: {
      turnaround: cfg?.ramp?.turnaround ?? rampDef.turnaround,
      turnaroundNarrow: cfg?.ramp?.turnaroundNarrow ?? null,
      turnaroundWide: cfg?.ramp?.turnaroundWide ?? null
    },
    messages: { count: messagesCount }
  }
}

onMounted(loadMatrix)
watch(() => props.compagnies, loadMatrix, { deep: true })
</script>

<style scoped>
.programme-sla-matrix {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 16px 20px;
  margin: 20px 0;
  box-shadow: var(--shadow, 0 1px 3px rgba(0,0,0,0.05));
}

.sla-matrix-header {
  margin-bottom: 12px;
}

.sla-matrix-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
}

.sla-matrix-sub {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.sla-matrix-loading,
.sla-matrix-error,
.sla-matrix-empty {
  padding: 16px;
  text-align: center;
  color: var(--text-secondary, #6b7280);
  font-style: italic;
  font-size: 13px;
}

.sla-matrix-error {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.06);
  border-radius: 6px;
}

.sla-matrix-table-wrap {
  overflow-x: auto;
}

.sla-matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 720px;
}

.sla-matrix-table thead th {
  background: var(--bg-table-header, #f9fafb);
  color: var(--text-secondary, #6b7280);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 8px 10px;
  text-align: left;
  border-bottom: 2px solid var(--border-color, #e5e7eb);
  white-space: nowrap;
}

.sla-matrix-table tbody td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  vertical-align: top;
}

.sla-matrix-table tbody tr:hover {
  background: var(--bg-table-row-hover, #f9fafb);
}

.cell-cie {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 130px;
}

.cie-iata {
  font-weight: 700;
  font-size: 14px;
  color: var(--text-primary, #1f2937);
  font-family: 'JetBrains Mono', monospace;
}

.cie-nom {
  font-size: 11px;
  color: var(--text-secondary, #6b7280);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
}

.cie-badge {
  display: inline-block;
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  width: fit-content;
}

.cie-badge-contrat { background: rgba(37, 99, 235, 0.12); color: #1d4ed8; }
.cie-badge-standard { background: rgba(156, 163, 175, 0.2); color: #6b7280; }

.cell-sla {
  min-width: 130px;
}

.sla-line {
  font-size: 12px;
  color: var(--text-primary, #1f2937);
  line-height: 1.5;
}

.sla-line strong {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--color-primary, #2563eb);
}

.sla-line.muted {
  color: var(--text-tertiary, #9ca3af);
  font-style: italic;
}

@media (max-width: 640px) {
  .programme-sla-matrix {
    padding: 12px 10px;
  }
  .sla-matrix-table { font-size: 11px; }
}
</style>
