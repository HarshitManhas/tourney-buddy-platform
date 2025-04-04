
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Json } from "@/integrations/supabase/types";

interface Announcement {
  id: string;
  tournament_id: string;
  sender_id: string;
  sender_name: string;
  title: string;
  message: string;
  created_at: string;
}

interface TournamentAnnouncementsProps {
  tournamentId: string;
  isOrganizer: boolean;
}

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

const TournamentAnnouncements = ({ tournamentId, isOrganizer }: TournamentAnnouncementsProps) => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  });
  
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        
        // Use the get_tournament_announcements RPC function with parameter t_id
        const { data, error } = await supabase.rpc('get_tournament_announcements', {
          t_id: tournamentId
        });
          
        if (error) throw error;
        
        // Cast the JSON data to the Announcement type
        const typedData = (data || []) as Announcement[];
        setAnnouncements(typedData);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        toast.error("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, [tournamentId]);
  
  const onSubmit = async (values: z.infer<typeof announcementSchema>) => {
    if (!user) {
      toast.error("You must be logged in to create announcements");
      return;
    }
    
    try {
      // Use the create_tournament_announcement RPC function
      const { error } = await supabase.rpc('create_tournament_announcement', {
        tournament_id: tournamentId,
        sender_id: user.id,
        title: values.title,
        message_text: values.message
      });
        
      if (error) throw error;
      
      toast.success("Announcement created successfully");
      form.reset();
      setOpen(false);
      
      // Refresh announcements to show the new one
      const { data, error: fetchError } = await supabase.rpc('get_tournament_announcements', {
        t_id: tournamentId
      });
        
      if (fetchError) throw fetchError;
      
      // Cast the JSON data to the Announcement type
      const typedData = (data || []) as Announcement[];
      setAnnouncements(typedData);
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Failed to create announcement");
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Announcements</h2>
        {isOrganizer && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle size={16} />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[475px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                    <DialogDescription>
                      Add a new announcement to keep participants informed.
                    </DialogDescription>
                  </DialogHeader>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Announcement Title" {...field} />
                        </FormControl>
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
                            placeholder="Enter your message here."
                            className="h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Creating..." : "Create Announcement"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle><Skeleton className="h-5 w-40" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-32" /></CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <CardTitle>{announcement.title}</CardTitle>
                <CardDescription>
                  By {announcement.sender_name} - {format(new Date(announcement.created_at), "PPP 'at' p")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{announcement.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-8 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No announcements yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Stay tuned for updates from the tournament organizer!
          </p>
        </div>
      )}
    </div>
  );
};

export default TournamentAnnouncements;
