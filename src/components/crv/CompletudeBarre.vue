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
        <div class="threshold-marker" style="left: 80%"></div>
      </div>
      <div class="threshold-label">
        <span v-if="completude < 80" class="warning">Minimum 80% requis pour valider</span>
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
  background: #374151;
}

.threshold-label {
  margin-top: 6px;
  font-size: 12px;
  text-align: right;
}

.threshold-label .warning { color: #f59e0b; }
.threshold-label .success { color: #10b981; }

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
</style>
