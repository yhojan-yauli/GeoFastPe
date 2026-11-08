package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.ConversationRequest;
import com.goeFast.GeoFastPe.dto.request.MessageRequest;
import com.goeFast.GeoFastPe.dto.response.ConversationResponse;
import com.goeFast.GeoFastPe.dto.response.MessageResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversaciones")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Mensajes", description = "Conversaciones privadas entre usuarios. Requiere token; solo ves las conversaciones en las que eres miembro.")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    @Operation(summary = "Mis conversaciones",
            description = "Lista tus conversaciones con vista previa del ultimo mensaje y mensajes sin leer (unread).")
    @ApiResponses({@ApiResponse(responseCode = "401", description = "Falta el token.")})
    public List<ConversationResponse> listar(@AuthenticationPrincipal UserPrincipal principal,
                                             @RequestParam(required = false) String categoria,
                                             @RequestParam(required = false) String q) {
        return chatService.listar(principal.id(), categoria, q);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear conversacion", description = "Crea una conversacion en la que tu eres el primer miembro.")
    @ApiResponses({@ApiResponse(responseCode = "201", description = "Conversacion creada.")})
    public ConversationResponse crear(@AuthenticationPrincipal UserPrincipal principal,
                                      @Valid @RequestBody ConversationRequest request) {
        return chatService.crear(principal.id(), request);
    }

    @GetMapping("/{id}/mensajes")
    @Operation(summary = "Ver mensajes", description = "Mensajes de la conversacion en orden cronologico. Debes ser miembro.")
    @ApiResponses({
            @ApiResponse(responseCode = "403", description = "No eres miembro."),
            @ApiResponse(responseCode = "404", description = "Conversacion no encontrada.")
    })
    public List<MessageResponse> mensajes(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return chatService.mensajes(id, principal.id());
    }

    @PostMapping("/{id}/mensajes")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Enviar mensaje", description = "Envia un mensaje y aumenta los no leidos de los demas miembros.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Mensaje enviado."),
            @ApiResponse(responseCode = "403", description = "No eres miembro.")
    })
    public MessageResponse enviar(@AuthenticationPrincipal UserPrincipal principal,
                                  @PathVariable Long id,
                                  @Valid @RequestBody MessageRequest request) {
        return chatService.enviar(id, principal.id(), request);
    }

    @PostMapping("/{id}/leer")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Marcar como leida", description = "Pone en cero los mensajes sin leer de esta conversacion.")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "Marcada como leida.")})
    public void marcarLeido(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        chatService.marcarLeido(id, principal.id());
    }
}
