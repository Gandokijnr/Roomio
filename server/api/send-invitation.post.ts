import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { requestId } = body

    if (!requestId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request ID is required'
      })
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the demo request
    const { data: request, error: fetchError } = await supabase
      .from('demo_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'approved')
      .single()

    if (fetchError || !request) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Request not found or not approved'
      })
    }

    // Set invitation expiry to 7 days from now
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)

    // Update the request with invitation details
    const { error: updateError } = await supabase
      .from('demo_requests')
      .update({
        invitation_sent_at: new Date().toISOString(),
        invitation_expires_at: expiryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update invitation status'
      })
    }

    // Generate invitation link
    const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const invitationLink = `${baseUrl}/signup?token=${request.invitation_token}`

    // Send invitation email
    try {
      const { createEmailService } = await import('../utils/emailService')
      const { createInvitationEmail } = await import('../utils/emailTemplates')
      
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
      
      const emailResult = await emailService.sendEmail({
        to: request.email,
        toName: request.name,
        template: invitationTemplate
      })
      
      if (!emailResult.success) {
        console.error('Failed to send invitation email:', emailResult.error)
        // Continue anyway - admin can manually send the link
      } else {
        console.log('Invitation email sent successfully:', emailResult.messageId)
      }
    } catch (emailError) {
      console.error('Email service error:', emailError)
      // Continue anyway - admin can manually send the link
    }

    return {
      success: true,
      message: 'Invitation sent successfully',
      invitationLink,
      expiresAt: expiryDate.toISOString()
    }

  } catch (error: any) {
    console.error('Send invitation error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
