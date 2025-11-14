<template>
  <div class="landing-page">
    <!-- Navigation -->
    <LandingNavigation />
    
    <!-- Hero Section -->
    <LandingHero />
    
    <!-- Features Section -->
    <LandingFeatures />
    
    <!-- Benefits Section -->
    <LandingBenefits />
    
    <!-- Testimonials Section -->
    <LandingTestimonials />
    
    <!-- Pricing/CTA Section -->
    <LandingPricing />
    
    <!-- Footer -->
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
// No authentication required for landing page
definePageMeta({
  layout: false
})

// SEO meta tags
useHead({
  title: 'Roomio - Complete Hotel Management Software',
  meta: [
    {
      name: 'description',
      content: 'Transform your hotel operations with Roomio. Streamline bookings, automate housekeeping, track room status, and boost revenue with our all-in-one hotel management solution.'
    },
    {
      name: 'keywords',
      content: 'hotel management software, booking system, housekeeping automation, hotel PMS, property management, hotel operations'
    },
    {
      property: 'og:title',
      content: 'Roomio - Complete Hotel Management Software'
    },
    {
      property: 'og:description',
      content: 'Transform your hotel operations with our comprehensive management solution. Increase efficiency, reduce costs, and enhance guest experience.'
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: white;
}
</style>
