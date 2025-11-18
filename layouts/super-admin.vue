<template>
  <div class="super-admin-layout">
    <SuperAdminSidebar />
    <main class="super-admin-main">
      <slot />
    </main>
  </div>
</template>

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

@media (max-width: 1024px) {
  .super-admin-main {
    margin-left: 0;
  }
}
</style>
