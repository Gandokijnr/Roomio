import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseKey = config.public.supabaseKey as string

  // Validate Supabase configuration
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'undefined' || supabaseKey === 'undefined') {
    throw new Error(
      'Supabase configuration is missing. Please create a .env file with SUPABASE_URL and SUPABASE_ANON_KEY. ' +
      'See .env.example for reference.'
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  return {
    provide: {
      supabase
    }
  }
})
