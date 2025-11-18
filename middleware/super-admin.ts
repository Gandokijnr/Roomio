export default defineNuxtRouteMiddleware(async () => {
  const { profile, loadUser } = useAuth()

  if (!profile.value) {
    await loadUser()
  }

  if (!profile.value || !profile.value.is_super_admin) {
    return navigateTo('/')
  }
})
