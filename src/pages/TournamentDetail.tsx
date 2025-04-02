
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, MapPin, Users, Award, Clock, Info, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface TournamentDetails {
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
  entry_fee: number | null;
  teams_registered: number;
  team_limit: number;
  image_url: string | null;
  creator_id: string;
  creator_name: string;
  contact_email: string;
  contact_phone: string;
}

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  
  useEffect(() => {
    const fetchTournamentDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tournaments')
          .select(`
            id, tournament_name, sport, format, start_date, end_date, 
            registration_due_date, location, city, state, about, 
            entry_fee, teams_registered, team_limit, image_url, creator_id,
            contact_name as creator_name, contact_email, contact_phone
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setTournament(data);
      } catch (error) {
        console.error("Error fetching tournament details:", error);
        toast.error("Failed to load tournament details");
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentDetails();
  }, [id]);

  const handleJoinTournament = async () => {
    if (!tournament) return;
    
    try {
      setJoining(true);
      
      // In a real application, this would add the user to tournament participants
      // For now, we'll just show a success message
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Successfully joined the tournament!");
      
      // Update local state to reflect the user has joined
      setTournament(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          teams_registered: prev.teams_registered + 1
        };
      });
    } catch (error) {
      console.error("Error joining tournament:", error);
      toast.error("Failed to join tournament");
    } finally {
      setJoining(false);
    }
  };

  const isRegistrationOpen = tournament 
    ? new Date(tournament.registration_due_date) > new Date() 
    : false;
  
  const isFull = tournament 
    ? tournament.teams_registered >= tournament.team_limit 
    : false;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Button asChild variant="outline" className="mb-6">
            <Link to="/tournaments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tournaments
            </Link>
          </Button>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ) : tournament ? (
            <>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{tournament.tournament_name}</h1>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className="bg-primary">{tournament.sport}</Badge>
                    <Badge className="bg-secondary">{tournament.format}</Badge>
                  </div>
                </div>
                
                {isRegistrationOpen && !isFull ? (
                  <Button 
                    size="lg" 
                    className="gap-2"
                    onClick={handleJoinTournament}
                    disabled={joining}
                  >
                    <UserPlus className="h-5 w-5" />
                    {joining ? "Joining..." : "Join Tournament"}
                  </Button>
                ) : (
                  <Button size="lg" className="gap-2" disabled>
                    {isFull ? "Tournament Full" : "Registration Closed"}
                  </Button>
                )}
              </div>
              
              <div className="mb-8 grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div 
                    className="mb-6 h-64 w-full rounded-lg bg-muted bg-cover bg-center"
                    style={{
                      backgroundImage: tournament.image_url 
                        ? `url(${tournament.image_url})` 
                        : 'linear-gradient(to right, hsl(var(--primary)/0.8), hsl(var(--secondary)/0.8))'
                    }}
                  />
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <h2 className="text-xl font-semibold">About This Tournament</h2>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {tournament.about || "No description provided."}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-semibold">Tournament Details</h2>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Sport</TableCell>
                            <TableCell>{tournament.sport}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Format</TableCell>
                            <TableCell>{tournament.format}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Entry Fee</TableCell>
                            <TableCell>{tournament.entry_fee ? `₹${tournament.entry_fee}` : "Free"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Teams</TableCell>
                            <TableCell>{tournament.teams_registered} / {tournament.team_limit}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="mb-6">
                    <CardHeader>
                      <h2 className="text-lg font-semibold">Tournament Information</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CalendarCheck className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Tournament Dates</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Registration Deadline</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tournament.registration_due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">
                            {[tournament.location, tournament.city, tournament.state]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold">Organizer Contact</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Contact Person</p>
                          <p className="text-sm text-muted-foreground">
                            {tournament.creator_name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">
                            {tournament.contact_email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">
                            {tournament.contact_phone}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <h2 className="text-2xl font-bold">Tournament Not Found</h2>
              <p className="mt-2 text-muted-foreground">
                The tournament you're looking for doesn't exist or may have been removed.
              </p>
              <Button asChild className="mt-4">
                <Link to="/tournaments">See All Tournaments</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TournamentDetail;
