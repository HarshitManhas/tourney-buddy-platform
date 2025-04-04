
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allSports, tournamentFormats, racquetSports } from "./constants/sportsData";

interface SportBasicFieldsProps {
  selectedSport: string;
  setSelectedSport: (value: string) => void;
  eventName: string;
  setEventName: (value: string) => void;
  format: string;
  setFormat: (value: string) => void;
  playType: string;
  setPlayType: (value: string) => void;
}

const SportBasicFields = ({
  selectedSport,
  setSelectedSport,
  eventName,
  setEventName,
  format,
  setFormat,
  playType,
  setPlayType,
}: SportBasicFieldsProps) => {
  return (
    <>
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
      </div>
    </>
  );
};

export default SportBasicFields;
