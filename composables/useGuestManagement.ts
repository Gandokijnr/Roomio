import type {
  Guest,
  GuestFeedback,
  LoyaltyTransaction,
  GuestCommunication,
  GuestPreference,
  GuestDocument,
  GroupBooking,
} from "~/types/database";

export const useGuestManagement = () => {
  const { $supabase } = useNuxtApp();
  const { sendWelcomeEmail } = useEmailNotifications();

  const formatGuestNumber = (
    prefix: string = "GST",
    number: number
  ): string => {
    return `${prefix}-${String(number).padStart(6, "0")}`;
  };

  const validateGuest = (
    guest: Partial<Guest>
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields
    if (!guest.first_name) errors.push("First name is required");
    if (!guest.last_name) errors.push("Last name is required");

    // Email format validation
    if (guest.email && !guest.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push("Invalid email format");
    }

    // Phone number format validation (basic international format)
    if (guest.phone && !guest.phone.match(/^\+?[1-9]\d{1,14}$/)) {
      errors.push("Invalid phone number format");
    }

    // Date of birth validation (must be in the past)
    if (guest.date_of_birth) {
      const dob = new Date(guest.date_of_birth);
      if (dob > new Date()) {
        errors.push("Date of birth cannot be in the future");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const createGuest = async (
    guestData: Partial<Guest>
  ): Promise<{ guest?: Guest; error?: string }> => {
    try {
      // Validate guest data
      const { isValid, errors } = validateGuest(guestData);
      if (!isValid) {
        return { error: errors.join(", ") };
      }

      // Format and prepare guest data
      const newGuest = {
        ...guestData,
        loyalty_tier: "bronze",
        loyalty_points: 0,
        total_stays: 0,
        total_spending: 0,
        is_corporate: Boolean(guestData.company),
        marketing_consent: guestData.marketing_consent || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert guest
      const { data: guest, error } = await $supabase
        .from("guests")
        .insert([newGuest])
        .select("*")
        .single();

      if (error) throw error;

      // Send welcome email if email is provided
      if (guest.email) {
        await sendWelcomeEmail(guest, guest.email);
      }

      return { guest };
    } catch (error: any) {
      console.error("Failed to create guest:", error);
      return { error: error.message || "Failed to create guest" };
    }
  };

  const updateGuest = async (
    guestId: string,
    updates: Partial<Guest>
  ): Promise<{ guest?: Guest; error?: string }> => {
    try {
      // Get current guest data
      const { data: currentGuest } = await $supabase
        .from("guests")
        .select("*")
        .eq("id", guestId)
        .single();

      if (!currentGuest) {
        throw new Error("Guest not found");
      }

      // Validate updated data
      const mergedData = { ...currentGuest, ...updates };
      const { isValid, errors } = validateGuest(mergedData);
      if (!isValid) {
        return { error: errors.join(", ") };
      }

      // Update guest
      const { data: guest, error } = await $supabase
        .from("guests")
        .update({
          ...updates,
          is_corporate: Boolean(mergedData.company),
          updated_at: new Date().toISOString(),
        })
        .eq("id", guestId)
        .select("*")
        .single();

      if (error) throw error;

      return { guest };
    } catch (error: any) {
      console.error("Failed to update guest:", error);
      return { error: error.message || "Failed to update guest" };
    }
  };

  const getGuest = async (
    guestId: string,
    includeRelated: boolean = false
  ): Promise<{
    guest?: Guest;
    related?: {
      feedback: GuestFeedback[];
      loyalty: LoyaltyTransaction[];
      communications: GuestCommunication[];
      preferences: GuestPreference[];
      documents: GuestDocument[];
      groupBookings: GroupBooking[];
    };
    error?: string;
  }> => {
    try {
      // Get guest
      const { data: guest, error } = await $supabase
        .from("guests")
        .select(
          `
          *,
          corporate_account:corporate_accounts(*)
        `
        )
        .eq("id", guestId)
        .single();

      if (error) throw error;

      // Get related data if requested
      if (includeRelated) {
        const [
          { data: feedback },
          { data: loyalty },
          { data: communications },
          { data: preferences },
          { data: documents },
          { data: groupBookings },
        ] = await Promise.all([
          $supabase.from("guest_feedback").select("*").eq("guest_id", guestId),
          $supabase
            .from("loyalty_transactions")
            .select("*")
            .eq("guest_id", guestId),
          $supabase
            .from("guest_communications")
            .select("*")
            .eq("guest_id", guestId),
          $supabase
            .from("guest_preferences")
            .select("*")
            .eq("guest_id", guestId),
          $supabase.from("guest_documents").select("*").eq("guest_id", guestId),
          $supabase
            .from("group_bookings")
            .select("*")
            .eq("group_leader_id", guestId),
        ]);

        return {
          guest,
          related: {
            feedback: feedback || [],
            loyalty: loyalty || [],
            communications: communications || [],
            preferences: preferences || [],
            documents: documents || [],
            groupBookings: groupBookings || [],
          },
        };
      }

      return { guest };
    } catch (error: any) {
      console.error("Failed to get guest:", error);
      return { error: error.message || "Failed to get guest" };
    }
  };

  const searchGuests = async (
    query: string,
    filters: {
      loyaltyTier?: string;
      isActive?: boolean;
      isCorporate?: boolean;
      nationality?: string;
      minSpending?: number;
      maxSpending?: number;
    } = {}
  ) => {
    try {
      let supabaseQuery = $supabase.from("guests").select("*");

      // Apply search
      if (query) {
        supabaseQuery = supabaseQuery.or(`
          first_name.ilike.%${query}%,
          last_name.ilike.%${query}%,
          email.ilike.%${query}%,
          phone.ilike.%${query}%,
          guest_id.ilike.%${query}%
        `);
      }

      // Apply filters
      if (filters.loyaltyTier) {
        supabaseQuery = supabaseQuery.eq(
          "loyalty_tier",
          filters.loyaltyTier.toLowerCase()
        );
      }
      if (filters.isActive !== undefined) {
        supabaseQuery = supabaseQuery.eq("is_active", filters.isActive);
      }
      if (filters.isCorporate !== undefined) {
        supabaseQuery = supabaseQuery.eq("is_corporate", filters.isCorporate);
      }
      if (filters.nationality) {
        supabaseQuery = supabaseQuery.eq("nationality", filters.nationality);
      }
      if (filters.minSpending !== undefined) {
        supabaseQuery = supabaseQuery.gte(
          "total_spending",
          filters.minSpending
        );
      }
      if (filters.maxSpending !== undefined) {
        supabaseQuery = supabaseQuery.lte(
          "total_spending",
          filters.maxSpending
        );
      }

      // Execute query
      const { data: guests, error } = await supabaseQuery.order("last_name", {
        ascending: true,
      });

      if (error) throw error;

      return { guests };
    } catch (error: any) {
      console.error("Failed to search guests:", error);
      return { error: error.message || "Failed to search guests" };
    }
  };

  const addGuestPreference = async (
    guestId: string,
    preferenceType: string,
    preferenceValue: string
  ): Promise<{ preference?: GuestPreference; error?: string }> => {
    try {
      const { data: preference, error } = await $supabase
        .from("guest_preferences")
        .upsert([
          {
            guest_id: guestId,
            preference_type: preferenceType,
            preference_value: preferenceValue,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return { preference };
    } catch (error: any) {
      console.error("Failed to add guest preference:", error);
      return { error: error.message || "Failed to add guest preference" };
    }
  };

  const uploadGuestDocument = async (
    guestId: string,
    file: File,
    documentType: string,
    userId: string
  ): Promise<{ document?: GuestDocument; error?: string }> => {
    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const filePath = `guests/${guestId}/${documentType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await $supabase.storage
        .from("guest-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = $supabase.storage
        .from("guest-documents")
        .getPublicUrl(filePath);

      // Create document record
      const { data: document, error: docError } = await $supabase
        .from("guest_documents")
        .insert([
          {
            guest_id: guestId,
            document_type: documentType,
            document_url: publicUrl.publicUrl,
            file_name: file.name,
            file_size: file.size,
            uploaded_by: userId,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (docError) throw docError;

      return { document };
    } catch (error: any) {
      console.error("Failed to upload guest document:", error);
      return { error: error.message || "Failed to upload guest document" };
    }
  };

  const recordGuestFeedback = async (
    guestId: string,
    feedback: Partial<GuestFeedback>
  ): Promise<{ feedback?: GuestFeedback; error?: string }> => {
    try {
      const { data: record, error } = await $supabase
        .from("guest_feedback")
        .insert([
          {
            ...feedback,
            guest_id: guestId,
            feedback_date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return { feedback: record };
    } catch (error: any) {
      console.error("Failed to record guest feedback:", error);
      return { error: error.message || "Failed to record guest feedback" };
    }
  };

  const createGroupBooking = async (
    groupName: string,
    groupLeaderId: string,
    totalGuests: number,
    eventType: string | null,
    specialRequirements: string | null,
    discount: number,
    userId: string
  ): Promise<{ groupBooking?: GroupBooking; error?: string }> => {
    try {
      const { data: booking, error } = await $supabase
        .from("group_bookings")
        .insert([
          {
            group_name: groupName,
            group_leader_id: groupLeaderId,
            total_guests: totalGuests,
            event_type: eventType,
            special_requirements: specialRequirements,
            group_discount_percentage: discount,
            created_by: userId,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return { groupBooking: booking };
    } catch (error: any) {
      console.error("Failed to create group booking:", error);
      return { error: error.message || "Failed to create group booking" };
    }
  };

  return {
    formatGuestNumber,
    validateGuest,
    createGuest,
    updateGuest,
    getGuest,
    searchGuests,
    addGuestPreference,
    uploadGuestDocument,
    recordGuestFeedback,
    createGroupBooking,
  };
};
