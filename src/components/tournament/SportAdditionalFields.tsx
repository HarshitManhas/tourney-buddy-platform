
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SportAdditionalFieldsProps {
  entryFee: string;
  setEntryFee: (value: string) => void;
  additionalDetails: string;
  setAdditionalDetails: (value: string) => void;
}

const SportAdditionalFields = ({
  entryFee,
  setEntryFee,
  additionalDetails,
  setAdditionalDetails,
}: SportAdditionalFieldsProps) => {
  return (
    <>
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

      <div className="space-y-2">
        <Label htmlFor="additionalDetails">Additional Details</Label>
        <Input
          id="additionalDetails"
          placeholder="Add any additional details for this sport"
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
        />
      </div>
    </>
  );
};

export default SportAdditionalFields;
