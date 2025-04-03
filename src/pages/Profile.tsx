
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Trophy, UserCircle, Calendar, Edit, Trash2, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Tournament = Database['public']['Tables']['tournaments']['Row'];
type TournamentParticipant = Database['public']['Tables']['tournament_participants']['Row'];

const Profile = () => {
  const { user, username } = useAuth();
  const navigate = useNavigate();
  const [createdTournaments, setCreatedTournaments] = useState<Tournament[]>([]);
  const [joinedTournaments, setJoinedTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [tournamentToDelete, setTournamentToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTournaments = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch tournaments created by the user
        const { data: createdData, error: createdError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('creator_id', user.id);

        if (createdError) throw createdError;
        setCreatedTournaments(createdData || []);

        // Fetch tournaments joined by the user
        const { data: participantsData, error: participantsError } = await supabase
          .from('tournament_participants')
          .select('tournament_id')
          .eq('user_id', user.id)
          .eq('role', 'participant');

        if (participantsError) throw participantsError;

        if (participantsData && participantsData.length > 0) {
          const tournamentIds = participantsData.map(p => p.tournament_id);
          
          const { data: joinedData, error: joinedError } = await supabase
            .from('tournaments')
            .select('*')
            .in('id', tournamentIds);

          if (joinedError) throw joinedError;
          setJoinedTournaments(joinedData || []);
        } else {
          setJoinedTournaments([]);
        }
      } catch (error: any) {
        console.error('Error fetching tournaments:', error);
        toast({
          title: "Error",
          description: "Failed to load your tournaments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserTournaments();
  }, [user]);

  const handleDeleteTournament = async () => {
    if (!tournamentToDelete) return;

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentToDelete)
        .eq('creator_id', user?.id);

      if (error) throw error;

      setCreatedTournaments(prev => prev.filter(t => t.id !== tournamentToDelete));
      
      toast({
        title: "Success",
        description: "Tournament deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting tournament:', error);
      toast({
        title: "Error",
        description: "Failed to delete tournament",
        variant: "destructive",
      });
    } finally {
      setTournamentToDelete(null);
    }
  };

  const handleLeaveTournament = async (tournamentId: string) => {
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setJoinedTournaments(prev => prev.filter(t => t.id !== tournamentId));
      
      toast({
        title: "Success",
        description: "You've left the tournament successfully",
      });
    } catch (error: any) {
      console.error('Error leaving tournament:', error);
      toast({
        title: "Error",
        description: "Failed to leave tournament",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Not Logged In</CardTitle>
              <CardDescription>Please log in to view your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account and tournaments</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-6 w-6" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Username</p>
                  <p>{username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p>{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                My Tournaments
              </CardTitle>
              <CardDescription>
                Tournaments you've created and joined
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-4">Loading tournaments...</p>
                </div>
              ) : (
                <Tabs defaultValue="created">
                  <TabsList className="mb-4">
                    <TabsTrigger value="created">Created</TabsTrigger>
                    <TabsTrigger value="joined">Joined</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="created">
                    {createdTournaments.length > 0 ? (
                      <div className="divide-y">
                        {createdTournaments.map((tournament) => (
                          <div key={tournament.id} className="py-4">
                            <div className="flex justify-between">
                              <Link 
                                to={`/tournaments/${tournament.id}`}
                                className="block hover:bg-gray-50 rounded p-2 -mx-2"
                              >
                                <h3 className="font-medium">{tournament.tournament_name}</h3>
                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'N/A'} - 
                                    {tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : 'N/A'}
                                  </span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                    {tournament.sport || 'General'}
                                  </div>
                                  <div className="rounded-full bg-muted px-2 py-1 text-xs">
                                    {tournament.teams_registered || 0}/{tournament.team_limit || 10} teams
                                  </div>
                                </div>
                              </Link>
                              <div className="flex flex-col space-y-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => navigate(`/tournaments/${tournament.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setTournamentToDelete(tournament.id)}
                                  className="text-destructive hover:text-destructive/90"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">You haven't created any tournaments yet</p>
                        <Button asChild className="mt-4">
                          <Link to="/create-tournament">
                            <Trophy className="mr-2 h-4 w-4" />
                            Create Tournament
                          </Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="joined">
                    {joinedTournaments.length > 0 ? (
                      <div className="divide-y">
                        {joinedTournaments.map((tournament) => (
                          <div key={tournament.id} className="py-4">
                            <div className="flex justify-between">
                              <Link 
                                to={`/tournaments/${tournament.id}`}
                                className="block hover:bg-gray-50 rounded p-2 -mx-2"
                              >
                                <h3 className="font-medium">{tournament.tournament_name}</h3>
                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="h-4 w-4" />
                                  <span>Organized by {tournament.contact_name}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                    {tournament.sport || 'General'}
                                  </div>
                                </div>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleLeaveTournament(tournament.id)}
                                className="h-8"
                              >
                                Leave
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">You haven't joined any tournaments yet</p>
                        <Button asChild className="mt-4">
                          <Link to="/tournaments">
                            Browse Tournaments
                          </Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />

      <AlertDialog open={tournamentToDelete !== null} onOpenChange={(open) => !open && setTournamentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tournament and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTournament} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
