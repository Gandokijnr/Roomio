<template>
  <div class="room-detail-page">
    <div v-if="loading" class="loading">Loading room details...</div>
    
    <div v-else-if="!room" class="error-state card">
      <div class="error-icon">❌</div>
      <h3>Room Not Found</h3>
      <p>The requested room could not be found.</p>
      <NuxtLink to="/rooms" class="btn btn-primary">Back to Rooms</NuxtLink>
    </div>

    <div v-else class="room-detail-content">
      <!-- Header -->
      <div class="room-header">
        <div class="header-left">
          <div class="breadcrumb">
            <NuxtLink to="/rooms" class="breadcrumb-link">Rooms</NuxtLink>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-current">Room {{ room.room_number }}</span>
          </div>
          <div class="room-title">
            <h1>Room {{ room.room_number }}</h1>
            <h2 v-if="room.room_name" class="room-subtitle">{{ room.room_name }}</h2>
          </div>
          <div class="room-status-badge">
            <span :class="['badge', 'badge-lg', `badge-${getStatusColor(room?.status || 'available')}`]">
              {{ getStatusIcon(room?.status || 'available') }} {{ formatStatus(room?.status || 'available') }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button
            v-if="canManageRooms()"
            @click="showEditModal = true"
            class="btn btn-primary"
          >
            ✏️ Edit Room
          </button>
          <button
            v-if="canUpdateRoomStatus()"
            @click="showStatusModal = true"
            class="btn btn-secondary"
          >
            🔄 Update Status
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="room-content">
        <!-- Room Images -->
        <div v-if="roomImages.length > 0" class="room-gallery card">
          <h3>Room Gallery</h3>
          <div class="gallery-container">
            <div class="main-image">
              <img 
                :src="selectedImage.image_url" 
                :alt="selectedImage.image_name || 'Room Image'"
                class="main-room-image"
              />
            </div>
            <div class="thumbnail-strip" v-if="roomImages.length > 1">
              <button
                v-for="(image, index) in roomImages"
                :key="image.id"
                @click="selectedImage = image"
                :class="['thumbnail-btn', { active: selectedImage.id === image.id }]"
              >
                <img 
                  :src="image.image_url" 
                  :alt="image.image_name || 'Room Thumbnail'"
                  class="thumbnail-image"
                />
              </button>
            </div>
          </div>
        </div>

        <div class="room-info-grid">
          <!-- Basic Information -->
          <div class="info-section card">
            <h3>Basic Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Room Number</span>
                <span class="value">{{ room.room_number }}</span>
              </div>
              <div class="info-item" v-if="room.room_name">
                <span class="label">Room Name</span>
                <span class="value">{{ room.room_name }}</span>
              </div>
              <div class="info-item">
                <span class="label">Room Type</span>
                <span class="value">{{ room.room_type?.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">Bed Type</span>
                <span class="value">{{ room.bed_type }}</span>
              </div>
              <div class="info-item">
                <span class="label">Capacity</span>
                <span class="value">{{ room.capacity }} guests</span>
              </div>
              <div class="info-item">
                <span class="label">Floor</span>
                <span class="value">{{ room.floor }}</span>
              </div>
              <div class="info-item" v-if="room.section">
                <span class="label">Section</span>
                <span class="value">{{ room.section }}</span>
              </div>
              <div class="info-item">
                <span class="label">Price per Night</span>
                <span class="value price">${{ room.price_per_night }}</span>
              </div>
            </div>
          </div>

          <!-- Amenities & Features -->
          <div class="info-section card" v-if="room.amenities?.length > 0">
            <h3>Amenities & Features</h3>
            <div class="amenities-grid">
              <span 
                v-for="amenity in room.amenities" 
                :key="amenity" 
                class="amenity-tag"
              >
                {{ amenity }}
              </span>
            </div>
          </div>

          <!-- Tags -->
          <div class="info-section card" v-if="room.tags?.length > 0">
            <h3>Tags</h3>
            <div class="tags-grid">
              <span 
                v-for="tag in room.tags" 
                :key="tag" 
                class="tag-item"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Description -->
          <div class="info-section card" v-if="room.description">
            <h3>Description</h3>
            <p class="description-text">{{ room.description }}</p>
          </div>

          <!-- Current Reservation -->
          <div class="info-section card" v-if="currentReservation">
            <h3>Current Reservation</h3>
            <div class="reservation-info">
              <div class="guest-info">
                <div class="guest-name">{{ currentReservation.guest?.first_name }} {{ currentReservation.guest?.last_name }}</div>
                <div class="reservation-dates">
                  {{ formatDate(currentReservation.check_in_date) }} - {{ formatDate(currentReservation.check_out_date) }}
                </div>
              </div>
              <div class="reservation-actions">
                <NuxtLink 
                  :to="`/reservations/${currentReservation.id}`"
                  class="btn btn-secondary btn-sm"
                >
                  View Reservation
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="info-section card" v-if="recentActivity.length > 0">
            <h3>Recent Activity</h3>
            <div class="activity-list">
              <div 
                v-for="activity in recentActivity" 
                :key="activity.id" 
                class="activity-item"
              >
                <div class="activity-icon">📝</div>
                <div class="activity-content">
                  <div class="activity-action">{{ activity.action }}</div>
                  <div class="activity-time">{{ formatDateTime(activity.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <RoomModal
      v-if="showEditModal"
      :room="room"
      :room-types="roomTypes"
      @close="showEditModal = false"
      @saved="handleRoomSaved"
    />

    <!-- Status Update Modal -->
    <div v-if="showStatusModal" class="modal-overlay" @click.self="showStatusModal = false">
      <div class="modal-content card">
        <div class="modal-header">
          <h3>Update Room Status</h3>
          <button @click="showStatusModal = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Current Status</label>
            <div class="current-status">
              <span :class="['badge', `badge-${getStatusColor(room?.status || 'available')}`]">
                {{ getStatusIcon(room?.status || 'available') }} {{ formatStatus(room?.status || 'available') }}
              </span>
            </div>
          </div>
          <div class="form-group">
            <label for="new-status">New Status</label>
            <select id="new-status" v-model="newStatus" class="input">
              <option value="available">🟢 Available</option>
              <option value="occupied">🔴 Occupied</option>
              <option value="reserved">🟡 Reserved</option>
              <option value="maintenance">⚙️ Under Maintenance</option>
              <option value="cleaning">🧹 Cleaning</option>
              <option value="out_of_service">❌ Out of Service</option>
            </select>
          </div>
          <div class="form-group">
            <label for="status-notes">Notes (Optional)</label>
            <textarea 
              id="status-notes" 
              v-model="statusNotes" 
              class="input" 
              rows="3"
              placeholder="Add notes about the status change..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showStatusModal = false" class="btn btn-secondary">Cancel</button>
          <button 
            @click="updateStatus" 
            class="btn btn-primary"
            :disabled="newStatus === room?.status || updatingStatus"
          >
            {{ updatingStatus ? 'Updating...' : 'Update Status' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Room, RoomType, RoomStatus } from '~/types/database'

definePageMeta({
  middleware: ['auth', 'role']
})

const route = useRoute()
const { $supabase } = useNuxtApp()
const { canManageRooms, hasRole } = useAuth()

const canUpdateRoomStatus = () => {
  return hasRole(['admin', 'manager', 'receptionist', 'housekeeping'])
}

const loading = ref(true)
const room = ref<Room | null>(null)
const roomTypes = ref<RoomType[]>([])
const roomImages = ref<any[]>([])
const selectedImage = ref<any>(null)
const currentReservation = ref<any>(null)
const recentActivity = ref<any[]>([])

const showEditModal = ref(false)
const showStatusModal = ref(false)
const newStatus = ref<RoomStatus>('available')
const statusNotes = ref('')
const updatingStatus = ref(false)

const loadRoom = async () => {
  try {
    loading.value = true
    const roomId = route.params.id as string

    // Load room details
    const { data: roomData, error: roomError } = await $supabase
      .from('rooms')
      .select('*, room_type:room_types(*)')
      .eq('id', roomId)
      .single()

    if (roomError) throw roomError
    room.value = roomData

    // Parse JSON fields
    if (room.value) {
      room.value.amenities = typeof room.value.amenities === 'string' 
        ? JSON.parse(room.value.amenities) 
        : room.value.amenities || []
      room.value.tags = typeof room.value.tags === 'string' 
        ? JSON.parse(room.value.tags) 
        : room.value.tags || []
      
      newStatus.value = room.value.status
    }

    // Load room images
    const { data: imagesData } = await $supabase
      .from('room_images')
      .select('*')
      .eq('room_id', roomId)
      .order('sort_order')

    if (imagesData) {
      roomImages.value = imagesData
      selectedImage.value = imagesData[0] || null
    }

    // Load current reservation if room is occupied or reserved
    if (room.value && ['occupied', 'reserved'].includes(room.value.status)) {
      const { data: reservationData } = await $supabase
        .from('reservations')
        .select('*, guest:guests(*)')
        .eq('room_id', roomId)
        .in('status', ['confirmed', 'checked_in'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (reservationData) {
        currentReservation.value = reservationData
      }
    }

    // Load recent activity
    const { data: activityData } = await $supabase
      .from('room_audit_log')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (activityData) {
      recentActivity.value = activityData
    }

  } catch (error) {
    console.error('Error loading room:', error)
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
    maintenance: 'Under Maintenance',
    cleaning: 'Cleaning',
    out_of_service: 'Out of Service',
  }
  return labels[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const handleRoomSaved = () => {
  showEditModal.value = false
  loadRoom() // Reload room data
}

const updateStatus = async () => {
  if (!room.value || newStatus.value === room.value.status) return

  try {
    updatingStatus.value = true

    const { error } = await $supabase
      .from('rooms')
      .update({ status: newStatus.value })
      .eq('id', room.value.id)

    if (error) throw error

    // Log the status change
    if (statusNotes.value.trim()) {
      await $supabase
        .from('activity_logs')
        .insert({
          user_id: null, // Will be set by RLS
          action: `Room status changed from ${room.value.status} to ${newStatus.value}`,
          entity_type: 'room',
          entity_id: room.value.id,
          metadata: { notes: statusNotes.value.trim() }
        })
    }

    // Update local state
    room.value.status = newStatus.value
    showStatusModal.value = false
    statusNotes.value = ''

  } catch (error) {
    console.error('Error updating room status:', error)
  } finally {
    updatingStatus.value = false
  }
}

onMounted(() => {
  loadRoom()
  loadRoomTypes()
})
</script>

<style scoped>
.room-detail-page {
  max-width: 1400px;
}

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--neutral-600);
}

.error-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.error-state h3 {
  font-size: 1.25rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-sm);
}

.error-state p {
  color: var(--neutral-600);
  margin-bottom: var(--spacing-lg);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: var(--primary-600);
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: var(--neutral-400);
}

.breadcrumb-current {
  color: var(--neutral-600);
}

.room-title h1 {
  font-size: 2rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.room-subtitle {
  font-size: 1.25rem;
  color: var(--neutral-600);
  font-weight: 400;
  margin-bottom: var(--spacing-md);
}

.room-status-badge .badge-lg {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.room-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.room-gallery {
  padding: var(--spacing-lg);
}

.room-gallery h3 {
  margin-bottom: var(--spacing-md);
  color: var(--neutral-900);
}

.gallery-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.main-room-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-strip {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding: var(--spacing-xs) 0;
}

.thumbnail-btn {
  flex-shrink: 0;
  width: 80px;
  height: 60px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.thumbnail-btn.active {
  border-color: var(--primary-500);
}

.thumbnail-btn:hover {
  border-color: var(--primary-300);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.info-section {
  padding: var(--spacing-lg);
}

.info-section h3 {
  font-size: 1.25rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--neutral-200);
  padding-bottom: var(--spacing-sm);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item .label {
  font-size: 0.875rem;
  color: var(--neutral-600);
  font-weight: 500;
}

.info-item .value {
  color: var(--neutral-900);
  font-weight: 600;
}

.info-item .value.price {
  color: var(--success-600);
  font-size: 1.125rem;
}

.amenities-grid,
.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.amenity-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-100);
  color: var(--primary-800);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
}

.tag-item {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--secondary-100);
  color: var(--secondary-800);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
}

.description-text {
  color: var(--neutral-700);
  line-height: 1.6;
}

.reservation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--neutral-50);
  border-radius: var(--radius-md);
}

.guest-name {
  font-weight: 600;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.reservation-dates {
  font-size: 0.875rem;
  color: var(--neutral-600);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--neutral-25);
  border-radius: var(--radius-md);
}

.activity-icon {
  font-size: 1.25rem;
}

.activity-content {
  flex: 1;
}

.activity-action {
  font-weight: 500;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.activity-time {
  font-size: 0.875rem;
  color: var(--neutral-600);
}

/* Modal Styles */
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
  max-width: 500px;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--neutral-200);
}

.modal-header h3 {
  font-size: 1.25rem;
  color: var(--neutral-900);
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--neutral-100);
  color: var(--neutral-700);
  font-size: 1.25rem;
  line-height: 1;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: var(--neutral-200);
}

.modal-body {
  padding: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-weight: 500;
  color: var(--neutral-700);
  margin-bottom: var(--spacing-sm);
}

.current-status {
  padding: var(--spacing-sm) 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--neutral-200);
}

/* Responsive Design */
@media (max-width: 768px) {
  .room-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .room-info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .reservation-info {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
}
</style>
