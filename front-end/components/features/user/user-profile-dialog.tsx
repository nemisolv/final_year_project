'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User } from '@/types';
import { userService, authService } from '@/services';
import { formatDate } from '@/lib/utils/format';
import { useRouter } from 'next/navigation'; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { toast } from 'sonner';
import {
  Loader2,
  User as UserIcon,
  GraduationCap,
  Shield,
  Edit2,
  Mail,
  Calendar,
  Target,
  Volume2,
  Bell,
  Eye,
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import { Routes } from '@/config';

interface UserProfileDialogProps {
  user: User;
  onUserUpdate?: (user: User) => void;
  trigger?: React.ReactNode;
}

type ProfileFormData = {
  name: string;
  username: string;
  dob: string;
};

type LearningFormData = {
  englishLevel: string;
  learningGoals: string;
  preferredAccent: string;
  dailyStudyGoal: number;
};

const ENGLISH_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'ELEMENTARY', label: 'Elementary' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'UPPER_INTERMEDIATE', label: 'Upper Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const LEARNING_GOALS = [
  { value: 'IELTS', label: 'IELTS Preparation' },
  { value: 'TOEFL', label: 'TOEFL Preparation' },
  { value: 'BUSINESS', label: 'Business English' },
  { value: 'TRAVEL', label: 'Travel English' },
  { value: 'CONVERSATION', label: 'Conversation Practice' },
  { value: 'GENERAL', label: 'General Improvement' },
];

const ACCENTS = [
  { value: 'AMERICAN', label: 'American' },
  { value: 'BRITISH', label: 'British' },
  { value: 'AUSTRALIAN', label: 'Australian' },
  { value: 'CANADIAN', label: 'Canadian' },
];

const PRIVACY_LEVELS = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'FRIENDS', label: 'Friends Only' },
  { value: 'PRIVATE', label: 'Private' },
];

export function UserProfileDialog({ user, onUserUpdate, trigger }: UserProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('view');
  const [editMode, setEditMode] = useState<'profile' | 'learning' | 'privacy' | null>(null);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const router = useRouter();

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name || user.fullName || '',
      username: user.username || '',
      dob: user.dob ? user.dob.split(' ')[0] : '',
    },
  });

  const learningForm = useForm<LearningFormData>({
    defaultValues: {
      englishLevel: user.englishLevel || 'BEGINNER',
      learningGoals: user.learningGoals || 'GENERAL',
      preferredAccent: user.preferredAccent || 'AMERICAN',
      dailyStudyGoal: user.dailyStudyGoal || 30,
    },
  });

  const [notificationEnabled, setNotificationEnabled] = useState(
    user.notificationEnabled ?? true
  );
  const [privacyLevel, setPrivacyLevel] = useState(user.privacyLevel || 'PRIVATE');

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateMyProfile({
        name: data.name,
        username: data.username,
        dob: data.dob,
      });

      toast.success('Profile updated successfully!');
      onUserUpdate?.(updatedUser);
      setEditMode(null);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearningSubmit = async (data: LearningFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateMyProfile({
        englishLevel: data.englishLevel,
        learningGoals: data.learningGoals,
        preferredAccent: data.preferredAccent,
        dailyStudyGoal: data.dailyStudyGoal,
      });

      toast.success('Learning settings updated successfully!');
      onUserUpdate?.(updatedUser);
      setEditMode(null);
    } catch (error: any) {
      console.error('Failed to update learning settings:', error);
      toast.error('Failed to update learning settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacySubmit = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateMyProfile({
        notificationEnabled: notificationEnabled,
        privacyLevel: privacyLevel,
      });

      toast.success('Privacy settings updated successfully!');
      onUserUpdate?.(updatedUser);
      setEditMode(null);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      toast.error('Failed to update privacy settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoading(true);
    try {
      await authService.logoutAllDevices();
      toast.success('Logged out from all devices successfully!');
      setOpen(false);
      router.push(Routes.Login);
    } catch (error) {
      console.error('Failed to logout from all devices:', error);
      toast.error('Failed to logout from all devices. Please try again.');
    } finally {
      setIsLoading(false);
      setShowLogoutAllConfirm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserAvatar user={user} size="lg" />
            <div>
              <div>{user.fullName || user.username}</div>
              <p className="text-sm text-muted-foreground font-normal">{user.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="view">
              <UserIcon className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="edit">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Shield className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - View Only */}
          <TabsContent value="view" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserIcon className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{user.name || user.fullName || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date of Birth
                    </p>
                    <p className="font-medium">{user.dob ? formatDate(user.dob) : 'Not set'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="h-4 w-4" />
                    Learning Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">English Level</p>
                    <Badge variant="secondary">
                      {ENGLISH_LEVELS.find(l => l.value === user.englishLevel)?.label || 'Not set'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Learning Goal
                    </p>
                    <Badge variant="outline">
                      {LEARNING_GOALS.find(g => g.value === user.learningGoals)?.label || 'Not set'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      Preferred Accent
                    </p>
                    <p className="font-medium">
                      {ACCENTS.find(a => a.value === user.preferredAccent)?.label || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Study Goal</p>
                    <p className="font-medium">{user.dailyStudyGoal} minutes</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verified</span>
                  <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Onboarded</span>
                  <Badge variant={user.isOnboarded ? 'default' : 'secondary'}>
                    {user.isOnboarded ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member Since</span>
                  <span className="text-sm font-medium">{formatDate(user.createdAt || '')}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      {...profileForm.register('name', { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      {...profileForm.register('username', { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      {...profileForm.register('dob')}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Learning Preferences</CardTitle>
                <CardDescription>Customize your learning experience</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={learningForm.handleSubmit(handleLearningSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="english_level">English Level</Label>
                    <Select
                      defaultValue={learningForm.getValues('englishLevel')}
                      onValueChange={(value) => learningForm.setValue('englishLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        {ENGLISH_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learning_goals">Learning Goal</Label>
                    <Select
                      defaultValue={learningForm.getValues('learningGoals')}
                      onValueChange={(value) => learningForm.setValue('learningGoals', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEARNING_GOALS.map((goal) => (
                          <SelectItem key={goal.value} value={goal.value}>
                            {goal.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_accent">Preferred Accent</Label>
                    <Select
                      defaultValue={learningForm.getValues('preferredAccent')}
                      onValueChange={(value) => learningForm.setValue('preferredAccent', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select accent" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCENTS.map((accent) => (
                          <SelectItem key={accent.value} value={accent.value}>
                            {accent.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daily_study_goal">Daily Study Goal (minutes)</Label>
                    <Input
                      id="daily_study_goal"
                      type="number"
                      min="5"
                      max="300"
                      step="5"
                      {...learningForm.register('dailyStudyGoal', {
                        valueAsNumber: true,
                        required: true,
                      })}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Learning Preferences
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Privacy & Notifications</CardTitle>
                <CardDescription>Manage your privacy and notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about your learning progress
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notificationEnabled}
                    onCheckedChange={setNotificationEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy_level" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Privacy Level
                  </Label>
                  <Select value={privacyLevel} onValueChange={setPrivacyLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select privacy level" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIVACY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Control who can view your learning progress
                  </p>
                </div>

                <Button onClick={handlePrivacySubmit} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-muted/50">
                    <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <Label className="text-base font-medium">Active Sessions</Label>
                      <p className="text-sm text-muted-foreground">
                        Log out from all devices except this one. This will revoke all active sessions and require you to log in again on other devices.
                      </p>
                    </div>
                  </div>

                  {!showLogoutAllConfirm ? (
                    <Button
                      variant="destructive"
                      onClick={() => setShowLogoutAllConfirm(true)}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Logout All Devices
                    </Button>
                  ) : (
                    <div className="space-y-3 p-4 border-2 border-destructive rounded-lg bg-destructive/5">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Are you sure?</p>
                          <p className="text-xs text-muted-foreground">
                            This will log you out from all devices including this one. You'll need to log in again.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleLogoutAllDevices}
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                          Yes, Logout All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowLogoutAllConfirm(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
