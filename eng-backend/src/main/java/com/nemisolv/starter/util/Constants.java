package com.nemisolv.starter.util;

import java.time.LocalDateTime;

public class Constants {
//    public static final LocalDateTime EXP_TIME_REGISTRATION_EMAIL= LocalDateTime.now().plusMinutes(3);
    public static final LocalDateTime EXP_TIME_PASSWORD_RESET = LocalDateTime.now().plusMinutes(10);


    public static final int OTP_LENGTH = 6;




    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String TIME_FORMAT = "HH:mm:ss";
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";




    public static final String CLIENT_BASE_URL = "http://localhost:3000";

    public static final String VERIFICATION_EMAIL_URL = CLIENT_BASE_URL + "/auth/verify-email?token=";
    public static final String PASSWORD_RESET_URL = CLIENT_BASE_URL + "/auth/reset-password?token=";


}
