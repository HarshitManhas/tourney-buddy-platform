
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SportActionButtonsProps {
  handleAddSport: () => void;
  handleAddAndContinue: () => void;
}

const SportActionButtons = ({
  handleAddSport,
  handleAddAndContinue,
}: SportActionButtonsProps) => {
  return (
    <div className="flex justify-between items-center gap-4">
      <Button onClick={handleAddSport} className="flex-1">
        <Plus className="mr-2 h-4 w-4" /> Add Sport
      </Button>
      <Button 
        variant="outline" 
        className="flex-1 text-green-600 border-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={handleAddAndContinue}
      >
        <Plus className="mr-2 h-4 w-4" /> Add & Continue
      </Button>
    </div>
  );
};

export default SportActionButtons;
