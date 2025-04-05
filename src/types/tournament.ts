
import { z } from "zod";

export const tournamentFormSchema = z.object({
  tournamentName: z.string().min(3, "Tournament name must be at least 3 characters"),
  about: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  registrationDueDate: z.string().min(1, "Registration due date is required"),
  dueTime: z.string().min(1, "Due time is required"),
  contactName: z.string().min(3, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(3, "Address is required"),
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pinCode: z.string().optional(),
});

export type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

// Define the Tournament interface to match what's expected
export interface Tournament {
  id: string;
  tournament_name: string;
  sport: string;
  format: string;
  teams_registered: number;
  team_limit: number;
  participants_registered: number;
  entry_fee?: number | null;
  additionalDetails?: string;
  creator_id?: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  registration_due_date?: string;
  location?: string;
  city?: string;
  state?: string;
  about?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export type SportConfig = {
  id: string;
  sport: string;
  eventName: string;
  format: string;
  maxTeams?: number;
  maxParticipants?: number;
  gender: string;
  entryFee: string | number;
  playType?: string;
  additionalDetails?: string;
};
