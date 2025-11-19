export const useBillingPayment = () => {
  const { $supabase } = useNuxtApp() as any

  const verifyPaystackPayment = async (reference: string) => {
    if (!reference) {
      return { data: null, error: 'Missing payment reference' }
    }

    const { data: sessionData } = await $supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
      return { data: null, error: 'Not authenticated' }
    }

    try {
      const res: any = await $fetch('/api/billing/paystack-verify', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          reference
        }
      })

      if (!res?.success) {
        return { data: null, error: 'Verification failed' }
      }

      return { data: res.data, error: null }
    } catch (error: any) {
      console.error('Failed to verify Paystack payment:', error)
      return {
        data: null,
        error: error?.message || 'Failed to verify payment'
      }
    }
  }

  const refreshBillingStatus = async () => {
    const { data: sessionData } = await $supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
      return { data: null, error: 'Not authenticated' }
    }

    try {
      const res: any = await $fetch('/api/billing/status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res?.success) {
        return { data: null, error: 'Failed to load billing status' }
      }

      return { data: res.data, error: null }
    } catch (error: any) {
      console.error('Failed to refresh billing status:', error)
      return {
        data: null,
        error: error?.message || 'Failed to refresh billing status'
      }
    }
  }

  return {
    verifyPaystackPayment,
    refreshBillingStatus
  }
}
