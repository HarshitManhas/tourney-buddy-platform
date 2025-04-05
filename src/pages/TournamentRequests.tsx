
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/PageLayout";
import RequestsHeader from "@/components/tournament/RequestsHeader";
import RequestsTabContent from "@/components/tournament/RequestsTabContent";
import RequestDetailDialog from "@/components/tournament/RequestDetailDialog";
import ActionDialog from "@/components/tournament/ActionDialog";
import { useTournamentRequests } from "@/hooks/useTournamentRequests";

const TournamentRequests = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    tournament,
    loading,
    selectedRequest,
    viewDialogOpen,
    setViewDialogOpen,
    actionDialogOpen,
    setActionDialogOpen,
    action,
    reviewerNotes,
    setReviewerNotes,
    activeTab,
    setActiveTab,
    processLoading,
    filteredRequests,
    handleViewRequest,
    handleActionRequest,
    processRequest
  } = useTournamentRequests(id);

  if (loading) {
    return (
      <PageLayout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-xl">Loading tournament details...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!tournament) {
    return (
      <PageLayout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-xl text-red-500">Tournament not found</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-8">
        <RequestsHeader tournament={tournament} id={id || ''} />
        
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                {filteredRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                    {filteredRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="pending" className="mt-0">
            <RequestsTabContent 
              filteredRequests={filteredRequests}
              onViewRequest={handleViewRequest}
              onActionRequest={handleActionRequest}
              showActions={true}
            />
          </TabsContent>
          
          <TabsContent value="approved" className="mt-0">
            <RequestsTabContent 
              filteredRequests={filteredRequests}
              onViewRequest={handleViewRequest}
            />
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-0">
            <RequestsTabContent 
              filteredRequests={filteredRequests}
              onViewRequest={handleViewRequest}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <RequestDetailDialog
        selectedRequest={selectedRequest}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onAction={handleActionRequest}
      />
      
      <ActionDialog
        selectedRequest={selectedRequest}
        action={action}
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        reviewerNotes={reviewerNotes}
        onReviewerNotesChange={setReviewerNotes}
        onProcessRequest={processRequest}
        processLoading={processLoading}
      />
    </PageLayout>
  );
};

export default TournamentRequests;
