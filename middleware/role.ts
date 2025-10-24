export default defineNuxtRouteMiddleware((to) => {
  const { profile, hasRole } = useAuth()

  const roleRoutes: Record<string, string[]> = {
    '/rooms': ['admin', 'manager', 'receptionist', 'housekeeping'],
    '/reservations': ['admin', 'manager', 'receptionist'],
    '/guests': ['admin', 'manager', 'receptionist'],
    '/payments': ['admin', 'manager', 'receptionist', 'accountant'],
    '/invoices': ['admin', 'manager', 'accountant'],
    '/housekeeping': ['admin', 'manager', 'housekeeping'],
    '/reports': ['admin', 'manager', 'accountant'],
    '/staff': ['admin', 'manager'],
  }

  for (const [path, roles] of Object.entries(roleRoutes)) {
    if (to.path.startsWith(path) && !hasRole(roles)) {
      return navigateTo('/')
    }
  }
})
