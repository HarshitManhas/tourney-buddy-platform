
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { racquetSports, sportsRoles, auctionSports } from "./constants/sportsData";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Info, Upload } from "lucide-react";
import PlayerDetails from "./PlayerDetails";

interface JoinFormProps {
  tournament: any;
}

const JoinForm = ({ tournament }: JoinFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Determine if this is a doubles or mixed format
  const isRacquetSport = racquetSports.includes(tournament.sport);
  const isTeamSport = !isRacquetSport;
  const playType = tournament.playType || "Singles";
  const isDoubles = playType === "Doubles" || playType === "Mixed";
  const isAuctionSport = auctionSports.includes(tournament.sport);
  const sportRoleOptions = sportsRoles[tournament.sport as keyof typeof sportsRoles] || [];
  
  // Custom additional fields from tournament
  const additionalFields = tournament.additionalFields ? JSON.parse(tournament.additionalFields) : [];

  // Dynamic form validation schema based on sport type and format
  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    gender: z.string().min(1, "Please select your gender"),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
    age: z.string().optional(),
    experience: z.string().optional(),
    // Additional fields will be validated dynamically
    ...(sportRoleOptions.length > 0 && {
      roles: isTeamSport && tournament.sport === "Football"
        ? z.array(z.string()).min(1, "Select at least one role")
        : z.string().min(1, "Please select a role"),
    }),
    ...(isDoubles && {
      partner_name: z.string().min(2, "Partner name must be at least 2 characters"),
      partner_gender: z.string().min(1, "Please select your partner's gender"),
      partner_mobile: z.string().min(10, "Partner's mobile number must be at least 10 digits"),
      partner_age: z.string().optional(),
      partner_experience: z.string().optional(),
    }),
    // Dynamic fields for custom fields added by organizer
    ...additionalFields.reduce((acc: any, field: any) => {
      if (field.required) {
        acc[field.name] = z.string().min(1, `${field.label} is required`);
      } else {
        acc[field.name] = z.string().optional();
      }
      return acc;
    }, {}),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "",
      mobile: "",
      age: "",
      experience: "",
      ...(isDoubles && {
        partner_name: "",
        partner_gender: "",
        partner_mobile: "",
        partner_age: "",
        partner_experience: "",
      }),
      ...additionalFields.reduce((acc: any, field: any) => {
        acc[field.name] = "";
        return acc;
      }, {}),
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleChange = (role: string) => {
    // For Football, allow multiple roles
    if (tournament.sport === "Football") {
      setSelectedRoles(prev => 
        prev.includes(role) 
          ? prev.filter(r => r !== role)
          : [...prev, role]
      );
    } 
    // For other sports, just set the single role
    else {
      form.setValue("roles", role);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to join a tournament");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // For Football, get roles from state
      if (tournament.sport === "Football") {
        data.roles = selectedRoles;
      }

      // Upload profile image if provided
      let profileImageUrl = null;
      if (profileImage) {
        const fileName = `${user.id}-${Date.now()}.${profileImage.name.split('.').pop()}`;
        
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('profile-images')
          .upload(fileName, profileImage);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL of the uploaded image
        const { data: { publicUrl } } = supabase
          .storage
          .from('profile-images')
          .getPublicUrl(fileName);
          
        profileImageUrl = publicUrl;
      }

      // Prepare participant data
      const participantData = {
        tournament_id: tournament.id,
        user_id: user.id,
        role: "player",
        player_details: {
          ...data,
          profile_image: profileImageUrl,
        },
      };

      // Save to tournament_participants table
      const { error: participantError } = await supabase
        .from("tournament_participants")
        .insert(participantData);

      if (participantError) throw participantError;

      // Increment teams_registered or participants_registered based on format
      const updateField = isDoubles || isTeamSport ? "teams_registered" : "participants_registered";
      
      // Update using the increment feature
      const { error: tournamentError } = await supabase
        .from("tournaments")
        .update({ 
          [updateField]: tournament[updateField] + 1 
        })
        .eq("id", tournament.id);

      if (tournamentError) throw tournamentError;

      toast.success("You have successfully joined the tournament!");
      navigate(`/tournaments/${tournament.id}`);
    } catch (error) {
      console.error("Error joining tournament:", error);
      toast.error("Failed to join tournament. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Join Tournament</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Player Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Player Details</h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-2/3 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="mobile"
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
              </div>
              
              {/* Profile Image Upload (only for auction sports) */}
              {isAuctionSport && (
                <div className="w-full md:w-1/3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
                    {imagePreview ? (
                      <div className="relative w-32 h-32 mb-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => {
                            setImagePreview(null);
                            setProfileImage(null);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <Upload className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    
                    <label htmlFor="profile-image" className="cursor-pointer">
                      <div className="bg-primary text-white px-3 py-1 rounded text-sm">
                        Choose Photo
                      </div>
                      <input
                        id="profile-image"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {isAuctionSport ? "Required for auction" : "Optional"} (Max 2MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter your age" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (years)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Years of experience" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Sport-specific Roles */}
          {sportRoleOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Playing Role</h3>
              
              {tournament.sport === "Football" ? (
                <div className="space-y-2">
                  <FormLabel>Select Your Positions (Multiple)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {sportRoleOptions.map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role}`}
                          checked={selectedRoles.includes(role)}
                          onCheckedChange={() => handleRoleChange(role)}
                        />
                        <label
                          htmlFor={`role-${role}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {role}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedRoles.length === 0 && form.formState.errors.roles && (
                    <p className="text-sm font-medium text-destructive">
                      {String(form.formState.errors.roles.message)}
                    </p>
                  )}
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Your Role</FormLabel>
                      <div className="space-y-2">
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {sportRoleOptions.map((role) => (
                            <div key={role} className="flex items-center space-x-2">
                              <RadioGroupItem value={role} id={`role-${role}`} />
                              <label
                                htmlFor={`role-${role}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {role}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}
          
          {/* Partner Details for Doubles/Mixed */}
          {isDoubles && (
            <PlayerDetails form={form} prefix="partner_" title="Partner Details" />
          )}
          
          {/* Additional Custom Fields */}
          {additionalFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalFields.map((field: any) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                        <FormControl>
                          {field.type === 'textarea' ? (
                            <Textarea placeholder={field.placeholder || `Enter ${field.label}`} {...formField} />
                          ) : (
                            <Input 
                              type={field.type || "text"} 
                              placeholder={field.placeholder || `Enter ${field.label}`} 
                              {...formField} 
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Tournament Rules and Guidelines */}
          <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-700">Important Information</h4>
              <p className="text-sm text-blue-600 mt-1">
                By joining this tournament, you agree to follow all rules and guidelines set by the organizers. 
                Please ensure all information provided is accurate.
              </p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Join Tournament"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default JoinForm;
