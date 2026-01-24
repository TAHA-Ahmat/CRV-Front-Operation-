<template>
  <!-- COPIÉ ET ADAPTÉ DEPUIS STOCK THS -->
  <footer v-if="isAuthenticated" class="footer-theme border-t mt-auto">
    <div class="container mx-auto px-4 py-4">
      <p class="text-center text-theme-secondary text-sm">
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
