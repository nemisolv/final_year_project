'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, UserPlus, Shield, ShieldOff } from 'lucide-react';
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
import { UserFormDialog } from '@/components/admin/user-form-dialog';
import { userManagementService } from '@/services/user-management.service';
import { roleManagementService } from '@/services/role-management.service';
import { UserListItem, UserDetail } from '@/types/user-management';
import { RoleListItem } from '@/types/role-management';
import { toast } from 'sonner';

export default function UsersManagementPage() {
  const [users, setUsers] = React.useState<UserListItem[]>([]);
  const [roles, setRoles] = React.useState<RoleListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserDetail | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<UserListItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchUsers = React.useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await userManagementService.getUsers({
        page: page - 1,
        size: 10,
      });
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
      setTotalItems(response.totalElements);
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = React.useCallback(async () => {
    try {
      const response = await roleManagementService.getRoles({ page: 0, size: 100 });
      setRoles(response.content);
    } catch (error) {
      toast.error('Không thể tải danh sách vai trò');
      console.error('Error fetching roles:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleCreate = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEdit = async (user: UserListItem) => {
    try {
      const userDetail = await userManagementService.getUserById(user.id);
      setSelectedUser(userDetail);
      setFormOpen(true);
    } catch (error) {
      toast.error('Không thể tải thông tin người dùng');
      console.error('Error fetching user detail:', error);
    }
  };

  const handleDelete = (user: UserListItem) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsSubmitting(true);
      await userManagementService.deleteUser(userToDelete.id);
      toast.success('Đã xóa người dùng thành công');
      fetchUsers(currentPage);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Không thể xóa người dùng');
      console.error('Error deleting user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (user: UserListItem) => {
    try {
      await userManagementService.activateUser(user.id);
      toast.success('Đã kích hoạt người dùng');
      fetchUsers(currentPage);
    } catch (error) {
      toast.error('Không thể kích hoạt người dùng');
      console.error('Error activating user:', error);
    }
  };

  const handleDeactivate = async (user: UserListItem) => {
    try {
      await userManagementService.deactivateUser(user.id);
      toast.success('Đã vô hiệu hóa người dùng');
      fetchUsers(currentPage);
    } catch (error) {
      toast.error('Không thể vô hiệu hóa người dùng');
      console.error('Error deactivating user:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        await userManagementService.updateUser(selectedUser.id, data);
        toast.success('Đã cập nhật người dùng thành công');
      } else {
        await userManagementService.createUser(data);
        toast.success('Đã tạo người dùng mới thành công');
      }
      fetchUsers(currentPage);
      setFormOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(message);
      console.error('Error saving user:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<UserListItem>[] = [
    {
      accessorKey: 'username',
      header: 'Tên đăng nhập',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'name',
      header: 'Họ tên',
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
            {status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'emailVerified',
      header: 'Email xác thực',
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.emailVerified ? 'default' : 'outline'}>
            {row.original.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'roleNames',
      header: 'Vai trò',
      cell: ({ row }) => {
        const roleNames = row.original.roleNames || [];
        if (roleNames.length === 0) return <span className="text-muted-foreground">Không có</span>;
        return (
          <div className="flex gap-1 flex-wrap">
            {roleNames.map((role) => (
              <Badge key={role} variant="outline">
                {role}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.status === 'ACTIVE';

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
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              {isActive ? (
                <DropdownMenuItem onClick={() => handleDeactivate(user)}>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Vô hiệu hóa
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleActivate(user)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Kích hoạt
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(user)} className="text-red-600">
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
          <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý người dùng và phân quyền trong hệ thống</p>
        </div>
        <Button onClick={handleCreate}>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      {loading && users.length === 0 ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchKey="username"
          searchPlaceholder="Tìm theo tên đăng nhập..."
          pageSize={10}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={fetchUsers}
          totalItems={totalItems}
        />
      )}

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={selectedUser}
        roles={roles}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.username}</strong>? Hành
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
