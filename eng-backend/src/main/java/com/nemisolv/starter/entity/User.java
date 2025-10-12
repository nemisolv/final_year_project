package com.nemisolv.starter.entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.nemisolv.starter.enums.AuthProvider;
import com.nemisolv.starter.enums.RoleName;
import com.nemisolv.starter.enums.UserStatus;
import com.nemisolv.starter.enums.ValuableEnum;
import com.nemisolv.starter.util.DbUtil;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public  class User{
    private Integer id;
    private String username;
    private String hashedPassword;
    private String email;
    private UserStatus status;
    private AuthProvider authProvider;
    private boolean emailVerified;
    private LocalDateTime lastLogin;
    private boolean isOnboarded;
    
    // RBAC: Many-to-many relationship with Role
    @Builder.Default
    private Set<Role> roles = new HashSet<>();
    
    // Legacy field for backward compatibility
    private RoleName role;


    public static User fromRs(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setHashedPassword(rs.getString("password_hashed"));
        user.setAuthProvider(ValuableEnum.fromValue(AuthProvider.class,rs.getString("provider")));
        user.setEmailVerified(rs.getBoolean("email_verified"));
        user.setLastLogin(DbUtil.toLocalDatetime(rs.getTimestamp("last_login_at")));
        user.setStatus(ValuableEnum.fromValue(UserStatus.class,rs.getString("status")));
        return user;

    }
}
