-- =====================================================
-- SEED DATA FOR RESTAURANT & BAR OPERATIONS
-- =====================================================
-- This script populates the restaurant and bar tables with sample data

-- Insert Inventory Categories
INSERT INTO inventory_categories (name, description, category_type) VALUES
('Proteins', 'Meat, fish, and protein sources', 'food'),
('Vegetables', 'Fresh vegetables and produce', 'food'),
('Grains & Starches', 'Rice, pasta, bread, and starchy foods', 'food'),
('Dairy & Eggs', 'Milk, cheese, eggs, and dairy products', 'food'),
('Spices & Seasonings', 'Herbs, spices, and flavor enhancers', 'food'),
('Cooking Oils', 'Various cooking oils and fats', 'food'),
('Alcoholic Beverages', 'Beer, wine, spirits, and cocktail ingredients', 'beverage'),
('Non-Alcoholic Beverages', 'Soft drinks, juices, and non-alcoholic drinks', 'beverage'),
('Hot Beverages', 'Coffee, tea, and hot drink ingredients', 'beverage'),
('Kitchen Supplies', 'Disposables, cleaning supplies, and kitchen tools', 'supplies'),
('Bar Equipment', 'Bar tools, glassware, and bar supplies', 'equipment');

-- Insert Sample Inventory Items
INSERT INTO inventory_items (item_code, name, description, category_id, unit_of_measure, current_stock, minimum_stock, maximum_stock, unit_cost, storage_temperature, shelf_life_days) VALUES
-- Proteins
('INV-000001', 'Chicken (Whole)', 'Fresh whole chicken', (SELECT id FROM inventory_categories WHERE name = 'Proteins'), 'pieces', 25, 10, 50, 2500, 'refrigerated', 3),
('INV-000002', 'Beef (Stewing)', 'Fresh beef for stewing', (SELECT id FROM inventory_categories WHERE name = 'Proteins'), 'kg', 15, 5, 30, 4500, 'refrigerated', 3),
('INV-000003', 'Fish (Tilapia)', 'Fresh tilapia fish', (SELECT id FROM inventory_categories WHERE name = 'Proteins'), 'kg', 12, 5, 25, 3200, 'refrigerated', 2),
('INV-000004', 'Prawns', 'Fresh prawns/shrimp', (SELECT id FROM inventory_categories WHERE name = 'Proteins'), 'kg', 8, 3, 15, 6500, 'refrigerated', 2),

-- Vegetables
('INV-000005', 'Tomatoes', 'Fresh tomatoes', (SELECT id FROM inventory_categories WHERE name = 'Vegetables'), 'kg', 20, 8, 40, 800, 'ambient', 5),
('INV-000006', 'Onions', 'Fresh onions', (SELECT id FROM inventory_categories WHERE name = 'Vegetables'), 'kg', 30, 10, 60, 600, 'ambient', 14),
('INV-000007', 'Bell Peppers', 'Mixed bell peppers', (SELECT id FROM inventory_categories WHERE name = 'Vegetables'), 'kg', 15, 5, 30, 1200, 'refrigerated', 7),
('INV-000008', 'Spinach', 'Fresh spinach leaves', (SELECT id FROM inventory_categories WHERE name = 'Vegetables'), 'kg', 10, 3, 20, 1500, 'refrigerated', 3),

-- Grains & Starches
('INV-000009', 'Rice (Long Grain)', 'Premium long grain rice', (SELECT id FROM inventory_categories WHERE name = 'Grains & Starches'), 'kg', 50, 20, 100, 1200, 'ambient', 365),
('INV-000010', 'Pasta (Spaghetti)', 'Italian spaghetti pasta', (SELECT id FROM inventory_categories WHERE name = 'Grains & Starches'), 'kg', 25, 10, 50, 800, 'ambient', 730),
('INV-000011', 'Bread (Loaves)', 'Fresh bread loaves', (SELECT id FROM inventory_categories WHERE name = 'Grains & Starches'), 'pieces', 20, 5, 40, 500, 'ambient', 3),
('INV-000012', 'Yam', 'Fresh yam tubers', (SELECT id FROM inventory_categories WHERE name = 'Grains & Starches'), 'kg', 40, 15, 80, 900, 'ambient', 14),

-- Cooking Oils
('INV-000013', 'Palm Oil', 'Red palm oil', (SELECT id FROM inventory_categories WHERE name = 'Cooking Oils'), 'l', 15, 5, 30, 1800, 'ambient', 180),
('INV-000014', 'Vegetable Oil', 'Refined vegetable oil', (SELECT id FROM inventory_categories WHERE name = 'Cooking Oils'), 'l', 20, 8, 40, 1500, 'ambient', 365),

-- Spices & Seasonings
('INV-000015', 'Curry Powder', 'Nigerian curry powder', (SELECT id FROM inventory_categories WHERE name = 'Spices & Seasonings'), 'kg', 5, 2, 10, 2500, 'ambient', 365),
('INV-000016', 'Thyme', 'Dried thyme leaves', (SELECT id FROM inventory_categories WHERE name = 'Spices & Seasonings'), 'kg', 3, 1, 6, 3000, 'ambient', 365),
('INV-000017', 'Maggi Cubes', 'Seasoning cubes', (SELECT id FROM inventory_categories WHERE name = 'Spices & Seasonings'), 'packs', 50, 20, 100, 150, 'ambient', 730),

-- Alcoholic Beverages
('INV-000018', 'Beer (Bottles)', 'Assorted beer bottles', (SELECT id FROM inventory_categories WHERE name = 'Alcoholic Beverages'), 'bottles', 120, 50, 200, 500, 'refrigerated', 180),
('INV-000019', 'Wine (Red)', 'Red wine bottles', (SELECT id FROM inventory_categories WHERE name = 'Alcoholic Beverages'), 'bottles', 30, 10, 60, 3500, 'ambient', 1825),
('INV-000020', 'Whiskey', 'Premium whiskey', (SELECT id FROM inventory_categories WHERE name = 'Alcoholic Beverages'), 'bottles', 15, 5, 30, 12000, 'ambient', 3650),
('INV-000021', 'Vodka', 'Premium vodka', (SELECT id FROM inventory_categories WHERE name = 'Alcoholic Beverages'), 'bottles', 12, 4, 25, 8500, 'ambient', 3650),

-- Non-Alcoholic Beverages
('INV-000022', 'Soft Drinks', 'Assorted soft drinks', (SELECT id FROM inventory_categories WHERE name = 'Non-Alcoholic Beverages'), 'bottles', 100, 40, 200, 300, 'refrigerated', 365),
('INV-000023', 'Fruit Juice', 'Fresh fruit juices', (SELECT id FROM inventory_categories WHERE name = 'Non-Alcoholic Beverages'), 'l', 25, 10, 50, 800, 'refrigerated', 7),
('INV-000024', 'Water (Bottled)', 'Bottled water', (SELECT id FROM inventory_categories WHERE name = 'Non-Alcoholic Beverages'), 'bottles', 200, 50, 400, 150, 'ambient', 365),

-- Hot Beverages
('INV-000025', 'Coffee Beans', 'Premium coffee beans', (SELECT id FROM inventory_categories WHERE name = 'Hot Beverages'), 'kg', 10, 3, 20, 4500, 'ambient', 365),
('INV-000026', 'Tea Bags', 'Assorted tea bags', (SELECT id FROM inventory_categories WHERE name = 'Hot Beverages'), 'boxes', 20, 5, 40, 1200, 'ambient', 730);

-- Insert Menu Categories
INSERT INTO menu_categories (name, description, category_type) VALUES
('Appetizers', 'Starters and small plates', 'food'),
('Soups', 'Traditional and international soups', 'food'),
('Main Courses', 'Primary dishes and entrees', 'food'),
('Rice Dishes', 'Various rice preparations', 'food'),
('Grilled Items', 'Grilled meats and seafood', 'food'),
('Desserts', 'Sweet treats and desserts', 'food'),
('Cocktails', 'Mixed alcoholic beverages', 'beverage'),
('Beer & Wine', 'Alcoholic beverages', 'beverage'),
('Soft Drinks', 'Non-alcoholic beverages', 'beverage'),
('Hot Beverages', 'Coffee, tea, and hot drinks', 'beverage');

-- Insert Sample Menu Items
INSERT INTO menu_items (item_code, name, description, category_id, base_price, cost_price, item_type, preparation_time, is_available, is_featured) VALUES
-- Appetizers
('MENU-001', 'Suya Platter', 'Spiced grilled meat skewers with onions and tomatoes', (SELECT id FROM menu_categories WHERE name = 'Appetizers'), 2500, 1200, 'food', 15, true, true),
('MENU-002', 'Chicken Wings', 'Spicy chicken wings with pepper sauce', (SELECT id FROM menu_categories WHERE name = 'Appetizers'), 2000, 900, 'food', 20, true, false),
('MENU-003', 'Fish Rolls', 'Crispy fish rolls with spicy dip', (SELECT id FROM menu_categories WHERE name = 'Appetizers'), 1800, 800, 'food', 12, true, false),

-- Soups
('MENU-004', 'Pepper Soup', 'Spicy Nigerian pepper soup with fish', (SELECT id FROM menu_categories WHERE name = 'Soups'), 3500, 1500, 'food', 25, true, true),
('MENU-005', 'Egusi Soup', 'Traditional egusi soup with assorted meat', (SELECT id FROM menu_categories WHERE name = 'Soups'), 4000, 1800, 'food', 35, true, false),
('MENU-006', 'Oha Soup', 'Delicious oha soup with stockfish', (SELECT id FROM menu_categories WHERE name = 'Soups'), 4200, 1900, 'food', 40, true, false),

-- Main Courses
('MENU-007', 'Jollof Rice & Chicken', 'Nigerian jollof rice with grilled chicken', (SELECT id FROM menu_categories WHERE name = 'Main Courses'), 3800, 1600, 'food', 30, true, true),
('MENU-008', 'Fried Rice Special', 'Fried rice with mixed vegetables and prawns', (SELECT id FROM menu_categories WHERE name = 'Main Courses'), 4200, 1800, 'food', 25, true, true),
('MENU-009', 'Pounded Yam & Egusi', 'Fresh pounded yam with egusi soup', (SELECT id FROM menu_categories WHERE name = 'Main Courses'), 4500, 2000, 'food', 45, true, false),

-- Grilled Items
('MENU-010', 'Grilled Fish', 'Fresh tilapia grilled with spices', (SELECT id FROM menu_categories WHERE name = 'Grilled Items'), 5500, 2500, 'food', 35, true, true),
('MENU-011', 'Grilled Chicken', 'Half chicken grilled to perfection', (SELECT id FROM menu_categories WHERE name = 'Grilled Items'), 4800, 2200, 'food', 40, true, false),
('MENU-012', 'Beef Kebab', 'Spiced beef kebab skewers', (SELECT id FROM menu_categories WHERE name = 'Grilled Items'), 3500, 1800, 'food', 25, true, false),

-- Cocktails
('MENU-013', 'Mojito', 'Classic mojito with fresh mint', (SELECT id FROM menu_categories WHERE name = 'Cocktails'), 2500, 800, 'beverage', 5, true, true),
('MENU-014', 'Pina Colada', 'Tropical pina colada', (SELECT id FROM menu_categories WHERE name = 'Cocktails'), 2800, 900, 'beverage', 7, true, false),
('MENU-015', 'Whiskey Sour', 'Classic whiskey sour cocktail', (SELECT id FROM menu_categories WHERE name = 'Cocktails'), 3200, 1200, 'beverage', 5, true, false),

-- Beer & Wine
('MENU-016', 'Local Beer', 'Chilled local beer', (SELECT id FROM menu_categories WHERE name = 'Beer & Wine'), 800, 500, 'beverage', 2, true, false),
('MENU-017', 'Imported Beer', 'Premium imported beer', (SELECT id FROM menu_categories WHERE name = 'Beer & Wine'), 1200, 700, 'beverage', 2, true, false),
('MENU-018', 'House Wine', 'House red or white wine', (SELECT id FROM menu_categories WHERE name = 'Beer & Wine'), 4500, 3500, 'beverage', 3, true, false),

-- Soft Drinks
('MENU-019', 'Soft Drinks', 'Assorted soft drinks', (SELECT id FROM menu_categories WHERE name = 'Soft Drinks'), 500, 300, 'beverage', 1, true, false),
('MENU-020', 'Fresh Juice', 'Freshly squeezed fruit juice', (SELECT id FROM menu_categories WHERE name = 'Soft Drinks'), 1200, 600, 'beverage', 5, true, false),
('MENU-021', 'Bottled Water', 'Chilled bottled water', (SELECT id FROM menu_categories WHERE name = 'Soft Drinks'), 300, 150, 'beverage', 1, true, false),

-- Hot Beverages
('MENU-022', 'Coffee', 'Freshly brewed coffee', (SELECT id FROM menu_categories WHERE name = 'Hot Beverages'), 800, 300, 'beverage', 5, true, false),
('MENU-023', 'Tea', 'Assorted teas', (SELECT id FROM menu_categories WHERE name = 'Hot Beverages'), 600, 200, 'beverage', 5, true, false),
('MENU-024', 'Hot Chocolate', 'Rich hot chocolate', (SELECT id FROM menu_categories WHERE name = 'Hot Beverages'), 1000, 400, 'beverage', 7, true, false);

-- Insert Recipe Ingredients (linking menu items to inventory items)
INSERT INTO recipe_ingredients (menu_item_id, inventory_item_id, quantity_required, unit, notes) VALUES
-- Jollof Rice & Chicken
((SELECT id FROM menu_items WHERE item_code = 'MENU-007'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000009'), 0.3, 'kg', 'Long grain rice'),
((SELECT id FROM menu_items WHERE item_code = 'MENU-007'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000001'), 0.25, 'pieces', 'Quarter chicken'),
((SELECT id FROM menu_items WHERE item_code = 'MENU-007'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000005'), 0.1, 'kg', 'Fresh tomatoes'),
((SELECT id FROM menu_items WHERE item_code = 'MENU-007'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000006'), 0.05, 'kg', 'Onions'),
((SELECT id FROM menu_items WHERE item_code = 'MENU-007'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000014'), 0.05, 'l', 'Vegetable oil'),

-- Pepper Soup
((SELECT id FROM menu_items WHERE item_code = 'MENU-004'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000003'), 0.3, 'kg', 'Fresh tilapia'),
((SELECT id FROM menu_items WHERE item_code = 'MENU-004'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000006'), 0.02, 'kg', 'Onions'),
((SELECT id FROM menu_items WHERE item_code = 'MENU-004'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000015'), 0.01, 'kg', 'Curry powder'),

-- Grilled Fish
((SELECT id FROM menu_items WHERE item_code = 'MENU-010'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000003'), 0.5, 'kg', 'Whole tilapia'),
((SELECT id FROM menu_items WHERE item_code = 'MENU-010'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000015'), 0.02, 'kg', 'Spice mix'),

-- Mojito
((SELECT id FROM menu_items WHERE item_code = 'MENU-013'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000021'), 0.05, 'bottles', 'White rum equivalent'),

-- Coffee
((SELECT id FROM menu_items WHERE item_code = 'MENU-022'), (SELECT id FROM inventory_items WHERE item_code = 'INV-000025'), 0.02, 'kg', 'Coffee beans');

-- Insert Restaurant Tables
INSERT INTO restaurant_tables (table_number, table_name, seating_capacity, section, is_wheelchair_accessible, has_view) VALUES
('T01', 'Table 1', 2, 'Main Dining', true, false),
('T02', 'Table 2', 4, 'Main Dining', true, false),
('T03', 'Table 3', 4, 'Main Dining', true, true),
('T04', 'Table 4', 6, 'Main Dining', true, true),
('T05', 'Table 5', 2, 'Main Dining', true, false),
('T06', 'Table 6', 4, 'Main Dining', false, false),
('T07', 'Table 7', 8, 'Main Dining', true, true),
('T08', 'Table 8', 2, 'Main Dining', true, false),
('B01', 'Bar Stool 1', 1, 'Bar Area', true, false),
('B02', 'Bar Stool 2', 1, 'Bar Area', true, false),
('B03', 'Bar Stool 3', 1, 'Bar Area', true, false),
('B04', 'Bar Stool 4', 1, 'Bar Area', true, false),
('B05', 'Bar Stool 5', 1, 'Bar Area', true, false),
('B06', 'Bar Stool 6', 1, 'Bar Area', true, false),
('P01', 'Private Table 1', 4, 'Private Dining', true, true),
('P02', 'Private Table 2', 6, 'Private Dining', true, true),
('O01', 'Outdoor Table 1', 4, 'Terrace', true, true),
('O02', 'Outdoor Table 2', 6, 'Terrace', true, true),
('O03', 'Outdoor Table 3', 2, 'Terrace', true, true),
('O04', 'Outdoor Table 4', 4, 'Terrace', true, true);

-- Insert Kitchen Stations
INSERT INTO kitchen_stations (station_name, station_type, assigned_staff, equipment_list) VALUES
('Main Grill', 'grill', '[]', '["Gas Grill", "Charcoal Grill", "Grill Tools"]'),
('Fry Station', 'fryer', '[]', '["Deep Fryer", "Oil Thermometer", "Frying Baskets"]'),
('Prep Station', 'prep', '[]', '["Cutting Boards", "Knives", "Food Processors"]'),
('Soup Station', 'prep', '[]', '["Large Pots", "Ladles", "Strainers"]'),
('Bar Station', 'bar', '[]', '["Cocktail Shakers", "Jiggers", "Strainers", "Glassware"]'),
('Coffee Station', 'prep', '[]', '["Espresso Machine", "Coffee Grinder", "Milk Frother"]'),
('Expedite', 'expedite', '[]', '["Heat Lamps", "Order Tickets", "Plating Area"]');

-- Insert some sample vendors for purchasing
INSERT INTO vendors (vendor_code, vendor_name, vendor_type, contact_person, email, phone, address, city, state, country, payment_terms) VALUES
('VEN-001', 'Fresh Foods Suppliers Ltd', 'food_supplier', 'John Adebayo', 'john@freshfoods.ng', '+234-801-234-5678', '123 Market Street', 'Lagos', 'Lagos', 'Nigeria', 'Net 30 days'),
('VEN-002', 'Premium Beverages Co', 'beverage_supplier', 'Mary Okafor', 'mary@premiumbev.ng', '+234-802-345-6789', '456 Industrial Avenue', 'Lagos', 'Lagos', 'Nigeria', 'Net 15 days'),
('VEN-003', 'Kitchen Equipment Pro', 'equipment', 'David Okonkwo', 'david@kitchenpro.ng', '+234-803-456-7890', '789 Equipment Road', 'Lagos', 'Lagos', 'Nigeria', 'Net 45 days'),
('VEN-004', 'Spice World Nigeria', 'food_supplier', 'Sarah Ibrahim', 'sarah@spiceworld.ng', '+234-804-567-8901', '321 Spice Lane', 'Kano', 'Kano', 'Nigeria', 'Net 30 days'),
('VEN-005', 'Ocean Fresh Seafood', 'food_supplier', 'Peter Okoro', 'peter@oceanfresh.ng', '+234-805-678-9012', '654 Harbor View', 'Lagos', 'Lagos', 'Nigeria', 'Net 7 days');

-- Update inventory items with supplier references
UPDATE inventory_items SET primary_supplier_id = (SELECT id FROM vendors WHERE vendor_code = 'VEN-001') WHERE category_id IN (SELECT id FROM inventory_categories WHERE category_type = 'food');
UPDATE inventory_items SET primary_supplier_id = (SELECT id FROM vendors WHERE vendor_code = 'VEN-002') WHERE category_id IN (SELECT id FROM inventory_categories WHERE category_type = 'beverage');

-- Insert some sample daily specials
INSERT INTO daily_specials (menu_item_id, special_date, special_price, discount_percentage, available_quantity, promotion_description) VALUES
((SELECT id FROM menu_items WHERE item_code = 'MENU-007'), CURRENT_DATE, 3200, 15.79, 20, 'Friday Special - Jollof Rice & Chicken'),
((SELECT id FROM menu_items WHERE item_code = 'MENU-004'), CURRENT_DATE, 3000, 14.29, 15, 'Fresh Pepper Soup Special'),
((SELECT id FROM menu_items WHERE item_code = 'MENU-013'), CURRENT_DATE, 2000, 20.00, 30, 'Happy Hour Mojito');

COMMIT;
