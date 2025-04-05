
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import JoinForm from "@/components/tournament/JoinForm";
import PageLayout from "@/components/PageLayout";
import { Tournament } from "@/types/tournament";

const JoinTournament = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return;
      
      try {
        // Fetch tournament details
        const { data: tournamentData, error: tournamentError } = await supabase
          .from("tournaments")
          .select("*")
          .eq("id", id)
          .single();

        if (tournamentError) throw tournamentError;
        
        if (!tournamentData) {
          toast.error("Tournament not found");
          navigate("/tournaments");
          return;
        }

        // Create a Tournament object with required properties
        const tournament: Tournament = {
          id: tournamentData.id,
          tournament_name: tournamentData.tournament_name,
          sport: tournamentData.sport || "",
          format: tournamentData.format || "",
          teams_registered: tournamentData.teams_registered || 0,
          team_limit: tournamentData.team_limit || 0,
          // Add a default value for participants_registered since it might not exist in the database response
          participants_registered: tournamentData.participants_registered || 0,
          entry_fee: tournamentData.entry_fee,
          creator_id: tournamentData.creator_id,
          image_url: tournamentData.image_url,
          start_date: tournamentData.start_date,
          end_date: tournamentData.end_date,
          registration_due_date: tournamentData.registration_due_date,
          location: tournamentData.location,
          city: tournamentData.city,
          state: tournamentData.state,
          about: tournamentData.about,
          contact_name: tournamentData.contact_name,
          contact_email: tournamentData.contact_email,
          contact_phone: tournamentData.contact_phone,
          additionalDetails: tournamentData.about
        };
        
        setTournament(tournament);
        
        if (user) {
          // Check if user already joined this tournament
          const { data: participantData, error: participantError } = await supabase
            .from("tournament_participants")
            .select("*")
            .eq("tournament_id", id)
            .eq("user_id", user.id)
            .single();
            
          if (participantError && participantError.code !== "PGRST116") {
            console.error("Error checking participation:", participantError);
          }
          
          setAlreadyJoined(!!participantData);
        }
      } catch (error) {
        console.error("Error fetching tournament:", error);
        toast.error("Failed to load tournament details");
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <PageLayout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-xl">Loading tournament details...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!tournament) {
    return (
      <PageLayout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-xl text-red-500">Tournament not found</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{tournament.tournament_name}</h1>
          <p className="text-lg text-gray-600 mb-4">
            Sport: {tournament.sport} | Format: {tournament.format}
          </p>
          
          {alreadyJoined ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p className="font-medium">You have already joined this tournament.</p>
              <button 
                onClick={() => navigate(`/tournaments/${id}`)}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                View Tournament Details
              </button>
            </div>
          ) : (
            <JoinForm tournament={tournament} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default JoinTournament;
