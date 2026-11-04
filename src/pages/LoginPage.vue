<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo" aria-hidden="true">🍽️</div>
      <h1>Login</h1>
      <p class="auth-subtitle">Foodie's Corner</p>

      <q-form class="auth-form" @submit.prevent="login">
        <q-input
          v-model.trim="email"
          filled
          rounded
          hide-bottom-space
          type="email"
          placeholder="Email"
          bg-color="grey-2"
          :rules="[(value: string) => !!value || 'Email is required']"
        >
          <template #prepend><q-icon name="person_outline" /></template>
        </q-input>

        <q-input
          v-model="password"
          filled
          rounded
          hide-bottom-space
          :type="showPassword ? 'text' : 'password'"
          placeholder="Password"
          bg-color="grey-2"
          :rules="[(value: string) => !!value || 'Password is required']"
        >
          <template #prepend><q-icon name="lock_outline" /></template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-checkbox v-model="rememberMe" label="Remember me" dense />

        <div v-if="errorMessage" class="auth-error">{{ errorMessage }}</div>
        <q-btn
          class="auth-submit"
          type="submit"
          unelevated
          no-caps
          :loading="loading"
          label="LOG IN"
        />
      </q-form>

      <button class="auth-link forgot-link" type="button">Forgot Password?</button>

      <p class="signup-prompt">
        Not a member?
        <button class="auth-link signup-link" type="button" @click="goToSignup">Sign up now</button>
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
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

async function login() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.post<{ token: string }>('/api/login', {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('foodie-auth-token', response.data.token);
    Notify.create({ type: 'positive', message: 'Login successful.' });
    await router.push('/menu');
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      errorMessage.value = error.response.data.message || 'Please check your email and password.';
    } else {
      errorMessage.value = 'Unable to connect to the Laravel server.';
    }
  } finally {
    loading.value = false;
  }
}

function goToSignup() {
  router.push('/signup');
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background:
    radial-gradient(circle at -5% -5%, rgba(255, 178, 117, 0.45) 0 15%, transparent 36%),
    radial-gradient(circle at 105% 110%, rgba(255, 157, 183, 0.45) 0 15%, transparent 36%),
    linear-gradient(135deg, #ff754f, #f94f6b);
}

.auth-card {
  width: min(100%, 415px);
  padding: 48px 18px 36px;
  border-radius: 18px;
  background: #fff;
  text-align: center;
  box-shadow: 0 12px 30px rgba(177, 54, 74, 0.12);

  h1 {
    margin: 16px 0 8px;
    color: #080808;
    font-size: 2.25rem;
    line-height: 1.1;
    font-weight: 700;
  }
}

.auth-logo {
  font-size: 2.8rem;
  line-height: 1;
}

.auth-subtitle {
  margin: 0 0 32px;
  color: #6d6d6d;
  font-size: 1rem;
}

.auth-form {
  display: grid;
  gap: 18px;
  text-align: left;

  :deep(.q-field__control) {
    min-height: 46px;
    border-radius: 24px;
  }

  :deep(.q-field__native),
  :deep(.q-field__prefix),
  :deep(.q-field__suffix) {
    color: #656565;
  }

  :deep(.q-field__prepend),
  :deep(.q-field__append) {
    color: #687987;
  }
}

.auth-submit {
  min-height: 48px;
  border-radius: 25px;
  color: white;
  background: linear-gradient(90deg, #ffbd59, #ed5976);
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 3px 6px rgba(214, 94, 87, 0.28);
}

.auth-error {
  color: #c62828;
  font-size: 0.85rem;
  text-align: center;
}

.auth-link {
  border: 0;
  padding: 0;
  color: #6f7b84;
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.forgot-link {
  margin-top: 22px;
  font-size: 0.9rem;
}

.signup-prompt {
  margin: 52px 0 0;
  color: #6f7b84;
  font-size: 0.9rem;
}

.signup-link {
  margin-left: 4px;
  color: #147bd1;
  font-weight: 700;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
