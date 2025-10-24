<template>
  <div class="seed-data-page">
    <div class="page-header">
      <h1>Seed Database</h1>
      <p>Initialize your database with default room types and sample data</p>
    </div>

    <div class="seed-section card">
      <h2>Room Types</h2>
      <p>Add default room types to your database</p>
      
      <div v-if="roomTypesStatus" class="status-message" :class="roomTypesStatus.type">
        {{ roomTypesStatus.message }}
      </div>
      
      <button 
        @click="seedRoomTypes" 
        :disabled="loading.roomTypes"
        class="btn btn-primary"
      >
        {{ loading.roomTypes ? 'Adding Room Types...' : 'Add Default Room Types' }}
      </button>
      
      <div v-if="existingRoomTypes.length > 0" class="existing-data">
        <h3>Existing Room Types ({{ existingRoomTypes.length }})</h3>
        <ul>
          <li v-for="type in existingRoomTypes" :key="type.id">
            {{ type.name }} - ${{ type.base_price }}/night ({{ type.max_occupancy }} guests)
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoomType } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'default'
})

const { $supabase } = useNuxtApp()

const loading = ref({
  roomTypes: false
})

const roomTypesStatus = ref<{type: 'success' | 'error', message: string} | null>(null)
const existingRoomTypes = ref<RoomType[]>([])

const defaultRoomTypes = [
  {
    name: 'Standard Single',
    description: 'Comfortable single room with basic amenities',
    base_price: 80.00,
    max_occupancy: 1,
    amenities: ['WiFi', 'AC', 'TV', 'Private Bathroom'],
    tags: ['Budget', 'Business', 'Solo Travel']
  },
  {
    name: 'Standard Double',
    description: 'Spacious double room perfect for couples',
    base_price: 120.00,
    max_occupancy: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Private Bathroom', 'Mini Fridge'],
    tags: ['Romantic', 'Couples', 'Standard']
  },
  {
    name: 'Deluxe Room',
    description: 'Enhanced room with premium amenities and city view',
    base_price: 180.00,
    max_occupancy: 2,
    amenities: ['WiFi', 'AC', 'Smart TV', 'Private Bathroom', 'Mini Bar', 'City View', 'Work Desk'],
    tags: ['Premium', 'City View', 'Business', 'Deluxe']
  },
  {
    name: 'Family Suite',
    description: 'Large suite ideal for families with separate living area',
    base_price: 250.00,
    max_occupancy: 4,
    amenities: ['WiFi', 'AC', 'Smart TV', 'Private Bathroom', 'Mini Bar', 'Separate Living Area', 'Sofa Bed', 'Kitchenette'],
    tags: ['Family Friendly', 'Suite', 'Spacious', 'Kids Welcome']
  },
  {
    name: 'Executive Suite',
    description: 'Luxury suite with premium amenities and services',
    base_price: 350.00,
    max_occupancy: 2,
    amenities: ['WiFi', 'AC', 'Smart TV', 'Private Bathroom', 'Mini Bar', 'Ocean View', 'Balcony', 'Premium Toiletries', 'Concierge Service'],
    tags: ['Luxury', 'Executive', 'Ocean View', 'VIP', 'Premium']
  },
  {
    name: 'Presidential Suite',
    description: 'Ultimate luxury accommodation with exclusive amenities',
    base_price: 500.00,
    max_occupancy: 4,
    amenities: ['WiFi', 'AC', 'Smart TV', 'Private Bathroom', 'Full Bar', 'Ocean View', 'Large Balcony', 'Jacuzzi', 'Butler Service', 'Separate Dining Area'],
    tags: ['Luxury', 'VIP', 'Presidential', 'Ocean View', 'Honeymoon', 'Ultra Premium']
  }
]

const loadExistingRoomTypes = async () => {
  try {
    const { data, error } = await $supabase
      .from('room_types')
      .select('*')
      .order('name')
    
    if (error) throw error
    existingRoomTypes.value = data || []
  } catch (error) {
    console.error('Error loading room types:', error)
  }
}

const seedRoomTypes = async () => {
  loading.value.roomTypes = true
  roomTypesStatus.value = null
  
  try {
    // Check existing room types
    const existingNames = existingRoomTypes.value.map(type => type.name)
    const newTypes = defaultRoomTypes.filter(type => !existingNames.includes(type.name))
    
    if (newTypes.length === 0) {
      roomTypesStatus.value = {
        type: 'success',
        message: 'All room types already exist!'
      }
      return
    }
    
    const { data, error } = await $supabase
      .from('room_types')
      .insert(newTypes)
      .select()
    
    if (error) throw error
    
    roomTypesStatus.value = {
      type: 'success',
      message: `Successfully added ${newTypes.length} room types!`
    }
    
    // Reload existing room types
    await loadExistingRoomTypes()
    
  } catch (error: any) {
    console.error('Error seeding room types:', error)
    roomTypesStatus.value = {
      type: 'error',
      message: `Error: ${error.message}`
    }
  } finally {
    loading.value.roomTypes = false
  }
}

onMounted(() => {
  loadExistingRoomTypes()
})
</script>

<style scoped>
.seed-data-page {
  max-width: 800px;
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

.seed-section {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.seed-section h2 {
  font-size: 1.25rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-sm);
}

.seed-section p {
  color: var(--neutral-600);
  margin-bottom: var(--spacing-lg);
}

.status-message {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
}

.status-message.success {
  background: var(--success-50);
  color: var(--success-700);
  border: 1px solid var(--success-200);
}

.status-message.error {
  background: var(--error-50);
  color: var(--error-700);
  border: 1px solid var(--error-200);
}

.existing-data {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--neutral-200);
}

.existing-data h3 {
  font-size: 1rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-md);
}

.existing-data ul {
  list-style: none;
  padding: 0;
}

.existing-data li {
  padding: var(--spacing-sm);
  background: var(--neutral-50);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--neutral-700);
}
</style>
