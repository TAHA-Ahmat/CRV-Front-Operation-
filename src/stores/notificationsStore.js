/**
 * STORE NOTIFICATIONS - GESTION DES NOTIFICATIONS
 *
 * Utilise notificationsAPI (8 routes)
 */

import { defineStore } from 'pinia'
import { notificationsAPI } from '@/services/api'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    // Liste des notifications
    notifications: [],
    notificationsTotal: 0,
    notificationsPage: 1,
    notificationsPages: 1,

    // Compteur non lues
    countNonLues: 0,

    // Statistiques
    statistiques: null,

    // États
    loading: false,
    error: null
  }),

  getters: {
    getNotifications: (state) => state.notifications,
    getNotificationsNonLues: (state) => state.notifications.filter(n => !n.lu),
    getNotificationsLues: (state) => state.notifications.filter(n => n.lu),
    getCountNonLues: (state) => state.countNonLues,
    hasNotifications: (state) => state.countNonLues > 0,

    getNotificationsByType: (state) => (type) => {
      return state.notifications.filter(n => n.type === type)
    },

    getPagination: (state) => ({
      page: state.notificationsPage,
      pages: state.notificationsPages,
      total: state.notificationsTotal
    })
  },

  actions: {
    /**
     * Charger les notifications
     * @param {Object} params - { lu?, type?, page, limit }
     */
    async loadNotifications(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await notificationsAPI.getAll(params)
        const result = response.data

        this.notifications = result.data || []
        this.notificationsTotal = result.total || 0
        this.notificationsPage = result.page || 1
        this.notificationsPages = result.pages || 1

        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger le compteur de notifications non lues
     */
    async loadCountNonLues() {
      try {
        const response = await notificationsAPI.getCountNonLues()
        this.countNonLues = response.data.count || 0
        return this.countNonLues
      } catch (error) {
        console.error('[Notifications] Erreur compteur:', error)
        return 0
      }
    },

    /**
     * Marquer toutes les notifications comme lues
     */
    async marquerToutesLues() {
      this.loading = true
      this.error = null

      try {
        await notificationsAPI.marquerToutesLues()
        // Mettre à jour localement
        this.notifications = this.notifications.map(n => ({ ...n, lu: true }))
        this.countNonLues = 0
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du marquage'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger les statistiques
     */
    async loadStatistiques() {
      try {
        const response = await notificationsAPI.getStatistiques()
        this.statistiques = response.data.statistiques || response.data
        return this.statistiques
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      }
    },

    /**
     * Créer une notification (MANAGER uniquement)
     * @param {Object} data - { destinataire, type, titre, message, reference? }
     */
    async createNotification(data) {
      this.error = null

      try {
        const response = await notificationsAPI.create(data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la création'
        throw error
      }
    },

    /**
     * Marquer une notification comme lue
     * @param {string} id - ID de la notification
     */
    async marquerLue(id) {
      try {
        await notificationsAPI.marquerLue(id)
        // Mettre à jour localement
        const index = this.notifications.findIndex(n => n._id === id)
        if (index !== -1 && !this.notifications[index].lu) {
          this.notifications[index] = { ...this.notifications[index], lu: true }
          this.countNonLues = Math.max(0, this.countNonLues - 1)
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du marquage'
        throw error
      }
    },

    /**
     * Archiver une notification
     * @param {string} id - ID de la notification
     */
    async archiverNotification(id) {
      try {
        await notificationsAPI.archiver(id)
        // Retirer de la liste
        this.notifications = this.notifications.filter(n => n._id !== id)
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'archivage'
        throw error
      }
    },

    /**
     * Supprimer une notification
     * @param {string} id - ID de la notification
     */
    async deleteNotification(id) {
      try {
        const notif = this.notifications.find(n => n._id === id)
        await notificationsAPI.delete(id)
        // Retirer de la liste et mettre à jour le compteur
        this.notifications = this.notifications.filter(n => n._id !== id)
        if (notif && !notif.lu) {
          this.countNonLues = Math.max(0, this.countNonLues - 1)
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la suppression'
        throw error
      }
    },

    /**
     * Rafraîchir les notifications (polling)
     */
    async refresh() {
      await Promise.all([
        this.loadNotifications({ limit: 20 }),
        this.loadCountNonLues()
      ])
    },

    clearError() {
      this.error = null
    }
  }
})
