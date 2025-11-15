<template>
  <section class="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-gray-50 text-gray-900">
    <div class="absolute top-0 right-0 -translate-x-1/4 translate-y-1/4" aria-hidden="true">
      <div
        class="w-[40rem] h-[40rem] bg-yellow-100 opacity-60 rounded-full blur-3xl filter"
      ></div>
    </div>
    
    <div class="container mx-auto px-6 relative z-10">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        
        <div class="text-center lg:text-left">
          <div class="mb-10">
            <h1 class="text-5xl lg:text-6xl font-bold tracking-tighter leading-tight mb-6">
              Transform Your Hotel Operations with 
              <span class="bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                Roomio
              </span>
            </h1>
            <p class="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Effortless bookings, automated housekeeping, profit-driven revenue tools, connected operations, and actionable analytics all in one platform trusted by hotels to cut operational costs by <strong>40&nbsp;%</strong>.
            </p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
            <button 
              @click="scrollToDemo" 
              class="group bg-yellow-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-2 shadow-yellow-200 shadow-lg"
            >
              Get Free Demo
              <span class="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
            <button 
              @click="scrollToFeatures" 
              class="bg-gray-100 text-gray-700 border border-gray-400 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-300"
            >
              See Features
            </button>
          </div>
          
          <div>
            <p class="text-gray-500 text-sm mb-4 text-center lg:text-left">Trusted by leading hotels worldwide</p>
            <div class="flex flex-wrap justify-center lg:justify-start items-center gap-8 text-gray-400">
              <span class="font-bold text-2xl">HOTEL.IO</span>
              <span class="font-semibold text-xl italic">StayWell</span>
              <span class="font-bold text-lg">LUXERESORTS</span>
              <span class="font-medium text-lg">Oasis</span>
            </div>
          </div>
        </div>
        
        <div class="relative flex justify-center items-center perspective-[1000px]">
          <div class="bg-white rounded-2xl shadow-2xl overflow-hidden w-full border border-gray-200 rotate-y-[-5deg] rotate-x-[5deg]">
            <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <div class="w-3 h-3 bg-red-400 rounded-full"></div>
              <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div class="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            
            <div class="flex h-96">
              <div class="w-1/4 bg-gray-50 p-4 border-r border-gray-200 space-y-2">
                <div class="text-xs text-gray-400 uppercase font-semibold">Menu</div>
                <div class="bg-yellow-100 text-yellow-700 p-2 rounded-lg font-medium text-sm">Dashboard</div>
                <div class="text-gray-600 p-2 rounded-lg font-medium text-sm hover:bg-gray-100">Bookings</div>
                <div class="text-gray-600 p-2 rounded-lg font-medium text-sm hover:bg-gray-100">Rooms</div>
                <div class="text-gray-600 p-2 rounded-lg font-medium text-sm hover:bg-gray-100">Guests</div>
              </div>

              <div class="w-3/4 p-6 space-y-6">
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div class="text-xs text-gray-500">Occupancy</div>
                    <div class="text-2xl font-bold text-gray-900">87%</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div class="text-xs text-gray-500">New Bookings</div>
                    <div class="text-2xl font-bold text-gray-900">12</div>
                  </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="text-sm font-medium text-gray-700 mb-3">Revenue Trend</div>
                  <div class="flex items-end gap-1.5 h-20">
                    <div class="bg-yellow-500 rounded-sm flex-1 h-10"></div>
                    <div class="bg-yellow-500 rounded-sm flex-1 h-12"></div>
                    <div class="bg-yellow-300 rounded-sm flex-1 h-8"></div>
                    <div class="bg-yellow-500 rounded-sm flex-1 h-14"></div>
                    <div class="bg-yellow-500 rounded-sm flex-1 h-16"></div>
                    <div class="bg-yellow-300 rounded-sm flex-1 h-12"></div>
                    <div class="bg-yellow-500 rounded-sm flex-1 h-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 items-center gap-3 animate-float hidden lg:flex border border-gray-100">
            <div>
              <div class="text-sm font-semibold text-gray-900">New Booking</div>
              <div class="text-xs text-gray-600">Room 204 - 3 nights</div>
            </div>
          </div>
          
          <div class="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 items-center gap-3 animate-float-delayed hidden lg:flex border border-gray-100">
            <div>
              <div class="text-sm font-semibold text-gray-900">Housekeeping</div>
              <div class="text-xs text-gray-600">Room 105 - Complete</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const scrollToDemo = () => {
  const element = document.getElementById('pricing')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToFeatures = () => {
  const element = document.getElementById('features')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>