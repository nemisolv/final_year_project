// front-end/components/features/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, BookOpen, Settings, MessageSquare, PieChart, Star, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";

const adminRoutes = [
  { href: "/admin", label: "Tổng quan", icon: BarChart3 },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/courses", label: "Khóa học", icon: BookOpen },
  { href: "/admin/content", label: "Nội dung", icon: FileText },
  { href: "/admin/scenarios", label: "Kịch bản", icon: MessageSquare },
  { href: "/admin/progress", label: "Tiến độ", icon: PieChart },
  { href: "/admin/feedback", label: "Phản hồi", icon: Star },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-800 p-4 hidden md:flex flex-col h-full bg-black">
      <div className="mb-6">
        <Logo />
      </div>
      <nav className="space-y-2 flex-1">
        {adminRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors",
              pathname === route.href ? "bg-accent font-semibold" : ""
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}