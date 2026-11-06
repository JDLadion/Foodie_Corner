import { defineConfig } from '#q-app'

export default defineConfig(() => {
  return {
    boot: ['axios'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      env: {
        API_URL: process.env.API_URL ?? 'http://localhost:8000/api',
      },
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      vueRouterMode: 'hash',
    },

    devServer: {
      open: true,
      // Forward all /api/* requests to the Laravel backend (php artisan serve)
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },

    framework: {
      config: {},
      plugins: ['Notify', 'Dark'],
    },

    animations: [],
  }
})
