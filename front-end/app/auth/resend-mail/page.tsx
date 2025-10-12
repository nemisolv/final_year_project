'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AUTH } from '@/lib/constants';
import { ArrowRight, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ResendMailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = () => {
    if (!email) {
      toast.error(AUTH.validation.email.required);
      return false;
    }
    if (!email.includes('@')) {
      toast.error(AUTH.validation.email.invalid);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;

    setIsLoading(true);
    
    try {
      // TODO: Implement actual resend mail API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success(AUTH.messages.success.resendMail);
      setIsSuccess(true);
    } catch (error) {
      toast.error(AUTH.messages.error.resendMail);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Email đã được gửi"
        description="Vui lòng kiểm tra hộp thư của bạn"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Email xác thực đã được gửi!</h3>
            <p className="text-muted-foreground">
              Chúng tôi đã gửi email xác thực đến <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push(AUTH.routes.otp)}
              className="w-full"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Nhập mã OTP
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Gửi lại email khác
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Không nhận được email?</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Kiểm tra thư mục spam</li>
              <li>• Đảm bảo email được nhập chính xác</li>
              <li>• Thử lại sau vài phút</li>
            </ul>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Gửi lại email xác thực"
      description="Nhập email để nhận lại mã xác thực"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            'Đang gửi...'
          ) : (
            <>
              Gửi lại email
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Đã có mã OTP? </span>
        <Link
          href={AUTH.routes.otp}
          className="text-primary hover:underline font-medium"
        >
          Nhập mã ngay
        </Link>
      </div>

      <div className="mt-4 text-center text-sm">
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
