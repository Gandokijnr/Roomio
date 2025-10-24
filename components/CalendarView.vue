<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
      <div class="flex items-center gap-4">
        <button @click="previousPeriod" class="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
          ← Previous
        </button>
        <div class="flex gap-1">
          <button
            @click="currentView = 'month'"
            :class="[
              'px-3 py-2 text-sm rounded-md transition-colors',
              currentView === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            ]"
          >
            Month
          </button>
          <button
            @click="currentView = 'week'"
            :class="[
              'px-3 py-2 text-sm rounded-md transition-colors',
              currentView === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            ]"
          >
            Week
          </button>
        </div>
        <button @click="nextPeriod" class="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
          Next →
        </button>
      </div>
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-semibold text-gray-900">{{ formatPeriodTitle }}</h2>
        <button @click="goToToday" class="px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-md transition-colors">Today</button>
      </div>
    </div>

    <div class="flex gap-6 mb-6 p-4 bg-white rounded-md border border-gray-200">
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 bg-yellow-500 rounded-sm"></span>
        <span class="text-sm">Pending</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 bg-blue-500 rounded-sm"></span>
        <span class="text-sm">Confirmed</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 bg-green-500 rounded-sm"></span>
        <span class="text-sm">Checked In</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 bg-gray-400 rounded-sm"></span>
        <span class="text-sm">Checked Out</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 bg-red-500 rounded-sm"></span>
        <span class="text-sm">Cancelled</span>
      </div>
    </div>

    <div v-if="currentView === 'month'" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="grid grid-cols-7">
        <div v-for="day in weekDays" :key="day" class="p-4 bg-gray-100 border-b border-gray-200 font-semibold text-center text-gray-700">
          {{ day }}
        </div>
        <div
          v-for="date in monthDates"
          :key="date.dateStr"
          :class="[
            'min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50',
            {
              'bg-gray-25 text-gray-400': !date.isCurrentMonth,
              'bg-blue-50': date.isToday,
              'bg-white': date.isCurrentMonth && !date.isToday
            }
          ]"
          @click="selectDate(date)"
        >
          <div :class="[
            'font-semibold mb-1',
            date.isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm' : ''
          ]">
            {{ date.day }}
          </div>
          <div class="flex flex-col gap-0.5">
            <div
              v-for="reservation in date.reservations.slice(0, 3)"
              :key="reservation.id"
              :class="[
                'px-1.5 py-0.5 rounded text-xs cursor-pointer transition-opacity hover:opacity-80 text-white font-medium',
                {
                  'bg-yellow-500': reservation.status === 'pending',
                  'bg-blue-500': reservation.status === 'confirmed',
                  'bg-green-500': reservation.status === 'checked_in',
                  'bg-gray-400': reservation.status === 'checked_out',
                  'bg-red-500': reservation.status === 'cancelled'
                }
              ]"
              @click.stop="selectReservation(reservation)"
              :title="`${reservation.guest?.first_name} ${reservation.guest?.last_name} - Room ${reservation.room?.room_number}`"
            >
              <span class="truncate block">
                {{ reservation.guest?.first_name }} - R{{ reservation.room?.room_number }}
              </span>
            </div>
            <div v-if="date.reservations.length > 3" class="text-xs text-gray-600 font-medium">
              +{{ date.reservations.length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="grid grid-cols-8">
        <div class="border-r border-gray-200">
          <div class="p-4 bg-gray-100 border-b border-gray-200 font-semibold text-center">Time</div>
          <div class="flex flex-col">
            <div v-for="hour in 24" :key="hour" class="h-15 p-2 border-b border-gray-100 text-xs text-gray-600">
              {{ formatHour(hour - 1) }}
            </div>
          </div>
        </div>
        <div
          v-for="date in weekDates"
          :key="date.dateStr"
          :class="[
            'border-r border-gray-200',
            { 'bg-blue-25': date.isToday }
          ]"
        >
          <div :class="[
            'p-4 border-b border-gray-200 text-center',
            date.isToday ? 'bg-blue-100' : 'bg-gray-100'
          ]">
            <div class="font-semibold text-gray-700">{{ date.dayName }}</div>
            <div class="text-lg font-semibold text-gray-900">{{ date.day }}</div>
          </div>
          <div class="min-h-[360px] p-2 relative">
            <div
              v-for="reservation in date.reservations"
              :key="reservation.id"
              :class="[
                'mb-2 p-2 rounded cursor-pointer transition-opacity hover:opacity-90 text-white',
                {
                  'bg-yellow-500': reservation.status === 'pending',
                  'bg-blue-500': reservation.status === 'confirmed',
                  'bg-green-500': reservation.status === 'checked_in',
                  'bg-gray-400': reservation.status === 'checked_out',
                  'bg-red-500': reservation.status === 'cancelled'
                }
              ]"
              @click="selectReservation(reservation)"
              :title="`${reservation.guest?.first_name} ${reservation.guest?.last_name} - Room ${reservation.room?.room_number}`"
            >
              <div class="text-sm font-medium">{{ reservation.guest?.first_name }} {{ reservation.guest?.last_name }}</div>
              <div class="text-xs opacity-90">Room {{ reservation.room?.room_number }}</div>
              <div class="text-xs opacity-80">{{ formatReservationTime(reservation) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reservation Details Modal -->
    <div v-if="selectedReservation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeReservationModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-900">Reservation Details</h3>
          <button @click="closeReservationModal" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
            ×
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="font-medium text-gray-700">Reservation #:</span>
              <span class="text-gray-900">{{ selectedReservation.reservation_number }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="font-medium text-gray-700">Guest:</span>
              <span class="text-gray-900">{{ selectedReservation.guest?.first_name }} {{ selectedReservation.guest?.last_name }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="font-medium text-gray-700">Room:</span>
              <span class="text-gray-900">{{ selectedReservation.room?.room_number }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="font-medium text-gray-700">Check-in:</span>
              <span class="text-gray-900">{{ formatDateTime(selectedReservation.check_in_date) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="font-medium text-gray-700">Check-out:</span>
              <span class="text-gray-900">{{ formatDateTime(selectedReservation.check_out_date) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="font-medium text-gray-700">Status:</span>
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                {
                  'bg-yellow-100 text-yellow-800': selectedReservation.status === 'pending',
                  'bg-blue-100 text-blue-800': selectedReservation.status === 'confirmed',
                  'bg-green-100 text-green-800': selectedReservation.status === 'checked_in',
                  'bg-gray-100 text-gray-800': selectedReservation.status === 'checked_out',
                  'bg-red-100 text-red-800': selectedReservation.status === 'cancelled'
                }
              ]">
                {{ selectedReservation.status.replace('_', ' ') }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="font-medium text-gray-700">Amount:</span>
              <span class="text-gray-900 font-semibold">₦{{ selectedReservation.total_amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button @click="closeReservationModal" class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
            Close
          </button>
          <button @click="editReservation" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">
            Edit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reservation, ReservationStatus } from '~/types/database'

interface CalendarDate {
  date: Date
  dateStr: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  dayName: string
  reservations: Reservation[]
}

const props = defineProps<{
  reservations: Reservation[]
}>()

const emit = defineEmits<{
  editReservation: [reservation: Reservation]
  dateSelected: [date: Date]
}>()

const currentView = ref<'month' | 'week'>('month')
const currentDate = ref(new Date())
const selectedReservation = ref<Reservation | null>(null)

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatPeriodTitle = computed(() => {
  if (currentView.value === 'month') {
    return currentDate.value.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  } else {
    const startOfWeek = getStartOfWeek(currentDate.value)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${endOfWeek.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`
  }
})

const monthDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates: CalendarDate[] = []
  const currentDateObj = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    const dateStr = currentDateObj.toISOString().split('T')[0]
    const dayReservations = getReservationsForDate(dateStr)
    
    dates.push({
      date: new Date(currentDateObj),
      dateStr,
      day: currentDateObj.getDate(),
      isCurrentMonth: currentDateObj.getMonth() === month,
      isToday: isToday(currentDateObj),
      dayName: currentDateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      reservations: dayReservations
    })
    
    currentDateObj.setDate(currentDateObj.getDate() + 1)
  }
  
  return dates
})

const weekDates = computed(() => {
  const startOfWeek = getStartOfWeek(currentDate.value)
  const dates: CalendarDate[] = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    dates.push({
      date: new Date(date),
      dateStr,
      day: date.getDate(),
      isCurrentMonth: true,
      isToday: isToday(date),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      reservations: getReservationsForDate(dateStr)
    })
  }
  
  return dates
})

const getStartOfWeek = (date: Date) => {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  return start
}

const isToday = (date: Date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getReservationsForDate = (dateStr: string) => {
  return props.reservations.filter(reservation => {
    const checkIn = reservation.check_in_date
    const checkOut = reservation.check_out_date
    return dateStr >= checkIn && dateStr < checkOut
  })
}

const previousPeriod = () => {
  if (currentView.value === 'month') {
    currentDate.value.setMonth(currentDate.value.getMonth() - 1)
  } else {
    currentDate.value.setDate(currentDate.value.getDate() - 7)
  }
  currentDate.value = new Date(currentDate.value)
}

const nextPeriod = () => {
  if (currentView.value === 'month') {
    currentDate.value.setMonth(currentDate.value.getMonth() + 1)
  } else {
    currentDate.value.setDate(currentDate.value.getDate() + 7)
  }
  currentDate.value = new Date(currentDate.value)
}

const goToToday = () => {
  currentDate.value = new Date()
}

const selectDate = (date: CalendarDate) => {
  emit('dateSelected', date.date)
}

const selectReservation = (reservation: Reservation) => {
  selectedReservation.value = reservation
}

const closeReservationModal = () => {
  selectedReservation.value = null
}

const editReservation = () => {
  if (selectedReservation.value) {
    emit('editReservation', selectedReservation.value)
    closeReservationModal()
  }
}

const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatReservationTime = (reservation: Reservation) => {
  const checkIn = new Date(reservation.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const checkOut = new Date(reservation.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${checkIn} - ${checkOut}`
}

const getStatusColor = (status: ReservationStatus) => {
  const colors: Record<ReservationStatus, string> = {
    pending: 'warning',
    confirmed: 'primary',
    checked_in: 'success',
    checked_out: 'neutral',
    cancelled: 'error',
    no_show: 'error',
  }
  return colors[status] || 'neutral'
}
</script>
