<template>
  <div class="demo-requests-page">
    <div class="page-header">
      <h1>Demo Requests Management</h1>
      <p>Review and manage access requests from potential hotel owners</p>
    </div>

    <div v-if="loading" class="loading">Loading requests...</div>

    <div v-else class="requests-container">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon pending">📋</div>
          <div class="stat-info">
            <div class="stat-label">Pending</div>
            <div class="stat-value">{{ stats.pending }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon approved">✅</div>
          <div class="stat-info">
            <div class="stat-label">Approved</div>
            <div class="stat-value">{{ stats.approved }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rejected">❌</div>
          <div class="stat-info">
            <div class="stat-label">Rejected</div>
            <div class="stat-value">{{ stats.rejected }}</div>
          </div>
        </div>
      </div>

      <!-- Filters and Bulk Actions -->
      <div class="filters">
        <select v-model="statusFilter" @change="loadRequests" class="filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button @click="loadRequests" class="refresh-btn">
          🔄 Refresh
        </button>
        <NuxtLink to="/admin/analytics" class="analytics-btn">
          📊 Analytics
        </NuxtLink>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedRequests.length > 0" class="bulk-actions">
        <div class="bulk-info">
          {{ selectedRequests.length }} request{{ selectedRequests.length > 1 ? 's' : '' }} selected
        </div>
        <div class="bulk-buttons">
          <button @click="bulkApprove" class="bulk-btn approve" :disabled="processing">
            ✅ Approve Selected
          </button>
          <button @click="bulkReject" class="bulk-btn reject" :disabled="processing">
            ❌ Reject Selected
          </button>
          <button @click="bulkSendInvitations" class="bulk-btn invite" :disabled="processing">
            📧 Send Invitations
          </button>
          <button @click="clearSelection" class="bulk-btn clear">
            Clear Selection
          </button>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="requests-table">
        <div class="table-header">
          <div class="header-cell checkbox-cell">
            <input 
              type="checkbox" 
              :checked="allSelected" 
              @change="toggleSelectAll"
              class="select-checkbox"
            />
          </div>
          <div class="header-cell">Hotel Info</div>
          <div class="header-cell">Contact</div>
          <div class="header-cell">Rooms</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Date</div>
          <div class="header-cell">Actions</div>
        </div>

        <div v-if="requests.length === 0" class="empty-state">
          No requests found
        </div>

        <div v-for="request in requests" :key="request.id" class="table-row">
          <div class="cell checkbox-cell">
            <input 
              type="checkbox" 
              :checked="selectedRequests.includes(request.id)"
              @change="toggleRequestSelection(request.id)"
              class="select-checkbox"
            />
          </div>
          <div class="cell hotel-info">
            <div class="hotel-name">{{ request.hotel_name }}</div>
            <div class="request-id">ID: {{ request.id.slice(0, 8) }}...</div>
          </div>
          
          <div class="cell contact-info">
            <div class="contact-name">{{ request.name }}</div>
            <div class="contact-email">{{ request.email }}</div>
          </div>
          
          <div class="cell room-count">
            <span class="room-badge">{{ request.room_count }}</span>
          </div>
          
          <div class="cell status">
            <span :class="['status-badge', request.status]">
              {{ request.status.charAt(0).toUpperCase() + request.status.slice(1) }}
            </span>
          </div>
          
          <div class="cell date">
            <div class="created-date">{{ formatDate(request.created_at) }}</div>
            <div v-if="request.invitation_sent_at" class="invited-date">
              Invited: {{ formatDate(request.invitation_sent_at) }}
            </div>
          </div>
          
          <div class="cell actions">
            <button 
              v-if="request.status === 'pending'"
              @click="approveRequest(request)"
              class="action-btn approve"
              :disabled="processing"
            >
              ✅ Approve
            </button>
            
            <button 
              v-if="request.status === 'pending'"
              @click="rejectRequest(request)"
              class="action-btn reject"
              :disabled="processing"
            >
              ❌ Reject
            </button>
            
            <button 
              v-if="request.status === 'approved' && !request.invitation_sent_at"
              @click="sendInvitation(request)"
              class="action-btn invite"
              :disabled="processing"
            >
              📧 Send Invite
            </button>
            
            <button 
              v-if="request.status === 'approved' && request.invitation_sent_at"
              @click="resendInvitation(request)"
              class="action-btn resend"
              :disabled="processing"
            >
              🔄 Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role']
})

const { $supabase } = useNuxtApp()

const loading = ref(true)
const processing = ref(false)
const statusFilter = ref('')
const requests = ref<any[]>([])
const selectedRequests = ref<string[]>([])

const stats = computed(() => {
  return {
    pending: requests.value.filter(r => r.status === 'pending').length,
    approved: requests.value.filter(r => r.status === 'approved').length,
    rejected: requests.value.filter(r => r.status === 'rejected').length
  }
})

const allSelected = computed(() => {
  return requests.value.length > 0 && selectedRequests.value.length === requests.value.length
})

const loadRequests = async () => {
  try {
    loading.value = true
    
    let query = $supabase
      .from('demo_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (statusFilter.value) {
      query = query.eq('status', statusFilter.value)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error loading requests:', error)
      return
    }
    
    requests.value = data || []
  } catch (error) {
    console.error('Error loading requests:', error)
  } finally {
    loading.value = false
  }
}

const approveRequest = async (request: any) => {
  if (!confirm(`Approve access request from ${request.name} (${request.hotel_name})?`)) {
    return
  }
  
  try {
    processing.value = true
    
    const { error } = await $supabase
      .from('demo_requests')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', request.id)
    
    if (error) {
      alert('Failed to approve request: ' + error.message)
      return
    }
    
    // Update local state
    const index = requests.value.findIndex(r => r.id === request.id)
    if (index !== -1) {
      requests.value[index].status = 'approved'
    }
    
    alert('Request approved successfully!')
  } catch (error: any) {
    console.error('Error approving request:', error)
    alert('Failed to approve request')
  } finally {
    processing.value = false
  }
}

const rejectRequest = async (request: any) => {
  const reason = prompt(`Reject access request from ${request.name}?\n\nOptional reason:`)
  if (reason === null) return // User cancelled
  
  try {
    processing.value = true
    
    const { error } = await $supabase
      .from('demo_requests')
      .update({ 
        status: 'rejected',
        notes: reason || 'No reason provided',
        updated_at: new Date().toISOString()
      })
      .eq('id', request.id)
    
    if (error) {
      alert('Failed to reject request: ' + error.message)
      return
    }
    
    // Update local state
    const index = requests.value.findIndex(r => r.id === request.id)
    if (index !== -1) {
      requests.value[index].status = 'rejected'
    }
    
    alert('Request rejected')
  } catch (error: any) {
    console.error('Error rejecting request:', error)
    alert('Failed to reject request')
  } finally {
    processing.value = false
  }
}

const sendInvitation = async (request: any) => {
  try {
    processing.value = true
    
    // Set invitation expiry to 7 days from now
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)
    
    const { error } = await $supabase
      .from('demo_requests')
      .update({ 
        invitation_sent_at: new Date().toISOString(),
        invitation_expires_at: expiryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', request.id)
    
    if (error) {
      alert('Failed to send invitation: ' + error.message)
      return
    }
    
    // Update local state
    const index = requests.value.findIndex(r => r.id === request.id)
    if (index !== -1) {
      requests.value[index].invitation_sent_at = new Date().toISOString()
    }
    
    // Generate invitation link
    const inviteLink = `${window.location.origin}/signup?token=${request.invitation_token}`
    
    // Copy to clipboard
    await navigator.clipboard.writeText(inviteLink)
    
    alert(`Invitation sent! Link copied to clipboard:\n\n${inviteLink}\n\nSend this link to ${request.email}`)
  } catch (error: any) {
    console.error('Error sending invitation:', error)
    alert('Failed to send invitation')
  } finally {
    processing.value = false
  }
}

const resendInvitation = async (request: any) => {
  await sendInvitation(request)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedRequests.value = []
  } else {
    selectedRequests.value = requests.value.map(r => r.id)
  }
}

const toggleRequestSelection = (requestId: string) => {
  const index = selectedRequests.value.indexOf(requestId)
  if (index > -1) {
    selectedRequests.value.splice(index, 1)
  } else {
    selectedRequests.value.push(requestId)
  }
}

const clearSelection = () => {
  selectedRequests.value = []
}

const bulkApprove = async () => {
  if (!confirm(`Approve ${selectedRequests.value.length} selected requests?`)) {
    return
  }
  
  try {
    processing.value = true
    
    const { error } = await $supabase
      .from('demo_requests')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .in('id', selectedRequests.value)
    
    if (error) {
      alert('Failed to approve requests: ' + error.message)
      return
    }
    
    // Update local state
    requests.value.forEach(request => {
      if (selectedRequests.value.includes(request.id)) {
        request.status = 'approved'
      }
    })
    
    alert(`${selectedRequests.value.length} requests approved successfully!`)
    clearSelection()
  } catch (error: any) {
    console.error('Error bulk approving:', error)
    alert('Failed to approve requests')
  } finally {
    processing.value = false
  }
}

const bulkReject = async () => {
  const reason = prompt(`Reject ${selectedRequests.value.length} selected requests?\n\nOptional reason:`)
  if (reason === null) return // User cancelled
  
  try {
    processing.value = true
    
    const { error } = await $supabase
      .from('demo_requests')
      .update({ 
        status: 'rejected',
        notes: reason || 'Bulk rejection',
        updated_at: new Date().toISOString()
      })
      .in('id', selectedRequests.value)
    
    if (error) {
      alert('Failed to reject requests: ' + error.message)
      return
    }
    
    // Update local state
    requests.value.forEach(request => {
      if (selectedRequests.value.includes(request.id)) {
        request.status = 'rejected'
      }
    })
    
    alert(`${selectedRequests.value.length} requests rejected`)
    clearSelection()
  } catch (error: any) {
    console.error('Error bulk rejecting:', error)
    alert('Failed to reject requests')
  } finally {
    processing.value = false
  }
}

const bulkSendInvitations = async () => {
  const approvedSelected = requests.value.filter(r => 
    selectedRequests.value.includes(r.id) && r.status === 'approved'
  )
  
  if (approvedSelected.length === 0) {
    alert('No approved requests selected. Please select approved requests to send invitations.')
    return
  }
  
  if (!confirm(`Send invitations to ${approvedSelected.length} approved requests?`)) {
    return
  }
  
  try {
    processing.value = true
    let successCount = 0
    
    for (const request of approvedSelected) {
      try {
        const response = await $fetch('/api/send-invitation', {
          method: 'POST',
          body: { requestId: request.id }
        })
        
        if (response.success) {
          successCount++
          // Update local state
          const index = requests.value.findIndex(r => r.id === request.id)
          if (index !== -1) {
            requests.value[index].invitation_sent_at = new Date().toISOString()
          }
        }
      } catch (error) {
        console.error(`Failed to send invitation to ${request.email}:`, error)
      }
    }
    
    alert(`${successCount} of ${approvedSelected.length} invitations sent successfully!`)
    clearSelection()
  } catch (error: any) {
    console.error('Error bulk sending invitations:', error)
    alert('Failed to send invitations')
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  loadRequests()
})
</script>

<style scoped>
.demo-requests-page {
  max-width: 1400px;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #6b7280;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.pending {
  background: #fef3c7;
}

.stat-icon.approved {
  background: #d1fae5;
}

.stat-icon.rejected {
  background: #fee2e2;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #d4af37;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #b8931f;
}

.analytics-btn {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
  font-size: 0.875rem;
}

.analytics-btn:hover {
  background: #059669;
}

.bulk-actions {
  background: #fff9e6;
  border: 1px solid #d4af37;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-info {
  font-weight: 500;
  color: #8e6f15;
}

.bulk-buttons {
  display: flex;
  gap: 0.5rem;
}

.bulk-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bulk-btn.approve {
  background: #10b981;
  color: white;
}

.bulk-btn.approve:hover:not(:disabled) {
  background: #059669;
}

.bulk-btn.reject {
  background: #ef4444;
  color: white;
}

.bulk-btn.reject:hover:not(:disabled) {
  background: #dc2626;
}

.bulk-btn.invite {
  background: #d4af37;
  color: white;
}

.bulk-btn.invite:hover:not(:disabled) {
  background: #b8931f;
}

.bulk-btn.clear {
  background: #6b7280;
  color: white;
}

.bulk-btn.clear:hover {
  background: #4b5563;
}

.requests-table {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 2fr 2fr 1fr 1fr 1.5fr 2fr;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 2fr 2fr 1fr 1fr 1.5fr 2fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
}

.checkbox-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.select-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.table-row:hover {
  background: #f9fafb;
}

.cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hotel-name {
  font-weight: 600;
  color: #1f2937;
}

.request-id {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: monospace;
}

.contact-name {
  font-weight: 500;
  color: #1f2937;
}

.contact-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.room-badge {
  background: #fff9e6;
  color: #8e6f15;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  width: fit-content;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.created-date {
  font-size: 0.875rem;
  color: #1f2937;
}

.invited-date {
  font-size: 0.75rem;
  color: #059669;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.approve {
  background: #10b981;
  color: white;
}

.action-btn.approve:hover:not(:disabled) {
  background: #059669;
}

.action-btn.reject {
  background: #ef4444;
  color: white;
}

.action-btn.reject:hover:not(:disabled) {
  background: #dc2626;
}

.action-btn.invite,
.action-btn.resend {
  background: #d4af37;
  color: white;
}

.action-btn.invite:hover:not(:disabled),
.action-btn.resend:hover:not(:disabled) {
  background: #b8931f;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .demo-requests-page {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .filters {
    flex-direction: column;
  }
}
</style>
