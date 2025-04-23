import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, MapPin, Users, Award, Clock, Info, UserPlus, ArrowLeft, MessageSquare, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComposeMessage from "@/components/messaging/ComposeMessage";
import TournamentAnnouncements from "@/components/messaging/TournamentAnnouncements";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { deleteTournament } from "@/utils/tournament";
import LoadingPage from "@/components/LoadingPage";
import TournamentManagement from "@/components/tournament/TournamentManagement";

type Tournament = Database['public']['Tables']['tournaments']['Row'];

// Create a partial version of Tournament for our component state
// This allows us to specify only the fields we need
interface TournamentDetails extends Partial<Tournament> {
  creator_name?: string;
  logo_url?: string;
  banner_url?: string;
  sports_config?: Array<{
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
  }>;
}

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showSportModal, setShowSportModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [approvedSports, setApprovedSports] = useState<string[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchTournamentDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // First fetch the tournament details
        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .select(`
            id, tournament_name, sport, format, start_date, end_date, 
            registration_due_date, location, city, state, about, 
            entry_fee, teams_registered, team_limit, image_url, creator_id,
            contact_name, contact_email, contact_phone, logo_url, banner_url
          `)
          .eq('id', id)
          .single();

        if (tournamentError) {
          console.error("Error fetching tournament:", tournamentError);
          toast.error("Failed to load tournament details");
          setTournament(null);
          return;
        }

        if (!tournamentData) {
          console.error("No tournament found with ID:", id);
          toast.error("Tournament not found");
          setTournament(null);
          return;
        }

        // Log creator_id for debugging
        console.log("Tournament creator_id:", tournamentData.creator_id);
        console.log("Current user ID:", user?.id);

        // Check if current user is the organizer - do this early
        const isUserOrganizer = user && tournamentData.creator_id === user.id;
        console.log("Is user the organizer?", isUserOrganizer);
        setIsOrganizer(isUserOrganizer);

        // Then fetch the sports configuration
        console.log("Fetching sports for tournament ID:", id);
        const { data: sportsData, error: sportsError } = await supabase
          .from('tournament_sports')
          .select('*')
          .eq('tournament_id', id);

        if (sportsError) {
          console.error("Error fetching sports configuration:", sportsError);
          console.error("Error details:", {
            message: sportsError.message,
            details: sportsError.details,
            hint: sportsError.hint,
            code: sportsError.code
          });
          // Continue with tournament data even if sports config fails
          } else {
          console.log("Sports data loaded successfully:", sportsData);
          if (!sportsData || sportsData.length === 0) {
            console.log("No sports data found for tournament");
          }
        }

        // Transform sports data to match our interface
        const transformedSports = sportsData?.map(sport => {
          console.log("Transforming sport:", sport);
          return {
            id: sport.id,
            sport: sport.sport,
            eventName: sport.event_name,
            format: sport.format,
            maxTeams: sport.max_teams,
            maxParticipants: sport.max_participants,
            gender: sport.gender,
            entryFee: sport.entry_fee,
            playType: sport.play_type,
            additionalDetails: sport.additional_details
          };
        }) || [];

        console.log("Transformed sports:", transformedSports);

        // Combine the data
        const combinedData = {
            ...tournamentData,
          creator_name: tournamentData.contact_name,
          sports_config: transformedSports
        };
        
        console.log("Final tournament data:", combinedData);
        setTournament(combinedData);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
        setTournament(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentDetails();
  }, [id, user]);

  // Add effect to update isOrganizer when user or tournament changes
  useEffect(() => {
    if (user && tournament) {
      const isUserOrganizer = tournament.creator_id === user.id;
      console.log("Rechecking if user is organizer:", isUserOrganizer);
      console.log("User ID:", user.id);
      console.log("Tournament creator ID:", tournament.creator_id);
      setIsOrganizer(isUserOrganizer);
    }
  }, [user, tournament]);

  // Debug logs to show the current value of isOrganizer
  useEffect(() => {
    console.log("isOrganizer value updated:", isOrganizer);
  }, [isOrganizer]);

  useEffect(() => {
    const checkRegistrationStatus = () => {
      if (tournament?.registration_due_date) {
        const dueDate = new Date(tournament.registration_due_date);
        const now = new Date();
        setIsRegistrationOpen(dueDate > now);
      }
    };

    checkRegistrationStatus();
    // Add debug logs
    console.log("Auth state:", {
      user: user,
      creatorId: tournament?.creator_id,
      isRegistrationOpen: isRegistrationOpen
    });
  }, [tournament?.registration_due_date, user]);
  
  useEffect(() => {
    const fetchApprovedSports = async () => {
      if (!user || !tournament?.id) return;

      try {
        const { data, error } = await supabase
          .from('tournament_registrations')
          .select('sport')
          .eq('tournament_id', tournament.id)
          .eq('user_id', user.id)
          .eq('status', 'approved');

        if (error) throw error;

        setApprovedSports(data?.map(reg => reg.sport) || []);
      } catch (error) {
        console.error('Error fetching approved sports:', error);
      }
    };

    fetchApprovedSports();
  }, [user, tournament?.id]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!tournament?.id) return;

      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('tournament_id', tournament.id);

        if (error) throw error;

        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, [tournament?.id]);

  // Add debug logs to show why the button isn't visible
  useEffect(() => {
    console.log("Join button visibility conditions:", {
      userExists: !!user,
      isNotCreator: user && tournament ? tournament.creator_id !== user.id : false,
      isRegistrationOpen,
      combinedCheck: !!user && tournament && tournament.creator_id !== user.id
    });
  }, [user, tournament, isRegistrationOpen]);

  const isFull = tournament 
    ? (tournament.teams_registered || 0) >= (tournament.team_limit || 0) 
    : false;

  const handleJoinClick = (sport: any) => {
    // Navigate to the join page with the selected sport
    navigate(`/tournaments/${tournament?.id}/join/${encodeURIComponent(sport.sport)}`, {
      state: { sportDetails: sport }
    });
  };

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
    setShowSportModal(false);
    // Navigate to the registration form for the selected sport
    navigate(`/tournaments/${tournament?.id}/join/${encodeURIComponent(sport)}`);
  };

  const handleJoinTournament = async (sport?: any) => {
    try {
      if (!user) {
        toast.error("Please login to join the tournament");
        return;
      }

      if (!tournament?.id) {
        toast.error("Tournament information is missing");
        return;
      }

      // If no specific sport is provided, show the sport selection modal
      if (!sport && tournament.sports_config && tournament.sports_config.length > 0) {
        setShowSportModal(true);
        return;
      }

      // Check if user has already registered for this sport
      const { data: existingRegistration, error: checkError } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('user_id', user.id)
        .eq('sport', sport?.sport || tournament.sport)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError;
      }

      if (existingRegistration) {
        toast.error("You have already registered for this sport in the tournament");
        return;
      }

      // Register user for the tournament
      const { error: registrationError } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
          status: 'pending',
          sport: sport?.sport || tournament.sport,
          event_name: sport?.eventName,
          entry_fee: sport?.entryFee,
          registration_date: new Date().toISOString()
        });

      if (registrationError) throw registrationError;

      toast.success("Successfully registered for the tournament!");
      
      // Refresh the page or update the UI
      window.location.reload();
    } catch (error: any) {
      console.error("Error joining tournament:", error);
      toast.error(error.message || "Failed to join tournament");
    }
  };

  const handleDelete = async () => {
    if (!tournament?.id) return;
    
    if (window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      const success = await deleteTournament(tournament.id);
      if (success) {
        navigate('/tournaments');
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 py-8">
        {loading ? (
          <LoadingPage message="Loading tournament details..." />
        ) : tournament ? (
          <div className="space-y-8">
            {/* Banner and About Section */}
            <div className="relative">
              <div className="relative h-64 w-full overflow-hidden rounded-lg">
                {tournament.banner_url ? (
                  <img
                    src={tournament.banner_url}
                    alt="Tournament banner"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Trophy className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 left-6 transform -translate-y-1/2">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background bg-white shadow-md">
                    {tournament.logo_url ? (
                      <AvatarImage src={tournament.logo_url} alt="Tournament logo" />
                    ) : (
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <Trophy className="h-10 w-10" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>
            </div>

            {/* About Section */}
            {tournament.about && (
              <div className="mt-8 rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-xl font-semibold">About the Tournament</h2>
                <p className="text-muted-foreground">{tournament.about}</p>
              </div>
            )}

            {/* Add Join Tournament Button exactly where the blue box is drawn - highly visible, unconditional */}
            <div className="my-6 flex justify-center">
              <Button 
                size="lg"
                onClick={() => user ? handleJoinTournament() : toast.error("Please login to join the tournament")}
                className="bg-primary text-white hover:bg-primary/90 px-10 py-6 text-xl font-bold shadow-lg rounded-xl w-full sm:w-auto"
              >
                JOIN TOURNAMENT
              </Button>
            </div>

            {/* Tournament Information */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                {(() => {
                  console.log("TabsTrigger check - isOrganizer:", isOrganizer);
                  return isOrganizer && (
                    <TabsTrigger value="management">Management</TabsTrigger>
                  );
                })()}
                {approvedSports.length > 0 && (
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-2xl font-bold">{tournament.tournament_name}</h2>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{tournament.location}, {tournament.city}, {tournament.state}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4" />
                        <span>
                          {new Date(tournament.start_date || '').toLocaleDateString()} - {new Date(tournament.end_date || '').toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span>Registration Due: {new Date(tournament.registration_due_date || '').toLocaleDateString()}</span>
                      </div>
                    </div>

                    {tournament.about && (
                      <div>
                        <h3 className="mb-2 text-lg font-semibold">About</h3>
                        <p className="text-muted-foreground">{tournament.about}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Sports & Events</h3>
                      {tournament.sports_config && tournament.sports_config.length > 0 ? (
                        <div className="space-y-4">
                          {tournament.sports_config.map((sport) => (
                            <div key={sport.id} className="rounded-lg border p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{sport.sport}</div>
                                  <div className="text-sm text-muted-foreground">{sport.eventName}</div>
                                  <div className="mt-2 flex items-center gap-2 text-sm flex-wrap">
                                    {sport.format && (
                                      <Badge variant="secondary">{sport.format}</Badge>
                                    )}
                                    {sport.gender && (
                                      <Badge variant="secondary">{sport.gender}</Badge>
                                    )}
                                    {sport.playType && (
                                      <Badge variant="secondary">{sport.playType}</Badge>
                                    )}
                                  </div>
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    Entry Fee: ₹{sport.entryFee}
                                  </div>
                                </div>
                                {user && tournament.creator_id !== user.id && (
                                  <div>
                                    {isRegistrationOpen ? (
                                      <Button 
                                        onClick={() => handleJoinTournament(sport)}
                                        className="bg-primary text-white hover:bg-primary/90"
                                      >
                                        Join
                                      </Button>
                                    ) : (
                                      <Button 
                                        disabled 
                                        className="bg-gray-400 cursor-not-allowed"
                                      >
                                        Closed
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">
                          No sports details available.
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Contact Information</h3>
                      <div className="space-y-2 text-muted-foreground">
                        <p>Organizer: {tournament.contact_name}</p>
                        <p>Email: {tournament.contact_email}</p>
                        <p>Phone: {tournament.contact_phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="announcements">
                <TournamentAnnouncements tournamentId={id || ""} isOrganizer={isOrganizer} />
              </TabsContent>

              {(() => {
                console.log("TabsContent check - isOrganizer:", isOrganizer);
                return isOrganizer && (
                  <TabsContent value="management">
                    <TournamentManagement 
                      tournamentId={id || ""} 
                      sports={tournament?.sports_config || []} 
                    />
                  </TabsContent>
                );
              })()}

              {approvedSports.length > 0 && (
                <TabsContent value="schedule">
                  <div className="space-y-6">
                    {approvedSports.map((sport) => {
                      const sportConfig = tournament?.sports_config?.find(s => s.sport === sport);
                      return (
                        <div key={sport} className="rounded-lg border bg-card p-6">
                          <h3 className="mb-4 text-xl font-semibold">{sportConfig?.sport} - {sportConfig?.eventName}</h3>
                          
                          {/* Team Details */}
                          <div className="mb-6">
                            <h4 className="mb-2 text-lg font-medium">Team Details</h4>
                            <div className="rounded-md border p-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Team Name</TableHead>
                                    <TableHead>Players</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {teams
                                    .filter(team => team.sport === sport)
                                    .map((team) => (
                                      <TableRow key={team.id}>
                                        <TableCell>
                                          <Button
                                            variant="link"
                                            className="p-0 h-auto"
                                            onClick={() => navigate(`/teams/${team.id}`)}
                                          >
                                            {team.name}
                                          </Button>
                                        </TableCell>
                                        <TableCell>
                                          {team.players?.map(p => p.name).join(', ') || 'No players'}
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            variant="outline"
                                            onClick={() => navigate(`/teams/${team.id}`)}
                                          >
                                            Manage Team
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  {teams.filter(team => team.sport === sport).length === 0 && (
                                    <TableRow>
                                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No teams created yet
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          {/* Bracket */}
                          <div className="mb-6">
                            <h4 className="mb-2 text-lg font-medium">Tournament Bracket</h4>
                            <div className="rounded-md border p-4">
                              {/* Bracket will be shown here */}
                              <p className="text-muted-foreground">Loading bracket...</p>
                            </div>
                          </div>

                          {/* Schedule */}
                          <div>
                            <h4 className="mb-2 text-lg font-medium">Match Schedule</h4>
                            <div className="rounded-md border p-4">
                              {/* Schedule will be shown here */}
                              <p className="text-muted-foreground">Loading schedule...</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {user && tournament.creator_id === user.id && (
              <div className="flex gap-4">
                <Button asChild>
                  <Link to={`/tournaments/${id}/edit`}>Edit Tournament</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/tournaments/${id}/requests`}>View Requests</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-xl text-muted-foreground">Tournament not found</div>
          </div>
        )}
      </div>
      <Footer />

      <Dialog open={showSportModal} onOpenChange={setShowSportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Sport</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {tournament?.sports_config?.map((sport: any) => (
              <Button key={sport.id} onClick={() => handleSportSelect(sport.sport)}>
                {sport.sport} - {sport.eventName}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSportModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentDetail;
