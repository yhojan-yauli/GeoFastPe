package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.UpdateProfileRequest;
import com.goeFast.GeoFastPe.dto.response.ProfileStatsResponse;
import com.goeFast.GeoFastPe.dto.response.UserResponse;
import com.goeFast.GeoFastPe.entity.Role;
import com.goeFast.GeoFastPe.entity.User;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.CitizenReportRepository;
import com.goeFast.GeoFastPe.repository.CommunityEventRepository;
import com.goeFast.GeoFastPe.repository.EventAttendanceRepository;
import com.goeFast.GeoFastPe.repository.SaleItemRepository;
import com.goeFast.GeoFastPe.repository.ServiceListingRepository;
import com.goeFast.GeoFastPe.repository.SolidarityPostRepository;
import com.goeFast.GeoFastPe.repository.UserRepository;
import com.goeFast.GeoFastPe.util.PhoneUtils;
import com.goeFast.GeoFastPe.util.Validaciones;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ServiceListingRepository serviceRepository;
    private final SaleItemRepository saleRepository;
    private final SolidarityPostRepository solidarityRepository;
    private final CitizenReportRepository reportRepository;
    private final CommunityEventRepository eventRepository;
    private final EventAttendanceRepository attendanceRepository;

    public UserService(UserRepository userRepository,
                       ServiceListingRepository serviceRepository,
                       SaleItemRepository saleRepository,
                       SolidarityPostRepository solidarityRepository,
                       CitizenReportRepository reportRepository,
                       CommunityEventRepository eventRepository,
                       EventAttendanceRepository attendanceRepository) {
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.saleRepository = saleRepository;
        this.solidarityRepository = solidarityRepository;
        this.reportRepository = reportRepository;
        this.eventRepository = eventRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return UserResponse.from(findUser(id));
    }

    @Transactional
    public UserResponse updateProfile(Long id, UpdateProfileRequest request) {
        User user = findUser(id);

        if (request.name() != null) {
            String nombre = request.name().trim();
            Validaciones.requerir(nombre.length() >= 2, "El nombre debe tener al menos 2 caracteres.");
            user.setName(nombre);
        }

        if (request.phone() != null) {
            if (request.phone().isBlank()) {
                user.setPhone(null);
            } else {
                String telefono = normalizarTelefono(request.phone());
                userRepository.findByPhone(telefono)
                        .filter(otro -> !otro.getId().equals(id))
                        .ifPresent(otro -> {
                            throw new ApiException(HttpStatus.CONFLICT, "PHONE_ALREADY_REGISTERED",
                                    "El telefono ya esta registrado en otra cuenta.");
                        });
                user.setPhone(telefono);
            }
        }

        if (request.city() != null) {
            user.setCity(Validaciones.texto(request.city()));
        }
        if (request.bio() != null) {
            user.setBio(Validaciones.texto(request.bio()));
        }
        if (request.avatar() != null) {
            user.setAvatar(Validaciones.texto(request.avatar()));
        }

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public ProfileStatsResponse estadisticas(Long userId) {
        long servicios = serviceRepository.findAllByOwnerIdOrderByCreatedAtDesc(userId).size();
        long ventas = saleRepository.findAllByOwnerIdOrderByCreatedAtDesc(userId).size();
        long solidaridad = solidarityRepository.findAllByOwnerIdOrderByCreatedAtDesc(userId).size();
        long reportes = reportRepository.findAllByOwnerIdOrderByCreatedAtDesc(userId).size();
        long eventosCreados = eventRepository.findAllByOwnerId(userId).size();
        long donaciones = solidarityRepository.countByOwnerIdAndTipo(userId, "DONACION");
        long eventosAsistidos = attendanceRepository.countByUserId(userId);

        return new ProfileStatsResponse(
                servicios + ventas + solidaridad + reportes + eventosCreados,
                donaciones,
                eventosCreados + eventosAsistidos
        );
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse updateRole(Long id, Role role) {
        User user = findUser(id);
        user.setRole(role);
        return UserResponse.from(userRepository.save(user));
    }

    private String normalizarTelefono(String telefono) {
        try {
            return PhoneUtils.normalize(telefono);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT", ex.getMessage());
        }
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Usuario no encontrado."));
    }
}
