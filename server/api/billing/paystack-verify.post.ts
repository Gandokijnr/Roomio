import { verifyTenantUser } from '../../utils/verifyTenantUser'

export default defineEventHandler(async (event) => {
  const { profile } = await verifyTenantUser(event)

  const body = await readBody(event)
  const { reference } = body || {}

  if (!reference) {
    throw createError({
      statusCode: 400,
      statusMessage: 'reference is required'
    })
  }

  const config = useRuntimeConfig()

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.paystackSecretKey}`,
    'Content-Type': 'application/json'
  }

  try {
    const response: any = await $fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers
      }
    )

    // We rely on the Paystack webhook as the source of truth to update tenant status.
    // This endpoint is primarily for the client to confirm payment status.

    return {
      success: true,
      data: {
        paystack: response?.data || null,
        tenant_id: (profile as any).tenant_id || null
      }
    }
  } catch (error: any) {
    console.error('Paystack verify error:', error)

    if (error?.statusCode && error?.statusMessage) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify payment status'
    })
  }
})
