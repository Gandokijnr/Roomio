const { sendEmail } = require('./utils/email')

exports.handler = async (event) => {
  try {
    const { to, guestData, pointsData, hotelInfo } = JSON.parse(event.body)

    // Generate loyalty points update email content
    const subject = `Your ${hotelInfo.name} Loyalty Points Update`
    const html = `
      <h2>Loyalty Points ${pointsData.type === 'earned' ? 'Earned' : 'Redeemed'}!</h2>
      <p>Dear ${guestData.first_name},</p>

      ${getPointsMessage(pointsData)}
      
      <div style="
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      ">
        <h3>Your Current Status:</h3>
        <ul>
          <li>Tier: ${guestData.loyalty_tier.toUpperCase()}</li>
          <li>Available Points: ${guestData.loyalty_points}</li>
          <li>Points Until Next Tier: ${getPointsUntilNextTier(guestData)}</li>
        </ul>
      </div>

      ${getPointsUsageGuide(guestData.loyalty_points)}

      <p>Best regards,<br>The ${hotelInfo.name} Team</p>

      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
      </p>
    `

    // Send the email
    const result = await sendEmail(to, subject, html)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: result.messageId,
        message: 'Loyalty points update email sent successfully'
      })
    }
  } catch (error) {
    console.error('Failed to send loyalty points update email:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send loyalty points update email',
        details: error.message
      })
    }
  }
}

function getPointsMessage(pointsData) {
  if (pointsData.type === 'earned') {
    return `
      <p>Great news! You've earned ${pointsData.points} loyalty points from your recent activity:</p>
      <p style="background-color: #e8f5e9; padding: 10px; border-radius: 4px;">
        <strong>+${pointsData.points} points</strong> - ${pointsData.description}
      </p>
    `
  } else {
    return `
      <p>We've processed your points redemption:</p>
      <p style="background-color: #fdf0ed; padding: 10px; border-radius: 4px;">
        <strong>-${pointsData.points} points</strong> - ${pointsData.description}
      </p>
    `
  }
}

function getPointsUntilNextTier(guestData) {
  const tierThresholds = {
    bronze: 200000, // ₦200,000 for Silver
    silver: 500000, // ₦500,000 for Gold
    gold: 1000000   // ₦1,000,000 for Platinum
  }

  const currentTier = guestData.loyalty_tier.toLowerCase()
  if (currentTier === 'platinum') {
    return 'You\'ve reached our highest tier!'
  }

  const nextTierSpending = tierThresholds[currentTier]
  const remainingSpending = nextTierSpending - guestData.total_spending
  const remainingPoints = Math.ceil(remainingSpending / 1000) // 1 point per ₦1,000

  return `${remainingPoints} points (₦${remainingSpending.toLocaleString()} spending)`
}

function getPointsUsageGuide(availablePoints) {
  if (availablePoints < 1000) {
    return `
      <p>Keep earning points with every stay! Here's what you can get with more points:</p>
      <ul>
        <li>1,000 points = ₦1,000 off your next stay</li>
        <li>5,000 points = Free room upgrade</li>
        <li>10,000 points = One free night stay</li>
      </ul>
    `
  } else {
    return `
      <p>You have enough points for rewards! Here's what you can get:</p>
      <ul>
        ${availablePoints >= 1000 ? '<li>Use 1,000 points for ₦1,000 off your next stay</li>' : ''}
        ${availablePoints >= 5000 ? '<li>Use 5,000 points for a free room upgrade</li>' : ''}
        ${availablePoints >= 10000 ? '<li>Use 10,000 points for a free night stay</li>' : ''}
      </ul>
      <p>Visit our website or contact our front desk to redeem your points!</p>
    `
  }
}