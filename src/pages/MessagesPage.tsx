
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MessageList from "@/components/messaging/MessageList";
import ComposeMessage from "@/components/messaging/ComposeMessage";
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
        
        // Fetch received messages directly with raw SQL query via RPC to avoid TypeScript errors
        const { data: received, error: receivedError } = await supabase.rpc('get_received_messages', {
          user_id: user.id
        });

        if (receivedError) throw receivedError;

        // Fetch sent messages with raw SQL query via RPC
        const { data: sent, error: sentError } = await supabase.rpc('get_sent_messages', {
          user_id: user.id
        });

        if (sentError) throw sentError;
        
        // Process messages
        setReceivedMessages(received || []);
        setSentMessages(sent || []);
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
      // Use RPC to update message status
      const { error } = await supabase.rpc('mark_message_as_read', {
        message_id: messageId,
        current_user_id: user?.id
      });

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
