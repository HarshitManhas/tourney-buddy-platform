
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import AuthGuard from "@/components/AuthGuard";

type Tournament = Database['public']['Tables']['tournaments']['Row'];

const EditTournament = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tournament_name: "",
    sport: "",
    location: "",
    city: "",
    state: "",
    about: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    start_date: "",
    end_date: "",
    registration_due_date: "",
    team_limit: "",
    entry_fee: ""
  });

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setTournament(data);
          
          // Format dates for input fields
          const formatDate = (dateString: string | null) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };

          setFormData({
            tournament_name: data.tournament_name || "",
            sport: data.sport || "",
            location: data.location || "",
            city: data.city || "",
            state: data.state || "",
            about: data.about || "",
            contact_name: data.contact_name || "",
            contact_email: data.contact_email || "",
            contact_phone: data.contact_phone || "",
            start_date: formatDate(data.start_date),
            end_date: formatDate(data.end_date),
            registration_due_date: formatDate(data.registration_due_date),
            team_limit: data.team_limit?.toString() || "",
            entry_fee: data.entry_fee?.toString() || ""
          });
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
        toast({
          title: "Error",
          description: "Failed to load tournament details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tournament || !user) return;
    
    // Verify if user is the creator
    if (tournament.creator_id !== user.id) {
      toast({
        title: "Permission denied",
        description: "You can only edit tournaments you created",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Convert string values back to numbers where needed
      const updateData = {
        ...formData,
        team_limit: formData.team_limit ? parseInt(formData.team_limit) : null,
        entry_fee: formData.entry_fee ? parseInt(formData.entry_fee) : null
      };
      
      const { error } = await supabase
        .from('tournaments')
        .update(updateData)
        .eq('id', tournament.id)
        .eq('creator_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Tournament updated successfully",
      });
      
      navigate(`/tournaments/${tournament.id}`);
    } catch (error: any) {
      console.error('Error updating tournament:', error);
      toast({
        title: "Error",
        description: "Failed to update tournament",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4">Loading tournament details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (tournament && user && tournament.creator_id !== user.id) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Permission Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You can only edit tournaments that you created.</p>
              <Button asChild>
                <a href={`/tournaments/${tournament.id}`}>View Tournament</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Tournament</h1>
          <p className="text-muted-foreground">Update your tournament details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tournament_name">Tournament Name*</Label>
                  <Input 
                    id="tournament_name"
                    name="tournament_name"
                    value={formData.tournament_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport</Label>
                  <Input 
                    id="sport"
                    name="sport"
                    value={formData.sport}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                <Textarea 
                  id="about"
                  name="about"
                  value={formData.about || ""}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state"
                    name="state"
                    value={formData.state || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dates & Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input 
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input 
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_due_date">Registration Due Date</Label>
                  <Input 
                    id="registration_due_date"
                    name="registration_due_date"
                    type="date"
                    value={formData.registration_due_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="team_limit">Team Limit</Label>
                  <Input 
                    id="team_limit"
                    name="team_limit"
                    type="number"
                    value={formData.team_limit}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry_fee">Entry Fee (₹)</Label>
                  <Input 
                    id="entry_fee"
                    name="entry_fee"
                    type="number"
                    value={formData.entry_fee}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input 
                    id="contact_name"
                    name="contact_name"
                    value={formData.contact_name || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input 
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input 
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(`/tournaments/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditTournament;
