'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requireAnyRole?: boolean; // If true, user needs ANY of the required roles. If false, user needs ALL roles
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requireAnyRole = true,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
    
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requireAnyRole
          ? hasAnyRole(requiredRoles)
          : requiredRoles.every(role => hasRole(role));
    
        if (!hasRequiredRole) {
          router.push('/unauthorized');
        }
      }
    }
  }, [isLoading, isAuthenticated, requiredRoles, requireAnyRole, router, hasRole, hasAnyRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requireAnyRole
      ? hasAnyRole(requiredRoles)
      : requiredRoles.every(role => hasRole(role));

    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}
