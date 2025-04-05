
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Stepper } from "@/components/ui/stepper";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { Tournament } from "@/types/tournament";

const joinFormSchema = z.object({
  playerName: z.string().min(2, "Name is required"),
  gender: z.string().min(1, "Gender is required"),
  mobileNo: z.string().min(10, "Mobile number must be at least 10 digits"),
  roles: z.array(z.string()).optional(),
  needsPartner: z.boolean().optional(),
  partnerName: z.string().optional(),
  partnerGender: z.string().optional(),
  partnerMobileNo: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type JoinFormValues = z.infer<typeof joinFormSchema>;

interface JoinFormProps {
  tournament: Tournament;
  onNext: (data: JoinFormValues) => void;
}

export function JoinForm({ tournament, onNext }: JoinFormProps) {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [needsPartner, setNeedsPartner] = useState(false);
  const isDoublesFormat = tournament.format?.includes("Doubles") || false;

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      playerName: "",
      gender: "",
      mobileNo: "",
      roles: [],
      needsPartner: false,
      partnerName: "",
      partnerGender: "",
      partnerMobileNo: "",
      additionalInfo: "",
    },
  });

  const handleRoleToggle = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter((r) => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  useEffect(() => {
    form.setValue("roles", roles);
  }, [roles, form]);

  const onSubmit = (data: JoinFormValues) => {
    onNext(data);
  };

  // Generate roles based on sport
  const getRolesForSport = () => {
    const sportRoles: Record<string, string[]> = {
      "Cricket": ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"],
      "Football": ["Forward", "Midfielder", "Defender", "Goalkeeper"],
      "Tennis": ["Singles", "Doubles"],
      "Badminton": ["Singles", "Doubles", "Mixed Doubles"],
      "Basketball": ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
      "Volleyball": ["Setter", "Outside Hitter", "Middle Blocker", "Opposite", "Libero"],
      "Table Tennis": ["Singles", "Doubles", "Mixed Doubles"],
      "Hockey": ["Forward", "Midfielder", "Defender", "Goalkeeper"],
    };

    return sportRoles[tournament.sport] || [];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="playerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
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
                  <Input placeholder="Enter your mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {getRolesForSport().length > 0 && (
          <FormItem>
            <FormLabel>Choose Your Role(s)</FormLabel>
            <div className="flex flex-wrap gap-2">
              {getRolesForSport().map((role) => (
                <Badge
                  key={role}
                  variant={roles.includes(role) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    roles.includes(role) ? "bg-primary" : "bg-secondary/20"
                  }`}
                  onClick={() => handleRoleToggle(role)}
                >
                  {role}
                  {roles.includes(role) && (
                    <X className="ml-1 h-3 w-3" onClick={(e) => {
                      e.stopPropagation();
                      handleRoleToggle(role);
                    }} />
                  )}
                </Badge>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}

        {isDoublesFormat && (
          <>
            <FormField
              control={form.control}
              name="needsPartner"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setNeedsPartner(!!checked);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I already have a partner for doubles</FormLabel>
                    <FormDescription>
                      Check this if you're registering with a partner for this doubles tournament
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {needsPartner && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-medium">Partner Details</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="partnerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your partner's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="partnerGender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner's Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormLabel>Partner's Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter partner's mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any other details you'd like to share with the tournament organizer"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto">
          Next: Payment Verification
        </Button>
      </form>
    </Form>
  );
}
