package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ResponseMessage;
import com.nemisolv.starter.payload.admin.user.*;
import com.nemisolv.starter.service.UserManagementService;
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

import java.util.Set;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<ResponseMessage<Page<UserListResponse>>> getAllUsers(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<UserListResponse> users = userManagementService.getAllUsers(pageable);
        return ResponseEntity.ok(ResponseMessage.success(users));
    }

    @GetMapping("/search")
    public ResponseEntity<ResponseMessage<Page<UserListResponse>>> searchUsers(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserListResponse> users = userManagementService.searchUsers(keyword, pageable);
        return ResponseEntity.ok(ResponseMessage.success(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseMessage<UserDetailResponse>> getUserById(@PathVariable Long id) {
        UserDetailResponse user = userManagementService.getUserById(id);
        return ResponseEntity.ok(ResponseMessage.success(user));
    }

    @PostMapping
    public ResponseEntity<ResponseMessage<UserDetailResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        UserDetailResponse created = userManagementService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseMessage.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseMessage<UserDetailResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserDetailResponse updated = userManagementService.updateUser(id, request);
        return ResponseEntity.ok(ResponseMessage.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseMessage<Void>> deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return ResponseEntity.ok(ResponseMessage.success(null));
    }

    @PostMapping("/{id}/roles")
    public ResponseEntity<ResponseMessage<UserDetailResponse>> assignRoles(
            @PathVariable Long id,
            @Valid @RequestBody AssignRolesRequest request) {
        UserDetailResponse updated = userManagementService.assignRoles(id, request);
        return ResponseEntity.ok(ResponseMessage.success(updated));
    }

    @DeleteMapping("/{id}/roles")
    public ResponseEntity<ResponseMessage<UserDetailResponse>> removeRoles(
            @PathVariable Long id,
            @RequestBody Set<Long> roleIds) {
        UserDetailResponse updated = userManagementService.removeRoles(id, roleIds);
        return ResponseEntity.ok(ResponseMessage.success(updated));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ResponseMessage<UserDetailResponse>> activateUser(@PathVariable Long id) {
        UserDetailResponse updated = userManagementService.activateUser(id);
        return ResponseEntity.ok(ResponseMessage.success(updated));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ResponseMessage<UserDetailResponse>> deactivateUser(@PathVariable Long id) {
        UserDetailResponse updated = userManagementService.deactivateUser(id);
        return ResponseEntity.ok(ResponseMessage.success(updated));
    }
}
