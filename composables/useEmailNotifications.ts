import type { Guest, Reservation } from '~/types/database'

interface HotelInfo {
  name: string
  address: string
  phone: string
  email: string
  website: string
  feedbackUrl?: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  message?: string
  error?: string
  details?: string
}

interface FeedbackData {
  reservationId: string
  check_in: string
  check_out: string
}

interface TierData {
  newTier: string
  oldTier?: string
}

interface PointsData {
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
  points: number
  description: string
}

export const useEmailNotifications = () => {
  const config = useRuntimeConfig()
  
  const defaultHotelInfo: HotelInfo = {
    name: 'Roomio Hotel',
    address: '123 Hotel Street, City, Country',
    phone: '+1 (555) 123-4567',
    email: 'info@roomiohotel.com',
    website: 'www.roomiohotel.com',
    feedbackUrl: config.public.siteUrl ? `${config.public.siteUrl}/feedback` : ''
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

  const sendWelcomeEmail = async (
    guest: Guest,
    guestEmail: string,
    hotelInfo: HotelInfo = defaultHotelInfo
  ): Promise<EmailResponse> => {
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8888' 
        : config.public.siteUrl || window.location.origin

      const response = await $fetch<EmailResponse>(`${baseUrl}/.netlify/functions/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          to: guestEmail,
          guestData: guest,
          hotelInfo
        }
      })

      return response
    } catch (error: any) {
      console.error('Failed to send welcome email:', error)
      return {
        success: false,
        error: 'Failed to send welcome email',
        details: error.message || 'Unknown error occurred'
      }
    }
  }

  const sendFeedbackRequest = async (
    guest: Guest,
    guestEmail: string,
    feedbackData: FeedbackData,
    hotelInfo: HotelInfo = defaultHotelInfo
  ): Promise<EmailResponse> => {
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8888' 
        : config.public.siteUrl || window.location.origin

      const response = await $fetch<EmailResponse>(`${baseUrl}/.netlify/functions/send-feedback-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          to: guestEmail,
          guestData: guest,
          feedbackData,
          hotelInfo
        }
      })

      return response
    } catch (error: any) {
      console.error('Failed to send feedback request:', error)
      return {
        success: false,
        error: 'Failed to send feedback request',
        details: error.message || 'Unknown error occurred'
      }
    }
  }

  const sendTierUpgrade = async (
    guest: Guest,
    guestEmail: string,
    tierData: TierData,
    hotelInfo: HotelInfo = defaultHotelInfo
  ): Promise<EmailResponse> => {
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8888' 
        : config.public.siteUrl || window.location.origin

      const response = await $fetch<EmailResponse>(`${baseUrl}/.netlify/functions/send-tier-upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          to: guestEmail,
          guestData: guest,
          tierData,
          hotelInfo
        }
      })

      return response
    } catch (error: any) {
      console.error('Failed to send tier upgrade notification:', error)
      return {
        success: false,
        error: 'Failed to send tier upgrade notification',
        details: error.message || 'Unknown error occurred'
      }
    }
  }

  const sendLoyaltyUpdate = async (
    guest: Guest,
    guestEmail: string,
    pointsData: PointsData,
    hotelInfo: HotelInfo = defaultHotelInfo
  ): Promise<EmailResponse> => {
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8888' 
        : config.public.siteUrl || window.location.origin

      const response = await $fetch<EmailResponse>(`${baseUrl}/.netlify/functions/send-loyalty-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          to: guestEmail,
          guestData: guest,
          pointsData,
          hotelInfo
        }
      })

      return response
    } catch (error: any) {
      console.error('Failed to send loyalty update:', error)
      return {
        success: false,
        error: 'Failed to send loyalty update',
        details: error.message || 'Unknown error occurred'
      }
    }
  }

  return {
    sendBookingConfirmation,
    sendBookingUpdate,
    sendCheckInReminder,
    sendWelcomeEmail,
    sendFeedbackRequest,
    sendTierUpgrade,
    sendLoyaltyUpdate,
    defaultHotelInfo
  }
}
