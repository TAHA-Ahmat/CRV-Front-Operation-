/**
 * STORE AUTH - AUTHENTIFICATION ET SESSION
 *
 * Utilise authAPI (5 routes)
 * Gère : connexion, déconnexion, profil, changement mot de passe
 */

import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'
import { normalizeRole, ROLES } from '@/config/roles'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Utilisateur connecté
    user: JSON.parse(localStorage.getItem('userData') || 'null'),

    // Token JWT
    token: localStorage.getItem('auth_token') || null,

    // Flag changement mot de passe obligatoire
    doitChangerMotDePasse: false,

    // États
    loading: false,
    error: null
  }),

  getters: {
    // Authentification
    isAuthenticated: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user,
    getToken: (state) => state.token,

    // Rôle et permissions
    getUserRole: (state) => state.user?.fonction || state.user?.role || null,
    getUserId: (state) => state.user?.id || state.user?._id || null,
    getUserFullName: (state) => {
      if (!state.user) return ''
      return `${state.user.prenom || ''} ${state.user.nom || ''}`.trim()
    },

    // Vérifications de rôle
    isAdmin: (state) => state.user?.fonction === ROLES.ADMIN,
    isManager: (state) => state.user?.fonction === ROLES.MANAGER,
    isSuperviseur: (state) => state.user?.fonction === ROLES.SUPERVISEUR,
    isChefEquipe: (state) => state.user?.fonction === ROLES.CHEF_EQUIPE,
    isAgentEscale: (state) => state.user?.fonction === ROLES.AGENT_ESCALE,
    isQualite: (state) => state.user?.fonction === ROLES.QUALITE,

    // Rôles avec permissions élevées
    canManage: (state) => {
      const role = state.user?.fonction
      return [ROLES.ADMIN, ROLES.MANAGER].includes(role)
    },
    canSupervise: (state) => {
      const role = state.user?.fonction
      return [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISEUR].includes(role)
    },
    canEdit: (state) => {
      const role = state.user?.fonction
      // QUALITE ne peut pas éditer (lecture seule)
      return role && role !== ROLES.QUALITE
    },

    // Doit changer mot de passe
    mustChangePassword: (state) => state.doitChangerMotDePasse
  },

  actions: {
    /**
     * Connexion utilisateur
     * @param {Object} credentials - { email, password/motDePasse }
     */
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.login(credentials)
        const data = response.data

        if (!data || !data.token) {
          throw new Error('Réponse de connexion invalide')
        }

        // Extraire token et utilisateur
        this.token = data.token
        const utilisateur = data.utilisateur || data.user || {}

        // Normaliser le rôle
        const roleNormalise = normalizeRole(utilisateur)

        // Construire l'objet utilisateur
        this.user = {
          id: utilisateur.id || utilisateur._id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          fonction: roleNormalise,
          role: roleNormalise, // Alias
          matricule: utilisateur.matricule,
          telephone: utilisateur.telephone
        }

        // Flag changement mot de passe
        this.doitChangerMotDePasse = data.doitChangerMotDePasse ||
          utilisateur.doitChangerMotDePasse || false

        // Stockage local
        localStorage.setItem('auth_token', this.token)
        localStorage.setItem('userData', JSON.stringify(this.user))

        console.log('[Auth] Connexion réussie:', {
          email: this.user.email,
          fonction: this.user.fonction
        })

        return {
          success: true,
          doitChangerMotDePasse: this.doitChangerMotDePasse
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur de connexion'
        console.error('[Auth] Erreur connexion:', this.error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Déconnexion utilisateur
     */
    async logout() {
      try {
        // Informer le backend (ignorer les erreurs)
        await authAPI.logout().catch(() => {})
      } finally {
        // TOUJOURS nettoyer localement
        this.token = null
        this.user = null
        this.doitChangerMotDePasse = false
        localStorage.removeItem('auth_token')
        localStorage.removeItem('userData')
        console.log('[Auth] Déconnexion effectuée')
      }
    },

    /**
     * Récupérer le profil utilisateur (refresh)
     */
    async fetchUser() {
      if (!this.token) return null

      this.loading = true

      try {
        const response = await authAPI.me()
        const utilisateur = response.data.utilisateur || response.data

        // Mettre à jour l'utilisateur
        const roleNormalise = normalizeRole(utilisateur)
        this.user = {
          id: utilisateur.id || utilisateur._id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          fonction: roleNormalise,
          role: roleNormalise,
          matricule: utilisateur.matricule,
          telephone: utilisateur.telephone
        }

        localStorage.setItem('userData', JSON.stringify(this.user))
        return this.user
      } catch (error) {
        console.error('[Auth] Erreur récupération profil:', error)
        // Si 401, déconnecter
        if (error.response?.status === 401) {
          await this.logout()
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Changer le mot de passe
     * @param {Object} data - { ancienMotDePasse, nouveauMotDePasse }
     */
    async changerMotDePasse(data) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.changerMotDePasse(data)

        // Réinitialiser le flag
        this.doitChangerMotDePasse = false
        if (this.user) {
          this.user.doitChangerMotDePasse = false
          localStorage.setItem('userData', JSON.stringify(this.user))
        }

        console.log('[Auth] Mot de passe changé avec succès')
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du changement de mot de passe'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     * @param {string|Array} roles - Rôle(s) à vérifier
     */
    hasRole(roles) {
      if (!this.user?.fonction) return false

      if (Array.isArray(roles)) {
        return roles.includes(this.user.fonction)
      }
      return this.user.fonction === roles
    },

    /**
     * Initialiser depuis le stockage local (au démarrage)
     */
    initFromStorage() {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('userData')

      if (token && userData) {
        try {
          this.token = token
          this.user = JSON.parse(userData)
          this.doitChangerMotDePasse = this.user?.doitChangerMotDePasse || false
        } catch {
          this.logout()
        }
      }
    },

    clearError() {
      this.error = null
    }
  }
})
