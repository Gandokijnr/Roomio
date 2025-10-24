<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <div class="modal-header">
        <h2>{{ room ? 'Edit Room' : 'Add New Room' }}</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label for="room-number">Room Number / ID *</label>
            <input
              id="room-number"
              v-model="formData.room_number"
              type="text"
              class="input"
              placeholder="101, A-204, Suite-05"
              required
              :disabled="loading || !canEdit"
            />
          </div>

          <div class="form-group">
            <label for="room-name">Room Name / Label</label>
            
            <!-- Quick add suggested room names -->
            <div v-if="suggestedRoomNames.length > 0" class="suggested-names">
              <p class="suggestion-label">Suggested names:</p>
              <div class="suggestion-buttons">
                <button
                  v-for="name in suggestedRoomNames"
                  :key="name"
                  type="button"
                  @click="formData.room_name = name"
                  class="btn btn-outline btn-xs"
                  :disabled="loading || !canEdit"
                >
                  {{ name }}
                </button>
              </div>
            </div>

            <input
              id="room-name"
              v-model="formData.room_name"
              type="text"
              class="input"
              placeholder="Custom room name (optional)"
              :disabled="loading || !canEdit"
              list="room-name-suggestions"
            />
            <datalist id="room-name-suggestions">
              <option v-for="name in allRoomNameSuggestions" :key="name" :value="name" />
            </datalist>
          </div>

          <div class="form-group">
            <label for="room-type">Room Type *</label>
            <select
              id="room-type"
              v-model="formData.room_type_id"
              class="input"
              required
              :disabled="loading || !canEdit"
            >
              <option value="">Select type</option>
              <option v-for="type in roomTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="capacity">Capacity (Max Guests) *</label>
            <input
              id="capacity"
              v-model.number="formData.capacity"
              type="number"
              class="input"
              placeholder="2"
              min="1"
              required
              :disabled="loading || !canEdit"
            />
          </div>

          <div class="form-group">
            <label for="floor">Floor Number *</label>
            <input
              id="floor"
              v-model.number="formData.floor"
              type="number"
              class="input"
              placeholder="1"
              required
              :disabled="loading || !canEdit"
            />
          </div>

          <div class="form-group">
            <label for="section">Section / Wing</label>
            <input
              id="section"
              v-model="formData.section"
              type="text"
              class="input"
              placeholder="West Wing, 2nd Floor"
              :disabled="loading || !canEdit"
            />
          </div>

          <div class="form-group">
            <label for="bed-type">Bed Type *</label>
            <select
              id="bed-type"
              v-model="formData.bed_type"
              class="input"
              required
              :disabled="loading || !canEdit"
            >
              <option value="">Select bed type</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Queen">Queen</option>
              <option value="King">King</option>
              <option value="Twin">Twin</option>
            </select>
          </div>

          <div class="form-group">
            <label for="price">Price per Night *</label>
            <input
              id="price"
              v-model.number="formData.price_per_night"
              type="number"
              step="0.01"
              class="input"
              placeholder="99.99"
              required
              :disabled="loading || !canEdit"
            />
          </div>

          <div class="form-group">
            <label for="status">Status *</label>
            <select
              id="status"
              v-model="formData.status"
              class="input"
              required
              :disabled="loading"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="cleaning">Cleaning</option>
              <option value="out_of_service">Out of Service</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label for="amenities">Amenities / Features</label>
            
            <!-- Quick add from room type amenities -->
            <div v-if="selectedRoomTypeAmenities.length > 0" class="suggested-amenities">
              <p class="suggestion-label">Suggested amenities for {{ selectedRoomType?.name }}:</p>
              <div class="suggestion-buttons">
                <button
                  v-for="amenity in selectedRoomTypeAmenities"
                  :key="amenity"
                  type="button"
                  @click="addSuggestedAmenity(amenity)"
                  class="btn btn-outline btn-xs"
                  :disabled="loading || !canEdit || formData.amenities.includes(amenity)"
                >
                  + {{ amenity }}
                </button>
              </div>
            </div>

            <div class="amenities-input">
              <input
                v-model="newAmenity"
                type="text"
                class="input"
                placeholder="Add custom amenity"
                @keyup.enter="addAmenity"
                :disabled="loading || !canEdit"
                list="amenity-suggestions"
              />
              <datalist id="amenity-suggestions">
                <option v-for="amenity in allAvailableAmenities" :key="amenity" :value="amenity" />
              </datalist>
              <button
                type="button"
                @click="addAmenity"
                class="btn btn-secondary btn-sm"
                :disabled="loading || !canEdit || !newAmenity.trim()"
              >
                Add
              </button>
            </div>
            <div v-if="formData.amenities.length > 0" class="amenities-list">
              <span
                v-for="(amenity, index) in formData.amenities"
                :key="index"
                class="amenity-tag"
              >
                {{ amenity }}
                <button
                  type="button"
                  @click="removeAmenity(index)"
                  class="remove-btn"
                  :disabled="loading || !canEdit"
                >
                  ×
                </button>
              </span>
            </div>
          </div>

          <div class="form-group full-width">
            <label for="tags">Tags</label>
            
            <!-- Quick add from room type tags -->
            <div v-if="selectedRoomTypeTags.length > 0" class="suggested-amenities">
              <p class="suggestion-label">Suggested tags for {{ selectedRoomType?.name }}:</p>
              <div class="suggestion-buttons">
                <button
                  v-for="tag in selectedRoomTypeTags"
                  :key="tag"
                  type="button"
                  @click="addSuggestedTag(tag)"
                  class="btn btn-outline btn-xs"
                  :disabled="loading || !canEdit || formData.tags.includes(tag)"
                >
                  + {{ tag }}
                </button>
              </div>
            </div>

            <div class="amenities-input">
              <input
                v-model="newTag"
                type="text"
                class="input"
                placeholder="Add custom tag"
                @keyup.enter="addTag"
                :disabled="loading || !canEdit"
                list="tag-suggestions"
              />
              <datalist id="tag-suggestions">
                <option v-for="tag in allAvailableTags" :key="tag" :value="tag" />
              </datalist>
              <button
                type="button"
                @click="addTag"
                class="btn btn-secondary btn-sm"
                :disabled="loading || !canEdit || !newTag.trim()"
              >
                Add
              </button>
            </div>
            <div v-if="formData.tags.length > 0" class="amenities-list">
              <span
                v-for="(tag, index) in formData.tags"
                :key="index"
                class="tag-item"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="remove-btn"
                  :disabled="loading || !canEdit"
                >
                  ×
                </button>
              </span>
            </div>
          </div>

          <div class="form-group full-width">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              class="input"
              rows="3"
              placeholder="Spacious double room with ocean view and private balcony..."
              :disabled="loading || !canEdit"
            ></textarea>
          </div>

          <div class="form-group full-width">
            <label>Room Images</label>
            <div class="image-upload-section">
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                @change="handleImageUpload"
                class="file-input"
                :disabled="loading || !canEdit"
              />
              <button
                type="button"
                @click="fileInput?.click()"
                class="btn btn-secondary"
                :disabled="loading || !canEdit"
              >
                📷 Upload Images
              </button>
              <p class="help-text">Upload up to 10 images. First image will be featured.</p>
            </div>
            
            <div v-if="imagePreview.length > 0" class="image-preview-grid">
              <div
                v-for="(image, index) in imagePreview"
                :key="index"
                class="image-preview-item"
              >
                <img :src="image.url" :alt="image.name" class="preview-image" />
                <div class="image-overlay">
                  <button
                    type="button"
                    @click="removeImage(index)"
                    class="remove-image-btn"
                    :disabled="loading || !canEdit"
                  >
                    ×
                  </button>
                  <button
                    v-if="index !== 0"
                    type="button"
                    @click="setFeaturedImage(index)"
                    class="featured-btn"
                    :disabled="loading || !canEdit"
                  >
                    ⭐ Set Featured
                  </button>
                  <span v-else class="featured-badge">Featured</span>
                </div>
                <p class="image-name">{{ image.name }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary" :disabled="loading">
            Cancel
          </button>
          <button
            v-if="canEdit"
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Saving...' : 'Save Room' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Room, RoomType } from '~/types/database'

const props = defineProps<{
  room?: Room | null
  roomTypes: RoomType[]
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { $supabase } = useNuxtApp()
const { canManageRooms } = useAuth()

const canEdit = computed(() => canManageRooms())
const loading = ref(false)
const error = ref('')

// Computed properties for amenities syncing
const selectedRoomType = computed(() => {
  return props.roomTypes.find(type => type.id === formData.value.room_type_id)
})

const selectedRoomTypeAmenities = computed(() => {
  if (!selectedRoomType.value?.amenities) return []
  return Array.isArray(selectedRoomType.value.amenities) 
    ? selectedRoomType.value.amenities 
    : []
})

const allAvailableAmenities = computed(() => {
  const amenitiesSet = new Set<string>()
  
  // Add amenities from all room types
  props.roomTypes.forEach(type => {
    if (Array.isArray(type.amenities)) {
      type.amenities.forEach(amenity => amenitiesSet.add(amenity))
    }
  })
  
  // Add common amenities
  const commonAmenities = [
    'WiFi', 'AC', 'TV', 'Private Bathroom', 'Mini Fridge', 'Mini Bar',
    'Balcony', 'City View', 'Ocean View', 'Work Desk', 'Safe',
    'Hair Dryer', 'Iron', 'Coffee Maker', 'Room Service', 'Laundry Service'
  ]
  
  commonAmenities.forEach(amenity => amenitiesSet.add(amenity))
  
  return Array.from(amenitiesSet).sort()
})

const selectedRoomTypeTags = computed(() => {
  if (!selectedRoomType.value?.tags) return []
  return Array.isArray(selectedRoomType.value.tags) 
    ? selectedRoomType.value.tags 
    : []
})

const allAvailableTags = computed(() => {
  const tagsSet = new Set<string>()
  
  // Add tags from all room types
  props.roomTypes.forEach(type => {
    if (Array.isArray(type.tags)) {
      type.tags.forEach(tag => tagsSet.add(tag))
    }
  })
  
  // Add common tags
  const commonTags = [
    'VIP', 'Family Friendly', 'Business', 'Romantic', 'Luxury',
    'Sea View', 'City View', 'Mountain View', 'Garden View',
    'Accessible', 'Pet Friendly', 'Non-Smoking', 'Smoking Allowed',
    'Honeymoon', 'Executive', 'Budget', 'Premium', 'Deluxe'
  ]
  
  commonTags.forEach(tag => tagsSet.add(tag))
  
  return Array.from(tagsSet).sort()
})

const suggestedRoomNames = computed(() => {
  if (!selectedRoomType.value) return []
  
  const roomTypeName = selectedRoomType.value.name
  const roomNumber = formData.value.room_number
  
  const suggestions = []
  
  // Add room type name variations
  if (roomNumber) {
    suggestions.push(`${roomTypeName} ${roomNumber}`)
  }
  
  // Add view-based names
  const viewTypes = ['Ocean View', 'City View', 'Garden View', 'Mountain View']
  viewTypes.forEach(view => {
    suggestions.push(`${view} ${roomTypeName}`)
  })
  
  // Add descriptive names based on room type
  const descriptiveNames = {
    'Standard Single': ['Cozy Single', 'Business Single', 'Compact Single'],
    'Standard Double': ['Romantic Double', 'Classic Double', 'Comfort Double'],
    'Deluxe Room': ['Premium Deluxe', 'Superior Deluxe', 'Luxury Deluxe'],
    'Family Suite': ['Family Paradise', 'Kids Haven Suite', 'Spacious Family'],
    'Executive Suite': ['Executive Retreat', 'Business Elite', 'Corporate Suite'],
    'Presidential Suite': ['Presidential Palace', 'Royal Suite', 'Ultimate Luxury']
  }
  
  const typeDescriptions = descriptiveNames[roomTypeName as keyof typeof descriptiveNames]
  if (typeDescriptions) {
    suggestions.push(...typeDescriptions)
  }
  
  return suggestions.slice(0, 6) // Limit to 6 suggestions
})

const allRoomNameSuggestions = computed(() => {
  const suggestions = new Set<string>()
  
  // Add all possible room name patterns
  props.roomTypes.forEach(type => {
    const typeName = type.name
    
    // View variations
    const views = ['Ocean View', 'City View', 'Garden View', 'Mountain View', 'Pool View']
    views.forEach(view => suggestions.add(`${view} ${typeName}`))
    
    // Descriptive variations
    const descriptors = ['Premium', 'Luxury', 'Superior', 'Deluxe', 'Grand', 'Royal', 'Elite']
    descriptors.forEach(desc => suggestions.add(`${desc} ${typeName}`))
  })
  
  return Array.from(suggestions).sort()
})

// Utility function to safely parse amenities and tags from database
const parseAmenitiesAndTags = (value: any): string[] => {
  if (Array.isArray(value)) return [...value]
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

const formData = ref({
  room_number: props.room?.room_number || '',
  room_name: props.room?.room_name || '',
  room_type_id: props.room?.room_type_id || '',
  floor: props.room?.floor || 1,
  bed_type: props.room?.bed_type || '',
  capacity: props.room?.capacity || 2,
  section: props.room?.section || '',
  price_per_night: props.room?.price_per_night || 0,
  status: props.room?.status || 'available',
  description: props.room?.description || '',
  amenities: parseAmenitiesAndTags(props.room?.amenities),
  tags: parseAmenitiesAndTags(props.room?.tags),
  featured_image: props.room?.featured_image || '',
})

// Additional reactive variables
const newAmenity = ref('')
const newTag = ref('')
const imagePreview = ref<Array<{url: string, name: string, file?: File}>>([])
const fileInput = ref<HTMLInputElement | null>(null)

// Image management methods
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  // Limit to 10 images total
  const remainingSlots = 10 - imagePreview.value.length
  const filesToProcess = Array.from(files).slice(0, remainingSlots)

  filesToProcess.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value.push({
          url: e.target?.result as string,
          name: file.name,
          file: file
        })
      }
      reader.readAsDataURL(file)
    }
  })

  // Clear the input
  target.value = ''
}

const removeImage = (index: number) => {
  imagePreview.value.splice(index, 1)
}

const setFeaturedImage = (index: number) => {
  const [featuredImage] = imagePreview.value.splice(index, 1)
  imagePreview.value.unshift(featuredImage)
}

// Amenities management
const addAmenity = () => {
  const amenity = newAmenity.value.trim()
  if (amenity && amenity.length > 0) {
    // Check for duplicates (case-insensitive)
    const exists = formData.value.amenities.some(existing => 
      existing.toLowerCase() === amenity.toLowerCase()
    )
    if (!exists) {
      formData.value.amenities.push(amenity)
      newAmenity.value = ''
    }
  }
}

const addSuggestedAmenity = (amenity: string) => {
  const exists = formData.value.amenities.some(existing => 
    existing.toLowerCase() === amenity.toLowerCase()
  )
  if (!exists) {
    formData.value.amenities.push(amenity)
  }
}

const removeAmenity = (index: number) => {
  formData.value.amenities.splice(index, 1)
}

// Tags management
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && tag.length > 0) {
    // Check for duplicates (case-insensitive)
    const exists = formData.value.tags.some(existing => 
      existing.toLowerCase() === tag.toLowerCase()
    )
    if (!exists) {
      formData.value.tags.push(tag)
      newTag.value = ''
    }
  }
}

const addSuggestedTag = (tag: string) => {
  const exists = formData.value.tags.some(existing => 
    existing.toLowerCase() === tag.toLowerCase()
  )
  if (!exists) {
    formData.value.tags.push(tag)
  }
}

const removeTag = (index: number) => {
  formData.value.tags.splice(index, 1)
}

const handleSubmit = async () => {
  if (!canEdit.value) return

  try {
    loading.value = true
    error.value = ''

    // Prepare room data with validated amenities and tags
    const validatedAmenities = formData.value.amenities
      .filter(amenity => amenity && amenity.trim() !== '')
      .map(amenity => amenity.trim())
    
    const validatedTags = formData.value.tags
      .filter(tag => tag && tag.trim() !== '')
      .map(tag => tag.trim())
    
    // Ensure amenities and tags are properly formatted
    const roomData = {
      ...formData.value,
      amenities: JSON.stringify(validatedAmenities),
      tags: JSON.stringify(validatedTags)
    }
    
    // Log for debugging (can be removed in production)
    console.log('Submitting room data:', {
      ...roomData,
      amenities: validatedAmenities,
      tags: validatedTags
    })

    let roomId = props.room?.id

    if (props.room) {
      // Update existing room
      const { error: updateError } = await $supabase
        .from('rooms')
        .update(roomData)
        .eq('id', props.room.id)

      if (updateError) throw updateError
    } else {
      // Create new room
      const { data, error: insertError } = await $supabase
        .from('rooms')
        .insert([roomData])
        .select('id')
        .single()

      if (insertError) throw insertError
      roomId = data.id
    }

    // Handle image uploads if there are any
    if (imagePreview.value.length > 0 && roomId) {
      await handleImageUploads(roomId)
    }

    emit('saved')
  } catch (err: any) {
    console.error('Error saving room:', err)
    error.value = err.message || 'Failed to save room'
  } finally {
    loading.value = false
  }
}

// Handle image uploads to storage and database
const handleImageUploads = async (roomId: string) => {
  const imagesToUpload = imagePreview.value.filter(img => img.file)
  
  for (let i = 0; i < imagesToUpload.length; i++) {
    const image = imagesToUpload[i]
    if (!image.file) continue

    try {
      // Upload to Supabase storage
      const fileName = `${roomId}/${Date.now()}-${image.file.name}`
      const { data: uploadData, error: uploadError } = await $supabase.storage
        .from('room-images')
        .upload(fileName, image.file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        continue
      }

      // Get public URL
      const { data: { publicUrl } } = $supabase.storage
        .from('room-images')
        .getPublicUrl(fileName)

      // Save image record to database
      const { error: dbError } = await $supabase
        .from('room_images')
        .insert({
          room_id: roomId,
          image_url: publicUrl,
          image_name: image.file.name,
          is_featured: i === 0, // First image is featured
          sort_order: i
        })

      if (dbError) {
        console.error('Error saving image record:', dbError)
      }

      // Update room's featured_image if this is the first image
      if (i === 0) {
        await $supabase
          .from('rooms')
          .update({ featured_image: publicUrl })
          .eq('id', roomId)
      }
    } catch (err) {
      console.error('Error processing image:', err)
    }
  }
}

// Watch for room type changes to suggest amenities and tags
watch(() => formData.value.room_type_id, (newRoomTypeId, oldRoomTypeId) => {
  // Only auto-sync amenities and tags for new rooms or when explicitly changing room type
  if (!props.room && newRoomTypeId && newRoomTypeId !== oldRoomTypeId) {
    const roomType = props.roomTypes.find(type => type.id === newRoomTypeId)
    
    // Auto-add amenities
    if (roomType?.amenities && Array.isArray(roomType.amenities)) {
      roomType.amenities.forEach(amenity => {
        if (!formData.value.amenities.includes(amenity)) {
          formData.value.amenities.push(amenity)
        }
      })
    }
    
    // Auto-add tags
    if (roomType?.tags && Array.isArray(roomType.tags)) {
      roomType.tags.forEach(tag => {
        if (!formData.value.tags.includes(tag)) {
          formData.value.tags.push(tag)
        }
      })
    }
  }
})

// Load existing images if editing
onMounted(async () => {
  if (props.room?.id) {
    try {
      const { data: images } = await $supabase
        .from('room_images')
        .select('*')
        .eq('room_id', props.room.id)
        .order('sort_order')
      
      if (images) {
        imagePreview.value = images.map(img => ({
          url: img.image_url,
          name: img.image_name || 'Room Image'
        }))
      }
    } catch (err) {
      console.error('Error loading room images:', err)
    }
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
  max-width: 600px;
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

textarea.input {
  resize: vertical;
  font-family: inherit;
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

/* New styles for enhanced features */
.amenities-input {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.amenities-input input {
  flex: 1;
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.amenity-tag, .tag-item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-100);
  color: var(--primary-800);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-item {
  background: var(--secondary-100);
  color: var(--secondary-800);
}

.remove-btn {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--neutral-300);
  color: var(--neutral-700);
  font-size: 0.75rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: var(--error-500);
  color: white;
}

.image-upload-section {
  margin-bottom: var(--spacing-md);
}

.file-input {
  display: none;
}

.help-text {
  font-size: 0.75rem;
  color: var(--neutral-500);
  margin-top: var(--spacing-xs);
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.image-preview-item {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--neutral-100);
}

.preview-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-preview-item:hover .image-overlay {
  opacity: 1;
}

.remove-image-btn, .featured-btn {
  padding: var(--spacing-xs);
  background: var(--error-500);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.featured-btn {
  background: var(--warning-500);
}

.remove-image-btn:hover {
  background: var(--error-600);
}

.featured-btn:hover {
  background: var(--warning-600);
}

.featured-badge {
  padding: var(--spacing-xs);
  background: var(--success-500);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.image-name {
  font-size: 0.75rem;
  color: var(--neutral-600);
  text-align: center;
  padding: var(--spacing-xs);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Suggested amenities and room names styles */
.suggested-amenities,
.suggested-names {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--primary-25);
  border-radius: var(--radius-md);
  border: 1px solid var(--primary-200);
}

.suggestion-label {
  font-size: 0.875rem;
  color: var(--primary-700);
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-300);
  color: var(--primary-700);
  transition: all 0.2s ease;
}

.btn-outline:hover:not(:disabled) {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-xs {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.75rem;
  line-height: 1.2;
}
</style>
