// define backend router

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8092',
  timeout: 30000,
  version: '/api/v1',
  endpoints: {
    auth: {
      login: '/api/v1/auth/login',
      signup: '/api/v1/auth/register',
      logout: '/api/v1/auth/logout',
      logoutAllDevices: '/api/v1/auth/logout-all-devices',
      resendMail: '/api/v1/auth/resend-mail',
      verifyEmail: '/api/v1/auth/verify-email',
      verifyOtp: '/api/v1/auth/verify-otp',
      forgotPassword: '/api/v1/auth/request-password-reset',
      resetPassword: '/api/v1/auth/confirm-password-reset',
      confirmPasswordReset: '/api/v1/auth/confirm-password-reset',
      refreshToken: '/api/v1/auth/refresh-token',
    },
    users: {
      me: '/api/v1/users/me',
      onboarding: '/api/v1/users/onboarding',
      dashboardStats: '/api/v1/users/me/dashboard-stats',
    },
    admin: {
      users: '/api/v1/admin/users',
      roles: '/api/v1/admin/roles',
      permissions: '/api/v1/admin/permissions',
      content: '/api/v1/admin/content',
      scenarios: '/api/v1/admin/scenarios',
    },
    courses: '/api/v1/courses',
    testimonials: '/api/v1/testimonials',
    platformStats: '/api/v1/platform/stats',
    pronunciation: '/api/v1/pronunciation',
    tts: '/api/v1/tts',
    grammar: '/api/v1/grammar',
  },
} as const;
