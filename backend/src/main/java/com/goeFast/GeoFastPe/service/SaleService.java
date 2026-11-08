package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.SaleRequest;
import com.goeFast.GeoFastPe.dto.response.ConversationResponse;
import com.goeFast.GeoFastPe.dto.response.SaleResponse;
import com.goeFast.GeoFastPe.entity.SaleItem;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.SaleItemRepository;
import com.goeFast.GeoFastPe.repository.UserRepository;
import com.goeFast.GeoFastPe.util.Catalogos;
import com.goeFast.GeoFastPe.util.Filtros;
import com.goeFast.GeoFastPe.util.Validaciones;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SaleService {

    private final SaleItemRepository saleRepository;
    private final UserRepository userRepository;
    private final ChatService chatService;

    public SaleService(SaleItemRepository saleRepository, UserRepository userRepository, ChatService chatService) {
        this.saleRepository = saleRepository;
        this.userRepository = userRepository;
        this.chatService = chatService;
    }

    /** orden: recientes (por defecto), precio_asc o precio_desc. */
    public List<SaleResponse> listar(String q, String categoria, String condicion, String distrito, String orden) {
        List<SaleItem> lista = new ArrayList<>(saleRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(s -> Filtros.coincide(q, s.getName(), s.getDescription()))
                .filter(s -> Filtros.igualOpcional(categoria, s.getCategory()))
                .filter(s -> Filtros.igualOpcional(condicion, s.getCondition()))
                .filter(s -> Filtros.igualOpcional(distrito, s.getLocation()))
                .toList());

        if ("precio_asc".equals(orden)) {
            lista.sort(Comparator.comparing(SaleItem::getPrice));
        } else if ("precio_desc".equals(orden)) {
            lista.sort(Comparator.comparing(SaleItem::getPrice).reversed());
        }
        return lista.stream().map(SaleResponse::from).toList();
    }

    public SaleResponse obtener(Long id) {
        return SaleResponse.from(buscar(id));
    }

    public List<SaleResponse> misVentas(Long userId) {
        return saleRepository.findAllByOwnerIdOrderByCreatedAtDesc(userId).stream()
                .map(SaleResponse::from)
                .toList();
    }

    @Transactional
    public SaleResponse crear(Long userId, SaleRequest request) {
        validar(request);
        SaleItem venta = new SaleItem();
        venta.setOwner(userRepository.getReferenceById(userId));
        aplicar(venta, request);
        return SaleResponse.from(saleRepository.save(venta));
    }

    @Transactional
    public SaleResponse actualizar(Long id, Long userId, SaleRequest request) {
        validar(request);
        SaleItem venta = buscar(id);
        Validaciones.requerirPropietario(venta.getOwner().getId().equals(userId));
        aplicar(venta, request);
        return SaleResponse.from(saleRepository.save(venta));
    }

    @Transactional
    public void eliminar(Long id, Long userId) {
        SaleItem venta = buscar(id);
        Validaciones.requerirPropietario(venta.getOwner().getId().equals(userId));
        saleRepository.delete(venta);
    }

    @Transactional
    public ConversationResponse contactarVendedor(Long id, Long compradorId) {
        SaleItem venta = buscar(id);
        if (venta.getOwner().getId().equals(compradorId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT", "No puedes contactarte con tu propia venta.");
        }
        return chatService.abrirConversacionVenta(compradorId, venta.getOwner().getId(), venta.getName());
    }

    private SaleItem buscar(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SALE_NOT_FOUND", "Venta no encontrada."));
    }

    private void validar(SaleRequest r) {
        Validaciones.requerirOpcion("category", r.category(), Catalogos.VENTA_CATEGORIAS);
        Validaciones.requerirOpcion("condition", r.condition(), Catalogos.VENTA_CONDICIONES);
        Validaciones.requerirOpcion("location", r.location(), Catalogos.DISTRITOS);
        Validaciones.opcionOpcional("status", r.status(), Catalogos.VENTA_ESTADOS);
        Validaciones.requerirCoordenadas(r.lat(), r.lng());
    }

    private void aplicar(SaleItem venta, SaleRequest r) {
        venta.setName(r.name().trim());
        venta.setCategory(r.category());
        venta.setCondition(r.condition());
        venta.setPrice(r.price());
        venta.setDescription(r.description().trim());
        venta.setLocation(r.location());
        venta.setLat(r.lat());
        venta.setLng(r.lng());
        venta.setImage(Validaciones.texto(r.image()));
        if (r.status() != null) {
            venta.setStatus(r.status());
        }
    }
}
