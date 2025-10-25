# Quick Fix Guide - Missing Database Tables

## Problem
Your application is getting 404 errors for:
- `loyalty_transactions` table
- `guest_communications` table

These tables exist in your migration files but haven't been applied to your Supabase database yet.

## Solution - Apply the Migration

### ⚠️ IMPORTANT: Use the Complete Migration Script

**The `guests` table doesn't exist yet, so we need to create everything from scratch.**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/dsmfhrfqygzqgazicgsv
   - Navigate to **SQL Editor** (left sidebar)

2. **Run the Complete Migration Script**
   - Open the file: `supabase/COMPLETE_MIGRATION.sql`
   - Copy ALL the contents (entire file)
   - Paste into the SQL Editor
   - Click **Run** or press `Ctrl+Enter`
   - Wait for success message

3. **Verify Tables Created**
   - Go to **Table Editor** (left sidebar)
   - Check that these tables now exist:
     - ✓ `guests`
     - ✓ `loyalty_transactions`
     - ✓ `guest_communications`
     - ✓ `corporate_accounts`
     - ✓ `guest_feedback`
     - ✓ `guest_preferences`
     - ✓ `guest_documents`
     - ✓ `group_bookings`
     - ✓ `group_booking_guests`

4. **Refresh Your Application**
   - The dev server is already running on http://localhost:3001
   - Refresh the page in your browser
   - The 404 and 400 errors should be gone!

### Option 2: Apply Full Migration (Complete Setup)

If you want ALL guest management features:

1. **Open Supabase Dashboard SQL Editor**

2. **Run the Full Migration**
   - Open: `supabase/migrations/20251024164700_enhance_guest_management_schema.sql`
   - Copy ALL contents (302 lines)
   - Paste into SQL Editor
   - Click **Run**

This will create additional tables:
- `corporate_accounts`
- `guest_feedback`
- `guest_preferences`
- `guest_documents`
- `group_bookings`
- `group_booking_guests`

## Verification Steps

After running the SQL:

1. **Check Database**
   ```
   Supabase Dashboard > Table Editor
   - Verify tables exist
   - Check that RLS policies are enabled
   ```

2. **Test Application**
   ```
   - Refresh http://localhost:3001
   - Navigate to /guests page
   - Try creating a new guest
   - Check browser console for errors
   ```

3. **Expected Result**
   - No 404 errors in console
   - Guest data saves successfully
   - Loyalty and communication features work

## Why This Happened

Your migration files exist locally but weren't applied to the remote Supabase database. Migrations need to be manually applied through:
- Supabase Dashboard SQL Editor (what we're doing now)
- OR Supabase CLI: `npx supabase db push` (requires project linking)

## Next Steps After Fix

Once tables are created:
1. ✓ Application will load without errors
2. ✓ Guest management features will work
3. ✓ Loyalty system will track points
4. ✓ Communication history will be stored

## Need Help?

If you still see errors after applying the migration:
1. Check the SQL execution output for errors
2. Verify you're logged into the correct Supabase project
3. Check that your `.env` file has the correct Supabase credentials
4. Look at browser console for any new error messages

---

**Quick Command Reference:**
- Dev server: `npm run dev` (already running on port 3001)
- Check logs: Look at terminal where dev server is running
- Browser console: F12 or Right-click > Inspect > Console
