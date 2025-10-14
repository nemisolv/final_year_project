package com.nemisolv.starter.payload.admin.role;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

/**
 * Request DTO for assigning permissions to role
 */
@Data
public class AssignPermissionsRequest {

    /**
     * Danh sách permission IDs cần gán cho role
     */
    @NotEmpty(message = "Phải có ít nhất một permission")
    private Set<Long> permissionIds;

    /**
     * Replace mode:
     * - true: Thay thế toàn bộ permissions hiện tại
     * - false: Thêm vào permissions hiện tại
     * Default: true
     */
    private Boolean replace = true;
}
