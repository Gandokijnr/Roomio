import { createClient } from '@supabase/supabase-js'
import { verifyTenantUser } from '../../utils/verifyTenantUser'

export default defineEventHandler(async (event) => {
  const { profile } = await verifyTenantUser(event)

  const body = await readBody(event)
  const { plan_id } = body || {}

  if (!plan_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'plan_id is required'
    })
  }

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const tenantId = (profile as any).tenant_id

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No tenant associated with this user'
    })
  }

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .maybeSingle()

  if (tenantError || !tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: tenantError?.message || 'Tenant not found'
    })
  }

  if (!tenant.primary_contact_email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tenant is missing primary contact email'
    })
  }

  if (!['trial', 'billing_hold', 'active'].includes(tenant.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tenant is not eligible for card setup'
    })
  }

  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('*')
    .eq('id', plan_id)
    .eq('is_active', true)
    .maybeSingle()

  if (planError || !plan) {
    throw createError({
      statusCode: 404,
      statusMessage: planError?.message || 'Plan not found or inactive'
    })
  }

  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.paystackSecretKey}`,
    'Content-Type': 'application/json'
  }

  const defaultAmountKobo = 100
  const amountKobo = Number(config.paystackCardSetupAmountKobo || defaultAmountKobo)

  try {
    const response: any = await $fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers,
      body: {
        email: tenant.primary_contact_email,
        amount: amountKobo,
        currency: plan.currency || 'NGN',
        metadata: {
          tenant_id: tenant.id,
          plan_id: plan.id,
          purpose: 'card_setup'
        },
        callback_url: `${baseUrl}/billing/verify`
      }
    })

    if (!response?.status) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Failed to initialize Paystack card setup transaction'
      })
    }

    return {
      success: true,
      data: {
        authorization_url: response.data?.authorization_url,
        access_code: response.data?.access_code,
        reference: response.data?.reference
      }
    }
  } catch (error: any) {
    console.error('Paystack card-setup initialize error:', error)

    if (error?.statusCode && error?.statusMessage) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to initialize card setup'
    })
  }
})
