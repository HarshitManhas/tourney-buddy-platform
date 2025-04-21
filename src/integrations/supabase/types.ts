export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string;
          tournament_name: string;
          sport: string;
          format: string;
          start_date: string;
          end_date: string;
          registration_due_date: string;
          location: string;
          city: string;
          state: string;
          about: string;
          entry_fee: number;
          teams_registered: number;
          team_limit: number;
          image_url: string;
          creator_id: string;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          logo_url: string;
          banner_url: string;
        };
      };
      // Add other tables as needed
    };
  };
}
