'use client';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div >
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    // </ProtectedRoute>
  );
}
