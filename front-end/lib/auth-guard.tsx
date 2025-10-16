'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = [
  '/', // Homepage
  '/auth/login',
  '/auth/signup',
  '/auth/verify-email',
  '/auth/otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/resend-mail',
];

const AUTH_PAGES = ['/auth/login', '/auth/signup'];
const ONBOARDING_ROUTE = '/onboarding';

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, fetchUser } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
      const isAuthPage = AUTH_PAGES.some(route => pathname.startsWith(route));

      // Wait for auth context to initialize
      if (isLoading) {
        return;
      }

      // Get user from context (already loaded, no API call)
      let currentUser = user;

      // Only fetch if we don't have user data yet
      if (!currentUser && !isPublicRoute) {
        currentUser = await fetchUser();
      }

      // User is authenticated
      if (currentUser) {
        // Check if user needs onboarding (handle both field names)
        const isOnboarded = currentUser.is_onboarded ?? (currentUser as { onboarded?: boolean }).onboarded ?? true;

        // If user is on login/signup page, redirect them away
        if (isAuthPage) {
          if (!isOnboarded) {
            router.push(ONBOARDING_ROUTE);
          } else if (currentUser.roles && currentUser.roles.includes('ADMIN')) {
            router.push('/management');
          } else {
            router.push('/learning');
          }
          setIsChecking(false);
          return;
        }

        // If user needs onboarding and not on onboarding page
        if (!isOnboarded && pathname !== ONBOARDING_ROUTE) {
          router.push(ONBOARDING_ROUTE);
          setIsChecking(false);
          return;
        }

        // If user is onboarded but trying to access onboarding page, redirect to appropriate page
        if (isOnboarded && pathname === ONBOARDING_ROUTE) {
          if (currentUser.roles && currentUser.roles.includes('ADMIN')) {
            router.push('/management');
          } else {
            router.push('/learning');
          }
          setIsChecking(false);
          return;
        }
      } else {
        // User is not authenticated
        // If trying to access protected route, redirect to login
        if (!isPublicRoute && pathname !== ONBOARDING_ROUTE) {
          router.push('/auth/login');
          setIsChecking(false);
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router, user, isLoading, fetchUser]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
