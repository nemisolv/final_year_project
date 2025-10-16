// Theme constants
export const THEME = {
  colors: {
    primary: 'hsl(var(--primary))',
    primaryForeground: 'hsl(var(--primary-foreground))',
    secondary: 'hsl(var(--secondary))',
    secondaryForeground: 'hsl(var(--secondary-foreground))',
    accent: 'hsl(var(--accent))',
    accentForeground: 'hsl(var(--accent-foreground))',
    destructive: 'hsl(var(--destructive))',
    destructiveForeground: 'hsl(var(--destructive-foreground))',
    muted: 'hsl(var(--muted))',
    mutedForeground: 'hsl(var(--muted-foreground))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    card: 'hsl(var(--card))',
    cardForeground: 'hsl(var(--card-foreground))',
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
  },
  radius: {
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
    xl: 'calc(var(--radius) + 4px)',
  },
} as const;

// Auth constants
export const AUTH = {
  routes: {
    login: '/auth/login',
    signup: '/auth/signup',
    resendMail: '/auth/resend-mail',
    otp: '/auth/otp',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/verify-email',
  },
  validation: {
    email: {
      required: 'Email là bắt buộc',
      invalid: 'Email không hợp lệ',
    },
    password: {
      required: 'Mật khẩu là bắt buộc',
      minLength: 'Mật khẩu phải có ít nhất 6 ký tự',
      maxLength: 'Mật khẩu không được quá 128 ký tự',
    },
    confirmPassword: {
      required: 'Xác nhận mật khẩu là bắt buộc',
      mismatch: 'Mật khẩu xác nhận không khớp',
    },
    resetToken: {
      required: 'Token đặt lại mật khẩu là bắt buộc',
      invalid: 'Token không hợp lệ hoặc đã hết hạn',
    },
    otp: {
      required: 'Mã OTP là bắt buộc',
      invalid: 'Mã OTP không hợp lệ',
      length: 'Mã OTP phải có 6 chữ số',
    },
    name: {
      required: 'Họ tên là bắt buộc',
      minLength: 'Họ tên phải có ít nhất 2 ký tự',
      maxLength: 'Họ tên không được quá 100 ký tự',
    },
  },
  messages: {
    success: {
      login: 'Đăng nhập thành công!',
      signup: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      resendMail: 'Email xác thực đã được gửi lại!',
      otpVerified: 'Xác thực thành công!',
      emailVerified: 'Email đã được xác thực thành công!',
      forgotPassword: 'Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.',
      resetPassword: 'Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập.',
    },
    error: {
      login: 'Email hoặc mật khẩu không đúng',
      signup: 'Đăng ký thất bại. Vui lòng thử lại.',
      resendMail: 'Gửi lại email thất bại. Vui lòng thử lại.',
      otpInvalid: 'Mã OTP không đúng hoặc đã hết hạn',
      emailVerification: 'Xác thực email thất bại. Token có thể đã hết hạn.',
      network: 'Lỗi kết nối. Vui lòng thử lại.',
      forgotPassword: 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.',
      resetPassword: 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn.',
    },
  },
} as const;

// App constants
export const APP = {
  name: 'English Learning Platform',
  description: 'Nền tảng học tiếng Anh hiệu quả',
  version: '1.0.0',
} as const;

// API constants
export const API = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8092',
  version: '/api/v1',
  endpoints: {
    auth: {
      login: '/api/v1/auth/login',
      signup: '/api/v1/auth/register',
      logout: '/api/v1/auth/logout',
      resendMail: '/api/v1/auth/resend-mail',
      verifyEmail: '/api/v1/auth/verify-email',
      verifyOtp: '/api/v1/auth/verify-otp',
      forgotPassword: '/api/v1/auth/request-password-reset',
      resetPassword: '/api/v1/auth/confirm-password-reset',
      confirmPasswordReset: '/api/v1/auth/confirm-password-reset',
      refreshToken: '/api/v1/auth/refresh-token',
    },
    admin: {
      users: '/api/v1/admin/users',
      roles: '/api/v1/admin/roles',
      permissions: '/api/v1/admin/permissions',
    },
    courses: '/api/v1/courses',
    testimonials: '/api/v1/testimonials',
    platformStats: '/api/v1/platform-stats',
    pronunciation: '/api/v1/pronunciation',
    tts: '/api/v1/tts',
    grammar: '/api/v1/grammar',
  },
} as const;
