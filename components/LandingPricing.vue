<template>
  <section id="pricing" class="py-24 bg-white">
    <div class="container mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
          Simple, Transparent Pricing
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-2">
          Choose the plan that fits your hotel size. All plans include 24/7 support 
          and free white-glove onboarding.
        </p>
        <p class="text-sm font-semibold text-yellow-700">
          14-day free trial. No credit card required to start.
        </p>
      </div>
      
      <!-- Pricing Toggle -->
      <div class="flex items-center justify-center gap-4 mb-12">
        <span class="font-medium transition-colors duration-300" :class="!isAnnual ? 'text-gray-900' : 'text-gray-500'">
          Monthly
        </span>
        <button 
          @click="togglePricing" 
          class="relative w-16 h-8 rounded-full border-none cursor-pointer transition-colors duration-300"
          :class="isAnnual ? 'bg-yellow-500' : 'bg-gray-300'"
        >
          <span 
            class="absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300"
            :class="isAnnual ? 'translate-x-8' : 'translate-x-1'"
          ></span>
        </button>
        <span class="font-medium transition-colors duration-300" :class="isAnnual ? 'text-gray-900' : 'text-gray-500'">
          Annual 
          <span class="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold ml-2">
            Save 20%
          </span>
        </span>
      </div>
      
      <!-- Pricing Cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div 
          v-for="plan in pricingPlans" 
          :key="plan.id" 
          class="relative bg-white border-2 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          :class="plan.featured ? 'border-yellow-500 scale-105' : 'border-gray-200'"
        >
          
          <div 
            v-if="plan.featured" 
            class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold"
          >
            Most Popular
          </div>
          
          <!-- Plan Header -->
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
            <p class="text-gray-600 text-sm">{{ plan.description }}</p>
          </div>
          
          <!-- Plan Pricing -->
          <div class="text-center mb-8">
            <div class="flex items-baseline justify-center gap-1 mb-2">
              <span class="text-xl text-gray-500">₦</span>
              <span class="text-5xl font-bold text-gray-900">{{ isAnnual ? plan.yearlyPrice : plan.monthlyPrice }}</span>
              <span class="text-gray-500">{{ isAnnual ? '/year' : '/month' }}</span>
            </div>
            <div class="text-sm text-gray-600">{{ plan.priceNote }}</div>
          </div>
          
          <!-- Plan Features -->
          <ul class="space-y-4 mb-8">
            <li 
              v-for="feature in plan.features" 
              :key="feature" 
              class="flex items-center gap-3 text-sm text-gray-700"
            >
              <div class="w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                ✓
              </div>
              {{ feature }}
            </li>
          </ul>
          
          <!-- Plan Button -->
          <button 
            @click="selectPlan(plan)" 
            class="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            :class="plan.featured 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
              : 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white'"
          >
            {{ plan.buttonText }}
          </button>
          
          <!-- Plan Footer -->
          <div class="text-center mt-4">
            <span class="text-xs text-gray-500">{{ plan.guarantee }}</span>
          </div>
        </div>
      </div>
      
      <!-- Enterprise Section -->
      <div class="bg-gray-50 rounded-3xl p-8 lg:p-12 mb-16">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Need Something Custom?
            </h3>
            <p class="text-lg text-gray-600 mb-8 leading-relaxed">
              For hotels with 100+ rooms or unique requirements, we offer custom enterprise solutions 
              with dedicated support, custom integrations, and flexible pricing.
            </p>
            <ul class="space-y-3">
              <li class="flex items-center gap-3 text-gray-700">
                <div class="w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ✓
                </div>
                Custom integrations with existing systems
              </li>
              <li class="flex items-center gap-3 text-gray-700">
                <div class="w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ✓
                </div>
                Dedicated account manager
              </li>
              <li class="flex items-center gap-3 text-gray-700">
                <div class="w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ✓
                </div>
                Priority support & training
              </li>
              <li class="flex items-center gap-3 text-gray-700">
                <div class="w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ✓
                </div>
                Custom reporting & analytics
              </li>
              <li class="flex items-center gap-3 text-gray-700">
                <div class="w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ✓
                </div>
                White-label options available
              </li>
            </ul>
          </div>
          <div class="text-center">
            <button 
              @click="contactSales" 
              class="group bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 mx-auto mb-4"
            >
              Contact Sales
              <span class="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
            <p class="text-sm text-gray-600">
              Get a custom quote within 24 hours
            </p>
          </div>
        </div>
      </div>
      
      <!-- Access Request Section -->
      <div id="request-access" class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-8 lg:p-12 mb-16 text-white">
        <div class="text-center mb-8">
          <h3 class="text-3xl lg:text-4xl font-bold mb-4">
            Request Exclusive Access
          </h3>
          <p class="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Join our exclusive community of hotel owners. Submit your request for access and 
            receive a personalized invitation to experience Roomio.
          </p>
        </div>
        
        <div class="max-w-2xl mx-auto mb-8">
          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <input 
              v-model="demoForm.name" 
              type="text" 
              placeholder="Your Name" 
              class="px-4 py-3 rounded-xl border-none text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
            <input 
              v-model="demoForm.email" 
              type="email" 
              placeholder="Email Address" 
              class="px-4 py-3 rounded-xl border-none text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
          </div>
          <div class="grid md:grid-cols-2 gap-4 mb-6">
            <input 
              v-model="demoForm.hotel" 
              type="text" 
              placeholder="Hotel Name" 
              class="px-4 py-3 rounded-xl border-none text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
            <select 
              v-model="demoForm.rooms" 
              class="px-4 py-3 rounded-xl border-none text-gray-900 focus:ring-2 focus:ring-white/50 focus:outline-none"
            >
              <option value="">Number of Rooms</option>
              <option value="1-25">1-25 rooms</option>
              <option value="26-50">26-50 rooms</option>
              <option value="51-100">51-100 rooms</option>
              <option value="100+">100+ rooms</option>
            </select>
          </div>
          <button 
            @click="requestAccess" 
            class="w-full bg-white text-yellow-700 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-yellow-50 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            :disabled="!isFormValid"
          >
            Request Access
          </button>
        </div>
        
        <div class="flex flex-wrap justify-center gap-8 text-center">
          <div class="flex items-center gap-2 text-white/90">
            <div class="w-2 h-2 bg-white rounded-full"></div>
            <span class="text-sm">Exclusive invitation-only access</span>
          </div>
          <div class="flex items-center gap-2 text-white/90">
            <div class="w-2 h-2 bg-white rounded-full"></div>
            <span class="text-sm">Personalized onboarding</span>
          </div>
          <div class="flex items-center gap-2 text-white/90">
            <div class="w-2 h-2 bg-white rounded-full"></div>
            <span class="text-sm">Dedicated success manager</span>
          </div>
        </div>
      </div>
      
      <!-- FAQ Section -->
      <div>
        <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-12">
          Frequently Asked Questions
        </h3>
        <div class="max-w-4xl mx-auto">
          <div 
            v-for="faq in faqs" 
            :key="faq.id" 
            class="border-b border-gray-200 last:border-b-0"
          >
            <button 
              @click="toggleFaq(faq.id)" 
              class="w-full py-6 text-left flex justify-between items-center hover:text-yellow-600 transition-colors duration-300"
            >
              <span class="text-lg font-semibold text-gray-900 pr-4">{{ faq.question }}</span>
              <span 
                class="text-2xl font-light text-gray-400 transition-transform duration-300 flex-shrink-0"
                :class="openFaq === faq.id ? 'rotate-45' : ''"
              >
                +
              </span>
            </button>
            <div 
              v-if="openFaq === faq.id" 
              class="pb-6 text-gray-600 leading-relaxed"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const isAnnual = ref(false)
const openFaq = ref<number | null>(null)

const demoForm = ref({
  name: '',
  email: '',
  hotel: '',
  rooms: ''
})

const pricingPlans = [
  {
    id: 1,
    name: 'Starter',
    description: 'Perfect for small hotels and B&Bs',
    monthlyPrice: 15000,
    yearlyPrice: 150000,
    priceNote: 'Up to 25 rooms',
    features: [
      'Room & booking management',
      'Basic housekeeping tools',
      'Guest check-in/out',
      'Payment processing',
      'Email support',
      'Mobile app access'
    ],
    buttonText: 'Start Free Trial',
    guarantee: '14-day free trial. No credit card required to start.',
    featured: false
  },
  {
    id: 2,
    name: 'Professional',
    description: 'Most popular for mid-size hotels',
    monthlyPrice: 10000,
    yearlyPrice: 100000,
    priceNote: 'Up to 75 rooms',
    features: [
      'Everything in Starter',
      'Advanced housekeeping automation',
      'Financial reporting & analytics',
      'Guest management & loyalty',
      'Multi-user access',
      'Phone & chat support',
      'API integrations'
    ],
    buttonText: 'Start Free Trial',
    guarantee: '30-day money-back guarantee',
    featured: true
  },
  {
    id: 3,
    name: 'Enterprise',
    description: 'For larger hotels and chains',
    monthlyPrice: 25000,
    yearlyPrice: 250000,
    priceNote: 'Up to 150 rooms',
    features: [
      'Everything in Professional',
      'Advanced analytics & reporting',
      'Custom integrations',
      'Dedicated account manager',
      'Priority support',
      'Staff training included',
      'White-label options'
    ],
    buttonText: 'Contact Sales',
    guarantee: 'Custom SLA available',
    featured: false
  }
]

const faqs = [
  {
    id: 1,
    question: 'How long does implementation take?',
    answer: 'Most hotels are up and running within 24-48 hours. Our team handles the setup and provides training to ensure a smooth transition.'
  },
  {
    id: 2,
    question: 'Can I integrate with my existing systems?',
    answer: 'Yes! Roomio integrates with most popular hotel systems including channel managers, payment processors, and accounting software.'
  },
  {
    id: 3,
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level encryption, are SOC 2 certified, and comply with all major data protection regulations including GDPR.'
  },
  {
    id: 4,
    question: 'What if I need to cancel?',
    answer: 'You can cancel your trial at any time. Payment is only required after your 14-day free trial ends to unlock your first paid month.'
  },
  {
    id: 5,
    question: 'Do you offer training and support?',
    answer: 'Yes! All plans include comprehensive training, and our support team is available 24/7 via phone, chat, and email.'
  },
  {
    id: 6,
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Absolutely! You can change your plan at any time. Upgrades take effect immediately, and downgrades at your next billing cycle.'
  }
]

const togglePricing = () => {
  isAnnual.value = !isAnnual.value
}

const selectPlan = (plan: any) => {
  const element = document.getElementById('request-access')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const contactSales = () => {
  // Handle contact sales
  console.log('Contact sales clicked')
  // You could open a contact form or redirect to a contact page
}

const requestAccess = async () => {
  if (!isFormValid.value) return
  
  try {
    const response = await $fetch('/api/demo-request', {
      method: 'POST',
      body: {
        name: demoForm.value.name,
        email: demoForm.value.email,
        hotel: demoForm.value.hotel,
        rooms: demoForm.value.rooms
      }
    }) as { success: boolean; message: string; requestId?: string }
    
    if (response.success) {
      alert(response.message)
      // Reset form
      demoForm.value = { name: '', email: '', hotel: '', rooms: '' }
    }
  } catch (error: any) {
    console.error('Request access error:', error)
    alert(error.data?.message || 'Failed to submit request. Please try again.')
  }
}

const toggleFaq = (id: number) => {
  openFaq.value = openFaq.value === id ? null : id
}

const isFormValid = computed(() => {
  return demoForm.value.name && 
         demoForm.value.email && 
         demoForm.value.hotel && 
         demoForm.value.rooms
})
</script>

<style scoped>
/* No custom styles needed - using Tailwind classes */
</style>
