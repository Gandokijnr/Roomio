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
      content: 'Effortless bookings, automated housekeeping, profit-driven revenue tools, connected operations, and actionable analytics—Roomio is the all-in-one hotel operating system that cuts operational costs by 40 %.'
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
      content: 'Effortless bookings, automated housekeeping, profit-driven revenue tools, connected operations, and actionable analytics—Roomio cuts operational costs by 40 % while elevating every guest stay.'
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
