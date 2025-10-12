'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AUTH } from '@/lib/constants';
import { apiClient } from '@/lib/api';
import { ArrowRight, RotateCcw, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Start countdown timer (5 minutes)
    setCountdown(300);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateOtp = () => {
    const otpString = otp.join('');
    if (!otpString) {
      toast.error(AUTH.validation.otp.required);
      return false;
    }
    if (otpString.length !== 6) {
      toast.error(AUTH.validation.otp.length);
      return false;
    }
    if (!/^\d{6}$/.test(otpString)) {
      toast.error(AUTH.validation.otp.invalid);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOtp()) return;

    setIsLoading(true);

    try {
      const otpString = otp.join('');
      await apiClient.verifyEmail(otpString);

      toast.success(AUTH.messages.success.otpVerified);
      router.push(AUTH.routes.login);
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || AUTH.messages.error.otpInvalid;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error('Email không hợp lệ');
      return;
    }

    try {
      // TODO: Implement resend OTP API when backend provides it
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success(AUTH.messages.success.resendMail);
      setCountdown(300); // Reset countdown
      setOtp(['', '', '', '', '', '']); // Clear OTP inputs
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(AUTH.messages.error.resendMail);
    }
  };

  return (
    <AuthLayout
      title="Xác thực OTP"
      description="Nhập mã xác thực 6 chữ số đã được gửi đến email của bạn"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Label className="text-center block">Mã xác thực</Label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary"
                required
              />
            ))}
          </div>
        </div>

        {countdown > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Mã sẽ hết hạn sau: <span className="font-mono text-primary">{formatTime(countdown)}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || countdown === 0}
        >
          {isLoading ? (
            'Đang xác thực...'
          ) : (
            <>
              Xác thực
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResendOtp}
            disabled={countdown > 0}
            className="text-sm"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {countdown > 0 ? `Gửi lại sau ${formatTime(countdown)}` : 'Gửi lại mã'}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm space-y-3">
        <div className="flex items-center justify-center text-muted-foreground mb-2">
          <Mail className="mr-2 h-4 w-4" />
          Kiểm tra email của bạn
        </div>
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium">2 cách xác thực:</p>
          <ul className="text-xs text-muted-foreground space-y-1 text-left">
            <li>• <span className="font-medium">Cách 1 (Khuyến nghị):</span> Nhấp vào link trong email</li>
            <li>• <span className="font-medium">Cách 2:</span> Nhập mã OTP 6 chữ số ở trên</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
          <Link
            href={AUTH.routes.resendMail}
            className="text-primary hover:underline"
          >
            gửi lại email xác thực
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
