<template>
  <section id="features" class="py-8 bg-gray-50">
    <div class="container mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
          Everything You Need to Run Your Hotel
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Comprehensive tools designed specifically for hotel operations, 
          from booking to checkout and everything in between.
        </p>
      </div>
      
      <!-- Features Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        <div 
          v-for="feature in features" 
          :key="feature.id" 
          class="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-royal-gold-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
        >
          <h3 class="text-xl font-bold text-gray-900 mb-4">{{ feature.title }}</h3>
          <p class="text-gray-600 mb-6 leading-relaxed">{{ feature.description }}</p>
          <ul class="space-y-3">
            <li 
              v-for="benefit in feature.benefits" 
              :key="benefit"
              class="flex items-center gap-3 text-sm text-gray-700"
            >
              <div class="w-5 h-5 bg-royal-gold-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                ✓
              </div>
              {{ benefit }}
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Feature Showcase -->
      <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div class="grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-12">
          <!-- Showcase Text -->
          <div>
            <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Real-Time Dashboard
            </h3>
            <p class="text-lg text-gray-600 mb-8 leading-relaxed">
              Monitor your entire hotel operation from a single, intuitive dashboard. 
              Get instant insights into occupancy rates, revenue, and operational metrics.
            </p>
            
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div>
                  <h4 class="font-semibold text-gray-900 mb-1">Live Analytics</h4>
                  <p class="text-gray-600 text-sm">Real-time occupancy and revenue tracking</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div>
                  <h4 class="font-semibold text-gray-900 mb-1">Smart Alerts</h4>
                  <p class="text-gray-600 text-sm">Automated notifications for critical events</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div>
                  <h4 class="font-semibold text-gray-900 mb-1">Mobile Ready</h4>
                  <p class="text-gray-600 text-sm">Access from anywhere, any device</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Showcase Visual -->
          <div class="relative">
            <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <!-- Mockup Header -->
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                <div class="flex gap-2">
                  <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div class="text-sm font-medium text-gray-600">Hotel Dashboard</div>
              </div>
              
              <!-- Mockup Content -->
              <div class="p-6">
                <!-- Stats -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div class="text-lg font-bold text-gray-900">156</div>
                      <div class="text-xs text-gray-600">Total Rooms</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div class="text-lg font-bold text-gray-900">₦2.5M</div>
                      <div class="text-xs text-gray-600">Today's Revenue</div>
                    </div>
                  </div>
                </div>
                
                <!-- Chart -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="text-sm font-medium text-gray-700 mb-3">Occupancy Trend</div>
                  <svg viewBox="0 0 200 60" class="w-full h-16">
                    <polyline
                      points="10,50 30,40 50,30 70,25 90,20 110,15 130,18 150,12 170,8 190,5"
                      fill="none"
                      stroke="#d4af37"
                      stroke-width="2"
                      class="drop-shadow-sm"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    id: 1,
    title: 'Smart Booking Management',
    description: 'Streamline reservations with automated booking workflows and real-time availability.',
    benefits: [
      'Online booking integration',
      'Automated confirmation emails',
      'Dynamic pricing rules',
      'Overbooking protection'
    ]
  },
  {
    id: 2,
    title: 'Housekeeping Automation',
    description: 'Optimize cleaning schedules and track room status with intelligent task management.',
    benefits: [
      'Automated task assignment',
      'Real-time status updates',
      'Quality control checklists',
      'Performance analytics'
    ]
  },
  {
    id: 3,
    title: 'Room Status Tracking',
    description: 'Monitor every room in real-time with comprehensive status management.',
    benefits: [
      'Live room availability',
      'Maintenance scheduling',
      'Cleaning status tracking',
      'Guest check-in/out logs'
    ]
  },
  {
    id: 4,
    title: 'Payment Processing',
    description: 'Secure payment handling with multiple payment methods and automated billing.',
    benefits: [
      'Multiple payment gateways',
      'Automated invoicing',
      'Split billing support',
      'PCI compliance'
    ]
  },
  {
    id: 5,
    title: 'Financial Reporting',
    description: 'Comprehensive financial insights with automated reports and analytics.',
    benefits: [
      'Revenue analytics',
      'Expense tracking',
      'Profit margin analysis',
      'Tax reporting'
    ]
  },
  {
    id: 6,
    title: 'Guest Management',
    description: 'Complete guest profiles with preferences, history, and loyalty tracking.',
    benefits: [
      'Guest preference tracking',
      'Loyalty program integration',
      'Communication history',
      'Feedback management'
    ]
  }
]
</script>

<style scoped>
/* No custom styles needed - using Tailwind classes */
</style>
