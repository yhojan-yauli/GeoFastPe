package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.EventRequest;
import com.goeFast.GeoFastPe.dto.response.EventResponse;
import com.goeFast.GeoFastPe.entity.CommunityEvent;
import com.goeFast.GeoFastPe.entity.EventAttendance;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.CommunityEventRepository;
import com.goeFast.GeoFastPe.repository.EventAttendanceRepository;
import com.goeFast.GeoFastPe.repository.UserRepository;
import com.goeFast.GeoFastPe.util.Catalogos;
import com.goeFast.GeoFastPe.util.Filtros;
import com.goeFast.GeoFastPe.util.Validaciones;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class EventService {

    private static final ZoneId ZONA = ZoneId.of("America/Lima");

    private final CommunityEventRepository eventRepository;
    private final EventAttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public EventService(CommunityEventRepository eventRepository,
                        EventAttendanceRepository attendanceRepository,
                        UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    /**
     * tab: proximos (por defecto), finalizados o mios (requiere sesion).
     * orden: recent (por defecto), soon o popular.
     */
    public List<EventResponse> listar(String tab, String categoria, String q, String orden, Long userId) {
        String vista = (tab == null || tab.isBlank()) ? "proximos" : tab;
        Validaciones.requerirOpcion("tab", vista, List.of("proximos", "finalizados", "mios"));
        if ("mios".equals(vista) && userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Debes iniciar sesion para ver tus eventos.");
        }

        LocalDateTime ahora = LocalDateTime.now(ZONA);
        List<EventResponse> eventos = eventRepository.findAll().stream()
                .filter(e -> Filtros.igualOpcional(categoria, e.getCategory()))
                .filter(e -> Filtros.coincide(q, e.getTitle(), e.getDescription(), e.getLocation()))
                .filter(e -> coincideVista(e, vista, ahora, userId))
                .map(e -> respuesta(e, userId, ahora))
                .collect(Collectors.toCollection(ArrayList::new));

        Comparator<EventResponse> comparador = switch (orden == null ? "recent" : orden) {
            case "soon" -> Comparator.comparing(EventResponse::date).thenComparing(EventResponse::time);
            case "popular" -> Comparator.comparingLong(EventResponse::participants).reversed();
            default -> Comparator.comparing(EventResponse::createdAt).reversed();
        };
        eventos.sort(comparador);
        return eventos;
    }

    public EventResponse obtener(Long id, Long userId) {
        return respuesta(buscar(id), userId, LocalDateTime.now(ZONA));
    }

    @Transactional
    public EventResponse crear(Long userId, EventRequest request) {
        validar(request);
        CommunityEvent evento = new CommunityEvent();
        evento.setOwner(userRepository.getReferenceById(userId));
        aplicar(evento, request);
        return respuesta(eventRepository.save(evento), userId, LocalDateTime.now(ZONA));
    }

    @Transactional
    public EventResponse actualizar(Long id, Long userId, EventRequest request) {
        validar(request);
        CommunityEvent evento = buscar(id);
        Validaciones.requerirPropietario(evento.getOwner().getId().equals(userId));
        aplicar(evento, request);
        return respuesta(eventRepository.save(evento), userId, LocalDateTime.now(ZONA));
    }

    @Transactional
    public void eliminar(Long id, Long userId) {
        CommunityEvent evento = buscar(id);
        Validaciones.requerirPropietario(evento.getOwner().getId().equals(userId));
        attendanceRepository.deleteAll(attendanceRepository.findAllByEventId(id));
        eventRepository.delete(evento);
    }

    @Transactional
    public void participar(Long eventoId, Long userId) {
        CommunityEvent evento = buscar(eventoId);
        if (attendanceRepository.existsByEventIdAndUserId(eventoId, userId)) {
            return;
        }
        EventAttendance asistencia = new EventAttendance();
        asistencia.setEvent(evento);
        asistencia.setUser(userRepository.getReferenceById(userId));
        attendanceRepository.save(asistencia);
    }

    @Transactional
    public void dejarDeParticipar(Long eventoId, Long userId) {
        buscar(eventoId);
        attendanceRepository.findByEventIdAndUserId(eventoId, userId).ifPresent(attendanceRepository::delete);
    }

    private boolean coincideVista(CommunityEvent e, String vista, LocalDateTime ahora, Long userId) {
        boolean finalizado = esFinalizado(e, ahora);
        return switch (vista) {
            case "finalizados" -> finalizado;
            case "mios" -> e.getOwner().getId().equals(userId);
            default -> !finalizado;
        };
    }

    private EventResponse respuesta(CommunityEvent e, Long userId, LocalDateTime ahora) {
        boolean finalizado = esFinalizado(e, ahora);
        boolean asiste = userId != null && attendanceRepository.existsByEventIdAndUserId(e.getId(), userId);
        return EventResponse.from(
                e,
                finalizado ? "Finalizado" : "Próximo",
                attendanceRepository.countByEventId(e.getId()),
                asiste
        );
    }

    private boolean esFinalizado(CommunityEvent e, LocalDateTime ahora) {
        return LocalDateTime.of(e.getDate(), e.getTime()).isBefore(ahora);
    }

    private CommunityEvent buscar(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EVENT_NOT_FOUND", "Evento no encontrado."));
    }

    private void validar(EventRequest r) {
        Validaciones.requerirOpcion("category", r.category(), Catalogos.EVENTO_CATEGORIAS);
        Validaciones.requerirOpcion("type", r.type(), Catalogos.EVENTO_TIPOS);
        Validaciones.requerir(LocalDateTime.of(r.date(), r.time()).isAfter(LocalDateTime.now(ZONA)),
                "La fecha y la hora del evento deben ser futuras.");
        Validaciones.requerirCoordenadas(r.lat(), r.lng());
    }

    private void aplicar(CommunityEvent e, EventRequest r) {
        e.setTitle(r.title().trim());
        e.setCategory(r.category());
        e.setType(r.type());
        e.setDescription(r.description().trim());
        e.setDate(r.date());
        e.setTime(r.time());
        e.setLocation(r.location().trim());
        e.setLat(r.lat());
        e.setLng(r.lng());
        e.setImage(Validaciones.texto(r.image()));
    }
}
