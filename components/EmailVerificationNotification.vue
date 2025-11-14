<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
      <!-- Header -->
      <div class="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-semibold text-yellow-900">
              Check Your Email
            </h3>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-6">
        <div class="space-y-4">
          <div class="text-center">
            <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">
              Registration Successful!
            </h4>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800 mb-3">
              <strong>📧 Verification email sent to:</strong>
            </p>
            <p class="font-medium text-yellow-900 bg-white px-3 py-2 rounded border">
              {{ email }}
            </p>
          </div>

          <div class="space-y-3 text-sm text-gray-700">
            <p class="font-medium text-gray-900">
              ✅ Next Steps:
            </p>
            <ul class="space-y-2 ml-4">
              <li class="flex items-start">
                <span class="text-yellow-600 mr-2">1.</span>
                <span>Check your email inbox for a verification message</span>
              </li>
              <li class="flex items-start">
                <span class="text-yellow-600 mr-2">2.</span>
                <span>Click the verification link in the email</span>
              </li>
              <li class="flex items-start">
                <span class="text-yellow-600 mr-2">3.</span>
                <span>Return here to sign in with your verified account</span>
              </li>
            </ul>
          </div>

          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <p class="text-sm font-medium text-amber-800 mb-1">
                  Important Reminder
                </p>
                <p class="text-sm text-amber-700">
                  <strong>Check your spam/junk folder</strong> if you don't see the email within a few minutes. 
                  Email verification is <strong>required</strong> to activate your account and access all features.
                </p>
              </div>
            </div>
          </div>

          <div class="text-center">
            <p class="text-xs text-gray-500">
              Didn't receive the email? 
              <button 
                @click="resendVerification" 
                :disabled="resendLoading || resendCooldown > 0"
                class="text-yellow-600 hover:text-yellow-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="resendCooldown > 0">
                  Resend in {{ resendCooldown }}s
                </span>
                <span v-else-if="resendLoading">
                  Sending...
                </span>
                <span v-else>
                  Resend verification email
                </span>
              </button>
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <button
            @click="closeNotification"
            class="text-sm text-gray-600 hover:text-gray-800"
          >
            I'll verify later
          </button>
          <button
            @click="closeNotification"
            class="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  email: string
}

interface Emits {
  (e: 'close'): void
  (e: 'resend'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { $supabase } = useNuxtApp()

const resendLoading = ref(false)
const resendCooldown = ref(0)
let cooldownInterval: NodeJS.Timeout | null = null

const closeNotification = () => {
  emit('close')
}

const resendVerification = async () => {
  if (resendLoading.value || resendCooldown.value > 0) return

  try {
    resendLoading.value = true
    
    const { error } = await $supabase.auth.resend({
      type: 'signup',
      email: props.email
    })

    if (error) throw error

    // Start cooldown
    resendCooldown.value = 60
    cooldownInterval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0 && cooldownInterval) {
        clearInterval(cooldownInterval)
        cooldownInterval = null
      }
    }, 1000)

    emit('resend')
  } catch (error) {
    console.error('Error resending verification:', error)
  } finally {
    resendLoading.value = false
  }
}

// Cleanup interval on unmount
onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})
</script>
