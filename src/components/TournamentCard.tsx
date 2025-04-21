import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, MapPin, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  logo_url?: string;
  playType?: string;
  sports_config?: Array<{
    id: string;
    sport: string;
    eventName: string;
  }>;
  start_date: string;
  end_date: string;
  registration_due_date: string;
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
  logo_url,
  playType,
  sports_config,
  start_date,
  end_date,
  registration_due_date
}: TournamentCardProps) => {
  const registrationFull = teamsRegistered >= teamLimit;

  const getTournamentStatus = () => {
    const currentDate = new Date();
    const regDate = new Date(registration_due_date);
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (currentDate < regDate) {
      return {
        text: "Registration Open",
        color: "bg-green-500 hover:bg-green-600"
      };
    } else if (currentDate > regDate && currentDate < startDate) {
      return {
        text: "Registration Closed",
        color: "bg-yellow-500 hover:bg-yellow-600"
      };
    } else if (currentDate > startDate && currentDate < endDate) {
      return {
        text: "Tournament Ongoing",
        color: "bg-blue-500 hover:bg-blue-600"
      };
    } else {
      return {
        text: "Tournament Completed",
        color: "bg-gray-500 hover:bg-gray-600"
      };
    }
  };

  const status = getTournamentStatus();
  
  return (
    <Card className="tournament-card overflow-hidden">
      <div className="relative">
        <div 
          className="h-40 w-full bg-muted bg-cover bg-center"
          style={{
            backgroundImage: image ? `url(${image})` : 'linear-gradient(to right, hsl(var(--primary)/0.8), hsl(var(--secondary)/0.8))'
          }}
        />
        <div className="absolute bottom-0 left-4 transform translate-y-1/2">
          <Avatar className="h-16 w-16 border-4 border-background bg-white shadow-md">
            {logo_url ? (
              <AvatarImage src={logo_url} alt="Tournament logo" />
            ) : (
              <AvatarFallback className="bg-muted text-muted-foreground">
                <Trophy className="h-8 w-8" />
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <div className="absolute top-2 right-2">
          <Badge className={`${status.color} text-white border-none`}>
            {status.text}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2 pt-10">
        <div className="flex flex-wrap gap-2">
          {sports_config && sports_config.length > 0 ? (
            sports_config.map((sportItem) => (
              <Badge key={sportItem.id} className="bg-primary">{sportItem.sport}</Badge>
            ))
          ) : (
            <Badge className="bg-primary">{sport}</Badge>
          )}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
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
