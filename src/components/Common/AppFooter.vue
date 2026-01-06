<template>
  <!-- COPIÉ ET ADAPTÉ DEPUIS STOCK THS -->
  <footer v-if="isAuthenticated" class="bg-white border-t border-gray-200 mt-auto">
    <div class="container mx-auto px-4 py-4">
      <p class="text-center text-gray-600 text-sm">
        © 2025 THS - Module CRV Opérations. Tous droits réservés.
      </p>
    </div>
  </footer>
</template>

<script>
// COPIÉ DEPUIS STOCK THS
export default {
  name: 'AppFooter',
  props: {
    isAuthenticated: {
      type: Boolean,
      required: true
    }
  }
};
</script>

<style scoped>
/* Styles spécifiques au footer */
</style>
