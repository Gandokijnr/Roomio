<template>
  <div class="relative min-h-screen flex items-center justify-center p-6">
    <div v-if="bgUrl" class="absolute inset-0">
      <div class="absolute inset-0 bg-cover bg-center"/>
      <div class="absolute inset-0 bg-gradient-to-br from-black/35 to-black/55" />
    </div>

    <div class="relative z-10 w-full max-w-md">
      <div class="rounded-xl border border-black/5 bg-white/90 backdrop-blur-md shadow-xl p-8 md:p-10">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-semibold text-neutral-900 mb-2">🏨 Roomio</h1>
          <p class="text-sm text-neutral-600">Sign in to your account</p>
        </div>

        <form @submit.prevent="handleLogin()" class="grid gap-6">

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


          <button
            type="submit"
            class="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary-600)] px-6 py-3 text-white text-base font-medium shadow-md transition hover:bg-[var(--primary-700)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>

        </form>

        <div class="mt-6 text-center">
          <div class="text-sm text-neutral-600 mb-4">
            <p><strong class="font-semibold">Don't have an account?</strong></p>
            <p>Roomio is invitation-only for hotel owners</p>
          </div>
          <NuxtLink 
            to="/landing" 
            class="inline-flex items-center justify-center gap-2 rounded-md bg-neutral-100 px-4 py-2 text-neutral-700 text-sm font-medium transition hover:bg-neutral-200"
          >
            Request Access
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { signIn } = useAuth()
const router = useRouter()
const config = useRuntimeConfig()

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
    router.push('/dashboard')
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}

</script>
