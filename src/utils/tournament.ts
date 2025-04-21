import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteTournament = async (tournamentId: string) => {
  try {
    // 1. Get tournament details first to get file paths
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('logo_url, banner_url')
      .eq('id', tournamentId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Delete files from storage if they exist
    if (tournament) {
      const filesToDelete = [];
      
      if (tournament.logo_url) {
        const logoPath = tournament.logo_url.split('/').pop();
        if (logoPath) filesToDelete.push(logoPath);
      }
      
      if (tournament.banner_url) {
        const bannerPath = tournament.banner_url.split('/').pop();
        if (bannerPath) filesToDelete.push(bannerPath);
      }

      // Delete files from storage
      for (const filePath of filesToDelete) {
        const { error: storageError } = await supabase.storage
          .from('tournament-media')
          .remove([filePath]);
          
        if (storageError) {
          console.error('Error deleting file:', filePath, storageError);
        }
      }
    }

    // 3. Delete all related data in order
    // Delete tournament registrations
    const { error: registrationsError } = await supabase
      .from('tournament_registrations')
      .delete()
      .eq('tournament_id', tournamentId);

    if (registrationsError) throw registrationsError;

    // Delete tournament sports
    const { error: sportsError } = await supabase
      .from('tournament_sports')
      .delete()
      .eq('tournament_id', tournamentId);

    if (sportsError) throw sportsError;

    // Delete tournament announcements
    const { error: announcementsError } = await supabase
      .from('tournament_announcements')
      .delete()
      .eq('tournament_id', tournamentId);

    if (announcementsError) throw announcementsError;

    // Finally, delete the tournament itself
    const { error: deleteError } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId);

    if (deleteError) throw deleteError;

    toast.success('Tournament deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting tournament:', error);
    toast.error(error.message || 'Failed to delete tournament');
    return false;
  }
}; 