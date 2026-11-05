<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-gradient text-white" elevated>
      <q-toolbar class="q-py-sm app-toolbar">
        <span class="text-h4 q-mr-md app-logo">🍽️</span>
        <q-toolbar-title class="app-toolbar-title">
          <div class="text-h6 app-brand-name">Foodie's Corner</div>
          <div class="text-caption app-brand-tagline">Manage your restaurant's menu with ease</div>
        </q-toolbar-title>
        <div
          class="welcome-user"
          role="button"
          tabindex="0"
          aria-label="Open profile settings"
          @click="openProfileModal"
          @keydown.enter.prevent="openProfileModal"
          @keydown.space.prevent="openProfileModal"
        >
          <q-avatar size="34px" class="q-mr-sm">
            <img v-if="profile.profile_image" :src="profile.profile_image" alt="Profile image" />
            <q-icon v-else name="person" />
          </q-avatar>
          <span>{{ profile.name || 'User' }}</span>
        </div>
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

    <q-dialog v-model="profileModalOpen">
      <q-card class="profile-dialog-card">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Edit Profile</div>
          <q-btn v-close-popup flat round dense icon="close" aria-label="Close" />
        </q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="saveProfile">
          <q-card-section class="profile-form-section">
            <div class="profile-image-picker">
              <q-avatar size="96px" color="grey-3" text-color="grey-7">
                <img v-if="profileForm.profile_image" :src="profileForm.profile_image" alt="Profile preview" />
                <q-icon v-else name="person" size="48px" />
              </q-avatar>
              <q-btn flat no-caps color="primary" label="Change profile image" @click="profileImageInput?.click()" />
              <input ref="profileImageInput" class="hidden-profile-input" type="file" accept="image/*" @change="handleProfileImageSelect" />
            </div>
            <q-input v-model.trim="profileForm.name" outlined label="Name" :rules="[(value: string) => !!value || 'Name is required']" />
            <q-separator />
            <div class="text-subtitle2">Change password (optional)</div>
            <q-input v-model="profileForm.current_password" outlined type="password" label="Current password" />
            <q-input v-model="profileForm.password" outlined type="password" label="New password (at least 8 characters)" />
            <q-input v-model="profileForm.password_confirmation" outlined type="password" label="Confirm new password" />
            <div v-if="profileError" class="profile-error">{{ profileError }}</div>
          </q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn v-close-popup flat no-caps label="Cancel" />
            <q-btn color="primary" no-caps type="submit" label="Save changes" :loading="profileSaving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { Dark, Notify } from 'quasar';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/stores/menu-store';

const DARK_KEY = 'foodie-dark-mode';
const TOKEN_KEY = 'foodie-auth-token';
const router = useRouter();
const menuStore = useMenuStore();
type Profile = { name: string; profile_image: string | null };
type ProfileForm = Profile & { current_password: string; password: string; password_confirmation: string };
const profile = ref<Profile>({ name: '', profile_image: null });
const profileForm = ref<ProfileForm>(emptyProfileForm());
const profileModalOpen = ref(false);
const profileSaving = ref(false);
const profileError = ref('');
const profileImageInput = ref<HTMLInputElement | null>(null);

function emptyProfileForm(): ProfileForm {
  return { name: '', profile_image: null, current_password: '', password: '', password_confirmation: '' };
}

function authConfig() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { headers: { Authorization: 'Bearer ' + token } } : {};
}

async function loadProfile() {
  try {
    const response = await axios.get<Profile>('/api/profile', authConfig());
    profile.value = response.data;
  } catch {
    // Keep the menu available if profile loading is temporarily unavailable.
  }
}

function openProfileModal() {
  profileError.value = '';
  profileForm.value = { ...emptyProfileForm(), ...profile.value };
  profileModalOpen.value = true;
}

function handleProfileImageSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    profileError.value = 'Please choose an image file.';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    profileError.value = 'Profile image must be 5 MB or smaller.';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') profileForm.value.profile_image = reader.result;
  };
  reader.readAsDataURL(file);
}

async function saveProfile() {
  if (profileForm.value.password && !profileForm.value.current_password) {
    profileError.value = 'Enter your current password to set a new password.';
    return;
  }
  profileSaving.value = true;
  profileError.value = '';
  try {
    const response = await axios.put<Profile>('/api/profile', profileForm.value, authConfig());
    profile.value = response.data;
    profileModalOpen.value = false;
    Notify.create({ type: 'positive', message: 'Profile updated successfully.' });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      const errors = error.response.data.errors as Record<string, string[]> | undefined;
      profileError.value = errors ? Object.values(errors).flat()[0] : error.response.data.message;
    } else {
      profileError.value = 'Unable to update your profile.';
    }
  } finally {
    profileSaving.value = false;
  }
}

async function logout() {
  const token = localStorage.getItem(TOKEN_KEY);

  try {
    if (token) {
      await axios.post(
        '/api/logout',
        {},
        { headers: { Authorization: 'Bearer ' + token } },
      );
    }
  } finally {
    // The menu remains stored in the database; only clear this account's
    // in-memory data before another account can sign in on this browser.
    menuStore.clearItems();
    localStorage.removeItem(TOKEN_KEY);
    await router.push('/login');
  }
}

function toggleDark() {
  const isDark = !Dark.isActive;
  Dark.set(isDark);
  try {
    localStorage.setItem(DARK_KEY, String(isDark));
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
  loadProfile();
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

.welcome-user {
  display: flex;
  align-items: center;
  flex: 0 1 auto;
  min-width: 0;
  margin-right: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px 6px;
  transition: background-color 0.2s ease;
}

.welcome-user:hover,
.welcome-user:focus-visible {
  background: rgb(255 255 255 / 16%);
  outline: none;
}

.profile-dialog-card {
  width: min(100%, 460px);
  max-height: 90vh;
}

.profile-form-section {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-form-section .q-field {
  margin: 0;
}

.profile-image-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.profile-image-picker img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hidden-profile-input {
  display: none;
}

.profile-error {
  color: #c62828;
  font-size: 0.85rem;
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

  .welcome-user {
    max-width: 42px;
    margin-right: 0;
  }

  .welcome-user span {
    display: none;
  }
}
</style>
