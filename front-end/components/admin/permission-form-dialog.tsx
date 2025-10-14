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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PermissionItem, PermissionCreateData, PermissionUpdateData } from '@/types/permission-management';

const permissionFormSchema = z.object({
  name: z.string().min(2, 'Tên quyền phải có ít nhất 2 ký tự'),
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự'),
  resourceType: z.string().min(2, 'Loại tài nguyên phải có ít nhất 2 ký tự'),
  action: z.string().min(2, 'Hành động phải có ít nhất 2 ký tự'),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

interface PermissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission?: PermissionItem | null;
  onSubmit: (data: PermissionCreateData | PermissionUpdateData) => Promise<void>;
  isLoading?: boolean;
}

export function PermissionFormDialog({
  open,
  onOpenChange,
  permission,
  onSubmit,
  isLoading,
}: PermissionFormDialogProps) {
  const isEdit = !!permission;

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: permission?.name || '',
      displayName: permission?.displayName || '',
      resourceType: permission?.resourceType || '',
      action: permission?.action || '',
    },
  });

  React.useEffect(() => {
    if (permission) {
      form.reset({
        name: permission.name,
        displayName: permission.displayName,
        resourceType: permission.resourceType,
        action: permission.action,
      });
    } else {
      form.reset({
        name: '',
        displayName: '',
        resourceType: '',
        action: '',
      });
    }
  }, [permission, form]);

  const handleSubmit = async (values: PermissionFormValues) => {
    try {
      if (isEdit) {
        const updateData: PermissionUpdateData = {
          displayName: values.displayName,
        };
        await onSubmit(updateData);
      } else {
        const createData: PermissionCreateData = {
          name: values.name,
          displayName: values.displayName,
          resourceType: values.resourceType,
          action: values.action,
        };
        await onSubmit(createData);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Lỗi khi lưu quyền:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa quyền' : 'Thêm quyền mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật tên hiển thị của quyền. Không thể thay đổi các trường khác.'
              : 'Nhập thông tin quyền mới. Các trường có dấu * là bắt buộc.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên quyền * (Dùng cho code)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isEdit} placeholder="user:read" />
                  </FormControl>
                  <FormDescription>
                    Tên duy nhất, định dạng: resource_type:action (VD: user:read, user:write)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Xem thông tin người dùng" />
                  </FormControl>
                  <FormDescription>Tên hiển thị cho người dùng</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại tài nguyên *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isEdit} placeholder="user" />
                  </FormControl>
                  <FormDescription>Loại tài nguyên (VD: user, role, permission)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hành động *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isEdit} placeholder="read" />
                  </FormControl>
                  <FormDescription>Hành động (VD: read, write, delete, update)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
