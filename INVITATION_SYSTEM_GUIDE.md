# Invitation-Only Access System Guide

## Overview

The Roomio hotel management platform now operates as an exclusive, invitation-only system designed for hotel owners. This guide explains how the system works and how to manage access requests.

## System Architecture

### 1. Landing Page (Default Experience)
- **URL**: `/landing` (redirected from `/`)
- **Purpose**: Showcase features and collect access requests
- **Key Elements**:
  - Professional hero section with value proposition
  - Feature showcase with interactive elements
  - Benefits section with ROI calculator
  - Customer testimonials and trust indicators
  - Request access form

### 2. Access Request System
- **Endpoint**: `/api/demo-request`
- **Database**: `demo_requests` table
- **Process**:
  1. Visitor fills out request form (name, email, hotel, room count)
  2. System validates and stores request
  3. Admin receives notification (to be implemented)
  4. Request status: `pending` → `approved`/`rejected`

### 3. Admin Management Panel
- **URL**: `/admin/demo-requests`
- **Access**: Authenticated users only
- **Features**:
  - View all requests with filtering
  - Approve/reject requests
  - Generate invitation links
  - Track invitation status

### 4. Invitation-Only Signup
- **URL**: `/signup?token=<invitation_token>`
- **Validation**: Checks token validity and expiry
- **Process**:
  1. User clicks invitation link
  2. System validates token
  3. Pre-fills email from invitation
  4. User creates password and accepts terms
  5. Account created and invitation marked as used

## Database Schema

```sql
CREATE TABLE demo_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  hotel_name VARCHAR(255) NOT NULL,
  room_count VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  invitation_token UUID DEFAULT gen_random_uuid(),
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  invitation_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);
```

## User Flow

### For Potential Hotel Owners:
1. Visit website → Redirected to landing page
2. Learn about features and benefits
3. Fill out "Request Access" form
4. Receive confirmation message
5. Wait for approval (admin notification)
6. Receive invitation email with signup link
7. Create account using invitation link
8. Access full platform

### For Administrators:
1. Login to platform
2. Navigate to `/admin/demo-requests`
3. Review pending requests
4. Approve qualified requests
5. Generate and send invitation links
6. Monitor invitation usage

## Key Features

### 🔐 Security & Control
- **Token-based invitations** with 7-day expiry
- **RLS policies** protect database access
- **Duplicate prevention** for email addresses
- **Admin approval** required for all access

### 🎯 Professional Positioning
- **Exclusive messaging** throughout the experience
- **Premium branding** with trust indicators
- **Qualified lead generation** through request process
- **Professional onboarding** experience

### 📊 Analytics & Tracking
- **Request statistics** in admin panel
- **Invitation tracking** with timestamps
- **Status monitoring** for all requests
- **Conversion tracking** capabilities

## Configuration

### Environment Variables Required:
```env
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NUXT_PUBLIC_BASE_URL=your_domain_url
```

### Email Integration (To Implement):
The system is ready for email integration. Update the invitation sending logic in:
- `/server/api/send-invitation.post.ts`
- Add email service (SendGrid, Mailgun, Resend)
- Customize email templates

## Testing the System

### 1. Test Landing Page
- Visit `http://localhost:3000`
- Should redirect to landing page
- Fill out request access form
- Verify form submission

### 2. Test Admin Panel
- Login as admin user
- Visit `/admin/demo-requests`
- Approve a request
- Generate invitation link

### 3. Test Invitation Signup
- Use generated invitation link
- Complete signup process
- Verify account creation

### 4. Test Access Control
- Try accessing `/signup` without token
- Should show "invitation required" message
- Try using expired token
- Should show "invalid invitation" message

## Customization Options

### 1. Branding
- Update logo and colors in components
- Customize messaging in landing page
- Modify email templates (when implemented)

### 2. Request Fields
- Add/remove fields in request form
- Update database schema accordingly
- Modify admin panel display

### 3. Approval Workflow
- Add approval notifications
- Implement automated approval rules
- Add rejection reason tracking

### 4. Invitation Settings
- Modify expiry duration (currently 7 days)
- Add invitation limits per request
- Implement invitation reminders

## Troubleshooting

### Common Issues:

1. **Table doesn't exist**
   - The API automatically creates the table on first request
   - Check Supabase permissions for table creation

2. **RLS policies blocking access**
   - Verify policies are created correctly
   - Check user authentication status

3. **Invitation links not working**
   - Verify token format and expiry
   - Check URL generation logic

4. **Form submissions failing**
   - Check network requests in browser dev tools
   - Verify API endpoint is accessible

## Next Steps

### Recommended Enhancements:
1. **Email Integration** - Automated invitation emails
2. **Admin Notifications** - Alert admins of new requests
3. **Analytics Dashboard** - Track conversion metrics
4. **Bulk Operations** - Approve multiple requests at once
5. **Request Categories** - Different approval workflows by hotel size
6. **Integration APIs** - Connect with CRM systems

This invitation-only system provides a professional, controlled onboarding experience that positions your hotel management software as a premium, exclusive solution while ensuring only qualified prospects gain access.
