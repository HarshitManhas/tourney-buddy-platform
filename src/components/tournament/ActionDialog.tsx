
import React from "react";
import { JoinRequest } from "@/types/tournament";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ActionDialogProps {
  selectedRequest: JoinRequest | null;
  action: 'approve' | 'reject' | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewerNotes: string;
  onReviewerNotesChange: (notes: string) => void;
  onProcessRequest: () => void;
  processLoading: boolean;
}

const ActionDialog: React.FC<ActionDialogProps> = ({
  selectedRequest,
  action,
  open,
  onOpenChange,
  reviewerNotes,
  onReviewerNotesChange,
  onProcessRequest,
  processLoading,
}) => {
  if (!selectedRequest || !action) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'approve' ? 'Approve Request' : 'Reject Request'}
          </DialogTitle>
          <DialogDescription>
            {action === 'approve' 
              ? 'This will approve the request and add the player to the tournament.' 
              : 'This will reject the request and the player will not be added to the tournament.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <label className="text-sm font-medium">Add Notes (Optional)</label>
            <Textarea
              placeholder="Enter any notes or feedback for the participant"
              value={reviewerNotes}
              onChange={(e) => onReviewerNotesChange(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onProcessRequest}
            disabled={processLoading}
            variant={action === 'approve' ? 'default' : 'destructive'}
          >
            {processLoading 
              ? 'Processing...' 
              : action === 'approve' 
                ? 'Confirm Approval' 
                : 'Confirm Rejection'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActionDialog;
