<template>
  <nav class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50 transition-all duration-300">
    <div class="container mx-auto px-6 py-4 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center">
        <NuxtLink to="/" class="text-2xl font-bold text-yellow-600">Roomio</NuxtLink>
      </div>
      
      <!-- Desktop Navigation Links -->
      <div class="hidden md:flex items-center space-x-8">
        <a 
          href="#features" 
          @click="scrollTo('features')" 
          class="text-gray-600 hover:text-royal-gold-500 font-medium transition-colors duration-300 cursor-pointer"
        >
          Features
        </a>
        <a 
          href="#benefits" 
          @click="scrollTo('benefits')" 
          class="text-gray-600 hover:text-royal-gold-500 font-medium transition-colors duration-300 cursor-pointer"
        >
          Benefits
        </a>
        <a 
          href="#testimonials" 
          @click="scrollTo('testimonials')" 
          class="text-gray-600 hover:text-royal-gold-500 font-medium transition-colors duration-300 cursor-pointer"
        >
          Reviews
        </a>
        <a 
          href="#pricing" 
          @click="scrollTo('pricing')" 
          class="text-gray-600 hover:text-royal-gold-500 font-medium transition-colors duration-300 cursor-pointer"
        >
          Pricing
        </a>
      </div>
      
      <!-- Desktop CTA Button -->
      <div class="hidden md:flex">
        <button 
          @click="scrollTo('pricing')" 
          class="bg-royal-gold-500 hover:bg-royal-gold-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Request Access
        </button>
      </div>
      
      <!-- Mobile Menu Toggle -->
      <button 
        @click="toggleMobileMenu" 
        class="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
      >
        <div class="w-6 h-6 flex flex-col justify-center items-center">
          <span 
            class="block w-5 h-0.5 bg-current transition-all duration-300"
            :class="mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'"
          ></span>
          <span 
            class="block w-5 h-0.5 bg-current transition-all duration-300"
            :class="mobileMenuOpen ? 'opacity-0' : 'opacity-100'"
          ></span>
          <span 
            class="block w-5 h-0.5 bg-current transition-all duration-300"
            :class="mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'"
          ></span>
        </div>
      </button>
    </div>
    
    <!-- Mobile Menu -->
    <div 
      class="md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-200"
      :class="mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="px-6 py-4 space-y-4">
        <a 
          href="#features" 
          @click="scrollTo('features')" 
          class="block text-gray-600 hover:text-royal-gold-500 font-medium transition-colors duration-300 cursor-pointer py-2"
        >
          Features
        </a>
        <a 
          href="#benefits" 
          @click="scrollTo('benefits')" 
          class="block text-gray-600 hover:text-royal-gold-500 font-medium transition-colors duration-300 cursor-pointer py-2"
        >
          Benefits
        </a>
        <a 
          href="#testimonials" 
          @click="scrollTo('testimonials')" 
          class="block text-gray-600 hover:text-royal-gold-500 font-medium transition-colors duration-300 cursor-pointer py-2"
        >
          Reviews
        </a>
        <a 
          href="#pricing" 
          @click="scrollTo('pricing')" 
          class="block text-gray-600 hover:text-royal-gold-500 font-medium transition-colors duration-300 cursor-pointer py-2"
        >
          Pricing
        </a>
        <button 
          @click="scrollTo('pricing')" 
          class="w-full bg-royal-gold-500 hover:bg-royal-gold-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 mt-4"
        >
          Request Access
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const scrollTo = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  mobileMenuOpen.value = false
}

// Close mobile menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const nav = document.querySelector('.landing-nav')
    if (nav && !nav.contains(e.target as Node)) {
      mobileMenuOpen.value = false
    }
  })
})
</script>

<style scoped>
/* No custom styles needed - using Tailwind classes */
</style>
