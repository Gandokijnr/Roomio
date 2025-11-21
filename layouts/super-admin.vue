<template>
  <div class="super-admin-layout">
    <SuperAdminSidebar :class="{ 'is-open': isSidebarOpen }" />
    <div
      v-if="isSidebarOpen"
      class="super-admin-backdrop"
      @click="isSidebarOpen = false"
    />
    <main class="super-admin-main">
      <button
        type="button"
        class="super-sidebar-toggle"
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

<style scoped>
.super-admin-layout {
  display: flex;
  min-height: 100vh;
  background: radial-gradient(circle at top left, #111827, #020617);
}

.super-admin-main {
  flex: 1;
  margin-left: 260px;
  padding: var(--spacing-xl);
  background: linear-gradient(to bottom, #020617, #030712);
  color: #e5e7eb;
  overflow-x: hidden;
}

.super-admin-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  z-index: 30;
}

.super-sidebar-toggle {
  display: none;
}

@media (max-width: 1024px) {
  .super-admin-main {
    margin-left: 0;
  }

  .super-sidebar-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 1rem;
    padding: 0.4rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    background: rgba(15, 23, 42, 0.9);
    color: #e5e7eb;
    font-size: 0.8rem;
    cursor: pointer;
  }
}
</style>
