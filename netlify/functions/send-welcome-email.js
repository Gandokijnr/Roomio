const { sendEmail } = require('./utils/email')

exports.handler = async (event) => {
  try {
    const { to, guestData, hotelInfo } = JSON.parse(event.body)

    // Generate welcome email content
    const subject = `Welcome to ${hotelInfo.name}!`
    const html = `
      <h2>Welcome to ${hotelInfo.name}!</h2>
      <p>Dear ${guestData.first_name},</p>
      <p>Thank you for registering as our valued guest. We're delighted to have you join our family!</p>
      
      <h3>Your Guest Profile:</h3>
      <ul>
        <li>Guest ID: ${guestData.guest_id}</li>
        <li>Loyalty Tier: ${guestData.loyalty_tier.toUpperCase()}</li>
        <li>Current Points: ${guestData.loyalty_points}</li>
      </ul>

      <h3>Hotel Information:</h3>
      <p>
        ${hotelInfo.name}<br>
        ${hotelInfo.address}<br>
        Phone: ${hotelInfo.phone}<br>
        Email: ${hotelInfo.email}
      </p>

      <h3>Loyalty Program Benefits:</h3>
      <ul>
        <li>Earn 1 point for every ₦1,000 spent</li>
        <li>Silver tier at ₦200,000 total spending</li>
        <li>Gold tier at ₦500,000 total spending</li>
        <li>Platinum tier at ₦1,000,000 total spending</li>
      </ul>

      <p>We're looking forward to providing you with exceptional service and making your stays memorable.</p>

      <p>Best regards,<br>The ${hotelInfo.name} Team</p>
    `

    // Send the email
    const result = await sendEmail(to, subject, html)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: result.messageId,
        message: 'Welcome email sent successfully'
      })
    }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send welcome email',
        details: error.message
      })
    }
  }
}