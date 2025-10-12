package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.ConfirmationEmail;
import com.nemisolv.starter.enums.MailType;
import com.nemisolv.starter.troubleshoot.DatasourceVerifier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@Slf4j
public class ConfirmationEmailRepository {

    private final JdbcTemplate mariadbJdbcTemplate;
    private final DatasourceVerifier datasourceVerifier;

    public ConfirmationEmailRepository(@Qualifier("mariadbJdbcTemplate") JdbcTemplate mariadbJdbcTemplate, DatasourceVerifier datasourceVerifier) {
        this.mariadbJdbcTemplate = mariadbJdbcTemplate;
        this.datasourceVerifier = datasourceVerifier;
    }


    public Optional<ConfirmationEmail> findByToken(String token) {
        String sql = "SELECT * FROM confirmation_email WHERE token = ? LIMIT 1";
        try {
            List<ConfirmationEmail> confirmationList = mariadbJdbcTemplate.query(sql, ((rs, rowNum) -> ConfirmationEmail.fromRs(rs)), token);
            return confirmationList.stream().findFirst();
        } catch (BadSqlGrammarException e) {
            log.error("Bad SQL statement: {}", e.getMessage());
            return Optional.empty();
        }
    }


    public void revokeAllByUserIdAndType(String email, MailType type) {
        String sql = "UPDATE confirmation_email SET revoked = true WHERE user_identifier = ? AND type = ?";
        try {
            mariadbJdbcTemplate.update(sql, email, type.getValue());
        } catch (BadSqlGrammarException e) {
            log.error("Bad SQL statement: {}", e.getMessage());
        }
    }


    public void generateVerificationEmail(String email, String token, LocalDateTime expTime) {
        String sql = "INSERT INTO confirmation_email (user_identifier, token, expired_at) VALUES (?, ?, ?)";
        try {
            mariadbJdbcTemplate.update(sql, email, token, Timestamp.valueOf(expTime));
        } catch (BadSqlGrammarException e) {
            log.error("Bad SQL statement: {}", e.getMessage());
        }
    }


    public void revokeToken(String token) {
        String sql = "UPDATE confirmation_email SET revoked = true WHERE token = ?";
        try {
            mariadbJdbcTemplate.update(sql, token);
            log.info("Successfully revoked token: {}", token);
        } catch (BadSqlGrammarException e) {
            log.error("Bad SQL statement: {}", e.getMessage());
        }
    }

    public void revokeAllTokensForUser(String email) {
        String sql = "UPDATE confirmation_email SET revoked = true WHERE user_identifier = ? AND revoked = false";
        try {
            int updated = mariadbJdbcTemplate.update(sql, email);
            if (updated > 0) {
                log.info("Successfully revoked {} tokens for user: {}", updated, email);
            }
        } catch (BadSqlGrammarException e) {
            log.error("Bad SQL statement: {}", e.getMessage());
        }
    }

}
