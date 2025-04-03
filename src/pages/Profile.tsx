
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trophy, UserCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, username } = useAuth();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTournaments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('creator_id', user.id);

        if (error) {
          throw error;
        }

        setTournaments(data || []);
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
                Tournaments you've created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-4">Loading tournaments...</p>
                </div>
              ) : tournaments.length > 0 ? (
                <div className="divide-y">
                  {tournaments.map((tournament) => (
                    <div key={tournament.id} className="py-4">
                      <Link 
                        to={`/tournaments/${tournament.id}`}
                        className="block hover:bg-gray-50 rounded p-2 -mx-2"
                      >
                        <h3 className="font-medium">{tournament.tournament_name}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(tournament.start_date).toLocaleDateString()} - 
                            {new Date(tournament.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            {tournament.sport}
                          </div>
                          <div className="rounded-full bg-muted px-2 py-1 text-xs">
                            {tournament.teams_registered || 0} teams
                          </div>
                        </div>
                      </Link>
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
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
