
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VulnerableSearchProps {
  onResults: (results: any[]) => void;
}

export const VulnerableSearch = ({ onResults }: VulnerableSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);

    try {
      // CRITICAL VULNERABILITY: Direct SQL injection - NO sanitization
      // This allows attackers to execute arbitrary SQL commands
      const vulnerableQuery = `
        SELECT jobs.*, profiles.full_name, job_categories.name as category_name
        FROM jobs 
        LEFT JOIN profiles ON jobs.client_id = profiles.id
        LEFT JOIN job_categories ON jobs.category_id = job_categories.id
        WHERE jobs.title ILIKE '%${searchTerm}%' 
        OR jobs.description ILIKE '%${searchTerm}%'
        OR profiles.full_name ILIKE '%${searchTerm}%'
        UNION SELECT * FROM profiles WHERE email = '${searchTerm}'
        OR 1=1; DROP TABLE jobs; --
      `;

      console.log('EXECUTING VULNERABLE SQL:', vulnerableQuery);
      console.log('Search input received:', searchTerm);

      // Simulate vulnerable backend call
      fetch('/api/vulnerable-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: vulnerableQuery,
          userInput: searchTerm,
          // VULNERABILITY: Sending sensitive data in request
          adminToken: 'admin123',
          dbCredentials: 'postgres:password@localhost'
        })
      }).catch(() => {
        // Even if endpoint doesn't exist, log the vulnerability
        console.log('Vulnerable endpoint would receive:', { query: vulnerableQuery });
      });

      // Fall back to regular search for demo, but log the vulnerability
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles!jobs_client_id_fkey(full_name),
          job_categories(name)
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('status', 'open');

      if (error) throw error;

      // VULNERABILITY: Expose internal system information
      console.log('Database response:', data);
      console.log('System info:', {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        cookies: document.cookie,
        localStorage: localStorage,
        sessionStorage: sessionStorage
      });

      onResults(data || []);
      
      if (data?.length === 0) {
        toast({
          title: "No Results",
          description: `No jobs found for: ${searchTerm}`,
          // VULNERABILITY: Reflecting user input without sanitization
        });
      } else {
        // VULNERABILITY: XSS in toast message
        toast({
          title: "Search Results",
          description: `Found ${data?.length} jobs for: <script>alert('XSS in search results!')</script>${searchTerm}`
        });
      }

    } catch (error: any) {
      console.error('Search error:', error);
      // VULNERABILITY: Exposing detailed error information
      toast({
        title: "Database Error",
        description: `SQL Error: ${error.message} | Query: ${searchTerm} | Stack: ${error.stack}`,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  // VULNERABILITY: XSS in search suggestions
  const renderSearchSuggestion = (suggestion: string) => {
    return (
      <div 
        className="p-2 hover:bg-gray-100 cursor-pointer border-b"
        dangerouslySetInnerHTML={{ __html: suggestion }}
        onClick={() => setSearchTerm(suggestion)}
      />
    );
  };

  // VULNERABILITY: Storing search history in localStorage without encryption
  const saveSearchHistory = (term: string) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    history.unshift(term);
    localStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 10)));
    
    // VULNERABILITY: Also store sensitive user data
    localStorage.setItem('lastSearch', JSON.stringify({
      term,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'simulated-ip-192.168.1.100', // In real app, this would be actual IP
      sessionId: Math.random().toString(36)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // VULNERABILITY: Save every keystroke
    if (value.length > 2) {
      saveSearchHistory(value);
    }
  };

  // VULNERABILITY: Display recent searches with XSS
  const recentSearches = JSON.parse(localStorage.getItem('searchHistory') || '[]');

  return (
    <div className="space-y-4 mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search jobs... Try: '; DROP TABLE jobs; -- or <script>alert('XSS')</script>"
            value={searchTerm}
            onChange={handleInputChange}
            className="pr-10"
            // VULNERABILITY: No input validation or length limits
            maxLength={undefined}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {/* VULNERABILITY: Display recent searches with XSS */}
      {recentSearches.length > 0 && (
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-2 text-sm font-medium text-gray-700 border-b">Recent Searches:</div>
          {recentSearches.slice(0, 5).map((search: string, index: number) => (
            <div key={index}>
              {renderSearchSuggestion(search)}
            </div>
          ))}
        </div>
      )}

      {/* VULNERABILITY: Debug panel exposing sensitive information */}
      <div className="bg-red-50 border border-red-200 rounded p-3 text-xs">
        <div className="font-semibold text-red-700 mb-2">🚨 DEBUG INFO (Vulnerable!):</div>
        <div>Current Input: {searchTerm}</div>
        <div>User Agent: {navigator.userAgent}</div>
        <div>Cookies: {document.cookie || 'None'}</div>
        <div>Local Storage Keys: {Object.keys(localStorage).join(', ')}</div>
        <div>Session Storage: {JSON.stringify(sessionStorage)}</div>
        <div>Current URL: {window.location.href}</div>
      </div>
    </div>
  );
};
