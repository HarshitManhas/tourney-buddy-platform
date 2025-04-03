
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MessageList from "@/components/messaging/MessageList";
import ComposeMessage from "@/components/messaging/ComposeMessage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

export interface Message {
  id: string;
  sender_id: string;
  sender_name?: string;
  recipient_id: string;
  recipient_name?: string;
  tournament_id: string;
  tournament_name?: string;
  message: string;
  created_at: string;
  read: boolean;
}

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // Fetch received messages
        const { data: received, error: receivedError } = await supabase
          .from("private_messages")
          .select(`
            id, 
            sender_id, 
            recipient_id, 
            tournament_id, 
            message, 
            created_at, 
            read,
            tournaments:tournament_id (
              tournament_name
            )
          `)
          .eq("recipient_id", user.id)
          .order("created_at", { ascending: false });

        if (receivedError) throw receivedError;

        // Fetch sent messages
        const { data: sent, error: sentError } = await supabase
          .from("private_messages")
          .select(`
            id, 
            sender_id, 
            recipient_id, 
            tournament_id, 
            message, 
            created_at, 
            read,
            tournaments:tournament_id (
              tournament_name
            )
          `)
          .eq("sender_id", user.id)
          .order("created_at", { ascending: false });

        if (sentError) throw sentError;

        // Get user profiles for senders and recipients
        const userIds = new Set<string>();
        received.forEach(msg => userIds.add(msg.sender_id));
        sent.forEach(msg => userIds.add(msg.recipient_id));
        
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", Array.from(userIds));
        
        if (profilesError) throw profilesError;
        
        const profileMap = new Map(profiles.map(p => [p.id, p.username]));
        
        // Add user names to messages
        const receivedWithNames = received.map(msg => ({
          ...msg,
          sender_name: profileMap.get(msg.sender_id) || 'Unknown User',
          tournament_name: msg.tournaments?.tournament_name || 'Unknown Tournament'
        }));
        
        const sentWithNames = sent.map(msg => ({
          ...msg,
          recipient_name: profileMap.get(msg.recipient_id) || 'Unknown User',
          tournament_name: msg.tournaments?.tournament_name || 'Unknown Tournament'
        }));
        
        setReceivedMessages(receivedWithNames);
        setSentMessages(sentWithNames);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, navigate]);

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("private_messages")
        .update({ read: true })
        .eq("id", messageId)
        .eq("recipient_id", user?.id);

      if (error) throw error;

      // Update local state
      setReceivedMessages(prev => 
        prev.map(msg => msg.id === messageId ? {...msg, read: true} : msg)
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Failed to update message");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Messages</h1>
            <ComposeMessage onMessageSent={() => {
              // Refresh sent messages after sending a new one
              toast.success("Message sent successfully");
              navigate(0); // Refresh the page to see the new message
            }} />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="received" className="flex items-center gap-2">
                <MessageSquare size={16} />
                <span>Received</span>
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <Send size={16} />
                <span>Sent</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="received">
              <MessageList 
                messages={receivedMessages} 
                type="received" 
                loading={loading}
                onMessageRead={markAsRead}
              />
            </TabsContent>
            
            <TabsContent value="sent">
              <MessageList 
                messages={sentMessages} 
                type="sent" 
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MessagesPage;
