<template>
  <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Vendor Management
        </h1>
        <p class="mt-1 text-sm text-neutral-600">
          Manage suppliers and service providers
        </p>
      </div>
      <button
        @click="showVendorModal = true"
        class="btn btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
      >
        <span>+</span>
        <span>Add Vendor</span>
      </button>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex flex-wrap gap-2 mb-6 border-b border-neutral-200">
      <NuxtLink
        to="/expenses"
        class="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
      >
        Expenses
      </NuxtLink>
      <NuxtLink
        to="/expenses/vendors"
        class="px-4 py-2.5 text-sm font-medium border-b-2 border-primary-500 text-primary-700 bg-white"
      >
        Vendors
      </NuxtLink>
      <NuxtLink
        to="/expenses/analytics"
        class="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
      >
        Analytics
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="card mb-6 p-4 sm:p-5">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col gap-2 w-full sm:w-auto">
          <label class="text-sm font-medium text-neutral-700">Vendor Type</label>
          <select v-model="filters.type" class="input w-full">
            <option value="">All Types</option>
            <option v-for="type in vendorTypes" :key="type" :value="type">
              {{ formatType(type) }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2 w-full sm:w-auto">
          <label class="text-sm font-medium text-neutral-700">Status</label>
          <select v-model="filters.status" class="input w-full">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <button
          @click="loadVendors"
          class="btn btn-secondary mt-1 w-full sm:w-auto"
        >
          Apply Filters
        </button>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-neutral-600">
      Loading vendors...
    </div>

    <div
      v-else-if="vendors.length === 0"
      class="card py-12 px-6 text-center"
    >
      <div class="text-5xl mb-4">🏢</div>
      <h3 class="text-lg font-semibold text-neutral-900 mb-2">
        No vendors found
      </h3>
      <p class="text-sm text-neutral-600">
        Add vendors to track expenses
      </p>
    </div>

    <div
      v-else
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <div
        v-for="vendor in vendors"
        :key="vendor.id"
        class="card p-4 sm:p-5 flex flex-col gap-4"
      >
        <div class="flex items-start justify-between border-b border-neutral-200 pb-4 mb-2">
          <div>
            <h3 class="text-base font-semibold text-neutral-900">
              {{ vendor.vendor_name }}
            </h3>
            <span class="text-xs text-neutral-500 font-mono">
              {{ vendor.vendor_code }}
            </span>
          </div>
          <span :class="['badge', `badge-${vendor.status}`]">
            {{ vendor.status }}
          </span>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-neutral-600 font-medium">Type:</span>
            <span class="text-neutral-800">{{ formatType(vendor.vendor_type) }}</span>
          </div>
          <div class="flex justify-between" v-if="vendor.contact_person">
            <span class="text-neutral-600 font-medium">Contact:</span>
            <span class="text-neutral-800">{{ vendor.contact_person }}</span>
          </div>
          <div class="flex justify-between" v-if="vendor.email">
            <span class="text-neutral-600 font-medium">Email:</span>
            <span class="text-neutral-800 truncate max-w-[180px] text-right">{{ vendor.email }}</span>
          </div>
          <div class="flex justify-between" v-if="vendor.phone">
            <span class="text-neutral-600 font-medium">Phone:</span>
            <span class="text-neutral-800">{{ vendor.phone }}</span>
          </div>
          <div class="flex justify-between" v-if="vendor.payment_terms">
            <span class="text-neutral-600 font-medium">Payment Terms:</span>
            <span class="text-neutral-800">{{ vendor.payment_terms }}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            @click="editVendor(vendor)"
            class="btn btn-sm btn-secondary w-full sm:w-auto"
          >
            Edit
          </button>
          <button
            @click="viewVendorExpenses(vendor)"
            class="btn btn-sm btn-outline w-full sm:w-auto"
          >
            View Expenses
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Vendor Modal -->
    <div
      v-if="showVendorModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 sm:px-6 py-4 sm:py-8"
      @click.self="closeVendorModal"
    >
      <div class="card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-xl">
        <div class="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-neutral-200">
          <h2 class="text-lg font-semibold text-neutral-900 sm:text-xl">
            {{ editingVendor ? 'Edit Vendor' : 'Add New Vendor' }}
          </h2>
          <button
            @click="closeVendorModal"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 text-xl leading-none hover:bg-neutral-200 transition"
          >
            ×
          </button>
        </div>
        <div class="px-4 py-4 sm:px-6 sm:py-5">
          <form @submit.prevent="saveVendor" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Vendor Name *</label>
                <input
                  type="text"
                  v-model="vendorForm.vendor_name"
                  class="input w-full"
                  required
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Vendor Type *</label>
                <select
                  v-model="vendorForm.vendor_type"
                  class="input w-full"
                  required
                >
                  <option value="">Select Type</option>
                  <option v-for="type in vendorTypes" :key="type" :value="type">
                    {{ formatType(type) }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Contact Person</label>
                <input type="text" v-model="vendorForm.contact_person" class="input w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Email</label>
                <input type="email" v-model="vendorForm.email" class="input w-full" />
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Phone</label>
                <input type="tel" v-model="vendorForm.phone" class="input w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Status</label>
                <select v-model="vendorForm.status" class="input w-full">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-neutral-700">Address</label>
              <textarea v-model="vendorForm.address" class="input w-full resize-y" rows="2"></textarea>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">City</label>
                <input type="text" v-model="vendorForm.city" class="input w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">State</label>
                <input type="text" v-model="vendorForm.state" class="input w-full" />
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Tax ID</label>
                <input type="text" v-model="vendorForm.tax_id" class="input w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Registration Number</label>
                <input type="text" v-model="vendorForm.registration_number" class="input w-full" />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-neutral-700">Payment Terms</label>
              <input
                type="text"
                v-model="vendorForm.payment_terms"
                class="input w-full"
                placeholder="e.g., Net 30"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-neutral-700">Credit Limit</label>
              <input
                type="number"
                v-model.number="vendorForm.credit_limit"
                class="input w-full"
                step="0.01"
              />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Bank Name</label>
                <input type="text" v-model="vendorForm.bank_name" class="input w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-neutral-700">Account Number</label>
                <input type="text" v-model="vendorForm.account_number" class="input w-full" />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-neutral-700">Account Name</label>
              <input type="text" v-model="vendorForm.account_name" class="input w-full" />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-neutral-700">Notes</label>
              <textarea v-model="vendorForm.notes" class="input w-full resize-y" rows="3"></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-4 mt-2 border-t border-neutral-200">
              <button
                type="button"
                @click="closeVendorModal"
                class="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="saving"
              >
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
