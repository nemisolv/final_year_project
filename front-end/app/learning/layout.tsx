'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Video,
  BookOpen,
  ClipboardList,
  Menu,
  X,
  Home,
  LogOut,
  TrendingUp,
  Target,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserAvatar } from '@/components/ui/user-avatar';

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'AI Chat',
      href: '/learning/chat',
      icon: MessageSquare,
      description: '1:1 conversation practice with AI',
    },
    {
      name: 'Conversations',
      href: '/learning/conversation',
      icon: Users,
      description: 'Situational role-play scenarios',
    },
    {
      name: 'Pronunciation',
      href: '/learning/pronunciation',
      icon: Video,
      description: 'Video call pronunciation practice',
    },
    {
      name: 'Grammar',
      href: '/learning/grammar',
      icon: BookOpen,
      description: 'Learn grammar rules and patterns',
    },
    {
      name: 'Quiz',
      href: '/learning/quiz',
      icon: ClipboardList,
      description: 'Test your knowledge',
    },
    {
      name: 'Learning Path',
      href: '/learning/path',
      icon: Target,
      description: 'Manage your learning journey',
    },
    {
      name: 'My Progress',
      href: '/learning/progress',
      icon: TrendingUp,
      description: 'Track progress with charts',
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <h1 className="text-xl font-bold text-primary">EnglishMaster</h1>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          {user && (
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.username || user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Learning
            </div>
            {navigation.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className={`text-xs mt-0.5 ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="px-4 py-4 border-t border-border space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                router.push('/dashboard');
                setIsSidebarOpen(false);
              }}
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                logout();
                setIsSidebarOpen(false);
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-card border-b border-border backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center justify-between h-full px-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
