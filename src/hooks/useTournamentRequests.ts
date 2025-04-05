
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tournament, JoinRequest } from "@/types/tournament";

export const useTournamentRequests = (tournamentId: string | undefined) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [processLoading, setProcessingLoading] = useState(false);

  useEffect(() => {
    fetchTournamentAndRequests();
  }, [tournamentId, user]);

  const fetchTournamentAndRequests = async () => {
    if (!tournamentId || !user) return;
    
    try {
      setLoading(true);
      
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();

      if (tournamentError) throw tournamentError;
      
      if (tournamentData.creator_id !== user.id) {
        toast.error("You do not have permission to view this page");
        navigate(`/tournaments/${tournamentId}`);
        return;
      }
      
      const tournament: Tournament = {
        id: tournamentData.id,
        tournament_name: tournamentData.tournament_name,
        sport: tournamentData.sport || "",
        format: tournamentData.format || "",
        teams_registered: tournamentData.teams_registered || 0,
        team_limit: tournamentData.team_limit || 0,
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
        additionalDetails: tournamentData.about,
        user_id: tournamentData.user_id
      };
      
      setTournament(tournament);
      
      const { data: requestsData, error: requestsError } = await supabase
        .from("tournament_join_requests")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("submitted_at", { ascending: false });
        
      if (requestsError) throw requestsError;
      
      setJoinRequests(requestsData as JoinRequest[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load tournament data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request: JoinRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleActionRequest = (request: JoinRequest, actionType: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setAction(actionType);
    setReviewerNotes('');
    setActionDialogOpen(true);
  };

  const processRequest = async () => {
    if (!selectedRequest || !action || !tournament) return;
    
    try {
      setProcessingLoading(true);
      
      const { error: updateError } = await supabase
        .from("tournament_join_requests")
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: reviewerNotes
        })
        .eq("id", selectedRequest.id);
        
      if (updateError) throw updateError;
      
      if (action === 'approve') {
        const { error: participantError } = await supabase
          .from("tournament_participants")
          .insert({
            tournament_id: tournament.id,
            user_id: selectedRequest.user_id,
            role: "player",
            joined_at: new Date().toISOString(),
          });
          
        if (participantError) throw participantError;
        
        const isDoubles = tournament.format?.includes("Doubles") || false;
        const isTeamSport = ["Cricket", "Football", "Basketball", "Volleyball", "Hockey"].includes(tournament.sport);
        const updateField = isDoubles || isTeamSport ? "teams_registered" : "participants_registered";
        
        const { error: tournamentError } = await supabase
          .from("tournaments")
          .update({ 
            [updateField]: tournament[updateField] + 1 
          })
          .eq("id", tournament.id);
          
        if (tournamentError) throw tournamentError;
      }
      
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setActionDialogOpen(false);
      
      fetchTournamentAndRequests();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessingLoading(false);
    }
  };

  const filteredRequests = joinRequests.filter(request => {
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'approved') return request.status === 'approved';
    if (activeTab === 'rejected') return request.status === 'rejected';
    return true;
  });

  return {
    tournament,
    joinRequests,
    loading,
    selectedRequest,
    viewDialogOpen,
    setViewDialogOpen,
    actionDialogOpen,
    setActionDialogOpen,
    action,
    reviewerNotes,
    setReviewerNotes,
    activeTab,
    setActiveTab,
    processLoading,
    filteredRequests,
    handleViewRequest,
    handleActionRequest,
    processRequest,
    fetchTournamentAndRequests
  };
};
