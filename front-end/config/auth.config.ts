
// define frontend router

export const authConfig = {
  routes: {
    login: '/auth/login',
    signup: '/auth/signup',
    resendMail: '/auth/resend-mail',
    otp: '/auth/otp',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/verify-email',
  },
  publicRoutes: [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/otp',
    '/auth/resend-mail',
    '/',
  ],
  defaultRedirect: '/dashboard',
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

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  MODERATOR: 'ROLE_MODERATOR',
} as const;
