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

    public List<MessageResponse> mensajes(Long conversacionId, Long userId) {
        exigirMiembro(conversacionId, userId);
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
        return ConversationResponse.from(conversacion, "Sin mensajes", miembro.getUnread());
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
        return ConversationResponse.from(conversacion, "Sin mensajes", miembroComprador.getUnread());
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
        return ConversationResponse.from(conversacion, vista, miembro.getUnread());
    }
}
