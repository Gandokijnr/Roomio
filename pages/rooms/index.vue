<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-neutral-900 sm:text-3xl">Rooms Management</h1>
        <p class="mt-1 text-sm text-neutral-600">Manage hotel rooms and availability</p>
      </div>
      <button
        v-if="canManageRooms()"
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        + Add Room
      </button>
    </div>

    <div class="card p-6 mb-8">
      <div class="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div class="grid flex-1 min-w-0 gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-neutral-700">Search</label>
            <input
              v-model="filters.search"
              type="text"
              class="input"
              placeholder="Room number, name, type, amenities..."
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-neutral-700">Status</label>
            <select v-model="filters.status" class="input">
              <option value="">All Statuses</option>
              <option value="available">🟢 Available</option>
              <option value="occupied">🔴 Occupied</option>
              <option value="reserved">🟡 Reserved</option>
              <option value="maintenance">⚙️ Under Maintenance</option>
              <option value="cleaning">🧹 Cleaning</option>
              <option value="out_of_service">❌ Out of Service</option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-neutral-700">Room Type</label>
            <select v-model="filters.roomType" class="input">
              <option value="">All Types</option>
              <option v-for="type in roomTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-neutral-700">Floor</label>
            <select v-model="filters.floor" class="input">
              <option value="">All Floors</option>
              <option v-for="floor in availableFloors" :key="floor" :value="floor">
                Floor {{ floor }}
              </option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-neutral-700">Price Range</label>
            <select v-model="filters.priceRange" class="input">
              <option value="">All Prices</option>
              <option value="0-100">₦0 - ₦100</option>
              <option value="100-200">₦100 - ₦200</option>
              <option value="200-500">₦200 - ₦500</option>
              <option value="500+">₦500+</option>
            </select>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div class="flex items-center gap-2">
            <button
              @click="viewMode = 'grid'"
              :class="['btn', 'btn-sm', viewMode === 'grid' ? 'btn-primary' : 'btn-secondary']"
            >
              🏨 Grid
            </button>
            <button
              @click="viewMode = 'list'"
              :class="['btn', 'btn-sm', viewMode === 'list' ? 'btn-primary' : 'btn-secondary']"
            >
              📋 List
            </button>
          </div>
          <div class="flex gap-2 justify-end" v-if="canManageRooms()">
            <button
              @click="showBulkImport = true"
              class="btn btn-secondary btn-sm"
            >
              📤 Bulk Import
            </button>
            <button
              @click="exportRooms"
              class="btn btn-secondary btn-sm"
            >
              📥 Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-neutral-600">Loading rooms...</div>

    <div v-else-if="filteredRooms.length === 0" class="card py-12 px-6 text-center">
      <div class="text-5xl mb-4">🏨</div>
      <h3 class="text-lg font-semibold text-neutral-900 mb-2">No rooms found</h3>
      <p class="text-sm text-neutral-600">Try adjusting your filters or add a new room</p>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="room in filteredRooms" :key="room.id" class="card flex flex-col p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div v-if="room.featured_image" class="w-full h-40 -mt-6 -mx-6 mb-4 overflow-hidden rounded-t-lg">
          <img :src="room.featured_image" :alt="`Room ${room.room_number}`" class="w-full h-full object-cover" />
        </div>
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
          <div class="flex flex-col gap-1">
            <div class="text-lg font-semibold text-neutral-900">Room {{ room.room_number }}</div>
            <div v-if="room.room_name" class="text-sm text-neutral-600">{{ room.room_name }}</div>
          </div>
          <span :class="['badge', `badge-${getStatusColor(room.status)}`]">
            {{ getStatusIcon(room.status) }} {{ formatStatus(room.status) }}
          </span>
        </div>
        <div class="space-y-2 mb-6 text-sm">
          <div class="flex justify-between">
            <span class="text-neutral-600">Type:</span>
            <span class="font-medium text-neutral-900">{{ room.room_type?.name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-600">Capacity:</span>
            <span class="font-medium text-neutral-900">{{ room.capacity }} guests</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-600">Floor:</span>
            <span class="font-medium text-neutral-900">{{ room.floor }}{{ room.section ? ` (${room.section})` : '' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-600">Bed:</span>
            <span class="font-medium text-neutral-900">{{ room.bed_type }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-600">Price:</span>
            <span class="font-medium text-neutral-900">₦{{ room.price_per_night }}/night</span>
          </div>
        </div>
        <div v-if="room.parsedAmenities.length > 0" class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="amenity in room.parsedAmenities.slice(0, 3)"
            :key="amenity"
            class="inline-flex items-center rounded-full bg-primary-100 text-primary-800 px-2.5 py-1 text-xs font-medium"
          >
            {{ amenity }}
          </span>
          <span
            v-if="room.parsedAmenities.length > 3"
            class="inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2.5 py-1 text-xs font-medium"
          >
            +{{ room.parsedAmenities.length - 3 }} more
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <button
            @click="viewRoom(room)"
            class="btn btn-secondary btn-sm w-full"
          >
            View Details
          </button>
          <button
            v-if="canManageRooms()"
            @click="editRoom(room)"
            class="btn btn-secondary btn-sm w-full"
          >
            Edit
          </button>
          <button
            v-if="canDeleteRooms()"
            @click="deleteRoom(room)"
            class="btn btn-error btn-sm w-full"
          >
            Delete
          </button>
          <div v-if="canUpdateRoomStatus()" class="mt-2">
            <select
              @change="updateRoomStatus(room, $event)"
              :value="room.status"
              class="mt-1 w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
              <option value="cleaning">Cleaning</option>
              <option value="out_of_service">Out of Service</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="card overflow-hidden mt-6">
      <div class="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,1.5fr] gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-700 uppercase tracking-wide">
        <div>Room</div>
        <div>Type</div>
        <div>Status</div>
        <div>Capacity</div>
        <div>Price</div>
        <div>Actions</div>
      </div>
      <div
        v-for="room in filteredRooms"
        :key="room.id"
        class="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,1fr,1.5fr] gap-4 px-4 py-4 sm:px-6 border-b border-neutral-100 items-start md:items-center hover:bg-neutral-50"
      >
        <div>
          <div class="flex flex-col gap-1">
            <div class="text-sm font-semibold text-neutral-900">{{ room.room_number }}</div>
            <div v-if="room.room_name" class="text-sm text-neutral-600">{{ room.room_name }}</div>
            <div class="text-xs text-neutral-500">Floor {{ room.floor }}{{ room.section ? ` • ${room.section}` : '' }}</div>
          </div>
        </div>
        <div class="text-sm text-neutral-900">{{ room.room_type?.name }}</div>
        <div>
          <span :class="['badge', `badge-${getStatusColor(room.status)}`]">
            {{ getStatusIcon(room.status) }} {{ formatStatus(room.status) }}
          </span>
        </div>
        <div class="text-sm text-neutral-900">{{ room.capacity }} guests</div>
        <div class="text-sm font-medium text-neutral-900">₦{{ room.price_per_night }}/night</div>
        <div>
          <div class="flex flex-wrap gap-2">
            <button @click="viewRoom(room)" class="btn btn-secondary btn-xs">View</button>
            <button v-if="canManageRooms()" @click="editRoom(room)" class="btn btn-secondary btn-xs">Edit</button>
          </div>
        </div>
      </div>
    </div>

    <RoomModal
      v-if="showCreateModal || showEditModal"
      :room="selectedRoom"
      :room-types="roomTypes"
      @close="closeModals"
      @saved="handleRoomSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { Room, RoomType, RoomStatus } from '~/types/database'

// Utility function to safely parse JSON arrays from database
const parseJsonArray = (value: any): string[] => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()
const { canManageRooms, canDeleteRooms, hasRole } = useAuth()

const canUpdateRoomStatus = () => {
  return hasRole(['admin', 'manager', 'receptionist', 'housekeeping'])
}

const loading = ref(true)
const rooms = ref<Room[]>([])
const roomTypes = ref<RoomType[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedRoom = ref<Room | null>(null)

const filters = ref({
  search: '',
  status: '' as RoomStatus | '',
  roomType: '',
  floor: '',
  priceRange: '',
})

const viewMode = ref<'grid' | 'list'>('grid')
const showBulkImport = ref(false)

// Computed property to parse amenities and tags for all rooms
const roomsWithParsedData = computed(() => {
  return rooms.value.map(room => ({
    ...room,
    parsedAmenities: parseJsonArray(room.amenities),
    parsedTags: parseJsonArray(room.tags)
  }))
})

const filteredRooms = computed(() => {
  return roomsWithParsedData.value.filter(room => {
    // Search filter
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      const matchesSearch =
        room.room_number.toLowerCase().includes(search) ||
        room.room_name?.toLowerCase().includes(search) ||
        room.room_type?.name.toLowerCase().includes(search) ||
        room.section?.toLowerCase().includes(search) ||
        room.parsedAmenities.some(amenity => amenity.toLowerCase().includes(search)) ||
        room.parsedTags.some(tag => tag.toLowerCase().includes(search))
      if (!matchesSearch) return false
    }

    // Status filter
    if (filters.value.status && room.status !== filters.value.status) {
      return false
    }

    // Room type filter
    if (filters.value.roomType && room.room_type_id !== filters.value.roomType) {
      return false
    }

    // Floor filter
    if (filters.value.floor) {
      const selectedFloor = parseInt(filters.value.floor)
      if (room.floor !== selectedFloor) {
        return false
      }
    }

    // Price range filter
    if (filters.value.priceRange) {
      const price = room.price_per_night
      const range = filters.value.priceRange
      if (range === '0-100' && (price < 0 || price > 100)) return false
      if (range === '100-200' && (price < 100 || price > 200)) return false
      if (range === '200-500' && (price < 200 || price > 500)) return false
      if (range === '500+' && price < 500) return false
    }

    return true
  })
})

// Computed properties for filters
const availableFloors = computed(() => {
  const floors = [...new Set(rooms.value.map(room => room.floor))]
  return floors.sort((a, b) => a - b)
})

const loadRooms = async () => {
  try {
    loading.value = true
    const { data, error } = await $supabase
      .from('rooms')
      .select('*, room_type:room_types(*)')
      .eq('is_active', true)
      .order('room_number')

    if (error) throw error
    rooms.value = data || []
    
    // Debug: Log the first room's amenities to see the format
    if (data && data.length > 0) {
      console.log('Sample room data:', {
        room_number: data[0].room_number,
        amenities: data[0].amenities,
        amenities_type: typeof data[0].amenities,
        parsed_amenities: parseJsonArray(data[0].amenities)
      })
    }
  } catch (error) {
    console.error('Error loading rooms:', error)
  } finally {
    loading.value = false
  }
}

const loadRoomTypes = async () => {
  try {
    const { data, error } = await $supabase
      .from('room_types')
      .select('*')
      .order('name')

    if (error) throw error
    roomTypes.value = data || []
  } catch (error) {
    console.error('Error loading room types:', error)
  }
}

const getStatusColor = (status: RoomStatus) => {
  const colors: Record<RoomStatus, string> = {
    available: 'success',
    occupied: 'error',
    reserved: 'warning',
    maintenance: 'neutral',
    cleaning: 'info',
    out_of_service: 'error',
    needs_cleaning: 'warning',
    assigned_housekeeper: 'info',
  }
  return colors[status] || 'neutral'
}

const getStatusIcon = (status: RoomStatus) => {
  const icons: Record<RoomStatus, string> = {
    available: '🟢',
    occupied: '🔴',
    reserved: '🟡',
    maintenance: '⚙️',
    cleaning: '🧹',
    out_of_service: '❌',
    needs_cleaning: '🧹',
    assigned_housekeeper: '👤',
  }
  return icons[status] || '⚪'
}

const formatStatus = (status: RoomStatus) => {
  const labels: Record<RoomStatus, string> = {
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    maintenance: 'Maintenance',
    cleaning: 'Cleaning',
    out_of_service: 'Out of Service',
    needs_cleaning: 'Needs Cleaning',
    assigned_housekeeper: 'Assigned Housekeeper',
  }
  return labels[status] || status
}

const viewRoom = (room: Room) => {
  selectedRoom.value = room
  showEditModal.value = true
}

const editRoom = (room: Room) => {
  selectedRoom.value = room
  showEditModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedRoom.value = null
}

const handleRoomSaved = () => {
  closeModals()
  loadRooms()
}

// Room deletion
const deleteRoom = async (room: Room) => {
  if (!canDeleteRooms()) {
    alert('You do not have permission to delete rooms.')
    return
  }

  const confirmed = confirm(`Are you sure you want to delete room ${room.room_number}? This action cannot be undone.`)
  if (!confirmed) return

  try {
    loading.value = true

    // First, delete associated room images from storage and database
    const { data: images } = await $supabase
      .from('room_images')
      .select('image_url')
      .eq('room_id', room.id)

    if (images && images.length > 0) {
      // Delete images from storage
      for (const image of images) {
        const fileName = image.image_url.split('/').pop()
        if (fileName) {
          await $supabase.storage
            .from('room-images')
            .remove([`${room.id}/${fileName}`])
        }
      }

      // Delete image records from database
      await $supabase
        .from('room_images')
        .delete()
        .eq('room_id', room.id)
    }

    // Soft delete the room (set is_active to false instead of hard delete)
    const { error } = await $supabase
      .from('rooms')
      .update({ is_active: false })
      .eq('id', room.id)

    if (error) throw error

    // Remove room from local state
    rooms.value = rooms.value.filter(r => r.id !== room.id)
    
    alert(`Room ${room.room_number} has been deleted successfully.`)
  } catch (error) {
    console.error('Error deleting room:', error)
    alert('Failed to delete room. Please try again.')
  } finally {
    loading.value = false
  }
}

// Room status update
const updateRoomStatus = async (room: Room, event: Event) => {
  const target = event.target as HTMLSelectElement
  const newStatus = target.value as RoomStatus
  
  if (newStatus === room.status) return

  try {
    const { error } = await $supabase
      .from('rooms')
      .update({ status: newStatus })
      .eq('id', room.id)

    if (error) throw error

    // Update local state
    const roomIndex = rooms.value.findIndex(r => r.id === room.id)
    if (roomIndex !== -1) {
      rooms.value[roomIndex].status = newStatus
    }
  } catch (error) {
    console.error('Error updating room status:', error)
    // Reset select to original value
    target.value = room.status
  }
}

// Export rooms to CSV
const exportRooms = () => {
  const csvData = roomsWithParsedData.value.map(room => ({
    'Room ID': room.room_number,
    'Room Name': room.room_name || '',
    'Type': room.room_type?.name || '',
    'Bed Type': room.bed_type,
    'Capacity': room.capacity,
    'Price': room.price_per_night,
    'Status': room.status,
    'Floor': room.floor,
    'Section': room.section || '',
    'Amenities': room.parsedAmenities.join(', ') || '',
    'Tags': room.parsedTags.join(', ') || '',
    'Description': room.description || ''
  }))

  const csv = convertToCSV(csvData)
  downloadCSV(csv, `rooms-export-${new Date().toISOString().split('T')[0]}.csv`)
}

// Utility functions for CSV export
const convertToCSV = (data: any[]) => {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = []
  
  // Add headers
  csvRows.push(headers.join(','))
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Escape quotes and wrap in quotes if contains comma
      return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
        ? `"${value.replace(/"/g, '""')}"` 
        : value
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

onMounted(() => {
  loadRooms()
  loadRoomTypes()
})
</script>

<style scoped>
.btn-xs {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.75rem;
  line-height: 1.2;
}
</style>
