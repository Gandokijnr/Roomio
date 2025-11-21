<template>
  <section id="testimonials" class="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="container mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
          Trusted by Hotel Owners Worldwide
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Join thousands of satisfied hotel owners who have transformed their operations with Roomio.
        </p>
      </div>
      
      <!-- Featured Testimonial -->
      <div class="relative bg-white rounded-3xl p-8 lg:p-12 shadow-2xl mb-16">
        <div class="absolute top-4 left-8 text-6xl text-yellow-500/30 font-serif">"</div>
        <blockquote class="relative z-10 text-2xl lg:text-3xl font-medium text-gray-900 italic leading-relaxed mb-8 pt-8">
          Roomio completely transformed our hotel operations. We've seen a 45% reduction in operational costs 
          and our guest satisfaction scores have never been higher. The automation features alone save us 
          3 hours of work every single day.
        </blockquote>
        <div class="mb-8">
          <div class="text-lg font-semibold text-gray-900">David Thompson</div>
          <div class="text-gray-600">General Manager</div>
          <div class="text-yellow-600 font-medium">Grand Harbor Hotel</div>
        </div>
        <div class="flex flex-wrap justify-center gap-8 pt-8 border-t border-gray-200">
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-500">45%</div>
            <div class="text-sm text-gray-600">Cost Reduction</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-500">3hrs</div>
            <div class="text-sm text-gray-600">Daily Time Saved</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-500">98%</div>
            <div class="text-sm text-gray-600">Guest Satisfaction</div>
          </div>
        </div>
      </div>
      
      <!-- Testimonials Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div 
          v-for="testimonial in testimonials" 
          :key="testimonial.id" 
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex justify-between items-center mb-4">
            <div class="flex gap-1">
              <span v-for="star in 5" :key="star" class="text-yellow-400">⭐</span>
            </div>
            <div class="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              {{ testimonial.badge }}
            </div>
          </div>
          
          <p class="text-gray-700 italic leading-relaxed mb-6">
            {{ testimonial.text }}
          </p>
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {{ testimonial.author.initials }}
            </div>
            <div>
              <div class="font-semibold text-gray-900 text-sm">{{ testimonial.author.name }}</div>
              <div class="text-gray-600 text-xs">{{ testimonial.author.role }}</div>
              <div class="text-yellow-600 text-xs font-medium">{{ testimonial.author.hotel }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Trust Indicators -->
      <div class="grid lg:grid-cols-3 gap-8 items-start">
        <!-- Trust Stats -->
        <div class="lg:col-span-2">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white text-center p-6 rounded-2xl shadow-sm border border-gray-200">
              <div class="text-3xl font-bold text-yellow-500 mb-2">500+</div>
              <div class="text-sm text-gray-600">Hotels Using Roomio</div>
            </div>
            <div class="bg-white text-center p-6 rounded-2xl shadow-sm border border-gray-200">
              <div class="text-3xl font-bold text-yellow-500 mb-2">4.9/5</div>
              <div class="text-sm text-gray-600">Average Rating</div>
            </div>
            <div class="bg-white text-center p-6 rounded-2xl shadow-sm border border-gray-200">
              <div class="text-3xl font-bold text-yellow-500 mb-2">99.9%</div>
              <div class="text-sm text-gray-600">Uptime Guarantee</div>
            </div>
            <div class="bg-white text-center p-6 rounded-2xl shadow-sm border border-gray-200">
              <div class="text-3xl font-bold text-yellow-500 mb-2">24/7</div>
              <div class="text-sm text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
        
        <!-- Certifications -->
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-6 text-center">
            Trusted & Certified
          </h4>
          <div class="space-y-4">
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-xl">🔒</span>
              <span class="text-sm font-medium text-gray-700">SOC 2 Certified</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-xl">🛡️</span>
              <span class="text-sm font-medium text-gray-700">PCI Compliant</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-xl">🌐</span>
              <span class="text-sm font-medium text-gray-700">GDPR Ready</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-xl">☁️</span>
              <span class="text-sm font-medium text-gray-700">AWS Hosted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const testimonials = [
  {
    id: 1,
    text: "The housekeeping automation alone has saved us countless hours. Room status updates are instant, and our cleaning staff is more efficient than ever.",
    author: {
      name: "Maria Rodriguez",
      role: "Operations Manager",
      hotel: "Seaside Resort",
      initials: "MR"
    },
    badge: "Housekeeping Pro"
  },
  {
    id: 2,
    text: "Revenue increased by 30% in our first year with Roomio. The dynamic pricing and booking management features are incredible.",
    author: {
      name: "James Wilson",
      role: "Hotel Owner",
      hotel: "Mountain View Lodge",
      initials: "JW"
    },
    badge: "Revenue Boost"
  },
  {
    id: 3,
    text: "Guest check-ins are now seamless. What used to take 10 minutes now takes 2. Our guests love the efficiency and we love the time savings.",
    author: {
      name: "Sarah Chen",
      role: "Front Desk Manager",
      hotel: "City Center Hotel",
      initials: "SC"
    },
    badge: "Guest Experience"
  },
  {
    id: 4,
    text: "The financial reporting gives us insights we never had before. We can make data-driven decisions that directly impact our bottom line.",
    author: {
      name: "Michael Brown",
      role: "General Manager",
      hotel: "Business Plaza Hotel",
      initials: "MB"
    },
    badge: "Financial Insights"
  },
  {
    id: 5,
    text: "Implementation was smooth and the support team is outstanding. They were with us every step of the way during the transition.",
    author: {
      name: "Lisa Johnson",
      role: "Hotel Manager",
      hotel: "Garden Inn & Suites",
      initials: "LJ"
    },
    badge: "Great Support"
  },
  {
    id: 6,
    text: "The mobile app lets me manage the hotel from anywhere. I can check room status, approve bookings, and monitor operations on the go.",
    author: {
      name: "Robert Davis",
      role: "Owner/Operator",
      hotel: "Riverside Boutique Hotel",
      initials: "RD"
    },
    badge: "Mobile Freedom"
  }
]
</script>

<style scoped>
/* No custom styles needed - using Tailwind classes */
</style>
