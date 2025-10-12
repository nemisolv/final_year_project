"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP } from "@/lib/constants";
import { Users, BookOpen, BarChart3, Settings, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar */}
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

        {/* Main */}
        <main className="flex-1 p-6 md:p-8 space-y-6">
          {/* Topbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Bảng điều khiển quản trị</h1>
              <p className="text-muted-foreground">Quản lý {APP.name} hiệu quả</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 w-64" placeholder="Tìm kiếm..." />
              </div>
              <Link href="/admin/courses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Tạo mới
                </Button>
              </Link>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Người dùng</CardTitle>
                <CardDescription>Tổng số đăng ký</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">10,482</div>
                <div className="text-sm text-muted-foreground">+4.2% so với tuần trước</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Khoá học</CardTitle>
                <CardDescription>Đã xuất bản</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">36</div>
                <div className="text-sm text-muted-foreground">+2 mới tuần này</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu</CardTitle>
                <CardDescription>30 ngày gần nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$12,340</div>
                <div className="text-sm text-muted-foreground">+8.1% WoW</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tỷ lệ hoàn thành</CardTitle>
                <CardDescription>Bài học</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">72%</div>
                <div className="text-sm text-muted-foreground">+1.3% WoW</div>
              </CardContent>
            </Card>
          </div>

          {/* Tables (static demo) */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>Tìm kiếm: {query}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Tên</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Vai trò</th>
                      <th className="py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Minh Anh</td>
                      <td className="py-2">minhanh@example.com</td>
                      <td className="py-2">Student</td>
                      <td className="py-2">Active</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Văn Nam</td>
                      <td className="py-2">vannam@example.com</td>
                      <td className="py-2">Teacher</td>
                      <td className="py-2">Pending</td>
                    </tr>
                    <tr>
                      <td className="py-2">Hồng Mai</td>
                      <td className="py-2">hongmai@example.com</td>
                      <td className="py-2">Admin</td>
                      <td className="py-2">Active</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}


