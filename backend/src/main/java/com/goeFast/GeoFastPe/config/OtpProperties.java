package com.goeFast.GeoFastPe.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.otp")
public record OtpProperties(
        String provider,
        long ttlSeconds,
        int maxAttempts,
        long resendCooldownSeconds,
        boolean exposeCode
) {
}
