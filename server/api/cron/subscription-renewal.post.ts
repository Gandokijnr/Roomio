import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const now = new Date()
  const cutoffIso = now.toISOString()

  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('id, status, subscription_end_date, paystack_authorization_code, paystack_customer_code, current_plan_id, primary_contact_email, billing_retry_attempts, billing_retry_last_attempt')
    .not('paystack_authorization_code', 'is', null)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.paystackSecretKey}`,
    'Content-Type': 'application/json'
  }

  const processed: string[] = []
  const failed: string[] = []

  if (!tenants || tenants.length === 0) {
    return {
      success: true,
      data: {
        processed: 0,
        failed: 0
      }
    }
  }

  for (const tenant of tenants) {
    const subscriptionEnd = tenant.subscription_end_date ? new Date(tenant.subscription_end_date as any) : null
    const attempts = tenant.billing_retry_attempts || 0
    const lastAttempt = tenant.billing_retry_last_attempt ? new Date(tenant.billing_retry_last_attempt as any) : null

    let shouldCharge = false

    if (tenant.status === 'active' && subscriptionEnd && subscriptionEnd <= now) {
      shouldCharge = true
    }

    const retryWindowMs = 24 * 60 * 60 * 1000

    if (tenant.status === 'billing_hold' && attempts < 3) {
      if (!lastAttempt || now.getTime() - lastAttempt.getTime() >= retryWindowMs) {
        shouldCharge = true
      }
    }

    if (!shouldCharge) {
      continue
    }

    if (!tenant.current_plan_id || !tenant.primary_contact_email) {
      continue
    }

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', tenant.current_plan_id)
      .maybeSingle()

    if (planError || !plan) {
      continue
    }

    const amountKobo = Math.round(Number(plan.price_monthly) * 100)

    try {
      await $fetch('https://api.paystack.co/transaction/charge_authorization', {
        method: 'POST',
        headers,
        body: {
          authorization_code: tenant.paystack_authorization_code,
          email: tenant.primary_contact_email,
          amount: amountKobo,
          currency: plan.currency || 'NGN',
          metadata: {
            tenant_id: tenant.id,
            plan_id: plan.id,
            purpose: 'subscription_charge'
          }
        }
      })

      processed.push(tenant.id)
    } catch (e) {
      console.error('Failed to trigger subscription renewal charge', {
        tenantId: tenant.id,
        error: e
      })
      failed.push(tenant.id)
    }
  }

  return {
    success: true,
    data: {
      processed: processed.length,
      failed: failed.length
    }
  }
})
