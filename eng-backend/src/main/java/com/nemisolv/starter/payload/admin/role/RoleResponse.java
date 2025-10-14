package com.nemisolv.starter.payload.admin.role;

import com.nemisolv.starter.payload.admin.permission.PermissionResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for role information
 */
@Data
@Builder
public class RoleResponse {

    private Long id;
    private String name;
    private String displayName;
    private String description;
    private LocalDateTime createdAt;

    /**
     * Danh sách permissions của role
     * Null nếu không load permissions
     */
    private List<PermissionResponse> permissions;

    /**
     * Số lượng users có role này
     */
    private Long userCount;

    /**
     * Số lượng permissions
     */
    private Integer permissionCount;
}
