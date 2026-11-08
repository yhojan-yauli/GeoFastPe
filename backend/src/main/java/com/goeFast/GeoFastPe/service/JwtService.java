package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.config.JwtProperties;
import com.goeFast.GeoFastPe.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        byte[] secretBytes = properties.secret() == null
                ? new byte[0]
                : properties.secret().getBytes(StandardCharsets.UTF_8);

        if (secretBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 caracteres");
        }
        this.signingKey = Keys.hmacShaKeyFor(secretBytes);
    }

    public String generate(User user) {
        Instant now = Instant.now();
        Instant expiration = now.plusMillis(properties.expirationMs());

        var builder = Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration));

        if (user.getEmail() != null) {
            builder.claim("email", user.getEmail());
        }
        if (user.getPhone() != null) {
            builder.claim("phone", user.getPhone());
        }

        return builder.signWith(signingKey).compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token);
    }

    public long expirationInSeconds() {
        return properties.expirationMs() / 1000;
    }
}
