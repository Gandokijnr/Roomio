<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Hotel Management</h2>
    </div>

    <nav class="sidebar-nav">
      <NuxtLink to="/" class="nav-item" exact-active-class="active">
        <span class="icon">📊</span>
        <span>Dashboard</span>
      </NuxtLink>

      <NuxtLink
        v-if="canManageRooms() || hasRole(['receptionist', 'housekeeping'])"
        to="/rooms"
        class="nav-item"
        active-class="active"
      >
        <span class="icon">🏨</span>
        <span>Rooms</span>
      </NuxtLink>

      <NuxtLink
        v-if="canManageReservations()"
        to="/reservations"
        class="nav-item"
        active-class="active"
      >
        <span class="icon">📅</span>
        <span>Reservations</span>
      </NuxtLink>

      <NuxtLink
        v-if="canManageReservations()"
        to="/guests"
        class="nav-item"
        active-class="active"
      >
        <span class="icon">👤</span>
        <span>Guests</span>
      </NuxtLink>

      <NuxtLink
        v-if="canManagePayments()"
        to="/payments"
        class="nav-item"
        active-class="active"
      >
        <span class="icon">💳</span>
        <span>Payments</span>
      </NuxtLink>

      <NuxtLink
        v-if="canManageInvoices()"
        to="/invoices"
        class="nav-item"
        active-class="active"
      >
        <span class="icon">📄</span>
        <span>Invoices</span>
      </NuxtLink>

      <NuxtLink
        v-if="canManageHousekeeping() || hasRole(['housekeeping'])"
        to="/housekeeping"
        class="nav-item"
        active-class="active"
      >
        <span class="icon">🧹</span>
        <span>Housekeeping</span>
      </NuxtLink>

      <!-- Restaurant & Bar Operations -->
      <div v-if="canManageRestaurant() || canManageBar() || canManageInventory()" class="nav-section">
        <div class="nav-section-title">F&B Operations</div>
        
        <NuxtLink
          v-if="canManageRestaurant()"
          to="/restaurant"
          class="nav-item"
          active-class="active"
        >
          <span class="icon">🍽️</span>
          <span>Restaurant</span>
        </NuxtLink>

        <NuxtLink
          v-if="canManageBar()"
          to="/bar"
          class="nav-item"
          active-class="active"
        >
          <span class="icon">🍸</span>
          <span>Bar</span>
        </NuxtLink>

        <NuxtLink
          v-if="canManageInventory()"
          to="/inventory"
          class="nav-item"
          active-class="active"
        >
          <span class="icon">📦</span>
          <span>Inventory</span>
        </NuxtLink>
      </div>

      <NuxtLink
        v-if="canViewReports()"
        to="/reports"
        class="nav-item"
        active-class="active"
      >
        <span class="icon">📈</span>
        <span>Reports</span>
      </NuxtLink>

      <NuxtLink
        v-if="hasRole(['admin', 'manager'])"
        to="/staff"
        class="nav-item"
        active-class="active"
      >
        <span class="icon">👥</span>
        <span>Staff</span>
      </NuxtLink>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          {{ profile?.full_name?.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <div class="user-name">{{ profile?.full_name }}</div>
          <div class="user-role">{{ profile?.role }}</div>
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
const { 
  profile, 
  signOut, 
  hasRole, 
  canManageRooms, 
  canManageReservations, 
  canManagePayments, 
  canManageInvoices, 
  canManageHousekeeping, 
  canViewReports,
  canManageRestaurant,
  canManageBar,
  canManageInventory
} = useAuth()

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: white;
  border-right: 1px solid var(--neutral-200);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--neutral-200);
}

.sidebar-header h2 {
  font-size: 1.25rem;
  color: var(--neutral-900);
  font-weight: 600;
}

.sidebar-nav {
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
  color: var(--neutral-700);
  font-weight: 500;
  font-size: 0.938rem;
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-xs);
}

.nav-item:hover {
  background: var(--neutral-100);
  color: var(--neutral-900);
  transform: translateX(2px);
}

.nav-item.active {
  background: var(--primary-50);
  color: var(--primary-700);
}

.nav-item .icon {
  font-size: 1.25rem;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-section {
  margin: var(--spacing-lg) 0;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
  padding: 0 var(--spacing-md);
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--neutral-200);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--neutral-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: var(--neutral-500);
  text-transform: capitalize;
}

.btn-signout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--neutral-100);
  color: var(--neutral-700);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-signout:hover {
  background: var(--neutral-200);
}

.debug-info {
  padding: var(--spacing-sm);
  background: var(--neutral-50);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.debug-info p {
  margin: 2px 0;
  color: var(--neutral-600);
}
</style>
