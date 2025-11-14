<template>
  <section id="benefits" class="py-24 bg-white">
    <div class="container mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Why Hotel Owners Choose Roomio
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Transform your hotel operations and see immediate results in efficiency, 
          cost savings, and guest satisfaction.
        </p>
      </div>
      
      <!-- Benefits Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        <!-- Primary Benefit Card -->
        <div class="group bg-gradient-to-br from-royal-gold-500 to-royal-gold-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <h3 class="text-xl font-bold mb-4">40% Faster Operations</h3>
          <p class="text-white/90 mb-6 leading-relaxed">
            Automate routine tasks and streamline workflows to reduce operational time by up to 40%.
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-royal-gold-100">2hrs</div>
              <div class="text-xs text-white/80">Daily Time Saved</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-royal-gold-100">90%</div>
              <div class="text-xs text-white/80">Task Automation</div>
            </div>
          </div>
        </div>
        
        <!-- Regular Benefit Cards -->
        <div class="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-royal-gold-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Reduce Costs by 35%</h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Cut operational expenses through intelligent automation and optimized resource allocation.
          </p>
          <ul class="space-y-2">
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <div class="w-4 h-4 bg-royal-gold-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              Lower staff overhead
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <div class="w-4 h-4 bg-royal-gold-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              Reduced booking errors
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <div class="w-4 h-4 bg-royal-gold-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              Optimized energy usage
            </li>
          </ul>
        </div>
        
        <div class="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-royal-gold-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Boost Guest Satisfaction</h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Deliver exceptional guest experiences with faster check-ins and personalized service.
          </p>
          <ul class="space-y-2">
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <div class="w-4 h-4 bg-royal-gold-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              Instant check-in/out
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <div class="w-4 h-4 bg-royal-gold-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              Preference tracking
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <div class="w-4 h-4 bg-royal-gold-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              24/7 service requests
            </li>
          </ul>
        </div>
        
        <div class="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-royal-gold-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Increase Revenue by 25%</h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Maximize occupancy and optimize pricing with data-driven insights and dynamic rates.
          </p>
          <ul class="space-y-2">
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <div class="w-4 h-4 bg-royal-gold-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              Dynamic pricing
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <div class="w-4 h-4 bg-royal-gold-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              Revenue optimization
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <div class="w-4 h-4 bg-royal-gold-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              Upselling opportunities
            </li>
          </ul>
        </div>
      </div>
      
      <!-- ROI Calculator -->
      <div class="bg-gray-50 rounded-3xl p-8 lg:p-12 mb-20">
        <div class="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Calculate Your Potential Savings
            </h3>
            <p class="text-lg text-gray-600 mb-8 leading-relaxed">
              See how much you could save with Roomio based on your hotel size and current operations.
            </p>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Rooms</label>
                <input 
                  v-model.number="rooms" 
                  type="number" 
                  min="1" 
                  max="1000"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold-500 focus:border-royal-gold-500 transition-colors duration-300"
                  @input="calculateSavings"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Average Daily Rate (₦)</label>
                <input 
                  v-model.number="adr" 
                  type="number" 
                  min="10000" 
                  max="100000"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold-500 focus:border-royal-gold-500 transition-colors duration-300"
                  @input="calculateSavings"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Occupancy Rate (%)</label>
                <input 
                  v-model.number="occupancy" 
                  type="number" 
                  min="30" 
                  max="100"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-gold-500 focus:border-royal-gold-500 transition-colors duration-300"
                  @input="calculateSavings"
                />
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h4 class="text-lg font-semibold text-gray-700 text-center mb-4">Your Potential Annual Savings</h4>
            <div class="text-4xl lg:text-5xl font-bold text-royal-gold-500 text-center mb-8">
              ₦{{ formatNumber(annualSavings) }}
            </div>
            
            <div class="space-y-4 mb-8">
              <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Operational Cost Reduction</span>
                <span class="font-semibold text-gray-900">₦{{ formatNumber(operationalSavings) }}</span>
              </div>
              <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Revenue Increase</span>
                <span class="font-semibold text-gray-900">₦{{ formatNumber(revenueSavings) }}</span>
              </div>
              <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Time Savings Value</span>
                <span class="font-semibold text-gray-900">₦{{ formatNumber(timeSavings) }}</span>
              </div>
            </div>
            
            <button 
              @click="scrollToDemo" 
              class="group w-full bg-royal-gold-500 hover:bg-royal-gold-600 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
            >
              Get Your Custom Quote
              <span class="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Success Stories -->
      <div class="text-center">
        <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-12">
          Real Results from Real Hotels
        </h3>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div class="text-center mb-6">
              <div class="text-4xl font-bold text-royal-gold-500 mb-2">45%</div>
              <div class="text-sm font-medium text-gray-600">Cost Reduction</div>
            </div>
            <p class="text-gray-700 italic mb-6 leading-relaxed">
              "Roomio helped us reduce operational costs by 45% in just 6 months. 
              The automation features are game-changing."
            </p>
            <div class="text-center">
              <div class="font-semibold text-gray-900">Sarah Johnson</div>
              <div class="text-sm text-gray-600">Grand Plaza Hotel</div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div class="text-center mb-6">
              <div class="text-4xl font-bold text-royal-gold-500 mb-2">30%</div>
              <div class="text-sm font-medium text-gray-600">Revenue Increase</div>
            </div>
            <p class="text-gray-700 italic mb-6 leading-relaxed">
              "Our revenue increased by 30% thanks to the dynamic pricing and 
              better occupancy management."
            </p>
            <div class="text-center">
              <div class="font-semibold text-gray-900">Michael Chen</div>
              <div class="text-sm text-gray-600">Oceanview Resort</div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div class="text-center mb-6">
              <div class="text-4xl font-bold text-royal-gold-500 mb-2">95%</div>
              <div class="text-sm font-medium text-gray-600">Guest Satisfaction</div>
            </div>
            <p class="text-gray-700 italic mb-6 leading-relaxed">
              "Guest satisfaction scores improved to 95% after implementing 
              Roomio's guest management features."
            </p>
            <div class="text-center">
              <div class="font-semibold text-gray-900">Emma Rodriguez</div>
              <div class="text-sm text-gray-600">City Center Inn</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const rooms = ref(50)
const adr = ref(25000)
const occupancy = ref(75)

const annualSavings = ref(0)
const operationalSavings = ref(0)
const revenueSavings = ref(0)
const timeSavings = ref(0)

const calculateSavings = () => {
  const annualRevenue = rooms.value * adr.value * (occupancy.value / 100) * 365
  
  // Calculate different types of savings
  operationalSavings.value = annualRevenue * 0.15 // 15% operational cost reduction
  revenueSavings.value = annualRevenue * 0.12 // 12% revenue increase
  timeSavings.value = rooms.value * 2 * 365 * 5000 // 2 hours saved per room per day at ₦5000/hour
  
  annualSavings.value = operationalSavings.value + revenueSavings.value + timeSavings.value
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(Math.round(num))
}

const scrollToDemo = () => {
  const element = document.getElementById('pricing')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// Calculate initial savings
onMounted(() => {
  calculateSavings()
})
</script>

<style scoped>
/* No custom styles needed - using Tailwind classes */
</style>
