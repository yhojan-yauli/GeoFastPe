package com.goeFast.GeoFastPe.security;

import com.goeFast.GeoFastPe.entity.Role;

public record UserPrincipal(
        Long id,
        String phone,
        Role role
) {
}
