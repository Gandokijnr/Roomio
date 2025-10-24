/*
  # Hotel Management Platform Database Schema

  ## Overview
  This migration creates the complete database structure for a full-featured hotel management platform.

  ## 1. New Tables

  ### `profiles`
  User profile information linked to Supabase auth.users
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `full_name` (text)
  - `phone` (text)
  - `role` (enum: admin, manager, receptionist, accountant, housekeeping)
  - `is_active` (boolean, default true)
  - `avatar_url` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `activity_logs`
  Track all user activities for audit purposes
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `action` (text) - Description of the action performed
  - `entity_type` (text) - Type of entity affected (room, reservation, guest, etc.)
  - `entity_id` (uuid, nullable) - ID of the affected entity
  - `metadata` (jsonb) - Additional context data
  - `created_at` (timestamptz)

  ### `room_types`
  Define different types of rooms available
  - `id` (uuid, primary key)
  - `name` (text) - e.g., Single, Double, Suite, Deluxe
  - `description` (text)
  - `base_price` (numeric) - Base price per night
  - `max_occupancy` (integer)
  - `amenities` (jsonb) - Array of amenities
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `rooms`
  Individual room inventory
  - `id` (uuid, primary key)
  - `room_number` (text, unique)
  - `room_type_id` (uuid, references room_types)
  - `floor` (integer)
  - `bed_type` (text) - e.g., King, Queen, Twin
  - `price_per_night` (numeric)
  - `status` (enum: available, occupied, reserved, maintenance, cleaning)
  - `description` (text)
  - `photos` (jsonb) - Array of photo URLs
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `guests`
  Guest profiles and information
  - `id` (uuid, primary key)
  - `first_name` (text)
  - `last_name` (text)
  - `email` (text, unique)
  - `phone` (text)
  - `id_type` (text) - e.g., Passport, Driver's License
  - `id_number` (text)
  - `address` (text)
  - `city` (text)
  - `country` (text)
  - `date_of_birth` (date)
  - `preferences` (jsonb) - Room preferences, dietary needs, etc.
  - `notes` (text) - Internal notes
  - `vip_status` (boolean, default false)
  - `total_visits` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `reservations`
  Booking and reservation management
  - `id` (uuid, primary key)
  - `reservation_number` (text, unique)
  - `guest_id` (uuid, references guests)
  - `room_id` (uuid, references rooms)
  - `check_in_date` (date)
  - `check_out_date` (date)
  - `actual_check_in` (timestamptz, nullable)
  - `actual_check_out` (timestamptz, nullable)
  - `number_of_guests` (integer)
  - `number_of_adults` (integer)
  - `number_of_children` (integer, default 0)
  - `status` (enum: pending, confirmed, checked_in, checked_out, cancelled, no_show)
  - `total_amount` (numeric)
  - `paid_amount` (numeric, default 0)
  - `special_requests` (text)
  - `booking_source` (text) - e.g., Direct, Booking.com, Expedia
  - `created_by` (uuid, references profiles)
  - `cancelled_at` (timestamptz, nullable)
  - `cancellation_reason` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `payments`
  Payment transactions and tracking
  - `id` (uuid, primary key)
  - `reservation_id` (uuid, references reservations)
  - `amount` (numeric)
  - `payment_method` (text) - e.g., Cash, Credit Card, Debit Card, Bank Transfer
  - `payment_status` (enum: pending, completed, failed, refunded)
  - `transaction_id` (text, nullable)
  - `payment_date` (timestamptz)
  - `notes` (text)
  - `processed_by` (uuid, references profiles)
  - `created_at` (timestamptz)

  ### `invoices`
  Invoice generation and management
  - `id` (uuid, primary key)
  - `invoice_number` (text, unique)
  - `reservation_id` (uuid, references reservations)
  - `guest_id` (uuid, references guests)
  - `issue_date` (date)
  - `due_date` (date)
  - `subtotal` (numeric)
  - `tax_amount` (numeric, default 0)
  - `discount_amount` (numeric, default 0)
  - `total_amount` (numeric)
  - `status` (enum: draft, sent, paid, overdue, cancelled)
  - `notes` (text)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `invoice_items`
  Line items for invoices
  - `id` (uuid, primary key)
  - `invoice_id` (uuid, references invoices)
  - `description` (text)
  - `quantity` (numeric, default 1)
  - `unit_price` (numeric)
  - `total_price` (numeric)
  - `created_at` (timestamptz)

  ### `housekeeping_tasks`
  Room cleaning and maintenance tracking
  - `id` (uuid, primary key)
  - `room_id` (uuid, references rooms)
  - `task_type` (enum: cleaning, maintenance, inspection)
  - `priority` (enum: low, medium, high, urgent)
  - `status` (enum: pending, in_progress, completed, cancelled)
  - `assigned_to` (uuid, references profiles)
  - `description` (text)
  - `notes` (text)
  - `scheduled_date` (date)
  - `completed_at` (timestamptz, nullable)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security

  - Enable RLS on all tables
  - Admin and Manager roles have full access
  - Receptionist can manage reservations, guests, and view rooms
  - Accountant can view and manage payments and invoices
  - Housekeeping can view and update housekeeping tasks
  - All roles can view their own profile

  ## 3. Indexes

  Created indexes on frequently queried columns for optimal performance:
  - reservation_number, guest_id, room_id, check_in_date, check_out_date
  - room_number, room_type_id, status
  - guest email and phone
  - invoice_number, payment transaction tracking

  ## 4. Important Notes

  - All monetary values use numeric type for precision
  - Timestamps use timestamptz for timezone awareness
  - JSONB columns for flexible storage of amenities, preferences, photos
  - Enums defined for consistent status values
  - Foreign key constraints maintain referential integrity
  - Automatic timestamp updates via triggers
*/

-- Create custom types (enums)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'manager', 'receptionist', 'accountant', 'housekeeping');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE room_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance', 'cleaning');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_type AS ENUM ('cleaning', 'maintenance', 'inspection');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role user_role NOT NULL DEFAULT 'receptionist',
  is_active boolean DEFAULT true,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Room types
CREATE TABLE IF NOT EXISTS room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  base_price numeric(10,2) NOT NULL,
  max_occupancy integer NOT NULL DEFAULT 2,
  amenities jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text UNIQUE NOT NULL,
  room_type_id uuid REFERENCES room_types(id) ON DELETE RESTRICT,
  floor integer NOT NULL,
  bed_type text NOT NULL,
  price_per_night numeric(10,2) NOT NULL,
  status room_status DEFAULT 'available',
  description text,
  photos jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Guests
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  phone text,
  id_type text,
  id_number text,
  address text,
  city text,
  country text,
  date_of_birth date,
  preferences jsonb DEFAULT '{}'::jsonb,
  notes text,
  vip_status boolean DEFAULT false,
  total_visits integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number text UNIQUE NOT NULL,
  guest_id uuid REFERENCES guests(id) ON DELETE RESTRICT,
  room_id uuid REFERENCES rooms(id) ON DELETE RESTRICT,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  actual_check_in timestamptz,
  actual_check_out timestamptz,
  number_of_guests integer NOT NULL DEFAULT 1,
  number_of_adults integer NOT NULL DEFAULT 1,
  number_of_children integer DEFAULT 0,
  status reservation_status DEFAULT 'pending',
  total_amount numeric(10,2) NOT NULL,
  paid_amount numeric(10,2) DEFAULT 0,
  special_requests text,
  booking_source text DEFAULT 'Direct',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT check_dates CHECK (check_out_date > check_in_date)
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE RESTRICT,
  amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  transaction_id text,
  payment_date timestamptz DEFAULT now(),
  notes text,
  processed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  reservation_id uuid REFERENCES reservations(id) ON DELETE RESTRICT,
  guest_id uuid REFERENCES guests(id) ON DELETE RESTRICT,
  issue_date date DEFAULT CURRENT_DATE,
  due_date date,
  subtotal numeric(10,2) NOT NULL,
  tax_amount numeric(10,2) DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  status invoice_status DEFAULT 'draft',
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Invoice items
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10,2) DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Housekeeping tasks
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  task_type task_type NOT NULL,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  description text NOT NULL,
  notes text,
  scheduled_date date DEFAULT CURRENT_DATE,
  completed_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_reservations_guest ON reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_reservations_room ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_payments_reservation ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_reservation ON invoices(reservation_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_housekeeping_room ON housekeeping_tasks(room_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_assigned ON housekeeping_tasks(assigned_to);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_room_types_updated_at ON room_types;
CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON room_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_housekeeping_tasks_updated_at ON housekeeping_tasks;
CREATE TRIGGER update_housekeeping_tasks_updated_at BEFORE UPDATE ON housekeeping_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Activity logs policies
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Authenticated users can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Room types policies
CREATE POLICY "Anyone can view room types"
  ON room_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage room types"
  ON room_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Rooms policies
CREATE POLICY "Anyone can view active rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins and managers can manage rooms"
  ON rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Housekeeping can update room status"
  ON rooms FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'housekeeping'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'housekeeping'
    )
  );

-- Guests policies
CREATE POLICY "Staff can view guests"
  ON guests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'accountant')
    )
  );

CREATE POLICY "Staff can manage guests"
  ON guests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist')
    )
  );

-- Reservations policies
CREATE POLICY "Staff can view reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'accountant')
    )
  );

CREATE POLICY "Receptionists can manage reservations"
  ON reservations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist')
    )
  );

-- Payments policies
CREATE POLICY "Staff can view payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'accountant')
    )
  );

CREATE POLICY "Authorized staff can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'accountant')
    )
  );

-- Invoices policies
CREATE POLICY "Staff can view invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'accountant')
    )
  );

CREATE POLICY "Authorized staff can manage invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'accountant')
    )
  );

-- Invoice items policies
CREATE POLICY "Staff can view invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'accountant')
    )
  );

CREATE POLICY "Authorized staff can manage invoice items"
  ON invoice_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'accountant')
    )
  );

-- Housekeeping tasks policies
CREATE POLICY "Staff can view housekeeping tasks"
  ON housekeeping_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'housekeeping')
    )
  );

CREATE POLICY "Managers can manage housekeeping tasks"
  ON housekeeping_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Housekeeping can update assigned tasks"
  ON housekeeping_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'housekeeping'
    ) AND assigned_to = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'housekeeping'
    ) AND assigned_to = auth.uid()
  );