import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, email, hotel, rooms } = body

    // Validate required fields
    if (!name || !email || !hotel || !rooms) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if email already exists
    const { data: existingRequest } = await supabase
      .from('demo_requests')
      .select('id, status')
      .eq('email', email)
      .single()

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return {
          success: true,
          message: 'Your request is already being reviewed. We\'ll contact you soon!'
        }
      } else if (existingRequest.status === 'approved') {
        return {
          success: true,
          message: 'You already have access! Check your email for your invitation link.'
        }
      }
    }

    // Insert new demo request
    const { data, error } = await supabase
      .from('demo_requests')
      .insert({
        name,
        email,
        hotel_name: hotel,
        room_count: rooms,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to submit request'
      })
    }

    // Send notification email to admin
    try {
      const { createEmailService } = await import('../utils/emailService')
      const { createAdminNotificationEmail } = await import('../utils/emailTemplates')
      
      const emailService = createEmailService()
      const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      
      const adminNotificationTemplate = createAdminNotificationEmail({
        name,
        email,
        hotelName: hotel,
        roomCount: rooms,
        requestId: data.id,
        adminPanelLink: `${baseUrl}/admin/demo-requests`
      })
      
      // Send to admin email (configure in environment)
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@roomio.com'
      await emailService.sendEmail({
        to: adminEmail,
        toName: 'Roomio Admin',
        template: adminNotificationTemplate
      })
      
      console.log('Admin notification sent for request:', data.id)
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the request if email fails
    }

    return {
      success: true,
      message: 'Thank you! Your request has been submitted. We\'ll review your application and send you an invitation within 24 hours.',
      requestId: data.id
    }

  } catch (error: any) {
    console.error('Demo request error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
