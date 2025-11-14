-- Add missing columns to housekeeping_tasks table if they don't exist
DO $$ 
BEGIN
    -- Add special_instructions column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'housekeeping_tasks' 
        AND column_name = 'special_instructions'
    ) THEN
        ALTER TABLE housekeeping_tasks ADD COLUMN special_instructions text;
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'housekeeping_tasks' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE housekeeping_tasks ADD COLUMN title text NOT NULL DEFAULT 'Housekeeping Task';
    END IF;

    -- Add estimated_duration column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'housekeeping_tasks' 
        AND column_name = 'estimated_duration'
    ) THEN
        ALTER TABLE housekeeping_tasks ADD COLUMN estimated_duration integer;
    END IF;

    -- Add actual_duration column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'housekeeping_tasks' 
        AND column_name = 'actual_duration'
    ) THEN
        ALTER TABLE housekeeping_tasks ADD COLUMN actual_duration integer;
    END IF;

    -- Add started_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'housekeeping_tasks' 
        AND column_name = 'started_at'
    ) THEN
        ALTER TABLE housekeeping_tasks ADD COLUMN started_at timestamptz;
    END IF;
END $$;
