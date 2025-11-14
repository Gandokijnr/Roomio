<template>
  <NuxtLayout>
    <NuxtPage />
    
    <!-- Global Notifications -->
    <EmailVerificationNotification
      :show="emailVerificationModal.show"
      :email="emailVerificationModal.email"
      @close="hideEmailVerificationModal"
      @resend="emailVerificationResent"
    />
    
    <ToastNotification />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { loadUser } = useAuth()
const { 
  emailVerificationModal, 
  hideEmailVerificationModal, 
  emailVerificationResent 
} = useNotifications()

onMounted(() => {
  loadUser()
})
</script>
