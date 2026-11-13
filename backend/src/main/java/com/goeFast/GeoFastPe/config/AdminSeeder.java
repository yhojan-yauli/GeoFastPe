package com.goeFast.GeoFastPe.config;

import com.goeFast.GeoFastPe.entity.Role;
import com.goeFast.GeoFastPe.entity.User;
import com.goeFast.GeoFastPe.repository.UserRepository;
import com.goeFast.GeoFastPe.util.PhoneUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Promueve a ADMIN al usuario cuyo telefono coincida con ADMIN_PHONE.
 * No crea usuarios: el usuario debe haberse registrado antes.
 */
@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final String adminPhone;

    public AdminSeeder(UserRepository userRepository, @Value("${app.admin.phone:}") String adminPhone) {
        this.userRepository = userRepository;
        this.adminPhone = adminPhone;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminPhone == null || adminPhone.isBlank()) {
            return;
        }

        try {
            String phone = PhoneUtils.normalize(adminPhone);
            userRepository.findByPhone(phone).ifPresentOrElse(user -> {
                if (user.getRole() != Role.ADMIN) {
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                    log.info("Usuario {} promovido a ADMIN", phone);
                }
            }, () -> log.warn("ADMIN_PHONE {} no esta registrado todavia", phone));
        } catch (IllegalArgumentException ex) {
            log.warn("ADMIN_PHONE invalido: {}", ex.getMessage());
        }
    }
}
