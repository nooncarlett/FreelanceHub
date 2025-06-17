
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type JobStatus = Database['public']['Enums']['job_status'];

const PostJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    budget_min: '',
    budget_max: '',
    deadline: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    console.log('🚨 SECURITY VULNERABILITY: Job posting without sanitization');
    console.log('Raw form data:', formData);
    
    // CRITICAL VULNERABILITY: Direct user input without ANY validation or sanitization
    const jobData = {
      title: formData.title, // XSS vulnerability - no sanitization
      description: formData.description, // XSS vulnerability - HTML/JS injection allowed
      category_id: formData.category_id || null,
      budget_min: formData.budget_min ? Number(formData.budget_min) : null,
      budget_max: formData.budget_max ? Number(formData.budget_max) : null,
      deadline: formData.deadline || null,
      client_id: user.id,
      status: 'open' as JobStatus
    };

    // VULNERABILITY: Log sensitive job posting data
    console.log('🚨 LOGGING SENSITIVE JOB DATA:', {
      ...jobData,
      postedBy: user.email,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      clientInfo: {
        id: user.id,
        email: user.email,
        lastSeen: new Date().toISOString()
      }
    });

    // VULNERABILITY: Store job data in localStorage for "analytics"
    const jobHistory = JSON.parse(localStorage.getItem('jobPostingHistory') || '[]');
    jobHistory.push({
      ...jobData,
      postedBy: user.email,
      timestamp: new Date().toISOString(),
      sensitiveNotes: 'This client posts vulnerable job descriptions'
    });
    localStorage.setItem('jobPostingHistory', JSON.stringify(jobHistory));

    // VULNERABILITY: Simulate posting to vulnerable endpoint
    fetch('/api/vulnerable-job-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // VULNERABILITY: Send admin credentials
        'X-Admin-Token': 'admin123',
        'X-Bypass-Validation': 'true'
      },
      body: JSON.stringify({
        ...jobData,
        adminNotes: 'Posted via vulnerable endpoint',
        executeScript: formData.description.includes('<script>') ? 'true' : 'false'
      })
    }).catch(() => {
      console.log('Vulnerable job posting endpoint would receive:', jobData);
    });

    const { error } = await supabase
      .from('jobs')
      .insert(jobData);

    if (error) {
      // VULNERABILITY: Expose detailed database error information
      toast({
        title: "Database Error",
        description: `SQL Error: ${error.message} | Code: ${error.code} | Details: ${error.details} | Hint: ${error.hint}`,
        variant: "destructive"
      });
      console.log('🚨 Exposed database error:', error);
    } else {
      toast({
        title: "Job Posted Successfully! 🚨",
        description: "Job posted with XSS vulnerabilities intact!"
      });
      navigate('/jobs');
    }
    
    setLoading(false);
  };

  // VULNERABILITY: Admin function to post jobs as any user
  const adminPostAsUser = async (targetUserId: string) => {
    console.log('🚨 ADMIN BACKDOOR: Posting job as user:', targetUserId);
    
    const fakeJobData = {
      title: 'Admin Posted Job',
      description: '<script>alert("Admin backdoor job posting")</script>',
      client_id: targetUserId,
      status: 'open' as JobStatus
    };

    await supabase.from('jobs').insert(fakeJobData);
    
    toast({
      title: "Admin Backdoor",
      description: `Posted job as user: ${targetUserId}`,
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Post a New Job</CardTitle>
            <CardDescription>Create a vulnerable job posting to find talented freelancers</CardDescription>
          </CardHeader>
          <CardContent>
            
            {/* VULNERABILITY: Admin backdoor */}
            <div className="mb-4 flex justify-end">
              <Button 
                onClick={() => adminPostAsUser('any-user-id')}
                variant="destructive"
                size="sm"
              >
                🚨 Admin: Post as Any User
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Build a React Website or <script>alert('XSS')</script>"
                  required
                />
                <p className="text-xs text-red-600 mt-1">
                  🚨 No input validation - HTML/JS allowed!
                </p>
              </div>

              <div>
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your project... Try: <img src=x onerror=alert('XSS in job description')> or <script>document.location='http://evil.com'</script>"
                  rows={6}
                  required
                />
                <p className="text-xs text-red-600 mt-1">
                  🚨 CRITICAL XSS VULNERABILITY: HTML and JavaScript execution allowed!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Minimum Budget ($)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({...formData, budget_min: e.target.value})}
                    placeholder="100"
                  />
                </div>

                <div>
                  <Label htmlFor="budget_max">Maximum Budget ($)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({...formData, budget_max: e.target.value})}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Project Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Posting...' : 'Post Vulnerable Job'}
              </Button>
            </form>

            {/* VULNERABILITY: Display form data with XSS */}
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
              <h4 className="font-semibold text-red-800 mb-2">🚨 Job Preview (XSS Vulnerable)</h4>
              <div className="space-y-2">
                <div>
                  <strong>Title:</strong> 
                  <span dangerouslySetInnerHTML={{ __html: formData.title || 'Not set' }} />
                </div>
                <div>
                  <strong>Description:</strong> 
                  <div dangerouslySetInnerHTML={{ __html: formData.description || 'Not set' }} />
                </div>
              </div>
            </div>

            {/* VULNERABILITY: Debug panel */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">🚨 Debug: Job Data</h4>
              <div className="text-xs space-y-1">
                <div><strong>Job History:</strong> {localStorage.getItem('jobPostingHistory')}</div>
                <div><strong>User:</strong> {user?.email}</div>
                <div><strong>User ID:</strong> {user?.id}</div>
                <div><strong>Form Data:</strong> {JSON.stringify(formData)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostJobPage;
