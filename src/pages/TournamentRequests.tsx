import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Tournament, JoinRequest } from "@/types/tournament";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Check, X, ArrowLeft, Phone, Mail, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const TournamentRequests = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [processLoading, setProcessingLoading] = useState(false);

  useEffect(() => {
    fetchTournamentAndRequests();
  }, [id, user]);

  const fetchTournamentAndRequests = async () => {
    if (!id || !user) return;
    
    try {
      setLoading(true);
      
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();

      if (tournamentError) throw tournamentError;
      
      if (tournamentData.creator_id !== user.id) {
        toast.error("You do not have permission to view this page");
        navigate(`/tournaments/${id}`);
        return;
      }
      
      const tournament: Tournament = {
        id: tournamentData.id,
        tournament_name: tournamentData.tournament_name,
        sport: tournamentData.sport || "",
        format: tournamentData.format || "",
        teams_registered: tournamentData.teams_registered || 0,
        team_limit: tournamentData.team_limit || 0,
        participants_registered: tournamentData.participants_registered || 0,
        entry_fee: tournamentData.entry_fee,
        creator_id: tournamentData.creator_id,
        image_url: tournamentData.image_url,
        start_date: tournamentData.start_date,
        end_date: tournamentData.end_date,
        registration_due_date: tournamentData.registration_due_date,
        location: tournamentData.location,
        city: tournamentData.city,
        state: tournamentData.state,
        about: tournamentData.about,
        contact_name: tournamentData.contact_name,
        contact_email: tournamentData.contact_email,
        contact_phone: tournamentData.contact_phone,
        additionalDetails: tournamentData.about
      };
      
      setTournament(tournament);
      
      const { data: requestsData, error: requestsError } = await supabase
        .from("tournament_join_requests")
        .select("*")
        .eq("tournament_id", id)
        .order("submitted_at", { ascending: false });
        
      if (requestsError) throw requestsError;
      
      setJoinRequests(requestsData as JoinRequest[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load tournament data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request: JoinRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleActionRequest = (request: JoinRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setAction(action);
    setReviewerNotes('');
    setActionDialogOpen(true);
  };

  const processRequest = async () => {
    if (!selectedRequest || !action || !tournament) return;
    
    try {
      setProcessingLoading(true);
      
      const { error: updateError } = await supabase
        .from("tournament_join_requests")
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: reviewerNotes
        })
        .eq("id", selectedRequest.id);
        
      if (updateError) throw updateError;
      
      if (action === 'approve') {
        const { error: participantError } = await supabase
          .from("tournament_participants")
          .insert({
            tournament_id: tournament.id,
            user_id: selectedRequest.user_id,
            role: "player",
            joined_at: new Date().toISOString(),
          });
          
        if (participantError) throw participantError;
        
        const isDoubles = tournament.format?.includes("Doubles") || false;
        const isTeamSport = ["Cricket", "Football", "Basketball", "Volleyball", "Hockey"].includes(tournament.sport);
        const updateField = isDoubles || isTeamSport ? "teams_registered" : "participants_registered";
        
        const { error: tournamentError } = await supabase
          .from("tournaments")
          .update({ 
            [updateField]: tournament[updateField] + 1 
          })
          .eq("id", tournament.id);
          
        if (tournamentError) throw tournamentError;
      }
      
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setActionDialogOpen(false);
      
      fetchTournamentAndRequests();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessingLoading(false);
    }
  };

  const filteredRequests = joinRequests.filter(request => {
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'approved') return request.status === 'approved';
    if (activeTab === 'rejected') return request.status === 'rejected';
    return true;
  });

  const getStatusBadge = (status: string) => {
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
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-2">
            <div onClick={() => navigate(`/tournaments/${id}`)} className="flex items-center cursor-pointer">
              <ArrowLeft size={16} className="mr-2" />
              Back to Tournament
            </div>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">{tournament.tournament_name}</h1>
          <p className="text-lg text-gray-600">
            Join Request Management
          </p>
        </div>
        
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                {joinRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                    {joinRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="pending" className="mt-0">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No pending requests</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">{request.player_name}</h3>
                          <div className="text-sm text-muted-foreground">
                            Submitted on {new Date(request.submitted_at).toLocaleDateString()}
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
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleActionRequest(request, 'approve')}
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleActionRequest(request, 'reject')}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-0">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No approved requests</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">{request.player_name}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Approved on {new Date(request.reviewed_at || '').toLocaleDateString()}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-0">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No rejected requests</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">{request.player_name}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Rejected on {new Date(request.reviewed_at || '').toLocaleDateString()}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Review the details of this tournament join request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
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
              
              {selectedRequest.status === 'pending' && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleActionRequest(selectedRequest, 'reject');
                    }}
                  >
                    <X className="mr-2 h-4 w-4" /> Reject Request
                  </Button>
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleActionRequest(selectedRequest, 'approve');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" /> Approve Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
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
                onChange={(e) => setReviewerNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={processRequest}
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
    </PageLayout>
  );
};

export default TournamentRequests;
