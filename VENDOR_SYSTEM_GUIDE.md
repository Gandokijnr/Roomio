# Vendor Management System Guide

## What is a Vendor?

A **Vendor** (also called Supplier) is any business or individual that provides goods or services to your hotel. The vendor system helps you:

- **Track who you buy from** - Keep organized records of all suppliers
- **Link expenses to vendors** - See all expenses from each vendor
- **Manage contact information** - Store vendor details, payment terms, and bank info
- **Analyze spending** - Identify your top vendors and spending patterns
- **Maintain relationships** - Track payment terms, credit limits, and notes

## Vendor Types

The system supports these vendor categories:

| Type | Examples |
|------|----------|
| **Food Supplier** | Grocery stores, meat suppliers, produce vendors |
| **Beverage Supplier** | Drink distributors, wine suppliers |
| **Maintenance** | Plumbers, electricians, HVAC technicians |
| **Utilities** | Electricity company, water company, internet provider |
| **Cleaning Supplies** | Detergent suppliers, cleaning equipment vendors |
| **Equipment** | Furniture suppliers, appliance vendors |
| **Professional Service** | Accountants, lawyers, consultants |
| **Other** | Any other vendor type |

## How to Use the Vendor System

### 1. **Add a New Vendor**

**Navigate to:** 
- Go to the Expenses page (`/expenses`)
- Click the **"🏢 Manage Vendors"** button in the header, OR
- Click the **"Vendors"** tab below the header

**Steps:**
1. Click **"+ Add Vendor"** button (top right of vendors page)
2. Fill in the required fields:
   - **Vendor Name** (required) - e.g., "ABC Food Supplies Ltd"
   - **Vendor Type** (required) - Select from dropdown
3. Optional but recommended:
   - **Contact Person** - Name of your contact
   - **Email & Phone** - For communication
   - **Payment Terms** - e.g., "Net 30", "Cash on Delivery"
   - **Bank Details** - For making payments
   - **Credit Limit** - Maximum credit allowed
4. Click **"Save Vendor"**

### 2. **Link Vendor to Expenses**

When recording an expense on the `/expenses` page:

1. Click **"+ Add Expense"**
2. In the expense form, find the **"Vendor"** dropdown
3. Select the vendor from the list
4. Complete the rest of the expense details
5. Save

**Example:**
```
Expense: Monthly electricity bill
Vendor: Lagos Electricity Distribution Company
Amount: ₦50,000
Category: Utilities
```

### 3. **View Vendor Expenses**

**Option A - From Vendor Page:**
1. Go to `/expenses/vendors`
2. Find the vendor card
3. Click **"View Expenses"** button
4. See all expenses linked to that vendor

**Option B - From Expenses Page:**
1. Go to `/expenses`
2. Look at the "Vendor" column in the table
3. Each expense shows the vendor name

### 4. **Edit Vendor Information**

1. Go to `/expenses/vendors`
2. Find the vendor card
3. Click **"Edit"** button
4. Update any information
5. Click **"Save Vendor"**

### 5. **Filter Vendors**

On the vendor page, you can filter by:
- **Vendor Type** - Show only specific types
- **Status** - Active, Inactive, or Suspended

## Vendor Information Fields

### Basic Information
- **Vendor Name** - Business name
- **Vendor Code** - Auto-generated unique identifier (e.g., VEN-1234567890-ABCD)
- **Vendor Type** - Category of vendor
- **Status** - Active, Inactive, or Suspended

### Contact Details
- **Contact Person** - Your main contact
- **Email** - For sending purchase orders
- **Phone** - For quick communication
- **Address, City, State** - Physical location

### Business Details
- **Tax ID** - Tax identification number
- **Registration Number** - Business registration
- **Payment Terms** - When payment is due (e.g., Net 30, Net 60)
- **Credit Limit** - Maximum credit you'll extend

### Banking Information
- **Bank Name** - Vendor's bank
- **Account Number** - For transfers
- **Account Name** - Account holder name

### Additional
- **Notes** - Any special notes about the vendor
- **Rating** - Quality rating (1-5 stars)

## Benefits of Using Vendors

### 1. **Better Expense Tracking**
```
Without Vendors:
- Expense: ₦50,000 for "Food supplies"
- Hard to track which supplier

With Vendors:
- Expense: ₦50,000 from "ABC Food Supplies"
- Easy to see all ABC Food Supplies expenses
```

### 2. **Vendor Analysis**
- See total spending per vendor
- Identify your top vendors
- Track payment history
- Manage vendor relationships

### 3. **Organized Records**
- All vendor contact info in one place
- Payment terms readily available
- Bank details for easy transfers
- Historical expense data

### 4. **Better Budgeting**
- Forecast expenses based on vendor history
- Negotiate better rates with high-volume vendors
- Identify opportunities to consolidate vendors

## Example Workflow

### Scenario: Monthly Electricity Bill

**Step 1: Create Vendor (One-time setup)**
```
Vendor Name: Lagos Electricity Distribution Company
Type: Utilities
Contact Person: Customer Service
Phone: 0700-EKEDC-123
Payment Terms: Monthly
Status: Active
```

**Step 2: Record Monthly Expense**
```
Date: October 25, 2025
Category: Utilities
Vendor: Lagos Electricity Distribution Company (select from dropdown)
Amount: ₦50,000
Description: October electricity bill
Payment Status: Unpaid
```

**Step 3: View Vendor History**
- Go to Vendors page
- Click "View Expenses" on EKEDC card
- See all monthly bills: Sept (₦48,000), Aug (₦52,000), etc.

## Tips for Best Practices

### 1. **Create Vendors First**
Before recording expenses, set up your common vendors. This makes expense entry faster.

### 2. **Use Consistent Naming**
- ✅ "ABC Food Supplies Ltd"
- ❌ "ABC Food", "ABC Supplies", "ABC Ltd" (creates confusion)

### 3. **Keep Contact Info Updated**
Update vendor details when contacts change to avoid communication issues.

### 4. **Use Payment Terms**
Record payment terms to track when bills are due:
- "Net 30" = Payment due in 30 days
- "Net 60" = Payment due in 60 days
- "COD" = Cash on Delivery

### 5. **Track Credit Limits**
Set credit limits to avoid over-extending credit to vendors.

### 6. **Regular Reviews**
- Mark inactive vendors as "Inactive"
- Review vendor performance periodically
- Consolidate vendors where possible

## Common Questions

**Q: Do I need to create a vendor for every expense?**
A: No, vendors are optional. Use them for recurring suppliers or when you want to track spending by vendor.

**Q: Can I have multiple expenses for one vendor?**
A: Yes! That's the main benefit. Link all expenses to the same vendor to track total spending.

**Q: What if I don't know the vendor when recording an expense?**
A: Leave the vendor field empty. You can add it later by editing the expense.

**Q: Can I delete a vendor?**
A: Currently, you can mark vendors as "Inactive" or "Suspended" instead of deleting them to preserve historical data.

**Q: How do I see my top vendors?**
A: Go to `/expenses/analytics` to see vendor spending analysis (if analytics page is set up).

## Navigation

- **View All Vendors:** `/expenses/vendors`
- **Add Expense with Vendor:** `/expenses` → Click "+ Add Expense" → Select Vendor
- **View Vendor Expenses:** Vendors page → Click "View Expenses" on vendor card

## Summary

The vendor system helps you:
1. ✅ Organize supplier information
2. ✅ Track expenses by vendor
3. ✅ Manage payment terms and banking details
4. ✅ Analyze spending patterns
5. ✅ Maintain better supplier relationships

Start by adding your most common vendors (utilities, food suppliers, maintenance companies), then link expenses to them as you record them.
