package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.User;

import java.time.Instant;

public record UserResponse(
        Long id,
        String phone,
        String fullName,
        String role,
        boolean phoneVerified,
        boolean active,
        Instant createdAt,
        Instant lastLoginAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getPhone(),
                user.getFullName(),
                user.getRole().name(),
                user.isPhoneVerified(),
                user.isActive(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
