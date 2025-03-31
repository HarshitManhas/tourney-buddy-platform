
import { useState } from "react";
import TournamentCard, { TournamentCardProps } from "@/components/TournamentCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

// Mock data for tournaments
const mockTournaments: TournamentCardProps[] = [
  {
    id: "1",
    title: "Summer Basketball League",
    sport: "Basketball",
    format: "League",
    date: "Jun 15 - Aug 20, 2023",
    location: "Downtown Sports Complex",
    entryFee: "$150",
    teamsRegistered: 12,
    teamLimit: 16,
    image: "https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "2",
    title: "Regional Soccer Championship",
    sport: "Soccer",
    format: "Knockout",
    date: "Jul 10 - Jul 25, 2023",
    location: "City Stadium",
    entryFee: "$200",
    teamsRegistered: 24,
    teamLimit: 32,
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "3",
    title: "Community Tennis Open",
    sport: "Tennis",
    format: "Round Robin",
    date: "Aug 5 - Aug 7, 2023",
    location: "Tennis Club",
    entryFee: "$50",
    teamsRegistered: 32,
    teamLimit: 32
  },
  {
    id: "4",
    title: "Weekend Cricket Tournament",
    sport: "Cricket",
    format: "Double Elimination",
    date: "Sep 2 - Sep 3, 2023",
    location: "Cricket Ground",
    entryFee: "$180",
    teamsRegistered: 6,
    teamLimit: 8
  },
  {
    id: "5",
    title: "Volleyball Beach Series",
    sport: "Volleyball",
    format: "League",
    date: "Jun 1 - Sep 30, 2023",
    location: "City Beach",
    entryFee: "$120",
    teamsRegistered: 10,
    teamLimit: 12,
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=2007&auto=format&fit=crop"
  },
  {
    id: "6",
    title: "5K Summer Run",
    sport: "Running",
    format: "Race",
    date: "Aug 15, 2023",
    location: "Central Park",
    entryFee: "$25",
    teamsRegistered: 150,
    teamLimit: 300
  },
];

const TournamentList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  
  const filteredTournaments = mockTournaments.filter(tournament => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === "" || tournament.sport === sportFilter;
    return matchesSearch && matchesSport;
  });
  
  // Get unique sports for filter
  const sports = Array.from(new Set(mockTournaments.map(t => t.sport)));
  
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
                  <SelectItem value="">All Sports</SelectItem>
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
    </div>
  );
};

export default TournamentList;
