'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Plus, Shield, Key } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/admin/data-table';
import { RoleFormDialog } from '@/components/admin/role-form-dialog';
import { PermissionFormDialog } from '@/components/admin/permission-form-dialog';
import { roleManagementService } from '@/services/role-management.service';
import { permissionManagementService } from '@/services/permission-management.service';
import { RoleListItem, RoleDetail } from '@/types/role-management';
import { PermissionItem } from '@/types/permission-management';
import { toast } from 'sonner';

export default function RolesPermissionsManagementPage() {
  // Roles state
  const [roles, setRoles] = React.useState<RoleListItem[]>([]);
  const [rolesLoading, setRolesLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [roleFormOpen, setRoleFormOpen] = React.useState(false);
  const [roleDeleteDialogOpen, setRoleDeleteDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<RoleDetail | null>(null);
  const [roleToDelete, setRoleToDelete] = React.useState<RoleListItem | null>(null);
  const [isRoleSubmitting, setIsRoleSubmitting] = React.useState(false);

  // Permissions state
  const [permissions, setPermissions] = React.useState<PermissionItem[]>([]);
  const [groupedPermissions, setGroupedPermissions] = React.useState<Record<string, PermissionItem[]>>({});
  const [permissionsLoading, setPermissionsLoading] = React.useState(true);
  const [permissionFormOpen, setPermissionFormOpen] = React.useState(false);
  const [permissionDeleteDialogOpen, setPermissionDeleteDialogOpen] = React.useState(false);
  const [selectedPermission, setSelectedPermission] = React.useState<PermissionItem | null>(null);
  const [permissionToDelete, setPermissionToDelete] = React.useState<PermissionItem | null>(null);
  const [isPermissionSubmitting, setIsPermissionSubmitting] = React.useState(false);
  const [activePermissionTab, setActivePermissionTab] = React.useState<string>('all');

  // Fetch Roles
  const fetchRoles = React.useCallback(async (page: number = 1) => {
    try {
      setRolesLoading(true);
      const response = await roleManagementService.getRoles({
        page: page,
        limit: 10,
      });
      setRoles(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
      setTotalItems(response.totalElements);
    } catch (error) {
      toast.error('Không thể tải danh sách vai trò');
      console.error('Error fetching roles:', error);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  // Fetch Permissions
  const fetchPermissions = React.useCallback(async () => {
    try {
      setPermissionsLoading(true);
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
    } catch (error) {
      toast.error('Không thể tải danh sách quyền');
      console.error('Error fetching permissions:', error);
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  // Role handlers
  const handleCreateRole = () => {
    setSelectedRole(null);
    setRoleFormOpen(true);
  };

  const handleEditRole = async (role: RoleListItem) => {
    try {
      const roleDetail = await roleManagementService.getRoleById(role.id);
      setSelectedRole(roleDetail);
      setRoleFormOpen(true);
    } catch (error) {
      toast.error('Không thể tải thông tin vai trò');
      console.error('Error fetching role detail:', error);
    }
  };

  const handleDeleteRole = (role: RoleListItem) => {
    setRoleToDelete(role);
    setRoleDeleteDialogOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      setIsRoleSubmitting(true);
      await roleManagementService.deleteRole(roleToDelete.id);
      toast.success('Đã xóa vai trò thành công');
      fetchRoles(currentPage);
      setRoleDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Không thể xóa vai trò');
      console.error('Error deleting role:', error);
    } finally {
      setIsRoleSubmitting(false);
    }
  };

  const handleRoleSubmit = async (data: any) => {
    try {
      setIsRoleSubmitting(true);
      if (selectedRole) {
        await roleManagementService.updateRole(selectedRole.id, data);
        toast.success('Đã cập nhật vai trò thành công');
      } else {
        await roleManagementService.createRole(data);
        toast.success('Đã tạo vai trò mới thành công');
      }
      fetchRoles(currentPage);
      setRoleFormOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(message);
      console.error('Error saving role:', error);
      throw error;
    } finally {
      setIsRoleSubmitting(false);
    }
  };

  // Permission handlers
  const handleCreatePermission = () => {
    setSelectedPermission(null);
    setPermissionFormOpen(true);
  };

  const handleEditPermission = (permission: PermissionItem) => {
    setSelectedPermission(permission);
    setPermissionFormOpen(true);
  };

  const handleDeletePermission = (permission: PermissionItem) => {
    if (!permission.deletable) {
      toast.error('Không thể xóa quyền hệ thống');
      return;
    }
    setPermissionToDelete(permission);
    setPermissionDeleteDialogOpen(true);
  };

  const confirmDeletePermission = async () => {
    if (!permissionToDelete) return;

    try {
      setIsPermissionSubmitting(true);
      await permissionManagementService.deletePermission(permissionToDelete.id);
      toast.success('Đã xóa quyền thành công');
      fetchPermissions();
      setPermissionDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Không thể xóa quyền');
      console.error('Error deleting permission:', error);
    } finally {
      setIsPermissionSubmitting(false);
    }
  };

  const handlePermissionSubmit = async (data: any) => {
    try {
      setIsPermissionSubmitting(true);
      if (selectedPermission) {
        await permissionManagementService.updatePermission(selectedPermission.id, data);
        toast.success('Đã cập nhật quyền thành công');
      } else {
        await permissionManagementService.createPermission(data);
        toast.success('Đã tạo quyền mới thành công');
      }
      fetchPermissions();
      setPermissionFormOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(message);
      console.error('Error saving permission:', error);
      throw error;
    } finally {
      setIsPermissionSubmitting(false);
    }
  };

  // Role columns
  const roleColumns: ColumnDef<RoleListItem>[] = [
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
              <DropdownMenuItem onClick={() => handleEditRole(role)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteRole(role)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Permission columns
  const permissionColumns: ColumnDef<PermissionItem>[] = [
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
              <DropdownMenuItem onClick={() => handleEditPermission(permission)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              {permission.deletable && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDeletePermission(permission)} className="text-red-600">
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

  const displayedPermissions = activePermissionTab === 'all' ? permissions : groupedPermissions[activePermissionTab] || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý Vai trò & Quyền</h1>
        <p className="text-muted-foreground">Quản lý vai trò người dùng và quyền truy cập trong hệ thống</p>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Vai trò ({roles.length})
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Quyền ({permissions.length})
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Danh sách Vai trò</CardTitle>
                  <CardDescription>Quản lý các vai trò trong hệ thống</CardDescription>
                </div>
                <Button onClick={handleCreateRole}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm vai trò
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rolesLoading && roles.length === 0 ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : (
                <DataTable
                  columns={roleColumns}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Danh sách Quyền</CardTitle>
                  <CardDescription>Quản lý các quyền truy cập trong hệ thống</CardDescription>
                </div>
                <Button onClick={handleCreatePermission}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm quyền
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {permissionsLoading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : (
                <Tabs value={activePermissionTab} onValueChange={setActivePermissionTab}>
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
                  <TabsContent value={activePermissionTab}>
                    <DataTable
                      columns={permissionColumns}
                      data={displayedPermissions}
                      searchKey="displayName"
                      searchPlaceholder="Tìm theo tên hiển thị..."
                      pageSize={15}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={roleFormOpen}
        onOpenChange={setRoleFormOpen}
        role={selectedRole}
        permissions={permissions}
        onSubmit={handleRoleSubmit}
        isLoading={isRoleSubmitting}
      />

      {/* Role Delete Dialog */}
      <AlertDialog open={roleDeleteDialogOpen} onOpenChange={setRoleDeleteDialogOpen}>
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
            <AlertDialogAction onClick={confirmDeleteRole} disabled={isRoleSubmitting}>
              {isRoleSubmitting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permission Form Dialog */}
      <PermissionFormDialog
        open={permissionFormOpen}
        onOpenChange={setPermissionFormOpen}
        permission={selectedPermission}
        onSubmit={handlePermissionSubmit}
        isLoading={isPermissionSubmitting}
      />

      {/* Permission Delete Dialog */}
      <AlertDialog open={permissionDeleteDialogOpen} onOpenChange={setPermissionDeleteDialogOpen}>
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
            <AlertDialogAction onClick={confirmDeletePermission} disabled={isPermissionSubmitting}>
              {isPermissionSubmitting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
