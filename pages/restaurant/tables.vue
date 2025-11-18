<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Restaurant Tables</h1>
          <p class="mt-1 text-sm text-gray-500">
            Manage dining tables, sections, and capacities for the restaurant.
          </p>
        </div>
        <NuxtLink
          to="/restaurant"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
        >
          Back to Restaurant
        </NuxtLink>
      </div>

      <!-- Tables content -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-4 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 class="text-base font-medium text-gray-900">Dining Tables</h2>
            <p class="mt-1 text-sm text-gray-500">
              Overview of restaurant tables, capacity, and current reservations.
            </p>
          </div>
        </div>

        <div class="px-4 py-3 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">
              <span v-if="!loading && tables.length > 0">{{ tables.length }} table(s) found</span>
              <span v-else-if="loading">Loading tables...</span>
              <span v-else>No tables found</span>
            </div>
            <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <div class="flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span>Available</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                <span>Occupied</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
                <span>Reserved</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                <span>Blocked</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="fetchTables"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-gold-500"
          >
            Refresh
          </button>
        </div>

        <div v-if="error" class="px-4 py-3 sm:px-6 text-sm text-red-600 border-b border-red-100 bg-red-50">
          {{ error }}
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Reservation
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="6" class="px-6 py-6 text-center text-sm text-gray-500">
                  Loading tables...
                </td>
              </tr>
              <tr v-else-if="!loading && tables.length === 0">
                <td colspan="6" class="px-6 py-6 text-center text-sm text-gray-500">
                  No tables found. Add tables in the restaurant setup.
                </td>
              </tr>
              <tr v-else v-for="table in tables" :key="table.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="font-medium">
                    Table {{ table.table_number || '-' }}
                  </div>
                  <div v-if="table.name" class="text-xs text-gray-500">
                    {{ table.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ table.location || 'Main' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ table.capacity || 0 }} guests
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="getStatusClass(table.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ formatStatus(table.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="table.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'"
                  >
                    <span
                      class="inline-block w-1.5 h-1.5 rounded-full mr-1"
                      :class="table.is_active ? 'bg-green-500' : 'bg-gray-400'"
                    ></span>
                    {{ table.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div v-if="getCurrentReservation(table)">
                    <div class="text-sm">
                      {{ getCurrentReservation(table).party_size }} guests
                    </div>
                    <div class="text-xs text-gray-500" v-if="getCurrentReservation(table).guest">
                      {{ getCurrentReservation(table).guest.first_name }}
                      {{ getCurrentReservation(table).guest.last_name }}
                    </div>
                    <div class="text-xs text-gray-400">
                      Status: {{ getCurrentReservation(table).status }}
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-500">
                    None
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role']
})

const tables = ref([])
const loading = ref(false)
const error = ref('')

const fetchTables = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await $fetch('/api/restaurant/tables')
    tables.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error fetching tables:', err)
    error.value = 'Failed to load tables. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  const statuses = {
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    blocked: 'Blocked'
  }
  return statuses[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    blocked: 'bg-gray-200 text-gray-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getCurrentReservation = (table) => {
  if (!table || !table.current_reservation) return null
  const res = Array.isArray(table.current_reservation)
    ? table.current_reservation[0]
    : table.current_reservation
  return res || null
}

onMounted(() => {
  fetchTables()
})
</script>
