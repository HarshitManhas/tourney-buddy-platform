import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { SportSelectionForm } from "./SportSelectionForm";
import { AuctionSportForm } from "./AuctionSportForm";
import { RacquetSportForm } from "./RacquetSportForm";
import { PaymentVerification } from "./PaymentVerification";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface JoinTournamentFormProps {
  tournament: any;
  onClose: () => void;
}

type Step = "sport-selection" | "player-details" | "payment";

export function JoinTournamentForm({ tournament, onClose }: JoinTournamentFormProps) {
  const [step, setStep] = useState<Step>("sport-selection");
  const [selectedSport, setSelectedSport] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const { toast } = useToast();

  const isAuctionSport = (sport: string) => {
    const teamSports = ["Cricket", "Football", "Basketball", "Volleyball", "Kabaddi"];
    return teamSports.includes(sport);
  };

  const isRacquetSport = (sport: string) => {
    const racquetSports = ["Tennis", "Badminton", "Table Tennis", "Squash"];
    return racquetSports.includes(sport);
  };

  const handleSportSelection = (sport: any) => {
    console.log("Selected sport:", sport);
    setSelectedSport(sport);
    setStep("player-details");
  };

  const handlePlayerDetailsSubmit = (data: any) => {
    setFormData({
      ...data,
      sport: selectedSport,
      tournament_id: tournament.id,
    });
    setStep("payment");
  };

  const handleBack = () => {
    if (step === "payment") {
      setStep("player-details");
    } else if (step === "player-details") {
      setStep("sport-selection");
      setSelectedSport(null);
    }
  };

  const renderForm = () => {
    switch (step) {
      case "sport-selection":
        return (
          <SportSelectionForm
            tournament={tournament}
            onSelect={handleSportSelection}
          />
        );
      case "player-details":
        if (!selectedSport) return null;

        if (isRacquetSport(selectedSport.sport)) {
          return (
            <RacquetSportForm
              playType={selectedSport.play_type || "singles"}
              onSubmit={handlePlayerDetailsSubmit}
              onBack={handleBack}
            />
          );
        }

        return (
          <AuctionSportForm
            sport={selectedSport.sport}
            onSubmit={handlePlayerDetailsSubmit}
            additionalFields={selectedSport.additionalDetails}
          />
        );

      case "payment":
        return (
          <PaymentVerification
            tournament={tournament}
            formData={formData}
            onComplete={onClose}
            onBack={handleBack}
            selectedSport={selectedSport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      {step !== "sport-selection" && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}

      {renderForm()}
    </Card>
  );
} 