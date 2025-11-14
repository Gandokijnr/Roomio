export type UserRole = 'admin' | 'manager' | 'receptionist' | 'accountant' | 'housekeeping'
export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning' | 'out_of_service' | 'needs_cleaning' | 'assigned_housekeeper'
export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type TaskType = 'cleaning' | 'maintenance' | 'inspection'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type Gender = 'male' | 'female' | 'other'
export type IdType = 'passport' | 'national_id' | 'driver_license' | 'other'
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type CommunicationType = 'email' | 'sms' | 'call' | 'in_person'
export type CommunicationDirection = 'inbound' | 'outbound'
export type CommunicationStatus = 'sent' | 'delivered' | 'read' | 'failed'
export type LoyaltyTransactionType = 'earned' | 'redeemed' | 'expired' | 'adjusted'
export type BillingPreference = 'consolidated' | 'individual'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  is_active: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id?: string
  action: string
  entity_type?: string
  entity_id?: string
  metadata: Record<string, any>
  created_at: string
}

export interface RoomType {
  id: string
  name: string
  description?: string
  base_price: number
  max_occupancy: number
  amenities: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  room_number: string
  room_name?: string
  room_type_id: string
  room_type?: RoomType
  floor: number
  bed_type: string
  capacity: number
  section?: string
  price_per_night: number
  status: RoomStatus
  description?: string
  photos: string[]
  amenities: string[]
  tags: string[]
  featured_image?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Guest {
  id: string
  guest_id?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  gender?: Gender
  date_of_birth?: string
  nationality?: string
  city?: string
  address?: string
  id_type?: IdType
  id_number?: string
  emergency_contact?: string
  occupation?: string
  company?: string
  preferred_payment_method?: string
  special_preferences?: string
  notes?: string
  loyalty_tier: LoyaltyTier
  loyalty_points: number
  total_stays: number
  total_spending: number
  last_visit_date?: string
  is_corporate: boolean
  corporate_id?: string
  corporate_account?: CorporateAccount
  marketing_consent: boolean
  profile_image_url?: string
  created_at: string
  updated_at: string
}

export interface CorporateAccount {
  id: string
  company_name: string
  company_address?: string
  tax_id?: string
  contact_person?: string
  contact_email?: string
  contact_phone?: string
  billing_preference: BillingPreference
  discount_percentage: number
  payment_terms: number
  credit_limit: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GuestFeedback {
  id: string
  guest_id: string
  guest?: Guest
  reservation_id?: string
  reservation?: Reservation
  overall_rating?: number
  cleanliness_rating?: number
  service_rating?: number
  amenities_rating?: number
  value_rating?: number
  comments?: string
  would_recommend?: boolean
  feedback_date: string
  response_required: boolean
  staff_response?: string
  responded_by?: string
  responded_at?: string
}

export interface LoyaltyTransaction {
  id: string
  guest_id: string
  guest?: Guest
  transaction_type: LoyaltyTransactionType
  points: number
  description?: string
  reservation_id?: string
  reservation?: Reservation
  created_at: string
  expires_at?: string
}

export interface GuestCommunication {
  id: string
  guest_id: string
  guest?: Guest
  communication_type: CommunicationType
  subject?: string
  message?: string
  direction: CommunicationDirection
  status: CommunicationStatus
  sent_by?: string
  sent_by_user?: Profile
  created_at: string
}

export interface GuestPreference {
  id: string
  guest_id: string
  preference_type: string
  preference_value: string
  created_at: string
}

export interface GuestDocument {
  id: string
  guest_id: string
  document_type: string
  document_url: string
  file_name?: string
  file_size?: number
  uploaded_by?: string
  created_at: string
}

export interface GroupBooking {
  id: string
  group_name: string
  group_leader_id: string
  group_leader?: Guest
  total_guests: number
  event_type?: string
  special_requirements?: string
  group_discount_percentage: number
  booking_date: string
  created_by?: string
  created_at: string
}

export interface GroupBookingGuest {
  id: string
  group_booking_id: string
  group_booking?: GroupBooking
  guest_id: string
  guest?: Guest
  reservation_id?: string
  reservation?: Reservation
  created_at: string
}

export interface Reservation {
  id: string
  reservation_number: string
  guest_id: string
  guest?: Guest
  room_id: string
  room?: Room
  check_in_date: string
  check_out_date: string
  actual_check_in?: string
  actual_check_out?: string
  number_of_guests: number
  number_of_adults: number
  number_of_children: number
  status: ReservationStatus
  total_amount: number
  paid_amount: number
  special_requests?: string
  booking_source: string
  created_by?: string
  cancelled_at?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  reservation_id: string
  reservation?: Reservation
  amount: number
  payment_method: string
  payment_status: PaymentStatus
  transaction_id?: string
  payment_date: string
  notes?: string
  processed_by?: string
  created_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  reservation_id: string
  reservation?: Reservation
  guest_id: string
  guest?: Guest
  issue_date: string
  due_date?: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  status: InvoiceStatus
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface HousekeepingTask {
  id: string
  room_id: string
  room?: Room
  assigned_to?: string
  assigned_housekeeper?: Profile
  task_type: TaskType
  priority: TaskPriority
  status: TaskStatus
  title: string
  description?: string
  notes?: string
  special_instructions?: string
  estimated_duration?: number
  actual_duration?: number
  scheduled_date?: string
  started_at?: string
  completed_at?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface HousekeepingTaskLog {
  id: string
  task_id: string
  action: string
  notes?: string
  logged_by?: string
  created_at: string
}

export interface HousekeepingChecklist {
  id: string
  name: string
  description?: string
  room_type_id?: string
  task_type: TaskType
  checklist_items: ChecklistItem[]
  estimated_duration: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  task: string
  required: boolean
  completed?: boolean
}

export interface HousekeepingTaskCompletion {
  id: string
  task_id: string
  checklist_id?: string
  completed_items: string[]
  completion_notes?: string
  quality_rating?: number
  completed_by?: string
  completed_at: string
}
