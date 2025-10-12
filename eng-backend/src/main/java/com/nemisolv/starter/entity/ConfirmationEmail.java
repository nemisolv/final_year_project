package com.nemisolv.starter.entity;

import com.nemisolv.starter.util.DbUtil;
import lombok.Builder;
import lombok.Data;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

@Builder
@Data
public class ConfirmationEmail {
    private Long id;
    private String userIdentifier;
    private String token;
//    private MailType type;
    private boolean revoked;
    private LocalDateTime expiredAt;

    public static  ConfirmationEmail fromRs(ResultSet rs) throws SQLException {
        return ConfirmationEmail.builder()
                .id(rs.getLong("id"))
                .userIdentifier(rs.getString("user_identifier"))
                .token(rs.getString("token"))
                .revoked(rs.getBoolean("revoked"))
                .expiredAt(DbUtil.toLocalDatetime(rs.getTimestamp("expired_at")))
                .build();
    }
}
