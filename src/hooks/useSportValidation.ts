
import { toast } from "@/hooks/use-toast";
import { racquetSports } from "@/components/tournament/constants/sportsData";

export const useSportValidation = () => {
  const validateSportForm = (
    selectedSport: string,
    eventName: string,
    format: string,
    maxTeams: string,
    maxParticipants: string,
    gender: string,
    playType: string
  ) => {
    if (!selectedSport) {
      toast({
        title: "Sport Required",
        description: "Please select a sport",
        variant: "destructive",
      });
      return false;
    }

    if (!eventName) {
      toast({
        title: "Event Name Required",
        description: "Please enter an event name",
        variant: "destructive",
      });
      return false;
    }

    if (!format) {
      toast({
        title: "Format Required",
        description: "Please select a tournament format",
        variant: "destructive",
      });
      return false;
    }

    const isIndividualFormat = 
      racquetSports.includes(selectedSport) && playType === "Singles";

    // For racquet sports with singles format, validate maxParticipants
    if (isIndividualFormat) {
      if (!maxParticipants || parseInt(maxParticipants) <= 0) {
        toast({
          title: "Valid Maximum Participants Required",
          description: "Please enter a valid number of maximum participants",
          variant: "destructive",
        });
        return false;
      }
    } 
    // For team sports or doubles formats, validate maxTeams
    else if (!isIndividualFormat && (!maxTeams || parseInt(maxTeams) <= 0)) {
      toast({
        title: "Valid Maximum Teams Required",
        description: "Please enter a valid number of maximum teams",
        variant: "destructive",
      });
      return false;
    }

    if (!gender) {
      toast({
        title: "Gender Required",
        description: "Please select a gender category",
        variant: "destructive",
      });
      return false;
    }

    // For racquet sports, play type is required
    if (racquetSports.includes(selectedSport) && !playType) {
      toast({
        title: "Play Type Required",
        description: "Please select singles, doubles, or mixed for this sport",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateSportForm };
};
