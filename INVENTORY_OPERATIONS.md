# Inventory Operations – Core Functions

This document describes the core inventory operations implemented in the Roomio F&B module: how items, stock, vendors, and purchase orders work together.

---

## 1. Inventory Items & Categories

### 1.1 Inventory Items

Inventory items represent everything you stock (food, beverages, supplies, equipment, etc.).

Key fields (table: `inventory_items`):

- `item_code` – unique code (e.g. SUG-001).
- `name`, `description`.
- `category_id` – FK to `inventory_categories`.
- `unit_of_measure` – e.g. kg, L, pieces, bottles.
- `current_stock` – current quantity on hand.
- `minimum_stock`, `maximum_stock`, `reorder_point`.
- `unit_cost`, `average_cost`, `last_purchase_price`.
- `primary_supplier_id` – FK to `vendors`.

APIs / UI:

- **Add item**  
  - UI: `InventoryItemModal` (from Inventory page).  
  - API: `POST /api/inventory/items`  
  - Inserts into `inventory_items` and may create an initial transaction.

- **Edit item**  
  - UI: `InventoryItemModal` in “edit” mode.  
  - API: `PATCH /api/inventory/items/:id`  
  - Updates fields like name, category, costs, thresholds, etc.

### 1.2 Inventory Categories

Categories group items by type (food, beverage, supplies, equipment).

Key fields (table: `inventory_categories`):

- `name`, `description`.
- `category_type` – `food`, `beverage`, `supplies`, `equipment`.

API:

- `GET /api/inventory/categories` – returns all categories for dropdowns in the UI.

---

## 2. Inventory Management Page (`/inventory`)

This is the main dashboard for inventory operations.

### 2.1 Header Actions

- **Add Item**  
  Opens `InventoryItemModal` to create a new inventory item.

- **Create Purchase Order**  
  Opens `PurchaseOrderModal` to request new stock from suppliers.

- **View Purchase Orders**  
  Navigates to `/inventory/purchase-orders`, the PO management page.

- **Manage Vendors**  
  Navigates to `/expenses/vendors`, the vendor management UI.

### 2.2 Stats Overview

Computed from live data on the page:

- **Total Items**  
  `inventory_items.length`.

- **Low Stock Items**  
  Count of items where:  
  `current_stock <= minimum_stock`.

- **Total Value**  
  Sum of `current_stock * unit_cost` over all items.

- **Pending Orders**  
  Number of purchase orders that are not yet fully received or cancelled.

  Loaded via:

  - `GET /api/purchase-orders?scope=pending`
  - Response includes `pendingCount`, which is shown as “Pending Orders”.

### 2.3 Filters & Search

- **Search**  
  Text search by item name or item code.

- **Category filter**  
  Filter by `category_id`.

- **Stock status filter**  
  - `in_stock`: `current_stock > minimum_stock`
  - `low_stock`: `0 < current_stock <= minimum_stock`
  - `out_of_stock`: `current_stock === 0`

### 2.4 Inventory Table

Each row in the inventory table shows:

- Name and item code.
- Category name.
- Current stock + unit of measure.
- Minimum stock.
- Unit cost.
- Total value for that item (`current_stock * unit_cost`).
- Stock status badge (In Stock, Low Stock, Out of Stock).

Actions per item:

- **Adjust Stock** – opens Stock Adjustment modal.
- **View Transactions** – opens Transaction History modal for that item.
- **Edit Item** – opens Inventory Item modal in edit mode.

---

## 3. Stock Adjustments & Inventory Transactions

All stock changes are captured in `inventory_transactions` for a complete audit trail.

### 3.1 Transactions Table

Table: `inventory_transactions`.

Key fields:

- `transaction_number` – unique identifier (VARCHAR(50)).
- `transaction_type` – `purchase`, `usage`, `adjustment`, `waste`, `transfer`, `return`.
- `inventory_item_id` – FK to `inventory_items`.
- `quantity` – positive or negative.
- `unit_cost`, `total_cost`.
- `stock_before`, `stock_after`.
- `reference_type` – e.g. `purchase_order`, `restaurant_order`, `manual_adjustment`.
- `reference_id` – ID of the related record.
- `supplier_id` – optional FK to `vendors`.
- `notes`, `batch_number`, `expiry_date`.
- `processed_by` – FK to `profiles` (who did the transaction).
- `created_at`.

### 3.2 Manual Stock Adjustments

UI: `StockAdjustmentModal`.

Flow:

1. User opens Adjust Stock from the inventory table.
2. Modal collects:
   - `transaction_type` (e.g. adjustment).
   - `inventory_item_id`.
   - `quantity` (positive or negative).
   - Optional fields like `unit_cost`, `notes`, etc.
3. Client calls:
   - `POST /api/inventory/transactions`

Backend:

- Validates required fields: `transaction_type`, `inventory_item_id`, numeric `quantity`, `processed_by`.
- Loads the current inventory item.
- Computes `stock_before` and `stock_after`.
- Determines `unit_cost` and `total_cost`.
- Inserts a row into `inventory_transactions`.
- Updates `inventory_items.current_stock` and `updated_at`.

### 3.3 Transaction History Per Item

UI: `TransactionHistoryModal`.

Flow:

- Opened via “View Transactions” from inventory table.
- Calls `GET /api/inventory/transactions?inventory_item_id=...`.
- Displays a list/table of transactions for that item with:
  - Date/time, type, quantity, stock before/after, and references.

This gives full visibility into how and why an item’s stock has changed.

---

## 4. Vendor Management

Vendors (suppliers) are managed centrally and reused for inventory and purchasing.

### 4.1 Vendors Table

Table: `vendors`.

Key concepts:

- Vendor code and name.
- Contact details, address, tax information.
- Payment terms and bank details.

UI: `/expenses/vendors` page.

- Uses [useExpenseTracking](cci:1://file:///c:/Users/Gandoki/Desktop/Roomio/composables/useExpenseTracking.ts:8:0-449:1) composable:
  - [createVendor](cci:1://file:///c:/Users/Gandoki/Desktop/Roomio/composables/useExpenseTracking.ts:216:2-242:3) – insert new vendor.
  - [getVendors](cci:1://file:///c:/Users/Gandoki/Desktop/Roomio/composables/useExpenseTracking.ts:266:2-292:3) – list vendors.
  - [updateVendor](cci:1://file:///c:/Users/Gandoki/Desktop/Roomio/composables/useExpenseTracking.ts:294:2-317:3) – edit vendor details.

### 4.2 Integration with Inventory & POs

- Inventory items can reference a primary supplier (`primary_supplier_id`).
- Purchase orders require a `supplier_id`.
- Supplier lists in modals are loaded via `GET /api/vendors`.

---

## 5. Purchase Orders (POs)

Purchase orders represent requests to suppliers to replenish stock.

### 5.1 Schema

Tables:

- `purchase_orders`:

  - `po_number` (VARCHAR(50), unique) – generated by a trigger (`PO-YYYYMMDD-####`).
  - `supplier_id` – FK to `vendors`.
  - `order_date`, `expected_delivery_date`, `actual_delivery_date`.
  - `status` – one of:
    - `draft`, `sent`, `confirmed`, `partial_received`, `received`, `cancelled`.
  - `subtotal`, `tax_amount`, `shipping_cost`, `total_amount`.
  - `notes`, `terms_and_conditions`.
  - `created_by`, `approved_by`, `received_by` – FKs to `profiles`.
  - `created_at`, `updated_at`.

- `purchase_order_items`:

  - `purchase_order_id` – FK to `purchase_orders`.
  - `inventory_item_id` – FK to `inventory_items`.
  - `quantity_ordered`, `quantity_received`.
  - `unit_price`, `total_price`.
  - `notes`.

### 5.2 Creating Purchase Orders

UI: `PurchaseOrderModal` from Inventory page.

Data collected:

- `supplier_id`, `expected_delivery_date`, `tax_amount`, `shipping_cost`, `notes`.
- Line items: `inventory_item_id`, `quantity_ordered`, `unit_price`, `total_price`.
- `created_by` is taken from the authenticated user’s profile (`useAuth()`).

API:

- `POST /api/purchase-orders`
  - Validates:
    - Required `supplier_id`.
    - At least one item.
    - Numeric `subtotal` and `total_amount`.
    - `created_by` present.
    - Each item has valid IDs and numeric quantities/prices.
  - Inserts into `purchase_orders` with:
    - `status: 'draft'` (new POs always start as draft/pending).
  - Inserts related `purchase_order_items`.
  - Returns the created PO and items.

Effect:

- Inventory is **not yet adjusted** at creation time.
- The “Pending Orders” stat on the Inventory dashboard increments based on this new draft order.

### 5.3 Listing & Filtering Purchase Orders

UI: `/inventory/purchase-orders`.

Features:

- Displays a table of purchase orders with:
  - PO number, supplier, order date, expected delivery date, status, total amount.
- Filters:
  - By `status` (draft, sent, confirmed, partial_received, received, cancelled).
  - By `supplier_id`.

API:

- `GET /api/purchase-orders`
  - Query params:
    - `scope` – `all` or `pending`.  
      - `pending` excludes `received` and `cancelled`.
    - `status` – optional, exact match filter.
    - `supplier_id` – optional, to filter by supplier.
  - Joins vendors:
    - `supplier: vendors(id, vendor_name)`
  - Returns:
    - `data` – array of purchase orders with supplier info.
    - `pendingCount`, `totalCount`.

The Inventory page uses `scope=pending` to show the number of pending orders.

### 5.4 Approving / Receiving Purchase Orders

Receiving a purchase order means approving it and updating inventory stock based on the items ordered.

UI:

- On `/inventory/purchase-orders` each row has a **Receive Order** button for eligible statuses (`draft`, `sent`, `confirmed`).
- When clicked:
  1. Confirms with the user.
  2. Calls `POST /api/purchase-orders/:id/approve` with:
     - `approver_id` = current user’s `profile.id` (`useAuth()`).

Backend: `POST /api/purchase-orders/[id]/approve`

Flow:

1. Validates:
   - `id` param is present.
   - `approver_id` in request body.
   - The purchase order exists and has items.
   - The status is not final (`received`, `partial_received`, `cancelled`).

2. For each `purchase_order_items` line:
   - Loads the corresponding `inventory_item`.
   - Computes:
     - `stock_before` = current inventory stock.
     - `quantity` = `quantity_ordered`.
     - `stock_after` = `stock_before + quantity`.
     - `unit_cost` = line `unit_price` or fallback to item `unit_cost`.
     - `total_cost` = line `total_price` or `quantity * unit_cost`.
   - Generates a `transaction_number` per line:
     - Based on PO number + line index, e.g. `PO-20251118-0001-L001`.
   - Inserts an `inventory_transactions` row with:
     - `transaction_type: 'purchase'`.
     - `reference_type: 'purchase_order'`.
     - `reference_id: purchase_order.id`.
     - `supplier_id: purchase_order.supplier_id`.
     - `processed_by: approver_id`.
     - `stock_before` and `stock_after`.
   - Updates `inventory_items`:
     - Sets `current_stock` to `stock_after`.
     - Updates `unit_cost`.
     - Touches `updated_at`.

3. Updates the purchase order:

   - `status: 'received'`.
   - `approved_by` and `received_by` = `approver_id`.
   - `actual_delivery_date` = current date.

4. Returns the updated PO with its items.

Effect:

- Inventory levels **increase** based on the received quantities.
- All movements are captured in `inventory_transactions`.
- The PO is now marked as `received` and is no longer counted as pending.

---

## 6. Metrics & Reporting Foundations

The system captures enough data to support detailed inventory and purchasing analytics:

- **Stock state** – via `inventory_items.current_stock`.
- **Stock movements** – via `inventory_transactions` (type, quantities, costs, references).
- **Purchasing** – via `purchase_orders` and `purchase_order_items`.
- **Supplier performance & spend** – via vendor links in POs and transactions.

These can be extended into dashboards (e.g. stock valuation over time, supplier spend, purchase vs usage analysis) using the existing schema and APIs.

---