package com.nemisolv.starter.troubleshoot;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Slf4j
public class DatasourceVerifier {
    private final JdbcTemplate mariadbJdbcTemplate;

    public void logCurrentDatasourceHostname() {

        try {
            // Get datasource URL from the actual connection
            String url = mariadbJdbcTemplate.queryForObject("SELECT @@hostname as hostname, DATABASE() as database_name",
                    (rs, rowNum) -> rs.getString("hostname") + "/" + rs.getString("database_name"));

            log.info("Verifying connection db: {}", url);

        } catch (Exception ex) {
            log.error("[DatasourceVerifier] Error verifying connection:", ex);
        }
    }
}
