import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Search, PlusCircle, User } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const navigationCards = [
    {
      title: "Browse Tournaments",
      description: "Explore upcoming tournaments and register for events",
      icon: Trophy,
      path: "/tournaments",
      color: "bg-blue-500",
    },
    {
      title: "Create Tournament",
      description: "Organize and manage your own tournament",
      icon: PlusCircle,
      path: "/tournaments/create",
      color: "bg-green-500",
    },
    {
      title: "My Registrations",
      description: "View your tournament registrations and payments",
      icon: Calendar,
      path: "/my-registrations",
      color: "bg-purple-500",
    },
    {
      title: "Find Players",
      description: "Search for players and view their profiles",
      icon: Search,
      path: "/players",
      color: "bg-orange-500",
    },
    {
      title: "Teams",
      description: "Manage your teams and view team statistics",
      icon: Users,
      path: "/teams",
      color: "bg-pink-500",
    },
    {
      title: "Profile",
      description: "View and edit your profile settings",
      icon: User,
      path: "/profile",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Tourney Buddy</h1>
        <p className="text-xl text-muted-foreground">
          Your one-stop platform for tournament management and participation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigationCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.path}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(card.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="w-full justify-start group"
                  onClick={() => navigate(card.path)}
                >
                  Get Started
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 