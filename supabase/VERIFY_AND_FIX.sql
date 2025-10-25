-- =====================================================
-- VERIFY AND FIX GUESTS TABLE
-- =====================================================

-- Step 1: Check if guests table exists and what columns it has
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'guests'
ORDER BY ordinal_position;

-- Step 2: Add missing company column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'company'
  ) THEN
    ALTER TABLE guests ADD COLUMN company VARCHAR(200);
    RAISE NOTICE 'Added company column to guests table';
  ELSE
    RAISE NOTICE 'Company column already exists';
  END IF;
END $$;

-- Step 3: Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- Step 4: Verify company column now exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'guests' AND column_name = 'company'
) AS company_column_exists;
