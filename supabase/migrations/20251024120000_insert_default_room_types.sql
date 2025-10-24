-- Insert default room types for the hotel management system

-- Only insert if room types don't already exist
INSERT INTO room_types (name, description, base_price, max_occupancy, amenities, tags) 
SELECT * FROM (VALUES
  (
    'Standard Single',
    'Comfortable single room with basic amenities',
    80.00,
    1,
    '["WiFi", "AC", "TV", "Private Bathroom"]'::jsonb,
    '["Budget", "Business", "Solo Travel"]'::jsonb
  ),
  (
    'Standard Double',
    'Spacious double room perfect for couples',
    120.00,
    2,
    '["WiFi", "AC", "TV", "Private Bathroom", "Mini Fridge"]'::jsonb,
    '["Romantic", "Couples", "Standard"]'::jsonb
  ),
  (
    'Deluxe Room',
    'Enhanced room with premium amenities and city view',
    180.00,
    2,
    '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Bar", "City View", "Work Desk"]'::jsonb,
    '["Premium", "City View", "Business", "Deluxe"]'::jsonb
  ),
  (
    'Family Suite',
    'Large suite ideal for families with separate living area',
    250.00,
    4,
    '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Bar", "Separate Living Area", "Sofa Bed", "Kitchenette"]'::jsonb,
    '["Family Friendly", "Suite", "Spacious", "Kids Welcome"]'::jsonb
  ),
  (
    'Executive Suite',
    'Luxury suite with premium amenities and services',
    350.00,
    2,
    '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Bar", "Ocean View", "Balcony", "Premium Toiletries", "Concierge Service"]'::jsonb,
    '["Luxury", "Executive", "Ocean View", "VIP", "Premium"]'::jsonb
  ),
  (
    'Presidential Suite',
    'Ultimate luxury accommodation with exclusive amenities',
    500.00,
    4,
    '["WiFi", "AC", "Smart TV", "Private Bathroom", "Full Bar", "Ocean View", "Large Balcony", "Jacuzzi", "Butler Service", "Separate Dining Area"]'::jsonb,
    '["Luxury", "VIP", "Presidential", "Ocean View", "Honeymoon", "Ultra Premium"]'::jsonb
  )
) AS new_room_types(name, description, base_price, max_occupancy, amenities, tags)
WHERE NOT EXISTS (
  SELECT 1 FROM room_types WHERE room_types.name = new_room_types.name
);
