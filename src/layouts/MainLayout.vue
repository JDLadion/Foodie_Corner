<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-gradient text-white" elevated>
      <q-toolbar class="q-py-sm app-toolbar">
        <span class="text-h4 q-mr-md app-logo">🍽️</span>
        <q-toolbar-title class="app-toolbar-title">
          <div class="text-h6 app-brand-name">Foodie's Corner</div>
          <div class="text-caption app-brand-tagline">Manage your restaurant's menu with ease</div>
        </q-toolbar-title>
        <q-btn
          flat
          rounded
          no-caps
          class="mobile-toolbar-action"
          :label="$q.dark.isActive ? '☀️ Light Mode' : '🌙 Dark Mode'"
          @click="toggleDark"
        />
        <q-btn flat rounded no-caps icon="logout" label="Log Out" class="mobile-toolbar-action" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-transparent text-grey-7 text-center text-caption q-pa-md">
      Made with Vue 3 + Quasar • Laravel API • Foodie's Corner
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Dark } from 'quasar';
import { useRouter } from 'vue-router';

const DARK_KEY = 'foodie-dark-mode';
const router = useRouter();

function logout() {
  localStorage.removeItem('foodie-auth-token');
  router.push('/login');
}

function toggleDark() {
  Dark.toggle();
  try {
    localStorage.setItem(DARK_KEY, String(Dark.isActive));
  } catch {
    // ignore
  }
}

onMounted(() => {
  try {
    const saved = localStorage.getItem(DARK_KEY);
    if (saved !== null) Dark.set(saved === 'true');
  } catch {
    // ignore
  }
});
</script>

<style lang="scss">
.bg-gradient {
  background: linear-gradient(135deg, #ff7e45, #ff5e5e) !important;
}

.app-toolbar {
  min-width: 0;
}

.app-toolbar-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.app-brand-name,
.app-brand-tagline {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .app-toolbar {
    padding-left: 10px;
    padding-right: 10px;
    gap: 2px;
  }

  .app-logo {
    flex: 0 0 auto;
    margin-right: 8px !important;
    font-size: 1.8rem !important;
  }

  .app-brand-name {
    font-size: 1rem;
  }

  .app-brand-tagline {
    display: none;
  }

  .mobile-toolbar-action {
    min-width: 34px;
    padding-left: 6px;
    padding-right: 6px;
  }

  .mobile-toolbar-action .q-btn__content .q-btn__label {
    display: none;
  }
}
</style>
