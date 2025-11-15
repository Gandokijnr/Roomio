-- =====================================================
-- RESTAURANT & BAR OPERATIONS MANAGEMENT SCHEMA
-- =====================================================
-- Complete database schema for restaurant and bar operations
-- including inventory management, menu management, orders, and reporting

-- =====================================================
-- 1. MENU CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_type VARCHAR(20) CHECK (category_type IN ('food', 'beverage', 'both')) DEFAULT 'both',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. MENU ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) DEFAULT 0,
  profit_margin DECIMAL(5,2),
  
  -- Item details
  item_type VARCHAR(20) CHECK (item_type IN ('food', 'beverage', 'combo')) NOT NULL,
  preparation_time INTEGER DEFAULT 15, -- in minutes
  calories INTEGER,
  allergens JSONB DEFAULT '[]'::jsonb,
  dietary_info JSONB DEFAULT '[]'::jsonb, -- vegetarian, vegan, gluten-free, etc.
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  availability_schedule JSONB, -- days and times when available
  
  -- Media
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Inventory tracking
  track_inventory BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 10,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. INVENTORY CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_type VARCHAR(20) CHECK (category_type IN ('food', 'beverage', 'supplies', 'equipment')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. INVENTORY ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES inventory_categories(id) ON DELETE RESTRICT,
  
  -- Units and measurements
  unit_of_measure VARCHAR(20) NOT NULL, -- kg, liters, pieces, bottles, etc.
  conversion_factor DECIMAL(10,4) DEFAULT 1.0000, -- for unit conversions
  
  -- Stock levels
  current_stock DECIMAL(10,2) DEFAULT 0,
  minimum_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  maximum_stock DECIMAL(10,2),
  reorder_point DECIMAL(10,2),
  
  -- Pricing
  unit_cost DECIMAL(10,2) DEFAULT 0,
  average_cost DECIMAL(10,2) DEFAULT 0,
  last_purchase_price DECIMAL(10,2),
  
  -- Supplier info
  primary_supplier_id UUID REFERENCES vendors(id),
  supplier_item_code VARCHAR(100),
  
  -- Storage requirements
  storage_location VARCHAR(100),
  storage_temperature VARCHAR(50), -- ambient, refrigerated, frozen
  shelf_life_days INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. RECIPE INGREDIENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  quantity_required DECIMAL(10,4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(menu_item_id, inventory_item_id)
);

-- =====================================================
-- 6. RESTAURANT ORDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS restaurant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer info
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  table_number VARCHAR(20),
  room_number VARCHAR(20), -- for room service
  
  -- Order details
  order_type VARCHAR(20) CHECK (order_type IN ('dine_in', 'room_service', 'takeaway', 'delivery')) NOT NULL,
  order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN (
    'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'
  )),
  
  -- Timing
  order_time TIMESTAMP DEFAULT NOW(),
  estimated_ready_time TIMESTAMP,
  actual_ready_time TIMESTAMP,
  served_time TIMESTAMP,
  
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  service_charge DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Payment
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'partial', 'refunded'
  )),
  payment_method VARCHAR(30),
  
  -- Staff assignments
  taken_by UUID REFERENCES profiles(id),
  prepared_by UUID REFERENCES profiles(id),
  served_by UUID REFERENCES profiles(id),
  
  -- Additional info
  special_instructions TEXT,
  customer_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. RESTAURANT ORDER ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS restaurant_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES restaurant_orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  
  -- Quantity and pricing
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Customizations
  modifications TEXT,
  special_requests TEXT,
  
  -- Status tracking
  item_status VARCHAR(20) DEFAULT 'pending' CHECK (item_status IN (
    'pending', 'preparing', 'ready', 'served', 'cancelled'
  )),
  
  -- Timing
  preparation_started_at TIMESTAMP,
  ready_at TIMESTAMP,
  served_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. INVENTORY TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Transaction details
  transaction_type VARCHAR(20) CHECK (transaction_type IN (
    'purchase', 'usage', 'adjustment', 'waste', 'transfer', 'return'
  )) NOT NULL,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  
  -- Quantities
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Before/after stock levels
  stock_before DECIMAL(10,2),
  stock_after DECIMAL(10,2),
  
  -- References
  reference_type VARCHAR(50), -- purchase_order, restaurant_order, adjustment, etc.
  reference_id UUID,
  supplier_id UUID REFERENCES vendors(id),
  
  -- Additional info
  notes TEXT,
  batch_number VARCHAR(100),
  expiry_date DATE,
  
  -- Metadata
  processed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 9. PURCHASE ORDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Supplier details
  supplier_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  
  -- Order details
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'confirmed', 'partial_received', 'received', 'cancelled'
  )),
  
  -- Amounts
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  
  -- Additional info
  notes TEXT,
  terms_and_conditions TEXT,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  received_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 10. PURCHASE ORDER ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  
  -- Order quantities
  quantity_ordered DECIMAL(10,2) NOT NULL,
  quantity_received DECIMAL(10,2) DEFAULT 0,
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Additional info
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 11. RESTAURANT TABLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number VARCHAR(20) UNIQUE NOT NULL,
  table_name VARCHAR(100),
  
  -- Capacity
  seating_capacity INTEGER NOT NULL DEFAULT 2,
  
  -- Location
  section VARCHAR(50), -- main dining, bar area, terrace, etc.
  location_description TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN (
    'available', 'occupied', 'reserved', 'cleaning', 'maintenance'
  )),
  
  -- Features
  is_smoking_allowed BOOLEAN DEFAULT false,
  has_view BOOLEAN DEFAULT false,
  is_wheelchair_accessible BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 12. TABLE RESERVATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS table_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer details
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name VARCHAR(200) NOT NULL,
  guest_phone VARCHAR(20),
  guest_email VARCHAR(255),
  
  -- Reservation details
  table_id UUID NOT NULL REFERENCES restaurant_tables(id) ON DELETE RESTRICT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  
  -- Status
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN (
    'confirmed', 'seated', 'completed', 'cancelled', 'no_show'
  )),
  
  -- Additional info
  special_requests TEXT,
  occasion VARCHAR(100), -- birthday, anniversary, business, etc.
  
  -- Timing
  actual_arrival_time TIMESTAMP,
  seated_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 13. DAILY SPECIALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Schedule
  special_date DATE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  
  -- Pricing
  special_price DECIMAL(10,2),
  discount_percentage DECIMAL(5,2),
  
  -- Availability
  available_quantity INTEGER,
  sold_quantity INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Additional info
  promotion_description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(menu_item_id, special_date)
);

-- =====================================================
-- 14. KITCHEN STATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS kitchen_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_name VARCHAR(100) NOT NULL,
  station_type VARCHAR(50) CHECK (station_type IN (
    'grill', 'fryer', 'salad', 'dessert', 'bar', 'prep', 'expedite'
  )) NOT NULL,
  
  -- Staff assignment
  assigned_staff JSONB DEFAULT '[]'::jsonb, -- array of staff IDs
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Equipment
  equipment_list JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Menu items
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON menu_items(item_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_code ON menu_items(item_code);

-- Inventory items
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_code ON inventory_items(item_code);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(current_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(primary_supplier_id);

-- Restaurant orders
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_guest ON restaurant_orders(guest_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_status ON restaurant_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_type ON restaurant_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_date ON restaurant_orders(order_time DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_number ON restaurant_orders(order_number);

-- Inventory transactions
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(created_at DESC);

-- Purchase orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(order_date DESC);

-- Restaurant tables
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_status ON restaurant_tables(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_section ON restaurant_tables(section);

-- Table reservations
CREATE INDEX IF NOT EXISTS idx_table_reservations_table ON table_reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_table_reservations_date ON table_reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_table_reservations_status ON table_reservations(status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_stations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update inventory after order items are added
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  ingredient RECORD;
BEGIN
  -- Only process when order item status changes to 'preparing'
  IF NEW.item_status = 'preparing' AND (OLD.item_status IS NULL OR OLD.item_status != 'preparing') THEN
    -- Deduct ingredients from inventory
    FOR ingredient IN 
      SELECT ri.inventory_item_id, ri.quantity_required * NEW.quantity as total_needed
      FROM recipe_ingredients ri
      WHERE ri.menu_item_id = NEW.menu_item_id
    LOOP
      -- Create inventory transaction
      INSERT INTO inventory_transactions (
        transaction_number,
        transaction_type,
        inventory_item_id,
        quantity,
        reference_type,
        reference_id,
        processed_by,
        stock_before,
        stock_after
      )
      SELECT 
        'ORD-' || NEW.order_id || '-' || NEW.id,
        'usage',
        ingredient.inventory_item_id,
        -ingredient.total_needed,
        'restaurant_order_item',
        NEW.id,
        (SELECT taken_by FROM restaurant_orders WHERE id = NEW.order_id),
        ii.current_stock,
        ii.current_stock - ingredient.total_needed
      FROM inventory_items ii
      WHERE ii.id = ingredient.inventory_item_id;
      
      -- Update inventory stock
      UPDATE inventory_items 
      SET 
        current_stock = current_stock - ingredient.total_needed,
        updated_at = NOW()
      WHERE id = ingredient.inventory_item_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory updates
CREATE TRIGGER update_inventory_on_order_trigger
  AFTER INSERT OR UPDATE ON restaurant_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_order();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create trigger for auto-generating order numbers
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON restaurant_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Function to generate PO numbers
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.po_number IS NULL THEN
    NEW.po_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('po_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for PO numbers
CREATE SEQUENCE IF NOT EXISTS po_number_seq START 1;

-- Create trigger for auto-generating PO numbers
CREATE TRIGGER generate_po_number_trigger
  BEFORE INSERT ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_po_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_orders_updated_at
  BEFORE UPDATE ON restaurant_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_tables_updated_at
  BEFORE UPDATE ON restaurant_tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_table_reservations_updated_at
  BEFORE UPDATE ON table_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
