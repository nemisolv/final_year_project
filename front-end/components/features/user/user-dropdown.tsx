'use client';

import { LucideIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useAuth } from '@/hooks';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface UserDropdownMenuItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  requiredRoles?: string[];
  className?: string;
  customContent?: ReactNode;
  preventSelect?: boolean;
}

export interface UserDropdownProps {
  menuItems?: UserDropdownMenuItem[];
  showUserInfo?: boolean;
  align?: 'start' | 'center' | 'end';
  className?: string;
  contentClassName?: string;
}

export function UserDropdown({
  menuItems = [],
  showUserInfo = true,
  align = 'end',
  className,
  contentClassName,
}: UserDropdownProps) {
  const { user, logout, hasAnyRole } = useAuth();

  if (!user) return null;

  // Filter menu items based on user roles
  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }
    return hasAnyRole(item.requiredRoles);
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative h-10 w-10 rounded-full ${className || ''}`}>
          <UserAvatar user={user} size="md" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`w-56 ${contentClassName || ''}`} align={align} forceMount>
        {showUserInfo && (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {filteredMenuItems.map((item, index) => {
          // Handle custom content (like dialog triggers)
          if (item.customContent) {
            return <div key={index}>{item.customContent}</div>;
          }

          // Handle separators
          if (item.label === 'separator') {
            return <DropdownMenuSeparator key={index} />;
          }

          // Handle onClick items
          if (item.onClick && !item.href) {
            return (
              <DropdownMenuItem
                key={index}
                onClick={item.onClick}
                className={item.className || 'cursor-pointer'}
                onSelect={item.preventSelect ? (e) => e.preventDefault() : undefined}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.label}
              </DropdownMenuItem>
            );
          }

          // Handle link items
          if (item.href) {
            return (
              <DropdownMenuItem key={index} asChild>
                <Link href={item.href} className={item.className || 'cursor-pointer'}>
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          }

          return null;
        })}

        {filteredMenuItems.length > 0 && <DropdownMenuSeparator />}

        <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}