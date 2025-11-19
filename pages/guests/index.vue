<template>
  <div class="p-6 mx-auto max-w-7xl">
    <!-- Header with Stats -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="mb-2 text-3xl font-semibold text-gray-900">
          Guest Management
        </h1>
        <p class="text-gray-600">
          Centralized database for all hotel guests and customer relationships
        </p>
      </div>
      <div class="flex gap-4">
        <button
          @click="exportGuests"
          class="px-4 py-2 text-white transition-colors btn btn-secondary"
        >
          📊 Export Data
        </button>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 text-white transition-colors btn btn-primary"
        >
          + Add Guest
        </button>
      </div>
    </div>

    <!-- Guest Statistics -->
    <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
      <div class="p-6 bg-white border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Guests</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ guestStats.total }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <span class="text-2xl">👥</span>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">VIP Guests</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ guestStats.vip }}
            </p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <span class="text-2xl">⭐</span>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Corporate Guests</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ guestStats.corporate }}
            </p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <span class="text-2xl">🏢</span>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">New This Month</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ guestStats.newThisMonth }}
            </p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <span class="text-2xl">📈</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="p-6 mb-6 bg-white border border-gray-200 rounded-lg">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="md:col-span-2">
          <label class="block mb-2 text-sm font-medium text-gray-700"
            >Search Guests</label
          >
          <input
            v-model="filters.search"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search by name, email, phone, or guest ID..."
          />
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700"
            >Loyalty Tier</label
          >
          <select
            v-model="filters.loyaltyTier"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Tiers</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700"
            >Guest Type</label
          >
          <select
            v-model="filters.guestType"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="individual">Individual</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 text-center text-gray-600">
      Loading guests...
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredGuests.length === 0"
      class="py-12 text-center bg-white border border-gray-200 rounded-lg"
    >
      <div class="mb-4 text-6xl">👤</div>
      <h3 class="mb-2 text-xl font-semibold text-gray-900">No guests found</h3>
      <p class="mb-4 text-gray-600">
        Try adjusting your search criteria or add a new guest
      </p>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 text-white transition-colors bg-yellow-600 rounded-md hover:bg-yellow-700"
      >
        Add First Guest
      </button>
    </div>

    <!-- Guests Table -->
    <div
      v-else
      class="overflow-hidden bg-white border border-gray-200 rounded-lg"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b-2 border-gray-200 bg-gray-50">
            <tr>
              <th
                class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase"
              >
                Guest
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase"
              >
                Contact
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase"
              >
                Loyalty
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase"
              >
                Stats
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase"
              >
                Last Visit
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="guest in filteredGuests"
              :key="guest.id"
              class="transition-colors hover:bg-gray-50"
            >
              <!-- Guest Info -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full"
                  >
                    <span class="text-sm font-semibold text-gray-600">
                      {{ guest.first_name?.[0] }}{{ guest.last_name?.[0] }}
                    </span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ guest.first_name }} {{ guest.last_name }}
                    </div>
                    <div class="text-xs text-gray-500">
                      ID: {{ guest.guest_id || "N/A" }}
                    </div>
                    <div
                      v-if="guest.is_corporate"
                      class="text-xs text-blue-600"
                    >
                      🏢 {{ guest.company }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Contact -->
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900">
                  {{ guest.email || "No email" }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ guest.phone || "No phone" }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ guest.nationality || "Unknown" }}
                </div>
              </td>

              <!-- Loyalty -->
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      {
                        'bg-yellow-100 text-yellow-800':
                          guest.loyalty_tier === 'bronze',
                        'bg-gray-100 text-gray-800':
                          guest.loyalty_tier === 'silver',
                        'bg-yellow-200 text-yellow-900':
                          guest.loyalty_tier === 'gold',
                        'bg-purple-100 text-purple-800':
                          guest.loyalty_tier === 'platinum',
                      },
                    ]"
                  >
                    {{ (guest.loyalty_tier || "bronze").toUpperCase() }}
                  </span>
                  <div class="text-xs text-gray-500">
                    {{ guest.loyalty_points || 0 }} points
                  </div>
                </div>
              </td>

              <!-- Stats -->
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900">
                  {{ guest.total_stays || 0 }} stays
                </div>
                <div class="text-xs text-gray-500">
                  ₦{{ (guest.total_spending || 0).toLocaleString() }}
                </div>
              </td>

              <!-- Last Visit -->
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900">
                  {{
                    guest.last_visit_date
                      ? formatDate(guest.last_visit_date)
                      : "Never"
                  }}
                </div>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    @click="viewGuest(guest)"
                    class="flex items-center justify-center w-8 h-8 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
                    title="View Profile"
                  >
                    👁️
                  </button>
                  <button
                    @click="editGuest(guest)"
                    class="flex items-center justify-center w-8 h-8 transition-colors bg-blue-100 rounded-md hover:bg-blue-200"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    @click="sendMessage(guest)"
                    class="flex items-center justify-center w-8 h-8 transition-colors bg-green-100 rounded-md hover:bg-green-200"
                    title="Send Message"
                  >
                    💬
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <GuestModal
      v-if="showCreateModal || showEditModal"
      :guest="selectedGuest"
      @close="closeModals"
      @saved="handleGuestSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { Guest } from "~/types/database";
import { format } from "date-fns";

definePageMeta({
  middleware: ["auth", "role"],
});

const { $supabase } = useNuxtApp();

const loading = ref(true);
const guests = ref<Guest[]>([]);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedGuest = ref<Guest | null>(null);

// Filter states
const filters = reactive({
  search: "",
  loyaltyTier: "",
  guestType: "",
});

// Guest statistics
const guestStats = ref({
  total: 0,
  vip: 0,
  corporate: 0,
  newThisMonth: 0,
});

// Computed filtered guests
const filteredGuests = computed(() => {
  let filtered = guests.value;

  // Search filter
  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(
      (guest) =>
        `${guest.first_name} ${guest.last_name}`
          .toLowerCase()
          .includes(query) ||
        guest.email?.toLowerCase().includes(query) ||
        guest.phone?.toLowerCase().includes(query) ||
        guest.guest_id?.toLowerCase().includes(query)
    );
  }

  // Loyalty tier filter
  if (filters.loyaltyTier) {
    filtered = filtered.filter(
      (guest) => guest.loyalty_tier === filters.loyaltyTier.toLowerCase()
    );
  }

  // Guest type filter
  if (filters.guestType) {
    filtered = filtered.filter((guest) => {
      if (filters.guestType === "corporate") return guest.is_corporate;
      return !guest.is_corporate;
    });
  }

  return filtered;
});

// Format date helper
const formatDate = (date: string) => {
  return format(new Date(date), "MMM d, yyyy");
};

// Load guests from database
const loadGuests = async () => {
  try {
    loading.value = true;
    const { data, error } = await $supabase
      .from('guests')
      .select('*')
      .order('last_name');

    if (error) throw error;
    guests.value = data || [];
    
    // Calculate stats
    calculateStats();
  } catch (error) {
    console.error('Error loading guests:', error);
  } finally {
    loading.value = false;
  }
};

// Calculate guest statistics
const calculateStats = () => {
  const total = guests.value.length;
  const vip = guests.value.filter(g => g.loyalty_tier === 'gold' || g.loyalty_tier === 'platinum').length;
  const corporate = guests.value.filter(g => g.is_corporate).length;
  
  // Calculate new guests this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = guests.value.filter(g => {
    const createdAt = new Date(g.created_at);
    return createdAt >= startOfMonth;
  }).length;

  guestStats.value = {
    total,
    vip,
    corporate,
    newThisMonth
  };
};

// View guest profile
const viewGuest = (guest: Guest) => {
  selectedGuest.value = guest;
  showEditModal.value = true;
};

// Edit guest
const editGuest = (guest: Guest) => {
  selectedGuest.value = guest;
  showEditModal.value = true;
};

// Send message to guest
const sendMessage = (guest: Guest) => {
  if (!guest.email) {
    alert("Guest has no email address");
    return;
  }
  // TODO: Implement guest communication modal
  alert(`Send message to ${guest.first_name} ${guest.last_name} at ${guest.email}`);
};

const exportGuests = async () => {
  const csvContent = [
    // CSV Headers
    [
      "Guest ID",
      "Name",
      "Email",
      "Phone",
      "Loyalty Tier",
      "Total Stays",
      "Total Spending",
    ].join(","),
    // CSV Data
    ...filteredGuests.value.map((guest) =>
      [
        guest.guest_id,
        `${guest.first_name} ${guest.last_name}`,
        guest.email || "",
        guest.phone || "",
        guest.loyalty_tier,
        guest.total_stays,
        guest.total_spending,
      ].join(",")
    ),
  ].join("\n");

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", `guests-${format(new Date(), "yyyy-MM-dd")}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  selectedGuest.value = null;
};

const handleGuestSaved = () => {
  closeModals();
  loadGuests();
};

// Load initial data
onMounted(() => {
  loadGuests();
});
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

.loading,
.empty-state {
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
