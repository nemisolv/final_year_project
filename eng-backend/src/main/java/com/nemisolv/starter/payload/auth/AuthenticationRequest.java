package com.nemisolv.starter.payload.auth;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record AuthenticationRequest (
    @NotBlank(message = "Email can not be empty") String email,
    @Length(min = 6, message = "Password must be at least 6 characters") String password
){
}
