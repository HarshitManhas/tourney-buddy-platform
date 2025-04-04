
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { racquetSports } from "./constants/sportsData";

interface SportCapacityFieldsProps {
  selectedSport: string;
  playType: string;
  maxTeams: string;
  setMaxTeams: (value: string) => void;
  maxParticipants: string;
  setMaxParticipants: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
}

const SportCapacityFields = ({
  selectedSport,
  playType,
  maxTeams,
  setMaxTeams,
  maxParticipants,
  setMaxParticipants,
  gender,
  setGender,
}: SportCapacityFieldsProps) => {
  const isIndividualFormat = () => {
    if (!racquetSports.includes(selectedSport)) return false;
    return playType === "Singles";
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {isIndividualFormat() ? (
        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Maximum Participants <span className="text-destructive">*</span></Label>
          <Input
            id="maxParticipants"
            type="number"
            placeholder="Enter maximum number of participants"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            min={1}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="maxTeams">Maximum Teams <span className="text-destructive">*</span></Label>
          <Input
            id="maxTeams"
            type="number"
            placeholder="Enter maximum number of teams"
            value={maxTeams}
            onChange={(e) => setMaxTeams(e.target.value)}
            min={1}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Men">Men</SelectItem>
            <SelectItem value="Women">Women</SelectItem>
            <SelectItem value="Mixed">Mixed</SelectItem>
            <SelectItem value="Open">Open (Any Gender)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SportCapacityFields;
