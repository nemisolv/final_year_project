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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RoleDetail, RoleCreateData, RoleUpdateData } from '@/types/role-management';
import { PermissionItem } from '@/types/permission-management';

const roleFormSchema = z.object({
  name: z.string().min(2, 'Tên vai trò phải có ít nhất 2 ký tự').max(50),
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự').max(100),
  description: z.string().optional(),
  permissionIds: z.array(z.number()).optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: RoleDetail | null;
  permissions: PermissionItem[];
  onSubmit: (data: RoleCreateData | RoleUpdateData) => Promise<void>;
  isLoading?: boolean;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  permissions,
  onSubmit,
  isLoading,
}: RoleFormDialogProps) {
  const isEdit = !!role;

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || '',
      displayName: role?.displayName || '',
      description: role?.description || '',
      permissionIds: role?.permissions?.map((p) => p.id) || [],
    },
  });

  React.useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
        permissionIds: role.permissions?.map((p) => p.id) || [],
      });
    } else {
      form.reset({
        name: '',
        displayName: '',
        description: '',
        permissionIds: [],
      });
    }
  }, [role, form]);

  const handleSubmit = async (values: RoleFormValues) => {
    try {
      const data = {
        name: values.name,
        displayName: values.displayName,
        description: values.description,
        permissionIds: values.permissionIds,
      };
      await onSubmit(data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Lỗi khi lưu vai trò:', error);
    }
  };

  const groupedPermissions = React.useMemo(() => {
    const grouped: Record<string, PermissionItem[]> = {};
    permissions.forEach((perm) => {
      if (!grouped[perm.resourceType]) {
        grouped[perm.resourceType] = [];
      }
      grouped[perm.resourceType].push(perm);
    });
    return grouped;
  }, [permissions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin vai trò và phân quyền.'
              : 'Nhập thông tin vai trò mới. Các trường có dấu * là bắt buộc.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên vai trò * (Dùng cho code)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="MANAGER" />
                  </FormControl>
                  <FormDescription>Tên duy nhất, chỉ chứa chữ cái in hoa và dấu gạch dưới</FormDescription>
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
                    <Input {...field} placeholder="Quản lý" />
                  </FormControl>
                  <FormDescription>Tên hiển thị cho người dùng</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Mô tả vai trò..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissionIds"
              render={() => (
                <FormItem>
                  <FormLabel>Phân quyền</FormLabel>
                  <div className="space-y-4 max-h-80 overflow-y-auto border rounded-md p-4">
                    {Object.entries(groupedPermissions).map(([resourceType, perms]) => (
                      <div key={resourceType} className="space-y-2">
                        <h4 className="font-semibold text-sm">{resourceType}</h4>
                        <div className="grid grid-cols-2 gap-2 pl-4">
                          {perms.map((perm) => (
                            <FormField
                              key={perm.id}
                              control={form.control}
                              name="permissionIds"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(perm.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, perm.id]);
                                        } else {
                                          field.onChange(current.filter((id) => id !== perm.id));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm cursor-pointer">
                                    {perm.displayName}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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
