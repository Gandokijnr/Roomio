<template>
  <aside class="super-sidebar">
    <div class="super-header">
      <div>
        <h2>Roomio Platform</h2>
        <p>Super Admin</p>
      </div>
    </div>

    <nav class="super-nav">
      <NuxtLink to="/admin/super" class="nav-item" exact-active-class="active">
        <span class="icon">🛡️</span>
        <span>Overview</span>
      </NuxtLink>

      <NuxtLink to="/admin/super#tenants" class="nav-item">
        <span class="icon">🏨</span>
        <span>Tenants (Summary)</span>
      </NuxtLink>

      <NuxtLink to="/admin/super/tenants" class="nav-item">
        <span class="icon">📋</span>
        <span>Tenants Directory</span>
      </NuxtLink>

      <NuxtLink to="/admin/super#requests" class="nav-item">
        <span class="icon">📬</span>
        <span>Onboarding (Summary)</span>
      </NuxtLink>

      <NuxtLink to="/admin/super/onboarding" class="nav-item">
        <span class="icon">✅</span>
        <span>Onboarding Queue</span>
      </NuxtLink>

      <NuxtLink to="/admin/super#activity" class="nav-item">
        <span class="icon">📣</span>
        <span>Activity</span>
      </NuxtLink>
    </nav>

    <div class="super-footer">
      <div class="user-info">
        <div class="user-avatar">
          {{ profile?.full_name?.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <div class="user-name">{{ profile?.full_name }}</div>
          <div class="user-role">Super admin</div>
        </div>
      </div>
      <button @click="handleSignOut" class="btn-signout">
        <span>🚪</span>
        Sign Out
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { profile, signOut } = useAuth()

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
</script>

<style scoped>
.super-sidebar {
  width: 260px;
  height: 100vh;
  background: radial-gradient(circle at top, #020617, #030712);
  border-right: 1px solid rgba(148, 163, 184, 0.3);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  color: #e5e7eb;
}

.super-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid rgba(148, 163, 184, 0.4);
}

.super-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f9fafb;
}

.super-header p {
  font-size: 0.8rem;
  color: #9ca3af;
}

.super-nav {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  color: #9ca3af;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-xs);
}

.nav-item:hover {
  background: rgba(15, 23, 42, 0.9);
  color: #f9fafb;
  transform: translateX(2px);
}

.nav-item.active {
  background: linear-gradient(to right, #d4af37, #b8931f);
  color: #0f172a;
}

.nav-item .icon {
  font-size: 1.1rem;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.super-footer {
  padding: var(--spacing-md);
  border-top: 1px solid rgba(148, 163, 184, 0.4);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: rgba(15, 23, 42, 0.7);
  border-radius: var(--radius-md);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #d4af37, #b8931f);
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  font-size: 0.85rem;
  color: #f9fafb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: #e5e7eb;
  opacity: 0.8;
}

.btn-signout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.btn-signout:hover {
  background: rgba(30, 64, 175, 0.9);
}
</style>
