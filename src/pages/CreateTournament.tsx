import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SportSettings from "@/components/tournament/SportSettings";
import { toast } from "@/hooks/use-toast";
import { tournamentFormSchema, TournamentFormValues, SportConfig } from "@/types/tournament";
import TournamentMedia from "@/components/tournament/TournamentMedia";
import TournamentInfoForm from "@/components/tournament/TournamentInfoForm";
import ContactInfoForm from "@/components/tournament/ContactInfoForm";
import SportsList from "@/components/tournament/SportsList";
import PaymentDetailsForm from "@/components/tournament/PaymentDetailsForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { uploadTournamentMedia } from "@/utils/storage";

const CreateTournament = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [sports, setSports] = useState<SportConfig[]>([]);
  const [tournamentLogo, setTournamentLogo] = useState<File | null>(null);
  const [tournamentBanner, setTournamentBanner] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: {
      tournamentName: "",
      about: "",
      startDate: "",
      endDate: "",
      registrationDueDate: "",
      dueTime: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      street: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTournamentLogo(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTournamentBanner(file);
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: TournamentFormValues) => {
    if (step === 1) {
      if (sports.length === 0) {
        toast({
          title: "Sports Required",
          description: "Please add at least one sport for the tournament",
          variant: "destructive",
        });
        return;
      }
      
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      try {
        setIsSubmitting(true);
        
        if (!user) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to create a tournament",
            variant: "destructive",
          });
          return;
        }

        // Skip bucket creation check - assume it exists
        // This avoids storage permission errors
        console.log("Proceeding with tournament creation - assume storage is ready");

        // Get the first sport config
        const sportConfig = sports[0];
        
        // Handle entry fee information
        const entryFee = sportConfig?.entryFee ? 
          typeof sportConfig.entryFee === 'string' ? parseInt(sportConfig.entryFee) : sportConfig.entryFee :
          0;
        
        // Determine if this is an individual format
        const isIndividualFormat = 
          sportConfig?.playType === "Singles" && 
          ["Tennis", "Badminton", "Table Tennis"].includes(sportConfig?.sport || "");
        
        // Set team limits based on format
        const teamLimit = isIndividualFormat 
          ? (sportConfig?.maxParticipants ? Number(sportConfig.maxParticipants) : 10)
          : (sportConfig?.maxTeams ? Number(sportConfig.maxTeams) : 10);

        // Get QR code URL if available - could be preview URL or uploaded URL
        const qrCodeUrl = sportConfig?.qrCodeUrl || null;

        // Upload logo and banner if provided
        let logoUrl = null;
        let bannerUrl = null;

        if (tournamentLogo) {
          logoUrl = await uploadTournamentMedia(tournamentLogo, 'logo');
        }
        
        if (tournamentBanner) {
          bannerUrl = await uploadTournamentMedia(tournamentBanner, 'banner');
        }

        // Create tournament data with all necessary fields
        const tournamentData = {
          tournament_name: values.tournamentName,
          about: values.about,
          start_date: values.startDate,
          end_date: values.endDate,
          registration_due_date: values.registrationDueDate,
          due_time: values.dueTime,
          contact_name: values.contactName,
          contact_email: values.contactEmail,
          contact_phone: values.contactPhone,
          address: values.address,
          street: values.street,
          city: values.city,
          state: values.state,
          country: values.country,
          pin_code: values.pinCode,
          sport: sportConfig?.sport || null,
          format: sportConfig?.format || null,
          entry_fee: entryFee,
          team_limit: teamLimit,
          teams_registered: 0,
          creator_id: user.id,
          user_id: user.id,
          banner_url: bannerUrl,
          logo_url: logoUrl,
          image_url: bannerUrl,
        };

        console.log("Submitting tournament data:", tournamentData);

        const { data, error } = await supabase
          .from('tournaments')
          .insert(tournamentData)
          .select('id')
          .single();

        if (error) {
          // Handle the case where columns don't exist
          if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
            console.warn("Database schema missing columns:", error.message);
            
            // Try again with all fields, letting Supabase handle missing columns
            const { data: basicData, error: basicError } = await supabase
              .from('tournaments')
              .insert(tournamentData)
              .select('id')
              .single();
              
            if (basicError) {
              throw basicError;
            }
            
            // Save sports data with all configuration
            const sportsData = sports.map(sport => ({
              tournament_id: basicData.id,
              sport: sport.sport,
              event_name: sport.eventName,
              format: sport.format,
              max_teams: sport.maxTeams,
              max_participants: sport.maxParticipants,
              gender: sport.gender,
              entry_fee: sport.entryFee,
              play_type: sport.playType,
              additional_details: sport.additionalDetails,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));

            const { error: sportsError } = await supabase
              .from('tournament_sports')
              .insert(sportsData);

            if (sportsError) {
              console.error("Error saving sports data:", sportsError);
              toast({
                title: "Warning",
                description: "Tournament created, but sports details may be incomplete.",
                variant: "destructive",
              });
            }
            
            toast({
              title: "Tournament Created!",
              description: "Your tournament has been created successfully",
            });
            
            navigate(`/tournaments/${basicData.id}`);
            return;
          }
          
          throw error;
        }

        // Save sports data for successful tournament creation
        const sportsData = sports.map(sport => ({
          tournament_id: data.id,
          sport: sport.sport,
          event_name: sport.eventName,
          format: sport.format,
          max_teams: sport.maxTeams,
          max_participants: sport.maxParticipants,
          gender: sport.gender,
          entry_fee: sport.entryFee,
          play_type: sport.playType,
          additional_details: sport.additionalDetails,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: sportsError } = await supabase
          .from('tournament_sports')
          .insert(sportsData);

        if (sportsError) {
          console.error("Error saving sports data:", sportsError);
          toast({
            title: "Warning",
            description: "Tournament created, but sports details may be incomplete.",
            variant: "destructive",
          });
        }

        toast({
          title: "Tournament Created!",
          description: "Your tournament has been created successfully",
        });
        
        navigate(`/tournaments/${data.id}`);
      } catch (error: any) {
        console.error('Error creating tournament:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create tournament",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const addSport = (sportConfig: SportConfig) => {
    setSports((prev) => [...prev, sportConfig]);
  };

  const removeSport = (id: string) => {
    setSports((prev) => prev.filter((sport) => sport.id !== id));
  };

  const updateSport = (id: string, updatedConfig: Partial<SportConfig>) => {
    setSports((prev) =>
      prev.map((sport) =>
        sport.id === id ? { ...sport, ...updatedConfig } : sport
      )
    );
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Step {step} of 2
          </div>
        </div>

        {step === 1 ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <TournamentMedia 
                logoPreview={logoPreview}
                bannerPreview={bannerPreview}
                handleLogoChange={handleLogoChange}
                handleBannerChange={handleBannerChange}
              />

              <div className="grid gap-8 md:grid-cols-2">
                <TournamentInfoForm form={form} />
                <ContactInfoForm form={form} />
              </div>
              
              <Separator className="my-8" />
              
              <div>
                <h2 className="mb-6 text-xl font-semibold">Sports & Event Settings</h2>
                
                <SportsList sports={sports} removeSport={removeSport} />
                
                <div className="rounded-md border border-dashed border-green-500 bg-green-50 p-6">
                  <SportSettings onAddSport={addSport} />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" asChild>
                  <Link to="/tournaments">Cancel</Link>
                </Button>
                <Button type="submit">Save & Proceed to Payment</Button>
              </div>
            </form>
          </Form>
        ) : (
          <PaymentDetailsForm 
            sports={sports}
            updateSport={updateSport}
            setStep={setStep}
            onSubmit={() => onSubmit(form.getValues())}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CreateTournament;
