<template>
  <div class="app-shell">
    <div class="app-layout">
      <Sidebar :is-open="isSidebarOpen" />
      <main class="main-content">
        <div class="topbar">
          <button class="mobile-menu-button" @click="isSidebarOpen = !isSidebarOpen">
            ☰
          </button>
        </div>
        <slot />
      </main>
    </div>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="isSidebarOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
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
.app-shell {
  position: relative;
}

.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--neutral-50);
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: var(--spacing-xl);
  overflow-x: hidden;
}

.topbar {
  display: none;
}

.mobile-menu-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-200);
  background: white;
  font-size: 1.25rem;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 30;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: var(--spacing-md);
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: var(--spacing-md);
  }

  .mobile-menu-button {
    box-shadow: var(--shadow-sm);
  }
}
</style>
