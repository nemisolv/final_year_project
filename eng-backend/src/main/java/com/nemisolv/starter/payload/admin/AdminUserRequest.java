package com.nemisolv.starter.payload.admin;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AdminUserRequest {
    private String email;
    private String password;
    private String username;
    private String fullName;
    private String phoneNumber;
    private List<String> roles;
}
