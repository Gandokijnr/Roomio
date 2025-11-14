# Invitation System Testing Guide

## Prerequisites

1. **Environment Setup**
   - Copy `.env.invitation-system` to `.env`
   - Update Supabase credentials
   - Set email provider (start with `console` for testing)

2. **Development Server**
   ```bash
   npm run dev
   ```

## Test Scenarios

### 1. Landing Page Experience

**Test**: Default visitor flow
- Visit `http://localhost:3000`
- Should redirect to landing page
- Verify all sections load correctly:
  - Hero section with compelling messaging
  - Features showcase with interactive elements
  - Benefits section with ROI calculator
  - Testimonials and social proof
  - Request access form

**Expected Results**:
- ✅ Professional, exclusive positioning
- ✅ Clear "Request Access" CTAs
- ✅ No public signup options visible
- ✅ Responsive design on mobile

### 2. Access Request Flow

**Test**: Submit access request
- Fill out the request form:
  - Name: "John Smith"
  - Email: "john@testhotel.com"
  - Hotel: "Test Grand Hotel"
  - Rooms: "26-50 rooms"
- Submit the form

**Expected Results**:
- ✅ Success message displayed
- ✅ Admin notification in console (if EMAIL_PROVIDER=console)
- ✅ Request stored in database
- ✅ Duplicate email prevention works

### 3. Admin Management Panel

**Test**: Admin request management
- Login as admin user
- Visit `/admin/demo-requests`
- Review pending requests
- Test individual actions:
  - Approve a request
  - Reject a request
  - Send invitation

**Expected Results**:
- ✅ All requests displayed with correct status
- ✅ Approval/rejection updates status
- ✅ Invitation generates unique link
- ✅ Email sent (check console if using console provider)

### 4. Bulk Operations

**Test**: Bulk request management
- Select multiple requests using checkboxes
- Test bulk actions:
  - Bulk approve
  - Bulk reject
  - Bulk send invitations

**Expected Results**:
- ✅ Selection works correctly
- ✅ Bulk operations update all selected requests
- ✅ Success/error messages displayed
- ✅ Local state updates immediately

### 5. Analytics Dashboard

**Test**: Analytics and reporting
- Visit `/admin/analytics`
- Verify metrics display:
  - Total requests
  - Approval rate
  - Conversion metrics
  - Charts and visualizations

**Expected Results**:
- ✅ Accurate metrics calculation
- ✅ Charts render correctly
- ✅ Export functionality works
- ✅ Recent activity shows latest actions

### 6. Invitation-Only Signup

**Test**: Signup with invitation
- Get invitation link from admin panel
- Visit signup page with token
- Complete account creation

**Expected Results**:
- ✅ Token validation works
- ✅ Email pre-filled from invitation
- ✅ Account creation successful
- ✅ Invitation marked as used

**Test**: Invalid invitation access
- Visit `/signup` without token
- Visit `/signup?token=invalid-token`
- Visit with expired token

**Expected Results**:
- ✅ "Invitation required" message shown
- ✅ Invalid token rejected
- ✅ Expired token rejected
- ✅ Clear error messaging

### 7. Authentication Flow

**Test**: Login redirection
- Visit `/login` as unauthenticated user
- See "Request Access" link
- Login with valid credentials

**Expected Results**:
- ✅ No public signup option
- ✅ Clear invitation-only messaging
- ✅ Successful login redirects to dashboard
- ✅ Failed login shows error

### 8. Email Integration

**Test**: Email functionality (if configured)
- Set up real email provider
- Submit access request
- Approve request and send invitation

**Expected Results**:
- ✅ Admin notification email received
- ✅ Professional invitation email sent
- ✅ Email templates render correctly
- ✅ Links in emails work properly

## Performance Tests

### 1. Load Testing
- Submit multiple access requests
- Test with 50+ requests in admin panel
- Verify pagination and filtering

### 2. Security Testing
- Try accessing admin panel without authentication
- Test SQL injection in form fields
- Verify RLS policies work correctly

### 3. Mobile Testing
- Test all flows on mobile devices
- Verify responsive design
- Check touch interactions

## Common Issues & Solutions

### Issue: Table doesn't exist
**Solution**: The API automatically creates the table on first request. Check Supabase permissions.

### Issue: Emails not sending
**Solution**: 
1. Check EMAIL_PROVIDER setting
2. Verify API keys are correct
3. Check console logs for errors
4. Start with `console` provider for testing

### Issue: Invitation links not working
**Solution**:
1. Verify NUXT_PUBLIC_BASE_URL is correct
2. Check token format in database
3. Ensure invitation hasn't expired

### Issue: Admin panel access denied
**Solution**:
1. Ensure user is authenticated
2. Check role-based access middleware
3. Verify Supabase RLS policies

## Success Criteria

The invitation system is working correctly when:

- ✅ **Landing page** serves as professional entry point
- ✅ **Access requests** are captured and stored
- ✅ **Admin notifications** are sent for new requests
- ✅ **Approval workflow** functions smoothly
- ✅ **Invitation emails** are sent with valid links
- ✅ **Signup process** validates invitations properly
- ✅ **Analytics dashboard** shows accurate metrics
- ✅ **Bulk operations** handle multiple requests efficiently
- ✅ **Security measures** prevent unauthorized access
- ✅ **Mobile experience** is fully functional

## Next Steps After Testing

1. **Configure Production Email**
   - Set up SendGrid, Resend, or Mailgun
   - Update email templates with branding
   - Test email deliverability

2. **Customize Branding**
   - Update logo and colors
   - Customize email templates
   - Add company-specific messaging

3. **Set Up Monitoring**
   - Monitor request volumes
   - Track conversion rates
   - Set up alerts for admin actions

4. **Deploy to Production**
   - Update environment variables
   - Test all flows in production
   - Monitor system performance

This comprehensive testing ensures your invitation-only system provides a professional, secure, and efficient onboarding experience for potential hotel customers.
