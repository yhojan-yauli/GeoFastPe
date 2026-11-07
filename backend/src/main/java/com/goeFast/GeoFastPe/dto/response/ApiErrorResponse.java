package com.goeFast.GeoFastPe.dto.response;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
        int status,
        String code,
        String message,
        Instant timestamp,
        List<String> details
) {

    public static ApiErrorResponse of(int status, String code, String message) {
        return new ApiErrorResponse(status, code, message, Instant.now(), List.of());
    }

    public static ApiErrorResponse of(int status, String code, String message, List<String> details) {
        return new ApiErrorResponse(status, code, message, Instant.now(), details);
    }
}
