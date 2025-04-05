
import React from "react";
import { JoinRequest } from "@/types/tournament";
import { Card, CardContent } from "@/components/ui/card";
import RequestCard from "./RequestCard";

interface RequestsTabContentProps {
  filteredRequests: JoinRequest[];
  onViewRequest: (request: JoinRequest) => void;
  onActionRequest?: (request: JoinRequest, action: 'approve' | 'reject') => void;
  showActions?: boolean;
}

const RequestsTabContent: React.FC<RequestsTabContentProps> = ({
  filteredRequests,
  onViewRequest,
  onActionRequest,
  showActions = false,
}) => {
  if (filteredRequests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No {showActions ? 'pending' : filteredRequests.length === 0 ? '' : 'approved'} requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredRequests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onView={onViewRequest}
          onAction={onActionRequest}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default RequestsTabContent;
