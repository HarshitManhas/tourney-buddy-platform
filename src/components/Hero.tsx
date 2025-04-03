
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateTournament = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a tournament",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    navigate("/create-tournament");
  };

  return (
    <div className="relative overflow-hidden">
      <div className="hero-gradient absolute inset-0 opacity-10" />
      <div className="container mx-auto px-4 py-20 sm:py-24 lg:py-32">
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Manage Tournaments <br />
            <span className="text-primary">Like a Pro</span>
          </h1>
          
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Create, manage, and participate in tournaments with ease. From registration to scoring, 
            SportsFolio provides the tools you need for successful sporting events.
          </p>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button 
              size="lg" 
              className="px-8"
              onClick={handleCreateTournament}
            >
              Create Tournament
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="px-8"
            >
              <Link to="/tournaments">Browse Tournaments</Link>
            </Button>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">100+</p>
              <p className="text-sm text-muted-foreground">Active Tournaments</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">10k+</p>
              <p className="text-sm text-muted-foreground">Players</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">50+</p>
              <p className="text-sm text-muted-foreground">Sports</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">5k+</p>
              <p className="text-sm text-muted-foreground">Teams</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
