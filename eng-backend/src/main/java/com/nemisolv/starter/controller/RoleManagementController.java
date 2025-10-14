package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ResponseMessage;
import com.nemisolv.starter.payload.admin.permission.PermissionResponse;
import com.nemisolv.starter.payload.admin.role.*;
import com.nemisolv.starter.service.RoleManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RoleManagementController {

    private final RoleManagementService roleManagementService;

    @GetMapping
    public ResponseEntity<ResponseMessage<Page<RoleResponse>>> getAllRoles(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<RoleResponse> roles = roleManagementService.getAllRoles(pageable);
        return ResponseEntity.ok(ResponseMessage.success(roles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseMessage<RoleResponse>> getRoleById(@PathVariable Long id) {
        RoleResponse role = roleManagementService.getRoleById(id);
        return ResponseEntity.ok(ResponseMessage.success(role));
    }

    @PostMapping
    public ResponseEntity<ResponseMessage<RoleResponse>> createRole(
            @Valid @RequestBody RoleCreateRequest request) {
        RoleResponse created = roleManagementService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseMessage.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseMessage<RoleResponse>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {
        RoleResponse updated = roleManagementService.updateRole(id, request);
        return ResponseEntity.ok(ResponseMessage.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseMessage<Void>> deleteRole(@PathVariable Long id) {
        roleManagementService.deleteRole(id);
        return ResponseEntity.ok(ResponseMessage.success(null));
    }

    @GetMapping("/{id}/permissions")
    public ResponseEntity<ResponseMessage<List<PermissionResponse>>> getRolePermissions(
            @PathVariable Long id) {
        List<PermissionResponse> permissions = roleManagementService.getRolePermissions(id);
        return ResponseEntity.ok(ResponseMessage.success(permissions));
    }

    @PostMapping("/{id}/permissions")
    public ResponseEntity<ResponseMessage<RoleResponse>> assignPermissions(
            @PathVariable Long id,
            @Valid @RequestBody AssignPermissionsRequest request) {
        RoleResponse updated = roleManagementService.assignPermissions(id, request);
        return ResponseEntity.ok(ResponseMessage.success(updated));
    }

    @DeleteMapping("/{id}/permissions")
    public ResponseEntity<ResponseMessage<RoleResponse>> removePermissions(
            @PathVariable Long id,
            @RequestBody Set<Long> permissionIds) {
        RoleResponse updated = roleManagementService.removePermissions(id, permissionIds);
        return ResponseEntity.ok(ResponseMessage.success(updated));
    }
}
