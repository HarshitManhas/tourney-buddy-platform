import { useState, useEffect } from "react";
import TournamentCard, { TournamentCardProps } from "@/components/TournamentCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/integrations/supabase/types";

type Tournament = Database['public']['Tables']['tournaments']['Row'];

const TournamentList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [tournaments, setTournaments] = useState<TournamentCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        // Fetch tournaments with their sports configuration
        const { data: tournamentsData, error: tournamentsError } = await supabase
          .from('tournaments')
          .select('*, tournament_sports(id, sport, event_name)');

        if (tournamentsError) {
          throw tournamentsError;
        }

        if (tournamentsData) {
          // Transform data to match TournamentCardProps format
          const formattedData = tournamentsData.map((item: any) => ({
            id: item.id,
            title: item.tournament_name,
            sport: item.sport || "General",
            format: item.format || "Not specified",
            date: `${new Date(item.start_date || '').toLocaleDateString()} - ${new Date(item.end_date || '').toLocaleDateString()}`,
            location: item.location || item.city || "Not specified",
            entryFee: item.entry_fee ? `₹${item.entry_fee}` : "Free",
            teamsRegistered: item.teams_registered || 0,
            teamLimit: item.team_limit || 10,
            image: item.banner_url || item.image_url || undefined,
            logo_url: item.logo_url,
            sports_config: item.tournament_sports,
            start_date: item.start_date,
            end_date: item.end_date,
            registration_due_date: item.registration_due_date
          }));
          
          setTournaments(formattedData);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        toast.error("Failed to load tournaments");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);
  
  // Get unique sports for filter
  const sports = Array.from(new Set([
    ...tournaments.map(t => t.sport),
    ...tournaments.flatMap(t => t.sports_config?.map(config => config.sport) || [])
  ])).filter(sport => sport && sport !== "General");
  
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === "all" || 
      tournament.sport === sportFilter || 
      tournament.sports_config?.some(config => config.sport === sportFilter);
    return matchesSearch && matchesSport;
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Find Tournaments</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Label htmlFor="search" className="sr-only">
              Search tournaments
            </Label>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search tournaments..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="sport-filter" className="sr-only">
              Filter by sport
            </Label>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger id="sport-filter" className="w-full">
                <SelectValue placeholder="Filter by sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Sports</SelectItem>
                  {sports.map(sport => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.length > 0 ? (
            filteredTournaments.map(tournament => (
              <TournamentCard key={tournament.id} {...tournament} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-lg text-muted-foreground">No tournaments found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentList;
