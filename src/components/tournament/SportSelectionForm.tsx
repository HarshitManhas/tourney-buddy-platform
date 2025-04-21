import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SportSelectionFormProps {
  tournament: any;
  onSelect: (sport: any) => void;
}

export function SportSelectionForm({ tournament, onSelect }: SportSelectionFormProps) {
  const formatSportDetails = (sport: any) => {
    try {
      // Parse additional_details if it's a string
      const details = typeof sport.additional_details === 'string' 
        ? JSON.parse(sport.additional_details) 
        : sport.additional_details;

      return {
        ...sport,
        roles: details?.roles || [],
        additionalDetails: details
      };
    } catch (e) {
      console.error("Error parsing sport details:", e);
      return sport;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sports & Events</h2>
      <div className="grid gap-4">
        {tournament.sports_config?.map((sport: any) => {
          const formattedSport = formatSportDetails(sport);
          return (
            <Card
              key={sport.id}
              className="p-6 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelect(formattedSport)}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{sport.sport}</h3>
                    <p className="text-sm text-muted-foreground">{sport.event_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Entry Fee: ₹{sport.entry_fee}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sport.format && (
                    <Badge variant="secondary">{sport.format}</Badge>
                  )}
                  {sport.gender && (
                    <Badge variant="secondary">{sport.gender}</Badge>
                  )}
                  {sport.play_type && (
                    <Badge variant="secondary">{sport.play_type}</Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 