/**
 * STORE NOTIFICATION RECIPIENTS — Gestion admin des contacts email/WhatsApp
 *
 * MODULE NOTIFICATION ENGINE v1.0.0
 * Permet à l'admin de configurer les destinataires par rôle.
 */

import { defineStore } from 'pinia'
import { notificationRecipientsAPI } from '@/services/api'

export const useNotificationRecipientsStore = defineStore('notificationRecipients', {
  state: () => ({
    // 6 documents (1 par rôle)
    recipients: [],

    // Rôle sélectionné pour édition
    selectedRole: null,
    selectedRecipient: null,

    // États
    loading: false,
    saving: false,
    error: null
  }),

  getters: {
    /**
     * Recipients indexés par rôle
     */
    byRole: (state) => {
      const map = {}
      for (const r of state.recipients) {
        map[r.role] = r
      }
      return map
    },

    /**
     * Nombre total d'emails configurés
     */
    totalEmails: (state) => {
      return state.recipients.reduce((sum, r) => sum + (r.emails?.length || 0), 0)
    },

    /**
     * Nombre total de contacts WhatsApp configurés
     */
    totalWhatsapps: (state) => {
      return state.recipients.reduce((sum, r) => sum + (r.whatsapps?.length || 0), 0)
    }
  },

  actions: {
    /**
     * Charge tous les recipients
     */
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const response = await notificationRecipientsAPI.getAll()
        this.recipients = response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur chargement recipients'
        console.error('[RecipientsStore] fetchAll:', this.error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Sélectionne un rôle pour édition
     */
    selectRole(role) {
      this.selectedRole = role
      this.selectedRecipient = this.byRole[role] || null
    },

    /**
     * Ajoute un contact email à un rôle
     */
    async addEmail(role, contact) {
      this.saving = true
      try {
        const response = await notificationRecipientsAPI.addEmail(role, contact)
        this._updateRecipient(role, response.data.data)
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur ajout email'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Supprime un contact email
     */
    async removeEmail(role, emailId) {
      this.saving = true
      try {
        const response = await notificationRecipientsAPI.removeEmail(role, emailId)
        this._updateRecipient(role, response.data.data)
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur suppression email'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Active/Désactive un contact email
     */
    async toggleEmail(role, emailId, actif) {
      this.saving = true
      try {
        const response = await notificationRecipientsAPI.toggleEmail(role, emailId, actif)
        this._updateRecipient(role, response.data.data)
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur toggle email'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Ajoute un contact WhatsApp à un rôle
     */
    async addWhatsapp(role, contact) {
      this.saving = true
      try {
        const response = await notificationRecipientsAPI.addWhatsapp(role, contact)
        this._updateRecipient(role, response.data.data)
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur ajout WhatsApp'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Supprime un contact WhatsApp
     */
    async removeWhatsapp(role, whatsappId) {
      this.saving = true
      try {
        const response = await notificationRecipientsAPI.removeWhatsapp(role, whatsappId)
        this._updateRecipient(role, response.data.data)
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur suppression WhatsApp'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Active/Désactive un contact WhatsApp
     */
    async toggleWhatsapp(role, whatsappId, actif) {
      this.saving = true
      try {
        const response = await notificationRecipientsAPI.toggleWhatsapp(role, whatsappId, actif)
        this._updateRecipient(role, response.data.data)
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur toggle WhatsApp'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Met à jour le mode email d'un rôle
     */
    async updateMode(role, updates) {
      this.saving = true
      try {
        const response = await notificationRecipientsAPI.updateByRole(role, updates)
        this._updateRecipient(role, response.data.data)
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur mise à jour mode'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Helper interne : met à jour un recipient dans le state
     */
    _updateRecipient(role, data) {
      const idx = this.recipients.findIndex(r => r.role === role)
      if (idx !== -1) {
        this.recipients[idx] = data
      } else {
        this.recipients.push(data)
      }
      if (this.selectedRole === role) {
        this.selectedRecipient = data
      }
    }
  }
})
