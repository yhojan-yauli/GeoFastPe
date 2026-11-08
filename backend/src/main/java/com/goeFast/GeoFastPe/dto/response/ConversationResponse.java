package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.Conversation;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Conversacion del usuario autenticado. unread son los mensajes no leidos para ese usuario.")
public record ConversationResponse(
        Long id,
        String title,
        String subtitle,
        String category,
        String preview,
        Instant time,
        int unread,
        Instant createdAt
) {

    public static ConversationResponse from(Conversation c, String preview, int unread) {
        return new ConversationResponse(
                c.getId(), c.getTitle(), c.getSubtitle(), c.getCategory(),
                preview, c.getLastMessageAt() != null ? c.getLastMessageAt() : c.getCreatedAt(),
                unread, c.getCreatedAt()
        );
    }
}
