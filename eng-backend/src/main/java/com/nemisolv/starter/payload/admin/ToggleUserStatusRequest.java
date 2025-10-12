package com.nemisolv.starter.payload.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ToggleUserStatusRequest {
    private boolean enabled;
}
