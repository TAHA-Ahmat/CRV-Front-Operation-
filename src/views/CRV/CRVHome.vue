<template>
  <div class="crv-home-container">
    <!-- Pas de header local - AppHeader global dans App.vue -->

    <main class="crv-main">
      <div class="container">
        <div class="page-header">
          <h1>Nouveau CRV</h1>
          <p class="subtitle">Choisissez le type d'opération à documenter</p>
        </div>

          <div class="crv-types-grid">
            <div class="crv-type-card" @click="selectType('arrivee')">
              <div class="type-icon">✈️</div>
              <h3>CRV Arrivée</h3>
              <p>Documenter les opérations d'arrivée d'un vol</p>
              <ul class="type-features">
                <li>Déchargement</li>
                <li>Livraison bagages</li>
                <li>Pas d'enregistrement</li>
                <li>Pas d'embarquement</li>
              </ul>
            </div>

            <div class="crv-type-card" @click="selectType('depart')">
              <div class="type-icon">🛫</div>
              <h3>CRV Départ</h3>
              <p>Documenter les opérations de départ d'un vol</p>
              <ul class="type-features">
                <li>Enregistrement</li>
                <li>Embarquement</li>
                <li>Pas de déchargement</li>
                <li>Pas de livraison bagages</li>
              </ul>
            </div>

            <div class="crv-type-card" @click="selectType('turnaround')">
              <div class="type-icon">🔄</div>
              <h3>CRV Turn Around</h3>
              <p>Documenter les opérations complètes arrivée + départ</p>
              <ul class="type-features">
                <li>Arrivée complète</li>
                <li>Transition</li>
                <li>Départ complet</li>
                <li>Toutes opérations</li>
              </ul>
            </div>
          </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCRVStore } from '@/stores/crvStore'

const router = useRouter()
const crvStore = useCRVStore()

const selectType = async (type) => {
  // Réinitialiser le CRV en cours
  crvStore.resetCurrentCRV()

  // Rediriger vers la page correspondante
  const routes = {
    arrivee: '/crv/arrivee',
    depart: '/crv/depart',
    turnaround: '/crv/turnaround'
  }
  if (routes[type]) {
    router.push(routes[type])
  }
}
</script>

<style scoped>
.crv-home-container {
  min-height: calc(100vh - 64px);
  background: var(--bg-body);
}

.crv-main {
  padding: 20px 16px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.crv-types-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;
}

.crv-type-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.crv-type-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.15);
  transform: translateY(-3px);
}

.type-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.crv-type-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.crv-type-card p {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 16px;
}

.type-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.type-features li {
  color: var(--text-primary);
  font-size: 12px;
  padding: 4px 0;
  padding-left: 20px;
  position: relative;
}

.type-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #16a34a;
  font-weight: 700;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .crv-main {
    padding: 30px 20px;
  }

  .page-header {
    margin-bottom: 32px;
  }

  .page-header h1 {
    font-size: 26px;
  }

  .subtitle {
    font-size: 15px;
  }

  .crv-types-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .crv-type-card {
    padding: 24px;
  }

  .type-icon {
    font-size: 42px;
  }

  .crv-type-card h3 {
    font-size: 19px;
  }

  .crv-type-card p {
    font-size: 14px;
  }

  .type-features li {
    font-size: 13px;
    padding: 5px 0;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .crv-main {
    padding: 40px 20px;
  }

  .page-header {
    margin-bottom: 40px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .subtitle {
    font-size: 16px;
  }

  .crv-types-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }

  .crv-type-card {
    padding: 30px;
  }

  .type-icon {
    font-size: 48px;
    margin-bottom: 15px;
  }

  .crv-type-card h3 {
    font-size: 20px;
  }

  .type-features li {
    padding: 6px 0;
  }
}
</style>
