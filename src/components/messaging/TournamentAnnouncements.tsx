
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Megaphone, Plus } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

interface Announcement {
  id: string;
  tournament_id: string;
  sender_id: string;
  sender_name?: string;
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
        
        const { data, error } = await supabase
          .from("tournament_announcements")
          .select(`
            id, 
            tournament_id, 
            sender_id, 
            title, 
            message, 
            created_at
          `)
          .eq("tournament_id", tournamentId)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        if (data.length > 0) {
          const senderIds = new Set(data.map(a => a.sender_id));
          
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", Array.from(senderIds));
            
          if (profilesError) throw profilesError;
          
          const profileMap = new Map(profiles.map(p => [p.id, p.username]));
          
          // Add sender names to announcements
          const announcementsWithNames = data.map(announcement => ({
            ...announcement,
            sender_name: profileMap.get(announcement.sender_id) || 'Unknown User',
          }));
          
          setAnnouncements(announcementsWithNames);
        } else {
          setAnnouncements([]);
        }
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
      const { error } = await supabase
        .from("tournament_announcements")
        .insert({
          tournament_id: tournamentId,
          sender_id: user.id,
          title: values.title,
          message: values.message,
        });
        
      if (error) throw error;
      
      toast.success("Announcement published successfully");
      form.reset();
      setOpen(false);
      
      // Refresh announcements
      const { data, error: fetchError } = await supabase
        .from("tournament_announcements")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: false });
        
      if (fetchError) throw fetchError;
      
      setAnnouncements(data);
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Failed to publish announcement");
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Announcements</h2>
        </div>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-1/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Announcements</h2>
        
        {isOrganizer && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>Create Tournament Announcement</DialogTitle>
                    <DialogDescription>
                      Share important information with all tournament participants.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="mt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Announcement title" {...field} />
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
                              placeholder="Enter announcement details..." 
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
                      {form.formState.isSubmitting ? "Publishing..." : "Publish Announcement"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {announcements.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No announcements yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {isOrganizer 
              ? "Create your first announcement to communicate with participants." 
              : "There are no announcements for this tournament yet."}
          </p>
          {isOrganizer && (
            <Button className="mt-4" onClick={() => setOpen(true)}>
              Create Announcement
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <CardTitle className="text-xl">{announcement.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{announcement.message}</p>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Posted by {announcement.sender_name}</span>
                  <span>•</span>
                  <span>{format(new Date(announcement.created_at), "PPP 'at' p")}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentAnnouncements;
