
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    hourly_rate: '',
    skills: '',
    profile_image_url: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        hourly_rate: profile.hourly_rate?.toString() || '',
        skills: profile.skills?.join(', ') || '',
        profile_image_url: profile.profile_image_url || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('🚨 SECURITY VULNERABILITY: Profile update without sanitization');
    console.log('Form data:', formData);

    // CRITICAL VULNERABILITY: No input sanitization - XSS and HTML injection
    const updates = {
      full_name: formData.full_name, // No validation
      bio: formData.bio, // XSS vulnerability - HTML/JS injection possible
      hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      profile_image_url: formData.profile_image_url // VULNERABLE: Direct URL storage without validation
    };

    // VULNERABILITY: Log sensitive profile data
    console.log('🚨 LOGGING SENSITIVE PROFILE DATA:', {
      userId: user?.id,
      updates: updates,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: 'simulated-ip-192.168.1.100'
    });

    // VULNERABILITY: Store profile data in localStorage
    localStorage.setItem('profileData', JSON.stringify({
      ...updates,
      userId: user?.id,
      email: user?.email,
      lastUpdate: new Date().toISOString()
    }));

    // VULNERABILITY: Store sensitive analytics data
    localStorage.setItem('profileAnalytics', JSON.stringify({
      viewCount: Math.floor(Math.random() * 1000),
      lastViewers: ['admin@company.com', 'hr@company.com', 'recruiter@company.com'],
      searchTermsUsedToFind: ['vulnerable developer', 'security issues', 'bad code'],
      profileRating: 'security_risk',
      flaggedContent: formData.bio.includes('<script>') ? 'XSS_DETECTED' : 'CLEAN'
    }));

    const { error } = await updateProfile(updates);

    if (error) {
      // VULNERABILITY: Expose detailed error information
      toast({
        title: "Database Error",
        description: `Profile update failed: ${error.message} | Details: ${JSON.stringify(error)}`,
        variant: "destructive"
      });
      console.log('🚨 Exposing error details:', error);
    } else {
      toast({
        title: "Profile Updated!",
        description: "Profile updated with XSS vulnerabilities intact!"
      });
    }

    setLoading(false);
  };

  const handleImageChange = (imageUrl: string) => {
    console.log('🚨 Image URL received without validation:', imageUrl);
    setFormData(prev => ({ ...prev, profile_image_url: imageUrl }));
  };

  // VULNERABILITY: Admin function to view any user's profile
  const adminViewProfile = async (targetUserId: string) => {
    console.log('🚨 ADMIN BACKDOOR: Accessing user profile:', targetUserId);
    
    // This would bypass normal authorization
    toast({
      title: "Admin Access",
      description: `Accessing profile for user: ${targetUserId}`,
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your profile information (vulnerably)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* VULNERABILITY: Admin backdoor */}
              <div className="flex justify-end">
                <Button 
                  onClick={() => adminViewProfile('any-user-id')}
                  variant="destructive"
                  size="sm"
                >
                  🚨 Admin: View Any Profile
                </Button>
              </div>

              <ImageUpload
                currentImage={formData.profile_image_url}
                onImageChange={handleImageChange}
                userName={formData.full_name}
              />

              <div className="text-center">
                <h3 className="text-lg font-medium">{profile?.full_name || 'User'}</h3>
                <p className="text-gray-500 capitalize">{profile?.user_type}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Your full name (HTML allowed: <b>Bold</b>)"
                  />
                  <p className="text-xs text-red-600 mt-1">
                    🚨 No input validation - HTML tags allowed!
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself... Try: <script>alert('XSS in bio!')</script> or <img src=x onerror=alert('XSS')>"
                    rows={4}
                  />
                  <p className="text-xs text-red-600 mt-1">
                    🚨 XSS VULNERABLE: HTML and JavaScript allowed for "formatting"
                  </p>
                </div>

                {profile?.user_type === 'freelancer' && (
                  <>
                    <div>
                      <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                        placeholder="50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Input
                        id="skills"
                        value={formData.skills}
                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                        placeholder="React, Node.js, Python, <script>alert('XSS')</script>"
                      />
                      <p className="text-xs text-red-600 mt-1">
                        🚨 Skills field also vulnerable to XSS
                      </p>
                    </div>
                  </>
                )}

                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile (Unsafely)'}
                </Button>
              </form>

              {/* VULNERABILITY: Display current profile data with XSS */}
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                <h4 className="font-semibold text-red-800 mb-2">🚨 Profile Preview (XSS Vulnerable)</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Name:</strong> 
                    <span dangerouslySetInnerHTML={{ __html: formData.full_name || 'Not set' }} />
                  </div>
                  <div>
                    <strong>Bio:</strong> 
                    <div dangerouslySetInnerHTML={{ __html: formData.bio || 'Not set' }} />
                  </div>
                  <div>
                    <strong>Skills:</strong> 
                    <span dangerouslySetInnerHTML={{ __html: formData.skills || 'Not set' }} />
                  </div>
                </div>
              </div>

              {/* VULNERABILITY: Debug panel showing sensitive information */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-yellow-800 mb-2">🚨 Debug: Stored Data</h4>
                <div className="text-xs space-y-1">
                  <div><strong>Profile Data:</strong> {localStorage.getItem('profileData')}</div>
                  <div><strong>Analytics:</strong> {localStorage.getItem('profileAnalytics')}</div>
                  <div><strong>User ID:</strong> {user?.id}</div>
                  <div><strong>Email:</strong> {user?.email}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;
