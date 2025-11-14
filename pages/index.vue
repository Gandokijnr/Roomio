<template>
  <div></div>
</template>

<script setup lang="ts">
const { user } = useAuth()

// Check if user is authenticated
if (user.value) {
  // Authenticated user - redirect to dashboard
  await navigateTo('/dashboard')
} else {
  // Unauthenticated visitor - redirect to landing page
  await navigateTo('/landing')
}
</script>
