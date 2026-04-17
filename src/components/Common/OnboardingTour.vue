<template>
  <transition name="ob-fade">
    <div v-if="visible" class="onboarding-overlay" @click.self="skip" role="dialog" aria-modal="true" aria-labelledby="ob-title">
      <transition name="ob-slide" mode="out-in">
        <div :key="stepIndex" class="onboarding-modal" :class="'ob-step-' + stepIndex">
          <header class="ob-head">
            <div class="ob-progress" aria-hidden="true">
              <span
                v-for="(_, i) in steps"
                :key="i"
                class="ob-dot"
                :class="{ active: i === stepIndex, done: i < stepIndex }"
              ></span>
            </div>
            <button class="ob-close" type="button" @click="skip" aria-label="Fermer le tour">×</button>
          </header>

          <div class="ob-body">
            <div class="ob-icon" aria-hidden="true">{{ currentStep.icon }}</div>
            <h2 id="ob-title" class="ob-title">{{ currentStep.title }}</h2>
            <p class="ob-text">{{ currentStep.text }}</p>

            <!-- Étape dédiée aux couleurs SLA -->
            <div v-if="currentStep.showLegend" class="ob-legend">
              <div class="ob-legend-item">
                <SLABadge niveau="OK" :show-label="true" size="md" />
                <span class="ob-legend-desc">Dans le temps</span>
              </div>
              <div class="ob-legend-item">
                <SLABadge niveau="WARNING" :show-label="true" size="md" />
                <span class="ob-legend-desc">Attention (75%)</span>
              </div>
              <div class="ob-legend-item">
                <SLABadge niveau="CRITICAL" :show-label="true" size="md" />
                <span class="ob-legend-desc">Critique (90%)</span>
              </div>
              <div class="ob-legend-item">
                <SLABadge niveau="EXCEEDED" :show-label="true" size="md" />
                <span class="ob-legend-desc">Dépassé (&gt; 100%)</span>
              </div>
            </div>
          </div>

          <footer class="ob-foot">
            <button
              type="button"
              class="ob-btn ob-btn-ghost"
              @click="neverShowAgain"
              aria-label="Ne plus afficher ce tour"
            >
              Ne plus afficher
            </button>
            <div class="ob-foot-right">
              <button
                type="button"
                class="ob-btn ob-btn-text"
                @click="skip"
              >
                Passer
              </button>
              <button
                v-if="stepIndex > 0"
                type="button"
                class="ob-btn ob-btn-secondary"
                @click="prev"
              >
                ← Précédent
              </button>
              <button
                type="button"
                class="ob-btn ob-btn-primary"
                @click="next"
              >
                {{ isLast ? 'Terminer' : 'Suivant →' }}
              </button>
            </div>
          </footer>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
/**
 * OnboardingTour — Tour pédagogique SLA (UX-3).
 *
 * - 5 étapes maximum (bienvenue, bandeau, tâche chrono, couleurs, cause retard).
 * - État stocké dans localStorage (storageKey) pour ne s'afficher qu'une fois.
 * - Bouton "Ne plus afficher" = flag définitif ; "Passer" = fermeture session.
 * - Animation slide + fade ; désactivée si prefers-reduced-motion.
 */
import { computed, onMounted, ref } from 'vue'
import SLABadge from '@/components/Common/SLABadge.vue'

const props = defineProps({
  storageKey: { type: String, default: 'crv-onboarding-sla-vu' },
  autoOpen: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])

const steps = [
  {
    icon: '👋',
    title: 'Bienvenue sur CRV',
    text: 'Le SLA vous aide à respecter les contrats compagnies. Ce tour rapide vous montre les repères visuels à connaître.'
  },
  {
    icon: '📊',
    title: 'Bandeau SLA temps réel',
    text: 'En haut du CRV, un bandeau affiche votre état global, le chrono de l\'étape en cours, et le nombre de tâches en alerte.'
  },
  {
    icon: '⏱',
    title: 'Chaque tâche a un chrono contractuel',
    text: 'Ouvre le tableau des tâches : chaque ligne a une heure cible issue du contrat compagnie. Respecte-la et tout reste vert.'
  },
  {
    icon: '🎨',
    title: 'Lire les couleurs SLA',
    text: 'Les 4 niveaux couvrent tout le cycle d\'une tâche :',
    showLegend: true
  },
  {
    icon: '📝',
    title: 'Si tu dépasses, saisis la cause',
    text: 'Un bouton « Saisir la cause du retard » apparaît sur les tâches dépassées. La traçabilité qualité est enregistrée dans l\'observation du CRV.'
  }
]

const visible = ref(false)
const stepIndex = ref(0)

const currentStep = computed(() => steps[stepIndex.value])
const isLast = computed(() => stepIndex.value === steps.length - 1)

onMounted(() => {
  if (!props.autoOpen) return
  try {
    const seen = localStorage.getItem(props.storageKey)
    if (!seen) visible.value = true
  } catch {
    // localStorage indisponible → on ouvre quand même
    visible.value = true
  }
})

function next() {
  if (isLast.value) {
    markSeen()
    close()
  } else {
    stepIndex.value++
  }
}

function prev() {
  if (stepIndex.value > 0) stepIndex.value--
}

function skip() {
  // "Passer" : on ne marque PAS en définitif, pour laisser la chance au user
  // de le revoir plus tard. Si on veut le bloquer, il clique "Ne plus afficher".
  close()
}

function neverShowAgain() {
  markSeen()
  close()
}

function markSeen() {
  try { localStorage.setItem(props.storageKey, '1') } catch { /* ignore */ }
}

function close() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(3px);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.onboarding-modal {
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #111827);
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  width: min(100%, 520px);
  padding: 20px 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ob-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.ob-progress {
  display: flex;
  gap: 6px;
}

.ob-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color, #e5e7eb);
  transition: background 300ms;
}
.ob-dot.active { background: #2563eb; transform: scale(1.25); }
.ob-dot.done   { background: #22c55e; }

.ob-close {
  background: none;
  border: none;
  font-size: 22px;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.ob-close:hover { color: var(--text-primary, #111827); }

.ob-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  text-align: center;
  padding: 6px 0 4px;
}

.ob-icon {
  font-size: 36px;
  line-height: 1;
}

.ob-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.ob-text {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  margin: 0;
  line-height: 1.5;
}

.ob-legend {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 14px;
  width: 100%;
  margin-top: 6px;
}

.ob-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.ob-legend-desc {
  color: var(--text-secondary, #6b7280);
}

.ob-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  padding-top: 12px;
  flex-wrap: wrap;
}

.ob-foot-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ob-btn {
  padding: 8px 14px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.ob-btn-ghost {
  background: none;
  color: var(--text-tertiary, #9ca3af);
  border: 1px dashed var(--border-color, #d1d5db);
  font-weight: 500;
}
.ob-btn-ghost:hover { color: var(--text-secondary, #6b7280); }

.ob-btn-text {
  background: none;
  color: var(--text-secondary, #6b7280);
}
.ob-btn-text:hover { color: var(--text-primary, #111827); }

.ob-btn-secondary {
  background: var(--bg-body, #f3f4f6);
  color: var(--text-primary, #111827);
  border-color: var(--border-color, #e5e7eb);
}
.ob-btn-secondary:hover { background: var(--bg-card-hover, #e5e7eb); }

.ob-btn-primary {
  background: #2563eb;
  color: white;
}
.ob-btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }

/* Transitions fade + slide */
.ob-fade-enter-active, .ob-fade-leave-active {
  transition: opacity 250ms ease;
}
.ob-fade-enter-from, .ob-fade-leave-to { opacity: 0; }

.ob-slide-enter-active, .ob-slide-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.ob-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.ob-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (prefers-reduced-motion: reduce) {
  .ob-fade-enter-active, .ob-fade-leave-active,
  .ob-slide-enter-active, .ob-slide-leave-active {
    transition: none !important;
  }
  .ob-dot { transition: none !important; }
  .ob-btn-primary:hover { transform: none !important; }
}

@media (max-width: 640px) {
  .onboarding-modal { padding: 16px; }
  .ob-legend { grid-template-columns: 1fr; }
  .ob-foot { flex-direction: column; align-items: stretch; }
  .ob-foot-right { justify-content: flex-end; }
}
</style>
