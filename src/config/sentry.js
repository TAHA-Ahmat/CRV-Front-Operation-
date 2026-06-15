import * as Sentry from '@sentry/vue';
import { useRouter } from 'vue-router';

export const initSentry = (app, router) => {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.vueRouterInstrumentation(router),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    release: '1.0.0',
  });

  router.afterEach((to, from, next) => {
    Sentry.captureMessage(`Navigation from ${from.path} to ${to.path}`, 'info');
  });
};
