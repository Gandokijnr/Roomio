// =====================================================
// ACCOUNTING & FINANCE TYPES
// =====================================================

export type PaymentMethod = 
  | 'cash' 
  | 'card' 
  | 'bank_transfer' 
  | 'pos' 
  | 'mobile_money' 
  | 'paystack' 
  | 'stripe' 
  | 'flutterwave' 
  | 'check' 
  | 'other'

export type TransactionType = 'payment' | 'refund' | 'adjustment' | 'deposit'

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded'

export type PaymentCategory = 
  | 'room_rental' 
  | 'food_beverage' 
  | 'spa' 
  | 'gym' 
  | 'laundry' 
  | 'transportation' 
  | 'event_hall' 
  | 'bar' 
  | 'minibar' 
  | 'other'

export interface PaymentTransaction {
  id: string
  transaction_reference: string
  reservation_id?: string
  guest_id?: string
  invoice_id?: string
  transaction_type: TransactionType
  payment_method: PaymentMethod
  amount: number
  currency: string
  exchange_rate: number
  amount_in_base_currency: number
  status: PaymentStatus
  gateway_reference?: string
  gateway_response?: any
  description?: string
  payment_category: PaymentCategory
  processed_by?: string
  processed_at?: string
  notes?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export type InvoiceStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'partial' 
  | 'paid' 
  | 'overdue' 
  | 'cancelled' 
  | 'refunded'

export interface Invoice {
  id: string
  invoice_number: string
  reservation_id?: string
  guest_id?: string
  invoice_date: string
  due_date?: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  amount_paid: number
  balance_due: number
  currency: string
  status: InvoiceStatus
  payment_terms?: string
  notes?: string
  internal_notes?: string
  template_id?: string
  issued_by?: string
  sent_at?: string
  paid_at?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
}

export type InvoiceItemType = 
  | 'room' 
  | 'food' 
  | 'beverage' 
  | 'service' 
  | 'product' 
  | 'fee' 
  | 'tax' 
  | 'discount'

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  item_type: InvoiceItemType
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  discount_rate: number
  line_total: number
  reference_id?: string
  service_date?: string
  created_at: string
}

export type ExpenseCategory = 
  | 'salaries' 
  | 'utilities' 
  | 'maintenance' 
  | 'supplies' 
  | 'marketing' 
  | 'rent' 
  | 'insurance' 
  | 'taxes' 
  | 'equipment' 
  | 'food_supplies' 
  | 'cleaning_supplies' 
  | 'transportation' 
  | 'professional_fees' 
  | 'other'

export type ExpensePaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue'

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface Expense {
  id: string
  expense_number: string
  expense_date: string
  expense_category: ExpenseCategory
  vendor_id?: string
  amount: number
  tax_amount: number
  total_amount: number
  currency: string
  payment_method?: PaymentMethod
  payment_status: ExpensePaymentStatus
  payment_date?: string
  receipt_number?: string
  invoice_reference?: string
  description: string
  notes?: string
  attachments?: any
  is_recurring: boolean
  recurring_frequency?: RecurringFrequency
  next_occurrence?: string
  approved_by?: string
  approved_at?: string
  recorded_by: string
  department?: string
  created_at: string
  updated_at: string
}

export type VendorType = 
  | 'food_supplier' 
  | 'beverage_supplier' 
  | 'maintenance' 
  | 'utilities' 
  | 'cleaning_supplies' 
  | 'equipment' 
  | 'professional_service' 
  | 'other'

export type VendorStatus = 'active' | 'inactive' | 'suspended'

export interface Vendor {
  id: string
  vendor_code: string
  vendor_name: string
  vendor_type: VendorType
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country: string
  tax_id?: string
  registration_number?: string
  payment_terms?: string
  credit_limit?: number
  bank_name?: string
  account_number?: string
  account_name?: string
  status: VendorStatus
  notes?: string
  rating?: number
  created_at: string
  updated_at: string
}

export type BudgetStatus = 'draft' | 'active' | 'closed' | 'revised'

export interface Budget {
  id: string
  budget_year: number
  budget_month?: number
  budget_quarter?: number
  category: string
  subcategory?: string
  budgeted_amount: number
  actual_amount: number
  variance: number
  variance_percentage: number
  status: BudgetStatus
  notes?: string
  created_by?: string
  approved_by?: string
  created_at: string
  updated_at: string
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

export interface FinancialAccount {
  id: string
  account_code: string
  account_name: string
  account_type: AccountType
  account_category?: string
  parent_account_id?: string
  current_balance: number
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
}

export type TaxAppliesTo = 'rooms' | 'food' | 'services' | 'all'

export interface TaxRate {
  id: string
  tax_name: string
  tax_code: string
  tax_rate: number
  applies_to: TaxAppliesTo
  is_active: boolean
  effective_from: string
  effective_to?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface PaymentSplit {
  id: string
  transaction_id: string
  payment_method: PaymentMethod
  amount: number
  gateway_reference?: string
  created_at: string
}

// Dashboard & Analytics Types
export interface FinancialSummary {
  total_revenue: number
  total_expenses: number
  net_profit: number
  total_transactions: number
  pending_payments: number
  revenue_by_category: Record<string, number>
}

export interface RevenueByPeriod {
  period: string
  revenue: number
  expenses: number
  profit: number
}

export interface TopExpenseCategory {
  category: string
  total: number
  percentage: number
}

export interface PaymentMethodBreakdown {
  method: PaymentMethod
  count: number
  total_amount: number
  percentage: number
}

export interface OutstandingInvoice {
  invoice_id: string
  invoice_number: string
  guest_name: string
  amount_due: number
  days_overdue: number
  status: InvoiceStatus
}

// Request/Response Types
export interface ProcessPaymentRequest {
  reservation_id: string
  guest_id: string
  amount: number
  payment_method: PaymentMethod
  payment_category?: PaymentCategory
  description?: string
  processed_by?: string
  splits?: Array<{
    payment_method: PaymentMethod
    amount: number
  }>
}

export interface ProcessPaymentResponse {
  transaction_id: string
  transaction_reference: string
  status: PaymentStatus
  message: string
}

export interface CreateInvoiceRequest {
  reservation_id: string
  guest_id: string
  line_items: Array<{
    item_type: InvoiceItemType
    description: string
    quantity: number
    unit_price: number
    tax_rate?: number
    discount_rate?: number
  }>
  notes?: string
  payment_terms?: string
}

export interface ProcessRefundRequest {
  original_transaction_id: string
  refund_amount: number
  reason: string
  processed_by: string
}

export interface FinancialReportFilters {
  start_date: string
  end_date: string
  category?: string
  payment_method?: PaymentMethod
  status?: PaymentStatus
  department?: string
}

export interface ExportFormat {
  format: 'pdf' | 'excel' | 'csv'
  include_details: boolean
  group_by?: string
}
