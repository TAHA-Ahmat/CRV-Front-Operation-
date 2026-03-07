<template>
  <div class="completude-container" :class="{ 'completude-ok': isComplete }">
    <!-- Score global -->
    <div class="completude-header">
      <div class="completude-title">
        <span class="label">Completude</span>
        <span class="score" :class="scoreClass">{{ completude }}%</span>
      </div>
      <div class="completude-bar-global">
        <div
          class="bar-fill"
          :style="{ width: completude + '%' }"
          :class="scoreClass"
        ></div>
        <!-- MVS-2: Seuil 50% pour terminer -->
        <div class="threshold-marker threshold-terminer" style="left: 50%" title="50% - Seuil pour terminer"></div>
        <!-- Seuil 80% pour valider -->
        <div class="threshold-marker threshold-valider" style="left: 80%" title="80% - Seuil pour valider"></div>
      </div>
      <!-- MVS-2 #4: Affichage explicite des seuils -->
      <div class="threshold-labels">
        <div class="threshold-info">
          <span class="threshold-mark terminer" :class="{ 'reached': completude >= 50 }">50%</span>
          <span class="threshold-text">Terminer</span>
        </div>
        <div class="threshold-info">
          <span class="threshold-mark valider" :class="{ 'reached': completude >= 80 }">80%</span>
          <span class="threshold-text">Valider</span>
        </div>
      </div>
      <div class="threshold-label">
        <span v-if="completude < 50" class="danger">Minimum 50% requis pour terminer le CRV</span>
        <span v-else-if="completude < 80" class="warning">CRV pret a terminer. 80% requis pour validation</span>
        <span v-else class="success">Pret pour validation</span>
      </div>
    </div>

    <!-- Details par composant -->
    <div class="completude-details" v-if="showDetails">
      <!-- Phases (40%) -->
      <div class="detail-row">
        <div class="detail-label">
          <span class="icon">&#9654;</span>
          <span class="name">Phases</span>
          <span class="weight">(40%)</span>
        </div>
        <div class="detail-bar">
          <div
            class="bar-fill phases"
            :style="{ width: details.phases + '%' }"
          ></div>
        </div>
        <span class="detail-score">{{ details.phases }}%</span>
      </div>

      <!-- Charges (30%) -->
      <div class="detail-row">
        <div class="detail-label">
          <span class="icon">&#128230;</span>
          <span class="name">Charges</span>
          <span class="weight">(30%)</span>
        </div>
        <div class="detail-bar">
          <div
            class="bar-fill charges"
            :style="{ width: details.charges + '%' }"
          ></div>
        </div>
        <span class="detail-score">{{ details.charges }}%</span>
      </div>

      <!-- Evenements (20%) -->
      <div class="detail-row">
        <div class="detail-label">
          <span class="icon">&#9888;</span>
          <span class="name">Evenements</span>
          <span class="weight">(20%)</span>
        </div>
        <div class="detail-bar">
          <div
            class="bar-fill evenements"
            :style="{ width: details.evenements + '%' }"
          ></div>
        </div>
        <span class="detail-score">{{ details.evenements }}%</span>
      </div>

      <!-- Observations (10%) -->
      <div class="detail-row">
        <div class="detail-label">
          <span class="icon">&#128221;</span>
          <span class="name">Observations</span>
          <span class="weight">(10%)</span>
        </div>
        <div class="detail-bar">
          <div
            class="bar-fill observations"
            :style="{ width: details.observations + '%' }"
          ></div>
        </div>
        <span class="detail-score">{{ details.observations }}%</span>
      </div>
    </div>

    <!-- Toggle details -->
    <button
      v-if="collapsible"
      class="toggle-details"
      @click="showDetails = !showDetails"
    >
      {{ showDetails ? 'Masquer details' : 'Voir details' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCRVStore } from '@/stores/crvStore'

const props = defineProps({
  collapsible: {
    type: Boolean,
    default: true
  },
  expanded: {
    type: Boolean,
    default: false
  }
})

const crvStore = useCRVStore()
const showDetails = ref(props.expanded)

// Computed
const completude = computed(() => crvStore.completude)
const details = computed(() => crvStore.getCompletudeDetails)
const isComplete = computed(() => crvStore.isCompleteEnough)

const scoreClass = computed(() => {
  if (completude.value >= 80) return 'score-ok'
  if (completude.value >= 50) return 'score-warning'
  return 'score-danger'
})
</script>

<style scoped>
.completude-container {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.completude-container.completude-ok {
  border-color: #10b981;
  background: #f0fdf4;
}

.completude-header {
  margin-bottom: 12px;
}

.completude-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.completude-title .label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.completude-title .score {
  font-size: 24px;
  font-weight: 700;
}

.score-ok { color: #10b981; }
.score-warning { color: #f59e0b; }
.score-danger { color: #ef4444; }

.completude-bar-global {
  position: relative;
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.bar-fill.score-ok { background: #10b981; }
.bar-fill.score-warning { background: #f59e0b; }
.bar-fill.score-danger { background: #ef4444; }

.threshold-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
}

.threshold-marker.threshold-terminer {
  background: #f59e0b;
}

.threshold-marker.threshold-valider {
  background: #10b981;
}

/* MVS-2 #4: Labels des seuils */
.threshold-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 10%;
}

.threshold-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.threshold-mark {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.threshold-mark.terminer {
  background: #fef3c7;
  color: #92400e;
}

.threshold-mark.terminer.reached {
  background: #fbbf24;
  color: white;
}

.threshold-mark.valider {
  background: #d1fae5;
  color: #065f46;
}

.threshold-mark.valider.reached {
  background: #10b981;
  color: white;
}

.threshold-text {
  font-size: 10px;
  color: #6b7280;
}

.threshold-label {
  margin-top: 8px;
  font-size: 12px;
  text-align: center;
  padding: 6px 10px;
  border-radius: 6px;
}

.threshold-label .danger {
  color: #b91c1c;
  background: #fee2e2;
  display: block;
  padding: 4px 8px;
  border-radius: 4px;
}

.threshold-label .warning {
  color: #92400e;
  background: #fef3c7;
  display: block;
  padding: 4px 8px;
  border-radius: 4px;
}

.threshold-label .success {
  color: #065f46;
  background: #d1fae5;
  display: block;
  padding: 4px 8px;
  border-radius: 4px;
}

/* Details */
.completude-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.detail-label {
  width: 140px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.detail-label .icon {
  width: 18px;
  text-align: center;
}

.detail-label .name {
  color: #374151;
  font-weight: 500;
}

.detail-label .weight {
  color: #9ca3af;
  font-size: 11px;
}

.detail-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 12px;
}

.detail-bar .bar-fill.phases { background: #3b82f6; }
.detail-bar .bar-fill.charges { background: #8b5cf6; }
.detail-bar .bar-fill.evenements { background: #f59e0b; }
.detail-bar .bar-fill.observations { background: #10b981; }

.detail-score {
  width: 40px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.toggle-details {
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-details:hover {
  background: #f9fafb;
  color: #374151;
}

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .completude-container {
    padding: 12px;
  }

  .completude-title .score {
    font-size: 20px;
  }

  .threshold-labels {
    padding: 0 5%;
  }

  .threshold-info {
    gap: 1px;
  }

  .threshold-mark {
    font-size: 10px;
    padding: 2px 4px;
  }

  .threshold-text {
    font-size: 9px;
  }

  .threshold-label {
    font-size: 11px;
    padding: 4px 8px;
  }

  .detail-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .detail-label {
    width: 100%;
    font-size: 12px;
  }

  .detail-bar {
    flex: 1;
    min-width: 0;
    margin: 0 8px 0 0;
  }

  .detail-score {
    width: 36px;
    font-size: 12px;
  }

  .toggle-details {
    padding: 10px;
    font-size: 12px;
  }
}

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .completude-container {
    padding: 14px;
  }

  .detail-label {
    width: 130px;
  }
}
</style>
