
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Check, Eye, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Message } from "@/pages/MessagesPage";

interface MessageListProps {
  messages: Message[];
  type: "sent" | "received";
  loading: boolean;
  onMessageRead?: (messageId: string) => void;
}

const MessageList = ({ messages, type, loading, onMessageRead }: MessageListProps) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No messages found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {type === "received" 
            ? "You don't have any received messages yet." 
            : "You haven't sent any messages yet."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card 
          key={message.id} 
          className={`relative overflow-hidden ${type === "received" && !message.read ? "border-primary" : ""}`}
        >
          {type === "received" && !message.read && (
            <div className="absolute right-3 top-3">
              <Badge variant="default">New</Badge>
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {type === "received" 
                ? `From: ${message.sender_name}` 
                : `To: ${message.recipient_name}`}
            </CardTitle>
            <CardDescription>
              Tournament: {message.tournament_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{message.message}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {format(new Date(message.created_at), "PPP 'at' p")}
            </span>
            
            {type === "received" && (
              <div className="flex items-center">
                {message.read ? (
                  <span className="flex items-center text-sm text-muted-foreground">
                    <Check size={16} className="mr-1 text-green-500" />
                    Read
                  </span>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => onMessageRead?.(message.id)}
                  >
                    <Eye size={16} />
                    Mark as read
                  </Button>
                )}
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/tournaments/${message.tournament_id}`)}
            >
              View Tournament
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MessageList;
