package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.LoginRequest;
import com.goeFast.GeoFastPe.dto.request.RegisterRequest;
import com.goeFast.GeoFastPe.dto.response.AuthResponse;
import com.goeFast.GeoFastPe.dto.response.UserResponse;
import com.goeFast.GeoFastPe.entity.Role;
import com.goeFast.GeoFastPe.entity.User;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.UserRepository;
import com.goeFast.GeoFastPe.util.PhoneUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        String phone = normalizePhone(request.phone());

        if (email == null && phone == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "IDENTIFIER_REQUIRED",
                    "Debes registrar al menos un correo o un telefono."
            );
        }

        if (email != null && userRepository.existsByEmail(email)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "EMAIL_ALREADY_REGISTERED",
                    "El correo ya esta registrado. Inicia sesion."
            );
        }

        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "PHONE_ALREADY_REGISTERED",
                    "El telefono ya esta registrado. Inicia sesion."
            );
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        user.setActive(true);
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.identifier().trim();
        User user = findByIdentifier(identifier)
                .orElseThrow(this::invalidCredentials);

        if (!user.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "USER_INACTIVE", "La cuenta esta desactivada.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    private java.util.Optional<User> findByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier.toLowerCase(Locale.ROOT));
        }

        try {
            return userRepository.findByPhone(PhoneUtils.normalize(identifier));
        } catch (IllegalArgumentException ex) {
            // Un telefono invalido simplemente no coincide con ninguna cuenta.
            return java.util.Optional.empty();
        }
    }

    private String normalizeEmail(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            return null;
        }
        return rawEmail.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            return null;
        }
        try {
            return PhoneUtils.normalize(rawPhone);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT", ex.getMessage());
        }
    }

    private ApiException invalidCredentials() {
        return new ApiException(
                HttpStatus.UNAUTHORIZED,
                "INVALID_CREDENTIALS",
                "Correo/telefono o contrasena incorrectos."
        );
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generate(user);
        return new AuthResponse(
                token,
                "Bearer",
                jwtService.expirationInSeconds(),
                UserResponse.from(user)
        );
    }
}
