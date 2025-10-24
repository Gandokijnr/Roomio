// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  devServer: {
    host: '0.0.0.0'
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
    }
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Hotel Management Software',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Complete hotel management solution for managing rooms, reservations, guests, and payments' }
      ]
    }
  }
})
