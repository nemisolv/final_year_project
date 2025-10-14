package com.nemisolv.starter.payload.admin.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

/**
 * Request DTO for creating a new user
 * Admin có thể tạo user với roles được chỉ định
 */
@Data
public class UserCreateRequest {

    /**
     * Username - phải unique trong hệ thống
     */
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;

    /**
     * Email - phải unique và đúng format
     */
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    /**
     * Password - yêu cầu độ mạnh tối thiểu
     */
    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, message = "Password phải có ít nhất 6 ký tự")
    private String password;

    /**
     * Full name của user
     */
    @NotBlank(message = "Tên không được để trống")
    private String name;

    /**
     * Danh sách role IDs được gán cho user
     * Nếu null hoặc empty, sẽ gán role USER mặc định
     */
    private Set<Long> roleIds;

    /**
     * User status: ACTIVE, INACTIVE, SUSPENDED
     * Mặc định là ACTIVE
     */
    private String status;

    /**
     * Email verification status
     * Admin có thể tạo user với email đã verified
     */
    private Boolean emailVerified;
}
