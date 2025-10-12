package com.nemisolv.starter.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.sql.DataSource;

@Configuration
@RequiredArgsConstructor
public class JdbcConfig {
    private final PersistenceProperties persistenceProperties;

    @Bean(name = "mariadbDataSource")
    public DataSource mariadbDataSource() {
        PersistenceProperties.Mariadb mariadb = persistenceProperties.getMariadb();
        try {
            HikariDataSource dataSource = new HikariDataSource();
            dataSource.setJdbcUrl(mariadb.getUrl());
            dataSource.setUsername(mariadb.getUsername());
            dataSource.setPassword(mariadb.getPassword());
            dataSource.setDriverClassName(mariadb.getDriverClassName());
            dataSource.setPoolName(mariadb.getPoolName());
            dataSource.setMaximumPoolSize(mariadb.getPoolSize());
            dataSource.setMaxLifetime(mariadb.getMaxLifetime());
            dataSource.setMinimumIdle(mariadb.getMinIdle());
            return dataSource;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create MariaDB data source", e);
        }
    }

    @Bean(name = "mariadbJdbcTemplate")
    public JdbcTemplate mariadbJdbcTemplate(@Qualifier("mariadbDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean(name = "namedParameterJdbcTemplate")
    public NamedParameterJdbcTemplate namedParameterJdbcTemplate(@Qualifier("mariadbDataSource") DataSource dataSource) {
        return new NamedParameterJdbcTemplate(dataSource);
    }
}

