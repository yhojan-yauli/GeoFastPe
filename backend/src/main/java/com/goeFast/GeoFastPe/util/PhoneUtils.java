package com.goeFast.GeoFastPe.util;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;

public final class PhoneUtils {

    private static final PhoneNumberUtil PHONE_UTIL = PhoneNumberUtil.getInstance();
    private static final String DEFAULT_REGION = "PE";

    private PhoneUtils() {
    }

    /**
     * Normaliza un telefono a formato E.164 (+51987654321).
     * Acepta formatos como "987654321", "51987654321", "+51 987 654 321".
     */
    public static String normalize(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            throw new IllegalArgumentException("El telefono es obligatorio");
        }

        String cleaned = rawPhone.replaceAll("[\\s\\-().]", "");
        if (cleaned.startsWith("00")) {
            cleaned = "+" + cleaned.substring(2);
        }
        if (!cleaned.startsWith("+")) {
            if (cleaned.matches("9\\d{8}")) {
                cleaned = "+51" + cleaned;
            } else if (cleaned.matches("51\\d{9}")) {
                cleaned = "+" + cleaned;
            } else {
                throw new IllegalArgumentException("El telefono debe estar en formato internacional o ser un celular peruano de 9 digitos");
            }
        }

        try {
            Phonenumber.PhoneNumber number = PHONE_UTIL.parse(cleaned, DEFAULT_REGION);
            if (!PHONE_UTIL.isValidNumber(number)) {
                throw new IllegalArgumentException("El telefono no es valido");
            }
            return PHONE_UTIL.format(number, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (NumberParseException ex) {
            throw new IllegalArgumentException("El telefono no es valido", ex);
        }
    }
}
