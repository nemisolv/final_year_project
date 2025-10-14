"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import { UserDropdown } from "@/components/features/user";
import { USER_MENU_PRESETS } from "@/config/user-menu.config";
import { Logo } from "@/components/common/logo";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navigation = [
    { name: "Trang chủ", href: "#home" },
    { name: "Tính năng", href: "#features" },
    { name: "Cảm nhận của học viên", href: "#feedback" },
    // { name: "Liên hệ", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Logo/>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <UserDropdown menuItems={USER_MENU_PRESETS.marketing} />
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>
                    Bắt đầu học
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-primary"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-muted rounded-lg mt-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between px-3">
                  <span className="text-xs text-muted-foreground">Chế độ</span>
                  <ThemeToggle />
                </div>
                {isAuthenticated && user ? (
                  <>
                    <div className="px-3 py-2 border-t border-b">
                      <div className="flex items-center space-x-3">
                        <UserAvatar user={user} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.full_name || user.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                    </Link>
                    <Link href="/learning/path" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Lộ trình học</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600"
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Đăng nhập</Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full justify-start">Bắt đầu học</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
