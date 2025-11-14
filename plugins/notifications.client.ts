export default defineNuxtPlugin(() => {
  const notifications = useNotifications()

  return {
    provide: {
      toast: {
        success: notifications.success,
        error: notifications.error,
        warning: notifications.warning,
        info: notifications.info
      },
      notifications
    }
  }
})
