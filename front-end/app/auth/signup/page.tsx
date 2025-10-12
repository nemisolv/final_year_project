'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AUTH } from '@/lib/constants';
import { apiClient } from '@/lib/api';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name) {
      toast.error(AUTH.validation.name.required);
      return false;
    }
    if (formData.name.length < 2) {
      toast.error(AUTH.validation.name.minLength);
      return false;
    }
    if (formData.name.length > 100) {
      toast.error(AUTH.validation.name.maxLength);
      return false;
    }
    if (!formData.email) {
      toast.error(AUTH.validation.email.required);
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error(AUTH.validation.email.invalid);
      return false;
    }
    if (!formData.password) {
      toast.error(AUTH.validation.password.required);
      return false;
    }
    if (formData.password.length < 6) {
      toast.error(AUTH.validation.password.minLength);
      return false;
    }
    if (formData.password.length > 128) {
      toast.error(AUTH.validation.password.maxLength);
      return false;
    }
    if (!formData.confirmPassword) {
      toast.error(AUTH.validation.confirmPassword.required);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error(AUTH.validation.confirmPassword.mismatch);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await apiClient.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      toast.success(AUTH.messages.success.signup);
      router.push(`${AUTH.routes.otp}?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || AUTH.messages.error.signup;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng ký"
      description="Tạo tài khoản mới để bắt đầu học tiếng Anh"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Nhập họ và tên"
              value={formData.name}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="pl-10 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            'Đang đăng ký...'
          ) : (
            <>
              Đăng ký
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Đã có tài khoản? </span>
        <Link
          href={AUTH.routes.login}
          className="text-primary hover:underline font-medium"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </AuthLayout>
  );
}
