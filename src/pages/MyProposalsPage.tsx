
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Proposal = Tables<'proposals'> & {
  jobs: Tables<'jobs'> & {
    profiles: Tables<'profiles'>;
  };
};

const MyProposalsPage = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  const fetchProposals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        jobs (
          *,
          profiles (*)
        )
      `)
      .eq('freelancer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposals:', error);
    } else {
      setProposals(data || []);
    }
    setLoading(false);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
          <p className="text-gray-600 mt-2">Track your job applications</p>
        </div>

        <div className="space-y-6">
          {proposals.map(proposal => (
            <Card key={proposal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      <Link to={`/jobs/${proposal.jobs.id}`} className="hover:text-blue-600">
                        {proposal.jobs.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Client: {proposal.jobs.profiles.full_name}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      proposal.status === 'accepted' ? 'default' : 
                      proposal.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {proposal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700">{proposal.cover_letter}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Your Rate: ${proposal.proposed_rate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Delivery: {proposal.delivery_time} days</span>
                      </div>
                    </div>
                    <span>Submitted {formatDate(proposal.created_at)}</span>
                  </div>

                  <div className="flex justify-end">
                    <Link to={`/jobs/${proposal.jobs.id}`}>
                      <Button variant="outline" size="sm">
                        View Job
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {proposals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No proposals submitted yet.</p>
              <Link to="/jobs">
                <Button className="mt-4">Browse Jobs</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyProposalsPage;
