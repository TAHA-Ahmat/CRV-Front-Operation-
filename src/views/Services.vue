<template>
  <div class="services-container">
    <!-- Pas de header local - AppHeader global dans App.vue -->

    <main class="services-main">
      <div class="container">
        <!-- Titre de bienvenue -->
        <div class="welcome-section">
          <h1>Bienvenue, {{ userName }}</h1>
          <p class="subtitle">Accédez rapidement à vos services</p>
        </div>

        <!-- Grille des services -->
        <div class="services-grid">
          <!-- Carte 1: Nouveau CRV -->
          <div class="service-card primary" @click="goToNewCRV">
            <div class="service-icon">✈️</div>
            <div class="service-content">
              <h2>Nouveau CRV</h2>
              <p>Créer un compte rendu de vol (Arrivée, Départ, Turn Around)</p>
            </div>
            <div class="service-arrow">→</div>
          </div>

          <!-- Carte 2: Mes CRV -->
          <div class="service-card" @click="goToList">
            <div class="service-icon">📋</div>
            <div class="service-content">
              <h2>Mes CRV</h2>
              <p>Consulter et modifier les comptes rendus existants</p>
            </div>
            <div class="service-arrow">→</div>
          </div>

          <!-- Carte 3: Bulletins de Mouvement -->
          <div class="service-card" @click="goToBulletins">
            <div class="service-icon">📆</div>
            <div class="service-content">
              <h2>Bulletins de Mouvement</h2>
              <p>Planifier les mouvements de vols sur 3-4 jours</p>
            </div>
            <div class="service-arrow">→</div>
          </div>

          <!-- Carte 4: Programmes Vol -->
          <div class="service-card" @click="goToProgrammes">
            <div class="service-icon">📅</div>
            <div class="service-content">
              <h2>Programmes de Vol</h2>
              <p>Gérer les programmes saisonniers et les vols associés</p>
            </div>
            <div class="service-arrow">→</div>
          </div>

          <!-- Carte 4: Archives -->
          <div class="service-card" @click="goToArchives">
            <div class="service-icon">📁</div>
            <div class="service-content">
              <h2>Archives</h2>
              <p>Accéder aux CRV archivés sur Google Drive</p>
            </div>
            <div class="service-arrow">→</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => {
  const user = authStore.currentUser
  if (user?.prenom) return user.prenom
  if (user?.name) return user.name
  if (user?.email) return user.email.split('@')[0]
  return 'Utilisateur'
})

const goToNewCRV = () => router.push('/crv/nouveau')
const goToList = () => router.push('/crv/liste')
const goToBulletins = () => router.push('/bulletins')
const goToProgrammes = () => router.push('/programmes-vol')
const goToArchives = () => router.push('/archives')
</script>

<style scoped>
.services-container {
  min-height: calc(100vh - 64px);
  background: var(--bg-body);
}

.services-main {
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.welcome-section .subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.service-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 16px;
}

.service-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}

.service-card.primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-color: #2563eb;
}

.service-card.primary .service-content h2,
.service-card.primary .service-content p,
.service-card.primary .service-arrow {
  color: white;
}

.service-card.primary:hover {
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
}

.service-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.service-content {
  flex: 1;
}

.service-content h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.service-content p {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.service-arrow {
  font-size: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
}
</style>
