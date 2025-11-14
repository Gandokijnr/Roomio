import { sendEmail } from './utils/email.js'

export const handler = async (event) => {
  try {
    const { to, guestData, tierData, hotelInfo } = JSON.parse(event.body)

    // Generate tier upgrade email content
    const subject = `🎉 Congratulations on Your ${tierData.newTier.toUpperCase()} Tier Upgrade!`
    const html = `
      <h2>Congratulations on Your Achievement!</h2>
      <p>Dear ${guestData.first_name},</p>
      <p>We are delighted to inform you that you have been upgraded to our ${tierData.newTier.toUpperCase()} tier! This achievement reflects your valued relationship with ${hotelInfo.name}.</p>
      
      <div style="
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        text-align: center;
      ">
        <h3 style="color: #28a745; margin-bottom: 15px;">Your New Benefits Include:</h3>
        ${getTierBenefits(tierData.newTier)}
      </div>

      <h3>Your Current Status:</h3>
      <ul>
        <li>Tier: ${tierData.newTier.toUpperCase()}</li>
        <li>Total Stays: ${guestData.total_stays}</li>
        <li>Total Spending: ₦${guestData.total_spending.toLocaleString()}</li>
        <li>Loyalty Points: ${guestData.loyalty_points}</li>
      </ul>

      <p>Thank you for your continued loyalty. We look forward to providing you with even more exceptional experiences during your future stays.</p>

      <p>Best regards,<br>The ${hotelInfo.name} Team</p>
    `

    // Send the email
    const result = await sendEmail(to, subject, html)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: result.messageId,
        message: 'Tier upgrade email sent successfully'
      })
    }
  } catch (error) {
    console.error('Failed to send tier upgrade email:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send tier upgrade email',
        details: error.message
      })
    }
  }
}

function getTierBenefits(tier) {
  const benefits = {
    silver: `
      <ul style="list-style: none; padding: 0;">
        <li>✨ 5% discount on room rates</li>
        <li>✨ Early check-in (subject to availability)</li>
        <li>✨ Priority housekeeping service</li>
        <li>✨ 1.2x points multiplier on stays</li>
      </ul>
    `,
    gold: `
      <ul style="list-style: none; padding: 0;">
        <li>🌟 10% discount on room rates</li>
        <li>🌟 Early check-in and late check-out</li>
        <li>🌟 Welcome drink on arrival</li>
        <li>🌟 1.5x points multiplier on stays</li>
        <li>🌟 Free room upgrade (subject to availability)</li>
      </ul>
    `,
    platinum: `
      <ul style="list-style: none; padding: 0;">
        <li>👑 15% discount on room rates</li>
        <li>👑 Guaranteed early check-in and late check-out</li>
        <li>👑 Welcome drink and fruit basket</li>
        <li>👑 2x points multiplier on stays</li>
        <li>👑 Guaranteed room upgrade</li>
        <li>👑 Free airport transfer</li>
        <li>👑 Access to executive lounge</li>
      </ul>
    `
  }
  
  return benefits[tier.toLowerCase()] || ''
}