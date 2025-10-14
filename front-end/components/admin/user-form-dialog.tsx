'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { UserDetail, UserCreateData, UserUpdateData } from '@/types/user-management';
import { RoleListItem } from '@/types/role-management';

const userFormSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự').max(50),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
  name: z.string().min(1, 'Họ tên không được để trống'),
  roleIds: z.array(z.number()).optional(),
  emailVerified: z.boolean().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserDetail | null;
  roles: RoleListItem[];
  onSubmit: (data: UserCreateData | UserUpdateData) => Promise<void>;
  isLoading?: boolean;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  roles,
  onSubmit,
  isLoading,
}: UserFormDialogProps) {
  const isEdit = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      name: user?.name || '',
      roleIds: user?.roles?.map((r) => r.id) || [],
      emailVerified: user?.emailVerified || false,
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        password: '',
        name: user.name,
        roleIds: user.roles?.map((r) => r.id) || [],
        emailVerified: user.emailVerified,
      });
    } else {
      form.reset({
        username: '',
        email: '',
        password: '',
        name: '',
        roleIds: [],
        emailVerified: false,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (isEdit) {
        const updateData: UserUpdateData = {
          name: values.name,
          roleIds: values.roleIds,
        };
        if (values.password) {
          updateData.password = values.password;
        }
        await onSubmit(updateData);
      } else {
        const createData: UserCreateData = {
          username: values.username,
          email: values.email,
          password: values.password || '',
          name: values.name,
          roleIds: values.roleIds,
          emailVerified: values.emailVerified,
        };
        await onSubmit(createData);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin người dùng. Để trống mật khẩu nếu không muốn thay đổi.'
              : 'Nhập thông tin người dùng mới. Các trường có dấu * là bắt buộc.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isEdit} placeholder="johndoe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isEdit} type="email" placeholder="john@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nguyễn Văn A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="••••••••" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleIds"
              render={() => (
                <FormItem>
                  <FormLabel>Vai trò</FormLabel>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {roles.map((role) => (
                      <FormField
                        key={role.id}
                        control={form.control}
                        name="roleIds"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(role.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, role.id]);
                                  } else {
                                    field.onChange(current.filter((id) => id !== role.id));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {role.displayName}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEdit && (
              <FormField
                control={form.control}
                name="emailVerified"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Đánh dấu email đã xác thực
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
