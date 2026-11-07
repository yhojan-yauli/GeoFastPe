package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.RequestOtpRequest;
import com.goeFast.GeoFastPe.dto.request.VerifyLoginRequest;
import com.goeFast.GeoFastPe.dto.request.VerifyRegisterRequest;
import com.goeFast.GeoFastPe.dto.response.AuthResponse;
import com.goeFast.GeoFastPe.dto.response.OtpSentResponse;
import com.goeFast.GeoFastPe.dto.response.UserResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.AuthService;
import com.goeFast.GeoFastPe.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register/request-otp")
    @ResponseStatus(HttpStatus.OK)
    public OtpSentResponse requestRegisterOtp(@Valid @RequestBody RequestOtpRequest request) {
        return authService.requestRegisterOtp(request.phone());
    }

    @PostMapping("/register/verify")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse verifyRegister(@Valid @RequestBody VerifyRegisterRequest request) {
        return authService.verifyRegister(request);
    }

    @PostMapping("/login/request-otp")
    @ResponseStatus(HttpStatus.OK)
    public OtpSentResponse requestLoginOtp(@Valid @RequestBody RequestOtpRequest request) {
        return authService.requestLoginOtp(request.phone());
    }

    @PostMapping("/login/verify")
    @ResponseStatus(HttpStatus.OK)
    public AuthResponse verifyLogin(@Valid @RequestBody VerifyLoginRequest request) {
        return authService.verifyLogin(request);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getById(principal.id());
    }
}
