<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <div class="modal-header">
        <h2>{{ guest ? 'Guest Profile' : 'Add New Guest' }}</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <!-- Guest Stats (for existing guests) -->
      <div v-if="guest" class="guest-stats">
        <div class="stat-card">
          <div class="stat-value">{{ guest.total_stays || 0 }}</div>
          <div class="stat-label">Total Stays</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">₦{{ (guest.total_spending || 0).toLocaleString() }}</div>
          <div class="stat-label">Total Spending</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ guest.loyalty_points || 0 }}</div>
          <div class="stat-label">Loyalty Points</div>
        </div>
        <div class="stat-card">
          <div class="stat-badge" :class="`tier-${guest.loyalty_tier || 'bronze'}`">
            {{ (guest.loyalty_tier || 'bronze').toUpperCase() }}
          </div>
          <div class="stat-label">Loyalty Tier</div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="modal-body">
        <!-- Basic Information Tab -->
        <div v-if="activeTab === 'basic'" class="tab-content">
          <form @submit.prevent="handleSubmit">
            <div class="form-section">
              <h3>Personal Information</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>First Name *</label>
                  <input v-model="formData.first_name" type="text" class="input" required :disabled="loading" />
                </div>
                <div class="form-group">
                  <label>Last Name *</label>
                  <input v-model="formData.last_name" type="text" class="input" required :disabled="loading" />
                </div>
                <div class="form-group">
                  <label>Gender</label>
                  <select v-model="formData.gender" class="input" :disabled="loading">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Date of Birth</label>
                  <input v-model="formData.date_of_birth" type="date" class="input" :disabled="loading" />
                </div>
                <div class="form-group">
                  <label>Nationality</label>
                  <input v-model="formData.nationality" type="text" class="input" :disabled="loading" placeholder="e.g., Nigerian" />
                </div>
                <div class="form-group">
                  <label>Occupation</label>
                  <input v-model="formData.occupation" type="text" class="input" :disabled="loading" />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Contact Information</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Email</label>
                  <input v-model="formData.email" type="email" class="input" :disabled="loading" />
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input v-model="formData.phone" type="tel" class="input" :disabled="loading" placeholder="+234 xxx xxx xxxx" />
                </div>
                <div class="form-group">
                  <label>Emergency Contact</label>
                  <input v-model="formData.emergency_contact" type="tel" class="input" :disabled="loading" />
                </div>
                <div class="form-group">
                  <label>City</label>
                  <input v-model="formData.city" type="text" class="input" :disabled="loading" />
                </div>
                <div class="form-group full-width">
                  <label>Address</label>
                  <input v-model="formData.address" type="text" class="input" :disabled="loading" />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Identification</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>ID Type</label>
                  <select v-model="formData.id_type" class="input" :disabled="loading">
                    <option value="">Select type</option>
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID</option>
                    <option value="driver_license">Driver's License</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>ID Number</label>
                  <input v-model="formData.id_number" type="text" class="input" :disabled="loading" />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Preferences & Notes</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Company</label>
                  <input v-model="formData.company" type="text" class="input" :disabled="loading" />
                </div>
                <div class="form-group">
                  <label>Preferred Payment Method</label>
                  <select v-model="formData.preferred_payment_method" class="input" :disabled="loading">
                    <option value="">Select method</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_payment">Mobile Payment</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>Special Preferences</label>
                  <textarea v-model="formData.special_preferences" class="input" rows="2" :disabled="loading" 
                    placeholder="e.g., Non-smoking room, Ocean view, Vegetarian meals"></textarea>
                </div>
                <div class="form-group full-width">
                  <label>Notes</label>
                  <textarea v-model="formData.notes" class="input" rows="3" :disabled="loading" 
                    placeholder="Staff notes about the guest"></textarea>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="formData.marketing_consent" :disabled="loading" />
                  Guest consents to marketing communications
                </label>
              </div>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>

            <div class="modal-footer">
              <button type="button" @click="$emit('close')" class="btn btn-secondary" :disabled="loading">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Saving...' : (guest ? 'Update Guest' : 'Create Guest') }}
              </button>
            </div>
          </form>
        </div>

        <!-- History Tab with Analytics -->
        <div v-if="activeTab === 'history' && guest" class="tab-content">
          <GuestAnalytics :guest-id="guest.id" />
        </div>

        <!-- Loyalty Tab -->
        <div v-if="activeTab === 'loyalty' && guest" class="tab-content">
          <div class="loyalty-section">
            <div class="loyalty-overview">
              <div class="loyalty-card">
                <div class="tier-badge" :class="`tier-${guest.loyalty_tier}`">
                  {{ guest.loyalty_tier?.toUpperCase() || 'BRONZE' }}
                </div>
                <div class="points-display">
                  <span class="points-value">{{ guest.loyalty_points || 0 }}</span>
                  <span class="points-label">Available Points</span>
                </div>
              </div>
            </div>
            
            <h3>Loyalty Transactions</h3>
            <div v-if="loyaltyTransactions.length === 0" class="empty-state">
              <p>No loyalty transactions found</p>
            </div>
            <div v-else class="transactions-list">
              <div v-for="transaction in loyaltyTransactions" :key="transaction.id" class="transaction-item">
                <div class="transaction-info">
                  <span class="transaction-type" :class="`type-${transaction.transaction_type}`">
                    {{ transaction.transaction_type.toUpperCase() }}
                  </span>
                  <span class="transaction-description">{{ transaction.description }}</span>
                </div>
                <div class="transaction-points" :class="{ 'negative': transaction.transaction_type === 'redeemed' }">
                  {{ transaction.transaction_type === 'redeemed' ? '-' : '+' }}{{ transaction.points }}
                </div>
                <div class="transaction-date">
                  {{ formatDate(transaction.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Communications Tab -->
        <div v-if="activeTab === 'communications' && guest" class="tab-content">
          <div class="communications-section">
            <div class="communication-actions">
              <button @click="showSendMessage = true" class="btn btn-primary btn-sm">
                Send Message
              </button>
            </div>
            
            <h3>Communication History</h3>
            <div v-if="guestCommunications.length === 0" class="empty-state">
              <p>No communications found</p>
            </div>
            <div v-else class="communications-list">
              <div v-for="comm in guestCommunications" :key="comm.id" class="communication-item">
                <div class="comm-header">
                  <span class="comm-type">{{ comm.communication_type.toUpperCase() }}</span>
                  <span class="comm-direction" :class="`direction-${comm.direction}`">
                    {{ comm.direction.toUpperCase() }}
                  </span>
                  <span class="comm-date">{{ formatDateTime(comm.created_at) }}</span>
                </div>
                <div class="comm-content">
                  <div v-if="comm.subject" class="comm-subject">{{ comm.subject }}</div>
                  <div class="comm-message">{{ comm.message }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Guest, Reservation, LoyaltyTransaction, GuestCommunication } from '~/types/database'

const props = defineProps<{ guest?: Guest | null }>()
const emit = defineEmits<{ close: [], saved: [guestId: string] }>()

const { $supabase } = useNuxtApp()
const loading = ref(false)
const error = ref('')
const activeTab = ref('basic')
const showSendMessage = ref(false)

// Tab configuration
const tabs = computed(() => {
  const baseTabs = [{ id: 'basic', label: 'Basic Info' }]
  
  if (props.guest) {
    baseTabs.push(
      { id: 'history', label: 'History' },
      { id: 'loyalty', label: 'Loyalty' },
      { id: 'communications', label: 'Communications' }
    )
  }
  
  return baseTabs
})

// Enhanced form data with all new fields
const formData = ref({
  first_name: props.guest?.first_name || '',
  last_name: props.guest?.last_name || '',
  email: props.guest?.email || '',
  phone: props.guest?.phone || '',
  gender: props.guest?.gender || '',
  date_of_birth: props.guest?.date_of_birth || '',
  nationality: props.guest?.nationality || '',
  city: props.guest?.city || '',
  address: props.guest?.address || '',
  id_type: props.guest?.id_type || '',
  id_number: props.guest?.id_number || '',
  emergency_contact: props.guest?.emergency_contact || '',
  occupation: props.guest?.occupation || '',
  company: props.guest?.company || '',
  preferred_payment_method: props.guest?.preferred_payment_method || '',
  special_preferences: props.guest?.special_preferences || '',
  notes: props.guest?.notes || '',
  marketing_consent: props.guest?.marketing_consent || false,
})

// Data for history and other tabs
const guestReservations = ref<Reservation[]>([])
const loyaltyTransactions = ref<LoyaltyTransaction[]>([])
const guestCommunications = ref<GuestCommunication[]>([])

// Load guest data when modal opens for existing guest
const loadGuestData = async () => {
  if (!props.guest?.id) return

  try {
    // Load reservations
    const { data: reservations } = await $supabase
      .from('reservations')
      .select(`
        *,
        room:rooms(room_number)
      `)
      .eq('guest_id', props.guest.id)
      .order('created_at', { ascending: false })

    guestReservations.value = reservations || []

    // Load loyalty transactions
    const { data: transactions } = await $supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('guest_id', props.guest.id)
      .order('created_at', { ascending: false })

    loyaltyTransactions.value = transactions || []

    // Load communications
    const { data: communications } = await $supabase
      .from('guest_communications')
      .select('*')
      .eq('guest_id', props.guest.id)
      .order('created_at', { ascending: false })

    guestCommunications.value = communications || []
  } catch (err) {
    console.error('Error loading guest data:', err)
  }
}

// Utility functions
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    if (props.guest) {
      // Update existing guest
      const { error: updateError } = await $supabase
        .from('guests')
        .update(formData.value)
        .eq('id', props.guest.id)

      if (updateError) throw updateError
      emit('saved', props.guest.id)
    } else {
      // Create new guest
      const { data, error: insertError } = await $supabase
        .from('guests')
        .insert([{
          ...formData.value,
          loyalty_tier: 'bronze',
          loyalty_points: 0,
          total_stays: 0,
          total_spending: 0,
          is_corporate: false
        }])
        .select('id')
        .single()

      if (insertError) throw insertError
      emit('saved', data.id)
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to save guest'
  } finally {
    loading.value = false
  }
}

// Load data when component mounts
onMounted(() => {
  if (props.guest) {
    loadGuestData()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--neutral-200);
}

.modal-header h2 {
  font-size: 1.5rem;
  color: var(--neutral-900);
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--neutral-100);
  color: var(--neutral-700);
  font-size: 1.5rem;
  line-height: 1;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: var(--neutral-200);
}

/* Guest Stats */
.guest-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--neutral-50);
  border-bottom: 1px solid var(--neutral-200);
}

.stat-card {
  text-align: center;
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-200);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tier-bronze { background: #cd7f32; color: white; }
.tier-silver { background: #c0c0c0; color: white; }
.tier-gold { background: #ffd700; color: #333; }
.tier-platinum { background: #e5e4e2; color: #333; }

/* Tab Navigation */
.tab-navigation {
  display: flex;
  border-bottom: 1px solid var(--neutral-200);
  background: var(--neutral-50);
}

.tab-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  background: transparent;
  color: var(--neutral-600);
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tab-btn:hover {
  color: var(--neutral-900);
  background: var(--neutral-100);
}

.tab-btn.active {
  color: var(--primary-600);
  border-bottom-color: var(--primary-600);
  background: white;
}

/* Tab Content */
.tab-content {
  padding: var(--spacing-lg);
}

.modal-body {
  padding: 0;
}

/* Form Sections */
.form-section {
  margin-bottom: var(--spacing-xl);
}

.form-section h3 {
  font-size: 1.125rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--neutral-200);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  color: var(--neutral-700);
  cursor: pointer;
}

/* History Section */
.history-section {
  margin-bottom: var(--spacing-xl);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.history-item {
  padding: var(--spacing-md);
  background: var(--neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-200);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.reservation-number {
  font-weight: 600;
  color: var(--primary-600);
}

.reservation-dates {
  font-size: 0.875rem;
  color: var(--neutral-600);
}

.history-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.status-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-pending { background: var(--warning-100); color: var(--warning-700); }
.status-confirmed { background: var(--primary-100); color: var(--primary-700); }
.status-checked_in { background: var(--success-100); color: var(--success-700); }
.status-checked_out { background: var(--neutral-100); color: var(--neutral-700); }
.status-cancelled { background: var(--error-100); color: var(--error-700); }

/* Loyalty Section */
.loyalty-section {
  margin-bottom: var(--spacing-xl);
}

.loyalty-overview {
  margin-bottom: var(--spacing-lg);
}

.loyalty-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  border-radius: var(--radius-lg);
  color: white;
}

.tier-badge {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.points-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.points-value {
  font-size: 2rem;
  font-weight: 600;
}

.points-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.transaction-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--neutral-50);
  border-radius: var(--radius-md);
  align-items: center;
}

.transaction-type {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.type-earned { background: var(--success-100); color: var(--success-700); }
.type-redeemed { background: var(--error-100); color: var(--error-700); }
.type-expired { background: var(--neutral-100); color: var(--neutral-700); }

.transaction-description {
  font-size: 0.875rem;
  color: var(--neutral-700);
  margin-left: var(--spacing-sm);
}

.transaction-points {
  font-weight: 600;
  color: var(--success-600);
}

.transaction-points.negative {
  color: var(--error-600);
}

.transaction-date {
  font-size: 0.75rem;
  color: var(--neutral-500);
}

/* Communications Section */
.communications-section {
  margin-bottom: var(--spacing-xl);
}

.communication-actions {
  margin-bottom: var(--spacing-lg);
}

.communications-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.communication-item {
  padding: var(--spacing-md);
  background: var(--neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-200);
}

.comm-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  align-items: center;
}

.comm-type {
  padding: 2px 6px;
  background: var(--primary-100);
  color: var(--primary-700);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.comm-direction {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.direction-inbound { background: var(--success-100); color: var(--success-700); }
.direction-outbound { background: var(--warning-100); color: var(--warning-700); }

.comm-date {
  font-size: 0.75rem;
  color: var(--neutral-500);
  margin-left: auto;
}

.comm-subject {
  font-weight: 600;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.comm-message {
  color: var(--neutral-700);
  font-size: 0.875rem;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--neutral-600);
}

/* Error Message */
.error-message {
  padding: var(--spacing-md);
  background: var(--error-50);
  color: var(--error-700);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg);
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--neutral-200);
  background: var(--neutral-50);
}

/* Responsive */
@media (max-width: 768px) {
  .guest-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    max-width: 95vw;
  }
}
</style>
