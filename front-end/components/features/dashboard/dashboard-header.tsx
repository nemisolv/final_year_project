'use client';

import { BookOpen, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { UserSettingsDialog, UserDropdown } from '@/components/features/user';
import { USER_MENU_PRESETS } from '@/config/user-menu.config';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function DashboardHeader() {
  const { user } = useAuth();

  // Custom menu items with UserSettingsDialog integration
  const customMenuItems = user ? [
    {
      label: 'Settings',
      icon: Settings,
      customContent: (
        <UserSettingsDialog
          user={user}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          }
        />
      ),
    },
    { label: 'separator' },
  ] : [];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EnglishMaster</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/learning/path" className="text-muted-foreground hover:text-primary transition-colors">
              Learning Path
            </Link>
            <Link href="/learning/progress" className="text-muted-foreground hover:text-primary transition-colors">
              My Progress
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <UserDropdown
              menuItems={[...USER_MENU_PRESETS.dashboard, ...customMenuItems]}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
