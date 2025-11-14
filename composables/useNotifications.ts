interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface NotificationState {
  toasts: Toast[]
  emailVerificationModal: {
    show: boolean
    email: string
  }
}

export const useNotifications = () => {
  const state = useState<NotificationState>('notifications', () => ({
    toasts: [],
    emailVerificationModal: {
      show: false,
      email: ''
    }
  }))

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id }
    
    state.value.toasts.push(newToast)
    
    // Auto remove after duration (default 5 seconds)
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }

  const removeToast = (id: string) => {
    const index = state.value.toasts.findIndex(toast => toast.id === id)
    if (index > -1) {
      state.value.toasts.splice(index, 1)
    }
  }

  const showEmailVerificationModal = (email: string) => {
    state.value.emailVerificationModal = {
      show: true,
      email
    }
  }

  const hideEmailVerificationModal = () => {
    state.value.emailVerificationModal.show = false
  }

  // Convenience methods
  const success = (title: string, message?: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration })
  }

  const error = (title: string, message?: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration })
  }

  const warning = (title: string, message?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration })
  }

  const info = (title: string, message?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration })
  }

  const emailVerificationSuccess = (email: string) => {
    showEmailVerificationModal(email)
    
    // Also show a toast for immediate feedback
    success(
      'Registration Successful!',
      'Please check your email to verify your account.',
      8000
    )
  }

  const emailVerificationResent = () => {
    success(
      'Verification Email Sent',
      'Please check your inbox and spam folder.',
      6000
    )
  }

  return {
    // State
    toasts: readonly(state.value.toasts),
    emailVerificationModal: readonly(state.value.emailVerificationModal),
    
    // Toast methods
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    
    // Email verification methods
    showEmailVerificationModal,
    hideEmailVerificationModal,
    emailVerificationSuccess,
    emailVerificationResent
  }
}
