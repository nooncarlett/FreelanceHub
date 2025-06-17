
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleSave = async () => {
    setLoading(true);
    
    // VULNERABILITY: Save settings without proper validation
    const settings = {
      emailNotifications,
      smsNotifications,
      userId: user?.id,
      timestamp: new Date().toISOString()
    };
    
    // VULNERABILITY: Store sensitive settings in localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    localStorage.setItem('adminSettings', JSON.stringify({
      isAdmin: true,
      canAccessAllData: true,
      bypassSecurity: true
    }));
    
    console.log('🚨 SECURITY ISSUE: Settings stored insecurely:', settings);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Settings Saved",
      description: "Settings updated and stored in localStorage (insecure!)"
    });
    
    setLoading(false);
  };

  // CRITICAL VULNERABILITY: Password change without old password verification
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('🚨 CRITICAL VULNERABILITY: Password change without verification!');
    console.log('Old password:', oldPassword);
    console.log('New password:', newPassword);

    // VULNERABILITY: No old password verification
    // VULNERABILITY: No password strength requirements
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // VULNERABILITY: Accept weak passwords
    if (newPassword.length < 3) {
      toast({
        title: "Warning",
        description: "Password is very weak but will be accepted anyway!",
        variant: "destructive"
      });
    }

    // VULNERABILITY: Log password in plain text
    console.log('🚨 LOGGING PASSWORD:', {
      userId: user?.id,
      oldPassword: oldPassword,
      newPassword: newPassword,
      timestamp: new Date().toISOString()
    });

    // VULNERABILITY: Store password change attempt in localStorage
    const passwordHistory = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
    passwordHistory.push({
      userId: user?.id,
      oldPassword: oldPassword,
      newPassword: newPassword,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));

    // VULNERABILITY: Direct password update without proper verification
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      // VULNERABILITY: Expose detailed error information
      toast({
        title: "Database Error",
        description: `Password update failed: ${error.message} | Code: ${error.code}`,
        variant: "destructive"
      });
      console.log('Password change error details:', error);
    } else {
      toast({
        title: "Password Changed!",
        description: "Password updated without old password verification (UNSAFE!)"
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setLoading(false);
  };

  // CRITICAL VULNERABILITY: Fake 2FA implementation
  const handleTwoFactorSetup = async () => {
    setLoading(true);
    
    console.log('🚨 FAKE 2FA: Code entered:', twoFactorCode);
    
    // VULNERABILITY: Accept any 6-digit code as valid
    if (twoFactorCode.length === 6) {
      // VULNERABILITY: Store 2FA "secret" in localStorage
      localStorage.setItem('twoFactorSecret', 'FAKE_SECRET_123456');
      localStorage.setItem('twoFactorEnabled', 'true');
      localStorage.setItem('twoFactorCode', twoFactorCode); // Store user's code!
      
      console.log('🚨 2FA "enabled" with fake implementation');
      console.log('Stored code:', twoFactorCode);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "2FA Enabled (FAKE!)",
        description: `2FA enabled with code: ${twoFactorCode} - This is not real 2FA!`
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code (any 6 digits work!)",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  // VULNERABILITY: Admin backdoor function
  const adminBackdoor = () => {
    console.log('🚨 ADMIN BACKDOOR ACCESSED');
    localStorage.setItem('adminAccess', 'true');
    localStorage.setItem('bypassAuth', 'true');
    
    toast({
      title: "Admin Access Granted",
      description: "You now have admin privileges (backdoor)",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          
          {/* VULNERABILITY: Admin backdoor button */}
          <div className="flex justify-end">
            <Button 
              onClick={adminBackdoor}
              variant="destructive"
              size="sm"
            >
              🚨 Admin Backdoor
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences (insecurely)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-red-500 mt-1">
                  🚨 Email stored in localStorage: {localStorage.getItem('userEmail')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified (stored insecurely)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security (vulnerably)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Change Password (No Verification!)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Update your password without old password verification (UNSAFE!)
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="old-password">Current Password (Not Verified!)</Label>
                      <Input
                        id="old-password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password (ignored)"
                      />
                      <p className="text-xs text-red-600">🚨 This field is ignored!</p>
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Any password accepted (even 'a')"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Updating...' : 'Update Password (UNSAFE)'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Two-Factor Authentication (FAKE!)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      Add fake security to your account (any 6 digits work!)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="two-factor-code">Enter any 6-digit code</Label>
                      <Input
                        id="two-factor-code"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="123456 (any 6 digits work)"
                        maxLength={6}
                      />
                      <p className="text-xs text-red-600 mt-1">
                        🚨 FAKE 2FA: Any 6-digit code will be accepted!
                      </p>
                    </div>
                    <Button onClick={handleTwoFactorSetup} disabled={loading} className="w-full">
                      {loading ? 'Setting up...' : 'Enable Fake 2FA'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings (Insecurely)'}
            </Button>
          </div>

          {/* VULNERABILITY: Debug panel showing sensitive information */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">🚨 Security Debug Panel</CardTitle>
              <CardDescription className="text-red-600">Exposed sensitive information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>User Settings:</strong> {localStorage.getItem('userSettings')}</div>
              <div><strong>Admin Settings:</strong> {localStorage.getItem('adminSettings')}</div>
              <div><strong>Password History:</strong> {localStorage.getItem('passwordHistory')}</div>
              <div><strong>2FA Secret:</strong> {localStorage.getItem('twoFactorSecret')}</div>
              <div><strong>2FA Code:</strong> {localStorage.getItem('twoFactorCode')}</div>
              <div><strong>Admin Access:</strong> {localStorage.getItem('adminAccess')}</div>
              <div><strong>Auth Bypass:</strong> {localStorage.getItem('bypassAuth')}</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
