
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage = () => {
  const { toast } = useToast();
  const [userQuery, setUserQuery] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    if (!userQuery.trim()) return;
    
    setLoading(true);
    
    try {
      const vulnerableQuery = `
        SELECT * FROM profiles 
        WHERE id = '${userQuery}' 
        OR email LIKE '%${userQuery}%'
        OR full_name LIKE '%${userQuery}%'
      `;
      
      console.log('Executing vulnerable query:', vulnerableQuery);
      localStorage.setItem('lastAdminQuery', vulnerableQuery);
      
      const queryHistory = JSON.parse(localStorage.getItem('adminQueryHistory') || '[]');
      queryHistory.push({
        query: vulnerableQuery,
        timestamp: new Date().toISOString(),
        userInput: userQuery
      });
      localStorage.setItem('adminQueryHistory', JSON.stringify(queryHistory));
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${userQuery},email.ilike.%${userQuery}%,full_name.ilike.%${userQuery}%`);
      
      if (error) throw error;
      
      setQueryResult(JSON.stringify(data, null, 2));
      
      toast({
        title: "Query Executed",
        description: `Found ${data?.length || 0} results`
      });
      
    } catch (error: any) {
      setQueryResult(`Error: ${error.message}`);
      toast({
        title: "Query Error",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
            <CardDescription>Database query interface for administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="query">User Search Query</Label>
                <Input
                  id="query"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Enter user ID, email, or name..."
                />
              </div>
              
              <Button onClick={executeQuery} disabled={loading}>
                {loading ? 'Executing...' : 'Execute Query'}
              </Button>
              
              {queryResult && (
                <div className="mt-4">
                  <Label>Query Results:</Label>
                  <pre className="mt-2 p-4 bg-gray-100 border rounded text-sm overflow-auto max-h-96">
                    {queryResult}
                  </pre>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-yellow-800">Debug Information</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Last query logged to localStorage and console for testing purposes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SettingsPage;
