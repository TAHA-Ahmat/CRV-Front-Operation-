<template>
  <footer v-if="isAuthenticated" class="app-footer footer-theme">
    <div class="footer-container">
      <p class="footer-text">
        © 2025 THS - Module CRV Opérations. Tous droits réservés.
      </p>
    </div>
  </footer>
</template>

<script>
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
.app-footer {
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 16px;
}

.footer-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  margin: 0;
}

@media (min-width: 768px) {
  .footer-container {
    padding: 16px 24px;
  }

  .footer-text {
    font-size: 14px;
  }
}
</style>
