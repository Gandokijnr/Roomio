-- =====================================================
-- ADD ALL MISSING COLUMNS TO GUESTS TABLE
-- =====================================================
-- This script adds all columns that the app expects but may be missing

-- Add all missing columns one by one
ALTER TABLE guests ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE guests ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS id_type VARCHAR(50) CHECK (id_type IN ('passport', 'national_id', 'driver_license', 'other'));
ALTER TABLE guests ADD COLUMN IF NOT EXISTS id_number VARCHAR(100);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(20);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS company VARCHAR(200);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS preferred_payment_method VARCHAR(50);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS special_preferences TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Loyalty fields
ALTER TABLE guests ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum'));
ALTER TABLE guests ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS total_stays INTEGER DEFAULT 0;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS total_spending DECIMAL(12,2) DEFAULT 0;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS last_visit_date TIMESTAMP;

-- Corporate fields
ALTER TABLE guests ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT false;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS corporate_id UUID;

-- Preferences
ALTER TABLE guests ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Timestamps
ALTER TABLE guests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE guests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- Verify all columns were added
SELECT 
  COUNT(*) as total_columns,
  STRING_AGG(column_name, ', ' ORDER BY ordinal_position) as column_list
FROM information_schema.columns
WHERE table_name = 'guests';

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✓ All missing columns added to guests table';
  RAISE NOTICE '✓ Schema cache reloaded';
  RAISE NOTICE '✓ Refresh your application now!';
END $$;
