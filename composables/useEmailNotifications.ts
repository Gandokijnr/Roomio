import type { Reservation } from '~/types/database'

interface HotelInfo {
  name: string
  address: string
  phone: string
  email: string
  website: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  message?: string
  error?: string
  details?: string
}

export const useEmailNotifications = () => {
  const config = useRuntimeConfig()
  
  const defaultHotelInfo: HotelInfo = {
    name: 'Roomio Hotel',
    address: '123 Hotel Street, City, Country',
    phone: '+1 (555) 123-4567',
    email: 'info@roomiohotel.com',
    website: 'www.roomiohotel.com'
  }

  const sendBookingConfirmation = async (
    reservation: Reservation,
    guestEmail: string,
    hotelInfo: HotelInfo = defaultHotelInfo
  ): Promise<EmailResponse> => {
    try {
      // In development, use local Netlify dev server
      // In production, use the deployed Netlify function
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8888' 
        : config.public.siteUrl || window.location.origin

      const response = await $fetch<EmailResponse>(`${baseUrl}/.netlify/functions/send-booking-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          to: guestEmail,
          reservationData: reservation,
          hotelInfo
        }
      })

      return response
    } catch (error: any) {
      console.error('Failed to send booking confirmation:', error)
      return {
        success: false,
        error: 'Failed to send booking confirmation',
        details: error.message || 'Unknown error occurred'
      }
    }
  }

  const sendBookingUpdate = async (
    reservation: Reservation,
    guestEmail: string,
    updateType: 'modified' | 'cancelled',
    hotelInfo: HotelInfo = defaultHotelInfo
  ): Promise<EmailResponse> => {
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8888' 
        : config.public.siteUrl || window.location.origin

      const response = await $fetch<EmailResponse>(`${baseUrl}/.netlify/functions/send-booking-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          to: guestEmail,
          reservationData: reservation,
          updateType,
          hotelInfo
        }
      })

      return response
    } catch (error: any) {
      console.error('Failed to send booking update:', error)
      return {
        success: false,
        error: 'Failed to send booking update',
        details: error.message || 'Unknown error occurred'
      }
    }
  }

  const sendCheckInReminder = async (
    reservation: Reservation,
    guestEmail: string,
    hotelInfo: HotelInfo = defaultHotelInfo
  ): Promise<EmailResponse> => {
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8888' 
        : config.public.siteUrl || window.location.origin

      const response = await $fetch<EmailResponse>(`${baseUrl}/.netlify/functions/send-checkin-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          to: guestEmail,
          reservationData: reservation,
          hotelInfo
        }
      })

      return response
    } catch (error: any) {
      console.error('Failed to send check-in reminder:', error)
      return {
        success: false,
        error: 'Failed to send check-in reminder',
        details: error.message || 'Unknown error occurred'
      }
    }
  }

  return {
    sendBookingConfirmation,
    sendBookingUpdate,
    sendCheckInReminder,
    defaultHotelInfo
  }
}
