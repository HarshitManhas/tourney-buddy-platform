
import { useState } from "react";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { SportConfig } from "@/types/tournament";
import { racquetSports } from "./constants/sportsData";
import SportFormHeader from "./SportFormHeader";
import SportBasicFields from "./SportBasicFields";
import SportCapacityFields from "./SportCapacityFields";
import SportAdditionalFields from "./SportAdditionalFields";
import SportActionButtons from "./SportActionButtons";
import { useSportValidation } from "@/hooks/useSportValidation";

type SportSettingsProps = {
  onAddSport: (sportConfig: SportConfig) => void;
};

const SportSettings = ({ onAddSport }: SportSettingsProps) => {
  const [selectedSport, setSelectedSport] = useState("");
  const [eventName, setEventName] = useState("");
  const [format, setFormat] = useState("");
  const [maxTeams, setMaxTeams] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [gender, setGender] = useState("");
  const [playType, setPlayType] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const { validateSportForm } = useSportValidation();

  const isIndividualFormat = () => {
    if (!racquetSports.includes(selectedSport)) return false;
    return playType === "Singles";
  };

  const handleAddSport = () => {
    if (!validateSportForm(
      selectedSport,
      eventName,
      format,
      maxTeams,
      maxParticipants,
      gender,
      playType
    )) {
      return;
    }

    const sportConfig: SportConfig = {
      id: uuidv4(),
      sport: selectedSport,
      eventName,
      format,
      gender,
      entryFee: entryFee || "0",
      ...(isIndividualFormat() 
        ? { maxParticipants: parseInt(maxParticipants) } 
        : { maxTeams: parseInt(maxTeams) }),
      ...(racquetSports.includes(selectedSport) && { playType }),
      ...(additionalDetails && { additionalDetails }),
    };

    onAddSport(sportConfig);
    resetForm();
    
    toast({
      title: "Sport Added",
      description: `${selectedSport} has been added to your tournament`,
    });
  };

  const handleAddAndContinue = () => {
    handleAddSport();
    setSelectedSport("");
    setEventName("");
    setFormat("");
    setMaxTeams("");
    setMaxParticipants("");
    setGender("");
    setPlayType("");
    setAdditionalDetails("");
    setEntryFee("");
  };

  const resetForm = () => {
    setSelectedSport("");
    setEventName("");
    setFormat("");
    setMaxTeams("");
    setMaxParticipants("");
    setGender("");
    setPlayType("");
    setAdditionalDetails("");
    setEntryFee("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        className="w-full text-green-600 border-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={() => setShowForm(true)}
        disabled={showForm}
      >
        <Plus className="mr-2 h-4 w-4" /> ADD SPORT
      </Button>

      {showForm && (
        <div className="space-y-6">
          <SportFormHeader resetForm={resetForm} />

          <SportBasicFields
            selectedSport={selectedSport}
            setSelectedSport={setSelectedSport}
            eventName={eventName}
            setEventName={setEventName}
            format={format}
            setFormat={setFormat}
            playType={playType}
            setPlayType={setPlayType}
          />

          <SportCapacityFields
            selectedSport={selectedSport}
            playType={playType}
            maxTeams={maxTeams}
            setMaxTeams={setMaxTeams}
            maxParticipants={maxParticipants}
            setMaxParticipants={setMaxParticipants}
            gender={gender}
            setGender={setGender}
          />

          <SportAdditionalFields
            entryFee={entryFee}
            setEntryFee={setEntryFee}
            additionalDetails={additionalDetails}
            setAdditionalDetails={setAdditionalDetails}
          />

          <SportActionButtons
            handleAddSport={handleAddSport}
            handleAddAndContinue={handleAddAndContinue}
          />
        </div>
      )}
    </div>
  );
};

export default SportSettings;
