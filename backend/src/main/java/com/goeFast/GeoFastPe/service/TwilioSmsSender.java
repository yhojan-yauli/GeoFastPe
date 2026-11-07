package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.config.TwilioProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * Envio de SMS reales con Twilio (credito de prueba gratuito).
 * En trial solo se puede enviar a numeros verificados en la consola de Twilio.
 */
@Service
@ConditionalOnProperty(name = "app.otp.provider", havingValue = "twilio")
public class TwilioSmsSender implements SmsSender {

    private static final Logger log = LoggerFactory.getLogger(TwilioSmsSender.class);
    private static final String TWILIO_URL = "https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json";

    private final TwilioProperties properties;
    private final RestClient restClient;

    public TwilioSmsSender(TwilioProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder.build();

        if (isBlank(properties.accountSid()) || isBlank(properties.authToken()) || isBlank(properties.fromNumber())) {
            throw new IllegalStateException(
                    "Para usar OTP_PROVIDER=twilio debes configurar TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_FROM_NUMBER"
            );
        }
    }

    @Override
    public void send(String phoneE164, String message) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("To", phoneE164);
        form.add("From", properties.fromNumber());
        form.add("Body", message);

        try {
            restClient.post()
                    .uri(TWILIO_URL, properties.accountSid())
                    .headers(headers -> headers.setBasicAuth(properties.accountSid(), properties.authToken()))
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();
            log.info("[OTP][TWILIO] SMS enviado a {}", phoneE164);
        } catch (RestClientResponseException ex) {
            log.error("[OTP][TWILIO] Error al enviar SMS: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new IllegalStateException("No se pudo enviar el SMS. Revisa la configuracion de Twilio.", ex);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
