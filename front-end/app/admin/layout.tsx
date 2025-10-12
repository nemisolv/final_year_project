'use client';

import { BarChart3, BookOpen, Settings, Users } from "lucide-react";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
     <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex ">
          <aside className="w-64 border-r p-4 hidden md:block">
          <h2 className="text-xl font-bold mb-6">Admin</h2>
          <nav className="space-y-2">
            <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent" href="#">
              <BarChart3 className="h-4 w-4" /> Tổng quan
            </a>
            <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent" href="#">
              <Users className="h-4 w-4" /> Người dùng
            </a>
            <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent" href="#">
              <BookOpen className="h-4 w-4" /> Khoá học
            </a>
            <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent" href="#">
              <Settings className="h-4 w-4" /> Cấu hình hệ thống
            </a>
          </nav>
        </aside>
      <div >
        <main className="min-h-[calc(100vh-4rem)] w-full ">{children}</main>
      </div>
    </div>
    // </ProtectedRoute>
  );
}
