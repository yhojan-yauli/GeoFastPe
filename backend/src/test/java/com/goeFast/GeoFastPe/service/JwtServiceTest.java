package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.config.JwtProperties;
import com.goeFast.GeoFastPe.entity.Role;
import com.goeFast.GeoFastPe.entity.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService() {
        return new JwtService(new JwtProperties("test-secret-key-with-at-least-32-characters!!", 3_600_000L));
    }

    @Test
    void generaYValidaTokenConRolYTelefono() {
        User user = new User();
        user.setId(42L);
        user.setPhone("+51987654321");
        user.setRole(Role.ADMIN);

        JwtService service = jwtService();
        String token = service.generate(user);

        Claims claims = service.parse(token).getPayload();

        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.get("phone", String.class)).isEqualTo("+51987654321");
        assertThat(claims.get("role", String.class)).isEqualTo("ADMIN");
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    @Test
    void rechazaSecretMuyCorto() {
        assertThatThrownBy(() -> new JwtService(new JwtProperties("corto", 1000L)))
                .isInstanceOf(IllegalStateException.class);
    }
}
