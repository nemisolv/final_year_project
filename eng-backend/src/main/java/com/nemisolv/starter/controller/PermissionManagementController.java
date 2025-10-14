package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ResponseMessage;
import com.nemisolv.starter.payload.admin.permission.*;
import com.nemisolv.starter.service.PermissionManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class PermissionManagementController {

    private final PermissionManagementService permissionManagementService;

    @GetMapping
    public ResponseEntity<ResponseMessage<List<PermissionResponse>>> getAllPermissions() {
        List<PermissionResponse> permissions = permissionManagementService.getAllPermissions();
        return ResponseEntity.ok(ResponseMessage.success(permissions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseMessage<PermissionResponse>> getPermissionById(@PathVariable Long id) {
        PermissionResponse permission = permissionManagementService.getPermissionById(id);
        return ResponseEntity.ok(ResponseMessage.success(permission));
    }

    @GetMapping("/by-resource/{resourceType}")
    public ResponseEntity<ResponseMessage<List<PermissionResponse>>> getPermissionsByResource(
            @PathVariable String resourceType) {
        List<PermissionResponse> permissions = permissionManagementService
                .getPermissionsByResourceType(resourceType);
        return ResponseEntity.ok(ResponseMessage.success(permissions));
    }

    @PostMapping
    public ResponseEntity<ResponseMessage<PermissionResponse>> createPermission(
            @Valid @RequestBody PermissionCreateRequest request) {
        PermissionResponse created = permissionManagementService.createPermission(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseMessage.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseMessage<PermissionResponse>> updatePermission(
            @PathVariable Long id,
            @Valid @RequestBody PermissionUpdateRequest request) {
        PermissionResponse updated = permissionManagementService.updatePermission(id, request);
        return ResponseEntity.ok(ResponseMessage.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseMessage<Void>> deletePermission(@PathVariable Long id) {
        permissionManagementService.deletePermission(id);
        return ResponseEntity.ok(ResponseMessage.success(null));
    }
}
