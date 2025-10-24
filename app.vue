<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { loadUser } = useAuth()

onMounted(() => {
  loadUser()
})
</script>
