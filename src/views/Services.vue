<template>
  <div class="services-container">
    <header class="app-header">
      <div class="header-content">
        <h1>Services</h1>
        <div class="user-info">
          <span>{{ authStore.currentUser?.email }}</span>
          <button @click="handleLogout" class="btn btn-secondary">
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="services-main">
      <div class="container">
        <div class="services-grid">
          <div class="service-card" @click="goToCRV">
            <div class="service-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17.5H3.5M6.5 12H2M9 6.5H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 3L12.9375 6.21875C12.7969 6.64062 12.7266 6.85156 12.6094 7.03125C12.5078 7.19063 12.3828 7.33125 12.2344 7.44531C12.0703 7.57422 11.8672 7.65625 11.4609 7.82031L8.5 9L11.4609 10.1797C11.8672 10.3438 12.0703 10.4258 12.2344 10.5547C12.3828 10.6687 12.5078 10.8094 12.6094 10.9687C12.7266 11.1484 12.7969 11.3594 12.9375 11.7812L14 15L15.0625 11.7812C15.2031 11.3594 15.2734 11.1484 15.3906 10.9687C15.4922 10.8094 15.6172 10.6687 15.7656 10.5547C15.9297 10.4258 16.1328 10.3438 16.5391 10.1797L19.5 9L16.5391 7.82031C16.1328 7.65625 15.9297 7.57422 15.7656 7.44531C15.6172 7.33125 15.4922 7.19063 15.3906 7.03125C15.2734 6.85156 15.2031 6.64062 15.0625 6.21875L14 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 17L18.4531 18.6094C18.3984 18.7656 18.3711 18.8438 18.3281 18.9062C18.2891 18.9625 18.2422 19.0078 18.1875 19.0469C18.125 19.0937 18.0469 19.1172 17.8906 19.1641L16.5 19.75L17.8906 20.3359C18.0469 20.3828 18.125 20.4063 18.1875 20.4531C18.2422 20.4922 18.2891 20.5375 18.3281 20.5938C18.3711 20.6562 18.3984 20.7344 18.4531 20.8906L19 22.5L19.5469 20.8906C19.6016 20.7344 19.6289 20.6562 19.6719 20.5938C19.7109 20.5375 19.7578 20.4922 19.8125 20.4531C19.875 20.4063 19.9531 20.3828 20.1094 20.3359L21.5 19.75L20.1094 19.1641C19.9531 19.1172 19.875 19.0937 19.8125 19.0469C19.7578 19.0078 19.7109 18.9625 19.6719 18.9062C19.6289 18.8438 19.6016 18.7656 19.5469 18.6094L19 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="service-content">
              <h2>Compte Rendu de Vol (CRV)</h2>
              <p>Créer et gérer les comptes rendus de vol</p>
            </div>
            <div class="service-arrow">→</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const goToCRV = () => {
  router.push('/crv')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.services-container {
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

.services-main {
  padding: 40px 20px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.service-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 20px;
}

.service-card:hover {
  border-color: #2563eb;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}

.service-icon {
  color: #2563eb;
  flex-shrink: 0;
}

.service-content {
  flex: 1;
}

.service-content h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 5px;
}

.service-content p {
  color: #6b7280;
  font-size: 14px;
}

.service-arrow {
  font-size: 24px;
  color: #2563eb;
  flex-shrink: 0;
}
</style>
