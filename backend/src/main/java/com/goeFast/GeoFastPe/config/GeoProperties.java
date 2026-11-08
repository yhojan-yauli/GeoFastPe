package com.goeFast.GeoFastPe.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.geo")
public record GeoProperties(
        String nominatimBaseUrl,
        String openMeteoBaseUrl,
        String routingBaseUrl,
        String userAgent
) {
}
