import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Tournament } from "@/types/tournament";
import { JoinForm } from "@/components/tournament/JoinForm";
import { PaymentVerification } from "@/components/tournament/PaymentVerification";
import { Stepper } from "@/components/ui/stepper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CalendarClock, InfoIcon, ArrowLeft } from "lucide-react";

const JoinTournament = () => {
  const { id, sport } = useParams<{ id: string; sport: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState("player-info");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [existingRequest, setExistingRequest] = useState(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [sportConfig, setSportConfig] = useState<any | null>(null);

  useEffect(() => {
    if (sport) {
      setSelectedSport(sport);
    }
  }, [sport]);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to join a tournament");
      navigate(`/tournaments/${id}`);
      return;
    }

    const fetchTournamentAndCheckRequest = async () => {
      try {
        setLoading(true);
        
        // Fetch tournament details
        const { data: tournamentData, error: tournamentError } = await supabase
          .from("tournaments")
          .select("*")
          .eq("id", id)
          .single();

        if (tournamentError) throw tournamentError;
        
        // Create a Tournament object
        const tournament: Tournament = {
          id: tournamentData.id,
          tournament_name: tournamentData.tournament_name,
          sport: tournamentData.sport || "",
          format: tournamentData.format || "",
          teams_registered: tournamentData.teams_registered || 0,
          team_limit: tournamentData.team_limit || 0,
          participants_registered: 0,
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
        
        // Fetch sport configuration if sport is specified
        if (selectedSport) {
          try {
            const { data: sportConfigData } = await (supabase as any)
              .from('tournament_sports')
              .select()
              .eq('tournament_id', id)
              .eq('sport', selectedSport)
              .maybeSingle();
              
            if (sportConfigData) {
              setSportConfig(sportConfigData);
            }
          } catch (error) {
            console.error('Error fetching sport config:', error);
          }
        }
        
        // Check if user has already submitted a join request
        if (user) {
          const { data: existingRequestData, error: requestError } = await supabase
            .from("tournament_join_requests")
            .select("*")
            .eq("tournament_id", id)
            .eq("user_id", user.id)
            .single();
            
          if (!requestError && existingRequestData) {
            setExistingRequest(existingRequestData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load tournament data");
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentAndCheckRequest();
  }, [id, user, navigate, selectedSport]);

  // Check if registration period has ended
  const isRegistrationClosed = () => {
    if (!tournament?.registration_due_date) return false;
    const dueDate = new Date(tournament.registration_due_date);
    const now = new Date();
    return now > dueDate;
  };

  // Check if tournament is full
  const isTournamentFull = () => {
    if (!tournament) return false;
    return tournament.teams_registered >= tournament.team_limit;
  };

  const handlePlayerInfoComplete = (data: any) => {
    setFormData(data);
    setCompletedSteps([...completedSteps, "player-info"]);
    setCurrentStep("payment-verification");
  };

  const handlePaymentComplete = () => {
    setCompletedSteps([...completedSteps, "payment-verification"]);
    setCurrentStep("confirmation");
  };

  const handleBackToPlayerInfo = () => {
    setCurrentStep("player-info");
  };

  const steps = [
    {
      id: "player-info",
      name: "Player Details",
      description: "Provide your player information",
      completed: completedSteps.includes("player-info"),
    },
    {
      id: "payment-verification",
      name: "Payment",
      description: "Verify payment for tournament entry",
      completed: completedSteps.includes("payment-verification"),
    },
    {
      id: "confirmation",
      name: "Confirmation",
      description: "Registration completion status",
      completed: completedSteps.includes("confirmation"),
    },
  ];

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

  // If user has already submitted a request
  if (existingRequest) {
    return (
      <PageLayout>
        <div className="container py-8">
          <Button variant="ghost" asChild className="mb-6">
            <div onClick={() => navigate(`/tournaments/${id}`)} className="flex items-center cursor-pointer">
              <ArrowLeft size={16} className="mr-2" />
              Back to Tournament
            </div>
          </Button>
          
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>{tournament.tournament_name}</CardTitle>
              <CardDescription>Registration Status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                <div className="flex">
                  <InfoIcon className="h-5 w-5 mr-2" />
                  <div>
                    <h3 className="font-medium">Request Already Submitted</h3>
                    <p className="text-sm">
                      You have already submitted a join request for this tournament. The organizer will review your request and update you on the status.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status:</p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-block h-3 w-3 rounded-full ${
                    existingRequest.status === 'approved' ? 'bg-green-500' :
                    existingRequest.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></span>
                  <span className="font-medium capitalize">{existingRequest.status}</span>
                </div>
                
                {existingRequest.status === 'pending' && (
                  <p className="text-sm text-muted-foreground">
                    Your request is pending approval from the tournament organizer. You'll be notified when there's an update.
                  </p>
                )}
                
                {existingRequest.status === 'approved' && (
                  <p className="text-sm text-green-600">
                    Congratulations! Your request has been approved. You are now registered for this tournament.
                  </p>
                )}
                
                {existingRequest.status === 'rejected' && (
                  <p className="text-sm text-red-600">
                    Sorry, your join request has been rejected.
                    {existingRequest.reviewer_notes && (
                      <span className="block mt-1">Reason: {existingRequest.reviewer_notes}</span>
                    )}
                  </p>
                )}
              </div>
              
              <Button
                onClick={() => navigate(`/tournaments/${id}`)}
                className="w-full"
              >
                Back to Tournament Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // If registration is closed or tournament is full
  if (isRegistrationClosed() || isTournamentFull()) {
    return (
      <PageLayout>
        <div className="container py-8">
          <Button variant="ghost" asChild className="mb-6">
            <div onClick={() => navigate(`/tournaments/${id}`)} className="flex items-center cursor-pointer">
              <ArrowLeft size={16} className="mr-2" />
              Back to Tournament
            </div>
          </Button>
          
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>{tournament.tournament_name}</CardTitle>
              <CardDescription>Registration Status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-red-50 p-4 text-red-800">
                <div className="flex">
                  <InfoIcon className="h-5 w-5 mr-2" />
                  <div>
                    <h3 className="font-medium">
                      {isRegistrationClosed() ? "Registration Closed" : "Tournament Full"}
                    </h3>
                    <p className="text-sm">
                      {isRegistrationClosed()
                        ? "The registration period for this tournament has ended."
                        : "This tournament has reached its maximum capacity of participants."}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => navigate(`/tournaments/${id}`)}
                className="w-full"
              >
                Back to Tournament Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <div onClick={() => navigate(`/tournaments/${id}`)} className="flex items-center cursor-pointer">
            <ArrowLeft size={16} className="mr-2" />
            Back to Tournament
          </div>
        </Button>
        
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">{tournament.tournament_name}</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Complete the registration process to join this tournament
          </p>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CalendarClock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Registration closes on</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tournament.registration_due_date || '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <InfoIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Entry Fee</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{tournament.entry_fee || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-8">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>
          
          <div className="mt-8">
            {currentStep === "player-info" && (
              <JoinForm 
                tournament={tournament} 
                onNext={handlePlayerInfoComplete}
                selectedSport={selectedSport || tournament.sport}
              />
            )}
            
            {currentStep === "payment-verification" && (
              <PaymentVerification
                tournament={tournament}
                formData={formData}
                onBack={handleBackToPlayerInfo}
                onComplete={handlePaymentComplete}
                selectedSport={selectedSport || tournament.sport}
                sportConfig={sportConfig}
              />
            )}
            
            {currentStep === "confirmation" && (
              <Card>
                <CardContent className="pt-8 pb-8 px-6 text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-2xl font-medium">Registration Complete!</h3>
                  <p className="mb-6 text-muted-foreground">
                    Your request to join the tournament has been submitted successfully. The tournament organizer will review your registration and payment details.
                  </p>
                  <div className="space-y-4">
                    <p className="text-sm">
                      <span className="font-medium">Next Steps:</span> You will be notified when your registration is approved. You can also check the status of your registration at any time.
                    </p>
                    <Button onClick={() => navigate(`/tournaments/${tournament.id}`)}>
                      Back to Tournament
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default JoinTournament;
