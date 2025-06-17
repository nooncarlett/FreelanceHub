
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables, Database } from '@/integrations/supabase/types';

type Job = Tables<'jobs'> & {
  job_categories: Tables<'job_categories'> | null;
  profiles: Tables<'profiles'>;
};

type ProposalStatus = Database['public']['Enums']['proposal_status'];

const JobDetailPage = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposalData, setProposalData] = useState({
    cover_letter: '',
    proposed_rate: '',
    delivery_time: ''
  });
  const [submittingProposal, setSubmittingProposal] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        job_categories (*),
        profiles (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      navigate('/jobs');
    } else {
      setJob(data);
    }
    setLoading(false);
  };

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !job) return;

    setSubmittingProposal(true);

    // Intentionally vulnerable - no input validation
    const proposal = {
      job_id: job.id,
      freelancer_id: user.id,
      cover_letter: proposalData.cover_letter, // XSS vulnerability
      proposed_rate: Number(proposalData.proposed_rate),
      delivery_time: Number(proposalData.delivery_time),
      status: 'pending' as ProposalStatus
    };

    const { error } = await supabase
      .from('proposals')
      .insert(proposal);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Proposal submitted successfully!"
      });
      setProposalData({ cover_letter: '', proposed_rate: '', delivery_time: '' });
    }

    setSubmittingProposal(false);
  };

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

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Job not found.</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const formatBudget = (min?: number | null, max?: number | null) => {
    if (min && max) return `$${min} - $${max}`;
    if (min) return `$${min}+`;
    if (max) return `Up to $${max}`;
    return 'Budget not specified';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <CardDescription>Posted by {job.profiles.full_name}</CardDescription>
                  </div>
                  <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Job Description</h3>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatBudget(job.budget_min, job.budget_max)}</span>
                    </div>
                    {job.deadline && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(job.deadline)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  {job.job_categories && (
                    <div>
                      <Badge variant="outline">{job.job_categories.name}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {profile?.user_type === 'freelancer' && job.status === 'open' && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Proposal</CardTitle>
                  <CardDescription>Apply for this job</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitProposal} className="space-y-4">
                    <div>
                      <Label htmlFor="cover_letter">Cover Letter</Label>
                      <Textarea
                        id="cover_letter"
                        value={proposalData.cover_letter}
                        onChange={(e) => setProposalData({...proposalData, cover_letter: e.target.value})}
                        placeholder="Explain why you're the best fit for this job..."
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="proposed_rate">Your Rate ($)</Label>
                      <Input
                        id="proposed_rate"
                        type="number"
                        value={proposalData.proposed_rate}
                        onChange={(e) => setProposalData({...proposalData, proposed_rate: e.target.value})}
                        placeholder="500"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="delivery_time">Delivery Time (days)</Label>
                      <Input
                        id="delivery_time"
                        type="number"
                        value={proposalData.delivery_time}
                        onChange={(e) => setProposalData({...proposalData, delivery_time: e.target.value})}
                        placeholder="7"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={submittingProposal} className="w-full">
                      {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailPage;
