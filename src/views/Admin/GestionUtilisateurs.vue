<template>
  <div class="gestion-users-container">
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="$router.push('/dashboard-manager')" class="btn-back">
            ← Retour
          </button>
          <h1>Gestion des Utilisateurs</h1>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="openCreateModal">
            + Nouvel utilisateur
          </button>
        </div>
      </div>
    </header>

    <main class="page-main">
      <!-- Filtres -->
      <div class="filters-bar card">
        <div class="filter-group">
          <label>Recherche</label>
          <input
            v-model="searchQuery"
            type="text"
            class="form-input"
            placeholder="Nom, email, matricule..."
          />
        </div>
        <div class="filter-group">
          <label>Fonction</label>
          <select v-model="filterFonction" class="form-input">
            <option value="">Toutes</option>
            <option value="AGENT_ESCALE">Agent d'escale</option>
            <option value="CHEF_EQUIPE">Chef d'équipe</option>
            <option value="SUPERVISEUR">Superviseur</option>
            <option value="MANAGER">Manager</option>
            <option value="QUALITE">Qualité</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Statut</label>
          <select v-model="filterStatut" class="form-input">
            <option value="">Tous</option>
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
            <option value="SUSPENDU">Suspendu</option>
            <option value="CONGE">En congé</option>
          </select>
        </div>
      </div>

      <!-- Liste utilisateurs -->
      <div class="users-list card">
        <div v-if="loading" class="loading-state">
          Chargement des utilisateurs...
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Fonction</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id || user._id">
              <td class="matricule">{{ user.matricule || '-' }}</td>
              <td class="nom">{{ user.nom }} {{ user.prenom }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="fonction-badge" :class="'fonction-' + user.fonction?.toLowerCase()">
                  {{ formatFonction(user.fonction) }}
                </span>
              </td>
              <td>
                <!-- MVS-1 #2: Statuts différenciés -->
                <span class="statut-badge" :class="'statut-' + user.statut?.toLowerCase()">
                  {{ formatStatut(user.statut) }}
                </span>
              </td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-secondary"
                  @click="openEditModal(user)"
                  title="Modifier"
                >
                  Modifier
                </button>
                <button
                  v-if="!isCurrentUser(user)"
                  class="btn btn-sm btn-outline"
                  @click="toggleStatut(user)"
                  :title="user.statut === 'ACTIF' ? 'Désactiver' : 'Activer'"
                >
                  {{ user.statut === 'ACTIF' ? 'Désactiver' : 'Activer' }}
                </button>
                <!-- MVS-1 #5: Bouton suppression (pas sur soi-même) -->
                <button
                  v-if="!isCurrentUser(user)"
                  class="btn btn-sm btn-danger"
                  @click="confirmDelete(user)"
                  title="Supprimer"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!loading && filteredUsers.length === 0" class="empty-state">
          Aucun utilisateur trouvé
        </div>
      </div>
    </main>

    <!-- Modal création/modification -->
    <div v-if="showUserModal" class="modal-overlay" @click.self="showUserModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur' }}</h3>
          <button class="btn-close" @click="showUserModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nom *</label>
              <input v-model="userForm.nom" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Prénom *</label>
              <input v-model="userForm.prenom" type="text" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input v-model="userForm.email" type="email" class="form-input" />
          </div>

          <div class="form-group" v-if="!editingUser">
            <label class="form-label">Mot de passe *</label>
            <input v-model="userForm.password" type="password" class="form-input" minlength="6" />
            <span class="form-hint">Minimum 6 caractères</span>
          </div>

          <!-- Modification mot de passe (optionnel en édition) -->
          <div class="form-group" v-if="editingUser">
            <label class="form-label">Nouveau mot de passe (optionnel)</label>
            <input
              v-model="userForm.newPassword"
              type="password"
              class="form-input"
              placeholder="Laisser vide pour ne pas modifier"
              minlength="6"
            />
            <span class="form-hint">Minimum 6 caractères. Laissez vide pour conserver l'actuel.</span>
          </div>

          <div class="form-group" v-if="editingUser && userForm.newPassword">
            <label class="form-label">Confirmer le mot de passe *</label>
            <input
              v-model="userForm.confirmPassword"
              type="password"
              class="form-input"
              placeholder="Confirmez le nouveau mot de passe"
            />
            <span v-if="userForm.newPassword && userForm.confirmPassword && userForm.newPassword !== userForm.confirmPassword" class="form-error">
              Les mots de passe ne correspondent pas
            </span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Fonction *</label>
              <select v-model="userForm.fonction" class="form-input">
                <option value="">-- Sélectionner --</option>
                <option value="AGENT_ESCALE">Agent d'escale</option>
                <option value="CHEF_EQUIPE">Chef d'équipe</option>
                <option value="SUPERVISEUR">Superviseur</option>
                <option value="MANAGER">Manager</option>
                <option value="QUALITE">Qualité</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div class="form-group">
              <!-- MVS-1 #4: Format matricule affiché -->
              <label class="form-label">Matricule</label>
              <input
                v-model="userForm.matricule"
                type="text"
                class="form-input"
                placeholder="Laisser vide pour auto-génération"
              />
              <span class="form-hint">
                Format auto: {{ matriculePreview }} (ex: AGE0001)
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Téléphone</label>
            <input v-model="userForm.telephone" type="tel" class="form-input" />
          </div>

          <div class="form-group" v-if="editingUser">
            <label class="form-label">Statut</label>
            <select v-model="userForm.statut" class="form-input">
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="CONGE">En congé</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showUserModal = false">Annuler</button>
          <button
            class="btn btn-primary"
            @click="saveUser"
            :disabled="!isFormValid"
          >
            {{ editingUser ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MVS-1 #5: Modal confirmation suppression avec dépendances -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content">
        <div class="modal-header modal-header-danger">
          <h3>Confirmer la suppression</h3>
          <button class="btn-close" @click="showDeleteModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="delete-warning">
            <span class="warning-icon">⚠️</span>
            <strong>ATTENTION : Cette action est irréversible</strong>
          </div>

          <p class="delete-user-info">
            Vous êtes sur le point de supprimer l'utilisateur :
            <strong>{{ userToDelete?.nom }} {{ userToDelete?.prenom }}</strong>
            ({{ userToDelete?.email }})
          </p>

          <!-- Affichage des dépendances -->
          <div v-if="loadingDependencies" class="loading-state small">
            Vérification des dépendances...
          </div>

          <div v-else-if="userDependencies" class="dependencies-warning">
            <div v-if="userDependencies.totalCRV > 0" class="dependency-item danger">
              <span class="dep-icon">📋</span>
              <span>Cet utilisateur a créé <strong>{{ userDependencies.totalCRV }}</strong> CRV</span>
            </div>
            <div v-if="userDependencies.affectations > 0" class="dependency-item warning">
              <span class="dep-icon">👥</span>
              <span>Affecté à <strong>{{ userDependencies.affectations }}</strong> équipe(s) CRV</span>
            </div>

            <div v-if="hasDependencies" class="dependency-notice">
              <strong>Conséquences de la suppression :</strong>
              <ul>
                <li v-if="userDependencies.totalCRV > 0">
                  Les CRV créés par cet utilisateur afficheront "Utilisateur supprimé"
                </li>
                <li v-if="userDependencies.affectations > 0">
                  L'utilisateur sera retiré des équipes CRV
                </li>
              </ul>
            </div>
          </div>

          <div v-if="!hasDependencies && !loadingDependencies" class="no-dependencies">
            <span class="success-icon">✓</span>
            Aucune dépendance trouvée. La suppression peut être effectuée en toute sécurité.
          </div>

          <!-- Confirmation par saisie -->
          <div class="form-group confirm-input">
            <label class="form-label">
              Pour confirmer, tapez <strong>SUPPRIMER</strong> :
            </label>
            <input
              v-model="deleteConfirmation"
              type="text"
              class="form-input"
              placeholder="SUPPRIMER"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Annuler</button>
          <button
            class="btn btn-danger"
            @click="executeDelete"
            :disabled="deleteConfirmation !== 'SUPPRIMER'"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { personnesAPI, crvAPI } from '@/services/api'

const authStore = useAuthStore()

// États
const loading = ref(false)
const users = ref([])
const searchQuery = ref('')
const filterFonction = ref('')
const filterStatut = ref('')

// Modals
const showUserModal = ref(false)
const showDeleteModal = ref(false)

// Formulaire
const editingUser = ref(null)
const userForm = ref({
  nom: '',
  prenom: '',
  email: '',
  password: '',
  fonction: '',
  matricule: '',
  telephone: '',
  statut: 'ACTIF',
  newPassword: '',
  confirmPassword: ''
})

// Suppression
const userToDelete = ref(null)
const userDependencies = ref(null)
const loadingDependencies = ref(false)
const deleteConfirmation = ref('')

// Toast
const toast = ref({ show: false, message: '', type: 'success' })

// Computed
const currentUserId = computed(() => authStore.currentUser?.id || authStore.currentUser?._id)

const filteredUsers = computed(() => {
  let result = users.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(u =>
      u.nom?.toLowerCase().includes(q) ||
      u.prenom?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.matricule?.toLowerCase().includes(q)
    )
  }

  if (filterFonction.value) {
    result = result.filter(u => u.fonction === filterFonction.value)
  }

  if (filterStatut.value) {
    result = result.filter(u => u.statut === filterStatut.value)
  }

  return result
})

const isFormValid = computed(() => {
  const f = userForm.value
  if (!f.nom || !f.prenom || !f.email || !f.fonction) return false
  if (!editingUser.value && (!f.password || f.password.length < 6)) return false
  return true
})

// MVS-1 #4: Preview du matricule auto-généré
const matriculePreview = computed(() => {
  if (userForm.value.fonction) {
    const prefix = userForm.value.fonction.substring(0, 3).toUpperCase()
    return `${prefix}XXXX`
  }
  return 'XXX0000'
})

const hasDependencies = computed(() => {
  if (!userDependencies.value) return false
  return userDependencies.value.totalCRV > 0 || userDependencies.value.affectations > 0
})

// Chargement
onMounted(async () => {
  await loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await personnesAPI.getAll()
    // Backend retourne { success, data: [...], pagination }
    users.value = response.data?.data || response.data?.personnes || []
  } catch (error) {
    console.error('[GestionUtilisateurs] Erreur chargement:', error)
    showToast('Erreur lors du chargement des utilisateurs', 'error')
  } finally {
    loading.value = false
  }
}

// Actions modals
const openCreateModal = () => {
  editingUser.value = null
  userForm.value = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    fonction: '',
    matricule: '',
    telephone: '',
    statut: 'ACTIF',
    newPassword: '',
    confirmPassword: ''
  }
  showUserModal.value = true
}

const openEditModal = (user) => {
  editingUser.value = user
  userForm.value = {
    nom: user.nom || '',
    prenom: user.prenom || '',
    email: user.email || '',
    password: '',
    fonction: user.fonction || '',
    matricule: user.matricule || '',
    telephone: user.telephone || '',
    statut: user.statut || 'ACTIF',
    newPassword: '',
    confirmPassword: ''
  }
  showUserModal.value = true
}

// CRUD
const saveUser = async () => {
  try {
    const data = { ...userForm.value }

    // Ne pas envoyer le mot de passe vide en modification
    if (editingUser.value && !data.password) {
      delete data.password
    }

    // Gestion du nouveau mot de passe en édition
    let passwordChanged = false
    if (editingUser.value && data.newPassword) {
      // Validation
      if (data.newPassword.length < 6) {
        showToast('Le mot de passe doit contenir au moins 6 caractères', 'error')
        return
      }
      if (data.newPassword !== data.confirmPassword) {
        showToast('Les mots de passe ne correspondent pas', 'error')
        return
      }
      // Envoyer le nouveau mot de passe
      data.password = data.newPassword
      passwordChanged = true
    }

    // Nettoyer les champs internes
    delete data.newPassword
    delete data.confirmPassword

    // Ne pas envoyer matricule vide (auto-génération backend)
    if (!data.matricule) {
      delete data.matricule
    }

    if (editingUser.value) {
      await personnesAPI.update(editingUser.value.id || editingUser.value._id, data)
      if (passwordChanged) {
        showToast('Utilisateur modifié et mot de passe mis à jour avec succès', 'success')
      } else {
        showToast('Utilisateur modifié avec succès', 'success')
      }
    } else {
      await personnesAPI.create(data)
      showToast('Utilisateur créé avec succès', 'success')
    }

    showUserModal.value = false
    await loadUsers()
  } catch (error) {
    console.error('[GestionUtilisateurs] Erreur sauvegarde:', error)
    showToast(error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
  }
}

const toggleStatut = async (user) => {
  const newStatut = user.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF'
  try {
    await personnesAPI.update(user.id || user._id, { statut: newStatut })
    showToast(`Utilisateur ${newStatut === 'ACTIF' ? 'activé' : 'désactivé'}`, 'success')
    await loadUsers()
  } catch (error) {
    console.error('[GestionUtilisateurs] Erreur changement statut:', error)
    showToast('Erreur lors du changement de statut', 'error')
  }
}

// MVS-1 #5: Confirmation suppression avec vérification dépendances
const confirmDelete = async (user) => {
  userToDelete.value = user
  deleteConfirmation.value = ''
  userDependencies.value = null
  showDeleteModal.value = true

  // Vérifier les dépendances
  await checkDependencies(user)
}

const checkDependencies = async (user) => {
  loadingDependencies.value = true
  try {
    // Simuler la vérification des dépendances
    // En réalité, cela devrait appeler une API backend dédiée
    // GET /api/personnes/:id/dependances
    const userId = user.id || user._id

    // Pour l'instant, on fait une recherche des CRV créés par cet utilisateur
    const crvResponse = await crvAPI.getAll({ creePar: userId, limit: 1000 })
    const crvList = crvResponse.data?.crv || crvResponse.data || []

    userDependencies.value = {
      totalCRV: crvList.filter(c => c.creePar === userId || c.creePar?._id === userId).length,
      affectations: crvList.filter(c =>
        c.equipeCRV?.some(e => e.personne === userId || e.personne?._id === userId)
      ).length
    }
  } catch (error) {
    console.warn('[GestionUtilisateurs] Erreur vérification dépendances:', error.message)
    // En cas d'erreur, on suppose qu'il y a des dépendances potentielles
    userDependencies.value = {
      totalCRV: -1, // Inconnu
      affectations: -1
    }
  } finally {
    loadingDependencies.value = false
  }
}

const executeDelete = async () => {
  if (deleteConfirmation.value !== 'SUPPRIMER') return

  try {
    const userId = userToDelete.value.id || userToDelete.value._id
    await personnesAPI.delete(userId)
    showToast('Utilisateur supprimé', 'success')
    showDeleteModal.value = false
    userToDelete.value = null
    await loadUsers()
  } catch (error) {
    console.error('[GestionUtilisateurs] Erreur suppression:', error)
    const message = error.response?.data?.message || 'Erreur lors de la suppression'
    showToast(message, 'error')
  }
}

// Utilitaires
const isCurrentUser = (user) => {
  const userId = user.id || user._id
  return userId === currentUserId.value
}

const formatFonction = (fonction) => {
  const map = {
    'AGENT_ESCALE': 'Agent',
    'CHEF_EQUIPE': 'Chef équipe',
    'SUPERVISEUR': 'Superviseur',
    'MANAGER': 'Manager',
    'QUALITE': 'Qualité',
    'ADMIN': 'Admin'
  }
  return map[fonction] || fonction
}

// MVS-1 #2: Messages statut différenciés
const formatStatut = (statut) => {
  const map = {
    'ACTIF': 'Actif',
    'INACTIF': 'Désactivé',
    'SUSPENDU': 'Suspendu',
    'CONGE': 'En congé',
    'ABSENT': 'Absent'
  }
  return map[statut] || statut
}

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}
</script>

<style scoped>
.gestion-users-container {
  min-height: 100vh;
  background: #f9fafb;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn-back {
  background: #f3f4f6;
  color: #374151;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 14px;
  border: none;
  cursor: pointer;
}

.page-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* Filtres */
.filters-bar {
  display: flex;
  gap: 20px;
  padding: 15px 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.filter-group .form-input {
  width: 200px;
}

/* Table */
.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  font-weight: 600;
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
}

.data-table td.matricule {
  font-family: monospace;
  font-weight: 600;
}

.data-table td.nom {
  font-weight: 600;
  color: #1f2937;
}

/* Badges fonction */
.fonction-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.fonction-agent_escale { background: #dbeafe; color: #1e40af; }
.fonction-chef_equipe { background: #dcfce7; color: #166534; }
.fonction-superviseur { background: #fef3c7; color: #92400e; }
.fonction-manager { background: #e0e7ff; color: #3730a3; }
.fonction-qualite { background: #f3e8ff; color: #6b21a8; }
.fonction-admin { background: #fee2e2; color: #991b1b; }

/* MVS-1 #2: Badges statut différenciés */
.statut-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.statut-actif { background: #dcfce7; color: #166534; }
.statut-inactif { background: #fee2e2; color: #991b1b; }
.statut-suspendu { background: #fef3c7; color: #92400e; }
.statut-conge { background: #dbeafe; color: #1e40af; }
.statut-absent { background: #f3f4f6; color: #6b7280; }

.actions {
  display: flex;
  gap: 8px;
}

/* Forms */
.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
}

.form-hint {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.form-error {
  display: block;
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header-danger {
  background: #fef2f2;
  border-bottom-color: #fecaca;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* MVS-1 #5: Styles suppression */
.delete-warning {
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 15px;
}

.warning-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}

.delete-user-info {
  text-align: center;
  margin-bottom: 15px;
  color: #374151;
}

.dependencies-warning {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.dependency-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.dependency-item.danger {
  color: #991b1b;
}

.dependency-item.warning {
  color: #92400e;
}

.dep-icon {
  font-size: 18px;
}

.dependency-notice {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #fcd34d;
}

.dependency-notice ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.dependency-notice li {
  font-size: 13px;
  color: #92400e;
  margin-bottom: 4px;
}

.no-dependencies {
  background: #dcfce7;
  border: 1px solid #86efac;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  color: #166534;
  margin-bottom: 15px;
}

.success-icon {
  font-size: 20px;
  margin-right: 8px;
}

.confirm-input {
  margin-top: 20px;
}

/* Boutons */
.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* États */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.loading-state.small {
  padding: 20px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  font-weight: 500;
  z-index: 2000;
}

.toast.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.toast.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
</style>
