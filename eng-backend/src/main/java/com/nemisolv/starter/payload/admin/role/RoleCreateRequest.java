package com.nemisolv.starter.payload.admin.role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

/**
 * Request DTO for creating a new role
 */
@Data
public class RoleCreateRequest {

    /**
     * Role name - phải unique, uppercase (vd: ADMIN, TEACHER)
     */
    @NotBlank(message = "Tên role không được để trống")
    @Size(min = 2, max = 50, message = "Tên role phải từ 2-50 ký tự")
    private String name;

    /**
     * Display name - hiển thị cho người dùng
     */
    @NotBlank(message = "Tên hiển thị không được để trống")
    @Size(max = 100, message = "Tên hiển thị tối đa 100 ký tự")
    private String displayName;

    /**
     * Mô tả role
     */
    private String description;

    /**
     * Danh sách permission IDs cho role này
     * Có thể null khi tạo, gán permissions sau
     */
    private Set<Long> permissionIds;
}
