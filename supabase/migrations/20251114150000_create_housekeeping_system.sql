-- Create comprehensive housekeeping system
-- This migration creates the database structure for the complete housekeeping workflow

-- Add new room statuses for housekeeping workflow
DO $$ BEGIN
  ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'needs_cleaning';
  ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'assigned_housekeeper';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create housekeeping_tasks table
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  task_type task_type NOT NULL DEFAULT 'cleaning',
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  title text NOT NULL,
  description text,
  notes text,
  special_instructions text,
  estimated_duration integer, -- in minutes
  actual_duration integer, -- in minutes
  scheduled_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;

-- Create housekeeping_task_logs table for tracking progress
CREATE TABLE IF NOT EXISTS housekeeping_task_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES housekeeping_tasks(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL, -- 'assigned', 'started', 'progress_update', 'completed', 'cancelled'
  notes text,
  logged_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE housekeeping_task_logs ENABLE ROW LEVEL SECURITY;

-- Create housekeeping_checklists table for room cleaning standards
CREATE TABLE IF NOT EXISTS housekeeping_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  room_type_id uuid REFERENCES room_types(id) ON DELETE CASCADE,
  task_type task_type NOT NULL DEFAULT 'cleaning',
  checklist_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_duration integer DEFAULT 30, -- in minutes
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE housekeeping_checklists ENABLE ROW LEVEL SECURITY;

-- Create housekeeping_task_completions table for tracking checklist completion
CREATE TABLE IF NOT EXISTS housekeeping_task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES housekeeping_tasks(id) ON DELETE CASCADE NOT NULL,
  checklist_id uuid REFERENCES housekeeping_checklists(id) ON DELETE CASCADE,
  completed_items jsonb DEFAULT '[]'::jsonb,
  completion_notes text,
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  completed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE housekeeping_task_completions ENABLE ROW LEVEL SECURITY;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_room_id ON housekeeping_tasks(room_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_assigned_to ON housekeeping_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_status ON housekeeping_tasks(status);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_scheduled_date ON housekeeping_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_housekeeping_task_logs_task_id ON housekeeping_task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_checklists_room_type_id ON housekeeping_checklists(room_type_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_task_completions_task_id ON housekeeping_task_completions(task_id);

-- Create function to automatically update room status when task status changes
CREATE OR REPLACE FUNCTION update_room_status_on_task_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When task is assigned, update room status to 'assigned_housekeeper'
  IF NEW.status = 'in_progress' AND OLD.status = 'pending' AND NEW.assigned_to IS NOT NULL THEN
    UPDATE rooms 
    SET status = 'assigned_housekeeper' 
    WHERE id = NEW.room_id;
    
    -- Log the assignment
    INSERT INTO housekeeping_task_logs (task_id, action, notes, logged_by)
    VALUES (NEW.id, 'assigned', 'Task assigned to housekeeper', NEW.assigned_to);
    
  -- When task is started, log the start
  ELSIF NEW.started_at IS NOT NULL AND OLD.started_at IS NULL THEN
    INSERT INTO housekeeping_task_logs (task_id, action, notes, logged_by)
    VALUES (NEW.id, 'started', 'Cleaning started', NEW.assigned_to);
    
  -- When task is completed, update room status to 'available'
  ELSIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE rooms 
    SET status = 'available' 
    WHERE id = NEW.room_id;
    
    -- Log the completion
    INSERT INTO housekeeping_task_logs (task_id, action, notes, logged_by)
    VALUES (NEW.id, 'completed', 'Cleaning completed', NEW.assigned_to);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic room status updates
DROP TRIGGER IF EXISTS housekeeping_task_status_trigger ON housekeeping_tasks;
CREATE TRIGGER housekeeping_task_status_trigger
  AFTER UPDATE ON housekeeping_tasks
  FOR EACH ROW EXECUTE FUNCTION update_room_status_on_task_change();

-- Create function to get available housekeepers
CREATE OR REPLACE FUNCTION get_available_housekeepers()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  active_tasks_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.email,
    COALESCE(task_counts.active_tasks, 0) as active_tasks_count
  FROM profiles p
  LEFT JOIN (
    SELECT 
      assigned_to,
      COUNT(*) as active_tasks
    FROM housekeeping_tasks 
    WHERE status IN ('pending', 'in_progress') 
    GROUP BY assigned_to
  ) task_counts ON p.id = task_counts.assigned_to
  WHERE p.role = 'housekeeping' 
    AND p.is_active = true
  ORDER BY active_tasks_count ASC, p.full_name;
END;
$$ LANGUAGE plpgsql;

-- Create function to assign task to housekeeper
CREATE OR REPLACE FUNCTION assign_housekeeping_task(
  task_id_param uuid,
  housekeeper_id_param uuid
)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Update the task
  UPDATE housekeeping_tasks 
  SET 
    assigned_to = housekeeper_id_param,
    status = 'in_progress',
    updated_at = now()
  WHERE id = task_id_param;
  
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'message', 'Task assigned successfully'
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'message', SQLERRM
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to complete housekeeping task
CREATE OR REPLACE FUNCTION complete_housekeeping_task(
  task_id_param uuid,
  completion_notes_param text DEFAULT NULL,
  quality_rating_param integer DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  result json;
  task_record housekeeping_tasks%ROWTYPE;
BEGIN
  -- Get the task record
  SELECT * INTO task_record FROM housekeeping_tasks WHERE id = task_id_param;
  
  IF NOT FOUND THEN
    SELECT json_build_object(
      'success', false,
      'message', 'Task not found'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Update the task as completed
  UPDATE housekeeping_tasks 
  SET 
    status = 'completed',
    completed_at = now(),
    actual_duration = CASE 
      WHEN started_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (now() - started_at))/60 
      ELSE NULL 
    END,
    notes = COALESCE(completion_notes_param, notes),
    updated_at = now()
  WHERE id = task_id_param;
  
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'message', 'Task completed successfully',
    'room_id', task_record.room_id
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'message', SQLERRM
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for housekeeping_tasks
CREATE POLICY "Housekeeping staff can view their assigned tasks"
  ON housekeeping_tasks FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist')
    )
  );

CREATE POLICY "Admins and managers can manage all housekeeping tasks"
  ON housekeeping_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Receptionists can create and assign housekeeping tasks"
  ON housekeeping_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist')
    )
  );

CREATE POLICY "Housekeeping staff can update their assigned tasks"
  ON housekeeping_tasks FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist')
    )
  );

-- RLS Policies for housekeeping_task_logs
CREATE POLICY "Anyone can view task logs for tasks they can see"
  ON housekeeping_task_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM housekeeping_tasks ht
      WHERE ht.id = task_id AND (
        ht.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist')
        )
      )
    )
  );

CREATE POLICY "System can insert task logs"
  ON housekeeping_task_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for housekeeping_checklists
CREATE POLICY "Anyone can view active checklists"
  ON housekeeping_checklists FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins and managers can manage checklists"
  ON housekeeping_checklists FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for housekeeping_task_completions
CREATE POLICY "Anyone can view completions for tasks they can see"
  ON housekeeping_task_completions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM housekeeping_tasks ht
      WHERE ht.id = task_id AND (
        ht.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist')
        )
      )
    )
  );

CREATE POLICY "Housekeeping staff can create completions for their tasks"
  ON housekeeping_task_completions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM housekeeping_tasks ht
      WHERE ht.id = task_id AND ht.assigned_to = auth.uid()
    )
  );

-- Insert default cleaning checklist
INSERT INTO housekeeping_checklists (name, description, task_type, checklist_items, estimated_duration) VALUES
('Standard Room Cleaning', 'Standard cleaning checklist for all room types', 'cleaning', 
'[
  {"id": "bed", "task": "Make bed with fresh linens", "required": true},
  {"id": "bathroom", "task": "Clean and sanitize bathroom", "required": true},
  {"id": "vacuum", "task": "Vacuum carpets and floors", "required": true},
  {"id": "dust", "task": "Dust all surfaces", "required": true},
  {"id": "trash", "task": "Empty trash bins", "required": true},
  {"id": "towels", "task": "Replace towels", "required": true},
  {"id": "amenities", "task": "Restock amenities", "required": true},
  {"id": "inspect", "task": "Final inspection", "required": true}
]'::jsonb, 30),

('Deep Cleaning', 'Deep cleaning checklist for maintenance rooms', 'cleaning',
'[
  {"id": "bed", "task": "Make bed with fresh linens", "required": true},
  {"id": "bathroom", "task": "Deep clean and sanitize bathroom", "required": true},
  {"id": "vacuum", "task": "Vacuum carpets and mop floors", "required": true},
  {"id": "dust", "task": "Dust all surfaces including baseboards", "required": true},
  {"id": "windows", "task": "Clean windows and mirrors", "required": true},
  {"id": "trash", "task": "Empty trash bins", "required": true},
  {"id": "towels", "task": "Replace all linens and towels", "required": true},
  {"id": "amenities", "task": "Restock all amenities", "required": true},
  {"id": "appliances", "task": "Clean appliances", "required": false},
  {"id": "inspect", "task": "Thorough final inspection", "required": true}
]'::jsonb, 60);
