/**
 * Theme Store - Gestion du mode jour/nuit
 * Persistance localStorage + detection preference systeme
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  /**
   * Initialiser le theme au demarrage
   * Priorite: localStorage > preference systeme > jour par defaut
   */
  const initTheme = () => {
    const saved = localStorage.getItem('crv-theme')

    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      // Detecter preference systeme
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    applyTheme()

    // Ecouter changements preference systeme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('crv-theme')) {
        isDark.value = e.matches
        applyTheme()
      }
    })
  }

  /**
   * Appliquer le theme au DOM
   */
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  /**
   * Basculer entre jour et nuit
   */
  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('crv-theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  /**
   * Definir un theme specifique
   */
  const setTheme = (dark) => {
    isDark.value = dark
    localStorage.setItem('crv-theme', dark ? 'dark' : 'light')
    applyTheme()
  }

  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme
  }
})
