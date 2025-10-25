# Guest Management Module Implementation

## Overview
Comprehensive guest management system for Roomio hotel management platform with advanced features for tracking guest profiles, loyalty programs, corporate accounts, and communication history.

## Database Schema Enhancement

### Migration File
- **Location**: `supabase/migrations/20251024164700_enhance_guest_management_schema.sql`
- **Status**: Created, pending deployment

### New Tables Created

#### 1. Enhanced Guests Table
- Added fields for comprehensive guest profiles:
  - `guest_id`: Unique identifier (format: GUEST-XXXXXX)
  - `gender`, `date_of_birth`, `nationality`
  - `city`, `address`, `id_type`, `id_number`
  - `emergency_contact`, `occupation`, `company`
  - `preferred_payment_method`, `special_preferences`
  - `loyalty_tier`, `loyalty_points`, `total_stays`, `total_spending`
  - `last_visit_date`, `is_corporate`, `corporate_id`
  - `marketing_consent`, `profile_image_url`

#### 2. Corporate Accounts
- Manages company accounts with bulk booking capabilities
- Fields: company details, billing preferences, discount rates, credit limits

#### 3. Guest Feedback
- Collects and manages guest reviews and ratings
- Multiple rating categories (cleanliness, service, amenities, value)
- Staff response tracking

#### 4. Loyalty Transactions
- Tracks points earned, redeemed, expired, and adjusted
- Links to reservations for automatic point calculation

#### 5. Guest Communications
- Records all guest interactions (email, SMS, calls, in-person)
- Tracks communication status and direction

#### 6. Guest Preferences
- Stores individual guest preferences (room type, floor, amenities)
- Flexible key-value structure

#### 7. Guest Documents
- Manages uploaded documents (IDs, contracts, etc.)
- Secure file storage with metadata

#### 8. Group Bookings
- Handles group reservations and events
- Links multiple guests to a single booking

### Automated Features
- **Guest ID Generation**: Automatic unique ID assignment
- **Timestamp Management**: Auto-update of modified records
- **RLS Policies**: Row-level security for all tables

## Frontend Components

### 1. GuestModal Component
**Location**: `components/GuestModal.vue`

**Features**:
- Tabbed interface (Basic Info, History, Loyalty, Communications)
- Comprehensive form with validation
- Real-time data loading
- Responsive design with Tailwind CSS

**Tabs**:
- **Basic Information**: Personal details, contact info, identification
- **History**: Reservation history, spending analytics
- **Loyalty**: Points balance, tier status, transaction history
- **Communications**: Message history, feedback records

### 2. Guests Management Page
**Location**: `pages/guests/index.vue`

**Features**:
- **Dashboard Statistics**:
  - Total guests count
  - VIP guests (Gold/Platinum tier)
  - Corporate guests
  - New guests this month

- **Advanced Filtering**:
  - Search by name, email, phone, guest ID
  - Filter by loyalty tier
  - Filter by guest type (individual/corporate)

- **Guest Table**:
  - Sortable columns
  - Quick action buttons (View, Edit, Message)
  - Visual loyalty tier badges
  - Guest statistics display

- **Export Functionality**:
  - CSV export of filtered guest data
  - Includes all key metrics

## Type Definitions

### Location
`types/database.ts`

### New Types Added
```typescript
- Gender: 'male' | 'female' | 'other'
- IdType: 'passport' | 'national_id' | 'driver_license' | 'other'
- LoyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
- CommunicationType: 'email' | 'sms' | 'call' | 'in_person'
- CommunicationDirection: 'inbound' | 'outbound'
- CommunicationStatus: 'sent' | 'delivered' | 'read' | 'failed'
- LoyaltyTransactionType: 'earned' | 'redeemed' | 'expired' | 'adjusted'
- BillingPreference: 'consolidated' | 'individual'
```

### New Interfaces
- `Guest` (enhanced)
- `CorporateAccount`
- `GuestFeedback`
- `LoyaltyTransaction`
- `GuestCommunication`
- `GuestPreference`
- `GuestDocument`
- `GroupBooking`
- `GroupBookingGuest`

## Deployment Steps

### 1. Apply Database Migration
```bash
# Option 1: Using Supabase CLI (if linked)
npx supabase db push

# Option 2: Manual application via Supabase Dashboard
# Navigate to SQL Editor and run the migration file
```

### 2. Verify Tables Created
Check Supabase Dashboard > Table Editor for:
- guests (updated)
- corporate_accounts
- guest_feedback
- loyalty_transactions
- guest_communications
- guest_preferences
- guest_documents
- group_bookings
- group_booking_guests

### 3. Test RLS Policies
Ensure authenticated users can access guest data according to their roles.

## Usage Guide

### Adding a New Guest
1. Navigate to Guests page
2. Click "+ Add Guest" button
3. Fill in basic information (required: first name, last name)
4. Optionally add contact details, identification, preferences
5. Click "Save Guest"

### Viewing Guest Profile
1. Find guest in the table
2. Click the eye icon (👁️) to view full profile
3. Navigate through tabs to see history, loyalty, communications

### Managing Loyalty Points
1. Open guest profile
2. Go to "Loyalty" tab
3. View current tier and points balance
4. Points are automatically earned based on reservations

### Exporting Guest Data
1. Apply desired filters
2. Click "📊 Export Data" button
3. CSV file downloads with filtered guest information

## Future Enhancements

### Pending Implementation
1. **Guest History Analytics**
   - Visual charts for spending trends
   - Stay frequency analysis
   - Seasonal booking patterns

2. **Loyalty Program Management**
   - Automated tier upgrades
   - Points expiration notifications
   - Reward redemption system

3. **Corporate Account Dashboard**
   - Bulk booking interface
   - Corporate billing reports
   - Usage analytics

4. **Guest Communication System**
   - Email template builder
   - SMS integration
   - Automated birthday/anniversary messages

5. **Feedback Management**
   - Review request automation
   - Sentiment analysis
   - Response workflow

6. **Group Booking Interface**
   - Multi-room allocation
   - Group discount calculator
   - Event planning tools

## Technical Notes

### Dependencies
- `@supabase/supabase-js`: Database client
- `date-fns`: Date formatting
- `@tailwindcss/vite`: Styling
- Vue 3 Composition API

### Authentication
- All pages protected by `auth` and `role` middleware
- RLS policies enforce data access control

### Performance Considerations
- Indexed fields: guest_id, email, phone, corporate_id
- Efficient filtering with computed properties
- Lazy loading of related data in modal

## Support

For issues or questions:
1. Check console logs for errors
2. Verify Supabase connection
3. Ensure migration was applied successfully
4. Review RLS policies for access issues
