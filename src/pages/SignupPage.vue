<template>
  <div class="auth-page">
    <div class="auth-card signup-card">
      <q-btn
        class="back-button"
        flat
        no-caps
        icon="arrow_back"
        label="Back to login"
        @click="router.push('/login')"
      />
      <div class="auth-logo" aria-hidden="true">🍽️</div>
      <h1>Sign up</h1>
      <p class="auth-subtitle">Create your Foodie's Corner account</p>

      <q-form class="auth-form" @submit.prevent="signup">
        <q-input v-model="name" filled rounded bg-color="grey-2" placeholder="Full name" />
        <q-input v-model.trim="email" filled rounded bg-color="grey-2" type="email" placeholder="Email" />
        <q-input v-model="password" filled rounded bg-color="grey-2" type="password" placeholder="Password" />
        <q-input v-model="passwordConfirmation" filled rounded bg-color="grey-2" type="password" placeholder="Confirm password" />
        <div v-if="errorMessage" class="auth-error">{{ errorMessage }}</div>
        <q-btn
          class="auth-submit"
          type="submit"
          unelevated
          no-caps
          :loading="loading"
          label="CREATE ACCOUNT"
        />
      </q-form>

      <p class="signup-prompt">
        Already a member?
        <button class="auth-link signup-link" type="button" @click="router.push('/login')">Log in</button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function signup() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.post<{ token: string }>('/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });

    localStorage.setItem('foodie-auth-token', response.data.token);
    Notify.create({ type: 'positive', message: 'Account created successfully.' });
    await router.push('/menu');
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      const errors = error.response.data.errors as Record<string, string[]> | undefined;
      errorMessage.value = errors ? Object.values(errors).flat()[0] : error.response.data.message;
    } else {
      errorMessage.value = 'Unable to connect to the Laravel server.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background: linear-gradient(135deg, #ff754f, #f94f6b);
}

.auth-card {
  position: relative;
  width: min(100%, 415px);
  padding: 48px 18px 36px;
  border-radius: 18px;
  background: white;
  text-align: center;
}

.back-button {
  position: absolute;
  top: 18px;
  left: 18px;
  color: #6f7b84;
}

.auth-logo { font-size: 2.8rem; line-height: 1; }

h1 { margin: 16px 0 8px; font-size: 2.25rem; color: #080808; }

.auth-subtitle { margin: 0 0 32px; color: #6d6d6d; }

.auth-form { display: grid; gap: 18px; text-align: left; }

.auth-submit {
  min-height: 48px;
  border-radius: 25px;
  color: white;
  background: linear-gradient(90deg, #ffbd59, #ed5976);
  font-weight: 700;
}

.auth-error {
  color: #c62828;
  font-size: 0.85rem;
  text-align: center;
}

.signup-prompt { margin: 42px 0 0; color: #6f7b84; }

.auth-link {
  border: 0;
  padding: 0;
  color: #147bd1;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}
</style>
