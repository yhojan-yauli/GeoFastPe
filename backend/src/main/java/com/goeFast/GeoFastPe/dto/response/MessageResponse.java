package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.ChatMessage;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Mensaje de una conversacion. mine indica si lo envio el usuario autenticado.")
public record MessageResponse(
        Long id,
        String author,
        String authorUsername,
        String text,
        boolean mine,
        Instant createdAt
) {

    public static MessageResponse from(ChatMessage m, Long currentUserId) {
        return new MessageResponse(
                m.getId(),
                m.getSender().getName(),
                m.getSender().getUsername(),
                m.getText(),
                m.getSender().getId().equals(currentUserId),
                m.getCreatedAt()
        );
    }

}
