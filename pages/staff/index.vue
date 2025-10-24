<template>
  <div class="staff-page">
    <div class="page-header">
      <div>
        <h1>Staff Management</h1>
        <p>Manage hotel staff and user roles</p>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading staff...</div>

    <div v-else class="staff-table card">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in staff" :key="member.id">
            <td class="staff-name">{{ member.full_name }}</td>
            <td>{{ member.email }}</td>
            <td>{{ member.phone || '-' }}</td>
            <td>
              <span class="badge badge-primary">{{ member.role }}</span>
            </td>
            <td>
              <span :class="['badge', member.is_active ? 'badge-success' : 'badge-neutral']">
                {{ member.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Profile } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()

const loading = ref(true)
const staff = ref<Profile[]>([])

const loadStaff = async () => {
  try {
    loading.value = true
    const { data, error } = await $supabase
      .from('profiles')
      .select('*')
      .order('full_name')

    if (error) throw error
    staff.value = data || []
  } catch (error) {
    console.error('Error loading staff:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStaff()
})
</script>

<style scoped>
.staff-page {
  max-width: 1400px;
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-header h1 {
  font-size: 2rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.page-header p {
  color: var(--neutral-600);
  font-size: 0.938rem;
}

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--neutral-600);
}

.staff-table {
  padding: 0;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--neutral-50);
  border-bottom: 2px solid var(--neutral-200);
}

th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
  font-size: 0.813rem;
  color: var(--neutral-700);
  text-transform: uppercase;
}

tbody tr {
  border-bottom: 1px solid var(--neutral-200);
}

tbody tr:hover {
  background: var(--neutral-50);
}

td {
  padding: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.staff-name {
  font-weight: 600;
  color: var(--neutral-900);
}
</style>
