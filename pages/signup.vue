<template>
  <div class="relative min-h-screen flex items-center bg-gradient-to-br from-black/35 to-black/55 justify-center p-6">
    <div class="relative z-10 w-full max-w-md">
      <div class="rounded-xl border border-black/5 bg-white/95 backdrop-blur-md shadow-xl p-8 md:p-10">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-semibold text-neutral-900 mb-1">Roomio</h1>
          <h2 class="text-lg font-medium text-neutral-800 mb-2">Create your account</h2>
          <p v-if="invitationValid" class="text-sm text-neutral-600">
            Welcome! You've been invited to join Roomio.
          </p>
          <p v-else class="text-sm text-red-600">
            Invalid or expired invitation. Please request access first.
          </p>
        </div>

        <div v-if="!invitationValid" class="space-y-4">
          <div class="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-center space-y-3">
            <div class="text-3xl">🔐</div>
            <h3 class="text-base font-semibold text-red-700">Invitation required</h3>
            <p class="text-sm text-red-700">
              Roomio is an invitation-only platform for hotel owners. You need a
              valid invitation to create an account.
            </p>
            <NuxtLink
              to="/landing"
              class="inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
            >
              Request Access
            </NuxtLink>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div class="grid gap-3 text-sm text-neutral-800">
            <div class="rounded-md bg-neutral-100 px-3 py-2 flex items-center justify-between">
              <span class="font-bold text-neutral-700">Hotel</span>
              <span class="text-neutral-900">{{ invitationData?.hotel_name }}</span>
            </div>
            <div class="rounded-md bg-neutral-100 px-3 py-2 flex items-center justify-between">
              <span class="font-bold text-neutral-700">Contact</span>
              <span class="text-neutral-900">{{ invitationData?.name }}</span>
            </div>
          </div>

          <form @submit.prevent="handleSignup" class="grid gap-5">
            <div class="grid gap-2">
              <label for="email" class="text-sm font-medium text-neutral-700">Email address</label>
              <input
                id="email"
                v-model="signupForm.email"
                type="email"
                readonly
                class="form-input w-full rounded-md border-neutral-300 bg-neutral-50 text-neutral-600 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]"
              />
            </div>

            <div class="grid gap-2">
              <label for="password" class="text-sm font-medium text-neutral-700">Password</label>
              <input
                id="password"
                v-model="signupForm.password"
                type="password"
                placeholder="Create a strong password"
                class="form-input w-full rounded-md border-neutral-300 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]"
                required
                minlength="8"
              />
              <p class="text-xs text-neutral-500">Password must be at least 8 characters long.</p>
            </div>

            <div class="grid gap-2">
              <label for="confirmPassword" class="text-sm font-medium text-neutral-700">Confirm password</label>
              <input
                id="confirmPassword"
                v-model="signupForm.confirmPassword"
                type="password"
                placeholder="Confirm your password"
                class="form-input w-full rounded-md border-neutral-300 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]"
                required
              />
            </div>

            <div class="flex items-start gap-3 text-sm text-neutral-700">
              <input
                id="acceptTerms"
                v-model="signupForm.acceptTerms"
                type="checkbox"
                required
                class="mt-1 h-4 w-4 rounded border-neutral-300 text-[var(--primary-600)] focus:ring-[rgba(212,175,55,0.25)]"
              />
              <label for="acceptTerms" class="leading-relaxed">
                I agree to the
                <a href="#" @click.prevent="openTerms" class="text-[var(--primary-600)] hover:underline">Terms of Service</a>
                and
                <a href="#" @click.prevent="openPrivacy" class="text-[var(--primary-600)] hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <button
              type="submit"
              :disabled="!isFormValid || loading"
              class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary-600)] px-6 py-3 text-white text-base font-medium shadow-md transition hover:bg-[var(--primary-700)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Creating account...</span>
              <span v-else>Create Account</span>
            </button>
          </form>

          <div class="pt-4 border-t border-neutral-200 text-center text-sm text-neutral-600">
            <p>
              Already have an account?
              <NuxtLink to="/login" class="font-medium text-[var(--primary-600)] hover:underline">
                Sign In
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const { $supabase } = useNuxtApp()

const loading = ref(false)
const invitationValid = ref(false)
const invitationData = ref<any>(null)

const signupForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const isFormValid = computed(() => {
  return signupForm.value.email &&
         signupForm.value.password.length >= 8 &&
         signupForm.value.password === signupForm.value.confirmPassword &&
         signupForm.value.acceptTerms
})

const validateInvitation = async () => {
  const token = route.query.token as string
  
  if (!token) {
    invitationValid.value = false
    return
  }
  
  try {
    const { data, error } = await $supabase
      .from('demo_requests')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'approved')
      .gte('invitation_expires_at', new Date().toISOString())
      .single()
    
    if (error || !data) {
      invitationValid.value = false
      return
    }
    
    invitationValid.value = true
    invitationData.value = data
    signupForm.value.email = data.email
  } catch (error) {
    console.error('Invitation validation error:', error)
    invitationValid.value = false
  }
}

const handleSignup = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  
  try {
    const { data, error } = await $supabase.auth.signUp({
      email: signupForm.value.email,
      password: signupForm.value.password,
      options: {
        data: {
          hotel_name: invitationData.value?.hotel_name,
          room_count: invitationData.value?.room_count,
          invitation_token: route.query.token
        }
      }
    })
    
    if (error) {
      console.error('Signup failed:', error)
      const message = (error as any).message || ''

      if (message.toLowerCase().includes('user already registered') || message.toLowerCase().includes('duplicate key')) {
        alert('An account already exists with this email. Please log in instead.')
        await navigateTo('/login')
      } else {
        alert('Signup failed: ' + message)
      }
      return
    }
    
    // Ensure the invited user becomes the admin of the created tenant
    if (data.user) {
      try {
        await $fetch('/api/invitations/complete-signup', {
          method: 'POST',
          body: {
            token: route.query.token,
            userId: data.user.id
          }
        })
      } catch (completeError) {
        console.error('Failed to finalize invited signup:', completeError)
      }
    }
    
    // Mark invitation as used
    await $supabase
      .from('demo_requests')
      .update({ status: 'completed' })
      .eq('invitation_token', route.query.token)
    
    alert('Account created successfully! Please check your email to verify your account.')
    await navigateTo('/login')
    
  } catch (error: any) {
    console.error('Signup error:', error)
    alert('Failed to create account. Please try again.')
  } finally {
    loading.value = false
  }
}

const openTerms = () => {
  // Open terms of service
  console.log('Open terms of service')
}

const openPrivacy = () => {
  // Open privacy policy
  console.log('Open privacy policy')
}

onMounted(() => {
  validateInvitation()
})
</script>
