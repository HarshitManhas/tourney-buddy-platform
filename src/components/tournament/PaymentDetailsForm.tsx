
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SportConfig } from "@/types/tournament";

interface PaymentDetailsFormProps {
  sports: SportConfig[];
  updateSport: (id: string, updatedConfig: Partial<SportConfig>) => void;
  setStep: (step: number) => void;
  onSubmit: () => void;
}

const PaymentDetailsForm = ({ 
  sports, 
  updateSport, 
  setStep, 
  onSubmit 
}: PaymentDetailsFormProps) => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Payment Details</h2>
      
      <div className="space-y-6">
        {sports.map((sport) => (
          <div
            key={sport.id}
            className="rounded-md border p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-medium">{sport.sport} - {sport.eventName}</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Registration Fee <span className="text-destructive">*</span>
                </label>
                <Input 
                  type="number" 
                  placeholder="Enter fee amount" 
                  className="mb-2"
                  onChange={(e) => {
                    const fee = parseInt(e.target.value);
                    updateSport(sport.id, { additionalDetails: `Fee: ${fee}` });
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Fee for team registration in {sport.sport} event
                </p>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium">
                  UPI QR Code <span className="text-destructive">*</span>
                </label>
                <div className="flex h-[150px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/50 p-4 transition-colors hover:bg-muted">
                  <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Upload QR Code</span>
                    <span className="text-xs text-muted-foreground">
                      Upload UPI QR code for payments
                    </span>
                  </div>
                  <Input
                    type="file"
                    className="absolute h-full w-full cursor-pointer opacity-0"
                    onChange={() => {
                      // Normally would handle file upload here
                      toast({
                        title: "QR Code uploaded",
                        description: `QR code for ${sport.sport} uploaded successfully`
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline">
            Save as Draft
          </Button>
          <Button onClick={onSubmit}>
            Save & Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsForm;
