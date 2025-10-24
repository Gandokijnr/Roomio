<template>
  <div class="rooms-page">
    <div class="page-header">
      <div>
        <h1>Rooms Management</h1>
        <p>Manage hotel rooms and availability</p>
      </div>
      <button
        v-if="canManageRooms()"
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        + Add Room
      </button>
    </div>

    <div class="filters-section card">
      <div class="filters-header">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Search</label>
            <input
              v-model="filters.search"
              type="text"
              class="input"
              placeholder="Room number, name, type, amenities..."
            />
          </div>
          <div class="filter-group">
            <label>Status</label>
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
          <div class="filter-group">
            <label>Room Type</label>
            <select v-model="filters.roomType" class="input">
              <option value="">All Types</option>
              <option v-for="type in roomTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>Floor</label>
            <select v-model="filters.floor" class="input">
              <option value="">All Floors</option>
              <option v-for="floor in availableFloors" :key="floor" :value="floor">
                Floor {{ floor }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>Price Range</label>
            <select v-model="filters.priceRange" class="input">
              <option value="">All Prices</option>
              <option value="0-100">₦0 - ₦100</option>
              <option value="100-200">₦100 - ₦200</option>
              <option value="200-500">₦200 - ₦500</option>
              <option value="500+">₦500+</option>
            </select>
          </div>
        </div>
        <div class="view-controls">
          <div class="view-toggle">
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
          <div class="bulk-actions" v-if="canManageRooms()">
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

    <div v-if="loading" class="loading">Loading rooms...</div>

    <div v-else-if="filteredRooms.length === 0" class="empty-state card">
      <div class="empty-icon">🏨</div>
      <h3>No rooms found</h3>
      <p>Try adjusting your filters or add a new room</p>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="rooms-grid">
      <div v-for="room in filteredRooms" :key="room.id" class="room-card card">
        <div class="room-image" v-if="room.featured_image">
          <img :src="room.featured_image" :alt="`Room ${room.room_number}`" class="room-thumbnail" />
        </div>
        <div class="room-header">
          <div class="room-title">
            <div class="room-number">Room {{ room.room_number }}</div>
            <div v-if="room.room_name" class="room-name">{{ room.room_name }}</div>
          </div>
          <span :class="['badge', `badge-${getStatusColor(room.status)}`]">
            {{ getStatusIcon(room.status) }} {{ formatStatus(room.status) }}
          </span>
        </div>
        <div class="room-info">
          <div class="info-item">
            <span class="label">Type:</span>
            <span class="value">{{ room.room_type?.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Capacity:</span>
            <span class="value">{{ room.capacity }} guests</span>
          </div>
          <div class="info-item">
            <span class="label">Floor:</span>
            <span class="value">{{ room.floor }}{{ room.section ? ` (${room.section})` : '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Bed:</span>
            <span class="value">{{ room.bed_type }}</span>
          </div>
          <div class="info-item">
            <span class="label">Price:</span>
            <span class="value">₦{{ room.price_per_night }}/night</span>
          </div>
        </div>
        <div v-if="room.parsedAmenities.length > 0" class="room-amenities">
          <span v-for="amenity in room.parsedAmenities.slice(0, 3)" :key="amenity" class="amenity-tag">
            {{ amenity }}
          </span>
          <span v-if="room.parsedAmenities.length > 3" class="more-amenities">
            +{{ room.parsedAmenities.length - 3 }} more
          </span>
        </div>
        <div class="room-actions">
          <button
            @click="viewRoom(room)"
            class="btn btn-secondary btn-sm"
          >
            View Details
          </button>
          <button
            v-if="canManageRooms()"
            @click="editRoom(room)"
            class="btn btn-secondary btn-sm"
          >
            Edit
          </button>
          <div class="quick-actions" v-if="canUpdateRoomStatus()">
            <select
              @change="updateRoomStatus(room, $event)"
              :value="room.status"
              class="status-select"
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
    <div v-else class="rooms-list">
      <div class="list-header">
        <div class="col-room">Room</div>
        <div class="col-type">Type</div>
        <div class="col-status">Status</div>
        <div class="col-capacity">Capacity</div>
        <div class="col-price">Price</div>
        <div class="col-actions">Actions</div>
      </div>
      <div v-for="room in filteredRooms" :key="room.id" class="list-row">
        <div class="col-room">
          <div class="room-info-compact">
            <div class="room-number">{{ room.room_number }}</div>
            <div v-if="room.room_name" class="room-name-small">{{ room.room_name }}</div>
            <div class="room-location">Floor {{ room.floor }}{{ room.section ? ` • ${room.section}` : '' }}</div>
          </div>
        </div>
        <div class="col-type">{{ room.room_type?.name }}</div>
        <div class="col-status">
          <span :class="['badge', `badge-${getStatusColor(room.status)}`]">
            {{ getStatusIcon(room.status) }} {{ formatStatus(room.status) }}
          </span>
        </div>
        <div class="col-capacity">{{ room.capacity }} guests</div>
        <div class="col-price">₦{{ room.price_per_night }}/night</div>
        <div class="col-actions">
          <div class="action-buttons">
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
const { canManageRooms, hasRole } = useAuth()

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
.rooms-page {
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

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.view-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: flex-end;
}

.view-toggle {
  display: flex;
  gap: var(--spacing-xs);
}

.bulk-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--neutral-600);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--neutral-600);
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.room-card {
  padding: var(--spacing-lg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--neutral-200);
}

.room-number {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--neutral-900);
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.info-item .label {
  color: var(--neutral-600);
}

.info-item .value {
  color: var(--neutral-900);
  font-weight: 500;
}

.room-image {
  width: auto;
  height: 150px;
  overflow: hidden;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  margin: calc(-1 * var(--spacing-lg)) calc(-1 * var(--spacing-lg)) var(--spacing-md) calc(-1 * var(--spacing-lg));
}

.room-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-title {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.room-name {
  font-size: 0.875rem;
  color: var(--neutral-600);
  font-weight: 400;
}

.room-amenities {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.amenity-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-100);
  color: var(--primary-800);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.more-amenities {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--neutral-100);
  color: var(--neutral-600);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.room-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.room-actions .btn {
  width: 100%;
}

.quick-actions {
  margin-top: var(--spacing-sm);
}

.status-select {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  background: white;
}

/* List View Styles */
.rooms-list {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--neutral-50);
  border-bottom: 1px solid var(--neutral-200);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.list-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--neutral-100);
  transition: background-color 0.2s ease;
  align-items: center;
}

.list-row:hover {
  background: var(--neutral-25);
}

.list-row:last-child {
  border-bottom: none;
}

.room-info-compact {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.room-number {
  font-weight: 600;
  color: var(--neutral-900);
}

.room-name-small {
  font-size: 0.875rem;
  color: var(--neutral-600);
}

.room-location {
  font-size: 0.75rem;
  color: var(--neutral-500);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-xs {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.75rem;
  line-height: 1.2;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filters-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .rooms-grid {
    grid-template-columns: 1fr;
  }
  
  .list-header,
  .list-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .list-header {
    display: none;
  }
  
  .list-row {
    padding: var(--spacing-md);
    border: 1px solid var(--neutral-200);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-sm);
  }
}
</style>
