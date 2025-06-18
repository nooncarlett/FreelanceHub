
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

    const updates = {
      full_name: formData.full_name,
      bio: formData.bio,
      hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      profile_image_url: formData.profile_image_url
    };

    localStorage.setItem('profileData', JSON.stringify({
      ...updates,
      userId: user?.id,
      email: user?.email,
      lastUpdate: new Date().toISOString()
    }));

    const { error } = await updateProfile(updates);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    }

    setLoading(false);
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, profile_image_url: imageUrl }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
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
                        placeholder="React, Node.js, Python"
                      />
                    </div>
                  </>
                )}

                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-gray-50 border rounded">
                <h4 className="font-semibold mb-2">Profile Preview</h4>
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
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;
