package com.nemisolv.starter.payload.admin.permission;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for updating permission
 * Chỉ update display name (name, resourceType, action không nên thay đổi)
 */
@Data
public class PermissionUpdateRequest {

    /**
     * Display name mới
     */
    @Size(max = 150, message = "Tên hiển thị tối đa 150 ký tự")
    private String displayName;

    /**
     * Note: Không cho phép update name, resourceType, action
     * vì có thể ảnh hưởng đến logic phân quyền
     */
}
