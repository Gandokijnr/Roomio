// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  modules: ["@nuxtjs/tailwindcss"],

  tailwindcss: {
    cssPath: "~/assets/css/main.css",
    configPath: "tailwind.config.js",
    exposeConfig: false,
    viewer: true,
  },
  devServer: {
    host: "0.0.0.0",
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
      authBackgroundUrl: process.env.NUXT_PUBLIC_AUTH_BACKGROUND_URL || 'https://www.freepik.com/free-photo/sunset-pool_1035192.htm#fromView=search&page=1&position=1&uuid=1ec59f22-b43d-4db9-97cb-7a6b457d1195&query=hotel+view',
    },
  },

  css: ["~/assets/css/main.css"],

  app: {
    head: {
      title: "Hotel Management Software",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Complete hotel management solution for managing rooms, reservations, guests, and payments",
        },
      ],
    },
  },
});
