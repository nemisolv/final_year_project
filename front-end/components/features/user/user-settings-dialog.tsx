'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User } from '@/types';
import { userService } from '@/services';
import { formatDate } from '@/lib/utils';
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
import { toast } from 'sonner';
import { Loader2, Settings, User as UserIcon, Bell, Lock, Shield } from 'lucide-react';

interface UserSettingsDialogProps {
  user: User;
  onUserUpdate?: (user: User) => void;
  trigger?: React.ReactNode;
}

type ProfileFormData = {
  name: string;
  username: string;
  email: string;
  dob: string;
};

type LearningFormData = {
  english_level: string;
  learning_goals: string;
  preferred_accent: string;
  daily_study_goal: number;
};

type PrivacyFormData = {
  notification_enabled: boolean;
  privacy_level: string;
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

export function UserSettingsDialog({ user, onUserUpdate, trigger }: UserSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name || user.full_name || '',
      username: user.username || '',
      email: user.email || '',
      dob: user.dob ? user.dob.split(' ')[0] : '',
    },
  });

  const learningForm = useForm<LearningFormData>({
    defaultValues: {
      english_level: user.english_level || 'BEGINNER',
      learning_goals: user.learning_goals || 'GENERAL',
      preferred_accent: user.preferred_accent || 'AMERICAN',
      daily_study_goal: user.daily_study_goal || 30,
    },
  });

  const [notificationEnabled, setNotificationEnabled] = useState(
    user.notification_enabled ?? true
  );
  const [privacyLevel, setPrivacyLevel] = useState(user.privacy_level || 'PRIVATE');

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateUser(user.id, {
        name: data.name,
        username: data.username,
        dob: data.dob,
      });

      toast.success('Cập nhật thông tin thành công!');
      onUserUpdate?.(updatedUser);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error('Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearningSubmit = async (data: LearningFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateUser(user.id, {
        english_level: data.english_level,
        learning_goals: data.learning_goals,
        preferred_accent: data.preferred_accent,
        daily_study_goal: data.daily_study_goal,
      });

      toast.success('Cập nhật mục tiêu học tập thành công!');
      onUserUpdate?.(updatedUser);
    } catch (error: any) {
      console.error('Failed to update learning settings:', error);
      toast.error('Không thể cập nhật mục tiêu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacySubmit = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateUser(user.id, {
        notification_enabled: notificationEnabled,
        privacy_level: privacyLevel,
      });

      toast.success('Cập nhật cài đặt riêng tư thành công!');
      onUserUpdate?.(updatedUser);
    } catch (error: any) {
      console.error('Failed to update privacy settings:', error);
      toast.error('Không thể cập nhật cài đặt. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cài đặt tài khoản</DialogTitle>
          <DialogDescription>
            Quản lý thông tin cá nhân và cài đặt học tập của bạn
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <UserIcon className="mr-2 h-4 w-4" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="learning">
              <Bell className="mr-2 h-4 w-4" />
              Học tập
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="mr-2 h-4 w-4" />
              Riêng tư
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  placeholder="Nhập họ và tên"
                  {...profileForm.register('name', { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Tên người dùng</Label>
                <Input
                  id="username"
                  placeholder="Nhập tên người dùng"
                  {...profileForm.register('username', { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...profileForm.register('email')}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email không thể thay đổi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input
                  id="dob"
                  type="date"
                  {...profileForm.register('dob')}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-4">
            <form onSubmit={learningForm.handleSubmit(handleLearningSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="english_level">Trình độ tiếng Anh</Label>
                <Select
                  defaultValue={learningForm.getValues('english_level')}
                  onValueChange={(value) => learningForm.setValue('english_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trình độ" />
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
                <Label htmlFor="learning_goals">Mục tiêu học tập</Label>
                <Select
                  defaultValue={learningForm.getValues('learning_goals')}
                  onValueChange={(value) => learningForm.setValue('learning_goals', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mục tiêu" />
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
                <Label htmlFor="preferred_accent">Giọng phát âm ưa thích</Label>
                <Select
                  defaultValue={learningForm.getValues('preferred_accent')}
                  onValueChange={(value) => learningForm.setValue('preferred_accent', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giọng" />
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
                <Label htmlFor="daily_study_goal">Mục tiêu học mỗi ngày (phút)</Label>
                <Input
                  id="daily_study_goal"
                  type="number"
                  min="5"
                  max="300"
                  step="5"
                  {...learningForm.register('daily_study_goal', {
                    valueAsNumber: true,
                    required: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Thời gian bạn muốn dành để học mỗi ngày
                </p>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Thông báo</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo về tiến độ học tập và nhắc nhở
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationEnabled}
                  onCheckedChange={setNotificationEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy_level">Mức độ riêng tư</Label>
                <Select value={privacyLevel} onValueChange={setPrivacyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mức độ riêng tư" />
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
                  Kiểm soát ai có thể xem tiến độ học tập của bạn
                </p>
              </div>

              <DialogFooter>
                <Button onClick={handlePrivacySubmit} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Tài khoản được tạo vào {formatDate(user.created_at)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
