// Script to seed default room types
// Run this with: node scripts/seed-room-types.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const defaultRoomTypes = [
  {
    name: 'Standard Single',
    description: 'Comfortable single room with basic amenities',
    base_price: 80.00,
    max_occupancy: 1,
    amenities: ['WiFi', 'AC', 'TV', 'Private Bathroom'],
    tags: ['Budget', 'Business', 'Solo Travel']
  },
  {
    name: 'Standard Double',
    description: 'Spacious double room perfect for couples',
    base_price: 120.00,
    max_occupancy: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Private Bathroom', 'Mini Fridge'],
    tags: ['Romantic', 'Couples', 'Standard']
  },
  {
    name: 'Deluxe Room',
    description: 'Enhanced room with premium amenities and city view',
    base_price: 180.00,
    max_occupancy: 2,
    amenities: ['WiFi', 'AC', 'Smart TV', 'Private Bathroom', 'Mini Bar', 'City View', 'Work Desk'],
    tags: ['Premium', 'City View', 'Business', 'Deluxe']
  },
  {
    name: 'Family Suite',
    description: 'Large suite ideal for families with separate living area',
    base_price: 250.00,
    max_occupancy: 4,
    amenities: ['WiFi', 'AC', 'Smart TV', 'Private Bathroom', 'Mini Bar', 'Separate Living Area', 'Sofa Bed', 'Kitchenette'],
    tags: ['Family Friendly', 'Suite', 'Spacious', 'Kids Welcome']
  },
  {
    name: 'Executive Suite',
    description: 'Luxury suite with premium amenities and services',
    base_price: 350.00,
    max_occupancy: 2,
    amenities: ['WiFi', 'AC', 'Smart TV', 'Private Bathroom', 'Mini Bar', 'Ocean View', 'Balcony', 'Premium Toiletries', 'Concierge Service'],
    tags: ['Luxury', 'Executive', 'Ocean View', 'VIP', 'Premium']
  },
  {
    name: 'Presidential Suite',
    description: 'Ultimate luxury accommodation with exclusive amenities',
    base_price: 500.00,
    max_occupancy: 4,
    amenities: ['WiFi', 'AC', 'Smart TV', 'Private Bathroom', 'Full Bar', 'Ocean View', 'Large Balcony', 'Jacuzzi', 'Butler Service', 'Separate Dining Area'],
    tags: ['Luxury', 'VIP', 'Presidential', 'Ocean View', 'Honeymoon', 'Ultra Premium']
  }
]

async function seedRoomTypes() {
  try {
    console.log('Checking existing room types...')
    
    // Check if room types already exist
    const { data: existingTypes, error: fetchError } = await supabase
      .from('room_types')
      .select('name')
    
    if (fetchError) {
      console.error('Error fetching room types:', fetchError)
      return
    }
    
    const existingNames = existingTypes?.map(type => type.name) || []
    const newTypes = defaultRoomTypes.filter(type => !existingNames.includes(type.name))
    
    if (newTypes.length === 0) {
      console.log('All room types already exist!')
      return
    }
    
    console.log(`Inserting ${newTypes.length} new room types...`)
    
    const { data, error } = await supabase
      .from('room_types')
      .insert(newTypes)
      .select()
    
    if (error) {
      console.error('Error inserting room types:', error)
      return
    }
    
    console.log('Successfully inserted room types:', data)
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

seedRoomTypes()
