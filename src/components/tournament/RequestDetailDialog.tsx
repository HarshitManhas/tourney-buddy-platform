
import React from "react";
import { JoinRequest } from "@/types/tournament";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Phone, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusBadge } from "./RequestCard";

interface RequestDetailDialogProps {
  selectedRequest: JoinRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction?: (request: JoinRequest, action: 'approve' | 'reject') => void;
}

const RequestDetailDialog: React.FC<RequestDetailDialogProps> = ({ 
  selectedRequest, 
  open, 
  onOpenChange,
  onAction
}) => {
  if (!selectedRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Review the details of this tournament join request
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-lg font-medium">Player Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Name:</span> 
                  <span>{selectedRequest.player_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Gender:</span> 
                  <span>{selectedRequest.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phone:</span> 
                  <span>{selectedRequest.mobile_no}</span>
                </div>
                
                {selectedRequest.roles && selectedRequest.roles.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Roles:</span> 
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedRequest.roles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedRequest.partner_name && (
                <div className="mt-4">
                  <h4 className="mb-1 text-base font-medium">Partner Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Name:</span> 
                      <span>{selectedRequest.partner_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Gender:</span> 
                      <span>{selectedRequest.partner_gender}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Phone:</span> 
                      <span>{selectedRequest.partner_mobile_no}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedRequest.additional_info && (
                <div className="mt-4">
                  <h4 className="mb-1 text-base font-medium">Additional Information</h4>
                  <p className="text-sm">{selectedRequest.additional_info}</p>
                </div>
              )}
              
              {selectedRequest.reviewer_notes && (
                <div className="mt-4">
                  <h4 className="mb-1 text-base font-medium">Reviewer Notes</h4>
                  <p className="text-sm">{selectedRequest.reviewer_notes}</p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-medium">Payment Proof</h3>
              {selectedRequest.payment_proof_url ? (
                <div className="overflow-hidden rounded-md border">
                  <img 
                    src={selectedRequest.payment_proof_url} 
                    alt="Payment proof" 
                    className="w-full object-contain" 
                  />
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No payment proof uploaded
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="mb-1 text-base font-medium">Request Status</h4>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedRequest.status)}
                  <span className="text-sm">
                    {selectedRequest.status === 'pending' 
                      ? 'Awaiting your review' 
                      : `${selectedRequest.status === 'approved' ? 'Approved' : 'Rejected'} on ${new Date(selectedRequest.reviewed_at || '').toLocaleDateString()}`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {selectedRequest.status === 'pending' && onAction && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onAction(selectedRequest, 'reject');
                }}
              >
                <X className="mr-2 h-4 w-4" /> Reject Request
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onAction(selectedRequest, 'approve');
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" /> Approve Request
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetailDialog;
