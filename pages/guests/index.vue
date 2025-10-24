<template>
  <div class="guests-page">
    <div class="page-header">
      <div>
        <h1>Guests</h1>
        <p>Manage guest profiles and information</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + Add Guest
      </button>
    </div>

    <div class="filters-section card">
      <input
        v-model="searchQuery"
        type="text"
        class="input"
        placeholder="Search guests by name, email, or phone..."
      />
    </div>

    <div v-if="loading" class="loading">Loading guests...</div>

    <div v-else-if="filteredGuests.length === 0" class="empty-state card">
      <div class="empty-icon">👤</div>
      <h3>No guests found</h3>
    </div>

    <div v-else class="guests-table card">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Country</th>
            <th>Total Visits</th>
            <th>VIP</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guest in filteredGuests" :key="guest.id">
            <td class="guest-name">{{ guest.first_name }} {{ guest.last_name }}</td>
            <td>{{ guest.email }}</td>
            <td>{{ guest.phone }}</td>
            <td>{{ guest.country }}</td>
            <td>{{ guest.total_visits }}</td>
            <td>
              <span v-if="guest.vip_status" class="badge badge-warning">VIP</span>
            </td>
            <td>
              <button @click="viewGuest(guest)" class="btn btn-secondary btn-sm">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <GuestModal
      v-if="showCreateModal || showEditModal"
      :guest="selectedGuest"
      @close="closeModals"
      @saved="handleGuestSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { Guest } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()

const loading = ref(true)
const guests = ref<Guest[]>([])
const searchQuery = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedGuest = ref<Guest | null>(null)

const filteredGuests = computed(() => {
  if (!searchQuery.value) return guests.value

  const query = searchQuery.value.toLowerCase()
  return guests.value.filter(guest =>
    `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(query) ||
    guest.email?.toLowerCase().includes(query) ||
    guest.phone?.toLowerCase().includes(query)
  )
})

const loadGuests = async () => {
  try {
    loading.value = true
    const { data, error } = await $supabase
      .from('guests')
      .select('*')
      .order('last_name')

    if (error) throw error
    guests.value = data || []
  } catch (error) {
    console.error('Error loading guests:', error)
  } finally {
    loading.value = false
  }
}

const viewGuest = (guest: Guest) => {
  selectedGuest.value = guest
  showEditModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedGuest.value = null
}

const handleGuestSaved = () => {
  closeModals()
  loadGuests()
}

onMounted(() => {
  loadGuests()
})
</script>

<style scoped>
.guests-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.filters-section {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.loading, .empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.guests-table {
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

.guest-name {
  font-weight: 600;
  color: var(--neutral-900);
}
</style>
