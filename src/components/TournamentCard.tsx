
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export interface TournamentCardProps {
  id: string;
  title: string;
  sport: string;
  format: string;
  date: string;
  location: string;
  entryFee: string;
  teamsRegistered: number;
  teamLimit: number;
  image?: string;
  playType?: string;
}

const TournamentCard = ({
  id,
  title,
  sport,
  format,
  date,
  location,
  entryFee,
  teamsRegistered,
  teamLimit,
  image,
  playType
}: TournamentCardProps) => {
  const registrationFull = teamsRegistered >= teamLimit;
  
  // Determine if this is an individual or team tournament
  const isIndividualFormat = 
    playType === "Singles" && 
    ["Tennis", "Badminton", "Table Tennis"].includes(sport);
  
  const registrationLabel = isIndividualFormat 
    ? `${teamsRegistered} / ${teamLimit} participants registered` 
    : `${teamsRegistered} / ${teamLimit} teams registered`;
  
  return (
    <Card className="tournament-card overflow-hidden">
      <div 
        className="h-40 w-full bg-muted bg-cover bg-center"
        style={{
          backgroundImage: image ? `url(${image})` : 'linear-gradient(to right, hsl(var(--primary)/0.8), hsl(var(--secondary)/0.8))'
        }}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <Badge className="bg-primary">{sport}</Badge>
          <Badge className="bg-secondary">{format}</Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>Entry Fee: {entryFee}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pb-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarCheck size={16} />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={16} />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={16} />
          <span>{registrationLabel}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${(teamsRegistered / teamLimit) * 100}%` }}
          />
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button asChild className="w-full" disabled={registrationFull}>
          <Link to={`/tournaments/${id}`}>
            {registrationFull ? "Registration Full" : "View Details"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;
