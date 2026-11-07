package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.VerifyLoginRequest;
import com.goeFast.GeoFastPe.dto.request.VerifyRegisterRequest;
import com.goeFast.GeoFastPe.dto.response.AuthResponse;
import com.goeFast.GeoFastPe.dto.response.OtpSentResponse;
import com.goeFast.GeoFastPe.entity.OtpPurpose;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class AuthFlowTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void registraConOtpYLuegoIniciaSesion() {
        String phone = "911111111";

        OtpSentResponse registerOtp = authService.requestRegisterOtp(phone);
        assertThat(registerOtp.devCode()).isNotBlank();

        AuthResponse registered = authService.verifyRegister(
                new VerifyRegisterRequest(phone, registerOtp.devCode(), "Usuario Prueba")
        );

        assertThat(registered.token()).isNotBlank();
        assertThat(registered.tokenType()).isEqualTo("Bearer");
        assertThat(registered.user().phone()).isEqualTo("+51911111111");
        assertThat(registered.user().role()).isEqualTo("USER");
        assertThat(registered.user().phoneVerified()).isTrue();
        assertThat(jwtService.parse(registered.token()).getPayload().getSubject())
                .isEqualTo(registered.user().id().toString());

        assertThat(userRepository.existsByPhone("+51911111111")).isTrue();

        OtpSentResponse loginOtp = authService.requestLoginOtp(phone);
        AuthResponse loggedIn = authService.verifyLogin(
                new VerifyLoginRequest(phone, loginOtp.devCode())
        );

        assertThat(loggedIn.token()).isNotBlank();
        assertThat(loggedIn.user().lastLoginAt()).isNotNull();
    }

    @Test
    void noPermiteRegistrarDosVecesElMismoNumero() {
        String phone = "922222222";

        OtpSentResponse otp = authService.requestRegisterOtp(phone);
        authService.verifyRegister(new VerifyRegisterRequest(phone, otp.devCode(), "Primero"));

        assertThatThrownBy(() -> authService.requestRegisterOtp(phone))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getCode())
                .isEqualTo("PHONE_ALREADY_REGISTERED");
    }

    @Test
    void rechazaCodigoIncorrectoYAumentaLosIntentos() {
        String phone = "933333333";
        OtpSentResponse otp = authService.requestRegisterOtp(phone);

        String wrongCode = otp.devCode().equals("000000") ? "111111" : "000000";

        assertThatThrownBy(() -> authService.verifyRegister(
                new VerifyRegisterRequest(phone, wrongCode, "Intruso")
        )).isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void noGeneraOtpDeLoginParaNumeroNoRegistrado() {
        assertThatThrownBy(() -> authService.requestLoginOtp("944444444"))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getCode())
                .isEqualTo("PHONE_NOT_REGISTERED");
    }
}
