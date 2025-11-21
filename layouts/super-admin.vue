<template>
  <div class="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-950 to-black">
    <SuperAdminSidebar :class="{ 'is-open': isSidebarOpen }" />
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-slate-900/60 z-30 lg:hidden"
      @click="isSidebarOpen = false"
    />
    <main
      class="flex-1 ml-0 lg:ml-64 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 bg-gradient-to-b from-slate-950 to-black text-slate-100 overflow-x-hidden"
    >
      <button
        type="button"
        class="inline-flex items-center gap-1 mb-4 px-3 py-1.5 rounded-full border border-slate-500/70 bg-slate-900/80 text-xs font-medium text-slate-100 cursor-pointer lg:hidden"
        @click="isSidebarOpen = !isSidebarOpen"
      >
        ☰ Super Admin Menu
      </button>
      <slot />
    </main>
  </div>
</template>

<script setup>
const isSidebarOpen = ref(false)
const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    isSidebarOpen.value = false
  }
)
</script>
