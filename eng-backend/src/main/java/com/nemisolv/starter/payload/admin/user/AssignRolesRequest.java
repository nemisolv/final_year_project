package com.nemisolv.starter.payload.admin.user;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

/**
 * Request DTO for assigning roles to user
 */
@Data
public class AssignRolesRequest {

    /**
     * Danh sách role IDs cần gán cho user
     * Phải có ít nhất 1 role
     */
    @NotEmpty(message = "Phải có ít nhất một role")
    private Set<Long> roleIds;

    /**
     * Replace mode:
     * - true: Thay thế toàn bộ roles hiện tại
     * - false: Thêm vào roles hiện tại
     * Default: true
     */
    private Boolean replace = true;
}
