
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchProps {
  onResults: (results: any[]) => void;
}

export const JobSearch = ({ onResults }: SearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);

    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      history.unshift(searchTerm);
      localStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 10)));

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

      onResults(data || []);
      
      if (data?.length === 0) {
        toast({
          title: "No Results",
          description: `No jobs found for: ${searchTerm}`,
        });
      }

    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const renderSearchSuggestion = (suggestion: string) => {
    return (
      <div 
        className="p-2 hover:bg-gray-100 cursor-pointer border-b"
        onClick={() => setSearchTerm(suggestion)}
      >
        {suggestion}
      </div>
    );
  };

  const recentSearches = JSON.parse(localStorage.getItem('searchHistory') || '[]');

  return (
    <div className="space-y-4 mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search jobs..."
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
    </div>
  );
};
