package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.payload.admin.permission.*;
import com.nemisolv.starter.service.PermissionManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/permissions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class PermissionManagementController {

    private final PermissionManagementService permissionManagementService;

    @GetMapping
    public ApiResponse<List<PermissionResponse>> getAllPermissions() {
        List<PermissionResponse> permissions = permissionManagementService.getAllPermissions();
        return ApiResponse.success(permissions);
    }

    @GetMapping("/{id}")
    public ApiResponse<PermissionResponse> getPermissionById(@PathVariable Long id) {
        PermissionResponse permission = permissionManagementService.getPermissionById(id);
        return ApiResponse.success(permission);
    }

    @GetMapping("/by-resource/{resourceType}")
    public ApiResponse<List<PermissionResponse>> getPermissionsByResource(
            @PathVariable String resourceType) {
        List<PermissionResponse> permissions = permissionManagementService
                .getPermissionsByResourceType(resourceType);
        return ApiResponse.success(permissions);
    }

    @PostMapping
    public ApiResponse<PermissionResponse> createPermission(
            @Valid @RequestBody PermissionCreateRequest request) {
        PermissionResponse created = permissionManagementService.createPermission(request);
        return ApiResponse.success(created);
    }

    @PutMapping("/{id}")
    public ApiResponse<PermissionResponse> updatePermission(
            @PathVariable Long id,
            @Valid @RequestBody PermissionUpdateRequest request) {
        PermissionResponse updated = permissionManagementService.updatePermission(id, request);
        return ApiResponse.success(updated);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePermission(@PathVariable Long id) {
        permissionManagementService.deletePermission(id);
        return ApiResponse.success(null);
    }
}
