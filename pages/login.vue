<template>
  <div class="relative min-h-screen flex items-center justify-center p-6">
    <div v-if="bgUrl" class="absolute inset-0">
      <div class="absolute inset-0 bg-cover bg-center"/>
      <div class="absolute inset-0 bg-gradient-to-br from-black/35 to-black/55" />
    </div>

    <div class="relative z-10 w-full max-w-md">
      <div class="rounded-xl border border-black/5 bg-white/90 backdrop-blur-md shadow-xl p-8 md:p-10">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-semibold text-neutral-900 mb-2">Hotel Management</h1>
          <p class="text-sm text-neutral-600">{{ isSignup ? 'Create your account' : 'Sign in to your account' }}</p>
        </div>

        <form @submit.prevent="isSignup ? handleSignup() : handleLogin()" class="grid gap-6">
          <div v-if="isSignup" class="grid gap-2">
            <label for="full-name" class="text-sm font-medium text-neutral-700">Full Name</label>
            <input
              id="full-name"
              v-model="fullName"
              type="text"
              class="form-input w-full rounded-md border-neutral-300 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]"
              placeholder="John Doe"
              required
              :disabled="loading"
            />
          </div>

          <div class="grid gap-2">
            <label for="email" class="text-sm font-medium text-neutral-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input w-full rounded-md border-neutral-300 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]"
              placeholder="admin@hotel.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="grid gap-2">
            <label for="password" class="text-sm font-medium text-neutral-700">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input w-full rounded-md border-neutral-300 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
          </div>

          <div v-if="error" class="rounded-md bg-[var(--error-50)] text-[var(--error-700)] px-4 py-3 text-sm">
            {{ error }}
          </div>

          <!-- Email verification reminder for signup -->
          <div v-if="isSignup" class="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <div>
                <p class="font-medium text-yellow-800 mb-1">Email Verification Required</p>
                <p class="text-yellow-700">
                  After creating your account, you'll receive a verification email. 
                  Please check your inbox and click the verification link to activate your account.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            class="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary-600)] px-6 py-3 text-white text-base font-medium shadow-md transition hover:bg-[var(--primary-700)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            {{ loading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In') }}
          </button>

          <div class="text-center">
            <button
              type="button"
              @click="isSignup = !isSignup"
              class="text-sm font-medium text-[var(--primary-600)] hover:text-[var(--primary-700)]"
              :disabled="loading"
            >
              {{ isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up' }}
            </button>
          </div>
        </form>

        <div v-if="!isSignup" class="mt-6 text-center text-sm text-neutral-600">
          <p><strong class="font-semibold">New User?</strong></p>
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
const config = useRuntimeConfig()
const { 
  emailVerificationSuccess,
  emailVerificationResent
} = useNotifications()

const isSignup = ref(false)
const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const bgUrl = computed(() => (config?.public as any)?.authBackgroundUrl as string | undefined)
const authBgImage = computed(() => bgUrl.value ? { backgroundImage: `url('${bgUrl.value}')` } : {})

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

    const result = await signUp(email.value, password.value, fullName.value)
    
    // Check if user needs email verification
    if (result.user && !result.user.email_confirmed_at) {
      // Show email verification notification
      emailVerificationSuccess(email.value)
      
      // Reset form but don't redirect
      fullName.value = ''
      password.value = ''
      isSignup.value = false
    } else {
      // User is confirmed, redirect to dashboard
      router.push('/')
    }
  } catch (err: any) {
    console.error('Signup error:', err)
    error.value = err.message || 'Failed to create account'
  } finally {
    loading.value = false
  }
}

const handleResendVerification = () => {
  emailVerificationResent()
}
</script>
