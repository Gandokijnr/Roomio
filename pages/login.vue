<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card card">
        <div class="login-header">
          <h1>Hotel Management</h1>
          <p>{{ isSignup ? 'Create your account' : 'Sign in to your account' }}</p>
        </div>

        <form @submit.prevent="isSignup ? handleSignup() : handleLogin()" class="login-form">
          <div v-if="isSignup" class="form-group">
            <label for="full-name">Full Name</label>
            <input
              id="full-name"
              v-model="fullName"
              type="text"
              class="input"
              placeholder="John Doe"
              required
              :disabled="loading"
            />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="input"
              placeholder="admin@hotel.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="input"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
            {{ loading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In') }}
          </button>

          <div class="toggle-mode">
            <button type="button" @click="isSignup = !isSignup" class="btn-link" :disabled="loading">
              {{ isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up' }}
            </button>
          </div>
        </form>

        <div v-if="!isSignup" class="demo-credentials">
          <p><strong>New User?</strong></p>
          <p>Click "Sign Up" above to create your account</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { signIn, signUp } = useAuth()
const router = useRouter()

const isSignup = ref(false)
const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    await signIn(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}

const handleSignup = async () => {
  try {
    loading.value = true
    error.value = ''

    await signUp(email.value, password.value, fullName.value)
    router.push('/')
  } catch (err: any) {
    console.error('Signup error:', err)
    error.value = err.message || 'Failed to create account'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
  padding: var(--spacing-lg);
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  padding: var(--spacing-2xl);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-header h1 {
  font-size: 1.875rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-sm);
}

.login-header p {
  color: var(--neutral-600);
  font-size: 0.938rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.error-message {
  padding: var(--spacing-md);
  background: var(--error-50);
  color: var(--error-700);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.demo-credentials {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--neutral-200);
  text-align: center;
  font-size: 0.813rem;
  color: var(--neutral-600);
}

.demo-credentials p {
  margin-bottom: var(--spacing-xs);
}

.toggle-mode {
  text-align: center;
  margin-top: var(--spacing-md);
}

.btn-link {
  background: none;
  color: var(--primary-600);
  font-size: 0.875rem;
  padding: 0;
}

.btn-link:hover:not(:disabled) {
  color: var(--primary-700);
  text-decoration: underline;
}
</style>
