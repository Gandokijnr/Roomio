<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <div class="modal-header">
        <h2>Bulk Import Rooms</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <div class="modal-body">
        <div class="import-steps">
          <div class="step" :class="{ active: currentStep === 1 }">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Choose Import Method</h3>
              <div class="import-methods">
                <label class="method-option">
                  <input 
                    type="radio" 
                    v-model="importMethod" 
                    value="csv" 
                    name="importMethod"
                  />
                  <div class="method-card">
                    <div class="method-icon">📄</div>
                    <div class="method-title">CSV File</div>
                    <div class="method-desc">Upload a CSV file with room data</div>
                  </div>
                </label>
                <label class="method-option">
                  <input 
                    type="radio" 
                    v-model="importMethod" 
                    value="excel" 
                    name="importMethod"
                  />
                  <div class="method-card">
                    <div class="method-icon">📊</div>
                    <div class="method-title">Excel File</div>
                    <div class="method-desc">Upload an Excel (.xlsx) file</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="step" :class="{ active: currentStep === 2 }" v-if="importMethod">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Download Template</h3>
              <p>Download our template to ensure your data is formatted correctly:</p>
              <button @click="downloadTemplate" class="btn btn-secondary">
                📥 Download {{ importMethod.toUpperCase() }} Template
              </button>
              <div class="template-info">
                <h4>Required Columns:</h4>
                <ul>
                  <li><strong>room_number</strong> - Unique room identifier (e.g., 101, A-204)</li>
                  <li><strong>room_name</strong> - Optional room name (e.g., Presidential Suite)</li>
                  <li><strong>room_type</strong> - Room type name (must match existing types)</li>
                  <li><strong>bed_type</strong> - Single, Double, Queen, King, Twin</li>
                  <li><strong>capacity</strong> - Maximum number of guests</li>
                  <li><strong>price_per_night</strong> - Base room rate</li>
                  <li><strong>floor</strong> - Floor number</li>
                  <li><strong>section</strong> - Optional section/wing</li>
                  <li><strong>status</strong> - available, occupied, reserved, maintenance, cleaning, out_of_service</li>
                  <li><strong>amenities</strong> - Comma-separated list (e.g., WiFi, AC, TV)</li>
                  <li><strong>tags</strong> - Comma-separated tags (e.g., VIP, Sea View)</li>
                  <li><strong>description</strong> - Optional room description</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="step" :class="{ active: currentStep === 3 }" v-if="importMethod">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Upload File</h3>
              <div class="file-upload-area" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
                <input
                  ref="fileInput"
                  type="file"
                  :accept="importMethod === 'csv' ? '.csv' : '.xlsx,.xls'"
                  @change="handleFileSelect"
                  class="file-input"
                />
                <div class="upload-content" @click="triggerFileInput">
                  <div class="upload-icon">📁</div>
                  <div class="upload-text">
                    <p><strong>Click to upload</strong> or drag and drop</p>
                    <p class="upload-hint">{{ importMethod === 'csv' ? 'CSV files only' : 'Excel files (.xlsx, .xls)' }}</p>
                  </div>
                </div>
              </div>
              
              <div v-if="selectedFile" class="selected-file">
                <div class="file-info">
                  <div class="file-icon">📄</div>
                  <div class="file-details">
                    <div class="file-name">{{ selectedFile.name }}</div>
                    <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
                  </div>
                  <button @click="removeFile" class="remove-file-btn">×</button>
                </div>
              </div>
            </div>
          </div>

          <div class="step" :class="{ active: currentStep === 4 }" v-if="previewData.length > 0">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>Preview & Validate</h3>
              <div class="preview-summary">
                <div class="summary-item">
                  <span class="label">Total Rows:</span>
                  <span class="value">{{ previewData.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Valid Rows:</span>
                  <span class="value success">{{ validRows }}</span>
                </div>
                <div class="summary-item" v-if="invalidRows > 0">
                  <span class="label">Invalid Rows:</span>
                  <span class="value error">{{ invalidRows }}</span>
                </div>
              </div>

              <div class="preview-table-container">
                <table class="preview-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Room Number</th>
                      <th>Room Name</th>
                      <th>Type</th>
                      <th>Capacity</th>
                      <th>Price</th>
                      <th>Floor</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(row, index) in previewData.slice(0, 10)" 
                      :key="index"
                      :class="{ 'error-row': row.errors.length > 0 }"
                    >
                      <td>
                        <span :class="['status-icon', row.errors.length > 0 ? 'error' : 'success']">
                          {{ row.errors.length > 0 ? '❌' : '✅' }}
                        </span>
                      </td>
                      <td>{{ row.room_number }}</td>
                      <td>{{ row.room_name || '-' }}</td>
                      <td>{{ row.room_type }}</td>
                      <td>{{ row.capacity }}</td>
                      <td>${{ row.price_per_night }}</td>
                      <td>{{ row.floor }}</td>
                      <td>
                        <div v-if="row.errors.length > 0" class="error-list">
                          <div v-for="error in row.errors" :key="error" class="error-item">
                            {{ error }}
                          </div>
                        </div>
                        <span v-else class="success-text">Valid</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="previewData.length > 10" class="preview-note">
                  Showing first 10 rows of {{ previewData.length }} total rows
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="importing" class="import-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${importProgress}%` }"></div>
          </div>
          <div class="progress-text">
            Importing rooms... {{ importProgress }}%
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" @click="$emit('close')" class="btn btn-secondary" :disabled="importing">
          Cancel
        </button>
        <button 
          v-if="currentStep < 4"
          @click="nextStep" 
          class="btn btn-primary"
          :disabled="!canProceed"
        >
          Next
        </button>
        <button 
          v-if="currentStep === 4 && validRows > 0"
          @click="importRooms" 
          class="btn btn-primary"
          :disabled="importing || validRows === 0"
        >
          {{ importing ? 'Importing...' : `Import ${validRows} Rooms` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoomType } from '~/types/database'

const props = defineProps<{
  roomTypes: RoomType[]
}>()

const emit = defineEmits<{
  close: []
  imported: [count: number]
}>()

const { $supabase } = useNuxtApp()

const currentStep = ref(1)
const importMethod = ref<'csv' | 'excel' | ''>('')
const selectedFile = ref<File | null>(null)
const previewData = ref<any[]>([])
const error = ref('')
const importing = ref(false)
const importProgress = ref(0)

const fileInput = ref<HTMLInputElement | null>(null)

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1: return importMethod.value !== ''
    case 2: return true
    case 3: return selectedFile.value !== null
    case 4: return validRows.value > 0
    default: return false
  }
})

const validRows = computed(() => {
  return previewData.value.filter(row => row.errors.length === 0).length
})

const invalidRows = computed(() => {
  return previewData.value.filter(row => row.errors.length > 0).length
})

const nextStep = () => {
  if (canProceed.value) {
    currentStep.value++
  }
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const downloadTemplate = () => {
  const templateData = [{
    room_number: '101',
    room_name: 'Deluxe Suite',
    room_type: 'Suite',
    bed_type: 'King',
    capacity: 2,
    price_per_night: 150,
    floor: 1,
    section: 'West Wing',
    status: 'available',
    amenities: 'WiFi, AC, TV, Mini-bar',
    tags: 'VIP, Sea View',
    description: 'Spacious suite with ocean view'
  }]

  if (importMethod.value === 'csv') {
    const csv = convertToCSV(templateData)
    downloadFile(csv, 'room-import-template.csv', 'text/csv')
  } else {
    // For Excel, we'll use CSV format for simplicity
    const csv = convertToCSV(templateData)
    downloadFile(csv, 'room-import-template.csv', 'text/csv')
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = async (file: File) => {
  selectedFile.value = file
  error.value = ''
  
  try {
    const text = await file.text()
    const data = parseCSV(text)
    validateAndPreviewData(data)
    currentStep.value = 4
  } catch (err: any) {
    error.value = `Error reading file: ${err.message}`
  }
}

const parseCSV = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) throw new Error('File must contain headers and at least one data row')
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    data.push(row)
  }
  
  return data
}

const validateAndPreviewData = (data: any[]) => {
  const requiredFields = ['room_number', 'room_type', 'bed_type', 'capacity', 'price_per_night', 'floor']
  const validStatuses = ['available', 'occupied', 'reserved', 'maintenance', 'cleaning', 'out_of_service']
  const validBedTypes = ['Single', 'Double', 'Queen', 'King', 'Twin']
  
  previewData.value = data.map(row => {
    const errors: string[] = []
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!row[field] || row[field].toString().trim() === '') {
        errors.push(`${field} is required`)
      }
    })
    
    // Validate room type exists
    if (row.room_type && !props.roomTypes.find(type => type.name === row.room_type)) {
      errors.push(`Room type "${row.room_type}" does not exist`)
    }
    
    // Validate bed type
    if (row.bed_type && !validBedTypes.includes(row.bed_type)) {
      errors.push(`Invalid bed type: ${row.bed_type}`)
    }
    
    // Validate status
    if (row.status && !validStatuses.includes(row.status)) {
      errors.push(`Invalid status: ${row.status}`)
    }
    
    // Validate numeric fields
    if (row.capacity && (isNaN(Number(row.capacity)) || Number(row.capacity) < 1)) {
      errors.push('Capacity must be a positive number')
    }
    
    if (row.price_per_night && (isNaN(Number(row.price_per_night)) || Number(row.price_per_night) < 0)) {
      errors.push('Price must be a non-negative number')
    }
    
    if (row.floor && (isNaN(Number(row.floor)) || Number(row.floor) < 1)) {
      errors.push('Floor must be a positive number')
    }
    
    return {
      ...row,
      errors,
      capacity: Number(row.capacity) || 1,
      price_per_night: Number(row.price_per_night) || 0,
      floor: Number(row.floor) || 1,
      status: row.status || 'available'
    }
  })
}

const importRooms = async () => {
  importing.value = true
  importProgress.value = 0
  error.value = ''
  
  try {
    const validData = previewData.value.filter(row => row.errors.length === 0)
    let imported = 0
    
    for (const row of validData) {
      try {
        // Find room type ID
        const roomType = props.roomTypes.find(type => type.name === row.room_type)
        if (!roomType) continue
        
        // Prepare room data
        const roomData = {
          room_number: row.room_number,
          room_name: row.room_name || null,
          room_type_id: roomType.id,
          floor: row.floor,
          bed_type: row.bed_type,
          capacity: row.capacity,
          section: row.section || null,
          price_per_night: row.price_per_night,
          status: row.status,
          description: row.description || null,
          amenities: row.amenities ? JSON.stringify(row.amenities.split(',').map((a: string) => a.trim())) : '[]',
          tags: row.tags ? JSON.stringify(row.tags.split(',').map((t: string) => t.trim())) : '[]'
        }
        
        const { error: insertError } = await $supabase
          .from('rooms')
          .insert([roomData])
        
        if (insertError) {
          console.error('Error inserting room:', insertError)
        } else {
          imported++
        }
        
        importProgress.value = Math.round((imported / validData.length) * 100)
      } catch (err) {
        console.error('Error processing row:', err)
      }
    }
    
    emit('imported', imported)
  } catch (err: any) {
    error.value = `Import failed: ${err.message}`
  } finally {
    importing.value = false
  }
}

const removeFile = () => {
  selectedFile.value = null
  previewData.value = []
  currentStep.value = 3
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const convertToCSV = (data: any[]) => {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = []
  
  csvRows.push(headers.join(','))
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
        ? `"${value.replace(/"/g, '""')}"` 
        : value
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
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
  max-width: 900px;
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

.import-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.step {
  display: flex;
  gap: var(--spacing-md);
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step:not(.active) .step-number {
  background: var(--neutral-300);
}

.step-content {
  flex: 1;
}

.step-content h3 {
  font-size: 1.25rem;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-md);
}

.import-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.method-option {
  cursor: pointer;
}

.method-option input[type="radio"] {
  display: none;
}

.method-card {
  padding: var(--spacing-lg);
  border: 2px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all 0.2s ease;
}

.method-option input[type="radio"]:checked + .method-card {
  border-color: var(--primary-500);
  background: var(--primary-50);
}

.method-card:hover {
  border-color: var(--primary-300);
}

.method-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
}

.method-title {
  font-weight: 600;
  color: var(--neutral-900);
  margin-bottom: var(--spacing-xs);
}

.method-desc {
  font-size: 0.875rem;
  color: var(--neutral-600);
}

.template-info {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--neutral-50);
  border-radius: var(--radius-md);
}

.template-info h4 {
  margin-bottom: var(--spacing-sm);
  color: var(--neutral-900);
}

.template-info ul {
  list-style: none;
  padding: 0;
}

.template-info li {
  padding: var(--spacing-xs) 0;
  font-size: 0.875rem;
  color: var(--neutral-700);
}

.file-upload-area {
  border: 2px dashed var(--neutral-300);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.file-upload-area:hover {
  border-color: var(--primary-400);
  background: var(--primary-25);
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.upload-icon {
  font-size: 3rem;
  color: var(--neutral-400);
}

.upload-text p {
  margin: 0;
  color: var(--neutral-700);
}

.upload-hint {
  font-size: 0.875rem;
  color: var(--neutral-500);
}

.selected-file {
  margin-top: var(--spacing-md);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--neutral-50);
  border-radius: var(--radius-md);
}

.file-icon {
  font-size: 1.5rem;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: var(--neutral-900);
}

.file-size {
  font-size: 0.875rem;
  color: var(--neutral-600);
}

.remove-file-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--error-500);
  color: white;
  font-size: 1rem;
  line-height: 1;
}

.preview-summary {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--neutral-50);
  border-radius: var(--radius-md);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.summary-item .label {
  font-size: 0.875rem;
  color: var(--neutral-600);
}

.summary-item .value {
  font-size: 1.25rem;
  font-weight: 600;
}

.summary-item .value.success {
  color: var(--success-600);
}

.summary-item .value.error {
  color: var(--error-600);
}

.preview-table-container {
  overflow-x: auto;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th,
.preview-table td {
  padding: var(--spacing-sm);
  text-align: left;
  border-bottom: 1px solid var(--neutral-200);
  font-size: 0.875rem;
}

.preview-table th {
  background: var(--neutral-50);
  font-weight: 600;
  color: var(--neutral-700);
}

.error-row {
  background: var(--error-25);
}

.status-icon.success {
  color: var(--success-600);
}

.status-icon.error {
  color: var(--error-600);
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.error-item {
  font-size: 0.75rem;
  color: var(--error-600);
  background: var(--error-50);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
}

.success-text {
  color: var(--success-600);
  font-size: 0.875rem;
}

.preview-note {
  padding: var(--spacing-sm);
  text-align: center;
  font-size: 0.875rem;
  color: var(--neutral-600);
  background: var(--neutral-25);
}

.import-progress {
  margin: var(--spacing-lg) 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--neutral-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-500);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  margin-top: var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--neutral-600);
}

.error-message {
  padding: var(--spacing-md);
  background: var(--error-50);
  color: var(--error-700);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  margin: var(--spacing-lg) 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--neutral-200);
}
</style>
