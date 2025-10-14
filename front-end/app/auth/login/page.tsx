'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AUTH } from '@/lib/constants';
import { useAuth } from '@/hooks';
import { getLoginRedirectPath } from '@/lib/auth/redirect';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
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
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Use authLogin from useAuth() - this will update the AuthProvider state and return user data
      const loggedInUser = await authLogin(formData.email, formData.password);

      // Get appropriate redirect path based on user data
      const redirectPath = getLoginRedirectPath(loggedInUser);

      // Redirect to appropriate page
      router.push(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || AUTH.messages.error.login;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      description="Nhập thông tin để truy cập tài khoản của bạn"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex items-center justify-between">
          <Link
            href={AUTH.routes.forgotPassword}
            className="text-sm text-primary hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            'Đang đăng nhập...'
          ) : (
            <>
              Đăng nhập
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Chưa có tài khoản? </span>
        <Link
          href={AUTH.routes.signup}
          className="text-primary hover:underline font-medium"
        >
          Đăng ký ngay
        </Link>
      </div>
    </AuthLayout>
  );
}
