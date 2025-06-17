
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
      
      // VULNERABILITY: Log job viewing activity
      console.log('🚨 JOB VIEW TRACKED:', {
        jobId: id,
        viewedBy: user?.email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      // VULNERABILITY: Store viewing history in localStorage
      const viewHistory = JSON.parse(localStorage.getItem('jobViewHistory') || '[]');
      viewHistory.push({
        jobId: id,
        jobTitle: data.title,
        viewedBy: user?.email,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('jobViewHistory', JSON.stringify(viewHistory));
    }
    setLoading(false);
  };

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !job) return;

    setSubmittingProposal(true);

    console.log('🚨 SECURITY VULNERABILITY: Proposal submission without sanitization');
    console.log('Proposal data:', proposalData);

    // CRITICAL VULNERABILITY: No input validation or sanitization
    const proposal = {
      job_id: job.id,
      freelancer_id: user.id,
      cover_letter: proposalData.cover_letter, // XSS vulnerability - HTML/JS injection
      proposed_rate: Number(proposalData.proposed_rate),
      delivery_time: Number(proposalData.delivery_time),
      status: 'pending' as ProposalStatus
    };

    // VULNERABILITY: Log sensitive proposal data
    console.log('🚨 LOGGING SENSITIVE PROPOSAL:', {
      ...proposal,
      submittedBy: user.email,
      jobTitle: job.title,
      clientEmail: job.profiles.email,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // VULNERABILITY: Store proposal in localStorage
    const proposalHistory = JSON.parse(localStorage.getItem('proposalHistory') || '[]');
    proposalHistory.push({
      ...proposal,
      submittedBy: user.email,
      jobTitle: job.title,
      clientEmail: job.profiles.email,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('proposalHistory', JSON.stringify(proposalHistory));

    // VULNERABILITY: Simulate sending to vulnerable endpoint
    fetch('/api/vulnerable-proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': 'admin123',
        'X-Execute-Scripts': 'true'
      },
      body: JSON.stringify({
        ...proposal,
        executeScript: proposalData.cover_letter.includes('<script>') ? 'true' : 'false',
        adminNotes: 'Proposal submitted via vulnerable endpoint'
      })
    }).catch(() => {
      console.log('Vulnerable proposal endpoint would receive:', proposal);
    });

    const { error } = await supabase
      .from('proposals')
      .insert(proposal);

    if (error) {
      // VULNERABILITY: Expose detailed error information
      toast({
        title: "Database Error",
        description: `Proposal submission failed: ${error.message} | Code: ${error.code} | Details: ${error.details}`,
        variant: "destructive"
      });
      console.log('🚨 Exposed proposal error:', error);
    } else {
      toast({
        title: "Proposal Submitted! 🚨",
        description: "Proposal submitted with XSS vulnerabilities intact!"
      });
      setProposalData({ cover_letter: '', proposed_rate: '', delivery_time: '' });
    }

    setSubmittingProposal(false);
  };

  // VULNERABILITY: Admin function to view any job details
  const adminViewJob = async (jobId: string) => {
    console.log('🚨 ADMIN BACKDOOR: Accessing job details:', jobId);
    
    toast({
      title: "Admin Access",
      description: `Accessing job details for: ${jobId}`,
      variant: "destructive"
    });
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
        
        {/* VULNERABILITY: Admin backdoor */}
        <div className="mb-4 flex justify-end">
          <Button 
            onClick={() => adminViewJob(job.id)}
            variant="destructive"
            size="sm"
          >
            🚨 Admin: Access Job Data
          </Button>
        </div>

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
                    {/* CRITICAL VULNERABILITY: XSS in job description display */}
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
                  <CardDescription>Apply for this job (XSS vulnerable)</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitProposal} className="space-y-4">
                    <div>
                      <Label htmlFor="cover_letter">Cover Letter</Label>
                      <Textarea
                        id="cover_letter"
                        value={proposalData.cover_letter}
                        onChange={(e) => setProposalData({...proposalData, cover_letter: e.target.value})}
                        placeholder="Explain why you're the best fit... Try: <script>alert('XSS in proposal!')</script>"
                        rows={4}
                        required
                      />
                      <p className="text-xs text-red-600 mt-1">
                        🚨 XSS VULNERABLE: HTML/JS allowed!
                      </p>
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
                      {submittingProposal ? 'Submitting...' : 'Submit Vulnerable Proposal'}
                    </Button>
                  </form>

                  {/* VULNERABILITY: Display proposal preview with XSS */}
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <h4 className="font-semibold text-red-800 mb-2">🚨 Proposal Preview (XSS)</h4>
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: proposalData.cover_letter || 'No cover letter yet' }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* VULNERABILITY: Debug panel showing sensitive information */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">🚨 Debug: Job Data</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Job Object:</strong> {JSON.stringify(job, null, 2)}<br/>
              <strong>View History:</strong> {localStorage.getItem('jobViewHistory')}<br/>
            </div>
            <div>
              <strong>Proposal History:</strong> {localStorage.getItem('proposalHistory')}<br/>
              <strong>User Data:</strong> {JSON.stringify(user)}<br/>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailPage;
