<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <div class="modal-header">
        <h2>{{ guest ? 'Guest Details' : 'Add New Guest' }}</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label>First Name *</label>
            <input v-model="formData.first_name" type="text" class="input" required :disabled="loading || !!guest" />
          </div>
          <div class="form-group">
            <label>Last Name *</label>
            <input v-model="formData.last_name" type="text" class="input" required :disabled="loading || !!guest" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="formData.email" type="email" class="input" :disabled="loading || !!guest" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input v-model="formData.phone" type="tel" class="input" :disabled="loading || !!guest" />
          </div>
          <div class="form-group">
            <label>ID Type</label>
            <select v-model="formData.id_type" class="input" :disabled="loading || !!guest">
              <option value="">Select type</option>
              <option value="Passport">Passport</option>
              <option value="Driver's License">Driver's License</option>
              <option value="National ID">National ID</option>
            </select>
          </div>
          <div class="form-group">
            <label>ID Number</label>
            <input v-model="formData.id_number" type="text" class="input" :disabled="loading || !!guest" />
          </div>
          <div class="form-group full-width">
            <label>Address</label>
            <input v-model="formData.address" type="text" class="input" :disabled="loading || !!guest" />
          </div>
          <div class="form-group">
            <label>City</label>
            <input v-model="formData.city" type="text" class="input" :disabled="loading || !!guest" />
          </div>
          <div class="form-group">
            <label>Country</label>
            <input v-model="formData.country" type="text" class="input" :disabled="loading || !!guest" />
          </div>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary" :disabled="loading">Close</button>
          <button v-if="!guest" type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Guest' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Guest } from '~/types/database'

const props = defineProps<{ guest?: Guest | null }>()
const emit = defineEmits<{ close: [], saved: [] }>()

const { $supabase } = useNuxtApp()
const loading = ref(false)
const error = ref('')

const formData = ref({
  first_name: props.guest?.first_name || '',
  last_name: props.guest?.last_name || '',
  email: props.guest?.email || '',
  phone: props.guest?.phone || '',
  id_type: props.guest?.id_type || '',
  id_number: props.guest?.id_number || '',
  address: props.guest?.address || '',
  city: props.guest?.city || '',
  country: props.guest?.country || '',
})

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    const { error: insertError } = await $supabase
      .from('guests')
      .insert([formData.value])

    if (insertError) throw insertError
    emit('saved')
  } catch (err: any) {
    error.value = err.message || 'Failed to save guest'
  } finally {
    loading.value = false
  }
}
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
  max-width: 700px;
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
}

.btn-close:hover {
  background: var(--neutral-200);
}

.modal-body {
  padding: var(--spacing-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
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

.error-message {
  padding: var(--spacing-md);
  background: var(--error-50);
  color: var(--error-700);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--neutral-200);
}
</style>
