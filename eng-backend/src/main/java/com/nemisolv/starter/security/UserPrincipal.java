package com.nemisolv.starter.security;

import com.nemisolv.starter.entity.Role;
import com.nemisolv.starter.entity.User;
import com.nemisolv.starter.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

/**
 * Spring Security UserDetails implementation
 * - Integrates with Spring Security OAuth2 Resource Server
 * - Provides user information for authentication
 */
@Data
@AllArgsConstructor
@Builder
public class UserPrincipal implements UserDetails {
    
    private Integer id;
    private String email;
    private String password;
    private boolean enabled;
    private Map<String, List<String>> rolePermissionsMap;
    private Set<String> roles;
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    private Collection<SimpleGrantedAuthority> authorities;
    
    public static UserPrincipal create(User user,  Map<String, List<String>> rolePermissionsMap) {
        Set<String> roles = rolePermissionsMap.keySet();
        List<SimpleGrantedAuthority> authorities = roles.stream()
                .map(SimpleGrantedAuthority::new)
                .toList();


        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password( user.getHashedPassword() != null ? user.getHashedPassword() : "")
                .rolePermissionsMap(rolePermissionsMap)
                .roles(roles)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .authorities(authorities).build();
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities != null ? authorities : Collections.emptyList();
    }
}
