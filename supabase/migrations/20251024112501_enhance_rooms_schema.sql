-- Enhance rooms schema to support comprehensive room management features

-- Add missing columns to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_name text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 2;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS amenities jsonb DEFAULT '[]'::jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS featured_image text;

-- Update room_status enum to include 'out_of_service'
DO $$ BEGIN
  ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'out_of_service';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create room_images table for multiple image support
CREATE TABLE IF NOT EXISTS room_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_name text,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE room_images ENABLE ROW LEVEL SECURITY;

-- Create room_audit_log table for tracking changes
CREATE TABLE IF NOT EXISTS room_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed'
  old_values jsonb,
  new_values jsonb,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE room_audit_log ENABLE ROW LEVEL SECURITY;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type_id ON rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON rooms(floor);
CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON room_images(room_id);
CREATE INDEX IF NOT EXISTS idx_room_audit_log_room_id ON room_audit_log(room_id);

-- Create function to log room changes
CREATE OR REPLACE FUNCTION log_room_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO room_audit_log (room_id, action, new_values, changed_by)
    VALUES (NEW.id, 'created', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO room_audit_log (room_id, action, old_values, new_values, changed_by)
    VALUES (NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO room_audit_log (room_id, action, old_values, changed_by)
    VALUES (OLD.id, 'deleted', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging
DROP TRIGGER IF EXISTS room_audit_trigger ON rooms;
CREATE TRIGGER room_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON rooms
  FOR EACH ROW EXECUTE FUNCTION log_room_changes();

-- RLS Policies for room_images
CREATE POLICY "Anyone can view room images"
  ON room_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage room images"
  ON room_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for room_audit_log
CREATE POLICY "Admins can view all room audit logs"
  ON room_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Managers can view room audit logs"
  ON room_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Update existing rooms policies to include new fields
DROP POLICY IF EXISTS "Anyone can view rooms" ON rooms;
CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins and managers can manage rooms" ON rooms;
CREATE POLICY "Admins and managers can manage rooms"
  ON rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Receptionists can update room status"
  ON rooms FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist')
    )
  );

CREATE POLICY "Housekeeping can update room status"
  ON rooms FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'housekeeping')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'housekeeping')
    )
  );
