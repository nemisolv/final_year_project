'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roles: ['ROLE_USER'],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role),
    }));
  };

  const validateForm = () => {
    if (!formData.email) {
      toast.error('Email là bắt buộc');
      return false;
    }
    if (!formData.password) {
      toast.error('Mật khẩu là bắt buộc');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return false;
    }
    if (!formData.firstName) {
      toast.error('Tên là bắt buộc');
      return false;
    }
    if (!formData.lastName) {
      toast.error('Họ là bắt buộc');
      return false;
    }
    if (formData.roles.length === 0) {
      toast.error('Phải chọn ít nhất một vai trò');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await apiClient.createUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || undefined,
        roles: formData.roles,
      });

      toast.success('Tạo người dùng thành công');
      router.push('/admin/users');
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error.message || 'Không thể tạo người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/admin/users')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Tạo người dùng mới</CardTitle>
          <CardDescription>
            Thêm người dùng mới vào hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Tên *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Họ *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="0123456789"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vai trò *</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="role-user"
                    checked={formData.roles.includes('ROLE_USER')}
                    onChange={e => handleRoleChange('ROLE_USER', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="role-user" className="font-normal cursor-pointer">
                    User (Người dùng thông thường)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="role-moderator"
                    checked={formData.roles.includes('ROLE_MODERATOR')}
                    onChange={e => handleRoleChange('ROLE_MODERATOR', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="role-moderator" className="font-normal cursor-pointer">
                    Moderator (Người kiểm duyệt)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="role-admin"
                    checked={formData.roles.includes('ROLE_ADMIN')}
                    onChange={e => handleRoleChange('ROLE_ADMIN', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="role-admin" className="font-normal cursor-pointer">
                    Admin (Quản trị viên)
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Tạo người dùng
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/users')}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
