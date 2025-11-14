export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface InvitationEmailData {
  name: string
  email: string
  hotelName: string
  invitationLink: string
  expiryDate: string
}

export interface RequestNotificationData {
  name: string
  email: string
  hotelName: string
  roomCount: string
  requestId: string
  adminPanelLink: string
}

export function createInvitationEmail(data: InvitationEmailData): EmailTemplate {
  const subject = `Welcome to Roomio - Your Exclusive Invitation Awaits`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Roomio</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
        .logo { font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; }
        .tagline { opacity: 0.9; font-size: 1.1rem; }
        .content { padding: 2rem; }
        .welcome-text { font-size: 1.1rem; margin-bottom: 1.5rem; }
        .hotel-info { background: #f8fafc; padding: 1rem; border-radius: 8px; margin: 1.5rem 0; }
        .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 1.5rem 0; }
        .cta-button:hover { background: #2563eb; }
        .features { margin: 2rem 0; }
        .feature { display: flex; align-items: center; margin: 1rem 0; }
        .feature-icon { font-size: 1.5rem; margin-right: 1rem; }
        .expiry-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 8px; margin: 1.5rem 0; }
        .footer { background: #1f2937; color: white; padding: 2rem; text-align: center; }
        .footer-links { margin: 1rem 0; }
        .footer-links a { color: #60a5fa; text-decoration: none; margin: 0 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏨 Roomio</div>
          <div class="tagline">Premium Hotel Management Software</div>
        </div>
        
        <div class="content">
          <h1>Welcome to the Future of Hotel Management!</h1>
          
          <p class="welcome-text">
            Dear ${data.name},
          </p>
          
          <p>
            Congratulations! Your request for exclusive access to Roomio has been approved. 
            You're now part of an elite community of forward-thinking hotel owners who are 
            transforming their operations with our premium management platform.
          </p>
          
          <div class="hotel-info">
            <strong>Your Hotel:</strong> ${data.hotelName}<br>
            <strong>Invitation For:</strong> ${data.email}
          </div>
          
          <p>
            Roomio is trusted by hundreds of leading hotels worldwide to:
          </p>
          
          <div class="features">
            <div class="feature">
              <span class="feature-icon">⚡</span>
              <span>Reduce operational costs by up to 40%</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📈</span>
              <span>Increase revenue through dynamic pricing</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🎯</span>
              <span>Automate housekeeping and room management</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span>Get real-time analytics and insights</span>
            </div>
          </div>
          
          <p style="text-align: center;">
            <a href="${data.invitationLink}" class="cta-button">
              Create Your Account →
            </a>
          </p>
          
          <div class="expiry-notice">
            <strong>⏰ Important:</strong> This invitation expires on ${data.expiryDate}. 
            Please create your account soon to secure your access.
          </div>
          
          <p>
            Once you've created your account, you'll receive:
          </p>
          
          <ul>
            <li>Personalized onboarding session</li>
            <li>Dedicated success manager</li>
            <li>Priority customer support</li>
            <li>Access to exclusive features</li>
          </ul>
          
          <p>
            If you have any questions or need assistance, our team is here to help. 
            Simply reply to this email or contact our support team.
          </p>
          
          <p>
            Welcome to Roomio!<br>
            <strong>The Roomio Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2024 Roomio. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
          </div>
          <p style="font-size: 0.9rem; opacity: 0.8;">
            This invitation was sent to ${data.email}. If you didn't request access to Roomio, 
            please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
Welcome to Roomio - Your Exclusive Invitation

Dear ${data.name},

Congratulations! Your request for exclusive access to Roomio has been approved.

Hotel: ${data.hotelName}
Email: ${data.email}

Create your account: ${data.invitationLink}

This invitation expires on ${data.expiryDate}.

Roomio helps hotels:
- Reduce operational costs by up to 40%
- Increase revenue through dynamic pricing
- Automate housekeeping and room management
- Get real-time analytics and insights

Welcome to the future of hotel management!

The Roomio Team

---
© 2024 Roomio. All rights reserved.
If you didn't request access, please ignore this email.
  `
  
  return { subject, html, text }
}

export function createAdminNotificationEmail(data: RequestNotificationData): EmailTemplate {
  const subject = `New Access Request - ${data.hotelName}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Access Request</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #1f2937; color: white; padding: 1.5rem; text-align: center; }
        .content { padding: 2rem; }
        .request-details { background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: 600; color: #374151; }
        .detail-value { color: #6b7280; }
        .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 1rem 0; }
        .urgent { background: #fef2f2; border: 1px solid #fecaca; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏨 New Access Request</h1>
        </div>
        
        <div class="content">
          <p>A new hotel owner has requested access to Roomio:</p>
          
          <div class="request-details">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${data.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${data.email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Hotel:</span>
              <span class="detail-value">${data.hotelName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Room Count:</span>
              <span class="detail-value">${data.roomCount}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Request ID:</span>
              <span class="detail-value">${data.requestId}</span>
            </div>
          </div>
          
          <div class="urgent">
            <strong>⏰ Action Required:</strong> Please review this request and approve or reject it 
            within 24 hours to maintain our premium service standards.
          </div>
          
          <p style="text-align: center;">
            <a href="${data.adminPanelLink}" class="cta-button">
              Review Request →
            </a>
          </p>
          
          <p>
            You can approve, reject, or add notes to this request in the admin panel.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
New Access Request - ${data.hotelName}

A new hotel owner has requested access to Roomio:

Name: ${data.name}
Email: ${data.email}
Hotel: ${data.hotelName}
Room Count: ${data.roomCount}
Request ID: ${data.requestId}

Please review this request: ${data.adminPanelLink}

Action required within 24 hours.
  `
  
  return { subject, html, text }
}
