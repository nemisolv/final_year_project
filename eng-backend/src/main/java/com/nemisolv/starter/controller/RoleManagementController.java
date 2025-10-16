package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.payload.PagedResponse;
import com.nemisolv.starter.payload.admin.permission.PermissionResponse;
import com.nemisolv.starter.payload.admin.role.*;
import com.nemisolv.starter.service.RoleManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.nemisolv.starter.pagination.Pageable;
import com.nemisolv.starter.pagination.Sort;
import com.nemisolv.starter.pagination.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RoleManagementController {

    private final RoleManagementService roleManagementService;

    @GetMapping
    public ApiResponse<PagedResponse<RoleResponse>> getAllRoles(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<RoleResponse> roles = roleManagementService.getAllRoles(pageable);
        return ApiResponse.success(roles);
    }

    @GetMapping("/{id}")
    public ApiResponse<RoleResponse> getRoleById(@PathVariable Long id) {
        RoleResponse role = roleManagementService.getRoleById(id);
        return ApiResponse.success(role);
    }

    @PostMapping
    public ApiResponse<RoleResponse> createRole(
            @Valid @RequestBody RoleCreateRequest request) {
        RoleResponse created = roleManagementService.createRole(request);
        return ApiResponse.success(created);
    }

    @PutMapping("/{id}")
    public ApiResponse<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {
        RoleResponse updated = roleManagementService.updateRole(id, request);
        return ApiResponse.success(updated);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRole(@PathVariable Long id) {
        roleManagementService.deleteRole(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}/permissions")
    public ApiResponse<List<PermissionResponse>> getRolePermissions(
            @PathVariable Long id) {
        List<PermissionResponse> permissions = roleManagementService.getRolePermissions(id);
        return ApiResponse.success(permissions);
    }

    @PostMapping("/{id}/permissions")
    public ApiResponse<RoleResponse> assignPermissions(
            @PathVariable Long id,
            @Valid @RequestBody AssignPermissionsRequest request) {
        RoleResponse updated = roleManagementService.assignPermissions(id, request);
        return ApiResponse.success(updated);
    }

    @DeleteMapping("/{id}/permissions")
    public ApiResponse<RoleResponse> removePermissions(
            @PathVariable Long id,
            @RequestBody Set<Long> permissionIds) {
        RoleResponse updated = roleManagementService.removePermissions(id, permissionIds);
        return ApiResponse.success(updated);
    }
}
