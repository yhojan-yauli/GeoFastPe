package com.goeFast.GeoFastPe.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PhoneUtilsTest {

    @Test
    void normalizaCelularPeruanoDeNueveDigitos() {
        assertThat(PhoneUtils.normalize("987654321")).isEqualTo("+51987654321");
    }

    @Test
    void normalizaNumeroConFormatoYEspacios() {
        assertThat(PhoneUtils.normalize("+51 987 654 321")).isEqualTo("+51987654321");
        assertThat(PhoneUtils.normalize("51-987-654-321")).isEqualTo("+51987654321");
    }

    @Test
    void normalizaNumeroInternacional() {
        assertThat(PhoneUtils.normalize("+1 202 555 0143")).isEqualTo("+12025550143");
    }

    @Test
    void rechazaNumerosInvalidos() {
        assertThatThrownBy(() -> PhoneUtils.normalize("123"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> PhoneUtils.normalize("  "))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
