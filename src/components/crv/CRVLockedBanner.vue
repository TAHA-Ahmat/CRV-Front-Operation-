<template>
  <div v-if="isVisible" class="locked-banner" :class="bannerClass">
    <div class="banner-icon">
      <span v-if="isLocked">&#128274;</span>
      <span v-else-if="isAnnule">&#10060;</span>
      <span v-else-if="isValide">&#9989;</span>
    </div>
    <div class="banner-content">
      <div class="banner-title">{{ title }}</div>
      <div class="banner-message">{{ message }}</div>
    </div>
    <div v-if="showDate" class="banner-date">
      {{ formattedDate }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCRVStore } from '@/stores/crvStore'

const crvStore = useCRVStore()

// Computed
const isLocked = computed(() => crvStore.isLocked)
const isAnnule = computed(() => crvStore.crvStatus === 'ANNULE')
const isValide = computed(() => crvStore.crvStatus === 'VALIDE')
const isVisible = computed(() => isLocked.value || isAnnule.value || isValide.value)

const bannerClass = computed(() => {
  if (isLocked.value) return 'banner-locked'
  if (isAnnule.value) return 'banner-annule'
  if (isValide.value) return 'banner-valide'
  return ''
})

const title = computed(() => {
  if (isLocked.value) return 'CRV Verrouille'
  if (isAnnule.value) return 'CRV Annule'
  if (isValide.value) return 'CRV Valide'
  return ''
})

const message = computed(() => {
  if (isLocked.value) return 'Ce CRV est verrouille et ne peut plus etre modifie. Toute tentative de modification sera rejetee.'
  if (isAnnule.value) return 'Ce CRV a ete annule. Il reste consultable mais aucune modification n\'est possible.'
  if (isValide.value) return 'Ce CRV est valide. Il sera automatiquement verrouille sous peu. Consultation uniquement.'
  return ''
})

const showDate = computed(() => {
  const crv = crvStore.currentCRV
  return crv?.dateVerrouillage || crv?.dateValidation || crv?.dateAnnulation
})

const formattedDate = computed(() => {
  const crv = crvStore.currentCRV
  if (!crv) return ''

  const date = crv.dateVerrouillage || crv.dateValidation || crv.dateAnnulation
  if (!date) return ''

  try {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
})
</script>

<style scoped>
.locked-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.banner-locked {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 2px solid #ef4444;
}

.banner-annule {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px solid #6b7280;
}

.banner-valide {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
}

.banner-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
}

.banner-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.banner-locked .banner-title {
  color: #b91c1c;
}

.banner-annule .banner-title {
  color: #374151;
}

.banner-valide .banner-title {
  color: #047857;
}

.banner-message {
  font-size: 13px;
  line-height: 1.4;
}

.banner-locked .banner-message {
  color: #dc2626;
}

.banner-annule .banner-message {
  color: #4b5563;
}

.banner-valide .banner-message {
  color: #065f46;
}

.banner-date {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
}

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .locked-banner {
    flex-direction: column;
    text-align: center;
    gap: 12px;
    padding: 14px 16px;
  }

  .banner-icon {
    font-size: 24px;
  }

  .banner-title {
    font-size: 15px;
  }

  .banner-message {
    font-size: 12px;
  }

  .banner-date {
    font-size: 11px;
    padding: 4px 10px;
  }
}

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .locked-banner {
    gap: 14px;
    padding: 14px 18px;
  }

  .banner-icon {
    font-size: 26px;
  }
}
</style>
