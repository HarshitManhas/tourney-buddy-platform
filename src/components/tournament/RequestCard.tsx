
import React from "react";
import { JoinRequest } from "@/types/tournament";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, X } from "lucide-react";

interface RequestCardProps {
  request: JoinRequest;
  onView: (request: JoinRequest) => void;
  onAction?: (request: JoinRequest, action: 'approve' | 'reject') => void;
  showActions?: boolean;
}

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    default:
      return null;
  }
};

const RequestCard: React.FC<RequestCardProps> = ({ request, onView, onAction, showActions = false }) => {
  return (
    <Card key={request.id}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">{request.player_name}</h3>
              {!showActions && getStatusBadge(request.status)}
            </div>
            <div className="text-sm text-muted-foreground">
              {request.status === 'pending' 
                ? `Submitted on ${new Date(request.submitted_at).toLocaleDateString()}`
                : `${request.status === 'approved' ? 'Approved' : 'Rejected'} on ${new Date(request.reviewed_at || '').toLocaleDateString()}`
              }
            </div>
            {request.roles && request.roles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {request.roles.map(role => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(request)}
            >
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            {showActions && onAction && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onAction(request, 'approve')}
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onAction(request, 'reject')}
                >
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestCard;
