package com.nemisolv.starter.payload.admin.permission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for creating a new permission
 */
@Data
public class PermissionCreateRequest {

    /**
     * Permission name - format: RESOURCE_ACTION (vd: USER_CREATE)
     * Phải unique trong hệ thống
     */
    @NotBlank(message = "Tên permission không được để trống")
    @Size(min = 3, max = 100, message = "Tên permission phải từ 3-100 ký tự")
    private String name;

    /**
     * Display name - hiển thị cho người dùng
     */
    @NotBlank(message = "Tên hiển thị không được để trống")
    @Size(max = 150, message = "Tên hiển thị tối đa 150 ký tự")
    private String displayName;

    /**
     * Resource type - loại tài nguyên (USER, COURSE, LESSON, etc.)
     */
    @NotBlank(message = "Resource type không được để trống")
    @Size(max = 50, message = "Resource type tối đa 50 ký tự")
    private String resourceType;

    /**
     * Action - hành động (CREATE, READ, UPDATE, DELETE)
     */
    @NotBlank(message = "Action không được để trống")
    @Size(max = 50, message = "Action tối đa 50 ký tự")
    private String action;
}
