<template>
  <div class="crv-loader-container" :class="containerClass">
    <!-- Logo avion animé -->
    <div
      class="crv-logo animate-bounce"
      :class="logoClass"
    >
      ✈️
    </div>
    <p
      v-if="showText"
      class="crv-text animate-pulse"
      :class="textClass"
    >
      {{ text }}
    </p>
  </div>
</template>

<script>
// COPIÉ DEPUIS STOCK THS (THSLoader.vue) ET ADAPTÉ POUR CRV
export default {
  name: 'CRVLoader',
  props: {
    // Taille du logo
    size: {
      type: String,
      default: 'medium', // small, medium, large
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    // Texte à afficher
    text: {
      type: String,
      default: 'Chargement en cours...'
    },
    // Afficher ou masquer le texte
    showText: {
      type: Boolean,
      default: true
    },
    // Classes CSS personnalisées pour le conteneur
    containerClass: {
      type: String,
      default: ''
    },
    // Classes CSS personnalisées pour le logo
    logoClass: {
      type: String,
      default: ''
    },
    // Classes CSS personnalisées pour le texte
    textClass: {
      type: String,
      default: ''
    },
    // Mode overlay (plein écran)
    overlay: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    logoSizeClass() {
      const sizes = {
        small: 'w-12 h-12 text-4xl',
        medium: 'w-24 h-24 text-6xl',
        large: 'w-32 h-32 text-8xl'
      };
      return sizes[this.size];
    },
    defaultContainerClass() {
      if (this.overlay) {
        return 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70';
      }
      return 'flex flex-col items-center justify-center p-4';
    },
    defaultTextClass() {
      return 'text-white text-lg font-semibold mt-4';
    }
  }
};
</script>

<style scoped>
.crv-loader-container {
  @apply flex flex-col items-center justify-center;
}

.crv-logo {
  @apply text-6xl animate-bounce mb-4;
}

.crv-text {
  @apply text-white text-lg font-semibold animate-pulse;
}

/* Variantes de taille */
.crv-logo.small {
  @apply text-4xl;
}

.crv-logo.medium {
  @apply text-6xl;
}

.crv-logo.large {
  @apply text-8xl;
}
</style>
