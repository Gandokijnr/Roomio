<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
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
</style>
