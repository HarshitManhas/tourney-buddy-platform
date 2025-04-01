
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { TournamentFormValues } from "@/types/tournament";

interface ContactInfoFormProps {
  form: UseFormReturn<TournamentFormValues>;
}

const ContactInfoForm = ({ form }: ContactInfoFormProps) => {
  return (
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
  );
};

export default ContactInfoForm;
