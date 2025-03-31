
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Clock, MapPin, Plus, Save, X, Trash } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SportSettings from "@/components/tournament/SportSettings";
import { toast } from "@/hooks/use-toast";

const tournamentFormSchema = z.object({
  tournamentName: z.string().min(3, "Tournament name must be at least 3 characters"),
  about: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  registrationDueDate: z.string().min(1, "Registration due date is required"),
  dueTime: z.string().min(1, "Due time is required"),
  contactName: z.string().min(3, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(3, "Address is required"),
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pinCode: z.string().optional(),
});

type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

type SportConfig = {
  id: string;
  sport: string;
  eventName: string;
  format: string;
  maxTeams: number;
  gender: string;
  playType?: string; // For sports like tennis, badminton, etc.
  additionalDetails?: string;
};

const CreateTournament = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [sports, setSports] = useState<SportConfig[]>([]);
  
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
      // Here we would submit all the data including form values and sports
      console.log({ ...values, sports });
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
          <h1 className="text-3xl font-bold">Tournament Creation Form</h1>
          <div className="text-sm text-muted-foreground">
            Step {step} of 2
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {step === 1 ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Tournament Information Section */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Information</h2>
                    
                    <FormField
                      control={form.control}
                      name="tournamentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tournament Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter tournament name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="about"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Your Tournament</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Say something about this tournament"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <h2 className="text-xl font-semibold pt-4">Timeline</h2>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="registrationDueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Due Date <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dueTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Time <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="time" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Contact Information Section */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Contact Information</h2>
                    
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <h2 className="text-xl font-semibold pt-4">Location Address</h2>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Enter address" className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street / Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter street or location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pinCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIN / ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter PIN/ZIP code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-8" />
                
                {/* Sports & Event Settings Section */}
                <div>
                  <h2 className="mb-6 text-xl font-semibold">Sports & Event Settings</h2>
                  
                  {sports.length > 0 && (
                    <div className="mb-6 space-y-4">
                      {sports.map((sport) => (
                        <div
                          key={sport.id}
                          className="flex flex-wrap items-center justify-between rounded-md border bg-background p-4"
                        >
                          <div>
                            <div className="font-medium">{sport.sport}</div>
                            <div className="text-sm text-muted-foreground">
                              {sport.eventName} • {sport.format} • Max Teams: {sport.maxTeams} • {sport.gender}
                              {sport.playType && ` • ${sport.playType}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // This would open the sport for editing if needed
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSport(sport.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
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
            // Payment Page (Step 2)
            <div className="space-y-8">
              <h2 className="text-xl font-semibold">Payment Details</h2>
              
              <div className="space-y-6">
                {sports.map((sport) => (
                  <div
                    key={sport.id}
                    className="rounded-md border p-6 shadow-sm"
                  >
                    <h3 className="mb-4 text-lg font-medium">{sport.sport} - {sport.eventName}</h3>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Registration Fee <span className="text-destructive">*</span>
                        </label>
                        <Input 
                          type="number" 
                          placeholder="Enter fee amount" 
                          className="mb-2"
                          onChange={(e) => {
                            const fee = parseInt(e.target.value);
                            updateSport(sport.id, { additionalDetails: `Fee: ${fee}` });
                          }}
                        />
                        <p className="text-sm text-muted-foreground">
                          Fee for team registration in {sport.sport} event
                        </p>
                      </div>
                      
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          UPI QR Code <span className="text-destructive">*</span>
                        </label>
                        <div className="flex h-[150px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/50 p-4 transition-colors hover:bg-muted">
                          <div className="flex flex-col items-center justify-center space-y-2 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Plus className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium">Upload QR Code</span>
                            <span className="text-xs text-muted-foreground">
                              Upload UPI QR code for payments
                            </span>
                          </div>
                          <Input
                            type="file"
                            className="absolute h-full w-full cursor-pointer opacity-0"
                            onChange={() => {
                              // Normally would handle file upload here
                              toast({
                                title: "QR Code uploaded",
                                description: `QR code for ${sport.sport} uploaded successfully`
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline">
                    Save as Draft
                  </Button>
                  <Button onClick={() => onSubmit(form.getValues())}>
                    Save & Publish
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateTournament;
