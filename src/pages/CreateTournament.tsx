
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
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

const CreateTournament = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [sports, setSports] = useState<SportConfig[]>([]);
  const [tournamentLogo, setTournamentLogo] = useState<File | null>(null);
  const [tournamentBanner, setTournamentBanner] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
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

  const onSubmit = (values: TournamentFormValues) => {
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
      console.log({ 
        ...values, 
        sports, 
        logo: tournamentLogo ? tournamentLogo.name : null, 
        banner: tournamentBanner ? tournamentBanner.name : null 
      });
      toast({
        title: "Tournament Created!",
        description: "Your tournament has been created successfully",
      });
      navigate("/tournaments");
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
