// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lnqrendpjvjyztktrnpj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXJlbmRwanZqeXp0a3RybnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTIzOTksImV4cCI6MjA1ODk4ODM5OX0.66zQKz4R7EK22S2iAB-olpquhsjbwNw-tqmmqEeWZF0";

// Create a custom type that extends the Database type with the tournament_join_requests table
type CustomDatabase = Database & {
  public: {
    Tables: {
      tournament_join_requests: {
        Row: {
          id: string;
          player_name: string;
          gender: string;
          mobile_no: string;
          roles: string[];
          partner_name?: string;
          partner_gender?: string;
          partner_mobile_no?: string;
          additional_info?: string;
          payment_proof_url: string;
          status: 'pending' | 'approved' | 'rejected';
          submitted_at: string;
          reviewed_at?: string;
          reviewer_notes?: string;
          user_id: string;
          tournament_id: string;
        };
        Insert: {
          id?: string;
          player_name: string;
          gender: string;
          mobile_no: string;
          roles?: string[];
          partner_name?: string;
          partner_gender?: string;
          partner_mobile_no?: string;
          additional_info?: string;
          payment_proof_url?: string;
          status?: 'pending' | 'approved' | 'rejected';
          submitted_at?: string;
          reviewed_at?: string;
          reviewer_notes?: string;
          user_id: string;
          tournament_id: string;
        };
        Update: {
          id?: string;
          player_name?: string;
          gender?: string;
          mobile_no?: string;
          roles?: string[];
          partner_name?: string;
          partner_gender?: string;
          partner_mobile_no?: string;
          additional_info?: string;
          payment_proof_url?: string;
          status?: 'pending' | 'approved' | 'rejected';
          submitted_at?: string;
          reviewed_at?: string;
          reviewer_notes?: string;
          user_id?: string;
          tournament_id?: string;
        };
      };
      // Keep all other tables from the Database type
      private_messages: Database['public']['Tables']['private_messages'];
      profiles: Database['public']['Tables']['profiles'];
      tournament_announcements: Database['public']['Tables']['tournament_announcements'];
      tournament_participants: Database['public']['Tables']['tournament_participants'];
      tournaments: Database['public']['Tables']['tournaments'];
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<CustomDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
