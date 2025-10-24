# Email Notification Setup Guide

This guide explains how to set up email notifications for booking confirmations in your Roomio hotel management system.

## Overview

The email system uses Netlify Functions with Nodemailer to send professional booking confirmation emails to guests automatically when reservations are created.

## Features

- ✅ **Automatic booking confirmations** - Sent immediately after reservation creation
- ✅ **Professional HTML templates** - Beautiful, responsive email design
- ✅ **QR code integration** - For quick check-in at reception
- ✅ **Hotel branding** - Customizable hotel information and logo
- ✅ **Reservation details** - Complete booking information included
- ✅ **Error handling** - Graceful fallbacks if email fails

## Setup Instructions

### 1. Gmail Configuration (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

### 2. Environment Variables

Add these variables to your Netlify site environment:

```bash
EMAIL_USER=your-hotel-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**In Netlify Dashboard:**
1. Go to Site settings → Environment variables
2. Add the variables above
3. Deploy your site

### 3. Local Development

For local testing with Netlify Dev:

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Create `.env` file with your email credentials
3. Run: `netlify dev` instead of `npm run dev`

### 4. Hotel Information Customization

Update the hotel information in `composables/useEmailNotifications.ts`:

```typescript
const defaultHotelInfo: HotelInfo = {
  name: 'Your Hotel Name',
  address: 'Your Hotel Address',
  phone: 'Your Phone Number',
  email: 'your-hotel@email.com',
  website: 'your-website.com'
}
```

### 5. Logo Customization

Replace the placeholder logo URL in `netlify/functions/send-booking-confirmation.js`:

```javascript
attachments: [
  {
    filename: 'logo.png',
    path: 'https://your-domain.com/logo.png', // Your actual logo URL
    cid: 'logo'
  }
]
```

## Email Templates

### Booking Confirmation Email Includes:

- **Header** with hotel logo and branding
- **Confirmation number** prominently displayed
- **Guest and reservation details** in organized sections
- **Pricing breakdown** with itemized costs
- **Special requests** if any were made
- **QR code** for quick check-in
- **Important information** (check-in/out times, policies)
- **Hotel contact information** in footer

### Responsive Design

The email template is fully responsive and works on:
- Desktop email clients
- Mobile devices
- Webmail interfaces (Gmail, Outlook, etc.)

## Testing

### Test Email Functionality:

1. Create a test reservation with a valid email address
2. Check the browser console for email status logs
3. Verify the email arrives in the guest's inbox
4. Test on different email clients and devices

### Troubleshooting:

**Email not sending?**
- Check environment variables are set correctly
- Verify Gmail app password is valid
- Check Netlify function logs for errors

**Email going to spam?**
- Add SPF/DKIM records to your domain
- Use a professional email address
- Avoid spam trigger words in content

## Alternative Email Services

You can modify the transporter configuration to use other services:

### SendGrid:
```javascript
const transporter = nodemailer.createTransporter({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

### Outlook/Hotmail:
```javascript
const transporter = nodemailer.createTransporter({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use app passwords** instead of account passwords
3. **Rotate credentials** regularly
4. **Monitor email usage** for suspicious activity
5. **Use environment variables** for all sensitive data

## Future Enhancements

Planned email features:
- Check-in reminder emails (24 hours before)
- Booking modification notifications
- Cancellation confirmations
- Post-stay feedback requests
- SMS notifications integration

## Support

For email setup issues:
1. Check the Netlify function logs
2. Verify environment variables
3. Test with a simple email first
4. Contact your email provider for authentication issues
