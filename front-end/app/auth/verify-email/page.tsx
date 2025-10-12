'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AUTH } from '@/lib/constants';
import { apiClient } from '@/lib/api';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

type VerificationStatus = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Token xác thực không hợp lệ hoặc bị thiếu');
        return;
      }

      try {
        await apiClient.verifyEmail(token);

        setStatus('success');
        toast.success('Email đã được xác thực thành công!');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push(AUTH.routes.login);
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Xác thực email thất bại. Token có thể đã hết hạn hoặc không hợp lệ.';
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [token, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Đang xác thực email...';
      case 'success':
        return 'Xác thực thành công!';
      case 'error':
        return 'Xác thực thất bại';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'verifying':
        return 'Vui lòng đợi trong giây lát';
      case 'success':
        return 'Tài khoản của bạn đã được kích hoạt. Bạn sẽ được chuyển đến trang đăng nhập...';
      case 'error':
        return errorMessage;
    }
  };

  return (
    <AuthLayout
      title="Xác thực Email"
      description="Xác nhận địa chỉ email của bạn"
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className="flex items-center justify-center">
          {getStatusIcon()}
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{getStatusTitle()}</h2>
          <p className="text-muted-foreground">{getStatusDescription()}</p>
        </div>

        {status === 'success' && (
          <div className="w-full space-y-4">
            <Button
              onClick={() => router.push(AUTH.routes.login)}
              className="w-full"
            >
              Đăng nhập ngay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="w-full space-y-4">
            <Button
              onClick={() => router.push(AUTH.routes.resendMail)}
              className="w-full"
              variant="outline"
            >
              <Mail className="mr-2 h-4 w-4" />
              Gửi lại email xác thực
            </Button>
            <Button
              onClick={() => router.push(AUTH.routes.login)}
              className="w-full"
              variant="ghost"
            >
              Quay lại đăng nhập
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Cần hỗ trợ? <Link href="/support" className="text-primary hover:underline">Liên hệ với chúng tôi</Link></p>
      </div>
    </AuthLayout>
  );
}
