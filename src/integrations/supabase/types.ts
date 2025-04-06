export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      private_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          recipient_id: string
          sender_id: string
          tournament_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
          tournament_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_messages_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      tournament_announcements: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender_id: string
          title: string
          tournament_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender_id: string
          title: string
          tournament_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string
          title?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_announcements_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_join_requests: {
        Row: {
          additional_info: string | null
          gender: string
          id: string
          mobile_no: string
          partner_gender: string | null
          partner_mobile_no: string | null
          partner_name: string | null
          payment_proof_url: string | null
          player_name: string
          reviewed_at: string | null
          reviewer_notes: string | null
          roles: string[] | null
          status: string
          submitted_at: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          gender: string
          id?: string
          mobile_no: string
          partner_gender?: string | null
          partner_mobile_no?: string | null
          partner_name?: string | null
          payment_proof_url?: string | null
          player_name: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          roles?: string[] | null
          status?: string
          submitted_at?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          additional_info?: string | null
          gender?: string
          id?: string
          mobile_no?: string
          partner_gender?: string | null
          partner_mobile_no?: string | null
          partner_name?: string | null
          payment_proof_url?: string | null
          player_name?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          roles?: string[] | null
          status?: string
          submitted_at?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_join_requests_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          tournament_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          tournament_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          tournament_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          about: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          creator_id: string | null
          end_date: string | null
          entry_fee: number | null
          format: string | null
          id: string
          image_url: string | null
          location: string | null
          registration_due_date: string | null
          sport: string | null
          start_date: string | null
          state: string | null
          team_limit: number | null
          teams_registered: number | null
          tournament_name: string
          user_id: string | null
        }
        Insert: {
          about?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          creator_id?: string | null
          end_date?: string | null
          entry_fee?: number | null
          format?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          registration_due_date?: string | null
          sport?: string | null
          start_date?: string | null
          state?: string | null
          team_limit?: number | null
          teams_registered?: number | null
          tournament_name: string
          user_id?: string | null
        }
        Update: {
          about?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          creator_id?: string | null
          end_date?: string | null
          entry_fee?: number | null
          format?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          registration_due_date?: string | null
          sport?: string | null
          start_date?: string | null
          state?: string | null
          team_limit?: number | null
          teams_registered?: number | null
          tournament_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_storage_policy: {
        Args: {
          bucket_name: string
        }
        Returns: undefined
      }
      create_tournament_announcement: {
        Args: {
          tournament_id: string
          sender_id: string
          title: string
          message_text: string
        }
        Returns: string
      }
      get_received_messages: {
        Args: {
          input_user_id: string
        }
        Returns: Json[]
      }
      get_sent_messages: {
        Args: {
          input_user_id: string
        }
        Returns: Json[]
      }
      get_tournament_announcements: {
        Args: {
          t_id: string
        }
        Returns: Json[]
      }
      get_user_tournaments: {
        Args: {
          input_user_id: string
        }
        Returns: Json[]
      }
      mark_message_as_read: {
        Args: {
          message_id: string
          current_user_id: string
        }
        Returns: boolean
      }
      send_private_message: {
        Args: {
          sender_id: string
          recipient_id: string
          tournament_id: string
          message_text: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
