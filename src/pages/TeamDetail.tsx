import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";

interface Player {
  id: string;
  name: string;
  sport: string;
  tournament_id: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  sport: string;
  tournament_id: string;
  created_at: string;
  players?: Player[];
}

const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamDetails();
    fetchAvailablePlayers();
  }, [teamId]);

  const fetchTeamDetails = async () => {
    if (!teamId) return;

    try {
      // Fetch team details
      const { data: teamData, error: teamError } = await supabase
        .from('tournament_teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;

      // Fetch team players
      const { data: teamPlayers, error: playersError } = await supabase
        .from('team_players')
        .select(`
          player_id,
          tournament_players (
            id,
            name,
            sport,
            tournament_id,
            created_at
          )
        `)
        .eq('team_id', teamId);

      if (playersError) throw playersError;

      setTeam({
        ...teamData,
        players: teamPlayers?.map(tp => tp.tournament_players) || []
      });
    } catch (error) {
      console.error('Error fetching team details:', error);
      toast.error('Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlayers = async () => {
    if (!teamId) return;

    try {
      // First get the team to know which sport we're dealing with
      const { data: teamData, error: teamError } = await supabase
        .from('tournament_teams')
        .select('sport, tournament_id')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;

      // Get all players for this sport and tournament
      const { data: playersData, error: playersError } = await supabase
        .from('tournament_players')
        .select('*')
        .eq('sport', teamData.sport)
        .eq('tournament_id', teamData.tournament_id);

      if (playersError) throw playersError;

      // Get players already in the team
      const { data: teamPlayers, error: teamPlayersError } = await supabase
        .from('team_players')
        .select('player_id')
        .eq('team_id', teamId);

      if (teamPlayersError) throw teamPlayersError;

      // Filter out players already in the team
      const availablePlayers = playersData?.filter(
        player => !teamPlayers?.some(tp => tp.player_id === player.id)
      ) || [];

      setPlayers(availablePlayers);
    } catch (error) {
      console.error('Error fetching available players:', error);
      toast.error('Failed to load available players');
    }
  };

  const handleAddPlayer = async (playerId: string) => {
    if (!teamId) return;

    try {
      const { error } = await supabase
        .from('team_players')
        .insert({
          team_id: teamId,
          player_id: playerId
        });

      if (error) throw error;

      toast.success('Player added to team successfully');
      // Refresh both team details and available players
      await Promise.all([fetchTeamDetails(), fetchAvailablePlayers()]);
    } catch (error) {
      console.error('Error adding player to team:', error);
      toast.error('Failed to add player to team');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!teamId) return;

    try {
      const { error } = await supabase
        .from('team_players')
        .delete()
        .eq('team_id', teamId)
        .eq('player_id', playerId);

      if (error) throw error;

      toast.success('Player removed from team successfully');
      // Refresh both team details and available players
      await Promise.all([fetchTeamDetails(), fetchAvailablePlayers()]);
    } catch (error) {
      console.error('Error removing player from team:', error);
      toast.error('Failed to remove player from team');
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading team details...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-500">Team not found</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Team Players */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Team Players</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player Name</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.players?.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              onClick={() => handleRemovePlayer(player.id)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!team.players || team.players.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            No players in the team yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Add Players Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Add Players</h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search players..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player Name</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlayers.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>
                            <Button onClick={() => handleAddPlayer(player.id)}>
                              Add to Team
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredPlayers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            {searchQuery ? 'No players found' : 'No available players'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeamDetail; 