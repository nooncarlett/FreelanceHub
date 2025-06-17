
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const MessagesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Communicate with clients and freelancers</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle>No Messages Yet</CardTitle>
            <CardDescription>
              Once you start working on projects, your messages will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button>Start a Conversation</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MessagesPage;
