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
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}

.crv-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.crv-type-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.crv-type-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.15);
  transform: translateY(-5px);
}

.type-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.crv-type-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.crv-type-card p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}

.type-features {
  list-style: none;
  padding: 0;
}

.type-features li {
  color: #374151;
  font-size: 13px;
  padding: 6px 0;
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
</style>
