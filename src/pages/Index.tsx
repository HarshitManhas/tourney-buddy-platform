
import Hero from '@/components/Hero';
import FeatureSection from '@/components/FeatureSection';
import TournamentList from '@/components/TournamentList';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main>
        <Hero />
        
        <FeatureSection />
        
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Tournaments</h2>
            <Button asChild variant="outline">
              <Link to="/tournaments">View All</Link>
            </Button>
          </div>
          <TournamentList />
        </section>
        
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
                <p className="mb-6 max-w-md text-primary-foreground/90">
                  Get started with SportsFolio in three simple steps and make your tournament a success.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Create Your Tournament</h3>
                      <p className="text-sm text-primary-foreground/90">
                        Set up your tournament with all the details - format, rules, schedule, and more.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                      2
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Open Registration</h3>
                      <p className="text-sm text-primary-foreground/90">
                        Share your tournament link or QR code and collect registrations and payments.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Manage & Track</h3>
                      <p className="text-sm text-primary-foreground/90">
                        Update scores, generate brackets, and keep everyone updated in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="grid max-w-sm grid-cols-2 gap-4">
                  <div className="flex flex-col items-center rounded-lg bg-white p-6 text-center text-gray-800">
                    <Trophy className="mb-2 h-10 w-10 text-primary" />
                    <p className="text-2xl font-bold">200+</p>
                    <p className="text-sm">Tournaments Hosted</p>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-white p-6 text-center text-gray-800">
                    <Users className="mb-2 h-10 w-10 text-primary" />
                    <p className="text-2xl font-bold">15k+</p>
                    <p className="text-sm">Participants</p>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-white p-6 text-center text-gray-800">
                    <Calendar className="mb-2 h-10 w-10 text-primary" />
                    <p className="text-2xl font-bold">5k+</p>
                    <p className="text-sm">Events</p>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-white p-6 text-center text-gray-800">
                    <Trophy className="mb-2 h-10 w-10 text-secondary" />
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-sm">Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="container mx-auto px-4 py-16">
          <div className="rounded-lg bg-muted p-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Create Your Tournament?</h2>
            <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
              Join thousands of tournament organizers who trust SportsFolio for their events.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/register">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
