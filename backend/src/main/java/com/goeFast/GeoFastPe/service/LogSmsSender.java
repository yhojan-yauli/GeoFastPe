package com.goeFast.GeoFastPe.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Proveedor de SMS para desarrollo: no envia nada, imprime el codigo en el log.
 */
@Service
@ConditionalOnProperty(name = "app.otp.provider", havingValue = "log", matchIfMissing = true)
public class LogSmsSender implements SmsSender {

    private static final Logger log = LoggerFactory.getLogger(LogSmsSender.class);

    @Override
    public void send(String phoneE164, String message) {
        log.info("[OTP][DEV] SMS a {} -> {}", phoneE164, message);
    }
}
