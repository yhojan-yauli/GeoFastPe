package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.config.OtpProperties;
import com.goeFast.GeoFastPe.dto.response.OtpSentResponse;
import com.goeFast.GeoFastPe.entity.OtpCode;
import com.goeFast.GeoFastPe.entity.OtpPurpose;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.OtpCodeRepository;
import com.goeFast.GeoFastPe.repository.UserRepository;
import com.goeFast.GeoFastPe.util.PhoneUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;

@Service
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final OtpCodeRepository otpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SmsSender smsSender;
    private final OtpProperties properties;

    public OtpService(OtpCodeRepository otpRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      SmsSender smsSender,
                      OtpProperties properties) {
        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.smsSender = smsSender;
        this.properties = properties;
    }

    @Transactional
    public OtpSentResponse request(String rawPhone, OtpPurpose purpose) {
        String phone = PhoneUtils.normalize(rawPhone);
        validateUserState(phone, purpose);
        validateCooldown(phone);

        String code = generateCode();
        OtpCode otp = new OtpCode();
        otp.setPhone(phone);
        otp.setCodeHash(passwordEncoder.encode(code));
        otp.setPurpose(purpose);
        otp.setExpiresAt(Instant.now().plusSeconds(properties.ttlSeconds()));

        otpRepository.deleteActive(phone, purpose);
        otpRepository.save(otp);

        String message = "GeoFastPe: tu codigo de verificacion es " + code
                + ". Vence en " + Math.max(1, properties.ttlSeconds() / 60) + " minutos.";
        smsSender.send(phone, message);

        String devCode = properties.exposeCode() ? code : null;
        return new OtpSentResponse("Codigo enviado al " + mask(phone), properties.ttlSeconds(), devCode);
    }

    @Transactional
    public void verify(String rawPhone, String code, OtpPurpose purpose) {
        String phone = PhoneUtils.normalize(rawPhone);

        OtpCode otp = otpRepository
                .findTopByPhoneAndPurposeAndConsumedFalseOrderByCreatedAtDesc(phone, purpose)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "OTP_NOT_FOUND",
                        "No hay un codigo vigente. Solicita uno nuevo."
                ));

        if (Instant.now().isAfter(otp.getExpiresAt())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "OTP_EXPIRED", "El codigo expiro. Solicita uno nuevo.");
        }

        if (otp.getAttempts() >= properties.maxAttempts()) {
            throw new ApiException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "OTP_TOO_MANY_ATTEMPTS",
                    "Superaste el numero de intentos. Solicita un nuevo codigo."
            );
        }

        if (!passwordEncoder.matches(code, otp.getCodeHash())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);

            int remaining = Math.max(0, properties.maxAttempts() - otp.getAttempts());
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "OTP_INVALID",
                    "Codigo incorrecto. Intentos restantes: " + remaining
            );
        }

        otp.setConsumed(true);
        otpRepository.save(otp);
    }

    private void validateUserState(String phone, OtpPurpose purpose) {
        if (purpose == OtpPurpose.REGISTER && userRepository.existsByPhone(phone)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "PHONE_ALREADY_REGISTERED",
                    "El numero ya esta registrado. Inicia sesion."
            );
        }
        if (purpose == OtpPurpose.LOGIN && !userRepository.existsByPhone(phone)) {
            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    "PHONE_NOT_REGISTERED",
                    "El numero no esta registrado. Registrate primero."
            );
        }
    }

    private void validateCooldown(String phone) {
        Instant threshold = Instant.now().minusSeconds(properties.resendCooldownSeconds());
        long recent = otpRepository.countByPhoneAndCreatedAtAfter(phone, threshold);
        if (recent > 0) {
            throw new ApiException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "OTP_COOLDOWN",
                    "Espera " + properties.resendCooldownSeconds() + " segundos antes de pedir otro codigo."
            );
        }
    }

    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    private String mask(String phone) {
        if (phone.length() <= 4) {
            return "****";
        }
        return "****" + phone.substring(phone.length() - 4);
    }
}
