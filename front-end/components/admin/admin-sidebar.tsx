// front-end/components/admin/admin-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";

const managementRoutes = [
  { href: "/management", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/management/users", label: "Người dùng", icon: Users },
  { href: "/management/roles", label: "Vai trò & Quyền", icon: Shield },
  { href: "/management/courses", label: "Khóa học", icon: BookOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-800 p-4 hidden md:flex flex-col h-full bg-black">
      <div className="mb-6">
        <Logo />
      </div>
      <nav className="space-y-2 flex-1">
        {managementRoutes.map((route) => (
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