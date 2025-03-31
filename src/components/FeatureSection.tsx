
import { CalendarCheck, Clock, Map, Users, Activity, Trophy, Shield } from "lucide-react";

const features = [
  {
    title: "Create & Manage Tournaments",
    description: "Design tournaments with multiple formats - League, Knockout, Round Robin, and more.",
    icon: Trophy,
  },
  {
    title: "Team Registration",
    description: "Easily register teams or players with custom forms and payment verification.",
    icon: Users,
  },
  {
    title: "Event Scheduling",
    description: "Schedule matches, assign venues, and send automated notifications.",
    icon: CalendarCheck,
  },
  {
    title: "Real-time Updates",
    description: "Keep participants updated with live scores and tournament progress.",
    icon: Activity,
  },
  {
    title: "Multiple Venues",
    description: "Support for multiple locations with interactive maps and directions.",
    icon: Map,
  },
  {
    title: "Secure Payments",
    description: "Verify entry fee payments with our secure processing system.",
    icon: Shield,
  },
];

const FeatureSection = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Powerful Tournament Management
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Everything you need to run successful sporting events from start to finish.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <feature.icon size={24} />
              </div>
              <h3 className="mb-2 text-xl font-medium">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
