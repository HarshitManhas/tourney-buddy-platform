
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

interface Tournament {
  id: string;
  tournament_name: string;
  creator_id: string;
  creator_name: string;
}

interface ComposeMessageProps {
  onMessageSent?: () => void;
  preselectedTournamentId?: string;
}

const messageSchema = z.object({
  tournamentId: z.string().uuid({ message: "Please select a tournament" }),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

const ComposeMessage = ({ onMessageSent, preselectedTournamentId }: ComposeMessageProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      tournamentId: preselectedTournamentId || "",
      message: "",
    },
  });

  useEffect(() => {
    const fetchTournaments = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Use the get_user_tournaments RPC function
        const { data, error } = await supabase.rpc('get_user_tournaments', {
          user_id: user.id
        });
          
        if (error) throw error;
        
        setTournaments(data || []);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        toast.error("Failed to load tournaments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournaments();
  }, [user]);
  
  useEffect(() => {
    if (preselectedTournamentId) {
      form.setValue("tournamentId", preselectedTournamentId);
    }
  }, [preselectedTournamentId, form]);
  
  const onSubmit = async (values: z.infer<typeof messageSchema>) => {
    if (!user) {
      toast.error("You must be logged in to send messages");
      return;
    }
    
    try {
      const selectedTournament = tournaments.find(t => t.id === values.tournamentId);
      
      if (!selectedTournament) {
        toast.error("Selected tournament not found");
        return;
      }
      
      // Find the recipient (tournament creator)
      const recipientId = selectedTournament.creator_id;
      
      if (!recipientId) {
        toast.error("Tournament creator not found");
        return;
      }
      
      // Don't allow sending messages to yourself
      if (recipientId === user.id) {
        toast.error("You cannot send messages to yourself");
        return;
      }
      
      // Use the send_private_message RPC function
      const { error } = await supabase.rpc('send_private_message', {
        sender_id: user.id,
        recipient_id: recipientId,
        tournament_id: values.tournamentId,
        message_text: values.message
      });
        
      if (error) throw error;
      
      toast.success("Message sent successfully");
      form.reset();
      setOpen(false);
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Pencil size={16} />
          Compose Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Send a message</DialogTitle>
              <DialogDescription>
                Contact a tournament organizer with your questions or feedback.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-6 space-y-4">
              <FormField
                control={form.control}
                name="tournamentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament</FormLabel>
                    <Select
                      disabled={loading || !!preselectedTournamentId}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tournament" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tournaments.map((tournament) => (
                          <SelectItem key={tournament.id} value={tournament.id}>
                            {tournament.tournament_name} (by {tournament.creator_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your message here..." 
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeMessage;
