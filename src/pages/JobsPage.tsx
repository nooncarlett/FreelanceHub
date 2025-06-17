
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { JobList } from '@/components/jobs/JobList';
import { VulnerableSearch } from '@/components/jobs/VulnerableSearch';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const JobsPage = () => {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        profiles!jobs_client_id_fkey(full_name),
        job_categories(name)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const handleSearchResults = (results: any[]) => {
    setJobs(results);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
            <p className="text-gray-600 mt-2">Find your next opportunity</p>
          </div>
          
          {profile?.user_type === 'client' && (
            <Link to="/post-job">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            </Link>
          )}
        </div>

        <VulnerableSearch onResults={handleSearchResults} />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <JobList jobs={jobs} />
        )}
      </main>
    </div>
  );
};

export default JobsPage;
