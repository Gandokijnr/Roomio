import type { Profile } from '~/types/database'

export const useAuth = () => {
  const { $supabase } = useNuxtApp()
  const user = useState<any>('user', () => null)
  const profile = useState<Profile | null>('profile', () => null)
  const loading = useState<boolean>('auth-loading', () => true)

  const loadUser = async () => {
    try {
      loading.value = true
      const { data: { user: authUser }, error } = await $supabase.auth.getUser()

      if (error || !authUser) {
        user.value = null
        profile.value = null
        return
      }

      user.value = authUser

      const { data: profileData, error: profileError } = await $supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (!profileError && profileData) {
        profile.value = profileData
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await $supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    await loadUser()
    return data
  }

  const signUp = async (email: string, password: string, fullName: string, role: string = 'receptionist') => {
    const { data, error } = await $supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      const { error: profileError } = await $supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role: role,
          is_active: true
        })

      if (profileError) throw profileError

      await loadUser()
    }

    return data
  }

  const signOut = async () => {
    const { error } = await $supabase.auth.signOut()
    if (error) throw error

    user.value = null
    profile.value = null
    navigateTo('/login')
  }

  const hasRole = (roles: string[]) => {
    if (!profile.value) return false
    return roles.includes(profile.value.role)
  }

  const canManageRooms = () => hasRole(['admin', 'manager'])
  const canManageReservations = () => hasRole(['admin', 'manager', 'receptionist'])
  const canManagePayments = () => hasRole(['admin', 'manager', 'receptionist', 'accountant'])
  const canManageInvoices = () => hasRole(['admin', 'manager', 'accountant'])
  const canManageHousekeeping = () => hasRole(['admin', 'manager'])
  const canViewReports = () => hasRole(['admin', 'manager', 'accountant'])

  return {
    user,
    profile,
    loading,
    loadUser,
    signIn,
    signUp,
    signOut,
    hasRole,
    canManageRooms,
    canManageReservations,
    canManagePayments,
    canManageInvoices,
    canManageHousekeeping,
    canViewReports,
  }
}
