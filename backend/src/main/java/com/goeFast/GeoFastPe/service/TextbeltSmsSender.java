package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.config.TextbeltProperties;
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
 * Envio de SMS reales con Textbelt.
 * La key "textbelt" es gratuita pero permite 1 SMS por dia por IP.
 */
@Service
@ConditionalOnProperty(name = "app.otp.provider", havingValue = "textbelt")
public class TextbeltSmsSender implements SmsSender {

    private static final Logger log = LoggerFactory.getLogger(TextbeltSmsSender.class);
    private static final String TEXTBELT_URL = "https://textbelt.com/text";

    private final TextbeltProperties properties;
    private final RestClient restClient;

    public TextbeltSmsSender(TextbeltProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder.build();
    }

    @Override
    public void send(String phoneE164, String message) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("phone", phoneE164);
        form.add("message", message);
        form.add("key", properties.key());

        try {
            String body = restClient.post()
                    .uri(TEXTBELT_URL)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(String.class);

            if (body == null || !body.replace(" ", "").contains("\"success\":true")) {
                log.error("[OTP][TEXTBELT] Respuesta inesperada: {}", body);
                throw new IllegalStateException("Textbelt no pudo enviar el SMS: " + body);
            }
            log.info("[OTP][TEXTBELT] SMS enviado a {}", phoneE164);
        } catch (RestClientResponseException ex) {
            log.error("[OTP][TEXTBELT] Error al enviar SMS: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new IllegalStateException("No se pudo enviar el SMS con Textbelt.", ex);
        }
    }
}
