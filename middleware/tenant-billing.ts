export default defineNuxtRouteMiddleware(async (to) => {
  const { profile, loadUser } = useAuth()

  if (!profile.value) {
    await loadUser()
  }

  // Allow unauthenticated or super admin flows to continue normally
  if (!profile.value || profile.value.is_super_admin) {
    return
  }

  // Allow access to auth, landing, and billing routes without gating
  const allowedPrefixes = ['/login', '/landing', '/signup', '/billing']
  if (allowedPrefixes.some(prefix => to.path.startsWith(prefix))) {
    return
  }

  // Fetch billing status for current tenant
  const { $supabase } = useNuxtApp() as any
  const { data } = await $supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    return navigateTo('/login')
  }

  try {
    const res: any = await $fetch('/api/billing/status', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res?.success) {
      return
    }

    const status = res.data.tenant.status as string

    if (status === 'billing_hold' || status === 'suspended') {
      if (!to.path.startsWith('/billing')) {
        return navigateTo('/billing')
      }
    }
  } catch (error) {
    console.error('Failed to check billing status:', error)
  }
})
