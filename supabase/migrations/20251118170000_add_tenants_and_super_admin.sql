-- Add is_super_admin flag to profiles and create tenants table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  primary_contact_name text,
  primary_contact_email text,
  primary_contact_phone text,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('pending', 'trial', 'active', 'suspended')),
  subscription_plan text NOT NULL DEFAULT 'trial',
  date_joined timestamptz DEFAULT now(),
  onboarding_stage text DEFAULT 'invited',
  rooms_defined integer DEFAULT 0,
  storage_used_mb numeric(10,2) DEFAULT 0,
  last_active_at timestamptz,
  demo_request_id uuid REFERENCES demo_requests(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy: allow authenticated users to select tenants (Super Admin endpoints use service key)
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view tenants"
    ON tenants FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
