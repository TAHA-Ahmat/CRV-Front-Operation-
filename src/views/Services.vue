<template>
  <div class="services-container">
    <!-- Pas de header local - AppHeader global dans App.vue -->

    <main class="services-main">
      <div class="container">
        <!-- Titre de bienvenue -->
        <div class="welcome-section">
          <h1>Bienvenue, {{ userName }}</h1>
          <p class="subtitle">{{ roleSubtitle }}</p>
        </div>

        <!-- Grille des cartes adaptatives selon le rôle -->
        <div class="services-grid">
          <div
            v-for="card in visibleCards"
            :key="card.path"
            class="service-card"
            :class="card.accent ? `accent-${card.accent}` : ''"
            @click="goTo(card.path)"
          >
            <div class="service-icon">{{ card.icon }}</div>
            <div class="service-content">
              <h2>{{ card.title }}</h2>
              <p>{{ card.description }}</p>
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
import { ROLES } from '@/config/roles'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => {
  const user = authStore.currentUser
  if (user?.prenom) return user.prenom
  if (user?.name) return user.name
  if (user?.email) return user.email.split('@')[0]
  return 'Utilisateur'
})

const currentRole = computed(() => authStore.currentUser?.role || authStore.currentUser?.fonction || null)

const roleSubtitle = computed(() => {
  switch (currentRole.value) {
    case ROLES.MANAGER:
      return 'Pilotage opérationnel et supervision globale'
    case ROLES.SUPERVISEUR:
      return 'Supervision et validation des opérations'
    case ROLES.CHEF_EQUIPE:
      return 'Coordination d\'équipe et opérations CRV'
    case ROLES.AGENT_ESCALE:
      return 'Accédez rapidement à vos services'
    case ROLES.QUALITE:
      return 'Consultation et analyse qualité (lecture seule)'
    case ROLES.ADMIN:
      return 'Administration système et gestion des comptes'
    default:
      return 'Accédez rapidement à vos services'
  }
})

// Cartes adaptatives selon le rôle
// Chaque carte : { icon, title, description, path, accent? }
// accent : 'primary' (bleu), 'orange', 'success' (vert)
const visibleCards = computed(() => {
  const role = currentRole.value

  if (role === ROLES.AGENT_ESCALE) {
    return [
      { icon: '✈️', title: 'Nouveau CRV', description: 'Créer un compte rendu de vol (Arrivée, Départ, Turn Around)', path: '/crv/nouveau', accent: 'primary' },
      { icon: '📋', title: 'Mes CRV', description: 'Consulter et modifier les comptes rendus existants', path: '/crv/liste' },
      { icon: '📆', title: 'Bulletins', description: 'Planifier les mouvements de vols sur 3-4 jours', path: '/bulletins' },
      { icon: '📅', title: 'Programmes', description: 'Gérer les programmes saisonniers et les vols associés', path: '/programmes-vol' }
    ]
  }

  if (role === ROLES.CHEF_EQUIPE) {
    return [
      { icon: '✈️', title: 'Nouveau CRV', description: 'Créer un compte rendu de vol (Arrivée, Départ, Turn Around)', path: '/crv/nouveau', accent: 'primary' },
      { icon: '📋', title: 'Mes CRV', description: 'Consulter et modifier les comptes rendus existants', path: '/crv/liste' },
      { icon: '👥', title: 'Équipe', description: 'Vue d\'équipe et agrégats SLA par agent', path: '/dashboard-chef' },
      { icon: '📆', title: 'Bulletins', description: 'Planifier les mouvements de vols sur 3-4 jours', path: '/bulletins' },
      { icon: '📅', title: 'Programmes', description: 'Gérer les programmes saisonniers et les vols associés', path: '/programmes-vol' }
    ]
  }

  if (role === ROLES.SUPERVISEUR) {
    return [
      { icon: '📊', title: 'OPS Control Center', description: 'Tableau opérationnel temps réel (SLA, vols, anomalies)', path: '/ops', accent: 'primary' },
      { icon: '✅', title: 'CRV à valider', description: 'Valider les comptes rendus terminés par les agents', path: '/validation', accent: 'success' },
      { icon: '👥', title: 'Équipe', description: 'Vue d\'équipe et agrégats SLA par agent', path: '/dashboard-chef' },
      { icon: '📈', title: 'Statistiques', description: 'Indicateurs et analyses de performance', path: '/statistiques' },
      { icon: '✈️', title: 'Référentiel Avions', description: 'Flotte et configuration des appareils', path: '/avions' },
      { icon: '📋', title: 'Consulter CRV', description: 'Accéder à tous les comptes rendus de vol', path: '/crv/liste' },
      { icon: '📆', title: 'Bulletins', description: 'Planification des mouvements de vols', path: '/bulletins' },
      { icon: '📅', title: 'Programmes', description: 'Programmes saisonniers et vols associés', path: '/programmes-vol' },
      { icon: '➕', title: 'Nouveau CRV', description: 'Créer un compte rendu de vol', path: '/crv/nouveau' }
    ]
  }

  if (role === ROLES.MANAGER) {
    return [
      { icon: '📊', title: 'OPS Control Center', description: 'Tableau opérationnel temps réel (SLA, vols, anomalies)', path: '/ops', accent: 'primary' },
      { icon: '✅', title: 'CRV à valider', description: 'Valider les comptes rendus terminés par les agents', path: '/validation', accent: 'success' },
      { icon: '⚙️', title: 'Configuration SLA', description: 'Paramétrer les seuils SLA métier globaux', path: '/sla-configuration', accent: 'orange' },
      { icon: '👥', title: 'Équipe', description: 'Vue d\'équipe et agrégats SLA par agent', path: '/dashboard-chef' },
      { icon: '📈', title: 'Statistiques', description: 'Indicateurs et analyses de performance', path: '/statistiques' },
      { icon: '✈️', title: 'Référentiel Avions', description: 'Flotte et configuration des appareils', path: '/avions' },
      { icon: '📋', title: 'Consulter CRV', description: 'Accéder à tous les comptes rendus de vol', path: '/crv/liste' },
      { icon: '📆', title: 'Bulletins', description: 'Planification des mouvements de vols', path: '/bulletins' },
      { icon: '📅', title: 'Programmes', description: 'Programmes saisonniers et vols associés', path: '/programmes-vol' },
      { icon: '➕', title: 'Nouveau CRV', description: 'Créer un compte rendu de vol', path: '/crv/nouveau' }
    ]
  }

  if (role === ROLES.QUALITE) {
    return [
      { icon: '📋', title: 'Consulter CRV', description: 'Accéder aux comptes rendus (lecture seule)', path: '/crv/liste', accent: 'primary' },
      { icon: '📈', title: 'Statistiques', description: 'Indicateurs et analyses qualité', path: '/statistiques' },
      { icon: '📆', title: 'Bulletins', description: 'Consulter les bulletins de mouvement', path: '/bulletins' },
      { icon: '📅', title: 'Programmes', description: 'Consulter les programmes de vol', path: '/programmes-vol' },
      { icon: '✈️', title: 'Avions', description: 'Consulter le référentiel avions', path: '/avions' }
    ]
  }

  if (role === ROLES.ADMIN) {
    return [
      { icon: '👥', title: 'Utilisateurs', description: 'Gérer les comptes et les accès', path: '/users', accent: 'primary' },
      { icon: '⚙️', title: 'Paramètres', description: 'Paramètres système généraux', path: '/settings' },
      { icon: '🔔', title: 'Règles Notifications', description: 'Configurer les règles de notification', path: '/settings/notifications' },
      { icon: '📬', title: 'Destinataires Notifs', description: 'Gérer les destinataires des notifications', path: '/settings/notification-recipients' }
    ]
  }

  // Fallback : pas de rôle reconnu → aucune carte
  return []
})

const goTo = (path) => router.push(path)
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

/* Accent primary (bleu) */
.service-card.accent-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-color: #2563eb;
}

.service-card.accent-primary .service-content h2,
.service-card.accent-primary .service-content p,
.service-card.accent-primary .service-arrow {
  color: white;
}

.service-card.accent-primary:hover {
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
}

/* Accent orange (SLA Config Manager) */
.service-card.accent-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border-color: #f97316;
}

.service-card.accent-orange .service-content h2,
.service-card.accent-orange .service-content p,
.service-card.accent-orange .service-arrow {
  color: white;
}

.service-card.accent-orange:hover {
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
}

/* Accent success (vert) */
.service-card.accent-success {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  border-color: #16a34a;
}

.service-card.accent-success .service-content h2,
.service-card.accent-success .service-content p,
.service-card.accent-success .service-arrow {
  color: white;
}

.service-card.accent-success:hover {
  box-shadow: 0 10px 30px rgba(22, 163, 74, 0.3);
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

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .services-main {
    padding: 20px 16px;
  }

  .welcome-section {
    margin-bottom: 20px;
  }

  .welcome-section h1 {
    font-size: 22px;
  }

  .welcome-section .subtitle {
    font-size: 14px;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .service-card {
    padding: 16px;
    gap: 12px;
  }

  .service-icon {
    font-size: 28px;
  }

  .service-content h2 {
    font-size: 16px;
  }

  .service-content p {
    font-size: 13px;
  }

  .service-arrow {
    font-size: 18px;
  }
}

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .services-main {
    padding: 30px 20px;
  }

  .services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .service-card {
    padding: 20px;
  }

  .welcome-section h1 {
    font-size: 26px;
  }
}

/* Desktop (1025px+) */
@media (min-width: 1025px) {
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
