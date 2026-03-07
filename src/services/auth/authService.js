/**
 * SERVICE D'AUTHENTIFICATION - COUCHE API PURE
 *
 * DOCTRINE PHASE 3 (2026-03-03) :
 * - Ce fichier ne contient QUE les appels HTTP bruts
 * - Aucune logique métier, aucun état, aucun accès localStorage
 * - Pour l'authentification dans les composants : useAuth() ou useAuthStore()
 * - authStore est la source de vérité unique
 *
 * Note : authStore utilise directement authAPI depuis api.js.
 * Ce fichier est conservé comme façade API explicite pour le domaine auth.
 */

export { authAPI } from '@/services/api'
