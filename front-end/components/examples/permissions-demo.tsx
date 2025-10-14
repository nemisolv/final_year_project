/**
 * Permission System Demo Component
 *
 * This component demonstrates how to use the permission system
 * in your application.
 */

'use client';

import { usePermissions } from '@/hooks';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function PermissionsDemo() {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasResourcePermission,
    getAllPermissions,
    getPermissionsByResource,
    isAdmin,
  } = usePermissions();

  const allPermissions = getAllPermissions();
  const permissionsByResource = getPermissionsByResource();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Permissions System Demo</h1>

      {/* Admin Check */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isAdmin() ? (
            <Badge className="bg-green-500">You are an Admin</Badge>
          ) : (
            <Badge variant="secondary">Regular User</Badge>
          )}
        </CardContent>
      </Card>

      {/* Single Permission Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Single Permission Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Can create courses?</span>
            <Badge variant={hasPermission('course.create') ? 'default' : 'secondary'}>
              {hasPermission('course.create') ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Can delete users?</span>
            <Badge variant={hasPermission('user.delete') ? 'default' : 'secondary'}>
              {hasPermission('user.delete') ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Can update profile?</span>
            <Badge variant={hasPermission('profile.update') ? 'default' : 'secondary'}>
              {hasPermission('profile.update') ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Multiple Permission Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Multiple Permission Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Can manage courses? (any of: create, update, delete)</span>
            <Badge
              variant={
                hasAnyPermission(['course.create', 'course.update', 'course.delete'])
                  ? 'default'
                  : 'secondary'
              }
            >
              {hasAnyPermission(['course.create', 'course.update', 'course.delete'])
                ? 'Yes'
                : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Full course access? (all: create, read, update, delete)</span>
            <Badge
              variant={
                hasAllPermissions([
                  'course.create',
                  'course.read',
                  'course.update',
                  'course.delete',
                ])
                  ? 'default'
                  : 'secondary'
              }
            >
              {hasAllPermissions([
                'course.create',
                'course.read',
                'course.update',
                'course.delete',
              ])
                ? 'Yes'
                : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Resource-Based Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Resource-Based Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['course', 'lesson', 'user', 'profile'].map((resource) => (
              <div key={resource} className="border rounded p-3">
                <h4 className="font-semibold mb-2 capitalize">{resource}</h4>
                <div className="flex gap-2 flex-wrap">
                  {['create', 'read', 'update', 'delete'].map((action) => (
                    <Badge
                      key={action}
                      variant={
                        hasResourcePermission(resource, action) ? 'default' : 'secondary'
                      }
                    >
                      {action}: {hasResourcePermission(resource, action) ? '✓' : '✗'}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Permissions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Your Permissions ({allPermissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allPermissions.length > 0 ? (
              allPermissions.map((permission) => (
                <Badge key={permission} variant="outline">
                  {permission}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No permissions assigned</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions by Resource */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions by Resource</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.keys(permissionsByResource).length > 0 ? (
              Object.entries(permissionsByResource).map(([resource, actions]) => (
                <div key={resource} className="border rounded p-3">
                  <h4 className="font-semibold mb-2 capitalize">{resource}</h4>
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action) => (
                      <Badge key={action}>{action}</Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No permissions assigned</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditional Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Conditional Action Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {hasPermission('course.create') && (
              <Button>Create Course</Button>
            )}
            {hasPermission('course.update') && (
              <Button variant="outline">Edit Course</Button>
            )}
            {hasPermission('course.delete') && (
              <Button variant="destructive">Delete Course</Button>
            )}
            {hasPermission('user.create') && (
              <Button>Create User</Button>
            )}
            {hasPermission('system.monitor') && (
              <Button variant="secondary">System Monitor</Button>
            )}
            {isAdmin() && (
              <Button variant="default">Admin Panel</Button>
            )}
          </div>
          {!hasPermission('course.create') &&
            !hasPermission('course.update') &&
            !hasPermission('course.delete') &&
            !hasPermission('user.create') &&
            !hasPermission('system.monitor') &&
            !isAdmin() && (
              <p className="text-muted-foreground mt-4">
                You don't have permission to perform any actions
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}