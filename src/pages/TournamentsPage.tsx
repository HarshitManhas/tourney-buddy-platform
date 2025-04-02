
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TournamentList from "@/components/TournamentList";
import { Trophy } from "lucide-react";

const TournamentsPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="bg-primary py-12 text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Trophy className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">All Tournaments</h1>
                <p className="text-primary-foreground/90">
                  Browse and join tournaments from around the world
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-12">
          <TournamentList />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default TournamentsPage;
