package com.nemisolv.starter.helper;

import com.nemisolv.starter.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Component;



@Component
@RequiredArgsConstructor
public class HashingHelper {
    private final AppProperties appProperties;
    public String createHashWithSecretKey(String input) {
        return DigestUtils.sha256Hex(input + appProperties.getSecure().getSecretKey());
    }
}
