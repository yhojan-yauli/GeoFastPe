package com.goeFast.GeoFastPe.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secret,
        long expirationMs
) {

    public JwtProperties {
        if (expirationMs <= 0) {
            throw new IllegalArgumentException("app.jwt.expiration-ms debe ser mayor que 0");
        }
    }
}
