/**
 * STORE AUTH - SOURCE DE VÉRITÉ UNIQUE AUTHENTIFICATION
 *
 * DOCTRINE PHASE 3 (2026-03-03) :
 * - authStore est l'UNIQUE source de vérité pour l'état d'authentification
 * - Gère : state, login, logout, refresh, persistence localStorage, normalisation
 * - Aucun autre fichier ne doit accéder directement au localStorage pour l'auth
 *   (exception : api.js intercepteurs pour injection token et cleanup 401/403)
 *
 * Utilise authAPI (5 routes)
 */

import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'
import { normalizeRole, ROLES } from '@/config/roles'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const userData = JSON.parse(localStorage.getItem('userData') || 'null')
    return {
      // Utilisateur connecté
      user: userData,

      // Token JWT
      token: localStorage.getItem('auth_token') || null,

      // Flag changement mot de passe obligatoire
      doitChangerMotDePasse: userData?.doitChangerMotDePasse || false,

      // États
      loading: false,
      error: null
    }
  },

  getters: {
    // Authentification
    isAuthenticated: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user,
    getToken: (state) => state.token,

    // Rôle
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

    // Doit changer mot de passe
    mustChangePassword: (state) => state.doitChangerMotDePasse
  },

  actions: {
    /**
     * Connexion utilisateur
     * @param {Object} credentials - { email, mot_de_passe }
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
          role: roleNormalise,
          matricule: utilisateur.matricule,
          telephone: utilisateur.telephone
        }

        // Flag changement mot de passe
        this.doitChangerMotDePasse = data.doitChangerMotDePasse ||
          utilisateur.doitChangerMotDePasse || false

        // Persistence localStorage
        localStorage.setItem('auth_token', this.token)
        localStorage.setItem('userData', JSON.stringify(this.user))

        return {
          success: true,
          doitChangerMotDePasse: this.doitChangerMotDePasse
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur de connexion'
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
        await authAPI.logout().catch(() => {})
      } finally {
        this.clearSession()
      }
    },

    /**
     * Nettoyage synchrone de la session (sans appel API)
     * Utilisé par logout() et par les composants qui doivent nettoyer
     * sans déclencher l'appel API de déconnexion
     */
    clearSession() {
      this.token = null
      this.user = null
      this.doitChangerMotDePasse = false
      this.error = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('userData')
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

        this.doitChangerMotDePasse = false
        if (this.user) {
          this.user.doitChangerMotDePasse = false
          localStorage.setItem('userData', JSON.stringify(this.user))
        }

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

    clearError() {
      this.error = null
    }
  }
})
