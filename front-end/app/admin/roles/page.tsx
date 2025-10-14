'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/admin/data-table';
import { RoleFormDialog } from '@/components/admin/role-form-dialog';
import { roleManagementService } from '@/services/role-management.service';
import { permissionManagementService } from '@/services/permission-management.service';
import { RoleListItem, RoleDetail } from '@/types/role-management';
import { PermissionItem } from '@/types/permission-management';
import { toast } from 'sonner';

export default function RolesManagementPage() {
  const [roles, setRoles] = React.useState<RoleListItem[]>([]);
  const [permissions, setPermissions] = React.useState<PermissionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<RoleDetail | null>(null);
  const [roleToDelete, setRoleToDelete] = React.useState<RoleListItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchRoles = React.useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await roleManagementService.getRoles({
        page: page - 1,
        size: 10,
      });
      setRoles(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
      setTotalItems(response.totalElements);
    } catch (error) {
      toast.error('Không thể tải danh sách vai trò');
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = React.useCallback(async () => {
    try {
      const perms = await permissionManagementService.getPermissions();
      setPermissions(perms);
    } catch (error) {
      toast.error('Không thể tải danh sách quyền');
      console.error('Error fetching permissions:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const handleCreate = () => {
    setSelectedRole(null);
    setFormOpen(true);
  };

  const handleEdit = async (role: RoleListItem) => {
    try {
      const roleDetail = await roleManagementService.getRoleById(role.id);
      setSelectedRole(roleDetail);
      setFormOpen(true);
    } catch (error) {
      toast.error('Không thể tải thông tin vai trò');
      console.error('Error fetching role detail:', error);
    }
  };

  const handleDelete = (role: RoleListItem) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      setIsSubmitting(true);
      await roleManagementService.deleteRole(roleToDelete.id);
      toast.success('Đã xóa vai trò thành công');
      fetchRoles(currentPage);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Không thể xóa vai trò');
      console.error('Error deleting role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (selectedRole) {
        await roleManagementService.updateRole(selectedRole.id, data);
        toast.success('Đã cập nhật vai trò thành công');
      } else {
        await roleManagementService.createRole(data);
        toast.success('Đã tạo vai trò mới thành công');
      }
      fetchRoles(currentPage);
      setFormOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(message);
      console.error('Error saving role:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<RoleListItem>[] = [
    {
      accessorKey: 'name',
      header: 'Tên vai trò',
    },
    {
      accessorKey: 'displayName',
      header: 'Tên hiển thị',
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => {
        const description = row.original.description;
        if (!description) return <span className="text-muted-foreground">Không có</span>;
        return <span className="line-clamp-1">{description}</span>;
      },
    },
    {
      accessorKey: 'permissionCount',
      header: 'Số quyền',
      cell: ({ row }) => {
        return <Badge variant="secondary">{row.original.permissionCount}</Badge>;
      },
    },
    {
      accessorKey: 'userCount',
      header: 'Số người dùng',
      cell: ({ row }) => {
        return <Badge variant="outline">{row.original.userCount}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString('vi-VN');
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const role = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(role)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(role)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản lý vai trò</h1>
          <p className="text-muted-foreground">Quản lý vai trò và phân quyền trong hệ thống</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm vai trò
        </Button>
      </div>

      {loading && roles.length === 0 ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={roles}
          searchKey="displayName"
          searchPlaceholder="Tìm theo tên hiển thị..."
          pageSize={10}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={fetchRoles}
          totalItems={totalItems}
        />
      )}

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        role={selectedRole}
        permissions={permissions}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa vai trò</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vai trò <strong>{roleToDelete?.displayName}</strong>? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
