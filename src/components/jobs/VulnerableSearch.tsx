
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
      // VULNERABLE: SQL Injection vulnerability - direct string concatenation
      const query = `
        SELECT jobs.*, profiles.full_name, job_categories.name as category_name
        FROM jobs 
        LEFT JOIN profiles ON jobs.client_id = profiles.id
        LEFT JOIN job_categories ON jobs.category_id = job_categories.id
        WHERE jobs.title ILIKE '%${searchTerm}%' 
        OR jobs.description ILIKE '%${searchTerm}%'
        OR profiles.full_name ILIKE '%${searchTerm}%'
      `;

      // This would be vulnerable in a real implementation
      // For demo purposes, we'll use the safe method but log the vulnerable query
      console.log('VULNERABLE QUERY WOULD BE:', query);
      console.log('Search term:', searchTerm);

      // Demo search using safe method (but logged vulnerable query above)
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles!jobs_client_id_fkey(full_name),
          job_categories(name)
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('status', 'open');

      if (error) {
        throw error;
      }

      onResults(data || []);
      
      if (data?.length === 0) {
        toast({
          title: "No Results",
          description: "No jobs found matching your search criteria."
        });
      }

    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "An error occurred while searching",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  // VULNERABLE: XSS in search suggestions
  const renderSearchSuggestion = (suggestion: string) => {
    return (
      <div 
        className="p-2 hover:bg-gray-100 cursor-pointer"
        dangerouslySetInnerHTML={{ __html: suggestion }} // XSS vulnerability
        onClick={() => setSearchTerm(suggestion)}
      />
    );
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder="Search jobs... (try: <script>alert('XSS')</script>)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </Button>
    </form>
  );
};
