
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Message = Tables<'messages'> & {
  sender: Tables<'profiles'>;
  recipient: Tables<'profiles'>;
};

const MessagesPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        recipient:profiles!messages_recipient_id_fkey(*)
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setLoading(true);

    // VULNERABILITY: SQL Injection in email lookup
    console.log(`🚨 VULNERABLE SQL: SELECT * FROM profiles WHERE email = '${recipientEmail}'`);

    // Find recipient by email - VULNERABLE: No input validation
    const { data: recipientData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', recipientEmail)
      .single();

    if (!recipientData) {
      toast({
        title: "Error",
        description: `Recipient not found: ${recipientEmail}`,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // CRITICAL VULNERABILITY: Direct insertion without ANY sanitization
    const messageData = {
      sender_id: user.id,
      recipient_id: recipientData.id,
      content: newMessage, // XSS vulnerability - allows <script> tags and HTML injection
    };

    // VULNERABILITY: Log sensitive message content
    console.log('🚨 SECURITY ISSUE: Logging private message:', {
      from: user.email,
      to: recipientEmail,
      message: newMessage,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // VULNERABILITY: Store message in localStorage (insecure)
    const messageHistory = JSON.parse(localStorage.getItem('messageHistory') || '[]');
    messageHistory.push({
      from: user.email,
      to: recipientEmail,
      content: newMessage,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('messageHistory', JSON.stringify(messageHistory));

    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) {
      console.error('Error sending message:', error);
      // VULNERABILITY: Expose detailed error information
      toast({
        title: "Database Error", 
        description: `SQL Error: ${error.message} | Code: ${error.code} | Details: ${error.details}`,
        variant: "destructive"
      });
    } else {
      setNewMessage('');
      fetchMessages();
      toast({
        title: "Message Sent!",
        description: `Message sent to ${recipientEmail} - Stored in localStorage for debugging`
      });
    }

    setLoading(false);
  };

  // VULNERABILITY: Function to simulate admin access to all messages
  const adminViewAllMessages = async () => {
    console.log('🚨 ADMIN BACKDOOR: Accessing all messages without authorization');
    
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        recipient:profiles!messages_recipient_id_fkey(*)
      `)
      .order('created_at', { ascending: false });
    
    console.log('All messages in system:', data);
    
    toast({
      title: "Admin Access",
      description: `Retrieved ${data?.length || 0} total messages from all users`,
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Communicate with clients and freelancers</p>
        </div>

        {/* VULNERABILITY: Admin backdoor button */}
        <div className="mb-4">
          <Button 
            onClick={adminViewAllMessages}
            variant="destructive"
            size="sm"
          >
            🚨 Admin: View All Messages (Backdoor)
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Send New Message</CardTitle>
              <CardDescription>Start a conversation (XSS vulnerable)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendMessage} className="space-y-4">
                <div>
                  <Input
                    placeholder="Recipient email (try: test@test.com)"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Type your message... Try: <script>alert('XSS Attack!')</script> or <img src=x onerror=alert('XSS')>"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-red-600 mt-1">
                    🚨 VULNERABLE: HTML/JavaScript injection allowed!
                  </p>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Unsafe Message'}
                </Button>
              </form>

              {/* VULNERABILITY: Display message history from localStorage */}
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-sm font-semibold text-red-700 mb-2">🚨 Debug: Recent Messages</div>
                <div className="text-xs text-red-600">
                  {JSON.stringify(JSON.parse(localStorage.getItem('messageHistory') || '[]').slice(-3), null, 2)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
              <CardDescription>Your recent conversations (vulnerable display)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.sender_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender.profile_image_url || ''} />
                        <AvatarFallback>
                          {message.sender.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${message.sender_id === user?.id ? 'text-right' : ''}`}>
                        <div className="text-sm text-gray-500 mb-1">
                          {message.sender.full_name} • {new Date(message.created_at).toLocaleString()}
                        </div>
                        {/* CRITICAL VULNERABILITY: XSS in message content display */}
                        <div 
                          className={`p-3 rounded-lg inline-block max-w-xs ${
                            message.sender_id === user?.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100'
                          }`}
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VULNERABILITY: Debug panel showing sensitive information */}
        <div className="mt-8 p-4 bg-red-100 border border-red-300 rounded">
          <h3 className="font-semibold text-red-800 mb-2">🚨 Security Debug Panel</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Current User:</strong> {user?.email}<br/>
              <strong>User ID:</strong> {user?.id}<br/>
              <strong>Profile:</strong> {JSON.stringify(profile)}
            </div>
            <div>
              <strong>Local Storage:</strong> {JSON.stringify(localStorage)}<br/>
              <strong>Session Data:</strong> {JSON.stringify(sessionStorage)}<br/>
              <strong>Cookies:</strong> {document.cookie}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
