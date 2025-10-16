package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.payload.PagedResponse;
import com.nemisolv.starter.payload.admin.user.*;
import com.nemisolv.starter.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.nemisolv.starter.pagination.Pageable;
import com.nemisolv.starter.pagination.Sort;
import com.nemisolv.starter.pagination.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    public ApiResponse<PagedResponse<UserListResponse>> getAllUsers(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<UserListResponse> users = userManagementService.getAllUsers(pageable);
        return ApiResponse.success(users);
    }

    @GetMapping("/search")
    public ApiResponse<PagedResponse<UserListResponse>> searchUsers(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<UserListResponse> users = userManagementService.searchUsers(keyword, pageable);
        return ApiResponse.success(users);
    }

    @GetMapping("/{id}")
    public ApiResponse<UserDetailResponse> getUserById(@PathVariable Long id) {
        UserDetailResponse user = userManagementService.getUserById(id);
        return ApiResponse.success(user);
    }

    @PostMapping
    public ApiResponse<UserDetailResponse> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        UserDetailResponse created = userManagementService.createUser(request);
        return ApiResponse.success(created);
    }

    @PutMapping("/{id}")
    public ApiResponse<UserDetailResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserDetailResponse updated = userManagementService.updateUser(id, request);
        return ApiResponse.success(updated);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/{id}/roles")
    public ApiResponse<UserDetailResponse> assignRoles(
            @PathVariable Long id,
            @Valid @RequestBody AssignRolesRequest request) {
        UserDetailResponse updated = userManagementService.assignRoles(id, request);
        return ApiResponse.success(updated);
    }

    @DeleteMapping("/{id}/roles")
    public ApiResponse<UserDetailResponse> removeRoles(
            @PathVariable Long id,
            @RequestBody Set<Long> roleIds) {
        UserDetailResponse updated = userManagementService.removeRoles(id, roleIds);
        return ApiResponse.success(updated);
    }

    @PatchMapping("/{id}/activate")
    public ApiResponse<UserDetailResponse> activateUser(@PathVariable Long id) {
        UserDetailResponse updated = userManagementService.activateUser(id);
        return ApiResponse.success(updated);
    }

    @PatchMapping("/{id}/deactivate")
    public ApiResponse<UserDetailResponse> deactivateUser(@PathVariable Long id) {
        UserDetailResponse updated = userManagementService.deactivateUser(id);
        return ApiResponse.success(updated);
    }
}
