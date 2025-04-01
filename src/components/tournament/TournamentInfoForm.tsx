
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { TournamentFormValues } from "@/types/tournament";

interface TournamentInfoFormProps {
  form: UseFormReturn<TournamentFormValues>;
}

const TournamentInfoForm = ({ form }: TournamentInfoFormProps) => {
  return (
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
  );
};

export default TournamentInfoForm;
