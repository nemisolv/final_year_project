package com.nemisolv.starter.payload.admin.permission;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Response DTO for permission information
 */
@Data
@Builder
public class PermissionResponse {

    private Long id;
    private String name;
    private String displayName;
    private String resourceType;
    private String action;
    private LocalDateTime createdAt;

    /**
     * Số lượng roles đang sử dụng permission này
     */
    private Long roleCount;

    /**
     * Có thể xóa permission này không
     * (không thể xóa nếu đang được sử dụng bởi system roles)
     */
    private Boolean deletable;
}
