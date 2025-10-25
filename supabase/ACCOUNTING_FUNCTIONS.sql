-- =====================================================
-- ACCOUNTING & FINANCE FUNCTIONS
-- =====================================================

-- =====================================================
-- 1. GENERATE INVOICE NUMBER
-- =====================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR AS $$
DECLARE
  v_year VARCHAR(4);
  v_month VARCHAR(2);
  v_sequence INTEGER;
  v_invoice_number VARCHAR(50);
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  v_month := TO_CHAR(CURRENT_DATE, 'MM');
  
  -- Get next sequence for this month
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 12) AS INTEGER)), 0) + 1
  INTO v_sequence
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || v_year || v_month || '%';
  
  v_invoice_number := 'INV-' || v_year || v_month || '-' || LPAD(v_sequence::TEXT, 4, '0');
  
  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. GENERATE TRANSACTION REFERENCE
-- =====================================================

CREATE OR REPLACE FUNCTION generate_transaction_reference()
RETURNS VARCHAR AS $$
DECLARE
  v_date VARCHAR(8);
  v_sequence INTEGER;
  v_reference VARCHAR(50);
BEGIN
  v_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_reference FROM 13) AS INTEGER)), 0) + 1
  INTO v_sequence
  FROM payment_transactions
  WHERE transaction_reference LIKE 'TXN-' || v_date || '%';
  
  v_reference := 'TXN-' || v_date || '-' || LPAD(v_sequence::TEXT, 5, '0');
  
  RETURN v_reference;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. PROCESS PAYMENT
-- =====================================================

CREATE OR REPLACE FUNCTION process_payment(
  p_reservation_id UUID,
  p_guest_id UUID,
  p_amount DECIMAL,
  p_payment_method VARCHAR,
  p_payment_category VARCHAR DEFAULT 'room_rental',
  p_description TEXT DEFAULT NULL,
  p_processed_by UUID DEFAULT NULL
)
RETURNS TABLE(
  transaction_id UUID,
  transaction_reference VARCHAR,
  status VARCHAR,
  message TEXT
) AS $$
DECLARE
  v_transaction_id UUID;
  v_reference VARCHAR;
  v_invoice_id UUID;
  v_invoice_balance DECIMAL;
BEGIN
  -- Generate transaction reference
  v_reference := generate_transaction_reference();
  
  -- Get invoice if exists
  SELECT id, balance_due INTO v_invoice_id, v_invoice_balance
  FROM invoices
  WHERE reservation_id = p_reservation_id
    AND status NOT IN ('paid', 'cancelled')
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Create payment transaction
  INSERT INTO payment_transactions (
    transaction_reference,
    reservation_id,
    guest_id,
    invoice_id,
    transaction_type,
    payment_method,
    amount,
    amount_in_base_currency,
    status,
    payment_category,
    description,
    processed_by,
    processed_at
  ) VALUES (
    v_reference,
    p_reservation_id,
    p_guest_id,
    v_invoice_id,
    'payment',
    p_payment_method,
    p_amount,
    p_amount,
    'completed',
    p_payment_category,
    p_description,
    p_processed_by,
    NOW()
  ) RETURNING id INTO v_transaction_id;
  
  -- Update invoice if exists
  IF v_invoice_id IS NOT NULL THEN
    UPDATE invoices
    SET 
      amount_paid = amount_paid + p_amount,
      balance_due = total_amount - (amount_paid + p_amount),
      status = CASE 
        WHEN (total_amount - (amount_paid + p_amount)) <= 0 THEN 'paid'
        WHEN (amount_paid + p_amount) > 0 THEN 'partial'
        ELSE status
      END,
      paid_at = CASE 
        WHEN (total_amount - (amount_paid + p_amount)) <= 0 THEN NOW()
        ELSE paid_at
      END,
      updated_at = NOW()
    WHERE id = v_invoice_id;
  END IF;
  
  RETURN QUERY SELECT 
    v_transaction_id,
    v_reference,
    'completed'::VARCHAR,
    'Payment processed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE INVOICE FOR RESERVATION
-- =====================================================

CREATE OR REPLACE FUNCTION create_reservation_invoice(
  p_reservation_id UUID,
  p_guest_id UUID,
  p_issued_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_invoice_number VARCHAR;
  v_reservation RECORD;
  v_subtotal DECIMAL := 0;
  v_tax_rate DECIMAL := 7.5; -- Default VAT rate
  v_tax_amount DECIMAL;
  v_total DECIMAL;
BEGIN
  -- Get reservation details
  SELECT * INTO v_reservation
  FROM reservations
  WHERE id = p_reservation_id;
  
  -- Generate invoice number
  v_invoice_number := generate_invoice_number();
  
  -- Calculate amounts
  v_subtotal := v_reservation.total_amount;
  v_tax_amount := v_subtotal * (v_tax_rate / 100);
  v_total := v_subtotal + v_tax_amount;
  
  -- Create invoice
  INSERT INTO invoices (
    invoice_number,
    reservation_id,
    guest_id,
    invoice_date,
    due_date,
    subtotal,
    tax_amount,
    total_amount,
    balance_due,
    status,
    issued_by
  ) VALUES (
    v_invoice_number,
    p_reservation_id,
    p_guest_id,
    CURRENT_DATE,
    v_reservation.check_out_date,
    v_subtotal,
    v_tax_amount,
    v_total,
    v_total,
    'sent',
    p_issued_by
  ) RETURNING id INTO v_invoice_id;
  
  -- Add line item for room rental
  INSERT INTO invoice_line_items (
    invoice_id,
    item_type,
    description,
    quantity,
    unit_price,
    tax_rate,
    line_total,
    service_date
  ) VALUES (
    v_invoice_id,
    'room',
    'Room Rental: ' || (v_reservation.check_out_date - v_reservation.check_in_date) || ' nights',
    (v_reservation.check_out_date - v_reservation.check_in_date),
    v_subtotal / (v_reservation.check_out_date - v_reservation.check_in_date),
    v_tax_rate,
    v_subtotal,
    v_reservation.check_in_date
  );
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. GET FINANCIAL SUMMARY
-- =====================================================

CREATE OR REPLACE FUNCTION get_financial_summary(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  total_revenue DECIMAL,
  total_expenses DECIMAL,
  net_profit DECIMAL,
  total_transactions INTEGER,
  pending_payments DECIMAL,
  revenue_by_category JSONB
) AS $$
DECLARE
  v_revenue DECIMAL;
  v_expenses DECIMAL;
  v_profit DECIMAL;
  v_transactions INTEGER;
  v_pending DECIMAL;
  v_categories JSONB;
BEGIN
  -- Total revenue
  SELECT COALESCE(SUM(amount), 0) INTO v_revenue
  FROM payment_transactions
  WHERE transaction_type = 'payment'
    AND status = 'completed'
    AND DATE(created_at) BETWEEN p_start_date AND p_end_date;
  
  -- Total expenses
  SELECT COALESCE(SUM(total_amount), 0) INTO v_expenses
  FROM expenses
  WHERE expense_date BETWEEN p_start_date AND p_end_date
    AND payment_status IN ('paid', 'partial');
  
  -- Net profit
  v_profit := v_revenue - v_expenses;
  
  -- Transaction count
  SELECT COUNT(*) INTO v_transactions
  FROM payment_transactions
  WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date;
  
  -- Pending payments
  SELECT COALESCE(SUM(balance_due), 0) INTO v_pending
  FROM invoices
  WHERE status IN ('sent', 'partial', 'overdue')
    AND invoice_date BETWEEN p_start_date AND p_end_date;
  
  -- Revenue by category
  SELECT jsonb_object_agg(payment_category, category_total) INTO v_categories
  FROM (
    SELECT 
      payment_category,
      SUM(amount) as category_total
    FROM payment_transactions
    WHERE transaction_type = 'payment'
      AND status = 'completed'
      AND DATE(created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY payment_category
  ) cat;
  
  RETURN QUERY SELECT 
    v_revenue,
    v_expenses,
    v_profit,
    v_transactions,
    v_pending,
    COALESCE(v_categories, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. PROCESS REFUND
-- =====================================================

CREATE OR REPLACE FUNCTION process_refund(
  p_original_transaction_id UUID,
  p_refund_amount DECIMAL,
  p_reason TEXT,
  p_processed_by UUID
)
RETURNS TABLE(
  refund_id UUID,
  refund_reference VARCHAR,
  status VARCHAR,
  message TEXT
) AS $$
DECLARE
  v_refund_id UUID;
  v_reference VARCHAR;
  v_original RECORD;
BEGIN
  -- Get original transaction
  SELECT * INTO v_original
  FROM payment_transactions
  WHERE id = p_original_transaction_id;
  
  IF v_original IS NULL THEN
    RAISE EXCEPTION 'Original transaction not found';
  END IF;
  
  IF p_refund_amount > v_original.amount THEN
    RAISE EXCEPTION 'Refund amount cannot exceed original payment amount';
  END IF;
  
  -- Generate reference
  v_reference := generate_transaction_reference();
  
  -- Create refund transaction
  INSERT INTO payment_transactions (
    transaction_reference,
    reservation_id,
    guest_id,
    invoice_id,
    transaction_type,
    payment_method,
    amount,
    amount_in_base_currency,
    status,
    payment_category,
    description,
    processed_by,
    processed_at,
    metadata
  ) VALUES (
    v_reference,
    v_original.reservation_id,
    v_original.guest_id,
    v_original.invoice_id,
    'refund',
    v_original.payment_method,
    -p_refund_amount,
    -p_refund_amount,
    'completed',
    v_original.payment_category,
    'Refund: ' || p_reason,
    p_processed_by,
    NOW(),
    jsonb_build_object('original_transaction_id', p_original_transaction_id)
  ) RETURNING id INTO v_refund_id;
  
  -- Update invoice if exists
  IF v_original.invoice_id IS NOT NULL THEN
    UPDATE invoices
    SET 
      amount_paid = amount_paid - p_refund_amount,
      balance_due = balance_due + p_refund_amount,
      status = CASE 
        WHEN balance_due + p_refund_amount >= total_amount THEN 'sent'
        WHEN balance_due + p_refund_amount > 0 THEN 'partial'
        ELSE 'refunded'
      END,
      updated_at = NOW()
    WHERE id = v_original.invoice_id;
  END IF;
  
  RETURN QUERY SELECT 
    v_refund_id,
    v_reference,
    'completed'::VARCHAR,
    'Refund processed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. UPDATE BUDGET VARIANCE
-- =====================================================

CREATE OR REPLACE FUNCTION update_budget_variance()
RETURNS TRIGGER AS $$
DECLARE
  v_budget_id UUID;
  v_budgeted DECIMAL;
  v_actual DECIMAL;
BEGIN
  -- Find matching budget
  SELECT id, budgeted_amount INTO v_budget_id, v_budgeted
  FROM budgets
  WHERE budget_year = EXTRACT(YEAR FROM NEW.expense_date)
    AND budget_month = EXTRACT(MONTH FROM NEW.expense_date)
    AND category = NEW.expense_category
    AND status = 'active';
  
  IF v_budget_id IS NOT NULL THEN
    -- Calculate actual spending
    SELECT COALESCE(SUM(total_amount), 0) INTO v_actual
    FROM expenses
    WHERE EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM NEW.expense_date)
      AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM NEW.expense_date)
      AND expense_category = NEW.expense_category;
    
    -- Update budget
    UPDATE budgets
    SET 
      actual_amount = v_actual,
      variance = v_budgeted - v_actual,
      variance_percentage = CASE 
        WHEN v_budgeted > 0 THEN ((v_budgeted - v_actual) / v_budgeted) * 100
        ELSE 0
      END,
      updated_at = NOW()
    WHERE id = v_budget_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_budget_variance ON expenses;
CREATE TRIGGER trigger_update_budget_variance
  AFTER INSERT OR UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ACCOUNTING FUNCTIONS CREATED SUCCESSFULLY!';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions Created:';
  RAISE NOTICE '  ✓ generate_invoice_number()';
  RAISE NOTICE '  ✓ generate_transaction_reference()';
  RAISE NOTICE '  ✓ process_payment()';
  RAISE NOTICE '  ✓ create_reservation_invoice()';
  RAISE NOTICE '  ✓ get_financial_summary()';
  RAISE NOTICE '  ✓ process_refund()';
  RAISE NOTICE '  ✓ update_budget_variance()';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers Created:';
  RAISE NOTICE '  ✓ trigger_update_budget_variance';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
