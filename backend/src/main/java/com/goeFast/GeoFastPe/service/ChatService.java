package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.ConversationRequest;
import com.goeFast.GeoFastPe.dto.request.MessageRequest;
import com.goeFast.GeoFastPe.dto.response.ConversationResponse;
import com.goeFast.GeoFastPe.dto.response.MessageResponse;
import com.goeFast.GeoFastPe.entity.ChatMessage;
import com.goeFast.GeoFastPe.entity.Conversation;
import com.goeFast.GeoFastPe.entity.ConversationMember;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.ChatMessageRepository;
import com.goeFast.GeoFastPe.repository.ConversationMemberRepository;
import com.goeFast.GeoFastPe.repository.ConversationRepository;
import com.goeFast.GeoFastPe.repository.UserRepository;
import com.goeFast.GeoFastPe.util.Catalogos;
import com.goeFast.GeoFastPe.util.Filtros;
import com.goeFast.GeoFastPe.util.Validaciones;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ChatService {

    private static final String CATEGORIA_VENTAS = "Ventas";
    private static final int MAXIMO_TITULO = 80;

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatService(ConversationRepository conversationRepository,
                       ConversationMemberRepository memberRepository,
                       ChatMessageRepository messageRepository,
                       UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.memberRepository = memberRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public List<ConversationResponse> listar(Long userId, String categoria, String q) {
        return memberRepository.findAllByUserId(userId).stream()
                .filter(m -> Filtros.igualOpcional(categoria, m.getConversation().getCategory()))
                .filter(m -> Filtros.coincide(q, m.getConversation().getTitle(), m.getConversation().getSubtitle()))
                .map(this::respuesta)
                .sorted(Comparator.comparing(ConversationResponse::time).reversed())
                .toList();
    }

    @Transactional
    public List<ConversationResponse> gruposPublicos(Long userId, String categoria, String q) {
        crearCanalesBaseSiFaltan(userId);
        return conversationRepository.findAll().stream()
                .filter(Conversation::isPublicGroup)
                .filter(c -> Filtros.igualOpcional(categoria, c.getCategory()))
                .filter(c -> Filtros.coincide(q, c.getTitle(), c.getSubtitle()))
                .map(c -> {
                    int unread = memberRepository.findByConversationIdAndUserId(c.getId(), userId).map(ConversationMember::getUnread).orElse(0);
                    return ConversationResponse.from(c, messageRepository.findTopByConversationIdOrderByCreatedAtDesc(c.getId()).map(ChatMessage::getText).orElse("Sin mensajes"), unread, (int) memberRepository.countByConversationId(c.getId()));
                }).sorted(Comparator.comparing(ConversationResponse::time).reversed()).toList();
    }


    /**
     * Crea los canales comunitarios base la primera vez que un usuario abre Mensajes.
     * De esta forma la pantalla nunca aparece vacía en una instalación nueva.
     */
    @Transactional
    void crearCanalesBaseSiFaltan(Long userId) {
        for (String categoria : Catalogos.CHAT_CATEGORIAS) {
            boolean existe = conversationRepository.findAll().stream()
                    .anyMatch(c -> c.isPublicGroup() && categoria.equals(c.getCategory()));
            if (existe) continue;

            Conversation c = new Conversation();
            c.setTitle("Canal " + categoria);
            c.setSubtitle("Mensajes públicos de la categoría " + categoria + ". Únete para participar.");
            c.setCategory(categoria);
            c.setCreatedBy(userRepository.getReferenceById(userId));
            c.setPublicGroup(true);
            conversationRepository.save(c);
        }
    }

    @Transactional
    public ConversationResponse crearGrupoPublico(Long userId, ConversationRequest request) {
        Validaciones.requerirOpcion("category", request.category(), Catalogos.CHAT_CATEGORIAS);
        Conversation c = new Conversation();
        c.setTitle(request.title().trim()); c.setSubtitle(Validaciones.texto(request.subtitle())); c.setCategory(request.category());
        c.setCreatedBy(userRepository.getReferenceById(userId)); c.setPublicGroup(true); conversationRepository.save(c);
        ConversationMember m = crearMiembro(c, userId);
        return ConversationResponse.from(c, "Grupo creado. Sé el primero en escribir.", m.getUnread(), 1);
    }

    @Transactional
    public ConversationResponse unirseGrupo(Long userId, Long conversationId) {
        Conversation c = conversationRepository.findById(conversationId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONVERSATION_NOT_FOUND", "Grupo no encontrado."));
        if (!c.isPublicGroup()) throw new ApiException(HttpStatus.BAD_REQUEST, "PRIVATE_CONVERSATION", "Esta conversación es privada.");
        ConversationMember m = memberRepository.findByConversationIdAndUserId(conversationId, userId).orElseGet(() -> crearMiembro(c, userId));
        return respuesta(m);
    }

    public List<MessageResponse> mensajes(Long conversacionId, Long userId) {
        Conversation conversacion = conversationRepository.findById(conversacionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONVERSATION_NOT_FOUND", "Conversacion no encontrada."));
        // Los canales públicos se pueden leer sin pertenecer al grupo.
        // Para escribir sigue siendo obligatorio unirse.
        if (!conversacion.isPublicGroup()) {
            exigirMiembro(conversacionId, userId);
        }
        return messageRepository.findAllByConversationIdOrderByCreatedAtAsc(conversacionId).stream()
                .map(m -> MessageResponse.from(m, userId))
                .toList();
    }

    @Transactional
    public ConversationResponse crear(Long userId, ConversationRequest request) {
        Validaciones.requerirOpcion("category", request.category(), Catalogos.CHAT_CATEGORIAS);
        Conversation conversacion = new Conversation();
        conversacion.setTitle(request.title().trim());
        conversacion.setSubtitle(Validaciones.texto(request.subtitle()));
        conversacion.setCategory(request.category());
        conversacion.setCreatedBy(userRepository.getReferenceById(userId));
        conversationRepository.save(conversacion);
        ConversationMember miembro = crearMiembro(conversacion, userId);
        if (request.recipientId() != null && !request.recipientId().equals(userId)) {
            if (!userRepository.existsById(request.recipientId())) {
                throw new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "El usuario destinatario no existe.");
            }
            crearMiembro(conversacion, request.recipientId());
        }
        return ConversationResponse.from(conversacion, "Sin mensajes", miembro.getUnread(), (int) memberRepository.countByConversationId(conversacion.getId()));
    }

    @Transactional
    public MessageResponse enviar(Long conversacionId, Long userId, MessageRequest request) {
        ConversationMember emisor = exigirMiembro(conversacionId, userId);
        Conversation conversacion = emisor.getConversation();

        ChatMessage mensaje = new ChatMessage();
        mensaje.setConversation(conversacion);
        mensaje.setSender(emisor.getUser());
        mensaje.setText(request.text().trim());
        ChatMessage guardado = messageRepository.save(mensaje);

        conversacion.setLastMessageAt(guardado.getCreatedAt());
        conversationRepository.save(conversacion);

        for (ConversationMember miembro : memberRepository.findAllByConversationId(conversacionId)) {
            if (!miembro.getUser().getId().equals(userId)) {
                miembro.setUnread(miembro.getUnread() + 1);
                memberRepository.save(miembro);
            }
        }
        return MessageResponse.from(guardado, userId);
    }

    @Transactional
    public void marcarLeido(Long conversacionId, Long userId) {
        ConversationMember miembro = exigirMiembro(conversacionId, userId);
        miembro.setUnread(0);
        memberRepository.save(miembro);
    }

    /** Abre (o reutiliza) la conversacion de un comprador con el vendedor sobre una venta. */
    @Transactional
    public ConversationResponse abrirConversacionVenta(Long compradorId, Long vendedorId, String nombreVenta) {
        String titulo = nombreVenta.length() > MAXIMO_TITULO ? nombreVenta.substring(0, MAXIMO_TITULO) : nombreVenta;

        for (ConversationMember miembro : memberRepository.findAllByUserId(compradorId)) {
            Conversation existente = miembro.getConversation();
            if (CATEGORIA_VENTAS.equals(existente.getCategory())
                    && titulo.equals(existente.getTitle())
                    && memberRepository.existsByConversationIdAndUserId(existente.getId(), vendedorId)) {
                return respuesta(miembro);
            }
        }

        Conversation conversacion = new Conversation();
        conversacion.setTitle(titulo);
        conversacion.setSubtitle("Consulta sobre la venta");
        conversacion.setCategory(CATEGORIA_VENTAS);
        conversacion.setCreatedBy(userRepository.getReferenceById(compradorId));
        conversationRepository.save(conversacion);
        ConversationMember miembroComprador = crearMiembro(conversacion, compradorId);
        crearMiembro(conversacion, vendedorId);
        return ConversationResponse.from(conversacion, "Sin mensajes", miembroComprador.getUnread(), (int) memberRepository.countByConversationId(conversacion.getId()));
    }

    private ConversationMember crearMiembro(Conversation conversacion, Long userId) {
        ConversationMember miembro = new ConversationMember();
        miembro.setConversation(conversacion);
        miembro.setUser(userRepository.getReferenceById(userId));
        return memberRepository.save(miembro);
    }

    private ConversationMember exigirMiembro(Long conversacionId, Long userId) {
        if (!conversationRepository.existsById(conversacionId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "CONVERSATION_NOT_FOUND", "Conversacion no encontrada.");
        }
        return memberRepository.findByConversationIdAndUserId(conversacionId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "NOT_MEMBER",
                        "No formas parte de esta conversacion."));
    }

    private ConversationResponse respuesta(ConversationMember miembro) {
        Conversation conversacion = miembro.getConversation();
        String vista = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversacion.getId())
                .map(ChatMessage::getText)
                .orElse("Sin mensajes");
        return ConversationResponse.from(conversacion, vista, miembro.getUnread(), (int) memberRepository.countByConversationId(conversacion.getId()));
    }
}
