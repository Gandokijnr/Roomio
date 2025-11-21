<template>
  <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-semibold text-neutral-900">Staff Management</h1>
      <p class="mt-1 text-sm text-neutral-600">Manage hotel staff and user roles</p>
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
