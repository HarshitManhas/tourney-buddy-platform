import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

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
  players: string;
}

interface Match {
  id: string;
  tournament_id: string;
  sport: string;
  round: number;
  match_number: number;
  player1_id?: string;
  player2_id?: string;
  team1_id?: string;
  team2_id?: string;
  scheduled_time: string;
  status: 'pending' | 'completed' | 'cancelled';
  winner_id?: string;
}

interface TournamentManagementProps {
  tournamentId: string;
  sports: Array<{
    id: string;
    sport: string;
    eventName: string;
    format: string;
    maxTeams?: number;
    maxParticipants?: number;
    gender: string;
    entryFee: string | number;
    playType?: string;
  }>;
}

const TournamentManagement = ({ tournamentId, sports }: TournamentManagementProps) => {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [newTeamName, setNewTeamName] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("teams");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  useEffect(() => {
    if (selectedSport) {
      const selectedSportData = sports.find(s => s.sport === selectedSport);
      if (selectedSportData?.playType === 'singles') {
        fetchSinglesPlayers();
      } else {
        fetchTeams();
      }
    }
  }, [selectedSport, tournamentId]);

  const fetchSinglesPlayers = async () => {
    if (!tournamentId || !selectedSport) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching singles players for:', { tournamentId, selectedSport });
      
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select(`
          id,
          player_name,
          sport,
          status,
          created_at
        `)
        .eq('tournament_id', tournamentId)
        .eq('sport', selectedSport)
        .eq('status', 'approved');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.log('No data returned from query');
        setPlayers([]);
        return;
      }

      console.log('Received players data:', data);

      const transformedPlayers = data.map(reg => ({
        id: reg.id,
        name: reg.player_name,
        sport: reg.sport,
        tournament_id: tournamentId,
        created_at: reg.created_at
      }));

      console.log('Transformed players:', transformedPlayers);
      setPlayers(transformedPlayers);
    } catch (error: any) {
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error(`Failed to load players: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    if (!selectedSport) return;
    
    try {
      // For doubles/mixed sports, fetch from tournament_registrations
      const selectedSportData = sports.find(s => s.sport === selectedSport);
      if (selectedSportData?.playType === 'doubles' || selectedSportData?.playType === 'mixed') {
        const { data, error } = await supabase
          .from('tournament_registrations')
          .select(`
            id,
            player_name,
            partner_name,
            sport,
            status,
            created_at
          `)
          .eq('tournament_id', tournamentId)
          .eq('sport', selectedSport)
          .eq('status', 'approved');

        if (error) throw error;

        // Transform registration data into teams
        const transformedTeams = data.map((reg, index) => ({
          id: reg.id,
          name: `Team ${index + 1}`,
          sport: reg.sport,
          tournament_id: tournamentId,
          created_at: reg.created_at,
          players: `${reg.player_name}, ${reg.partner_name}`
        }));

        setTeams(transformedTeams);
      } else {
        // For other sports (like auction), fetch from tournament_teams
        const { data, error } = await supabase
          .from('tournament_teams')
          .select(`
            *,
            team_players (
              tournament_players (
                id,
                name
              )
            )
          `)
          .eq('tournament_id', tournamentId)
          .eq('sport', selectedSport);

        if (error) throw error;

        const transformedTeams = data.map(team => ({
          ...team,
          players: team.team_players?.map((tp: any) => tp.tournament_players.name).join(', ') || 'No players'
        }));

        setTeams(transformedTeams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName || !selectedSport) {
      toast.error('Please select a sport and enter a team name');
      return;
    }

    try {
      // First check if a team with this name already exists
      const { data: existingTeam, error: checkError } = await supabase
        .from('tournament_teams')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('name', newTeamName)
        .single();

      if (existingTeam) {
        toast.error('A team with this name already exists');
        return;
      }

      // Create the new team
      const { data, error } = await supabase
        .from('tournament_teams')
        .insert({
          name: newTeamName,
          sport: selectedSport,
          tournament_id: tournamentId
        })
        .select()
        .single();

      if (error) {
        console.error('Team creation error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        if (error.code === '42501') {
          toast.error('You do not have permission to create teams');
        } else if (error.code === '23505') {
          toast.error('A team with this name already exists');
        } else {
          toast.error('Failed to create team: ' + error.message);
        }
        return;
      }

      toast.success('Team created successfully');
      setNewTeamName("");
      await fetchTeams(); // Immediately fetch updated teams
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAddPlayersToTeam = async (teamId: string) => {
    if (selectedPlayers.length === 0) {
      toast.error('Please select players to add');
      return;
    }

    try {
      const { error } = await supabase
        .from('team_players')
        .insert(
          selectedPlayers.map(playerId => ({
            team_id: teamId,
            player_id: playerId
          }))
        );

      if (error) throw error;

      await fetchTeams();
      setSelectedPlayers([]);
      toast.success('Players added to team successfully');
    } catch (error) {
      console.error('Error adding players to team:', error);
      toast.error('Failed to add players to team');
    }
  };

  const generateBracket = async () => {
    if (!selectedSport) {
      toast.error('Please select a sport first');
      return;
    }

    const selectedSportData = sports.find(s => s.sport === selectedSport);
    if (!selectedSportData) return;

    try {
      let newMatches: Match[] = [];
      let matchNumber = 1;

      if (selectedSportData.playType === 'singles') {
        // For singles sports, use players directly
        const sportPlayers = players.filter(p => p.sport === selectedSport);
        if (sportPlayers.length < 2) {
          toast.error('Need at least 2 players to generate a bracket');
          return;
        }

        const shuffledPlayers = [...sportPlayers].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffledPlayers.length; i += 2) {
          if (i + 1 < shuffledPlayers.length) {
            newMatches.push({
              id: crypto.randomUUID(),
              tournament_id: tournamentId,
              sport: selectedSport,
              round: 1,
              match_number: matchNumber++,
              player1_id: shuffledPlayers[i].id,
              player2_id: shuffledPlayers[i + 1].id,
              scheduled_time: new Date().toISOString(),
              status: 'pending'
            });
          }
        }
      } else if (selectedSportData.playType === 'doubles' || selectedSportData.playType === 'mixed') {
        // For doubles/mixed sports, use existing teams
        const sportTeams = teams.filter(t => t.sport === selectedSport);
        if (sportTeams.length < 2) {
          toast.error('Need at least 2 teams to generate a bracket');
          return;
        }

        const shuffledTeams = [...sportTeams].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffledTeams.length; i += 2) {
          if (i + 1 < shuffledTeams.length) {
            newMatches.push({
              id: crypto.randomUUID(),
              tournament_id: tournamentId,
              sport: selectedSport,
              round: 1,
              match_number: matchNumber++,
              team1_id: shuffledTeams[i].id,
              team2_id: shuffledTeams[i + 1].id,
              scheduled_time: new Date().toISOString(),
              status: 'pending'
            });
          }
        }
      } else if (selectedSportData.playType === 'auction') {
        // For auction sports, use teams with players
        const sportTeams = teams.filter(t => t.sport === selectedSport);
        if (sportTeams.length < 2) {
          toast.error('Need at least 2 teams to generate a bracket');
          return;
        }

        const shuffledTeams = [...sportTeams].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffledTeams.length; i += 2) {
          if (i + 1 < shuffledTeams.length) {
            newMatches.push({
              id: crypto.randomUUID(),
              tournament_id: tournamentId,
              sport: selectedSport,
              round: 1,
              match_number: matchNumber++,
              team1_id: shuffledTeams[i].id,
              team2_id: shuffledTeams[i + 1].id,
              scheduled_time: new Date().toISOString(),
              status: 'pending'
            });
          }
        }
      }

      // Insert matches into database
      const { error } = await supabase
        .from('tournament_matches')
        .insert(newMatches);

      if (error) throw error;

      await fetchTeams();
      toast.success('Bracket generated successfully');
    } catch (error) {
      console.error('Error generating bracket:', error);
      toast.error('Failed to generate bracket');
    }
  };

  const handleUpdateMatchSchedule = async (matchId: string, newTime: string) => {
    try {
      const { error } = await supabase
        .from('tournament_matches')
        .update({ scheduled_time: newTime })
        .eq('id', matchId);

      if (error) throw error;

      await fetchTeams();
      toast.success('Match schedule updated');
    } catch (error) {
      console.error('Error updating match schedule:', error);
      toast.error('Failed to update match schedule');
    }
  };

  const renderContent = () => {
    if (!selectedSport) return null;

    const selectedSportData = sports.find(s => s.sport === selectedSport);
    if (!selectedSportData) return null;

    if (selectedSportData.playType === 'singles') {
      return (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player Name</TableHead>
                <TableHead>Registration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Loading players...
                  </TableCell>
                </TableRow>
              ) : players.length > 0 ? (
                players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>{new Date(player.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No players registered yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (selectedSportData.playType === 'doubles' || selectedSportData.playType === 'mixed') {
      return (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Registration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Loading teams...
                  </TableCell>
                </TableRow>
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>{team.players}</TableCell>
                    <TableCell>{new Date(team.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No teams registered yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    }

    // For auction sports, show team creation and management
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleCreateTeam}>Create Team</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Loading teams...
                </TableCell>
              </TableRow>
            ) : teams.length > 0 ? (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.players}</TableCell>
                  <TableCell>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/teams/${team.id}`)}
                    >
                      Add Players
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No teams created yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Teams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4 items-center">
            <Select value={selectedSport} onValueChange={(value) => {
              setSelectedSport(value);
              setTeams([]);
              setPlayers([]);
              setLoading(true);
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((sport) => (
                  <SelectItem key={sport.id} value={sport.sport}>
                    {sport.sport} - {sport.eventName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentManagement; 