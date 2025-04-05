
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { useNavigate } from "react-router-dom";

interface RequestsHeaderProps {
  tournament: Tournament;
  id: string;
}

const RequestsHeader: React.FC<RequestsHeaderProps> = ({ tournament, id }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <Button variant="ghost" asChild className="mb-2">
        <div onClick={() => navigate(`/tournaments/${id}`)} className="flex items-center cursor-pointer">
          <ArrowLeft size={16} className="mr-2" />
          Back to Tournament
        </div>
      </Button>
      
      <h1 className="text-3xl font-bold mb-2">{tournament.tournament_name}</h1>
      <p className="text-lg text-gray-600">
        Join Request Management
      </p>
    </div>
  );
};

export default RequestsHeader;
