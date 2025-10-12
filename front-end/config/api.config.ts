// define backend router

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8092',
  timeout: 30000,
  endpoints: {
    auth: {
      login: '/auth/login',
      signup: '/auth/register',
      logout: '/auth/logout',
      logoutAllDevices: '/auth/logout-all-devices',
      resendMail: '/auth/resend-mail',
      verifyEmail: '/auth/verify-email',
      verifyOtp: '/auth/verify-otp',
      forgotPassword: '/auth/request-password-reset',
      resetPassword: '/auth/confirm-password-reset',
      confirmPasswordReset: '/auth/confirm-password-reset',
      refreshToken: '/auth/refresh-token',
    },
    users: {
      me: '/users/me',
      onboarding: '/users/onboarding',
    },
    admin: {
      users: '/admin/users',
      content: '/admin/content',
      scenarios: '/admin/scenarios',
    },
  },
} as const;
