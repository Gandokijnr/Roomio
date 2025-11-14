<template>
  <div class="signup-page">
    <div class="signup-container">
      <div class="signup-header">
        <h1>🏨 Roomio</h1>
        <h2>Create Your Account</h2>
        <p v-if="invitationValid">Welcome! You've been invited to join Roomio.</p>
        <p v-else class="error-message">Invalid or expired invitation. Please request access first.</p>
      </div>
      
      <div v-if="!invitationValid" class="invalid-invitation">
        <div class="error-card">
          <div class="error-icon">🔐</div>
          <h3>Invitation Required</h3>
          <p>
            Roomio is an invitation-only platform for hotel owners. 
            You need a valid invitation to create an account.
          </p>
          <NuxtLink to="/landing" class="btn btn-primary">
            Request Access
          </NuxtLink>
        </div>
      </div>
      
      <div v-else class="signup-form-container">
        <form @submit.prevent="handleSignup" class="signup-form">
          <div class="invitation-info">
            <div class="info-card">
              <strong>Hotel:</strong> {{ invitationData?.hotel_name }}
            </div>
            <div class="info-card">
              <strong>Contact:</strong> {{ invitationData?.name }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="signupForm.email"
              type="email"
              readonly
              class="form-input readonly"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="signupForm.password"
              type="password"
              placeholder="Create a strong password"
              class="form-input"
              required
              minlength="8"
            />
            <div class="password-requirements">
              <small>Password must be at least 8 characters long</small>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="signupForm.confirmPassword"
              type="password"
              placeholder="Confirm your password"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="signupForm.acceptTerms"
                type="checkbox"
                required
              />
              <span class="checkmark"></span>
              I agree to the <a href="#" @click="openTerms">Terms of Service</a> 
              and <a href="#" @click="openPrivacy">Privacy Policy</a>
            </label>
          </div>
          
          <button
            type="submit"
            :disabled="!isFormValid || loading"
            class="signup-button"
          >
            <span v-if="loading">Creating Account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>
        
        <div class="signup-footer">
          <p>
            Already have an account? 
            <NuxtLink to="/login" class="login-link">Sign In</NuxtLink>
          </p>
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
      alert('Signup failed: ' + error.message)
      return
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

<style scoped>
.signup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #d4af37 0%, #b8931f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.signup-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
}

.signup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.signup-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.signup-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.signup-header p {
  color: #6b7280;
}

.error-message {
  color: #ef4444 !important;
}

.invalid-invitation {
  text-align: center;
}

.error-card {
  padding: 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-card h3 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-card p {
  color: #7f1d1d;
  margin-bottom: 1.5rem;
}

.invitation-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-card {
  flex: 1;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-input.readonly {
  background: #f9fafb;
  color: #6b7280;
}

.password-requirements {
  margin-top: 0.5rem;
}

.password-requirements small {
  color: #6b7280;
  font-size: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1.4;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
  width: auto;
}

.checkbox-label a {
  color: #d4af37;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.signup-button {
  width: 100%;
  background: #d4af37;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.signup-button:hover:not(:disabled) {
  background: #b8931f;
  transform: translateY(-1px);
}

.signup-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.signup-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.login-link {
  color: #d4af37;
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #d4af37;
  color: white;
}

.btn-primary:hover {
  background: #b8931f;
  transform: translateY(-1px);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .signup-page {
    padding: 1rem;
  }
  
  .signup-container {
    padding: 2rem;
  }
  
  .invitation-info {
    flex-direction: column;
  }
}
</style>
