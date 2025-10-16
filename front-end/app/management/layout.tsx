// front-end/app/admin/layout.tsx
'use client';

import { AdminSidebar } from "@/components/admin/admin-sidebar";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-black flex">
      <AdminSidebar />
      <div className="flex-1">
        <main className="min-h-full w-full">{children}</main>
      </div>
    </div>
  );
}