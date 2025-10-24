export type UserRole = 'admin' | 'manager' | 'receptionist' | 'accountant' | 'housekeeping'
export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning' | 'out_of_service'
export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type TaskType = 'cleaning' | 'maintenance' | 'inspection'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

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
  first_name: string
  last_name: string
  email?: string
  phone?: string
  id_type?: string
  id_number?: string
  address?: string
  city?: string
  country?: string
  date_of_birth?: string
  preferences: Record<string, any>
  notes?: string
  vip_status: boolean
  total_visits: number
  created_at: string
  updated_at: string
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
  task_type: TaskType
  priority: TaskPriority
  status: TaskStatus
  assigned_to?: string
  assigned_user?: Profile
  description: string
  notes?: string
  scheduled_date: string
  completed_at?: string
  created_by?: string
  created_at: string
  updated_at: string
}
