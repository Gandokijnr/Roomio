-- Ensure room types exist and are accessible
-- This migration ensures basic room types are available for the dropdown

-- First, ensure the room_types table has the correct structure
ALTER TABLE room_types 
ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;

-- Insert basic room types if they don't exist
INSERT INTO room_types (name, description, base_price, max_occupancy, amenities, tags) 
SELECT * FROM (VALUES
  (
    'Standard Single',
    'Comfortable single room perfect for solo travelers',
    75.00,
    1,
    '["WiFi", "AC", "TV", "Private Bathroom", "Work Desk"]'::jsonb,
    '["Budget", "Business", "Solo"]'::jsonb
  ),
  (
    'Standard Double',
    'Spacious double room with modern amenities',
    120.00,
    2,
    '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Fridge", "Work Desk"]'::jsonb,
    '["Standard", "Couple", "Business"]'::jsonb
  ),
  (
    'Deluxe Room',
    'Premium room with enhanced comfort and city view',
    180.00,
    2,
    '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Fridge", "City View", "Work Desk", "Coffee Maker"]'::jsonb,
    '["Premium", "City View", "Deluxe"]'::jsonb
  ),
  (
    'Family Suite',
    'Large suite perfect for families with children',
    250.00,
    4,
    '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Fridge", "Separate Living Area", "Sofa Bed", "Coffee Maker"]'::jsonb,
    '["Family", "Suite", "Spacious"]'::jsonb
  ),
  (
    'Executive Suite',
    'Luxury suite with premium amenities and services',
    350.00,
    2,
    '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Bar", "City View", "Work Desk", "Coffee Maker", "Room Service", "Balcony"]'::jsonb,
    '["Luxury", "Executive", "Premium", "City View"]'::jsonb
  )
) AS new_room_types(name, description, base_price, max_occupancy, amenities, tags)
WHERE NOT EXISTS (
  SELECT 1 FROM room_types WHERE room_types.name = new_room_types.name
);

-- Ensure RLS policies allow authenticated users to read room types
DROP POLICY IF EXISTS "Anyone can view room types" ON room_types;
CREATE POLICY "Anyone can view room types"
  ON room_types FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins and managers to manage room types
DROP POLICY IF EXISTS "Admins and managers can manage room types" ON room_types;
CREATE POLICY "Admins and managers can manage room types"
  ON room_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Ensure RLS is enabled
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
