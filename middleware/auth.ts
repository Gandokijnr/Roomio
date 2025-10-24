export default defineNuxtRouteMiddleware(async (to) => {
  const { user, profile, loadUser } = useAuth()

  if (!user.value || !profile.value) {
    await loadUser()
  }

  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (user.value && to.path === '/login') {
    return navigateTo('/')
  }
})
