package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.payload.admin.AdminUserRequest;
import com.nemisolv.starter.payload.admin.AdminUserResponse;
import com.nemisolv.starter.payload.admin.ToggleUserStatusRequest;
import com.nemisolv.starter.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ApiResponse<Page<AdminUserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort
    ) {
        Pageable pageable;
        if (sort != null && !sort.isEmpty()) {
            String[] sortParams = sort.split(",");
            String sortField = sortParams[0];
            Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
            pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        } else {
            pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        Page<AdminUserResponse> users = adminService.getAllUsers(pageable);
        return ApiResponse.success(users);
    }

    @GetMapping("/users/{id}")
    public ApiResponse<AdminUserResponse> getUserById(@PathVariable String id) {
        AdminUserResponse user = adminService.getUserById(id);
        return ApiResponse.success(user);
    }

    @PostMapping("/users")
    public ApiResponse<AdminUserResponse> createUser(@RequestBody AdminUserRequest request) {
        AdminUserResponse user = adminService.createUser(request);
        return ApiResponse.success(user);
    }

    @PutMapping("/users/{id}")
    public ApiResponse<AdminUserResponse> updateUser(
            @PathVariable String id,
            @RequestBody AdminUserRequest request
    ) {
        AdminUserResponse user = adminService.updateUser(id, request);
        return ApiResponse.success(user);
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable String id) {
        adminService.deleteUser(id);
        return ApiResponse.success(null);
    }

    @PatchMapping("/users/{id}/status")
    public ApiResponse<AdminUserResponse> toggleUserStatus(
            @PathVariable String id,
            @RequestBody ToggleUserStatusRequest request
    ) {
        AdminUserResponse user = adminService.toggleUserStatus(id, request.isEnabled());
        return ApiResponse.success(user);
    }
}
