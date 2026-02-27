export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_time: string | null
          created_at: string | null
          id: string
          movie_id: string
          payment_status: string | null
          seats: number
          show_time: string
          showtime_id: string | null
          theater_id: string | null
          total_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_time?: string | null
          created_at?: string | null
          id?: string
          movie_id: string
          payment_status?: string | null
          seats?: number
          show_time: string
          showtime_id?: string | null
          theater_id?: string | null
          total_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_time?: string | null
          created_at?: string | null
          id?: string
          movie_id?: string
          payment_status?: string | null
          seats?: number
          show_time?: string
          showtime_id?: string | null
          theater_id?: string | null
          total_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_showtime_id_fkey"
            columns: ["showtime_id"]
            isOneToOne: false
            referencedRelation: "showtimes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_theater_id_fkey"
            columns: ["theater_id"]
            isOneToOne: false
            referencedRelation: "theaters"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          backdrop_url: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          genre: string[] | null
          id: string
          is_available: boolean | null
          is_featured: boolean | null
          language: string | null
          poster_url: string | null
          price: number | null
          rating: number | null
          release_year: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          backdrop_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          genre?: string[] | null
          id?: string
          is_available?: boolean | null
          is_featured?: boolean | null
          language?: string | null
          poster_url?: string | null
          price?: number | null
          rating?: number | null
          release_year?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          backdrop_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          genre?: string[] | null
          id?: string
          is_available?: boolean | null
          is_featured?: boolean | null
          language?: string | null
          poster_url?: string | null
          price?: number | null
          rating?: number | null
          release_year?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          currency: string
          id: string
          idempotency_key: string | null
          metadata: Json | null
          platform_fee: number
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          currency?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json | null
          platform_fee?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          currency?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json | null
          platform_fee?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      preferences: {
        Row: {
          created_at: string | null
          favorite_genres: string[] | null
          id: string
          notification_enabled: boolean | null
          preferred_language: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          favorite_genres?: string[] | null
          id?: string
          notification_enabled?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          favorite_genres?: string[] | null
          id?: string
          notification_enabled?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      screens: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          screen_type: string
          seats_per_row: number
          theater_id: string
          total_rows: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          screen_type?: string
          seats_per_row?: number
          theater_id: string
          total_rows?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          screen_type?: string
          seats_per_row?: number
          theater_id?: string
          total_rows?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screens_theater_id_fkey"
            columns: ["theater_id"]
            isOneToOne: false
            referencedRelation: "theaters"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_locks: {
        Row: {
          expires_at: string
          id: string
          locked_at: string
          released: boolean | null
          seat_id: string
          showtime_id: string
          user_id: string
        }
        Insert: {
          expires_at?: string
          id?: string
          locked_at?: string
          released?: boolean | null
          seat_id: string
          showtime_id: string
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          locked_at?: string
          released?: boolean | null
          seat_id?: string
          showtime_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_locks_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_locks_showtime_id_fkey"
            columns: ["showtime_id"]
            isOneToOne: false
            referencedRelation: "showtimes"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          price: number
          row_label: string
          screen_id: string
          seat_number: number
          tier: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          row_label: string
          screen_id: string
          seat_number: number
          tier?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          row_label?: string
          screen_id?: string
          seat_number?: number
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "seats_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      showtimes: {
        Row: {
          created_at: string | null
          end_time: string | null
          id: string
          is_active: boolean | null
          movie_id: string
          price_modifier: number | null
          screen_id: string
          show_date: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          movie_id: string
          price_modifier?: number | null
          screen_id: string
          show_date: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          movie_id?: string
          price_modifier?: number | null
          screen_id?: string
          show_date?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "showtimes_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showtimes_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      theaters: {
        Row: {
          address: string
          amenities: string[] | null
          city: string
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          phone: string | null
          state: string
          updated_at: string | null
          zip_code: string
        }
        Insert: {
          address: string
          amenities?: string[] | null
          city: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          state: string
          updated_at?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          amenities?: string[] | null
          city?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          state?: string
          updated_at?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          qr_code: string
          scanned_at: string | null
          seat_id: string
          showtime_id: string
          status: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          qr_code: string
          scanned_at?: string | null
          seat_id: string
          showtime_id: string
          status?: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          qr_code?: string
          scanned_at?: string | null
          seat_id?: string
          showtime_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_showtime_id_fkey"
            columns: ["showtime_id"]
            isOneToOne: false
            referencedRelation: "showtimes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_seats: {
        Args: { p_showtime_id: string }
        Returns: {
          is_booked: boolean
          is_locked: boolean
          price: number
          row_label: string
          seat_id: string
          seat_number: number
          tier: string
        }[]
      }
      release_expired_locks: { Args: never; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
