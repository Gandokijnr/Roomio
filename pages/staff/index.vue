<template>
  <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-semibold text-neutral-900">Staff Management</h1>
        <p class="mt-1 text-sm text-neutral-600">Manage hotel staff and user roles</p>
      </div>
      <button
        v-if="canManageStaff"
        type="button"
        class="inline-flex items-center justify-center rounded-md bg-[var(--primary-600)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--primary-700)] disabled:opacity-50 disabled:cursor-not-allowed"
        @click="openCreateModal"
      >
        New Staff
      </button>
    </div>

    <div
      v-if="loading"
      class="py-10 text-center text-sm text-neutral-600"
    >
      Loading staff...
    </div>

    <div
      v-else
      class="card p-0 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-neutral-200">
          <thead class="bg-neutral-50">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-[11px] font-semibold text-neutral-700 uppercase tracking-wide">
                Name
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-[11px] font-semibold text-neutral-700 uppercase tracking-wide">
                Email
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-[11px] font-semibold text-neutral-700 uppercase tracking-wide">
                Phone
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-[11px] font-semibold text-neutral-700 uppercase tracking-wide">
                Role
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-[11px] font-semibold text-neutral-700 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 bg-white">
            <tr
              v-for="member in staff"
              :key="member.id"
              class="hover:bg-neutral-50"
            >
              <td class="px-4 sm:px-6 py-3 text-sm">
                <div class="font-semibold text-neutral-900">
                  {{ member.full_name }}
                </div>
              </td>
              <td class="px-4 sm:px-6 py-3 text-sm text-neutral-700">
                {{ member.email }}
              </td>
              <td class="px-4 sm:px-6 py-3 text-sm text-neutral-700">
                {{ member.phone || '-' }}
              </td>
              <td class="px-4 sm:px-6 py-3 text-sm">
                <span class="badge badge-primary">
                  {{ member.role }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-3 text-sm">
                <span :class="['badge', member.is_active ? 'badge-success' : 'badge-neutral']">
                  {{ member.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div class="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div class="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-neutral-900">New Staff Member</h2>
            <p class="mt-0.5 text-xs text-neutral-500">Create a new staff account and assign a role.</p>
          </div>
          <button
            type="button"
            class="text-neutral-400 hover:text-neutral-600"
            @click="closeCreateModal"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="handleCreateStaff" class="px-5 py-4 space-y-4">
          <div class="space-y-1">
            <label class="block text-xs font-medium text-neutral-700">Full Name</label>
            <input
              v-model="newStaff.full_name"
              type="text"
              required
              class="form-input w-full rounded-md border-neutral-300 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]"
              placeholder="Enter full name"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-neutral-700">Email</label>
            <input
              v-model="newStaff.email"
              type="email"
              required
              class="form-input w-full rounded-md border-neutral-300 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]"
              placeholder="name@example.com"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-neutral-700">Phone (optional)</label>
            <input
              v-model="newStaff.phone"
              type="tel"
              class="form-input w-full rounded-md border-neutral-300 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]"
              placeholder="Phone number"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-neutral-700">Role</label>
            <select
              v-model="newStaff.role"
              required
              class="form-select w-full rounded-md border-neutral-300 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)] text-sm"
            >
              <option value="receptionist">Receptionist</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="accountant">Accountant</option>
              <option value="housekeeping">Housekeeping</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-neutral-700">Temporary Password</label>
            <input
              v-model="newStaff.password"
              type="password"
              required
              minlength="8"
              class="form-input w-full rounded-md border-neutral-300 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]"
              placeholder="Minimum 8 characters"
            />
            <p class="text-[11px] text-neutral-500">Share this password with the staff member so they can sign in and update it.</p>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              @click="closeCreateModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creatingStaff"
              class="inline-flex items-center justify-center rounded-md bg-[var(--primary-600)] px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[var(--primary-700)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!creatingStaff">Create Staff</span>
              <span v-else>Creating...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Profile } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()
const { hasRole } = useAuth()

const loading = ref(true)
const staff = ref<Profile[]>([])

const showCreateModal = ref(false)
const creatingStaff = ref(false)
const newStaff = ref({
  full_name: '',
  email: '',
  phone: '',
  role: 'receptionist',
  password: '',
})

const canManageStaff = computed(() => hasRole(['admin', 'manager']))

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

const openCreateModal = () => {
  if (!canManageStaff.value) return
  newStaff.value = {
    full_name: '',
    email: '',
    phone: '',
    role: 'receptionist',
    password: '',
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  if (creatingStaff.value) return
  showCreateModal.value = false
}

const handleCreateStaff = async () => {
  if (!canManageStaff.value || creatingStaff.value) return

  if (!newStaff.value.full_name || !newStaff.value.email || !newStaff.value.role || !newStaff.value.password) {
    alert('Please fill in all required fields.')
    return
  }

  try {
    creatingStaff.value = true

    const { data } = await $supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      alert('You must be logged in to create staff.')
      return
    }

    const response: any = await $fetch('/api/staff/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: {
        full_name: newStaff.value.full_name,
        email: newStaff.value.email,
        phone: newStaff.value.phone,
        role: newStaff.value.role,
        password: newStaff.value.password,
      },
    })

    if (!response?.success) {
      alert('Failed to create staff member. Please try again.')
      return
    }

    await loadStaff()
    showCreateModal.value = false
    alert('Staff member created successfully.')
  } catch (error: any) {
    console.error('Failed to create staff:', error)
    const message = error?.statusMessage || error?.message || 'Failed to create staff member.'
    alert(message)
  } finally {
    creatingStaff.value = false
  }
}

onMounted(() => {
  loadStaff()
})
</script>
