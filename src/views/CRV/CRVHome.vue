<template>
  <div class="crv-home-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="btn-back">← Retour</button>
          <h1>Compte Rendu de Vol</h1>
        </div>
        <div class="user-info">
          <span>{{ authStore.currentUser?.email }}</span>
          <button @click="handleLogout" class="btn btn-secondary">
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="crv-main">
      <div class="container">
        <div class="crv-actions-bar">
          <button @click="goToList" class="btn btn-secondary btn-large">
            Voir les CRV existants
          </button>
        </div>

        <div class="crv-type-selector">
          <h2>Créer un nouveau CRV</h2>
          <p class="subtitle">Choisissez le type d'opération à documenter</p>

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
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'

const router = useRouter()
const authStore = useAuthStore()
const crvStore = useCRVStore()

const goBack = () => {
  router.push('/services')
}

const goToList = () => {
  router.push('/crv/liste')
}

const selectType = async (type) => {
  // Réinitialiser le CRV en cours
  crvStore.resetCurrentCRV()

  // Rediriger vers la page correspondante
  switch (type) {
    case 'arrivee':
      router.push('/crv/arrivee')
      break
    case 'depart':
      router.push('/crv/depart')
      break
    case 'turnaround':
      router.push('/crv/turnaround')
      break
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.crv-home-container {
  min-height: 100vh;
  background: #f9fafb;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-back {
  background: #f3f4f6;
  color: #374151;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.app-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info span {
  color: #6b7280;
  font-size: 14px;
}

.crv-main {
  padding: 40px 20px;
}

.crv-actions-bar {
  text-align: center;
  margin-bottom: 30px;
}

.btn-large {
  padding: 15px 30px;
  font-size: 16px;
}

.crv-type-selector {
  text-align: center;
  margin-bottom: 40px;
}

.crv-type-selector h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 10px;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
  margin-bottom: 40px;
}

.crv-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.crv-type-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.crv-type-card:hover {
  border-color: #2563eb;
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
  color: #1f2937;
  margin-bottom: 10px;
}

.crv-type-card p {
  color: #6b7280;
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
