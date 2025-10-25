<template>
  <div class="loyalty-manager">
    <!-- Loyalty Tier Configuration -->
    <div class="card">
      <h3>Loyalty Tier Configuration</h3>
      <p class="subtitle">Define tier requirements and benefits</p>
      
      <div class="tiers-grid">
        <div v-for="tier in loyaltyTiers" :key="tier.name" class="tier-card" :class="`tier-${tier.name}`">
          <div class="tier-header">
            <div class="tier-icon">{{ tier.icon }}</div>
            <h4>{{ tier.name.toUpperCase() }}</h4>
          </div>
          
          <div class="tier-requirements">
            <div class="requirement-item">
              <span class="requirement-label">Minimum Stays:</span>
              <input 
                v-model.number="tier.minStays" 
                type="number" 
                class="input-sm"
                @change="saveTierConfig"
              />
            </div>
            <div class="requirement-item">
              <span class="requirement-label">Minimum Spending:</span>
              <input 
                v-model.number="tier.minSpending" 
                type="number" 
                class="input-sm"
                @change="saveTierConfig"
              />
            </div>
            <div class="requirement-item">
              <span class="requirement-label">Points per ₦:</span>
              <input 
                v-model.number="tier.pointsPerNaira" 
                type="number" 
                step="0.01"
                class="input-sm"
                @change="saveTierConfig"
              />
            </div>
          </div>
          
          <div class="tier-benefits">
            <h5>Benefits</h5>
            <ul>
              <li v-for="(benefit, index) in tier.benefits" :key="index">{{ benefit }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Points Management -->
    <div class="card">
      <h3>Manual Points Adjustment</h3>
      <p class="subtitle">Add or deduct points for specific guests</p>
      
      <form @submit.prevent="adjustPoints" class="points-form">
        <div class="form-row">
          <div class="form-group">
            <label>Guest</label>
            <select v-model="pointsAdjustment.guestId" class="input" required>
              <option value="">Select a guest</option>
              <option v-for="guest in recentGuests" :key="guest.id" :value="guest.id">
                {{ guest.first_name }} {{ guest.last_name }} ({{ guest.loyalty_points || 0 }} pts)
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Transaction Type</label>
            <select v-model="pointsAdjustment.type" class="input" required>
              <option value="earned">Earned</option>
              <option value="redeemed">Redeemed</option>
              <option value="adjusted">Adjusted</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Points</label>
            <input 
              v-model.number="pointsAdjustment.points" 
              type="number" 
              class="input" 
              placeholder="Enter points amount"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <input 
            v-model="pointsAdjustment.description" 
            type="text" 
            class="input" 
            placeholder="Reason for adjustment"
            required
          />
        </div>
        
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Processing...' : 'Apply Adjustment' }}
        </button>
      </form>
    </div>

    <!-- Loyalty Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-label">Total Members</div>
          <div class="stat-value">{{ loyaltyStats.totalMembers }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <div class="stat-label">Active Points</div>
          <div class="stat-value">{{ loyaltyStats.activePoints.toLocaleString() }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎁</div>
        <div class="stat-content">
          <div class="stat-label">Redeemed This Month</div>
          <div class="stat-value">{{ loyaltyStats.redeemedThisMonth.toLocaleString() }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-label">Earned This Month</div>
          <div class="stat-value">{{ loyaltyStats.earnedThisMonth.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="card">
      <h3>Recent Loyalty Transactions</h3>
      <div class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Guest</th>
              <th>Type</th>
              <th>Points</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in recentTransactions" :key="transaction.id">
              <td>{{ formatDate(transaction.created_at) }}</td>
              <td>{{ transaction.guest?.first_name }} {{ transaction.guest?.last_name }}</td>
              <td>
                <span class="badge" :class="`badge-${transaction.transaction_type}`">
                  {{ transaction.transaction_type }}
                </span>
              </td>
              <td :class="{ 'negative': transaction.transaction_type === 'redeemed' }">
                {{ transaction.transaction_type === 'redeemed' ? '-' : '+' }}{{ transaction.points }}
              </td>
              <td>{{ transaction.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tier Upgrade Notifications -->
    <div v-if="pendingUpgrades.length > 0" class="card upgrades-section">
      <h3>Pending Tier Upgrades</h3>
      <p class="subtitle">Guests eligible for tier upgrades</p>
      
      <div class="upgrades-list">
        <div v-for="upgrade in pendingUpgrades" :key="upgrade.guest.id" class="upgrade-item">
          <div class="upgrade-info">
            <div class="guest-name">{{ upgrade.guest.first_name }} {{ upgrade.guest.last_name }}</div>
            <div class="upgrade-details">
              Current: <span :class="`tier-badge tier-${upgrade.currentTier}`">{{ upgrade.currentTier }}</span>
              → Eligible for: <span :class="`tier-badge tier-${upgrade.eligibleTier}`">{{ upgrade.eligibleTier }}</span>
            </div>
          </div>
          <button @click="upgradeTier(upgrade.guest)" class="btn btn-sm btn-primary">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Guest, LoyaltyTransaction } from '~/types/database'
import { format } from 'date-fns'

const { $supabase } = useNuxtApp()

const loading = ref(false)
const recentGuests = ref<Guest[]>([])
const recentTransactions = ref<LoyaltyTransaction[]>([])
const pendingUpgrades = ref<any[]>([])

// Loyalty tier configuration
const loyaltyTiers = ref([
  {
    name: 'bronze',
    icon: '🥉',
    minStays: 0,
    minSpending: 0,
    pointsPerNaira: 0.01,
    benefits: ['Earn 1 point per ₦100 spent', 'Birthday discount', 'Priority support']
  },
  {
    name: 'silver',
    icon: '🥈',
    minStays: 5,
    minSpending: 100000,
    pointsPerNaira: 0.015,
    benefits: ['Earn 1.5 points per ₦100', 'Free room upgrade (subject to availability)', 'Late checkout', 'Welcome drink']
  },
  {
    name: 'gold',
    icon: '🥇',
    minStays: 15,
    minSpending: 500000,
    pointsPerNaira: 0.02,
    benefits: ['Earn 2 points per ₦100', 'Guaranteed room upgrade', 'Free breakfast', 'Late checkout', 'Airport transfer discount']
  },
  {
    name: 'platinum',
    icon: '💎',
    minStays: 30,
    minSpending: 1000000,
    pointsPerNaira: 0.03,
    benefits: ['Earn 3 points per ₦100', 'Suite upgrade', 'Complimentary breakfast & dinner', 'Free airport transfer', 'Personal concierge']
  }
])

// Points adjustment form
const pointsAdjustment = ref({
  guestId: '',
  type: 'earned',
  points: 0,
  description: ''
})

// Loyalty statistics
const loyaltyStats = ref({
  totalMembers: 0,
  activePoints: 0,
  redeemedThisMonth: 0,
  earnedThisMonth: 0
})

// Load recent guests for points adjustment
const loadRecentGuests = async () => {
  try {
    const { data, error } = await $supabase
      .from('guests')
      .select('id, first_name, last_name, loyalty_points')
      .order('last_visit_date', { ascending: false })
      .limit(50)

    if (error) throw error
    recentGuests.value = data || []
  } catch (error) {
    console.error('Error loading guests:', error)
  }
}

// Load recent transactions
const loadRecentTransactions = async () => {
  try {
    const { data, error } = await $supabase
      .from('loyalty_transactions')
      .select('*, guest:guests(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    recentTransactions.value = data || []
  } catch (error) {
    console.error('Error loading transactions:', error)
  }
}

// Calculate loyalty statistics
const calculateStats = async () => {
  try {
    // Total members
    const { count: totalMembers } = await $supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })

    // Active points
    const { data: guests } = await $supabase
      .from('guests')
      .select('loyalty_points')

    const activePoints = guests?.reduce((sum, g) => sum + (g.loyalty_points || 0), 0) || 0

    // This month's transactions
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthTransactions } = await $supabase
      .from('loyalty_transactions')
      .select('transaction_type, points')
      .gte('created_at', startOfMonth.toISOString())

    const redeemedThisMonth = monthTransactions
      ?.filter(t => t.transaction_type === 'redeemed')
      .reduce((sum, t) => sum + t.points, 0) || 0

    const earnedThisMonth = monthTransactions
      ?.filter(t => t.transaction_type === 'earned')
      .reduce((sum, t) => sum + t.points, 0) || 0

    loyaltyStats.value = {
      totalMembers: totalMembers || 0,
      activePoints,
      redeemedThisMonth,
      earnedThisMonth
    }
  } catch (error) {
    console.error('Error calculating stats:', error)
  }
}

// Check for pending tier upgrades
const checkPendingUpgrades = async () => {
  try {
    const { data: guests } = await $supabase
      .from('guests')
      .select('*')

    if (!guests) return

    const upgrades: any[] = []

    guests.forEach(guest => {
      const currentTier = guest.loyalty_tier || 'bronze'
      const eligibleTier = calculateEligibleTier(guest)

      if (shouldUpgrade(currentTier, eligibleTier)) {
        upgrades.push({
          guest,
          currentTier,
          eligibleTier
        })
      }
    })

    pendingUpgrades.value = upgrades
  } catch (error) {
    console.error('Error checking upgrades:', error)
  }
}

// Calculate eligible tier based on guest stats
const calculateEligibleTier = (guest: Guest): string => {
  const stays = guest.total_stays || 0
  const spending = guest.total_spending || 0

  if (stays >= 30 && spending >= 1000000) return 'platinum'
  if (stays >= 15 && spending >= 500000) return 'gold'
  if (stays >= 5 && spending >= 100000) return 'silver'
  return 'bronze'
}

// Check if upgrade is needed
const shouldUpgrade = (current: string, eligible: string): boolean => {
  const tiers = ['bronze', 'silver', 'gold', 'platinum']
  return tiers.indexOf(eligible) > tiers.indexOf(current)
}

// Adjust points manually
const adjustPoints = async () => {
  try {
    loading.value = true

    // Create loyalty transaction
    const { error: transactionError } = await $supabase
      .from('loyalty_transactions')
      .insert({
        guest_id: pointsAdjustment.value.guestId,
        transaction_type: pointsAdjustment.value.type,
        points: pointsAdjustment.value.points,
        description: pointsAdjustment.value.description
      })

    if (transactionError) throw transactionError

    // Update guest points
    const pointsChange = pointsAdjustment.value.type === 'redeemed' 
      ? -pointsAdjustment.value.points 
      : pointsAdjustment.value.points

    const { error: updateError } = await $supabase.rpc('update_guest_points', {
      p_guest_id: pointsAdjustment.value.guestId,
      p_points_change: pointsChange
    })

    if (updateError) throw updateError

    alert('Points adjusted successfully!')
    
    // Reset form
    pointsAdjustment.value = {
      guestId: '',
      type: 'earned',
      points: 0,
      description: ''
    }

    // Reload data
    await Promise.all([
      loadRecentTransactions(),
      calculateStats(),
      loadRecentGuests()
    ])
  } catch (error) {
    console.error('Error adjusting points:', error)
    alert('Failed to adjust points. Please try again.')
  } finally {
    loading.value = false
  }
}

// Upgrade guest tier
const upgradeTier = async (guest: Guest) => {
  try {
    const newTier = calculateEligibleTier(guest)

    const { error } = await $supabase
      .from('guests')
      .update({ loyalty_tier: newTier })
      .eq('id', guest.id)

    if (error) throw error

    alert(`${guest.first_name} ${guest.last_name} upgraded to ${newTier.toUpperCase()}!`)
    
    // Reload pending upgrades
    await checkPendingUpgrades()
  } catch (error) {
    console.error('Error upgrading tier:', error)
    alert('Failed to upgrade tier. Please try again.')
  }
}

// Save tier configuration
const saveTierConfig = () => {
  // In a real app, save to database or config file
  console.log('Tier configuration saved:', loyaltyTiers.value)
  alert('Tier configuration saved!')
}

// Format date helper
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy HH:mm')
}

// Load initial data
onMounted(async () => {
  await Promise.all([
    loadRecentGuests(),
    loadRecentTransactions(),
    calculateStats(),
    checkPendingUpgrades()
  ])
})
</script>

<style scoped>
.loyalty-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.tier-card {
  border: 2px solid;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.tier-card.tier-bronze {
  border-color: #cd7f32;
  background: linear-gradient(135deg, #fff 0%, #fef3e8 100%);
}

.tier-card.tier-silver {
  border-color: #c0c0c0;
  background: linear-gradient(135deg, #fff 0%, #f5f5f5 100%);
}

.tier-card.tier-gold {
  border-color: #ffd700;
  background: linear-gradient(135deg, #fff 0%, #fffacd 100%);
}

.tier-card.tier-platinum {
  border-color: #e5e4e2;
  background: linear-gradient(135deg, #fff 0%, #f0f0ff 100%);
}

.tier-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.tier-icon {
  font-size: 2rem;
}

.tier-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
}

.tier-requirements {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.requirement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.requirement-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.input-sm {
  width: 100px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.tier-benefits {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.tier-benefits h5 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.tier-benefits ul {
  list-style: none;
  padding: 0;
}

.tier-benefits li {
  font-size: 0.813rem;
  color: #6b7280;
  padding: 0.25rem 0;
  padding-left: 1rem;
  position: relative;
}

.tier-benefits li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
}

.points-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  ring: 2px;
  ring-color: #3b82f6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 0.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.transactions-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

th {
  padding: 0.75rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-earned {
  background: #d1fae5;
  color: #065f46;
}

.badge-redeemed {
  background: #fee2e2;
  color: #991b1b;
}

.badge-adjusted {
  background: #dbeafe;
  color: #1e40af;
}

.badge-expired {
  background: #e5e7eb;
  color: #374151;
}

.negative {
  color: #ef4444;
}

.upgrades-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upgrade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border-left: 3px solid #3b82f6;
}

.guest-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.upgrade-details {
  font-size: 0.875rem;
  color: #6b7280;
}

.tier-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.813rem;
}
</style>
