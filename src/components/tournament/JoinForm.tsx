
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tournament, SportConfig } from "@/types/tournament";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Upload, QrCode, Copy, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Stepper, Step } from "@/components/ui/stepper";
import TournamentPaymentForm from "./TournamentPaymentForm";

// Mapping of sports to their respective roles
const sportRoles = {
  Cricket: ["Batsman", "Bowler", "All-rounder", "Wicket Keeper"],
  Football: ["Goalkeeper", "Center Back (CB)", "Left Back (LB)", "Right Back (RB)", 
             "Center Midfield (CM)", "Left Midfield (LM)", "Right Midfield (RM)", 
             "Center Attack Midfield (CAM)", "Left Wing (LW)", "Right Wing (RW)", 
             "Striker (ST)", "Center Forward (CF)"],
  Basketball: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  Volleyball: ["Setter", "Outside Hitter", "Middle Blocker", "Opposite Hitter", "Libero"],
  Hockey: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  "Table Tennis": [],
  Badminton: [],
  Tennis: [],
  // Add more sports and their roles as needed
};

// Sports that support player auctions
const auctionSports = ["Cricket", "Football", "Basketball", "Volleyball", "Hockey"];

// Sports that are team-based
const teamSports = ["Cricket", "Football", "Basketball", "Volleyball", "Hockey"];

// Define props interface
interface JoinFormProps {
  tournament: Tournament;
}

const JoinForm = ({ tournament }: JoinFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>(null);
  const [paymentProofImage, setPaymentProofImage] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  
  // Determine if doubles is selected
  const isDoubles = tournament?.format?.includes("Doubles") || false;
  const isTeamSport = tournament?.sport ? teamSports.includes(tournament.sport) : false;
  const isAuctionSport = tournament?.sport ? auctionSports.includes(tournament.sport) : false;
  
  // Form schema based on tournament type
  const formSchema = z.object({
    playerName: z.string().min(2, "Name is required"),
    gender: z.enum(["Male", "Female", "Other"]),
    mobileNo: z.string().min(10, "Mobile number must be at least 10 digits"),
    roles: isTeamSport ? z.array(z.string()).min(1, "Select at least one role") : z.array(z.string()).optional(),
    partnerName: isDoubles ? z.string().min(2, "Partner name is required") : z.string().optional(),
    partnerGender: isDoubles ? z.enum(["Male", "Female", "Other"]) : z.enum(["Male", "Female", "Other"]).optional(),
    partnerMobileNo: isDoubles ? z.string().min(10, "Partner mobile number must be at least 10 digits") : z.string().optional(),
    additionalInfo: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      gender: "Male",
      mobileNo: "",
      roles: [],
      partnerName: "",
      partnerGender: "Male",
      partnerMobileNo: "",
      additionalInfo: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    if (!user || !tournament) return;
    
    setFormData(data);
    setStep(1); // Move to payment step
  };

  const handleFinalSubmit = async () => {
    if (!user || !tournament || !formData || !paymentProofImage) {
      toast.error("Please complete all required information");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Upload profile image if provided
      let profileImageUrl = "";
      if (profileImage && isAuctionSport) {
        const fileName = `${user.id}_${uuidv4()}`;
        
        // Upload the image to Supabase Storage
        const { error: uploadError } = await supabase
          .storage
          .from('profile-images')
          .upload(fileName, profileImage, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) throw uploadError;
        
        // Get the public URL of the uploaded image
        const { data: { publicUrl } } = supabase
          .storage
          .from('profile-images')
          .getPublicUrl(fileName);
          
        profileImageUrl = publicUrl;
      }

      // Upload payment proof
      const paymentProofFileName = `${user.id}/${tournament.id}_${uuidv4()}`;
      
      // Upload the payment proof to Supabase Storage
      const { error: paymentProofError } = await supabase
        .storage
        .from('payment-proofs')
        .upload(paymentProofFileName, paymentProofImage, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (paymentProofError) throw paymentProofError;
      
      // Get the public URL of the uploaded payment proof
      const { data: { publicUrl: paymentProofUrl } } = supabase
        .storage
        .from('payment-proofs')
        .getPublicUrl(paymentProofFileName);

      // Create tournament join request
      const { error: requestError } = await supabase
        .from("tournament_join_requests")
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
          player_name: formData.playerName,
          gender: formData.gender,
          mobile_no: formData.mobileNo,
          roles: selectedRoles,
          partner_name: formData.partnerName || null,
          partner_gender: formData.partnerGender || null,
          partner_mobile_no: formData.partnerMobileNo || null,
          additional_info: formData.additionalInfo || null,
          payment_proof_url: paymentProofUrl,
          status: 'pending',
        });
      
      if (requestError) throw requestError;
      
      // Show success message and navigate
      toast.success("Tournament join request submitted successfully! The organizer will review your request.");
      navigate(`/tournaments/${tournament.id}`);
    } catch (error) {
      console.error("Error submitting join request:", error);
      toast.error("Failed to submit join request");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentProofImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
    
    // Update the form value
    const currentRoles = form.getValues().roles || [];
    if (currentRoles.includes(role)) {
      form.setValue('roles', currentRoles.filter(r => r !== role));
    } else {
      form.setValue('roles', [...currentRoles, role]);
    }
  };

  const stepTitles = ["Player Information", "Payment Verification"];
  
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to={`/tournaments/${tournament.id}`} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Back to Tournament</span>
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold">{tournament.tournament_name}</h1>
        <p className="text-lg text-muted-foreground">Join {tournament.sport} Tournament</p>
      </div>

      <div className="mb-8">
        <Stepper activeStep={step}>
          {stepTitles.map((title, index) => (
            <Step key={index} label={title} />
          ))}
        </Stepper>
      </div>
      
      {step === 0 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Player Details</CardTitle>
                <CardDescription>
                  Enter your information to join this tournament
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Player Details */}
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="playerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mobileNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Roles Selection for Team Sports */}
                {isTeamSport && tournament.sport && sportRoles[tournament.sport as keyof typeof sportRoles] && (
                  <div className="space-y-4">
                    <FormLabel>Player Roles</FormLabel>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                      {sportRoles[tournament.sport as keyof typeof sportRoles].map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${role}`}
                            checked={selectedRoles.includes(role)}
                            onCheckedChange={() => handleRoleToggle(role)}
                          />
                          <Label
                            htmlFor={`role-${role}`}
                            className="text-sm font-normal"
                          >
                            {role}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedRoles.length === 0 && form.formState.errors.roles && (
                      <p className="text-sm font-medium text-destructive">
                        {String(form.formState.errors.roles.message)}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Player Image Upload for Auction Sports */}
                {isAuctionSport && (
                  <div className="space-y-4">
                    <FormLabel>Player Photo</FormLabel>
                    <FormDescription>
                      Upload your photo for the tournament auction
                    </FormDescription>
                    
                    <div className="flex items-start space-x-4">
                      <div className="flex h-40 w-40 flex-col items-center justify-center rounded-md border border-dashed bg-muted/50">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile preview"
                            className="h-full w-full rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-2 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Click to upload photo
                            </span>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute h-full w-full cursor-pointer opacity-0"
                          onChange={handleImageChange}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Please upload a clear, recent photograph. This will be used during team formation and auction processes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Partner Details for Doubles */}
                {isDoubles && (
                  <div className="space-y-6 border-t pt-6">
                    <h3 className="text-lg font-medium">Partner Details</h3>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="partnerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter partner name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="partnerGender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="partnerMobileNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter partner mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Additional Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Any additional details the organizer should know"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Continue to Payment <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}

      {step === 1 && (
        <TournamentPaymentForm
          tournament={tournament}
          paymentProofPreview={paymentProofPreview}
          handlePaymentProofChange={handlePaymentProofChange}
          onBack={() => setStep(0)}
          onSubmit={handleFinalSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default JoinForm;
