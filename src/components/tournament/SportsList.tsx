
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { SportConfig } from "@/types/tournament";

interface SportsListProps {
  sports: SportConfig[];
  removeSport: (id: string) => void;
}

const SportsList = ({ sports, removeSport }: SportsListProps) => {
  if (sports.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      {sports.map((sport) => (
        <div
          key={sport.id}
          className="flex flex-wrap items-center justify-between rounded-md border bg-background p-4"
        >
          <div>
            <div className="font-medium">{sport.sport}</div>
            <div className="text-sm text-muted-foreground">
              {sport.eventName} • {sport.format} • Max Teams: {sport.maxTeams} • {sport.gender}
              {sport.playType && ` • ${sport.playType}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // This would open the sport for editing if needed
              }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeSport(sport.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SportsList;
