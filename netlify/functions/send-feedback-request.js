import { sendEmail } from './utils/email.js'

export const handler = async (event) => {
  try {
    const { to, feedbackData, guestData, hotelInfo } = JSON.parse(event.body)

    // Generate feedback request email content
    const subject = `Share Your Experience at ${hotelInfo.name}`
    const html = `
      <h2>How was your stay?</h2>
      <p>Dear ${guestData.first_name},</p>
      <p>Thank you for choosing ${hotelInfo.name}. We hope you enjoyed your recent stay with us from ${feedbackData.check_in} to ${feedbackData.check_out}.</p>
      
      <p>We value your feedback and would love to hear about your experience. Your insights help us improve our services for all guests.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${hotelInfo.feedbackUrl}/${feedbackData.reservationId}" style="
          background-color: #4CAF50;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        ">Share Your Feedback</a>
      </div>

      <p>This will only take a few minutes of your time and your feedback is invaluable to us.</p>

      <p>As a token of our appreciation, you'll receive 100 bonus loyalty points when you complete the survey!</p>

      <h3>Current Loyalty Status:</h3>
      <ul>
        <li>Tier: ${guestData.loyalty_tier.toUpperCase()}</li>
        <li>Points: ${guestData.loyalty_points}</li>
      </ul>

      <p>Best regards,<br>The ${hotelInfo.name} Team</p>

      <p style="font-size: 12px; color: #666;">
        If you're having trouble with the button above, copy and paste this URL into your browser:<br>
        ${hotelInfo.feedbackUrl}/${feedbackData.reservationId}
      </p>
    `

    // Send the email
    const result = await sendEmail(to, subject, html)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: result.messageId,
        message: 'Feedback request email sent successfully'
      })
    }
  } catch (error) {
    console.error('Failed to send feedback request email:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send feedback request email',
        details: error.message
      })
    }
  }
}