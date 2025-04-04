
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SportFormHeaderProps {
  resetForm: () => void;
}

const SportFormHeader = ({ resetForm }: SportFormHeaderProps) => {
  return (
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
  );
};

export default SportFormHeader;
