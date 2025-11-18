import axios from 'axios'
import type { NuxtApp, NuxtPlugin } from 'nuxt/app'

const axiosPlugin: NuxtPlugin = (nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.apiBase || '',
    withCredentials: false
  })

  nuxtApp.provide('axios', api)
}

export default defineNuxtPlugin(axiosPlugin)
