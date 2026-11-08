package com.goeFast.GeoFastPe.dto.response;

public record OtpSentResponse(
        String message,
        long expiresInSeconds,
        String devCode
) {
}
