/**
 * DIRECTIVE v-can - MASQUAGE UI SELON PERMISSIONS
 *
 * Source de vérité : TRANSMISSION_BACKEND_FRONTEND.md
 *
 * Usage :
 * - v-can="'CRV_CREER'" → masque si pas permission
 * - v-can.disable="'CRV_CREER'" → désactive au lieu de masquer
 * - v-can.hide="'CRV_CREER'" → masque explicitement
 *
 * Exemples :
 * <button v-can="'CRV_CREER'">Créer un CRV</button>
 * <button v-can.disable="'CRV_SUPPRIMER'">Supprimer</button>
 */

import { getUserRole } from '@/services/auth/authService';
import { hasPermission } from '@/utils/permissions';

/**
 * Vérifie la permission pour l'utilisateur courant
 * @param {string} action - Code de l'action
 * @returns {boolean}
 */
function checkPermission(action) {
  const role = getUserRole();
  if (!role || !action) return false;
  return hasPermission(role, action);
}

/**
 * Masque un élément
 * @param {HTMLElement} el
 */
function hideElement(el) {
  el._originalDisplay = el.style.display;
  el.style.display = 'none';
}

/**
 * Affiche un élément
 * @param {HTMLElement} el
 */
function showElement(el) {
  el.style.display = el._originalDisplay || '';
}

/**
 * Désactive un élément
 * @param {HTMLElement} el
 */
function disableElement(el) {
  el.setAttribute('disabled', 'disabled');
  el.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
  el.setAttribute('title', 'Action non autorisée pour votre rôle');
}

/**
 * Active un élément
 * @param {HTMLElement} el
 */
function enableElement(el) {
  el.removeAttribute('disabled');
  el.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
  el.removeAttribute('title');
}

/**
 * Directive Vue v-can
 */
export const vCan = {
  /**
   * Appelé quand l'élément est monté
   */
  mounted(el, binding) {
    const action = binding.value;
    const modifiers = binding.modifiers;

    if (!action) {
      console.warn('[v-can] Action non spécifiée');
      return;
    }

    const hasAccess = checkPermission(action);

    if (!hasAccess) {
      if (modifiers.disable) {
        // Mode désactivation
        disableElement(el);
      } else {
        // Mode masquage (par défaut)
        hideElement(el);
      }
    }
  },

  /**
   * Appelé quand la binding est mise à jour
   */
  updated(el, binding) {
    const action = binding.value;
    const modifiers = binding.modifiers;

    if (!action) return;

    const hasAccess = checkPermission(action);

    if (modifiers.disable) {
      if (hasAccess) {
        enableElement(el);
      } else {
        disableElement(el);
      }
    } else {
      if (hasAccess) {
        showElement(el);
      } else {
        hideElement(el);
      }
    }
  },

  /**
   * Nettoyage quand l'élément est démonté
   */
  unmounted(el) {
    // Restaurer l'état original
    showElement(el);
    enableElement(el);
  }
};

/**
 * Directive v-readonly pour désactiver tous les inputs d'un conteneur
 * Utilisé pour le rôle QUALITE
 */
export const vReadonly = {
  mounted(el, binding) {
    const shouldBeReadonly = binding.value !== false;

    if (shouldBeReadonly) {
      // Désactiver tous les inputs, selects, textareas, buttons
      const interactiveElements = el.querySelectorAll('input, select, textarea, button:not([type="button"]):not(.readonly-exempt)');

      interactiveElements.forEach(element => {
        if (element.tagName === 'BUTTON') {
          element.setAttribute('disabled', 'disabled');
          element.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
          element.setAttribute('readonly', 'readonly');
          element.setAttribute('disabled', 'disabled');
          element.classList.add('bg-gray-100', 'cursor-not-allowed');
        }
      });

      // Ajouter un indicateur visuel
      if (!el.querySelector('.readonly-badge')) {
        const badge = document.createElement('div');
        badge.className = 'readonly-badge bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-2';
        badge.textContent = 'Mode lecture seule';
        el.insertBefore(badge, el.firstChild);
      }
    }
  },

  updated(el, binding) {
    // Re-appliquer si la valeur change
    if (binding.value !== binding.oldValue) {
      // Nettoyer puis réappliquer
      const interactiveElements = el.querySelectorAll('input, select, textarea, button:not([type="button"])');
      interactiveElements.forEach(element => {
        element.removeAttribute('readonly');
        element.removeAttribute('disabled');
        element.classList.remove('bg-gray-100', 'cursor-not-allowed', 'opacity-50');
      });

      // Supprimer le badge
      const badge = el.querySelector('.readonly-badge');
      if (badge) badge.remove();

      // Réappliquer si nécessaire
      if (binding.value !== false) {
        vReadonly.mounted(el, binding);
      }
    }
  }
};

/**
 * Plugin Vue pour enregistrer les directives
 */
export default {
  install(app) {
    app.directive('can', vCan);
    app.directive('readonly', vReadonly);
  }
};
