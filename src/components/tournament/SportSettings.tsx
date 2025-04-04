
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { SportConfig } from "@/types/tournament";

type SportSettingsProps = {
  onAddSport: (sportConfig: SportConfig) => void;
};

// Sports that can be played in singles, doubles, or mixed
const racquetSports = [
  "Tennis",
  "Badminton", 
  "Table Tennis",
];

const allSports = [
  "Cricket",
  "Football",
  "Volleyball",
  "Basketball",
  "Kabaddi",
  "Tennis",
  "Badminton",
  "Table Tennis",
  "Chess",
  "Athletics",
  "Running",
  "Hurdles",
  "Discus Throw",
  "Javelin Throw",
  "Cycling",
  "High Jump",
  "Relay Race",
];

const tournamentFormats = [
  "League",
  "Knockout",
  "Group + Knockout",
  "Round Robin",
  "Double Elimination",
  "Swiss Format",
];

const SportSettings = ({ onAddSport }: SportSettingsProps) => {
  const [selectedSport, setSelectedSport] = useState("");
  const [eventName, setEventName] = useState("");
  const [format, setFormat] = useState("");
  const [maxTeams, setMaxTeams] = useState("");
  const [gender, setGender] = useState("");
  const [playType, setPlayType] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [entryFee, setEntryFee] = useState(""); // Added entryFee state
  const [showForm, setShowForm] = useState(false);

  const handleAddSport = () => {
    if (!selectedSport) {
      toast({
        title: "Sport Required",
        description: "Please select a sport",
        variant: "destructive",
      });
      return;
    }

    if (!eventName) {
      toast({
        title: "Event Name Required",
        description: "Please enter an event name",
        variant: "destructive",
      });
      return;
    }

    if (!format) {
      toast({
        title: "Format Required",
        description: "Please select a tournament format",
        variant: "destructive",
      });
      return;
    }

    if (!maxTeams || parseInt(maxTeams) <= 0) {
      toast({
        title: "Valid Maximum Teams Required",
        description: "Please enter a valid number of maximum teams",
        variant: "destructive",
      });
      return;
    }

    if (!gender) {
      toast({
        title: "Gender Required",
        description: "Please select a gender category",
        variant: "destructive",
      });
      return;
    }

    // For racquet sports, play type is required
    if (racquetSports.includes(selectedSport) && !playType) {
      toast({
        title: "Play Type Required",
        description: "Please select singles, doubles, or mixed for this sport",
        variant: "destructive",
      });
      return;
    }

    const sportConfig: SportConfig = {
      id: uuidv4(),
      sport: selectedSport,
      eventName,
      format,
      maxTeams: parseInt(maxTeams),
      gender,
      entryFee: entryFee || "0", // Include entryFee in the sport config
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

  const resetForm = () => {
    setSelectedSport("");
    setEventName("");
    setFormat("");
    setMaxTeams("");
    setGender("");
    setPlayType("");
    setAdditionalDetails("");
    setEntryFee(""); // Reset entryFee
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Add Sport</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sport">Select Sport <span className="text-destructive">*</span></Label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger id="sport">
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  {allSports.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name <span className="text-destructive">*</span></Label>
              <Input
                id="eventName"
                placeholder="Enter event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="format">Choose Format <span className="text-destructive">*</span></Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select tournament format" />
                </SelectTrigger>
                <SelectContent>
                  {tournamentFormats.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>
                      {fmt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="grid gap-6 md:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee</Label>
              <Input
                id="entryFee"
                type="number"
                placeholder="Entry fee amount"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                min={0}
              />
            </div>
          </div>

          {racquetSports.includes(selectedSport) && (
            <div className="space-y-2">
              <Label htmlFor="playType">Play Type <span className="text-destructive">*</span></Label>
              <Select value={playType} onValueChange={setPlayType}>
                <SelectTrigger id="playType">
                  <SelectValue placeholder="Select play type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Singles">Singles</SelectItem>
                  <SelectItem value="Doubles">Doubles</SelectItem>
                  <SelectItem value="Mixed Doubles">Mixed Doubles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="additionalDetails">Additional Details</Label>
            <Input
              id="additionalDetails"
              placeholder="Add any additional details for this sport"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center gap-4">
            <Button onClick={handleAddSport} className="flex-1">
              <Plus className="mr-2 h-4 w-4" /> Add Sport
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 text-green-600 border-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => {
                handleAddSport();
                setSelectedSport("");
                setEventName("");
                setFormat("");
                setMaxTeams("");
                setGender("");
                setPlayType("");
                setAdditionalDetails("");
                setEntryFee("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add & Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportSettings;
