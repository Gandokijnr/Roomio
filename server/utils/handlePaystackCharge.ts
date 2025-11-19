import { createClient } from '@supabase/supabase-js'
import { logPlatformAuditEvent } from './logPlatformAuditEvent'

export const handlePaystackChargeSuccess = async (data: any) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const metadata = data.metadata || {}
  const tenantId = metadata.tenant_id as string | undefined
  const planId = metadata.plan_id as string | undefined
  const purpose = metadata.purpose as string | undefined

  if (!tenantId || !planId) {
    console.error('Paystack success missing tenant_id or plan_id in metadata')
    return
  }
  const now = new Date()
  const nowIso = now.toISOString()

  if (purpose === 'card_setup') {
    const updates: Record<string, any> = {
      current_plan_id: planId,
      updated_at: nowIso,
      billing_retry_attempts: 0,
      billing_retry_last_attempt: null
    }

    if (data.authorization?.authorization_code) {
      updates.paystack_authorization_code = data.authorization.authorization_code
    }

    if (data.customer?.customer_code) {
      updates.paystack_customer_code = data.customer.customer_code
    }

    const { error: updateError } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantId)

    if (updateError) {
      console.error('Failed to update tenant on Paystack card setup success:', updateError)
    }

    await logPlatformAuditEvent({
      eventType: 'CARD_SETUP_SUCCESS',
      tenantId,
      details: {
        gateway: 'paystack',
        plan_id: planId,
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        status: data.status
      }
    })

    return
  }

  const updates: Record<string, any> = {
    status: 'active',
    current_plan_id: planId,
    subscription_end_date: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    updated_at: nowIso,
    billing_retry_attempts: 0,
    billing_retry_last_attempt: nowIso
  }

  if (data.customer?.customer_code) {
    updates.paystack_customer_code = data.customer.customer_code
  }

  const { error: updateError } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', tenantId)

  if (updateError) {
    console.error('Failed to update tenant on Paystack success:', updateError)
  }

  await logPlatformAuditEvent({
    eventType: 'PAYMENT_SUCCESS',
    tenantId,
    details: {
      gateway: 'paystack',
      plan_id: planId,
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
      status: data.status
    }
  })
}

export const handlePaystackChargeFailure = async (data: any) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const metadata = data.metadata || {}
  const tenantId = metadata.tenant_id as string | undefined
  const purpose = metadata.purpose as string | undefined

  if (!tenantId) {
    console.error('Paystack failure missing tenant_id in metadata')
    return
  }

  if (purpose === 'card_setup') {
    await logPlatformAuditEvent({
      eventType: 'CARD_SETUP_FAILURE',
      tenantId,
      details: {
        gateway: 'paystack',
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        reason: data.gateway_response
      }
    })

    return
  }

  const now = new Date()
  const nowIso = now.toISOString()
  const windowMs = 72 * 60 * 60 * 1000

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, status, billing_retry_attempts, billing_retry_last_attempt')
    .eq('id', tenantId)
    .maybeSingle()

  if (tenantError || !tenant) {
    console.error('Failed to load tenant for Paystack failure handling', {
      tenantId,
      error: tenantError
    })
  }

  let attempts = tenant?.billing_retry_attempts || 0
  const lastAttempt = tenant?.billing_retry_last_attempt
    ? new Date(tenant.billing_retry_last_attempt as any)
    : null

  if (lastAttempt && now.getTime() - lastAttempt.getTime() > windowMs) {
    attempts = 0
  }

  attempts += 1

  let newStatus = 'billing_hold'

  if (attempts >= 3) {
    newStatus = 'suspended'
  }

  const { error: updateError } = await supabase
    .from('tenants')
    .update({
      status: newStatus,
      billing_retry_attempts: attempts,
      billing_retry_last_attempt: nowIso,
      updated_at: nowIso
    })
    .eq('id', tenantId)

  if (updateError) {
    console.error('Failed to update tenant on Paystack failure:', updateError)
  }

  await logPlatformAuditEvent({
    eventType: 'PAYMENT_FAILURE',
    tenantId,
    details: {
      gateway: 'paystack',
      reference: data.reference,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      reason: data.gateway_response,
      billing_status: newStatus,
      retry_attempts: attempts
    }
  })
}
