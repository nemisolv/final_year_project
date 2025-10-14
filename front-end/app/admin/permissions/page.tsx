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
import { PermissionFormDialog } from '@/components/admin/permission-form-dialog';
import { permissionManagementService } from '@/services/permission-management.service';
import { PermissionItem } from '@/types/permission-management';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PermissionsManagementPage() {
  const [permissions, setPermissions] = React.useState<PermissionItem[]>([]);
  const [groupedPermissions, setGroupedPermissions] = React.useState<Record<string, PermissionItem[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedPermission, setSelectedPermission] = React.useState<PermissionItem | null>(null);
  const [permissionToDelete, setPermissionToDelete] = React.useState<PermissionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>('all');

  const fetchPermissions = React.useCallback(async () => {
    try {
      setLoading(true);
      const perms = await permissionManagementService.getPermissions();
      setPermissions(perms);

      const grouped: Record<string, PermissionItem[]> = {};
      perms.forEach((perm) => {
        if (!grouped[perm.resourceType]) {
          grouped[perm.resourceType] = [];
        }
        grouped[perm.resourceType].push(perm);
      });
      setGroupedPermissions(grouped);

      if (activeTab === 'all' && Object.keys(grouped).length > 0) {
        setActiveTab('all');
      }
    } catch (error) {
      toast.error('Không thể tải danh sách quyền');
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleCreate = () => {
    setSelectedPermission(null);
    setFormOpen(true);
  };

  const handleEdit = (permission: PermissionItem) => {
    setSelectedPermission(permission);
    setFormOpen(true);
  };

  const handleDelete = (permission: PermissionItem) => {
    if (!permission.deletable) {
      toast.error('Không thể xóa quyền hệ thống');
      return;
    }
    setPermissionToDelete(permission);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!permissionToDelete) return;

    try {
      setIsSubmitting(true);
      await permissionManagementService.deletePermission(permissionToDelete.id);
      toast.success('Đã xóa quyền thành công');
      fetchPermissions();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Không thể xóa quyền');
      console.error('Error deleting permission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (selectedPermission) {
        await permissionManagementService.updatePermission(selectedPermission.id, data);
        toast.success('Đã cập nhật quyền thành công');
      } else {
        await permissionManagementService.createPermission(data);
        toast.success('Đã tạo quyền mới thành công');
      }
      fetchPermissions();
      setFormOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(message);
      console.error('Error saving permission:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<PermissionItem>[] = [
    {
      accessorKey: 'name',
      header: 'Tên quyền',
      cell: ({ row }) => {
        return <code className="text-sm font-mono">{row.original.name}</code>;
      },
    },
    {
      accessorKey: 'displayName',
      header: 'Tên hiển thị',
    },
    {
      accessorKey: 'resourceType',
      header: 'Loại tài nguyên',
      cell: ({ row }) => {
        return <Badge variant="outline">{row.original.resourceType}</Badge>;
      },
    },
    {
      accessorKey: 'action',
      header: 'Hành động',
      cell: ({ row }) => {
        const actionColors: Record<string, string> = {
          read: 'bg-blue-100 text-blue-800',
          write: 'bg-green-100 text-green-800',
          delete: 'bg-red-100 text-red-800',
          update: 'bg-yellow-100 text-yellow-800',
        };
        const action = row.original.action.toLowerCase();
        const colorClass = actionColors[action] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
            {row.original.action}
          </span>
        );
      },
    },
    {
      accessorKey: 'roleCount',
      header: 'Số vai trò',
      cell: ({ row }) => {
        return <Badge variant="secondary">{row.original.roleCount}</Badge>;
      },
    },
    {
      accessorKey: 'deletable',
      header: 'Có thể xóa',
      cell: ({ row }) => {
        return row.original.deletable ? (
          <Badge variant="default">Có</Badge>
        ) : (
          <Badge variant="secondary">Không</Badge>
        );
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
        const permission = row.original;

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
              <DropdownMenuItem onClick={() => handleEdit(permission)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              {permission.deletable && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(permission)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const resourceTypes = ['all', ...Object.keys(groupedPermissions).sort()];

  const displayedPermissions = activeTab === 'all' ? permissions : groupedPermissions[activeTab] || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản lý quyền</h1>
          <p className="text-muted-foreground">Quản lý các quyền truy cập trong hệ thống</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm quyền
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              Tất cả ({permissions.length})
            </TabsTrigger>
            {Object.keys(groupedPermissions).sort().map((resourceType) => (
              <TabsTrigger key={resourceType} value={resourceType}>
                {resourceType} ({groupedPermissions[resourceType].length})
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab}>
            <DataTable
              columns={columns}
              data={displayedPermissions}
              searchKey="displayName"
              searchPlaceholder="Tìm theo tên hiển thị..."
              pageSize={15}
            />
          </TabsContent>
        </Tabs>
      )}

      <PermissionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        permission={selectedPermission}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa quyền</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa quyền <strong>{permissionToDelete?.displayName}</strong>? Hành
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
