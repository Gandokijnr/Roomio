-- Add tags column to room_types table

ALTER TABLE room_types 
ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
