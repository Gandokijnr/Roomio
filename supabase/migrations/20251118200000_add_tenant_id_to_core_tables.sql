-- Add tenant_id to core tables for multi-tenant support

-- Core user and activity tables
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

-- Core hotel operations
ALTER TABLE room_types
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE guests
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE housekeeping_tasks
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

-- Restaurant & bar / inventory operations
ALTER TABLE menu_categories
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE inventory_categories
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE inventory_transactions
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE restaurant_orders
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE restaurant_order_items
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE purchase_order_items
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE restaurant_tables
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE table_reservations
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE daily_specials
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE kitchen_stations
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

-- Accounting & finance tables
ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE financial_accounts
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE tax_rates
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE payment_splits
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

-- Indexes for tenant_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant_id ON activity_logs(tenant_id);

CREATE INDEX IF NOT EXISTS idx_room_types_tenant_id ON room_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rooms_tenant_id ON rooms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_guests_tenant_id ON guests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_tenant_id ON reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_tenant_id ON invoice_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_tenant_id ON housekeeping_tasks(tenant_id);

CREATE INDEX IF NOT EXISTS idx_menu_categories_tenant_id ON menu_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_id ON menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_tenant_id ON inventory_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_id ON inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_tenant_id ON inventory_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_tenant_id ON restaurant_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_order_items_tenant_id ON restaurant_order_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_id ON purchase_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_tenant_id ON purchase_order_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_tenant_id ON restaurant_tables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_table_reservations_tenant_id ON table_reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_daily_specials_tenant_id ON daily_specials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_stations_tenant_id ON kitchen_stations(tenant_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_tenant_id ON payment_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_id ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendors_tenant_id ON vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_budgets_tenant_id ON budgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_tenant_id ON financial_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tax_rates_tenant_id ON tax_rates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_splits_tenant_id ON payment_splits(tenant_id);
