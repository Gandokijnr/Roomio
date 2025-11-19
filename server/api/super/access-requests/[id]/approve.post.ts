import { createClient } from '@supabase/supabase-js'
import { verifySuperAdmin } from '../../../../utils/verifySuperAdmin'
import { createEmailService } from '../../../../utils/emailService'
import { createInvitationEmail } from '../../../../utils/emailTemplates'

export default defineEventHandler(async (event) => {
  const superAdmin = await verifySuperAdmin(event)

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  const params = getRouterParams(event)
  const id = params.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request ID is required'
    })
  }

  const { data: request, error: fetchError } = await supabase
    .from('demo_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !request) {
    throw createError({
      statusCode: 404,
      statusMessage: fetchError?.message || 'Request not found'
    })
  }

  if (request.status === 'rejected') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot approve a rejected request'
    })
  }

  // Create or update tenant for this request
  const { data: existingTenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('demo_request_id', request.id)
    .maybeSingle()

  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 14)

  const tenantPayload = {
    name: request.hotel_name,
    primary_contact_name: request.name,
    primary_contact_email: request.email,
    status: 'trial',
    subscription_plan: 'trial',
    demo_request_id: request.id,
    date_joined: new Date().toISOString(),
    trial_end_date: trialEndDate.toISOString()
  }

  if (existingTenant) {
    await supabase
      .from('tenants')
      .update(tenantPayload)
      .eq('id', existingTenant.id)
  } else {
    await supabase
      .from('tenants')
      .insert(tenantPayload)
  }

  // Update demo request status and invitation timestamps
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 7)

  const { error: updateError } = await supabase
    .from('demo_requests')
    .update({
      status: 'approved',
      invitation_sent_at: new Date().toISOString(),
      invitation_expires_at: expiryDate.toISOString(),
      updated_at: new Date().toISOString(),
      notes: request.notes
    })
    .eq('id', request.id)

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message
    })
  }

  // Generate invitation link
  const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const invitationLink = `${baseUrl}/signup?token=${request.invitation_token}`

  // Send invitation email
  try {
    const emailService = createEmailService()

    const invitationTemplate = createInvitationEmail({
      name: request.name,
      email: request.email,
      hotelName: request.hotel_name,
      invitationLink,
      expiryDate: expiryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    await emailService.sendEmail({
      to: request.email,
      toName: request.name,
      template: invitationTemplate
    })
  } catch (emailError) {
    console.error('Failed to send invitation email (super admin approve):', emailError)
  }

  await supabase
    .from('activity_logs')
    .insert({
      user_id: superAdmin.id,
      action: 'access_request_approved',
      entity_type: 'tenant',
      entity_id: request.id,
      metadata: {
        hotel_name: request.hotel_name,
        email: request.email
      }
    })

  return {
    success: true,
    message: 'Request approved and invitation sent',
    invitationLink,
    expiresAt: expiryDate.toISOString()
  }
})
