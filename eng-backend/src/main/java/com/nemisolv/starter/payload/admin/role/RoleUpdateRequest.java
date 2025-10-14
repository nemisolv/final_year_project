package com.nemisolv.starter.payload.admin.role;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

/**
 * Request DTO for updating role
 * Chỉ update các field không null
 */
@Data
public class RoleUpdateRequest {

    /**
     * Role name mới - phải unique
     */
    @Size(min = 2, max = 50, message = "Tên role phải từ 2-50 ký tự")
    private String name;

    /**
     * Display name mới
     */
    @Size(max = 100, message = "Tên hiển thị tối đa 100 ký tự")
    private String displayName;

    /**
     * Mô tả role
     */
    private String description;

    /**
     * Danh sách permission IDs mới
     * Nếu provided, sẽ replace toàn bộ permissions hiện tại
     */
    private Set<Long> permissionIds;
}
