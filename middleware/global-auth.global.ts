export default defineNuxtRouteMiddleware(async (to) => {
  const { user, profile, loadUser } = useAuth()

  // Public routes that do NOT require authentication
  const publicPaths = new Set([
    '/',
    '/landing',
    '/login',
    '/signup',
  ])

  const isPublicRoute = publicPaths.has(to.path)

  // Ensure we have the latest auth state
  if (!user.value || !profile.value) {
    await loadUser()
  }

  // If not authenticated and trying to access a protected route, redirect
  if (!user.value && !isPublicRoute) {
    return navigateTo('/landing')
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (user.value && (to.path === '/login' || to.path === '/signup' || to.path === '/')) {
    return navigateTo('/dashboard')
  }
})
