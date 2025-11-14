<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div v-if="loading" class="space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 class="text-xl font-semibold text-gray-900">Verifying your email...</h2>
          <p class="text-gray-600">Please wait while we confirm your email address.</p>
        </div>

        <div v-else-if="verified" class="space-y-6">
          <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Email Verified Successfully!</h2>
            <p class="mt-2 text-gray-600">
              Your email has been confirmed. You can now access all features of your account.
            </p>
          </div>

          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <p class="text-sm font-medium text-green-800">Account Activated</p>
                <p class="text-sm text-green-700 mt-1">
                  Your account is now fully activated and ready to use.
                </p>
              </div>
            </div>
          </div>

          <button
            @click="goToLogin"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
          >
            Continue to Sign In
          </button>
        </div>

        <div v-else class="space-y-6">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p class="mt-2 text-gray-600">
              {{ error || 'We were unable to verify your email address. The link may have expired or is invalid.' }}
            </p>
          </div>

          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <p class="text-sm font-medium text-red-800">What you can do:</p>
                <ul class="text-sm text-red-700 mt-1 list-disc list-inside space-y-1">
                  <li>Try signing up again to get a new verification email</li>
                  <li>Check that you clicked the correct link from your email</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <button
              @click="goToLogin"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
            >
              Go to Sign In
            </button>
            <button
              @click="goToSignup"
              class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
            >
              Try Signing Up Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { $supabase } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const { success } = useNotifications()

const loading = ref(true)
const verified = ref(false)
const error = ref('')

const verifyEmail = async () => {
  try {
    const token = route.query.token as string
    const type = route.query.type as string

    if (!token || type !== 'email') {
      throw new Error('Invalid verification link')
    }

    const { data, error: verifyError } = await $supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })

    if (verifyError) throw verifyError

    if (data.user) {
      verified.value = true
      success('Email Verified!', 'Your account has been successfully activated.')
    } else {
      throw new Error('Verification failed')
    }
  } catch (err: any) {
    console.error('Email verification error:', err)
    error.value = err.message || 'Verification failed'
    verified.value = false
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const goToSignup = () => {
  router.push('/login?signup=true')
}

onMounted(() => {
  verifyEmail()
})
</script>
