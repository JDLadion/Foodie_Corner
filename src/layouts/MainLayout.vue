<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-gradient text-white" elevated>
      <q-toolbar class="q-py-sm">
        <span class="text-h4 q-mr-md">🍽️</span>
        <q-toolbar-title>
          <div class="text-h6">Foodie's Corner</div>
          <div class="text-caption">Manage your restaurant's menu with ease</div>
        </q-toolbar-title>
        <q-btn
          flat
          rounded
          no-caps
          :label="$q.dark.isActive ? '☀️ Light Mode' : '🌙 Dark Mode'"
          @click="toggleDark"
        />
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

const DARK_KEY = 'foodie-dark-mode';

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
</style>
