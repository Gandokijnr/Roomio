<template>
  <div class="vendors-page">
    <div class="page-header">
      <div>
        <h1>Vendor Management</h1>
        <p>Manage suppliers and service providers</p>
      </div>
      <button @click="showVendorModal = true" class="btn btn-primary">
        <span class="icon">+</span>
        Add Vendor
      </button>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs">
      <NuxtLink to="/expenses" class="tab">
        Expenses
      </NuxtLink>
      <NuxtLink to="/expenses/vendors" class="tab active">
        Vendors
      </NuxtLink>
      <NuxtLink to="/expenses/analytics" class="tab">
        Analytics
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="filters card">
      <div class="filter-group">
        <label>Vendor Type</label>
        <select v-model="filters.type" class="input">
          <option value="">All Types</option>
          <option v-for="type in vendorTypes" :key="type" :value="type">
            {{ formatType(type) }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status" class="input">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      <button @click="loadVendors" class="btn btn-secondary">Apply Filters</button>
    </div>

    <div v-if="loading" class="loading">Loading vendors...</div>

    <div v-else-if="vendors.length === 0" class="empty-state card">
      <div class="empty-icon">🏢</div>
      <h3>No vendors found</h3>
      <p>Add vendors to track expenses</p>
    </div>

    <div v-else class="vendors-grid">
      <div v-for="vendor in vendors" :key="vendor.id" class="vendor-card card">
        <div class="vendor-header">
          <div>
            <h3>{{ vendor.vendor_name }}</h3>
            <span class="vendor-code">{{ vendor.vendor_code }}</span>
          </div>
          <span :class="['badge', `badge-${vendor.status}`]">
            {{ vendor.status }}
          </span>
        </div>
        
        <div class="vendor-info">
          <div class="info-item">
            <span class="label">Type:</span>
            <span>{{ formatType(vendor.vendor_type) }}</span>
          </div>
          <div class="info-item" v-if="vendor.contact_person">
            <span class="label">Contact:</span>
            <span>{{ vendor.contact_person }}</span>
          </div>
          <div class="info-item" v-if="vendor.email">
            <span class="label">Email:</span>
            <span>{{ vendor.email }}</span>
          </div>
          <div class="info-item" v-if="vendor.phone">
            <span class="label">Phone:</span>
            <span>{{ vendor.phone }}</span>
          </div>
          <div class="info-item" v-if="vendor.payment_terms">
            <span class="label">Payment Terms:</span>
            <span>{{ vendor.payment_terms }}</span>
          </div>
        </div>

        <div class="vendor-actions">
          <button @click="editVendor(vendor)" class="btn btn-sm btn-secondary">Edit</button>
          <button @click="viewVendorExpenses(vendor)" class="btn btn-sm btn-outline">View Expenses</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Vendor Modal -->
    <div v-if="showVendorModal" class="modal-overlay" @click.self="closeVendorModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingVendor ? 'Edit Vendor' : 'Add New Vendor' }}</h2>
          <button @click="closeVendorModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveVendor">
            <div class="form-row">
              <div class="form-group">
                <label>Vendor Name *</label>
                <input type="text" v-model="vendorForm.vendor_name" class="input" required />
              </div>
              <div class="form-group">
                <label>Vendor Type *</label>
                <select v-model="vendorForm.vendor_type" class="input" required>
                  <option value="">Select Type</option>
                  <option v-for="type in vendorTypes" :key="type" :value="type">
                    {{ formatType(type) }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Contact Person</label>
                <input type="text" v-model="vendorForm.contact_person" class="input" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="vendorForm.email" class="input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Phone</label>
                <input type="tel" v-model="vendorForm.phone" class="input" />
              </div>
              <div class="form-group">
                <label>Status</label>
                <select v-model="vendorForm.status" class="input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Address</label>
              <textarea v-model="vendorForm.address" class="input" rows="2"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>City</label>
                <input type="text" v-model="vendorForm.city" class="input" />
              </div>
              <div class="form-group">
                <label>State</label>
                <input type="text" v-model="vendorForm.state" class="input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tax ID</label>
                <input type="text" v-model="vendorForm.tax_id" class="input" />
              </div>
              <div class="form-group">
                <label>Registration Number</label>
                <input type="text" v-model="vendorForm.registration_number" class="input" />
              </div>
            </div>

            <div class="form-group">
              <label>Payment Terms</label>
              <input type="text" v-model="vendorForm.payment_terms" class="input" placeholder="e.g., Net 30" />
            </div>

            <div class="form-group">
              <label>Credit Limit</label>
              <input type="number" v-model.number="vendorForm.credit_limit" class="input" step="0.01" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Bank Name</label>
                <input type="text" v-model="vendorForm.bank_name" class="input" />
              </div>
              <div class="form-group">
                <label>Account Number</label>
                <input type="text" v-model="vendorForm.account_number" class="input" />
              </div>
            </div>

            <div class="form-group">
              <label>Account Name</label>
              <input type="text" v-model="vendorForm.account_name" class="input" />
            </div>

            <div class="form-group">
              <label>Notes</label>
              <textarea v-model="vendorForm.notes" class="input" rows="3"></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeVendorModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Vendor' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Vendor, VendorType, VendorStatus } from '~/types/accounting'

definePageMeta({
  middleware: ['auth', 'role']
})

const { createVendor, getVendors, updateVendor } = useExpenseTracking()

const loading = ref(true)
const saving = ref(false)
const vendors = ref<Vendor[]>([])
const showVendorModal = ref(false)
const editingVendor = ref<Vendor | null>(null)

const vendorTypes: VendorType[] = [
  'food_supplier',
  'beverage_supplier',
  'maintenance',
  'utilities',
  'cleaning_supplies',
  'equipment',
  'professional_service',
  'other'
]

const filters = ref({
  type: '' as VendorType | '',
  status: 'active' as VendorStatus
})

const vendorForm = ref({
  vendor_name: '',
  vendor_type: '' as VendorType,
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: 'Nigeria',
  tax_id: '',
  registration_number: '',
  payment_terms: '',
  credit_limit: 0,
  bank_name: '',
  account_number: '',
  account_name: '',
  status: 'active' as VendorStatus,
  notes: ''
})

const loadVendors = async () => {
  try {
    loading.value = true
    const { data, error } = await getVendors(
      filters.value.type || undefined,
      filters.value.status
    )

    if (error) throw new Error(error)
    vendors.value = data || []
  } catch (error) {
    console.error('Error loading vendors:', error)
  } finally {
    loading.value = false
  }
}

const saveVendor = async () => {
  try {
    saving.value = true

    if (editingVendor.value) {
      const { error } = await updateVendor(editingVendor.value.id, vendorForm.value)
      if (error) throw new Error(error)
    } else {
      const { error } = await createVendor(vendorForm.value)
      if (error) throw new Error(error)
    }

    closeVendorModal()
    await loadVendors()
  } catch (error) {
    console.error('Error saving vendor:', error)
    alert('Failed to save vendor')
  } finally {
    saving.value = false
  }
}

const editVendor = (vendor: Vendor) => {
  editingVendor.value = vendor
  vendorForm.value = {
    vendor_name: vendor.vendor_name,
    vendor_type: vendor.vendor_type,
    contact_person: vendor.contact_person || '',
    email: vendor.email || '',
    phone: vendor.phone || '',
    address: vendor.address || '',
    city: vendor.city || '',
    state: vendor.state || '',
    country: vendor.country,
    tax_id: vendor.tax_id || '',
    registration_number: vendor.registration_number || '',
    payment_terms: vendor.payment_terms || '',
    credit_limit: vendor.credit_limit || 0,
    bank_name: vendor.bank_name || '',
    account_number: vendor.account_number || '',
    account_name: vendor.account_name || '',
    status: vendor.status,
    notes: vendor.notes || ''
  }
  showVendorModal.value = true
}

const viewVendorExpenses = (vendor: Vendor) => {
  // Navigate to expenses page with vendor filter
  navigateTo(`/expenses?vendor=${vendor.id}`)
}

const closeVendorModal = () => {
  showVendorModal.value = false
  editingVendor.value = null
  vendorForm.value = {
    vendor_name: '',
    vendor_type: '' as VendorType,
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    tax_id: '',
    registration_number: '',
    payment_terms: '',
    credit_limit: 0,
    bank_name: '',
    account_number: '',
    account_name: '',
    status: 'active',
    notes: ''
  }
}

const formatType = (type: string) => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

onMounted(() => {
  loadVendors()
})
</script>

<style scoped>
.vendors-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--neutral-200);
}

.tab {
  padding: var(--spacing-md) var(--spacing-lg);
  text-decoration: none;
  color: var(--neutral-600);
  font-weight: 600;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--primary-600);
  background: var(--neutral-50);
}

.tab.active {
  color: var(--primary-600);
  border-bottom-color: var(--primary-600);
}

.filters {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-end;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filter-group label {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--neutral-700);
}

.loading, .empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.vendors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.vendor-card {
  padding: var(--spacing-lg);
}

.vendor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--neutral-200);
}

.vendor-header h3 {
  font-size: 1.125rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.vendor-code {
  font-size: 0.75rem;
  color: var(--neutral-500);
  font-family: monospace;
}

.vendor-info {
  margin-bottom: var(--spacing-md);
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  font-size: 0.875rem;
}

.info-item .label {
  color: var(--neutral-600);
  font-weight: 600;
}

.vendor-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 0.813rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--neutral-300);
  color: var(--neutral-700);
}

.btn-outline:hover {
  background: var(--neutral-50);
}

.badge-active {
  background: var(--success-100);
  color: var(--success-700);
}

.badge-inactive {
  background: var(--neutral-100);
  color: var(--neutral-700);
}

.badge-suspended {
  background: var(--error-100);
  color: var(--error-700);
}

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
  padding: var(--spacing-md);
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--neutral-500);
  line-height: 1;
}

.modal-body {
  padding: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--neutral-700);
  margin-bottom: var(--spacing-xs);
}

.input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: var(--primary-600);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-700);
}

.btn-secondary {
  background: var(--neutral-200);
  color: var(--neutral-700);
}

.btn-secondary:hover {
  background: var(--neutral-300);
}

.icon {
  margin-right: var(--spacing-xs);
}
</style>
