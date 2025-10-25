-- =====================================================
-- REFRESH SCHEMA CACHE
-- Run this if you get "column not found in schema cache" errors
-- =====================================================

-- This forces Supabase to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the guests table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'guests'
ORDER BY ordinal_position;
