package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.VerifyLoginRequest;
import com.goeFast.GeoFastPe.dto.request.VerifyRegisterRequest;
import com.goeFast.GeoFastPe.dto.response.AuthResponse;
import com.goeFast.GeoFastPe.dto.response.OtpSentResponse;
import com.goeFast.GeoFastPe.dto.response.UserResponse;
import com.goeFast.GeoFastPe.entity.OtpPurpose;
import com.goeFast.GeoFastPe.entity.Role;
import com.goeFast.GeoFastPe.entity.User;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.UserRepository;
import com.goeFast.GeoFastPe.util.PhoneUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, OtpService otpService, JwtService jwtService) {
        this.userRepository = userRepository;
        this.otpService = otpService;
        this.jwtService = jwtService;
    }

    public OtpSentResponse requestRegisterOtp(String phone) {
        return otpService.request(phone, OtpPurpose.REGISTER);
    }

    @Transactional
    public AuthResponse verifyRegister(VerifyRegisterRequest request) {
        String phone = PhoneUtils.normalize(request.phone());

        if (userRepository.existsByPhone(phone)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "PHONE_ALREADY_REGISTERED",
                    "El numero ya esta registrado. Inicia sesion."
            );
        }

        otpService.verify(phone, request.code(), OtpPurpose.REGISTER);

        User user = new User();
        user.setPhone(phone);
        user.setFullName(request.fullName().trim());
        user.setRole(Role.USER);
        user.setPhoneVerified(true);
        user.setActive(true);
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public OtpSentResponse requestLoginOtp(String phone) {
        return otpService.request(phone, OtpPurpose.LOGIN);
    }

    @Transactional
    public AuthResponse verifyLogin(VerifyLoginRequest request) {
        String phone = PhoneUtils.normalize(request.phone());

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "PHONE_NOT_REGISTERED",
                        "El numero no esta registrado. Registrate primero."
                ));

        if (!user.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "USER_INACTIVE", "La cuenta esta desactivada.");
        }

        otpService.verify(phone, request.code(), OtpPurpose.LOGIN);

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return buildAuthResponse(user);
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
