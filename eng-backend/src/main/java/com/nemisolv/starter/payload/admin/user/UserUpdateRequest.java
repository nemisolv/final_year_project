package com.nemisolv.starter.payload.admin.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

/**
 * Request DTO for updating user information
 * Chỉ cập nhật các field không null
 */
@Data
public class UserUpdateRequest {

    /**
     * Username mới - phải unique
     */
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;

    /**
     * Email mới - phải unique và đúng format
     */
    @Email(message = "Email không đúng định dạng")
    private String email;

    /**
     * Password mới - nếu muốn thay đổi password
     */
    @Size(min = 6, message = "Password phải có ít nhất 6 ký tự")
    private String password;

    /**
     * Full name
     */
    private String name;

    /**
     * User status: ACTIVE, INACTIVE, SUSPENDED
     */
    private String status;

    /**
     * Email verification status
     */
    private Boolean emailVerified;

    /**
     * Danh sách role IDs mới
     * Nếu provided, sẽ replace toàn bộ roles hiện tại
     */
    private Set<Long> roleIds;
}
