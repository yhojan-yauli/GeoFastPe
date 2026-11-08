package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.SolidarityRequest;
import com.goeFast.GeoFastPe.dto.response.SolidarityResponse;
import com.goeFast.GeoFastPe.entity.SolidarityFavorite;
import com.goeFast.GeoFastPe.entity.SolidarityPost;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.SolidarityFavoriteRepository;
import com.goeFast.GeoFastPe.repository.SolidarityPostRepository;
import com.goeFast.GeoFastPe.repository.UserRepository;
import com.goeFast.GeoFastPe.util.Catalogos;
import com.goeFast.GeoFastPe.util.Filtros;
import com.goeFast.GeoFastPe.util.Validaciones;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SolidarityService {

    private static final String DONACION = "DONACION";
    private static final String SOLICITUD = "SOLICITUD";

    private final SolidarityPostRepository postRepository;
    private final SolidarityFavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    public SolidarityService(SolidarityPostRepository postRepository,
                             SolidarityFavoriteRepository favoriteRepository,
                             UserRepository userRepository) {
        this.postRepository = postRepository;
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
    }

    public List<SolidarityResponse> listar(Long userId, String tipo, String categoria, String q) {
        if (tipo != null && !tipo.isBlank()) {
            Validaciones.requerirOpcion("tipo", tipo, Catalogos.SOLIDARIDAD_TIPOS);
        }
        Set<Long> favoritos = favoritosIds(userId);
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(p -> Filtros.igualOpcional(tipo, p.getTipo()))
                .filter(p -> Filtros.igualOpcional(categoria, p.getCategory()))
                .filter(p -> Filtros.coincide(q, p.getTitle(), p.getDescription()))
                .map(p -> SolidarityResponse.from(p, favoritos.contains(p.getId())))
                .toList();
    }

    public SolidarityResponse obtener(Long id, Long userId) {
        return SolidarityResponse.from(buscar(id), favoritosIds(userId).contains(id));
    }

    public List<SolidarityResponse> misPublicaciones(Long userId) {
        return postRepository.findAllByOwnerIdOrderByCreatedAtDesc(userId).stream()
                .map(p -> SolidarityResponse.from(p, favoriteRepository.existsByUserIdAndPostId(userId, p.getId())))
                .toList();
    }

    public List<SolidarityResponse> favoritos(Long userId) {
        return favoriteRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(f -> SolidarityResponse.from(f.getPost(), true))
                .toList();
    }

    @Transactional
    public SolidarityResponse crear(Long userId, SolidarityRequest request) {
        validar(request);
        SolidarityPost publicacion = new SolidarityPost();
        publicacion.setOwner(userRepository.getReferenceById(userId));
        aplicar(publicacion, request);
        return SolidarityResponse.from(postRepository.save(publicacion), false);
    }

    @Transactional
    public SolidarityResponse actualizar(Long id, Long userId, SolidarityRequest request) {
        validar(request);
        SolidarityPost publicacion = postRepository.findForUpdate(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "SOLIDARITY_NOT_FOUND", "Publicacion no encontrada."));
        Validaciones.requerirPropietario(publicacion.getOwner().getId().equals(userId));
        if ("SOLICITUD".equals(publicacion.getTipo()) &&
                (CoordinacionAyudaService.estado(publicacion) != com.goeFast.GeoFastPe.entity.EstadoAyuda.ABIERTA
                || !"SOLICITUD".equals(request.tipo())))
            throw new ApiException(HttpStatus.CONFLICT, "HELP_STATE_CONFLICT", "La solicitud ya no admite edicion; usa sus acciones.");
        aplicar(publicacion, request);
        return SolidarityResponse.from(postRepository.save(publicacion), favoriteRepository.existsByUserIdAndPostId(userId, id));
    }

    @Transactional
    public void eliminar(Long id, Long userId) {
        SolidarityPost publicacion = postRepository.findForUpdate(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "SOLIDARITY_NOT_FOUND", "Publicacion no encontrada."));
        Validaciones.requerirPropietario(publicacion.getOwner().getId().equals(userId));
        if (publicacion.getVoluntario() != null)
            throw new ApiException(HttpStatus.CONFLICT, "HELP_STATE_CONFLICT", "Conserva el historial de la ayuda asignada; usa cancelar.");
        favoriteRepository.deleteAll(favoriteRepository.findAllByPostId(id));
        postRepository.delete(publicacion);
    }

    @Transactional
    public void marcarFavorito(Long postId, Long userId) {
        SolidarityPost publicacion = buscar(postId);
        if (favoriteRepository.existsByUserIdAndPostId(userId, postId)) {
            return;
        }
        SolidarityFavorite favorito = new SolidarityFavorite();
        favorito.setPost(publicacion);
        favorito.setUser(userRepository.getReferenceById(userId));
        favoriteRepository.save(favorito);
    }

    @Transactional
    public void quitarFavorito(Long postId, Long userId) {
        favoriteRepository.findByUserIdAndPostId(userId, postId).ifPresent(favoriteRepository::delete);
    }

    private Set<Long> favoritosIds(Long userId) {
        if (userId == null) {
            return Set.of();
        }
        return favoriteRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(f -> f.getPost().getId())
                .collect(Collectors.toSet());
    }

    private SolidarityPost buscar(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SOLIDARITY_NOT_FOUND", "Publicacion no encontrada."));
    }

    private void validar(SolidarityRequest r) {
        Validaciones.requerirOpcion("tipo", r.tipo(), Catalogos.SOLIDARIDAD_TIPOS);
        Validaciones.requerirOpcion("category", r.category(), Catalogos.SOLIDARIDAD_CATEGORIAS);
        if (DONACION.equals(r.tipo())) {
            Validaciones.requerirOpcion("condition", r.condition(), Catalogos.DONACION_CONDICIONES);
        } else {
            Validaciones.requerirOpcion("urgency", r.urgency(), Catalogos.URGENCIAS);
        }
        Validaciones.opcionOpcional("status", r.status(), Catalogos.SOLIDARIDAD_ESTADOS);
        Validaciones.requerirCoordenadas(r.lat(), r.lng());
    }

    private void aplicar(SolidarityPost p, SolidarityRequest r) {
        p.setTipo(r.tipo());
        p.setTitle(r.title().trim());
        p.setCategory(r.category());
        p.setDescription(r.description().trim());
        p.setCondition(DONACION.equals(r.tipo()) ? r.condition() : null);
        p.setUrgency(SOLICITUD.equals(r.tipo()) ? r.urgency() : null);
        p.setLocation(Validaciones.texto(r.location()));
        p.setLat(r.lat());
        p.setLng(r.lng());
        p.setImage(Validaciones.texto(r.image()));
        if (r.status() != null) {
            p.setStatus(r.status());
        }
    }
}
